import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Audit evidence only. No lab HTTP mutations or real-profile browser storage.
const require = createRequire(resolve('package.json'));
const ts = require('typescript');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const baseURL = process.env.TEST_BASE_URL || 'http://127.0.0.1:3002';
const output = resolve('docs/audits/evidence');
const evidence = {};
const compile = source => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const manifests = [];
for (const dir of await readdir('src/levels', { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  const path = `src/levels/${dir.name}/manifest.ts`;
  if (!existsSync(path)) continue;
  const exports = {};
  new Function('exports', compile(await readFile(path, 'utf8')))(exports);
  manifests.push(exports.default);
}
manifests.sort((a, b) => a.number - b.number);
assert.equal(manifests.length, 13);
assert.equal(new Set(manifests.map(m => m.id)).size, 13);
const hints = JSON.parse(await readFile('src/levels/hints.json', 'utf8'));
for (const [index, manifest] of manifests.entries()) {
  assert.equal(manifest.number, index + 1);
  assert.ok(manifest.id.startsWith(String(index + 1).padStart(2, '0') + '-'));
  assert.ok(manifest.route.startsWith(`/lab/${manifest.id}`));
  assert.ok(existsSync(`src/app${manifest.route}/page.tsx`));
  assert.ok(manifest.files.every(file => existsSync(file)));
  assert.ok(manifest.checks.length > 0);
  assert.equal(new Set(manifest.checks.map(c => c.name)).size, manifest.checks.length);
  assert.ok(manifest.checks.every(c => typeof c.run === 'function' && c.name.length > 0));
  assert.equal(hints[manifest.id]?.length, 3);
  assert.ok(hints[manifest.id].every(h => typeof h === 'string' && /^[A-Za-z0-9+/]+={0,2}$/.test(h) && h.length % 4 === 0));
}
assert.deepEqual(Object.keys(hints).sort(), manifests.map(m => m.id).sort());
evidence.curriculum = { manifests: manifests.length, checks: manifests.reduce((n, m) => n + m.checks.length, 0), hintTiers: 39, structureValid: true, hintsDecoded: false };

// Importing this fixture in this Node process cannot change the dev server's globalThis.
const inventory = await import('../../src/app/lab/13-launch-day/store.ts');
const product = inventory.getProducts()[0];
let successes = 0;
for (let i = 0; i < product.stock + 1; i++) successes += Number(inventory.placeOrder(product.id));
evidence.fixtureRepeatability = { initialStock: product.stock, attemptedOrders: product.stock + 1, successfulOrders: successes, finalStock: inventory.getProducts()[0].stock, isolatedFromDevServer: true };

// Exercise the existing check contract with an unchanged historical counter.
const persistenceCheck = manifests.at(-1).checks.find(check => check.name === 'Orders are recorded on the server');
let simulatedClicks = 0;
await persistenceCheck.run({
  open: async () => ({ get: () => ({}), click: async () => { simulatedClicks++; } }),
  pause: async () => {},
  fetchDoc: async () => ({ text: () => '1' }),
  ok: (condition, message) => assert.ok(condition, message),
});
evidence.historicalCounter = { checkReturnedSuccess: true, simulatedClicks, currentRunPersistedOrders: 0, historicalOrders: 1 };

const harness = compile(await readFile('src/shell/harness.ts', 'utf8'));
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(baseURL + '/');
  await page.locator('.desk-progress').filter({ hasText: 'Loading progress...' }).waitFor({ state: 'hidden' });
  await context.route('**/__audit_unhydrated', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Audit fixture</title><main>Static HTML only</main>' }));
  evidence.readiness = await page.evaluate(async source => {
    const exports = {};
    new Function('exports', source)(exports);
    let beacon = null;
    let capture = null;
    const result = await exports.runCheck({ name: 'Synthetic hydration health', run: async h => {
      const frame = await h.open('/__audit_unhydrated', { timeout: 50 });
      const win = document.querySelector('iframe').contentWindow;
      beacon = Boolean(win.__labHydrated);
      capture = Boolean(win.__lab);
      h.ok(frame.hydrationErrors().length === 0, 'Hydration errors recorded');
    } });
    return { beacon, capture, result, framesAfterRun: document.querySelectorAll('iframe').length };
  }, harness);
  assert.equal(evidence.readiness.beacon, false);
  assert.equal(evidence.readiness.capture, false);
  assert.equal(evidence.readiness.result.pass, true);
  assert.equal(evidence.readiness.framesAfterRun, 0);

  // A slow page that never reaches load can also be returned as a usable LabPage.
  await context.route('**/__audit_slow', async route => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    await route.fulfill({ contentType: 'text/html', body: '<main>Late response</main>' }).catch(() => {});
  });
  evidence.navigationTimeout = await page.evaluate(async source => {
    const exports = {};
    new Function('exports', source)(exports);
    const start = performance.now();
    const frame = await exports.openPage('/__audit_slow', { timeout: 50 });
    const result = { returnedInsteadOfThrowing: true, elapsed: Math.round(performance.now() - start), path: frame.path() };
    frame.close();
    return result;
  }, harness);

  // Imported curriculum on the register is a source-level bundle candidate, not a production benchmark.
  const scriptURLs = await page.locator('script[src]').evaluateAll(nodes => nodes.map(node => node.src));
  const markers = manifests.map(m => `/levels/${m.id}/manifest.ts`);
  const found = new Set();
  for (const url of scriptURLs) {
    if (!url.startsWith(baseURL)) continue;
    const text = await (await context.request.get(url)).text();
    for (const marker of markers) if (text.includes(marker)) found.add(marker);
  }
  evidence.registerCurriculumBundle = { manifestModulesFound: found.size, mode: 'webpack development; not production byte sizing' };
  await context.close();

  const shellContext = await browser.newContext();
  await shellContext.addInitScript(ids => {
    for (const id of ids) localStorage.setItem(`bugbound:s2:progress:v2:done:initial:${id}`, '1');
  }, manifests.map(m => m.id));
  // This matrix tests lesson shell content, not intentionally broken previews.
  await shellContext.route('**/lab/**', route => route.fulfill({ contentType: 'text/html', body: '<main>Isolated preview placeholder for shell audit</main>' }));
  const shellPage = await shellContext.newPage();
  const shellErrors = [];
  shellPage.on('pageerror', error => shellErrors.push(error.message));
  const layouts = [];
  for (const width of [1166, 390]) {
    await shellPage.setViewportSize({ width, height: 844 });
    for (const manifest of manifests) {
      await shellPage.goto(`${baseURL}/level/${manifest.id}`);
      await shellPage.getByRole('heading', { level: 1, name: manifest.title, exact: true }).waitFor();
      const metrics = await shellPage.evaluate(() => ({
        width: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        closedHints: document.querySelectorAll('.case-hints [aria-expanded="false"]').length,
      }));
      assert.ok(metrics.documentWidth <= width, `Lesson ${manifest.number} overflows at ${width}`);
      assert.equal(metrics.closedHints, 3);
      layouts.push({ incident: manifest.number, ...metrics });
    }
  }
  assert.deepEqual(shellErrors, []);
  evidence.allLessonShells = { layouts, shellErrors, previewsStubbed: true, storageIsolated: true };
  await shellContext.close();
} finally {
  await browser.close();
}
await mkdir(output, { recursive: true });
await writeFile(resolve(output, 'phase-2-probes.json'), JSON.stringify(evidence, null, 2) + '\n');
console.log(JSON.stringify(evidence, null, 2));
