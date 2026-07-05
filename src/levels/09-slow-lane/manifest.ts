import type { LevelManifest } from '@/shell/types';

const manifest: LevelManifest = {
  id: '09-slow-lane',
  number: 9,
  title: 'The Slow Lane',
  concept: 'Streaming & Parallel Data',
  severity: 'High',
  route: '/lab/09-slow-lane',
  files: ['src/app/lab/09-slow-lane/'],
  vague: true,
  symptom:
    'The Trip Desk page takes well over two seconds to arrive. Ops checked the three upstream services it depends on — flights, hotels, weather — and each one answers in ~700ms, comfortably inside its SLA. Somehow three fast services add up to one slow page, and product wants it under 1.5 seconds.',
  lesson: [
    'Three ~700ms calls should cost ~700ms — unless you accidentally put them in single file. `await` is sequential by nature: each `await` pauses the whole function until that promise settles, so `await a(); await b(); await c();` runs one service *after* another and the page pays the sum, not the max. This is the waterfall, and it hides in plain sight because each line looks innocent.',
    'The direct cure is to start everything first and wait once: `const [a, b, c] = await Promise.all([getA(), getB(), getC()])`. All three requests fly at the same time; the page pays only for the slowest. The subtler cure is architectural: give each section its own `async` component and wrap it in `<Suspense fallback={…}>` — each section then fetches independently and *streams* into the page as it lands, none of them blocking the others.',
    'That’s also the job of `loading.tsx`: it’s an automatic Suspense boundary around the whole page, so users get the skeleton instantly while the server keeps working. Streaming doesn’t make data faster — it makes *waiting* cheaper, by shipping what’s ready when it’s ready. First rule of page speed in the App Router: find out what your awaits are waiting on, and whether they really need to wait on each other.',
  ],
  checks: [
    {
      name: 'All three sections render with their data',
      run: async (h) => {
        const res = await h.fetchDoc('/lab/09-slow-lane');
        res.get('[data-testid="flights"]');
        res.get('[data-testid="hotels"]');
        res.get('[data-testid="weather"]');
        h.ok(res.html.includes('DW114'), 'The flights section is missing flight DW114.');
        h.ok(res.html.includes('The Quayside'), 'The hotels section is missing The Quayside.');
      },
    },
    {
      name: 'The page assembles in under 1.5s (services answer in ~0.7s)',
      run: async (h) => {
        // Warm-up request so dev-server compilation doesn't pollute the timing.
        await h.fetchDoc('/lab/09-slow-lane');
        const start = performance.now();
        await h.fetchDoc('/lab/09-slow-lane');
        const elapsed = Math.round(performance.now() - start);
        h.ok(
          elapsed < 1500,
          `The page took ${elapsed}ms to fully render. Three ~700ms services should cost about 700ms together — not their sum. Something is making them wait in line.`,
        );
      },
    },
  ],
};

export default manifest;
