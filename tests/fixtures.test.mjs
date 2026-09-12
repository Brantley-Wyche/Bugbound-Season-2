import test from 'node:test';
import assert from 'node:assert/strict';
import { getProducts, getOrdersToday, placeOrder, resetLaunchStore } from '../src/app/lab/13-launch-day/store.ts';
import { validateFixtureReset } from '../src/shell/checks/fixture-reset.ts';

test('explicit fixture reset restores exhausted stock without changing product definitions', () => {
  resetLaunchStore();
  const seed = getProducts();
  for (let i = 0; i < 40; i++) assert.equal(placeOrder('nimbus-one'), true);
  assert.equal(placeOrder('nimbus-one'), false);
  assert.equal(getOrdersToday(), 40);
  resetLaunchStore();
  assert.deepEqual(getProducts(), seed);
  assert.equal(getOrdersToday(), 0);
});

function request(origin = 'http://127.0.0.1:3002', headers = {}) {
  return new Request(`${origin}/api/practice/fixtures`, {
    method: 'POST', headers: { origin, 'content-type': 'application/json', ...headers },
    body: JSON.stringify({ levelId: '13-launch-day' }),
  });
}

test('fixture reset requires a local development request with matching origin', () => {
  assert.equal(validateFixtureReset(request(), 'development'), null);
  assert.equal(validateFixtureReset(request(), 'production'), 404);
  assert.equal(validateFixtureReset(request('https://remote.example'), 'development'), 403);
  assert.equal(validateFixtureReset(request(undefined, { origin: 'https://attacker.example' }), 'development'), 403);
  assert.equal(validateFixtureReset(request(undefined, { 'content-type': 'text/plain' }), 'development'), 415);
  assert.equal(validateFixtureReset(request('http://localhost:3002', { host: '127.0.0.1:3002', origin: 'http://127.0.0.1:3002' }), 'development'), null);
  assert.equal(validateFixtureReset(request(undefined, { host: 'remote.example', origin: 'http://remote.example' }), 'development'), 403);
});
