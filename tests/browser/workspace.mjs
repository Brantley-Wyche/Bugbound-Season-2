import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const baseURL = process.env.TEST_BASE_URL || 'http://127.0.0.1:3002';
const output = '.impeccable/review';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const errors = [];
const browserLog = [];
const captures = new Map();
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (/error|warn/.test(message.type()) || /refresh/i.test(message.text())) browserLog.push(message.text()); });
const evidence = [];
const lesson = '/level/01-vanishing-venue';

async function capture(name, width, height, path = lesson) {
  await page.setViewportSize({ width, height });
  await page.goto(baseURL + path);
  await page.getByRole('heading', { name: path === '/' ? 'Incident register' : 'The Vanishing Venue', level: 1, exact: true }).waitFor();
  await page.locator('.desk-progress').filter({ hasText: 'Loading progress…' }).waitFor({ state: 'hidden' });
  await page.evaluate(() => document.fonts.ready);
  if (path !== '/') await page.frameLocator('.route-preview iframe').getByRole('heading', { name: 'Driftwood Conf 2026', exact: true }).waitFor();
  const metrics = await page.evaluate(() => ({
    viewport: innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    noticeVisible: getComputedStyle(document.querySelector('.desktop-notice')).display !== 'none',
    referenceVisible: document.querySelector('.concept-column') ? getComputedStyle(document.querySelector('.concept-column')).display !== 'none' : null,
    openHints: document.querySelectorAll('.case-hints [data-slot="accordion-trigger"][aria-expanded="true"]').length,
    overflowingButtons: Array.from(document.querySelectorAll('[data-slot="button"]')).filter(element => element.getBoundingClientRect().width > 0 && (element.scrollHeight > element.clientHeight + 2 || element.scrollWidth > element.clientWidth + 2)).map(element => element.textContent.trim()),
    undersizedControls: Array.from(document.querySelectorAll('[data-size][data-variant]')).filter(element => {
      const rect = element.getBoundingClientRect();
      const minimum = innerWidth <= 1100 ? 44 : 36;
      return rect.width > 0 && (rect.height < minimum || (element.dataset.size.startsWith('icon') && rect.width < minimum));
    }).map(element => element.getAttribute('aria-label') || element.textContent.trim()),
  }));
  assert.ok(metrics.documentWidth <= width, `${name}: horizontal overflow`);
  // Fine-pointer desktops beside an editor keep a clean desk; phones and touch devices see the notice.
  assert.equal(metrics.noticeVisible, width <= 760, `${name}: desktop notice visibility`);
  assert.equal(metrics.openHints, 0, `${name}: hints must start concealed`);
  assert.deepEqual(metrics.overflowingButtons, [], `${name}: button content overflow`);
  assert.deepEqual(metrics.undersizedControls, [], `${name}: composed control size`);
  captures.set(name, await page.screenshot({ fullPage: false, animations: 'disabled' }));
  evidence.push({ name, width, height, ...metrics });
  if (path !== '/' && width <= 760) {
    await page.getByRole('link', { name: 'Concept', exact: true }).click();
    await page.waitForFunction(() => {
      const top = document.querySelector('#concept-title').getBoundingClientRect().top;
      return top >= document.querySelector('.desk-header').getBoundingClientRect().bottom && top < innerHeight - 20;
    });
  }
}

