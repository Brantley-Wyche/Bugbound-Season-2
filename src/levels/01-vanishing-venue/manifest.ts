import type { LevelManifest } from '@/shell/types';

const manifest: LevelManifest = {
  id: '01-vanishing-venue',
  number: 1,
  title: 'The Vanishing Venue',
  concept: 'File-based Routing',
  severity: 'Low',
  route: '/lab/01-vanishing-venue',
  files: ['src/app/lab/01-vanishing-venue/'],
  symptom:
    'Attendees clicking "Venue" in the conference site nav get a 404. The venue screen was written weeks ago — the code is sitting right there in the repo — but the page simply does not exist as far as the router is concerned. Home and Schedule work fine.',
  lesson: [
    'In the App Router, the URL structure of your site is the folder structure of `src/app`. A folder creates a route segment; the folder earns an actual page only when it contains a file with the exact reserved name `page.tsx`. Other reserved names have jobs too: `layout.tsx` wraps every page beneath it, `loading.tsx` is the streaming fallback, `route.ts` makes an API endpoint.',
    'Any file that is *not* one of the reserved names is invisible to the router — you can freely park components, helpers, or test files inside a route folder and no URL will ever serve them. That is a feature: colocation without accidental pages. But it cuts both ways, and the router will not warn you when a file it ignores was supposed to be a page.',
    'Layouts nest: this mini-site has its own `layout.tsx` providing the nav, which wraps each page inside it, and that in turn renders within the app’s root layout. When a URL 404s, debug it structurally: walk the folders from `src/app` down, segment by segment, and ask at each step “does the router see what I think it sees?”',
  ],
  checks: [
    {
      name: 'The conference home page responds',
      run: async (h) => {
        const res = await h.fetchDoc('/lab/01-vanishing-venue');
        h.ok(res.status === 200, `Expected the home page to return 200 but got ${res.status}.`);
        res.get('[data-testid="conf-home"]');
      },
    },
    {
      name: 'The schedule page lists its sessions',
      run: async (h) => {
        const res = await h.fetchDoc('/lab/01-vanishing-venue/schedule');
        h.ok(res.status === 200, `Expected the schedule page to return 200 but got ${res.status}.`);
        const sessions = res.all('[data-testid="session"]');
        h.ok(
          sessions.length >= 4,
          `Expected at least 4 sessions on the schedule but found ${sessions.length}.`,
        );
      },
    },
    {
      name: 'The venue page exists at /venue',
      run: async (h) => {
        const res = await h.fetchDoc('/lab/01-vanishing-venue/venue');
        h.ok(
          res.status === 200,
          `GET /lab/01-vanishing-venue/venue returned ${res.status} — the router doesn't serve a page for that URL.`,
        );
        const title = res.text('[data-testid="venue-title"]');
        h.ok(
          title === 'Harbor Hall',
          `Expected the venue title to read "Harbor Hall" but it reads "${title}".`,
        );
      },
    },
    {
      name: 'The shared nav (layout) wraps every page',
      run: async (h) => {
        for (const path of ['', '/schedule', '/venue']) {
          const res = await h.fetchDoc(`/lab/01-vanishing-venue${path}`);
          h.ok(
            !!res.query('[data-testid="lab-nav"]'),
            `The page at ${path || '/'} is missing the shared site nav — the layout isn't wrapping it.`,
          );
        }
      },
    },
  ],
};

export default manifest;
