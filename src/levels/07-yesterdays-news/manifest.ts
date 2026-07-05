import type { LevelManifest } from '@/shell/types';

const uniqueHeadline = () => `Checks desk test story ${Date.now().toString(36)}`;

const manifest: LevelManifest = {
  id: '07-yesterdays-news',
  number: 7,
  title: 'Yesterday’s News',
  concept: 'The Data Cache',
  severity: 'High',
  route: '/lab/07-yesterdays-news',
  files: [
    'src/app/lab/07-yesterdays-news/page.tsx',
    'src/app/lab/07-yesterdays-news/feed.ts',
  ],
  symptom:
    'The newsroom’s own wire page is stuck in the past. Editors publish a story, the publish call succeeds, the API even returns the new story — but the front page keeps showing the same old list. Refreshing doesn’t help. Restarting the dev server does, briefly, which has everyone extra confused.',
  lesson: [
    'Serving data in Next.js means living with caches — plural. The framework has official ones (the **Data Cache** stores server-side `fetch` results by URL; `unstable_cache`/`"use cache"` do the same for arbitrary reads; the client keeps a Router Cache of visited pages), and codebases add unofficial ones on top: memoized reads, module-level lookups, “compute once, reuse forever” shortcuts. Every one of them trades freshness for speed. A page can re-render on every request and *still* serve old data, because rendering isn’t reading — the render just asks a cache, and the cache answers from memory.',
    'Whatever the cache, the contract is the same: every cached read needs an answer to “when is this wrong, and who tells it so?” Next.js gives you the vocabulary — `cache: "no-store"` for always-live, `next: { revalidate: 60 }` for time-based expiry, and tags (`next: { tags: ["wire"] }` on the read, `revalidateTag("wire")` after the write) for surgical invalidation the moment data changes. `revalidatePath` does the same per-URL. The write side owns the responsibility: whoever mutates the data must bust the caches that hold it.',
    'The debugging instinct to build: when data is stale, locate *which* cache is serving it. “Restarting the server fixes it” points at server-side memory; “only my browser is stale” points at client caches. Then find the read path — follow the data from the component backwards — and ask what its caching policy is, and whether anything ever tells that cache the world has changed. A cache with no invalidation story isn’t an optimization, it’s a time capsule.',
  ],
  checks: [
    {
      name: 'The wire page renders headlines',
      run: async (h) => {
        const res = await h.fetchDoc('/lab/07-yesterdays-news');
        h.ok(res.status === 200, `The wire page returned ${res.status}.`);
        h.ok(
          res.all('[data-testid="headline"]').length >= 1,
          'Expected at least one headline on the wire.',
        );
      },
    },
    {
      name: 'Publishing stores the story (API round-trip)',
      run: async (h) => {
        const text = uniqueHeadline();
        const post = await h.fetchJSON('/lab/07-yesterdays-news/api', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ text }),
        });
        h.ok(post.status === 201, `POSTing a headline returned ${post.status}.`);
        const list = await h.fetchJSON('/lab/07-yesterdays-news/api');
        const texts = JSON.stringify(list.json);
        h.ok(
          texts.includes(text),
          'The story was accepted but the API list doesn’t contain it afterwards.',
        );
      },
    },
    {
      name: 'The front page shows stories published after it first rendered',
      run: async (h) => {
        // Warm the page once, then publish, then re-request the page.
        await h.fetchDoc('/lab/07-yesterdays-news');
        const text = uniqueHeadline();
        await h.fetchJSON('/lab/07-yesterdays-news/api', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ text }),
        });
        const res = await h.fetchDoc('/lab/07-yesterdays-news');
        h.ok(
          res.html.includes(text),
          'Published a fresh story, re-requested the front page, and the story isn’t there — the page is serving stale data.',
        );
      },
    },
    {
      name: 'The publish button works end-to-end in the browser',
      run: async (h) => {
        const text = uniqueHeadline();
        const page = await h.open('/lab/07-yesterdays-news');
        await page.type('[data-testid="headline-input"]', text);
        await page.click('[data-testid="publish"]');
        await page.waitFor(
          () => page.all('[data-testid="headline"]').some((el) => (el.textContent ?? '').includes(text)),
          { timeout: 6000 },
        );
      },
    },
  ],
};

export default manifest;
