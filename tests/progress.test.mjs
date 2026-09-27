import test from 'node:test';
import assert from 'node:assert/strict';
import { createProgressStore, LEGACY_KEY, PROGRESS_PREFIX } from '../src/shell/progress/progress-store.ts';

function setup() {
  const values = new Map();
  const storage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  const make = () => createProgressStore(['one', 'two', 'three'], () => storage);
  return { values, storage, make };
}

test('legacy progress is filtered and retained in additive records', () => {
  const { values, make } = setup();
  values.set(LEGACY_KEY, JSON.stringify(['one', 'unknown', 4, null, 'one']));
  const store = make(); store.refresh();
  assert.deepEqual([...store.getSnapshot().completed], ['one']);
  values.set(LEGACY_KEY, '[]');
  store.refresh();
  assert.deepEqual([...store.getSnapshot().saved], ['one']);
});

test('two stale tabs retain independent completions', () => {
  const { make } = setup();
  const a = make(), b = make(); a.refresh(); b.refresh();
  const tokenA = a.captureRun(), tokenB = b.captureRun();
  a.markComplete('one', tokenA); b.markComplete('two', tokenB);
  a.refresh(); b.refresh();
  assert.deepEqual([...a.getSnapshot().saved].sort(), ['one', 'two']);
  assert.deepEqual([...b.getSnapshot().saved].sort(), ['one', 'two']);
});

test('a reset prevents an old tab or pending run from restoring progress', () => {
  const { make } = setup();
  const a = make(), b = make(); a.refresh(); b.refresh();
  const stale = b.captureRun(); a.reset(); b.markComplete('one', stale);
  a.refresh(); b.refresh();
  assert.equal(a.getSnapshot().completed.size, 0);
  assert.equal(b.getSnapshot().completed.size, 0);
});

test('a failed save keeps visit completion and retries without claiming it was saved', () => {
  const { make, storage } = setup();
  const store = make(); store.refresh();
  const write = storage.setItem;
  storage.setItem = () => { throw new Error('quota'); };
  store.markComplete('one', store.captureRun());
  assert.equal(store.getSnapshot().completed.has('one'), true);
  assert.equal(store.getSnapshot().saved.has('one'), false);
  assert.equal(store.getSnapshot().saveError, true);
  storage.setItem = write; store.retrySave();
  assert.equal(store.getSnapshot().saved.has('one'), true);
  assert.equal(store.getSnapshot().saveError, false);
});

test('failed reset preserves saved data, invalidates active runs, and has its own retry', () => {
  const { make, storage } = setup();
  const store = make(); store.refresh();
  store.markComplete('one', store.captureRun());
  const stale = store.captureRun(), write = storage.setItem;
  storage.setItem = () => { throw new Error('blocked'); };
  store.reset();
  assert.equal(store.getSnapshot().resetError, true);
  assert.equal(store.getSnapshot().saved.has('one'), true);
  store.markComplete('two', stale);
  assert.equal(store.getSnapshot().completed.has('two'), false);
  storage.setItem = write; store.reset();
  assert.equal(store.getSnapshot().resetError, false);
  assert.equal(store.getSnapshot().completed.size, 0);
});

test('pending saves are discarded after another tab resets', () => {
  const { make, storage } = setup();
  const a = make(), b = make(); a.refresh(); b.refresh();
  const write = storage.setItem;
  storage.setItem = () => { throw new Error('quota'); };
  b.markComplete('one', b.captureRun());
  storage.setItem = write; a.reset(); b.retrySave(); a.refresh();
  assert.equal(a.getSnapshot().completed.size, 0);
  assert.equal(b.getSnapshot().completed.size, 0);
});

test('blocked reads expose a retryable state and stable snapshots', () => {
  const { make, storage } = setup();
  const read = storage.getItem;
  storage.getItem = () => { throw new Error('denied'); };
  const store = make(); store.refresh();
  assert.equal(store.getSnapshot().loadError, true);
  assert.equal(store.getSnapshot(), store.getSnapshot());
  storage.getItem = read; store.refresh();
  assert.equal(store.getSnapshot().loadError, false);
});

