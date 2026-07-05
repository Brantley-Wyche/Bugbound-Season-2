import type { LevelManifest } from '@/shell/types';

const manifest: LevelManifest = {
  id: '05-shape-shifter',
  number: 5,
  title: 'The Shape-Shifter',
  concept: 'Hydration',
  severity: 'Medium',
  route: '/lab/05-shape-shifter',
  files: ['src/app/lab/05-shape-shifter/WelcomeCard.tsx'],
  symptom:
    'QA filed this one with a screen recording: the lounge welcome card visibly changes a split second after the page loads — the visitor number flips to a different number, the time shifts. The browser console is full of angry red React errors on every load.',
  lesson: [
    'Client components render **twice**: once on the server to produce the initial HTML, then again in the browser during *hydration*, where React walks the server’s HTML and attaches interactivity to it. Hydration works on one assumption — that both renders produce identical output. React isn’t re-drawing the page in the browser; it’s adopting the existing markup, node by node.',
    'Anything non-deterministic breaks the pact. `Math.random()`, `new Date()` formatting, `typeof window` branches, locale- or timezone-dependent output — the server rolls one value into the HTML, the browser rolls another during hydration, and React finds markup that doesn’t match what it expected. It logs a hydration error and falls back to throwing away the server HTML and re-rendering from scratch on the client: the flicker QA recorded is that discard happening on screen.',
    'The cure is to keep the first client render deterministic. Values that only exist meaningfully in the browser belong in `useEffect` — render a stable placeholder, then set the real value after mount (the effect runs only post-hydration, so both first renders agree). For content that is *legitimately* different per render, like a clock, React provides the `suppressHydrationWarning` prop on the specific element as a scoped escape hatch. Either way, the goal is the same: server and client telling the same story on render one.',
  ],
  checks: [
    {
      name: 'The lounge renders its welcome card',
      run: async (h) => {
        const page = await h.open('/lab/05-shape-shifter');
        page.get('[data-testid="welcome-card"]');
        page.get('[data-testid="visitor-num"]');
      },
    },
    {
      name: 'React hydrates cleanly — no mismatch complaints in the console',
      run: async (h) => {
        const page = await h.open('/lab/05-shape-shifter');
        await h.pause(400);
        const complaints = page.hydrationErrors();
        h.ok(
          complaints.length === 0,
          `React logged ${complaints.length} hydration complaint(s) while loading the page. First one:\n${(complaints[0] ?? '').slice(0, 300)}`,
        );
      },
    },
    {
      name: 'Check-in still works after load',
      run: async (h) => {
        const page = await h.open('/lab/05-shape-shifter');
        await page.click('[data-testid="check-in"]');
        await page.waitFor('[data-testid="checked-in-tag"]', { timeout: 2500 });
      },
    },
  ],
};

export default manifest;
