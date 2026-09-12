# 🐛 Bugbound — Season 2: The Next.js Edition

> **Learn Next.js by fixing it.** A level-based debugging game where every lesson ships with a real, intentionally planted bug in a real App Router route — and you're the engineer on call. Again.

Season 2 is the sibling of [Bugbound Season 1](https://github.com/Brantley-Wyche/React-Practice-Site) (core React + TypeScript). Same game, new territory: **13 escalating levels** of Next.js App Router failure modes — routing, the server/client boundary, hydration, caching, Server Actions, streaming, route handlers, metadata, and the proxy — each one modeled on bugs you'll actually meet in production.

No embedded editor, no sandbox. You read a QA ticket, open the file in your own editor, fix the code, watch HMR reload it, and run the in-app checks. All green → next level unlocks.

## What's different from Season 1

Season 1's checks mounted components client-side. That can't exercise a server. Season 2's levels are **real routes** served by the real Next.js dev server, under `/lab/…`, and the check harness works like an engineer verifying a fix:

- it **fetches the route's server-rendered HTML** and asserts on what actually left the server (what crawlers see, what caching served, where redirects landed);
- it **drives the live, hydrated page** in an isolated frame — real clicks, real typing, real navigations;
- it **reads the console** the way you would, including React's hydration complaints.

So when a check says the server never sent your data, it's because it fetched the route and looked.

The design system evolved with the player, too: Season 2 uses **Tailwind CSS v4 + coss UI (Base UI)** for its Investigation Desk. An incident rail, working evidence area, and expanded Concept reference replace the original console cards. The shell uses the actual coss button, toolbar, tooltip, accordion, sheet, and alert-dialog components, installed through the shadcn registry.

## How it works

| Part | What it does |
|---|---|
| 📘 **Concept** | A short lesson on one App Router idea (the `"use client"` boundary, the Data Cache, streaming, …) |
| 🐛 **Bug report** | The observable symptom, QA-ticket style, plus where to look. Early levels name exact files; later ones point at a folder |
| 🔬 **Live preview** | The actual route, embedded — the same URL the checks hit. Open it in its own tab too |
| ✅ **Checks** | Executable spec: fails against the planted bug, passes after any reasonable fix |

Progress lives in `localStorage`. Three escalating hints per level are stored **base64-encoded** and remain concealed until you choose to reveal them. [SOLUTIONS.md](SOLUTIONS.md) is encoded too.

## The curriculum

**Act I — Routes & the Server Boundary:** file-based routing & layouts · `next/link` & client navigation · the `"use client"` boundary · server-side data fetching · hydration

**Act II — Data, Caching & Mutations:** dynamic routes & async params · the Data Cache · Server Actions & revalidation · streaming & parallel data · route handlers

**Act III — Platform & the Capstone:** metadata & SEO · the proxy (middleware) · a multi-bug launch-day capstone

Difficulty ramps two ways: the concepts get more advanced, *and* the bugs get better at hiding.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000, start Level 01, and keep your editor open next to the browser.

## House rules

- **Don't edit `src/shell/` or `src/app/(game)/`** — that's the game itself, and it's bug-free. All planted bugs live under `src/app/lab/`, `src/levels/`, and (when a level says so) `src/proxy.ts`.
- **Don't remove `data-testid` attributes or edit the `checks` in a level's `manifest.ts`** — they're the executable spec. *Reading* them when stuck is fair game; that's what reading a failing test at work is.
- The dev server is part of the game: watch its terminal output and the browser console — Next.js tells you more than you'd think.
- If a fix doesn't seem to register, refresh the browser tab and re-run the checks. A few levels keep in-memory data on the dev server; restarting `npm run dev` resets that data (never your progress).
- **Keep `main` pristine — it's the game cartridge.** Play on your own branch:

  ```bash
  git checkout -b playthrough
  ```

  Your commits become a record of what you learned, and `main` always holds the original buggy state — `git restore --source=main src/app/lab/06-lost-in-the-params/` resets a single level, and switching back to `main` resets the whole game.
- Using an AI assistant? Ask it to **coach, not solve** — it should read `AGENTS.md` and respect blind mode.

## Tech notes

### Shell verification

With Node.js 22.18+ (or Node.js 24), run `npm run test:shell`, `npm run lint:shell`,
and `npm run typecheck:shell` to verify the game engine independently of planted
lesson failures. On Windows PowerShell, use `npm.cmd` for these commands.
The shell typecheck includes imported curriculum contracts, but excludes Next.js
generated lab-route validators. Full lint, typecheck, and build can still fail on
intentional exercise content; do not suppress those failures to make a gate green.

Checks are cancelled when leaving a lesson or resetting progress, and each check
has a 60-second asynchronous deadline. Frames isolate client lifecycles, not server
module state or synchronous infinite loops. Requests already received by the server
may finish after cancellation.

Saved completion is an earned milestone, separate from the last check run. Failed
saves remain available for this visit with an explicit retry. Progress synchronizes
between tabs using additive completion records and reset generations; older records
are retained but ignored after a reset.

### Browser verification

`npm run test:browser` exercises the shell in an isolated headless Edge context
against an already-running dev server. Playwright is a local development dependency;
these scripts use installed Microsoft Edge, so no Playwright browser download is
required on the supported Windows setup. `TEST_BASE_URL` defaults to
`http://127.0.0.1:3002`. Run `npm run test:browser:refinements` for the sidebar and
spacing regressions, and `npm run test:browser:phase2` for readiness, lazy loading,
and lab-reset controls. The latter uses synthetic lab documents and a mocked reset
transport; it does not clear the real dev server's inventory.
It checks responsive layouts, notice visibility, button overflow, navigation,
reset dismissal, hints, copy feedback, cancellation, and the original failing
exercise. Screenshots and evidence are written under `.impeccable/review/` after
the interactions finish, so file watchers cannot interrupt the test run.

The local review uses `npm.cmd run dev:review`. Both development scripts bind to
127.0.0.1; do not publish or tunnel this intentionally buggy teaching app.
On Windows installations whose managed
certificate is trusted by the system but not Node, command-scoped
`NODE_OPTIONS=--use-system-ca` allows Next.js font downloads without disabling TLS.

- **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + coss UI.** The in-app harness (`src/shell/checks/harness.ts`) uses `fetch` + `DOMParser` for server output and a hidden same-origin iframe with native-setter events for live-page checks. Shell regression tests use Node's built-in test runner.
- The game shell uses the design system; the lab (`/lab` routes, the "product under test") deliberately keeps its own small stylesheet, so level code stays framework-light and editable without knowing Tailwind.
- A shell-owned lab layout (`src/app/lab/layout.tsx`) captures `console.error` *before* React hydrates, so checks can assert on hydration health.
- **`reactStrictMode` remains off to preserve the lab runtime.** Season 2 checks do not count renders or effect firings. A global change needs a complete curriculum compatibility run; Season 1's rationale alone is not evidence that this setting is required here.
- The game is played against `next dev`. That's intentional: dev-server behavior (HMR, per-request rendering, the error overlay) is part of what's being taught.

## Source Ownership

| Path | Responsibility |
| --- | --- |
| `src/app/(game)/` | Game routes and provider composition |
| `src/shell/workspace/` | Workspace frame, incident navigation, register, and shell stylesheet |
| `src/shell/lesson/` | Lesson loading, incident document, hints, and source-file controls |
| `src/shell/checks/` | Verification runner, disposable lab harness, and fixture-reset controls/validation |
| `src/shell/progress/` | Progress provider and persistence store |
| `src/shell/types.ts`, `src/shell/LabBeacon.tsx` | Stable curriculum types and lab readiness boundary |
| `src/levels/generated/` | Generated catalog and explicit lazy loaders; regenerate instead of editing |
| `src/levels/<incident>/` | One manifest per incident; checks are the executable curriculum spec |
| `src/levels/index.ts`, `src/levels/progression.ts` | Public catalog and pure progression rules |
| `src/app/lab/`, `src/proxy.ts` | Protected learning exercises; planted bugs are intentional |
| `src/components/ui/`, `src/lib/` | Shared UI primitives and utilities |
| `tests/`, `tests/browser/` | Shell regressions and browser verification |
| `scripts/` | Curriculum generation/validation and shell formatting |

## Maintenance Contracts

Use `npm ci` with the committed lockfile; `.node-version` records the validated Node
runtime. On Windows PowerShell, use `npm.cmd` for all commands above.
`npm run validate:curriculum` checks 13 incident contracts, source references, and
encoded hint shapes without running checks or decoding hints. After intentionally
editing manifest metadata, run `npm run curriculum:generate` to refresh the lightweight
catalog and explicit lazy loaders in `src/levels/generated/`. Do not hand-edit these generated files.
`npm run format:shell` and `npm run format:check` cover only the game shell, not labs.

Launch Day has an explicit **Reset lab data** control in development. Confirmation
restores mock inventory and clears mock orders; it never edits source or progress.
Fixtures and cookies are shared across tabs: stop other lab activity before resetting
or running mutation checks. The order check compares fresh before/after totals, not
a unique operation receipt, so overlapping orders can confound that measurement.
Reset progress is a different operation and does not reset server fixtures.

Readiness failures identify unavailable navigation, hydration, or console capture.
The layout beacon is not proof that streamed content has arrived; individual checks
still wait for the state they inspect. Registered cookie cleanup is attempted after
success, failure, or cancellation, with a three-second request deadline. Cancellation
does not roll back accepted server mutations; interrupted navigation may leave an
in-flight server request. This is lifecycle isolation, not a security sandbox.

## Roadmap

- **Season 1** — Core React + TypeScript, 15 levels ([here](https://github.com/Brantley-Wyche/React-Practice-Site))
- **Season 2** *(this repo)* — Next.js App Router, 13 levels
- **Season 3** — Bring-your-own-agent: your AI coding agent generates fresh, personalized levels via a bundled skill

## Credits

Game shell, levels, lessons, and every planted bug authored by Claude (Anthropic), designed collaboratively as a learning project. The bugs are modeled on real-world Next.js failure modes you'll meet on the job.
