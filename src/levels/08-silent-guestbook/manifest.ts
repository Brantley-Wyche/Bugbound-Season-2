import type { LevelManifest } from '@/shell/types';

const uniqueMessage = () => `The checks were here ${Date.now().toString(36)}`;

const manifest: LevelManifest = {
  id: '08-silent-guestbook',
  number: 8,
  title: 'The Silent Guestbook',
  concept: 'Server Actions & Revalidation',
  severity: 'High',
  route: '/lab/08-silent-guestbook',
  files: ['src/app/lab/08-silent-guestbook/actions.ts'],
  symptom:
    'Guests sign the café guestbook, hit Sign, and… nothing. The page just sits there. The note IS saved — reload the page and there it is — but nothing appears at the moment of signing. Guests are signing two or three times, so the book is filling with duplicates.',
  lesson: [
    'Server Actions are functions marked `"use server"` that the client can invoke like a remote procedure call — wire one to `<form action={...}>` and Next.js handles the POST, runs your function on the server, and even works before hydration. They are the App Router’s built-in mutation path: no API route, no fetch wrapper, typed end to end.',
    'But an action that changes data has *two* jobs, and the second one is easy to forget: after mutating, it must tell Next.js which cached views of the world are now wrong. That’s `revalidatePath("/guestbook")` (or `revalidateTag` if your reads are tagged). When an action revalidates, the same round-trip that ran the mutation streams back the freshly rendered page, and React swaps it in — the list updates the instant the action completes.',
    'Skip revalidation and the mutation still happens — it’s just invisible. Router and server caches keep serving the pre-mutation render until something else forces a refresh, which is why “it shows up after reload” is the signature symptom. Write it as a habit, mutate → revalidate, the same reflex as commit → push: technically two steps, practically one thought.',
  ],
  checks: [
    {
      name: 'The guestbook renders with existing entries',
      run: async (h) => {
        const res = await h.fetchDoc('/lab/08-silent-guestbook');
        h.ok(res.status === 200, `The guestbook returned ${res.status}.`);
        h.ok(res.all('[data-testid="entry"]').length >= 1, 'Expected at least one entry.');
      },
    },
    {
      name: 'Signing saves the note on the server',
      run: async (h) => {
        const message = uniqueMessage();
        const page = await h.open('/lab/08-silent-guestbook');
        await page.type('[data-testid="message-input"]', message);
        await page.click('[data-testid="sign"]');
        await h.pause(1200);
        const res = await h.fetchDoc('/lab/08-silent-guestbook');
        h.ok(
          res.html.includes(message),
          'Signed the book, but even a fresh request afterwards doesn’t contain the note — the action isn’t persisting it.',
        );
      },
    },
    {
      name: 'The new note appears immediately, without a manual reload',
      run: async (h) => {
        const message = uniqueMessage();
        const page = await h.open('/lab/08-silent-guestbook');
        await page.type('[data-testid="message-input"]', message);
        await page.click('[data-testid="sign"]');
        await page.waitFor(
          () => page.all('[data-testid="entry"]').some((el) => (el.textContent ?? '').includes(message)),
          { timeout: 5000 },
        );
      },
    },
  ],
};

export default manifest;
