import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import ts from 'typescript';

const baseURL = process.env.TEST_BASE_URL || 'http://127.0.0.1:3002';
const catalog = JSON.parse(await readFile('src/levels/generated/catalog.json', 'utf8'));
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const evidence = { screenshots: [], checks: [] };
const shots = [];
const harness = ts.transpileModule(await readFile('src/shell/checks/harness.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const scripts = [];
  page.on('response', response => {
    if (response.request().resourceType() === 'script') scripts.push(response.text().catch(() => ''));
  });
  await page.goto(baseURL);
  await page.getByRole('link', { name: 'Start Incident 01', exact: true }).waitFor();
  const registerScripts = (await Promise.all(scripts)).join('\n');
  assert.ok(!registerScripts.includes('The launch page is live'));
  assert.ok(!registerScripts.includes('The conference home page responds'));
  evidence.checks.push('Register does not download the sampled executable lesson checks');

  await context.route('**/__phase2_*', async route => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('slow')) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return route.fulfill({ body: '<main>Late</main>', contentType: 'text/html' }).catch(() => {});
    }
    const script = path.endsWith('capture') ? '<script>window.__labHydrated=true</script>' :
      path.endsWith('streamed') ? '<script>window.__labHydrated=true;window.__lab={errors:[]};setTimeout(()=>{document.body.insertAdjacentHTML("beforeend", "<p id=ready>Ready</p>")},200)</script>' : '';
    await route.fulfill({ body: '<!doctype html><body><main>Fixture</main>' + script, contentType: 'text/html' });
  });
  for (const [kind, message] of [['beacon', 'hydration'], ['capture', 'console capture'], ['slow', 'navigation']]) {
    const result = await page.evaluate(async ({ source, kind }) => {
      const exports = {};
      new Function('exports', source)(exports);
      return exports.runCheck({ name: 'Readiness', run: async h => {
        const frame = await h.open(`/__phase2_${kind}`, { timeout: 100 });
        h.ok(frame.hydrationErrors().length === 0, 'Health');
      } });
    }, { source: harness, kind });
    assert.equal(result.pass, false);
    assert.ok(result.message.toLowerCase().includes(message), result.message);
    assert.equal(await page.locator('iframe').count(), 0);
  }
  const streamed = await page.evaluate(async source => {
    const exports = {};
    new Function('exports', source)(exports);
    return exports.runCheck({ name: 'Streamed content', run: async h => {
      const frame = await h.open('/__phase2_streamed');
      await frame.waitFor('#ready');
      h.ok(frame.text('#ready') === 'Ready', 'Streamed content missing');
    } });
  }, harness);
  assert.equal(streamed.pass, true, streamed.message);
  evidence.checks.push('Missing beacon/capture/navigation fail; delayed content waits explicitly; frames disposed');

  await page.getByRole('link', { name: 'Start Incident 01', exact: true }).click();
  await page.waitForURL('**/level/01-vanishing-venue');
  await page.getByRole('heading', { name: 'The Vanishing Venue' }).waitFor();
  await page.locator('.check-name').first().waitFor();
  const lessonScripts = (await Promise.all(scripts)).join('\n');
  assert.ok(!lessonScripts.includes('The launch page is live'));
  assert.equal(await page.locator('.check-name').count(), 4);
  await page.goto(baseURL + '/level/13-launch-day');
  await page.getByRole('heading', { name: 'Incident locked' }).waitFor();
  assert.ok(!(await Promise.all(scripts)).join('\n').includes('The launch page is live'));
  evidence.checks.push('First lesson loads its checks; locked capstone does not load executable content');

  const rejected = await context.request.post(baseURL + '/api/practice/fixtures', { headers: { origin: 'https://different.example' }, data: { levelId: '13-launch-day' } });
  assert.equal(rejected.status(), 403);
  const unknown = await context.request.post(baseURL + '/api/practice/fixtures', { headers: { origin: baseURL }, data: { levelId: 'not-a-level' } });
  assert.equal(unknown.status(), 400);
  evidence.checks.push('Live fixture API rejects cross-origin and unknown-fixture requests without resetting data');
  await context.close();

  const fixtureContext = await browser.newContext();
  await fixtureContext.addInitScript(ids => {
    for (const id of ids) localStorage.setItem(`bugbound:s2:progress:v2:done:initial:${id}`, '1');
  }, catalog.map(level => level.id));
  await fixtureContext.route('**/lab/**', route => route.fulfill({ contentType: 'text/html', body: '<main>Isolated lab preview fixture</main>' }));
  let resetCalls = 0;
  let failReset = true;
  await fixtureContext.route('**/api/practice/fixtures', async route => {
    resetCalls++;
    await route.fulfill({ status: failReset ? 503 : 200, contentType: 'application/json', body: JSON.stringify(failReset ? { error: 'Unavailable' } : { reset: true }) });
  });
  const fixturePage = await fixtureContext.newPage();
  for (const width of [1166, 390]) {
    await fixturePage.setViewportSize({ width, height: 800 });
    await fixturePage.goto(baseURL + '/level/13-launch-day');
    await fixturePage.getByRole('button', { name: 'Reset lab data', exact: true }).waitFor();
    assert.equal(await fixturePage.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    const before = await fixturePage.evaluate(() => JSON.stringify({ ...localStorage }));
    await fixturePage.getByRole('button', { name: 'Reset lab data', exact: true }).click();
    const dialog = fixturePage.getByRole('alertdialog');
    await dialog.waitFor();
    assert.equal(await dialog.getByRole('button', { name: 'Cancel', exact: true }).evaluate(el => el === document.activeElement), true);
    shots.push({ name: `phase2-reset-${width}.png`, image: await fixturePage.screenshot({ animations: 'disabled' }) });
    const callsBeforeCancel = resetCalls;
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
    assert.equal(resetCalls, callsBeforeCancel);
    failReset = true;
    await fixturePage.getByRole('button', { name: 'Reset lab data', exact: true }).click();
    await dialog.getByRole('button', { name: 'Reset lab data', exact: true }).click();
    await dialog.getByRole('alert').waitFor();
    failReset = false;
    await dialog.getByRole('button', { name: 'Retry lab reset' }).click();
    await dialog.waitFor({ state: 'hidden' });
    await fixturePage.getByRole('status').filter({ hasText: 'Lab data reset.' }).waitFor();
    assert.equal(await fixturePage.evaluate(() => JSON.stringify({ ...localStorage })), before);
  }
  evidence.checks.push('Desktop/mobile reset: cancel focused, dismissal non-mutating, failed request retry, success feedback, saved progress unchanged (mock reset transport)');
  assert.deepEqual(errors, []);
  await fixtureContext.close();
} finally {
  await browser.close();
}
await mkdir('.impeccable/review', { recursive: true });
for (const shot of shots) {
  await writeFile(`.impeccable/review/${shot.name}`, shot.image);
  evidence.screenshots.push(shot.name);
}
await writeFile('.impeccable/review/phase-2-remediation.json', JSON.stringify(evidence, null, 2));
console.log(JSON.stringify(evidence, null, 2));