try {
  await capture('desktop', 1440, 1000);
  await capture('user-1265', 1265, 720);
  await capture('tablet', 1024, 900);
  await capture('mobile', 390, 844);
  await capture('mobile-320', 320, 740);
  await page.getByRole('button', { name: 'Open incident navigation' }).click();
  const sheet = page.getByRole('dialog', { name: 'Incident register' });
  await sheet.waitFor();
  captures.set('mobile-navigation', await page.screenshot({ animations: 'disabled' }));
  await sheet.getByRole('button', { name: 'Close', exact: true }).press('Escape');
  await sheet.waitFor({ state: 'hidden' });
  assert.equal(await page.getByRole('button', { name: 'Open incident navigation' }).evaluate(element => element === document.activeElement), true);
  await capture('register-desktop', 1440, 1000, '/');
  await capture('register-mobile', 390, 844, '/');
  await page.goto(baseURL + lesson);
  await page.locator('.desk-progress').filter({ hasText: 'Loading progress…' }).waitFor({ state: 'hidden' });
  await page.getByRole('button', { name: 'Reset progress', exact: true }).click();
  const dialog = page.getByRole('alertdialog', { name: 'Reset all progress?' });
  await dialog.waitFor();
  assert.equal(await dialog.getByRole('button', { name: 'Keep progress' }).evaluate(element => element === document.activeElement), true);
  captures.set('reset-dialog', await page.screenshot({ animations: 'disabled' }));
  await dialog.getByRole('button', { name: 'Keep progress' }).press('Escape');
  await dialog.waitFor({ state: 'hidden' });
  await page.getByRole('button', { name: 'Copy src/app/lab/01-vanishing-venue/', exact: true }).click();
  await page.getByRole('status').filter({ hasText: /Copied|Could not copy/ }).waitFor();
  await page.getByRole('button', { name: '01 Gentle nudge', exact: true }).click();
  assert.equal(await page.getByRole('button', { name: '01 Gentle nudge', exact: true }).getAttribute('aria-expanded'), 'true');
  await page.getByRole('button', { name: '01 Gentle nudge', exact: true }).click();
  // Hold only this isolated context's check requests so cancellation is deterministic.
  await page.route('**/lab/01-vanishing-venue**', async route => {
    await new Promise(resolve => setTimeout(resolve, 500));
    await route.continue().catch(() => {});
  });
  await page.getByRole('button', { name: 'Run checks', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('status').filter({ hasText: 'Check run cancelled. No completion was recorded.' }).waitFor();
  assert.equal(await page.locator('body > iframe').count(), 0);
  const runHasFocus = () => page.evaluate(() => document.activeElement?.closest('.verification-toolbar') !== null && /run checks/i.test(document.activeElement.textContent));
  assert.equal(await runHasFocus(), true, 'Cancel returns keyboard focus to Run');
  await page.unrouteAll({ behavior: 'wait' });
  await page.getByRole('button', { name: 'Re-run checks', exact: true }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Running…', exact: true }).waitFor();
  assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('aria-disabled')), 'true', 'Run stays focused while disabled');
  await page.getByRole('status').filter({ hasText: /Run \d+: \d+ of \d+ checks passed/ }).waitFor({ timeout: 65000 });
  assert.equal(await runHasFocus(), true, 'Run keeps keyboard focus after a run');
  assert.equal(await page.locator('.check-list li').count(), 4);
  assert.ok(await page.locator('.check-fail').count() > 0, 'Original exercise should remain unsolved');
  // A failing run on an open case records the run and never a Closed entry or completion band.
  assert.equal(await page.locator('.closed-entry').count(), 0);
  assert.equal(await page.locator('.record-entry').textContent().then(text => /^Run 2/.test(text)), true, 'The latest run is numbered in the record');
  assert.equal(await page.locator('.record-earlier li').count(), 1, 'The cancelled run folds into the earlier list');
  await page.goto(baseURL + '/level/02-forgetful-cart');
  await page.getByRole('heading', { name: 'Incident locked' }).waitFor();
  await page.goto(baseURL + '/level/missing-incident');
  await page.getByRole('heading', { name: 'Incident not found' }).waitFor();
  assert.deepEqual(errors, [], 'Unexpected browser runtime errors');
  // Persist captures only after interactions so source watchers cannot interrupt a run.
  for (const [name, bytes] of captures) await writeFile(`${output}/${name}.png`, bytes);
  await writeFile(`${output}/browser-evidence.json`, JSON.stringify({ evidence, errors, interactions: ['sheet and focus return', 'reset dismissal and safe initial focus', 'copy feedback', 'hints disclosure', 'cancel cleanup', 'run keeps keyboard focus', 'real check run with expected failures', 'locked route', 'unknown route'] }, null, 2));
  console.log(`PASS: ${evidence.length} viewport captures; 9 interaction checks; no runtime errors.`);
} catch (error) {
  console.error(JSON.stringify({ errors, browserLog, url: page.url() }, null, 2));
  throw error;
} finally {
  await context.close();
  await browser.close();
}
