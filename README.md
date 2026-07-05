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

## How it works

| Part | What it does |
|---|---|
| 📘 **Concept** | A short lesson on one App Router idea (the `"use client"` boundary, the Data Cache, streaming, …) |
| 🐛 **Bug report** | The observable symptom, QA-ticket style, plus where to look. Early levels name exact files; later ones point at a folder |
| 🔬 **Live preview** | The actual route, embedded — the same URL the checks hit. Open it in its own tab too |
| ✅ **Checks** | Executable spec: fails against the planted bug, passes after any reasonable fix |

Progress lives in `localStorage`. Three escalating hints per level are stored **base64-encoded** (decoded only when you click reveal), and [SOLUTIONS.md](SOLUTIONS.md) is encoded too — you can't spoil yourself by accident.

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

- **Next.js 16 (App Router, Turbopack) + React 19 + TypeScript + plain CSS.** No test framework: the harness (`src/shell/harness.ts`) uses `fetch` + `DOMParser` for server output and a hidden same-origin iframe with native-setter events for live-page checks.
- A shell-owned lab layout (`src/app/lab/layout.tsx`) captures `console.error` *before* React hydrates, so checks can assert on hydration health.
- **`reactStrictMode` is off, deliberately** — StrictMode double-invokes renders and effects in dev, which would make honest checks lie.
- The game is played against `next dev`. That's intentional: dev-server behavior (HMR, per-request rendering, the error overlay) is part of what's being taught.

## Roadmap

- **Season 1** — Core React + TypeScript, 15 levels ([here](https://github.com/Brantley-Wyche/React-Practice-Site))
- **Season 2** *(this repo)* — Next.js App Router, 13 levels
- **Season 3** — Bring-your-own-agent: your AI coding agent generates fresh, personalized levels via a bundled skill

## Credits

Game shell, levels, lessons, and every planted bug authored by Claude (Anthropic), designed collaboratively as a learning project. The bugs are modeled on real-world Next.js failure modes you'll meet on the job.
