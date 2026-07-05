import type { LevelManifest } from '@/shell/types';

const manifest: LevelManifest = {
  id: '03-dead-on-arrival',
  number: 3,
  title: 'Dead on Arrival',
  concept: 'The "use client" Boundary',
  severity: 'Medium',
  route: '/lab/03-dead-on-arrival',
  files: [
    'src/app/lab/03-dead-on-arrival/page.tsx',
    'src/app/lab/03-dead-on-arrival/FaqList.tsx',
  ],
  symptom:
    'The support FAQ page went down with the last deploy — it doesn’t render at all anymore, just an error screen. The page worked fine last week; it broke the moment product asked for “a little analytics” on the accordion.',
  lesson: [
    'Every component in the App Router is a Server Component until a file says otherwise. Server Components run only on the server; the `"use client"` directive at the top of a file is how you cross over — it means “this file (and everything it imports) also ships to the browser and hydrates,” which is what makes `useState` and event handlers legal there.',
    'That line between the two worlds is a *serialization frontier*. Props passed from a Server Component to a Client Component travel inside the server’s response, so they must be writable-down: plain objects, arrays, strings, numbers, booleans. A **function** cannot be written down and shipped — there is no way to send executable closure state over the wire — so handing one across the boundary is an error that takes the whole route down at request time.',
    'When the client side needs behavior, the behavior should be *born* on the client: define the callback inside the client component itself, or, if it must run server code, pass a Server Action (those are the one callable thing allowed across, because they’re really references to server endpoints). When a route dies right after “we just passed one more prop,” audit that prop’s type before anything else.',
  ],
  checks: [
    {
      name: 'The support page renders at all',
      run: async (h) => {
        const res = await h.fetchDoc('/lab/03-dead-on-arrival');
        h.ok(
          res.status === 200,
          `Expected the support page to return 200 but got ${res.status} — the route is erroring.`,
        );
        res.get('[data-testid="support-title"]');
      },
    },
    {
      name: 'The FAQ list is server-rendered with all questions',
      run: async (h) => {
        const res = await h.fetchDoc('/lab/03-dead-on-arrival');
        const questions = res.all('[data-testid="faq-question"]');
        h.ok(
          questions.length >= 3,
          `Expected at least 3 FAQ questions in the server HTML but found ${questions.length}.`,
        );
      },
    },
    {
      name: 'Questions expand on click',
      run: async (h) => {
        const page = await h.open('/lab/03-dead-on-arrival');
        await page.click('[data-testid="faq-question"]');
        await page.waitFor('[data-testid="faq-answer"]', { timeout: 2500 });
        const answer = page.text('[data-testid="faq-answer"]');
        h.ok(answer.length > 10, 'The answer expanded but appears to be empty.');
      },
    },
  ],
};

export default manifest;
