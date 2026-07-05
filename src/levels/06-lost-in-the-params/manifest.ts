import type { LevelManifest } from '@/shell/types';

const manifest: LevelManifest = {
  id: '06-lost-in-the-params',
  number: 6,
  title: 'Lost in the Params',
  concept: 'Dynamic Routes & Async Params',
  severity: 'Medium',
  route: '/lab/06-lost-in-the-params',
  files: ['src/app/lab/06-lost-in-the-params/notes/[slug]/page.tsx'],
  symptom:
    'Every single field note shows “Note not found” — even ones you can see listed on the index page, even slugs copied straight from the data file into the URL bar. The index works; every detail page insists its note doesn’t exist.',
  lesson: [
    'A folder named `[slug]` makes a route segment dynamic: `/notes/first-frost` and `/notes/anything-else` both land on the same `page.tsx`, and the actual value arrives in the page’s `params` prop. `searchParams` (the `?query=` part) arrives the same way. This one file is the template for infinitely many URLs.',
    'Here’s the modern twist: in current Next.js, `params` and `searchParams` are **Promises**. The framework made them async so it can start rendering the rest of the tree before route information is fully resolved. A page that wants its params must be an `async` function and `await` them: `const { slug } = await params;`. Property access on an un-awaited Promise doesn’t throw — it just returns `undefined`, silently.',
    'That silence is the trap. `promise.slug` is `undefined`, your lookup finds nothing, and your own not-found branch renders — the code *appears* to work while feeding garbage downstream. TypeScript is the early-warning system here: type the prop honestly as `params: Promise<{ slug: string }>` and the compiler refuses to let you touch `.slug` without awaiting. When a lookup mysteriously fails for every input, inspect the input itself — log it, type it, don’t trust it.',
  ],
  checks: [
    {
      name: 'The index lists the field notes',
      run: async (h) => {
        const res = await h.fetchDoc('/lab/06-lost-in-the-params');
        const links = res.all('[data-testid="note-link"]');
        h.ok(links.length >= 3, `Expected at least 3 note links but found ${links.length}.`);
      },
    },
    {
      name: 'A note page shows its actual note',
      run: async (h) => {
        const res = await h.fetchDoc('/lab/06-lost-in-the-params/notes/first-frost');
        h.ok(res.status === 200, `The note page returned ${res.status}.`);
        h.ok(
          !res.query('[data-testid="note-missing"]'),
          'Visited /notes/first-frost — a note that definitely exists — and got the “Note not found” screen.',
        );
        const title = res.text('[data-testid="note-title"]');
        h.ok(
          title === 'First Frost',
          `Expected the note title to read "First Frost" but it reads "${title}".`,
        );
      },
    },
    {
      name: 'Navigating from the index reaches the right note',
      run: async (h) => {
        const page = await h.open('/lab/06-lost-in-the-params');
        await page.click('[data-testid="note-link"]');
        await page.waitFor(
          () => !!page.query('[data-testid="note-title"]') || !!page.query('[data-testid="note-missing"]'),
          { timeout: 4000 },
        );
        h.ok(
          !!page.query('[data-testid="note-title"]'),
          'Clicked the first note on the index and landed on “Note not found”.',
        );
      },
    },
    {
      name: 'Unknown slugs still get the not-found screen',
      run: async (h) => {
        const res = await h.fetchDoc('/lab/06-lost-in-the-params/notes/no-such-note');
        h.ok(
          !!res.query('[data-testid="note-missing"]'),
          'A genuinely unknown slug should still render the “Note not found” screen — don’t lose the guard while fixing the lookup.',
        );
      },
    },
  ],
};

export default manifest;
