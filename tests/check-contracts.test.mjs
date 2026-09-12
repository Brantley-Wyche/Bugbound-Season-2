import test from 'node:test';
import assert from 'node:assert/strict';
import launch from '../src/levels/13-launch-day/manifest.ts';

test('a new server order after the current click satisfies persistence', async () => {
  const check = launch.checks.find(check => check.name === 'Orders are recorded on the server');
  let orders = 9;
  await check.run({
    open: async () => ({ get: () => ({}), click: async () => { orders++; } }),
    fetchDoc: async () => ({ text: selector => selector.includes('orders-today') ? String(orders) : '10' }),
    poll: async (predicate, options) => assert.ok(await predicate(), options.message),
    ok: (condition, message) => assert.ok(condition, message),
  });
  assert.equal(orders, 10);
});

test('historical orders alone cannot satisfy the current persistence check', async () => {
  const check = launch.checks.find(check => check.name === 'Orders are recorded on the server');
  const helpers = {
    open: async () => ({ get: () => ({}), click: async () => {} }),
    pause: async () => {},
    fetchDoc: async () => ({ text: () => '1' }),
    poll: async (predicate, options) => assert.ok(await predicate(), options.message),
    ok: (condition, message) => assert.ok(condition, message),
  };
  await assert.rejects(check.run(helpers));
});

test('exhausted stock reports fixture recovery instead of blaming the source', async () => {
  const check = launch.checks.find(check => check.name === 'Products render with their stock');
  await assert.rejects(check.run({
    fetchDoc: async () => ({ all: () => [{}, {}, {}], text: () => '0' }),
    ok: (condition, message) => assert.ok(condition, message),
  }), /reset lab data/i);
});
