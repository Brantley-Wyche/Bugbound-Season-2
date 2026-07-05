import type { LevelManifest } from '@/shell/types';

const manifest: LevelManifest = {
  id: '13-launch-day',
  number: 13,
  title: 'Launch Day',
  concept: 'Capstone — Everything at Once',
  severity: 'Critical',
  route: '/lab/13-launch-day',
  files: ['src/app/lab/13-launch-day/'],
  vague: true,
  symptom:
    'It’s launch day and the store page is DOWN — the route errors instead of rendering. And the pre-launch QA report was already ugly before the crash: placing an order never moved the stock number on screen (it only showed up after a manual refresh), and the console lit up red on every single load. Marketing is refreshing the page every ten seconds. Good luck.',
  lesson: [
    'The capstone rule: on launch day, bugs don’t arrive one at a time. Real incidents are compound — one failure hides another, and fixing the first thing on the screen only promotes the next thing to the top. Work them in dependency order: first make the page *render*, then make the data *true*, then make the console *quiet*.',
    'Everything here is Season 2 material. The server/client boundary is a serialization frontier: only data that can be written down — plain objects, arrays, strings, numbers — crosses from server to client, and *behavior* never does. A mutation has two jobs, and the second one — telling the framework which cached views of the world it just made wrong — is the one that gets forgotten. And hydration remains a treaty: the server’s HTML and the client’s first render must agree, or React tears the page down and starts over, loudly.',
    'A repeatable triage for compound failures: (1) read the error page or console top to bottom and fix the loudest crash first; (2) once it renders, mutate something and watch whether every number that should move actually moves — a write that lands while the screen stands still means some cached view was never told; (3) once it’s correct, load it fresh and treat any red left in the console as a real defect. Three passes, three different bugs. That’s most on-call shifts, in miniature.',
  ],
  checks: [
    {
      name: 'The launch page is live',
      run: async (h) => {
        const res = await h.fetchDoc('/lab/13-launch-day');
        h.ok(res.status === 200, `The launch page returned ${res.status} — it's down.`);
        res.get('[data-testid="launch-hero"]');
      },
    },
    {
      name: 'Products render with their stock',
      run: async (h) => {
        const res = await h.fetchDoc('/lab/13-launch-day');
        const rows = res.all('[data-testid="product-row"]');
        h.ok(rows.length >= 3, `Expected 3 products on the board but found ${rows.length}.`);
        const stock = Number(res.text('[data-testid="stock-nimbus-one"]'));
        h.ok(Number.isFinite(stock) && stock > 0, 'Nimbus One shows no readable stock number.');
      },
    },
    {
      name: 'Ordering updates the stock on screen, no reload needed',
      run: async (h) => {
        const page = await h.open('/lab/13-launch-day');
        page.get('[data-testid="launch-hero"]');
        const before = Number(page.text('[data-testid="stock-nimbus-one"]'));
        await page.click('[data-testid="order-nimbus-one"]');
        await page.waitFor(
          () =>
            Number(page.query('[data-testid="stock-nimbus-one"]')?.textContent ?? NaN) ===
            before - 1,
          { timeout: 5000 },
        );
      },
    },
    {
      name: 'Orders are recorded on the server',
      run: async (h) => {
        const page = await h.open('/lab/13-launch-day');
        page.get('[data-testid="launch-hero"]');
        await page.click('[data-testid="order-filter-pack"]');
        await h.pause(1000);
        const res = await h.fetchDoc('/lab/13-launch-day');
        const orders = Number(res.text('[data-testid="orders-today"]'));
        h.ok(
          Number.isFinite(orders) && orders >= 1,
          `Placed an order but the server-rendered board says orders today = "${res.text('[data-testid="orders-today"]')}".`,
        );
      },
    },
    {
      name: 'The page hydrates with a clean console',
      run: async (h) => {
        const page = await h.open('/lab/13-launch-day');
        page.get('[data-testid="launch-hero"]');
        await h.pause(400);
        const complaints = page.hydrationErrors();
        h.ok(
          complaints.length === 0,
          `React logged ${complaints.length} hydration complaint(s) on load. First one:\n${(complaints[0] ?? '').slice(0, 300)}`,
        );
      },
    },
  ],
};

export default manifest;
