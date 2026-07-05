import type { LevelManifest } from '@/shell/types';

const manifest: LevelManifest = {
  id: '02-forgetful-cart',
  number: 2,
  title: 'The Forgetful Cart',
  concept: 'next/link & Client Navigation',
  severity: 'Low',
  route: '/lab/02-forgetful-cart',
  files: ['src/app/lab/02-forgetful-cart/layout.tsx', 'src/app/lab/02-forgetful-cart/cart.tsx'],
  symptom:
    'Customers add beans to their cart, browse over to the Mugs page, and the cart badge is back to zero. Support has reproduced it: any move between store pages wipes the cart. Adding items works fine as long as you never navigate.',
  lesson: [
    'Next.js apps are still single-page apps — when you navigate with `<Link>`, the router swaps in the next page’s content without reloading the document. React stays alive, and so does everything above the part that changed: the layout does not remount, so state living in it (context providers, playing media, scroll position) survives the trip.',
    'A plain `<a href>` opts out of all of that. The browser tears the whole document down and boots the application again from a blank slate — every component remounts, every `useState` returns to its initial value. Visually the two can look identical, which is exactly why this bug ships: the difference isn’t the destination, it’s what happens to the state you were carrying.',
    'The layout-persistence rule is worth internalizing: on a client-side navigation, only the segments of the tree below the shared layout re-render. Keep cross-page state (like a cart) in a layout-level provider, navigate with `<Link>`, and it rides along for free — no store, no localStorage, no ceremony.',
  ],
  checks: [
    {
      name: 'Both store pages render',
      run: async (h) => {
        const beans = await h.fetchDoc('/lab/02-forgetful-cart');
        h.ok(beans.status === 200, `Beans page returned ${beans.status}.`);
        beans.get('[data-testid="beans-page"]');
        const mugs = await h.fetchDoc('/lab/02-forgetful-cart/mugs');
        h.ok(mugs.status === 200, `Mugs page returned ${mugs.status}.`);
        mugs.get('[data-testid="mugs-page"]');
      },
    },
    {
      name: 'Adding items updates the cart badge',
      run: async (h) => {
        const page = await h.open('/lab/02-forgetful-cart');
        await page.click('[data-testid="add-to-cart"]');
        await page.click('[data-testid="add-to-cart"]');
        const count = page.text('[data-testid="cart-count"]');
        h.ok(count === '2', `Added 2 items but the badge reads "${count}".`);
      },
    },
    {
      name: 'The cart survives navigating to another page',
      run: async (h) => {
        const page = await h.open('/lab/02-forgetful-cart');
        await page.click('[data-testid="add-to-cart"]');
        await page.click('[data-testid="add-to-cart"]');
        await page.click('[data-testid="nav-mugs"]');
        await page.waitFor('[data-testid="mugs-page"]');
        await h.pause(250);
        const count = page.text('[data-testid="cart-count"]');
        h.ok(
          count === '2',
          `Had 2 items in the cart, navigated to Mugs, and the badge now reads "${count}". The navigation is destroying client state.`,
        );
      },
    },
  ],
};

export default manifest;
