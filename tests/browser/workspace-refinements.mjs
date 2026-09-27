import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext();
const page = await context.newPage();
const baseURL = process.env.TEST_BASE_URL || 'http://127.0.0.1:3002';
const captures = new Map();
const evidence = [];
const errors = [];
page.on('pageerror', error => errors.push(error.message));

async function ready(width, height) {
  await page.setViewportSize({ width, height });
  await page.goto(`${baseURL}/level/01-vanishing-venue`);
  await page.getByRole('heading', { name: 'The Vanishing Venue', exact: true }).waitFor();
  await page.locator('.desk-progress').filter({ hasText: 'Loading progress…' }).waitFor({ state: 'hidden' });
  await page.evaluate(() => document.fonts.ready);
  await page.frameLocator('.route-preview iframe').getByRole('heading', { name: 'Driftwood Conf 2026', exact: true }).waitFor();
}

async function checkGroups(nav) {
  const heading = nav.getByRole('heading', { name: 'Incident register', level: 2, exact: true });
  assert.equal(await heading.count(), 1, 'Register link must be the visible sidebar heading');
  const register = heading.getByRole('link', { name: 'Incident register', exact: true });
  const headingStyle = await register.evaluate(element => ({ size: getComputedStyle(element).fontSize, weight: getComputedStyle(element).fontWeight, decoration: getComputedStyle(element).textDecorationLine }));
  assert.equal(headingStyle.size, '16px');
  assert.equal(headingStyle.weight, '600');
  assert.equal(headingStyle.decoration, 'none');
  const alignment = await register.evaluate(element => {
    const text = element.querySelector('span').getBoundingClientRect();
    const nav = element.closest('.incident-nav');
    const group = nav.querySelector('.nav-groups [data-slot="accordion-trigger"]');
    const number = nav.querySelector('.nav-number').getBoundingClientRect();
    const groupLeft = group.getBoundingClientRect().left + parseFloat(getComputedStyle(group).paddingLeft);
    return Math.max(Math.abs(text.left - groupLeft), Math.abs(text.left - number.left));
  });
  assert.ok(alignment < 1, 'Register text aligns with group headings and lesson numbers');
  assert.equal(await nav.locator('.nav-register-row').evaluate(element => getComputedStyle(element).borderBottomWidth), '1px');
  const first = nav.getByRole('button', { name: 'Routes & server boundary', exact: true });
  const second = nav.getByRole('button', { name: 'Data, caching & mutations', exact: true });
  assert.equal(await first.getAttribute('aria-expanded', { timeout: 3000 }), 'true');
  assert.equal(await second.getAttribute('aria-expanded'), 'false');
  await second.click();
  assert.equal(await first.getAttribute('aria-expanded'), 'true', 'Groups open independently');
  await first.focus();
  await first.press('Space');
  assert.equal(await first.getAttribute('aria-expanded'), 'false');
  await first.press('Enter');
  assert.equal(await first.getAttribute('aria-expanded'), 'true');
  assert.ok(await nav.getByRole('link', { name: '01 The Vanishing Venue', exact: true }).isVisible());
  const styles = await first.evaluate(element => ({ color: getComputedStyle(element).color, height: element.getBoundingClientRect().height }));
  assert.equal(styles.color, 'rgb(223, 190, 119)');
  assert.ok(styles.height >= 44);
  const wrapping = await nav.locator('.register-link > span, .nav-groups [data-slot="accordion-trigger"]').evaluateAll(elements => elements.filter(element => {
    const range = document.createRange();
    range.selectNodeContents(element.matches('.register-link > span') ? element : element.firstChild);
    return range.getBoundingClientRect().height > parseFloat(getComputedStyle(element).lineHeight) + 1 || element.scrollWidth > element.clientWidth;
  }).map(element => element.textContent.trim()));
  assert.deepEqual(wrapping, [], 'Register and act headers must remain on one line');
  assert.equal(await nav.locator('.register-link > svg').count(), 0, 'Register needs no list icon');
}

