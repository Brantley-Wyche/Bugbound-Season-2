import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseURL = process.env.TEST_BASE_URL || 'http://127.0.0.1:3002';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext();
const page = await context.newPage();
const errors = [];
const captures = [];
page.on('pageerror', error => errors.push(error.message));
try {
  for (const width of [1166, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 850 });
    await page.goto(baseURL);
    const brand = page.getByRole('link', { name: 'Bugbound Season 2', exact: true });
    const icon = brand.locator('img');
    await icon.waitFor({ timeout: 5000 });
    await page.evaluate(() => document.fonts.ready);
    await icon.evaluate(image => image.decode());
    assert.equal(await icon.getAttribute('src'), '/bugbound-icon.svg');
    assert.equal(await icon.getAttribute('alt'), '');
    const box = await icon.boundingBox();
    assert.equal(box.width, 32);
    assert.equal(box.height, 32);
    const layout = await page.evaluate(() => {
      const brand = document.querySelector('.desk-brand').getBoundingClientRect();
      const progress = document.querySelector('.desk-progress').getBoundingClientRect();
      return { overflow: document.documentElement.scrollWidth > innerWidth, overlap: brand.right > progress.left };
    });
    assert.deepEqual(layout, { overflow: false, overlap: false });
    const hrefs = await page.locator('link[rel="icon"]').evaluateAll(links => links.map(link => link.href));
    assert(hrefs.some(href => new URL(href).pathname === '/icon.svg'));
    assert(!hrefs.some(href => new URL(href).pathname === '/favicon.ico'), 'Starter favicon must not compete with the brand icon');
    captures.push([`branding-${width}.png`, await page.screenshot()]);
    await brand.click();
    assert.equal(new URL(page.url()).pathname, '/');
  }
  for (const path of ['/bugbound-icon.svg', '/icon.svg']) {
    const response = await context.request.get(baseURL + path);
    assert.equal(response.status(), 200);
    assert.match(response.headers()['content-type'], /image\/svg\+xml/);
    const svg = await response.text();
    const result = await page.evaluate(source => {
      const doc = new DOMParser().parseFromString(source, 'image/svg+xml');
      return {
        viewBox: doc.documentElement.getAttribute('viewBox'),
        paths: doc.querySelectorAll('path').length,
        unsafe: doc.querySelectorAll('parsererror, script, image, foreignObject, [href], [*|href]').length,
        colors: [...new Set([...doc.querySelectorAll('[fill], [stroke]')].flatMap(el => [el.getAttribute('fill'), el.getAttribute('stroke')]).filter(color => color && color !== 'none'))].sort(),
      };
    }, svg);
    assert.equal(result.viewBox, '0 0 64 64');
    assert(result.paths > 0);
    assert.equal(result.unsafe, 0);
    assert.deepEqual(result.colors, ['#131719', '#dfbe77']);
  }
  await page.setViewportSize({ width: 400, height: 180 });
  const favicon = await (await context.request.get(baseURL + '/icon.svg')).text();
  // Render the size specimen outside React so it cannot interrupt hydration.
  await page.goto('about:blank');
  const pixels = await page.evaluate(async source => {
    const image = new Image();
    image.src = 'data:image/svg+xml,' + encodeURIComponent(source);
    await image.decode();
    document.body.replaceChildren();
    document.body.style.cssText = 'display:flex;align-items:center;gap:24px;padding:24px;background:#131719';
    return [16, 32, 64].map(size => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      canvas.style.cssText = `width:${size}px;height:${size}px;flex:none`;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, size, size);
      document.body.append(canvas);
      const data = ctx.getImageData(0, 0, size, size).data;
      let opaque = 0;
      let transparent = 0;
      for (let index = 3; index < data.length; index += 4) {
        if (data[index] > 200) opaque++;
        if (data[index] === 0) transparent++;
      }
      return { size, opaque, transparent };
    });
  }, favicon);
  for (const { size, opaque, transparent } of pixels) {
    assert(opaque > size * size * 0.2, 'Favicon must render visible vector content');
    assert(transparent > size * size * 0.2, 'Favicon must retain transparent padding');
  }
  captures.push(['branding-favicon-sizes.png', await page.screenshot()]);
  assert.deepEqual(errors, []);
  await mkdir('.impeccable/review', { recursive: true });
  for (const [name, bytes] of captures) await writeFile(`.impeccable/review/${name}`, bytes);
  console.log('PASS: branded header and favicon; four viewports; SVG palette/safety; no overflow, overlap, or runtime errors.');
} finally {
  await context.close();
  await browser.close();
}
