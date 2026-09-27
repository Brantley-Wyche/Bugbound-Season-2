import test from 'node:test';
import assert from 'node:assert/strict';
import { createCaseLog, entriesFor, LOG_PREFIX } from '../src/shell/progress/case-log.ts';

function setup() {
  const values = new Map();
  const storage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  let clock = 1000;
  const now = () => (clock += 10);
  const make = () => createCaseLog(['one', 'two'], () => storage, now);
  return { values, storage, make, setClock: value => { clock = value; } };
}

test('the first open is logged once and survives a new visit', () => {
  const { make } = setup();
  const log = make(); log.refresh();
  log.recordOpened('one'); log.recordOpened('one');
  assert.deepEqual(log.getSnapshot().logs.get('one').events.map(e => e.type), ['opened']);
  const later = make(); later.refresh();
  assert.equal(later.getSnapshot().logs.get('one').events.length, 1);
});

test('runs are numbered across visits', () => {
  const { make } = setup();
  const first = make(); first.refresh();
  assert.equal(first.startRun('one'), 1);
  first.recordRun('one', { run: 1, status: 'failed', passed: 2, total: 4 });
  const second = make(); second.refresh();
  assert.equal(second.startRun('one'), 2);
  assert.equal(second.getSnapshot().logs.get('one').runs, 2);
});

test('each hint tier is logged the first time it opens', () => {
  const { make } = setup();
  const log = make(); log.refresh();
  log.recordHint('one', 0); log.recordHint('one', 0); log.recordHint('one', 1);
  assert.deepEqual(log.getSnapshot().logs.get('one').events.filter(e => e.type === 'hint').map(e => e.tier), [0, 1]);
});

test('the log keeps its newest 50 entries and the lifetime run count', () => {
  const { make } = setup();
  const log = make(); log.refresh();
  for (let i = 0; i < 60; i++) {
    const run = log.startRun('one');
    log.recordRun('one', { run, status: 'failed', passed: 1, total: 4 });
  }
  const { runs, events } = log.getSnapshot().logs.get('one');
  assert.equal(runs, 60);
  assert.equal(events.length, 50);
  assert.equal(events.at(-1).run, 60);
});

test('a reset appears only in logs that had activity before it, newest first', () => {
  const { make, setClock } = setup();
  const log = make(); log.refresh();
  setClock(1000); log.recordOpened('one');
  setClock(2000); log.recordReset();
  setClock(3000); log.recordOpened('two');
  const one = entriesFor(log.getSnapshot(), 'one');
  assert.deepEqual(one.map(e => e.type), ['reset', 'opened']);
  assert.deepEqual(entriesFor(log.getSnapshot(), 'two').map(e => e.type), ['opened']);
  const later = make(); later.refresh();
  assert.deepEqual(entriesFor(later.getSnapshot(), 'one').map(e => e.type), ['reset', 'opened']);
});

test('malformed stored logs are ignored', () => {
  const { values, make } = setup();
  values.set(`${LOG_PREFIX}one`, '{broken');
  values.set(`${LOG_PREFIX}two`, JSON.stringify({ runs: 'x', events: [{ type: 'run' }, { type: 'hint', at: 5, tier: 9 }] }));
  values.set(`${LOG_PREFIX}resets`, JSON.stringify(['soon', 7]));
  const log = make(); log.refresh();
  assert.equal(log.getSnapshot().logs.get('one'), undefined);
  assert.deepEqual(log.getSnapshot().logs.get('two'), { runs: 0, events: [] });
  assert.deepEqual(log.getSnapshot().resets, [7]);
});

test('a failed write keeps the entry for this visit and says it was not saved', () => {
  const { make, storage } = setup();
  const log = make(); log.refresh();
  const write = storage.setItem;
  storage.setItem = () => { throw new Error('quota'); };
  log.recordOpened('one');
  assert.equal(log.getSnapshot().logs.get('one').events.length, 1);
  assert.equal(log.getSnapshot().writeError, true);
  storage.setItem = write;
  log.recordHint('one', 0);
  assert.equal(log.getSnapshot().writeError, false);
  assert.equal(log.getSnapshot().logs.get('one').events.length, 2);
});
