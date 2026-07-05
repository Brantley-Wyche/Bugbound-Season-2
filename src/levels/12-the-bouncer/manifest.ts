import type { LevelManifest } from '@/shell/types';

const manifest: LevelManifest = {
  id: '12-the-bouncer',
  number: 12,
  title: 'The Bouncer',
  concept: 'Proxy (Middleware)',
  severity: 'High',
  route: '/lab/12-the-bouncer/signup',
  files: ['src/proxy.ts', 'src/app/lab/12-the-bouncer/'],
  vague: true,
  symptom:
    'The Tasting Room beta is gated: join on the signup page, get waved through the door. Except nobody gets waved through. Users click “Join the beta,” the join call succeeds, the cookie is visibly set in devtools — and the door still bounces them straight back to signup. Every time. Even people who joined days ago.',
  lesson: [
    'Some decisions have to happen *before* a request reaches any page: access control, redirects, A/B bucketing, geo rules. That’s the job of the proxy file (`src/proxy.ts`, historically called middleware) — it runs on every request that matches its `matcher` pattern, sees the raw `NextRequest` (URL, headers, cookies), and can wave the request through with `NextResponse.next()` or send it elsewhere with `NextResponse.redirect()`.',
    'Because it runs before rendering, the proxy never sees your React state or your components — its entire worldview is the request itself. Cookie-based gating therefore has two halves that live in different files: something *sets* the cookie (a route handler, a Server Action), and the proxy *reads* it on the next request. Those two halves only work while they agree, exactly — same cookie name, same expected value. Nothing type-checks that agreement; a cookie is just a string with a name.',
    'So when a gate misbehaves, interrogate the contract, not the vibes: what cookie does the setter set — name and value, character for character — and what does the checker check? Devtools’ Application tab shows you the truth on the wire. Gates that “never let anyone in” are almost always two components honestly enforcing two slightly different contracts.',
  ],
  checks: [
    {
      name: 'The signup page is reachable',
      run: async (h) => {
        const res = await h.fetchDoc('/lab/12-the-bouncer/signup');
        h.ok(res.status === 200, `The signup page returned ${res.status}.`);
        res.get('[data-testid="signup-page"]');
      },
    },
    {
      name: 'Visitors without a pass are turned away',
      run: async (h) => {
        await h.fetchJSON('/lab/12-the-bouncer/api/leave', { method: 'POST' });
        const res = await h.fetchDoc('/lab/12-the-bouncer/beta');
        h.ok(
          res.url.includes('/signup'),
          'A visitor with no beta pass reached the Tasting Room — the door has to keep enforcing the gate.',
        );
      },
    },
    {
      name: 'Members who joined get in',
      run: async (h) => {
        const join = await h.fetchJSON('/lab/12-the-bouncer/api/join', { method: 'POST' });
        h.ok(join.status === 200, `Joining the beta returned ${join.status}.`);
        const res = await h.fetchDoc('/lab/12-the-bouncer/beta');
        h.ok(
          !res.url.includes('/signup') && !!res.query('[data-testid="beta-dash"]'),
          'Joined the beta, then knocked on the Tasting Room door — and got bounced back to signup anyway.',
        );
        await h.fetchJSON('/lab/12-the-bouncer/api/leave', { method: 'POST' });
      },
    },
    {
      name: 'The whole flow works in the browser',
      run: async (h) => {
        await h.fetchJSON('/lab/12-the-bouncer/api/leave', { method: 'POST' });
        const page = await h.open('/lab/12-the-bouncer/signup');
        await page.click('[data-testid="join-beta"]');
        await page.waitFor(() => !!page.query('[data-testid="beta-dash"]'), { timeout: 7000 });
        await h.fetchJSON('/lab/12-the-bouncer/api/leave', { method: 'POST' });
      },
    },
  ],
};

export default manifest;
