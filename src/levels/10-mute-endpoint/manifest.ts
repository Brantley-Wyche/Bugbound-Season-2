import type { LevelManifest } from '@/shell/types';

const manifest: LevelManifest = {
  id: '10-mute-endpoint',
  number: 10,
  title: 'The Mute Endpoint',
  concept: 'Route Handlers',
  severity: 'High',
  route: '/lab/10-mute-endpoint',
  files: ['src/app/lab/10-mute-endpoint/'],
  vague: true,
  symptom:
    'The feedback page loads, but the tally shows “Stats unavailable — the endpoint answered with an error.” The buttons that submit feedback work (the POST endpoint logs successes), yet reading the numbers back never works. The network tab shows the stats request failing with a 4xx.',
  lesson: [
    'Route Handlers are the App Router’s API endpoints: a `route.ts` file makes its folder a URL that returns *data* instead of UI. Where a `page.tsx` exports a default component, a `route.ts` exports functions named after HTTP methods — `GET`, `POST`, `PUT`, `DELETE` — each receiving a standard `Request` and returning a standard `Response` (usually via `NextResponse.json`). The two are mutually exclusive in one folder: a segment serves a page or an API, never both.',
    'The method-name convention is a *contract*, and it is exact — the router dispatches by matching the incoming request’s method against the exported names, case-sensitively, no aliases. Export something the router doesn’t recognize and it isn’t an error; it’s just an ordinary unused function, and requests for that method get `405 Method Not Allowed` because, as far as Next.js can tell, you never implemented it.',
    'A 405 is one of the most legible errors HTTP can hand you: the *route* exists (that would be a 404), but not for the verb you used. When you see one, there are only two suspects — the caller is using the wrong method, or the handler isn’t exporting the right one. Check the network tab for what was sent, then the `route.ts` for what’s exported, and the mismatch will be staring at you.',
  ],
  checks: [
    {
      name: 'GET /api/stats answers 200 with the tally',
      run: async (h) => {
        const res = await h.fetchJSON('/lab/10-mute-endpoint/api/stats');
        h.ok(
          res.status === 200,
          `GET /lab/10-mute-endpoint/api/stats returned ${res.status} — the endpoint refuses to answer a plain GET.`,
        );
        const stats = res.json as { total?: number };
        h.ok(
          typeof stats?.total === 'number',
          'The stats endpoint answered, but the JSON has no numeric "total" field.',
        );
      },
    },
    {
      name: 'The tally renders on the live page',
      run: async (h) => {
        const page = await h.open('/lab/10-mute-endpoint');
        await page.waitFor('[data-testid="stat-total"]', { timeout: 4000 });
      },
    },
    {
      name: 'Sending praise bumps the counter',
      run: async (h) => {
        const page = await h.open('/lab/10-mute-endpoint');
        await page.waitFor('[data-testid="stat-total"]', { timeout: 4000 });
        const before = Number(page.text('[data-testid="stat-total"]'));
        await page.click('[data-testid="send-praise"]');
        await page.waitFor(
          () => Number(page.query('[data-testid="stat-total"]')?.textContent ?? 0) === before + 1,
          { timeout: 4000 },
        );
      },
    },
  ],
};

export default manifest;