try {
  await ready(1166, 731);
  assert.equal(await page.locator('.desk-name').count(), 0, 'Remove the static design label');
  await checkGroups(page.locator('.desk-sidebar'));
  const before = await page.locator('.desk-content').boundingBox();
  const sidebar = page.locator('.desk-sidebar');
  assert.equal(Math.round((await sidebar.boundingBox()).width), 260);
  const toggle = await page.getByRole('button', { name: 'Collapse incident sidebar', exact: true }).elementHandle();
  const toggleBefore = await toggle.boundingBox();
  const brandBefore = await page.locator('.desk-brand').boundingBox();
  await page.getByRole('button', { name: 'Collapse incident sidebar', exact: true }).click();
  const restore = sidebar.getByRole('button', { name: 'Expand incident sidebar', exact: true });
  await restore.waitFor();
  assert.equal(Math.round((await sidebar.boundingBox()).width), 64, 'Collapsed rail remains visible');
  assert.ok(await toggle.evaluate(element => element === document.activeElement && element.getAttribute('aria-label') === 'Expand incident sidebar'), 'Same button stays mounted and focused');
  assert.equal((await restore.boundingBox()).y, toggleBefore.y, 'Toggle stays on its sidebar row');
  assert.deepEqual(await page.locator('.desk-brand').boundingBox(), brandBefore, 'Brand does not move');
  assert.equal(await sidebar.locator('.nav-groups').isVisible(), false);
  assert.equal(await sidebar.locator('.register-link').isVisible(), false);
  await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Expand incident sidebar');
  assert.ok((await page.locator('.desk-content').boundingBox()).width > before.width);
  captures.set('collapsed-desktop', await page.screenshot({ animations: 'disabled' }));
  await restore.press('Enter');
  await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Collapse incident sidebar');
  assert.ok(await page.locator('.desk-sidebar .register-link').isVisible());
  assert.ok(await toggle.evaluate(element => element === document.activeElement), 'Same button retains focus after expanding');
  await sidebar.getByRole('link', { name: 'Incident register', exact: true }).click();
  await page.getByRole('heading', { name: 'Incident register', level: 1, exact: true }).waitFor();
  assert.equal(new URL(page.url()).pathname, '/');
  await ready(1166, 731);

  // Clipboard stubs are limited to this disposable browser context.
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => {} } }));
  const copy = page.getByRole('button', { name: 'Copy src/app/lab/01-vanishing-venue/', exact: true });
  const barBefore = await page.locator('.evidence-bar').boundingBox();
  await copy.click();
  await page.locator('.source-files [role="status"]').filter({ hasText: 'Copied ' }).waitFor({ state: 'attached' });
  assert.equal((await page.locator('.evidence-bar').boundingBox()).y, barBefore.y, 'Copy success must not move Evidence');
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('Permission denied'); } } }));
  await copy.click();
  await page.locator('.source-feedback').filter({ hasText: 'Could not copy. Select the path and copy it from the page.' }).waitFor();

  for (const [width, height] of [[1440, 1000], [1166, 731], [1024, 900], [390, 844], [320, 740]]) {
    await ready(width, height);
    const metrics = await page.evaluate(() => {
      const label = document.querySelector('.case-index > span').getBoundingClientRect();
      const number = document.querySelector('.case-index > strong').getBoundingClientRect();
      const concept = document.querySelector('.concept-column');
      const luminance = color => {
        const c = color.match(/[\d.]+/g).slice(0, 3).map(Number).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
        return .2126 * c[0] + .7152 * c[1] + .0722 * c[2];
      };
      const contrast = (a, b) => (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
      const surface = luminance(getComputedStyle(concept).backgroundColor);
      const reference = document.querySelector('.reference-label');
      const code = concept.querySelector('code');
      const lastSource = document.querySelector('.source-files li:last-child');
      const evidenceBar = document.querySelector('.evidence-bar');
      return {
        width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
        incidentGap: number.top - label.bottom,
        centerOffset: Math.abs(label.x + label.width / 2 - number.x - number.width / 2),
        emptyFeedbackHeight: document.querySelector('.source-feedback')?.getBoundingClientRect().height ?? 0,
        sourceToEvidenceGap: evidenceBar.getBoundingClientRect().top - lastSource.getBoundingClientRect().bottom,
        sourceBottomBorder: getComputedStyle(lastSource).borderBottomWidth,
        evidenceTopBorder: getComputedStyle(evidenceBar).borderTopWidth,
        referenceLuminance: surface,
        bodyContrast: contrast(surface, luminance(getComputedStyle(concept).color)),
        labelContrast: contrast(surface, luminance(getComputedStyle(reference).color)),
        codeContrast: contrast(luminance(getComputedStyle(code).backgroundColor), luminance(getComputedStyle(code).color)),
      };
    });
    assert.ok(metrics.scrollWidth <= width);
    assert.ok(metrics.incidentGap >= 6);
    assert.ok(metrics.centerOffset < 1);
    assert.equal(metrics.emptyFeedbackHeight, 0);
    assert.ok(Math.abs(metrics.sourceToEvidenceGap) < 1, 'No empty gap between source files and Evidence');
    assert.equal(metrics.sourceBottomBorder, '0px');
    assert.equal(metrics.evidenceTopBorder, '1px');
    assert.ok(metrics.referenceLuminance < .1, 'Reference should use a muted dark surface');
    assert.ok(metrics.bodyContrast >= 4.5 && metrics.labelContrast >= 4.5 && metrics.codeContrast >= 4.5);
    evidence.push(metrics);
    captures.set(`refinement-${width}`, await page.screenshot({ animations: 'disabled' }));
  }
  await page.getByRole('button', { name: 'Open incident navigation' }).click();
  const sheet = page.getByRole('dialog', { name: 'Incident register', exact: true });
  await checkGroups(sheet.locator('.incident-nav'));
  captures.set('refinement-mobile-nav', await page.screenshot({ animations: 'disabled' }));
  await sheet.getByRole('link', { name: '01 The Vanishing Venue', exact: true }).click();
  await sheet.waitFor({ state: 'hidden' });
  await page.setViewportSize({ width: 1166, height: 731 });
  await page.goto(`${baseURL}/level/06-lost-in-the-params`);
  await page.getByRole('heading', { name: 'Incident locked', exact: true }).waitFor();
  assert.equal(await page.locator('.desk-sidebar').getByRole('button', { name: 'Data, caching & mutations', exact: true }).getAttribute('aria-expanded'), 'true', 'Direct lesson navigation reveals its own group');
  assert.equal(await page.locator('.desk-sidebar').getByRole('button', { name: 'Routes & server boundary', exact: true }).getAttribute('aria-expanded'), 'false');
  assert.deepEqual(errors, []);
  await mkdir('.impeccable/review', { recursive: true });
  for (const [name, bytes] of captures) await writeFile(`.impeccable/review/${name}.png`, bytes);
  await writeFile('.impeccable/review/refinement-evidence.json', JSON.stringify({ evidence, errors }, null, 2));
  console.log('PASS: single-line navigation, persistent 64px rail and focus, one divider, clipboard states, five viewports, and contrast.');
} finally {
  await context.close();
  await browser.close();
}
