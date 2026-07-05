import type { LevelManifest } from '@/shell/types';

const manifest: LevelManifest = {
  id: '11-untitled-document',
  number: 11,
  title: 'Untitled Document',
  concept: 'Metadata & SEO',
  severity: 'High',
  route: '/lab/11-untitled-document',
  files: [
    'src/app/lab/11-untitled-document/page.tsx',
    'src/app/lab/11-untitled-document/CtaButton.tsx',
  ],
  symptom:
    'Marketing is unhappy: the Northwind landing page’s browser tab shows the site-wide default title instead of the product’s name, and link previews on social are generic too. The engineer who touched it last swears the title and description are “right there in the page file” — and honestly, looking at the file, the content really is there.',
  lesson: [
    'SEO metadata in the App Router is declarative: a page or layout exports `metadata` (or `generateMetadata` for dynamic values) and Next.js renders the `<title>`, description, and Open Graph tags into the document `<head>` on the server. That server part is the point — crawlers and link unfurlers read the raw HTML, so metadata has to exist *before* any client JavaScript runs. Layouts provide defaults; pages override them; the deepest definition wins.',
    'Like `page.tsx` and `GET`, this API is a *naming contract*. Next.js discovers metadata by looking for an export with exactly the name `metadata` (or the function `generateMetadata`). It does not scan your file for title-shaped objects — an export with any other name is just an ordinary constant that nobody reads. No error, no warning: the framework simply never finds what it wasn’t asked to look for, and the parent layout’s defaults quietly apply.',
    'This class of bug — everything correct except an identifier the framework dispatches on — is endemic to convention-based frameworks, and it produces the most gaslighting symptom in the business: “the code is right there.” So make the convention check step one, not step five: when a framework feature silently doesn’t engage, diff your names against the documented ones character by character. (Also worth knowing: metadata must live in Server Components — a `"use client"` file can’t export it at all.)',
  ],
  checks: [
    {
      name: 'The landing page is up',
      run: async (h) => {
        const res = await h.fetchDoc('/lab/11-untitled-document');
        h.ok(
          res.status === 200,
          `The landing page returned ${res.status} — the route is erroring.`,
        );
        res.get('[data-testid="hero-title"]');
      },
    },
    {
      name: 'The tab title is set for SEO',
      run: async (h) => {
        const res = await h.fetchDoc('/lab/11-untitled-document');
        const title = res.title();
        h.ok(
          title === 'Northwind Analytics — See your data clearly',
          `Expected the document title to be "Northwind Analytics — See your data clearly" but the server HTML has "${title}".`,
        );
      },
    },
    {
      name: 'The early-access CTA still works',
      run: async (h) => {
        const page = await h.open('/lab/11-untitled-document');
        await page.click('[data-testid="cta"]');
        await page.waitFor('[data-testid="cta-confirm"]', { timeout: 2500 });
      },
    },
  ],
};

export default manifest;
