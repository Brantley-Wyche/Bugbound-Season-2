import type { LevelManifest } from '@/shell/types';

const manifest: LevelManifest = {
  id: '04-invisible-storefront',
  number: 4,
  title: 'The Invisible Storefront',
  concept: 'Server-side Data Fetching',
  severity: 'Medium',
  route: '/lab/04-invisible-storefront',
  files: [
    'src/app/lab/04-invisible-storefront/page.tsx',
    'src/app/lab/04-invisible-storefront/data.ts',
  ],
  symptom:
    'The SEO team is furious: search crawlers and link previews see an empty gear shop — “Loading products…” and nothing else. In a browser it looks fine, though the products do blink in a beat after the page arrives. View-source confirms it: not a single product in the HTML.',
  lesson: [
    'Where you fetch determines what the server can say. Fetch in a `useEffect` and the server’s answer is only the loading state — the real content exists nowhere until the browser downloads the bundle, hydrates, runs the effect, and round-trips for data. Crawlers, link unfurlers, and users on slow connections all get the empty version. This is the classic client-side-rendering waterfall, and it’s the default trap for anyone arriving from old-school React.',
    'Server Components dissolve it: a page can be an `async` function that simply `await`s its data before returning JSX. The fetch happens on the server, next to the data; the HTML arrives *already full*. No loading flash, no effect, no client state — and the data-fetching code (with its imports) never ships to the browser at all.',
    'The rule of thumb for the App Router: data flows down from async Server Components; interactivity lives in small `"use client"` leaves that receive that data as props. Reach for client-side fetching only for data that is born in the browser — live cursors, polling after load, personalization behind auth. A product catalog is none of those.',
  ],
  checks: [
    {
      name: 'Shoppers see the products',
      run: async (h) => {
        const page = await h.open('/lab/04-invisible-storefront');
        await page.waitFor('[data-testid="product"]', { timeout: 4000 });
        const count = page.all('[data-testid="product"]').length;
        h.ok(count >= 5, `Expected 5 products on the live page but found ${count}.`);
      },
    },
    {
      name: 'The products are in the server-rendered HTML',
      run: async (h) => {
        const res = await h.fetchDoc('/lab/04-invisible-storefront');
        const count = res.all('[data-testid="product"]').length;
        h.ok(
          count >= 5,
          `Expected 5 products in the server HTML but found ${count}. Whatever a crawler fetches is all a crawler sees — the data has to be there before the browser runs any JavaScript.`,
        );
      },
    },
    {
      name: 'Prices are server-rendered too',
      run: async (h) => {
        const res = await h.fetchDoc('/lab/04-invisible-storefront');
        const prices = res.all('[data-testid="product-price"]').map((el) => el.textContent ?? '');
        h.ok(
          prices.length >= 5 && prices.every((p) => p.trim().startsWith('$')),
          `Expected 5 dollar-formatted prices in the server HTML but got [${prices.join(', ')}].`,
        );
      },
    },
  ],
};

export default manifest;
