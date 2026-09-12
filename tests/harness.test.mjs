import test from 'node:test';
import assert from 'node:assert/strict';
import { runCheck, openPage } from '../src/shell/checks/harness.ts';

function installFrame(t, { hydrated = false, capture = false, load = true } = {}) {
  const window = { location: { href: 'about:blank' }, __labHydrated: hydrated };
  if (capture) window.__lab = { errors: [] };
  const frame = { style: {}, remove: t.mock.fn(), onload: null, contentWindow: window };
  Object.defineProperty(frame, 'src', { set(path) {
    if (load) queueMicrotask(() => { window.location.href = path; frame.onload?.(); });
  } });
  const previous = globalThis.document;
  globalThis.document = { createElement: () => frame, body: { appendChild() {} } };
  t.after(() => { globalThis.document = previous; });
  return frame;
}

test('a missing hydration beacon rejects and removes the frame', async t => {
  const frame = installFrame(t, { capture: true });
  await assert.rejects(openPage('/synthetic', { timeout: 10 }), /hydration.*retry/i);
  assert.ok(frame.remove.mock.callCount() > 0);
});

test('a missing error capture cannot be mistaken for healthy hydration', async t => {
  const frame = installFrame(t, { hydrated: true });
  await assert.rejects(openPage('/synthetic', { timeout: 10 }), /console capture.*retry/i);
  assert.ok(frame.remove.mock.callCount() > 0);
});

test('a navigation deadline rejects instead of returning the blank document', async t => {
  const frame = installFrame(t, { load: false });
  await assert.rejects(openPage('/synthetic', { timeout: 10 }), /navigation.*retry/i);
  assert.equal(frame.onload, null);
  assert.ok(frame.remove.mock.callCount() > 0);
});

test('server polling waits for the current mutation and remains cancellable', async () => {
  let calls = 0;
  const result = await runCheck({ name: 'poll', run: async h => {
    await h.poll(async () => ++calls === 2, { timeout: 1000, message: 'No current mutation' });
  } });
  assert.equal(result.pass, true, result.message);
  assert.equal(calls, 2);
});

test('an already cancelled run never executes its check', async () => {
  const controller = new AbortController();
  controller.abort();
  let executed = false;
  await assert.rejects(runCheck({ name: 'synthetic', run: async () => { executed = true; } }, { signal: controller.signal }), { name: 'AbortError' });
  assert.equal(executed, false);
});

test('poll cancellation interrupts an unsettled predicate', async () => {
  const controller = new AbortController();
  const started = Promise.withResolvers();
  const run = runCheck({ name: 'poll', run: async h => {
    await h.poll(() => { started.resolve(); return new Promise(() => {}); }, { message: 'No result' });
  } }, { signal: controller.signal });
  await started.promise;
  controller.abort();
  await assert.rejects(run, { name: 'AbortError' });
});

test('registered cleanup runs after failure and cancellation with an independent signal', async t => {
  const requests = [];
  t.mock.method(globalThis, 'fetch', async (path, init) => {
    requests.push({ path, aborted: init.signal.aborted });
    return Response.json({ ok: true });
  });
  const failed = await runCheck({ name: 'fail', run: async h => {
    h.cleanupRequest('/leave', { method: 'POST' });
    h.ok(false, 'Original failure');
  } });
  assert.match(failed.message, /Original failure/);
  const controller = new AbortController();
  const started = Promise.withResolvers();
  const cancelled = runCheck({ name: 'cancel', run: async h => {
    h.cleanupRequest('/leave', { method: 'POST' });
    started.resolve();
    await h.pause(1000);
  } }, { signal: controller.signal });
  await started.promise;
  controller.abort();
  await assert.rejects(cancelled, { name: 'AbortError' });
  assert.deepEqual(requests, [{ path: '/leave', aborted: false }, { path: '/leave', aborted: false }]);
});

test('failed cleanup cannot report a passing check', async t => {
  t.mock.method(globalThis, 'fetch', async () => new Response(null, { status: 503 }));
  const result = await runCheck({ name: 'cleanup', run: async h => h.cleanupRequest('/leave') });
  assert.equal(result.pass, false);
  assert.match(result.message, /cleanup failed/);
});

test('cancellation still discloses failed cleanup', async t => {
  t.mock.method(globalThis, 'fetch', async () => new Response(null, { status: 503 }));
  const controller = new AbortController();
  const started = Promise.withResolvers();
  const cancelled = runCheck({ name: 'cleanup', run: async h => {
    h.cleanupRequest('/leave');
    started.resolve();
    await h.pause(1000);
  } }, { signal: controller.signal });
  await started.promise;
  controller.abort();
  await assert.rejects(cancelled, { name: 'LabCleanupError' });
});

test('cancellation interrupts a helper pause and cannot return success later', async () => {
  const controller = new AbortController();
  const started = Promise.withResolvers();
  let reachedAfterPause = false;
  const promise = runCheck({ name: 'synthetic', run: async h => {
    const pause = h.pause(30);
    started.resolve();
    await pause;
    reachedAfterPause = true;
  } }, { signal: controller.signal });
  await started.promise;
  controller.abort();
  await assert.rejects(promise, { name: 'AbortError' });
  assert.equal(reachedAfterPause, false);
});

test('a check that never settles has an overall asynchronous deadline', async () => {
  const result = await Promise.race([
    runCheck({ name: 'stalled', run: () => new Promise(() => {}) }, { timeout: 10 }),
    new Promise(resolve => setTimeout(() => resolve({ pass: true, message: 'deadline missing' }), 100)),
  ]);
  assert.equal(result.pass, false, result.message);
  assert.match(result.message, /timed out/i);
});

test('ordinary check failures remain readable results', async () => {
  const result = await runCheck({ name: 'assertion', run: async h => h.ok(false, 'Expected synthetic value') });
  assert.deepEqual(result, { name: 'assertion', pass: false, message: 'Expected synthetic value' });
});

test('cancellation removes a frame even while its first page is loading', async (t) => {
  const frame = { style: {}, remove: t.mock.fn(), onload: null };
  const previous = globalThis.document;
  globalThis.document = { createElement: () => frame, body: { appendChild() {} } };
  t.after(() => { globalThis.document = previous; });
  const controller = new AbortController();
  const promise = openPage('/synthetic', { signal: controller.signal });
  controller.abort();
  await assert.rejects(promise, { name: 'AbortError' });
  assert.ok(frame.remove.mock.callCount() > 0);
  assert.equal(frame.onload, null);
});

test('cancellation reaches in-flight requests and blocks late helper calls', async (t) => {
  let requestSignal;
  let helpers;
  const started = Promise.withResolvers();
  t.mock.method(globalThis, 'fetch', (_path, init) => {
    requestSignal = init.signal;
    started.resolve();
    return new Promise((_resolve, reject) => init.signal.addEventListener('abort', () => reject(init.signal.reason)));
  });
  const controller = new AbortController();
  const promise = runCheck({ name: 'synthetic', run: async (h) => {
    helpers = h;
    await h.fetchJSON('/synthetic');
  } }, { signal: controller.signal });
  await started.promise;
  controller.abort();
  await assert.rejects(promise, { name: 'AbortError' });
  assert.equal(requestSignal.aborted, true);
  assert.throws(() => helpers.fetchJSON('/late'), { name: 'AbortError' });
});