test('reset interleaved after generation validation makes late completion writes inert', () => {
  const { make, storage } = setup();
  const a = make(), b = make(); a.refresh(); b.refresh();
  const token = b.captureRun();
  const write = storage.setItem;
  storage.setItem = (key, value) => {
    if (key.includes(':done:')) {
      storage.setItem = write;
      a.reset();
    }
    write(key, value);
  };
  b.markComplete('one', token);
  a.refresh(); b.refresh();
  assert.equal(a.getSnapshot().completed.size, 0);
  assert.equal(b.getSnapshot().completed.size, 0);
  assert.equal(b.getSnapshot().saveError, false);
});

test('a successful reset stays cleared when the subsequent read is blocked', () => {
  const { make, storage } = setup();
  const store = make(); store.refresh();
  store.markComplete('one', store.captureRun());
  storage.getItem = () => { throw new Error('read blocked'); };
  store.reset();
  assert.equal(store.getSnapshot().completed.size, 0);
  assert.equal(store.getSnapshot().resetError, false);
  assert.equal(store.getSnapshot().loadError, true);
});

test('malformed optional legacy data does not prevent new completion', () => {
  const { values, make } = setup();
  values.set(LEGACY_KEY, '{broken');
  const store = make(); store.refresh();
  store.markComplete('one', store.captureRun());
  assert.equal(store.getSnapshot().loadError, false);
  assert.equal(store.getSnapshot().saved.has('one'), true);
});

test('a denied legacy read is not mistaken for malformed optional data', () => {
  const { make, storage } = setup();
  const read = storage.getItem;
  storage.getItem = key => {
    if (key === LEGACY_KEY) throw new Error('legacy read denied');
    return read(key);
  };
  const store = make(); store.refresh();
  assert.equal(store.getSnapshot().loadError, true);
});

test('a close records when and on which run it happened, and other tabs read it', () => {
  const { make } = setup();
  const store = make(); store.refresh();
  store.markComplete('one', store.captureRun(), { at: 1790000000000, run: 4 });
  assert.deepEqual(store.getSnapshot().closedInfo.get('one'), { at: 1790000000000, run: 4 });
  const other = make(); other.refresh();
  assert.deepEqual(other.getSnapshot().closedInfo.get('one'), { at: 1790000000000, run: 4 });
});

test('an unsaved close keeps its record for this visit', () => {
  const { make, storage } = setup();
  const store = make(); store.refresh();
  const write = storage.setItem;
  storage.setItem = () => { throw new Error('quota'); };
  store.markComplete('one', store.captureRun(), { at: 1790000000000, run: 2 });
  assert.equal(store.getSnapshot().saved.has('one'), false);
  assert.deepEqual(store.getSnapshot().closedInfo.get('one'), { at: 1790000000000, run: 2 });
  storage.setItem = write; store.retrySave();
  const other = make(); other.refresh();
  assert.deepEqual(other.getSnapshot().closedInfo.get('one'), { at: 1790000000000, run: 2 });
});

test('malformed or missing close records are ignored without losing the close', () => {
  const { values, make } = setup();
  values.set(`${PROGRESS_PREFIX}done:initial:one`, '1');
  values.set(`${PROGRESS_PREFIX}closed:initial:one`, '{broken');
  values.set(`${PROGRESS_PREFIX}done:initial:two`, '1');
  values.set(`${PROGRESS_PREFIX}closed:initial:two`, JSON.stringify({ at: 'soon', run: -1 }));
  values.set(`${PROGRESS_PREFIX}done:initial:three`, '1');
  const store = make(); store.refresh();
  assert.deepEqual([...store.getSnapshot().saved].sort(), ['one', 'three', 'two']);
  assert.equal(store.getSnapshot().closedInfo.size, 0);
  assert.equal(store.getSnapshot().loadError, false);
});

test('a reset drops close records along with the closes', () => {
  const { make } = setup();
  const store = make(); store.refresh();
  store.markComplete('one', store.captureRun(), { at: 1790000000000, run: 1 });
  store.reset();
  assert.equal(store.getSnapshot().closedInfo.size, 0);
  const other = make(); other.refresh();
  assert.equal(other.getSnapshot().closedInfo.size, 0);
});

test('rechecking an already saved milestone does not attempt another save', () => {
  const { make, storage } = setup();
  const store = make(); store.refresh();
  store.markComplete('one', store.captureRun());
  storage.setItem = () => { throw new Error('quota'); };
  store.markComplete('one', store.captureRun());
  assert.equal(store.getSnapshot().saved.has('one'), true);
  assert.equal(store.getSnapshot().saveError, false);
});
