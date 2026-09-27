# Bugbound Season 2: Claude audit and design ideas

Date: 2026-09-26 · Branch: `main` at `36b0183` · Review only, nothing implemented
Method: dual-agent Impeccable critique (A: design review on Opus 5.5 · B: detector and browser evidence on Sonnet 5), plus my own source review, browser measurements, the Web Interface Guidelines audit and a React best-practices review. This document is spoiler-free: no hint text, no solutions, no planted causes.

## 1. Summary

- **Design health (Nielsen, A): 25/40, Acceptable.** The earlier record said 35/40. The drop comes from two reproduced defects on the core loop, not from a stricter taste bar. See "Score history" below for calibration notes.
- **Technical audit: 14/20, Good.** Contrast, overflow and landmarks are clean. Weak spots are focus handling on Run, the type floor, and color tokens.
- **Deterministic detector: clean** (exit 0 on `src/shell`, `src/app/(game)`, `src/components`, `src/app/layout.tsx`). The browser overlay could not load because the bundled `detect.js` is truncated (a known tool issue).
- **Repository gates, fresh run:** `test:shell` 31/31, `lint:shell`, `typecheck:shell`, `validate:curriculum` (13 incidents, 44 checks, 39 hint tiers), `format:check`: all exit 0. I did not re-run the four Playwright suites, full lint, build or `npm audit`.

**Verdict.** The Investigation Desk is a real capability step past Season 1: a persistent incident rail, an always-visible Concept, a real-route evidence frame, cancellable runs, and honest saved-versus-verified language. But it was built against Season 1's *earlier* redesign. Every signature Season 1 added last week is missing, and in two places Season 2 uses a pattern Season 1 deliberately dropped. **Wider desk, thinner file:** Season 1's notebook remembers what you did; Season 2's desk forgets everything except a binary "saved." The design ideas in section 9 close that gap and fix the top P1 on the way.

## 2. Findings by severity

### P1: fix before the next release

**P1-1. The verify moment happens out of view, and completion is split across three places.**
- At 1440×900 the verification status starts at y=931 and the first result at y=964, below the fold. At 1180×800, results start at y≈976.
- After pressing Run checks, the only visible change in the first viewport is the button label ("Run checks" → "Running..." → "Re-run checks").
- On the passing run, the green completion band is inserted at the top of the page (y≈194), off-screen for someone reading the results. It has no live region, so screen readers hear only the status line.
- The action (Run, in the sticky bar), the verdict (the list below the preview) and the consequence (the band and Next at the top) sit in three places.
- After completion Run stays amber while Next is outlined, so amber no longer marks the next thing to do.
- Evidence: `src/shell/checks/ChecksRunner.tsx:101-124`, `:142-154`; `src/shell/lesson/LevelPage.tsx:66-83`; `src/shell/workspace/workspace.css:457-469`, `:509-515`.
- Fix: design idea 3 (the Closed record plus a workbench bar).

**P1-2. Keyboard focus drops to `<body>` whenever checks run.**
- Reproduced by A and B independently. Pressing Enter on the focused Run button sets `document.activeElement` to BODY for the whole run and afterwards. The next Tab restarts at "Skip to content".
- Cause: `render={<Button disabled={running} />}` natively disables the focused button (`ChecksRunner.tsx:107-113`).
- Season 1 fixed the same defect in `d709706` by using `aria-disabled` plus the existing re-entry guard (`if (active.current) return`).
- Standard: WCAG 2.4.3 Focus Order.

### P2: fix in the next pass

**P2-1. The case file has no memory (family regression).**
- No record of runs, hint tiers opened, dates, or when an incident was completed.
- Register rows say "✓ Saved" with no date and no ID (`LevelMap.tsx:76-93`).
- A returning learner sees the same next-incident band as a first-timer.
- Revisited incidents say "Completion saved" and "Not checked this visit" with nothing else.
- Fix: design ideas 2 and 4.

**P2-2. Type sits below the family's 12px floor, and the scale runs backwards relative to importance.**
- Fifteen shell roles render at 11px. `.register-state` drops to 10px at 420px and below. Locations in `workspace.css`:
  - line 158: season label
  - line 296: nav numerals
  - line 314: sidebar footnote
  - line 335: footer
  - line 359: "Incident" label
  - line 411: BUG-ID caption
  - line 423: "Source files" label
  - lines 496 and 503: route label and address
  - line 545: check state
  - **line 555: check failure messages**
  - line 583: hint numerals
  - line 603: "Concept reference" label
  - line 715: act index
  - line 751: register state
  - lines 941, 958, 984 and 989: narrow-width roles
- The check failure message is the most decision-critical text on the page, and it is 11px monospace. The symptom above it is 16px.
- Contrast is fine everywhere (6.4:1 to 12.6:1, measured). Size is the problem, not color.
- The handoff (question 3) asked this as an open question. DESIGN.md documents the ramp, so this is a design recommendation, not a defect.
- Fix: design idea 5.

**P2-3. The how-to-play guidance is tied to the wrong condition.** *(Conflicts with an owner decision.)*
- At 961–1100px, a developer with a half-screen browser beside their editor is told "Use a desktop to work on the exercises." (`workspace.css:801`).
- Above 1100px, nothing on the page states the loop (edit these files in your editor, let Next.js recompile, run the checks).
- True 200% zoom on a 1440 screen (720 CSS px) also gets the phone treatment.
- Season 1 moved its notice to `(hover: none) and (pointer: coarse), (max-width: 600px)` for this reason, and it states the loop in a first-visit line.
- Tradeoff: fine-pointer tablets around 1024px would lose the notice. Coarse-pointer tablets keep it.

**P2-4. The vocabulary drifts.**
- The unit is called:
  - "incident" (most places)
  - "lesson" (the notice)
  - "exercise" (the notice)
  - "investigation" (LevelMap.tsx:22, :37; LevelPage.tsx:52)
  - "level" (the footer at Workspace.tsx:222 and the root description at layout.tsx:17-21)
- The state is called "Completion saved", "Completed this visit, not saved", "Saved", "This visit", "Open investigation", and "resolve" (only on the locked page, page.tsx:48).
- Season 1 settled this: "incident" is the only name for the unit, and one state word ("Resolved") takes a "not saved yet" qualifier.
- Season 1's notice now reads "Use a desktop to work on the incidents." and "You can still read the register and any open incident here." Season 2 still has the older wording (Workspace.tsx:128-137).

**P2-5. The answer hint opens in one click.**
- "03 Basically the answer" opens directly, and nothing marks tiers opened on earlier visits (`HintBox.tsx:25-37`).
- Season 1 asks for a confirmation the first time the last tier opens, and shows "opened before".
- Needs the hint data from idea 2.

**P2-6. On phones, the Concept comes last.** *(Documented behavior; handoff question 2.)*
- At 390px the Concept starts at y≈1755–1856, after the 350px preview, the checks and the Hints.
- Phones are browse-only, so reading the Concept is the main phone task, yet a phone reader reaches the hints before the teaching.
- Recommendation: at 760px and below, order Report → Concept → Evidence → Hints.

### P3: polish

- **First paint shows every incident locked.** The server HTML renders all five Act 1 entries as locked, including Incident 01, which is always open. The main area shows "Loading progress..." with no gutter (`IncidentNav.tsx:70-90`, `LevelMap.tsx:64-101`, `level/[id]/page.tsx:36-41`, which uses `className="pt-10"` instead of `route-message`). Render an unknown state with no lock mark, and keep 01 as a link.
- **Icons and inert elements.** Completion and lock icons are `<svg aria-label>` with no `role="img"` (`IncidentNav.tsx:79-90`). `aria-disabled` sits on a generic `span`/`div` with no role (`IncidentNav.tsx:108`, `LevelMap.tsx:101`), which is inert for assistive technology.
- **Act heading name.** The act heading's accessible name reads "Act 01Routes & server boundary", with no separator (`LevelMap.tsx:54-57`).
- **Brand link size.** The header brand link is 125×37px at phone widths. Every other header control is 44px (`Workspace.tsx:92`).
- **Duplicate sheet title.** The mobile Sheet says "Incident register" twice in a row: the SheetTitle, then the nav heading link (`Workspace.tsx:84`).
- **Locked-page copy.** It neither names nor links the prerequisite incident (`level/[id]/page.tsx:48`).
- **Concept measure.** About 41 characters per line at 1440px (350px column) and about 37 at 1180px, while the symptom runs about 83. The main teaching text has the narrowest measure. *(Conflicts with an owner decision: the 400px column currently starts at 1600px.)*
- **The register repeats the sidebar.** The same 13 rows and states appear in both, 26 rows in total. The collapsed 64px rail shows only its toggle.
- **Store updates on focus.** The store publishes a new snapshot on every window focus, so every `useProgress` consumer re-renders each time the learner switches back from the editor (`ProgressProvider.tsx:37-41` → `progress-store.ts:35-39`, `:85-92`). It is cheap today, but it matters once a case log adds consumers.
- **Color literals.** `workspace.css` has 45 unique hex literals (54 uses). About 20 of DESIGN.md's named roles exist only as literals, not custom properties.
- **Text-size preferences.** Shell type is px-only, so a browser default-font-size preference doesn't scale it. Browser zoom does, so WCAG 1.4.4 is met. B's "200% text" check changed the root font size, which px text ignores, so it tested less than it appears.
- **Documentation drift:**
  - DESIGN.md:335 and :350 still describe retained `card.tsx` and `badge.tsx`, which were removed.
  - `.impeccable/surfaces/src-shell-levelpage-tsx.md:4-5` still points at pre-move paths.
  - PRODUCT.md "Implementation Constraints" still contains a one-time task instruction ("Keep the preview server running after the redesign…").
  - The critique trend is split: the file move changed the slug from `src-shell-levelpage-tsx` to `src-shell-lesson-levelpage-tsx`.
  - Season 1's `docs/bugbound-season-1.jpg` shows S1 *before* its redesign (green button, side-border card grid), so it's a misleading family reference.

### Not defects

- **Incident 01's checks fail.** This is intended; A's second run showed the expected partial pass.
- **The blue conference site inside the preview** is protected lab styling.
- **The full `lint` and `build` failures** in protected curriculum were recorded historically; I did not re-run them.
- **A cold first run was reset by a page reload.** A saw this once on the dev server (on-demand compilation), and it did not recur. It's worth watching, but it isn't reproduced.

## 3. Recommendations that conflict with owner decisions

| Owner decision | Recommendation | Why | Tradeoff |
|---|---|---|---|
| Desktop notice at ≤1100px or coarse pointer | Coarse pointer, or ≤600–760px, as Season 1 now does; add a desktop loop line | Developers beside an editor are told to use a desktop; wide screens never see the loop | Fine-pointer 1024px tablets lose the notice |
| Concept follows evidence and hints on phones | Report → Concept → Evidence → Hints at ≤760px | Phones are browse-only; the teaching should come first | The phone order no longer mirrors desktop DOM order (use CSS `order` or restructure) |
| Concept is 350px until 1600px | 400px from 1440px | About 41 characters per line for the main teaching text | The investigation column loses 50px at 1440–1599 |
| 11px metadata and 10px narrow state (documented ramp) | 12px floor, simplify first | Evidence text is the smallest text | Some captions must go rather than grow |
| Register opens all acts, rail expanded | Justify the register with the docket, or start the rail collapsed on `/` | 26 duplicate rows | The rail stops being identical on every route |

## 4. Visual identity and family continuity

**Design specificity (A): specific in vocabulary, generic in structure.** The folio, BUG-001, severity, real route frame, Evidence, and act names drawn from Next.js concepts are authored. The composition is the documentation-site default: a nav tree, an article and an aside in graphite and amber. Swap the nouns and it could be a docs site. There is almost no structure that only an investigation would have: no case record, no run timeline, no verdict entry. Geist and Geist Mono are also `create-next-app`'s default pair. That's defensible because the season is about Next.js, but it means the family resemblance rests on amber, graphite and the folio rather than on type.

**What carries over from Season 1:**
- graphite and warm amber
- the amber folio
- ruled rows with no cards
- the single framed preview
- statuses as text plus icon plus color
- saved kept separate from verified
- three hint tiers
- BUG-### (in the report heading only)

**Missing from Season 1's latest version:**
- IDs on register rows
- ledger column heads and per-act counts
- dated "Resolved"
- field notes
- resolution in the log
- a sticky workbench with the last result and Next
- the 12px floor
- the returning-learner hero
- the loop verbs and first-visit line
- Ctrl/⌘+Enter to run checks
- answer-hint confirmation
- focus kept on Run
- Open in editor

**Divergence that is acceptable evolution:**
- Geist in place of Public Sans
- a mono folio in place of the light sans folio
- teal as S2's tool color
- a three-column desk

**Divergence that is regression:**
- the top completion banner (S1 removed it)
- the ≤1100px notice (S1 narrowed its trigger)
- storage words in place of one state word

**What works:**
1. **The live-route evidence frame** (`LevelPage.tsx:99-151`): an address bar, open-in-tab and reload. It is S1's boxed preview advanced into a real tool.
2. **Honest state copy.** "Current source is verified only when you run the checks." "Check run cancelled. No completion was recorded." Recovery is specific to each operation.
3. **Restraint with real structure.** Rules instead of cards; amber for indexing and the primary action, teal for focus and tools, with discipline. The graphite Concept column reads comfortably (12.6:1) without flattening the page.

**What would most improve learning:**
1. A visible verdict next to Run.
2. A case record the learner can return to.
3. Readable failure text.
4. The loop stated on desktop.

These are ideas 3, 2 and 5, plus the loop line.

## 5. Scores

### Design health (Nielsen)

Reviewer A (Opus 5.5).

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 2 | Run results and the completion band are off-screen at 1440×900 |
| 2 | Match to the real world | 3 | Good case vocabulary, but the state uses storage words ("Saved") |
| 3 | User control and freedom | 3 | Cancel and a safe reset exist; the answer tier opens in one click |
| 4 | Consistency and standards | 2 | incident/lesson/exercise/investigation/level; completed/saved/resolve |
| 5 | Error prevention | 2 | Answer tier unguarded; focus lost on Run; "use a desktop" shown at 960px |
| 6 | Recognition over recall | 2 | No record of runs, hints or dates; loop not stated on desktop |
| 7 | Flexibility and efficiency | 2 | No run shortcut; Next not in the sticky bar; the collapsed rail is empty |
| 8 | Aesthetic and minimalist design | 3 | Restrained; the register duplicates the rail |
| 9 | Error recognition and recovery | 3 | Per-check messages and retries, but failure text is 11px |
| 10 | Help and documentation | 3 | Strong Concept; how-to-play hidden on desktop |
| | **Total** | **25/40** | **Acceptable** |

### Technical audit

| # | Dimension | Score | Key finding |
|---|---|---|---|
| 1 | Accessibility | 3 | Focus drops on Run; completion not announced; no contrast failures |
| 2 | Performance | 3 | Lazy lesson loaders and a small catalog; re-render on every focus; production build not measurable |
| 3 | Responsive design | 3 | No overflow at 320–1440; phone order and notice condition questionable |
| 4 | Theming | 2 | 45 unique hex literals; named roles aren't custom properties |
| 5 | Implementation integrity | 3 | Coherent system, detector clean; vocabulary and doc drift |
| | **Total** | **14/20** | **Good** |

### Score history

The earlier 35/40 (Sept 5–6) was recorded under the old slug, before branding and before Season 1's latest changes. Its design-reviewer model isn't recorded. Season 1's audit found scores swung about ±4 by reviewer model. Treat 25 as a new baseline from an Opus reviewer, not as proof that quality fell by 10.

## 6. Personas, cognitive load, emotional journey

**Personas**

- **Jordan (first-timer):**
  - Nothing on the desktop page says to edit the listed files in an editor.
  - Run appears to do nothing at 1440×900.
  - The first failures arrive with no "this is expected, now repair" framing.
  - "Open investigation" is both a button and a status.
  - The answer tier is one click away.
- **Sam (keyboard, screen reader, low vision):**
  - Focus drops to `<body>` on Run.
  - Completion is not announced.
  - "Act 01Routes…" is read as one run-together name.
  - Tabbing from Run passes through the preview iframe's links before reaching the results.
  - At true 200% zoom the sticky header and Evidence bar take about 127px of a 450px viewport, and the phone layout applies.
- **Alex (power user):**
  - No Ctrl/⌘+Enter.
  - No Open in editor.
  - No run history.
  - Next is not in the sticky bar.
  - The collapsed rail offers no index.
- **Returning learner (5 solved last week):**
  - Five undated "Saved" rows.
  - No welcome-back or last-worked context.
  - Hints show no "opened before".
  - A hard reload flashes everything locked, including 01.

**Cognitive load:** 3 of 8 checks failed (moderate).
- Grouping: verdict, consequence and action are split.
- Visual hierarchy: the critical text is the smallest.
- Working memory: no record, and the loop is unstated.

**Emotional journey:**
- Opening a case is a genuine high point.
- The first Run is a valley.
- The completion peak is flat and off-screen.
- The return has no memory.

## 7. Web Interface Guidelines (terse)

```text
src/shell/checks/ChecksRunner.tsx:108 - native disabled on focused button drops focus → aria-disabled + guard
src/shell/checks/ChecksRunner.tsx:96,112 - "..." → "…"
src/shell/checks/LabDataReset.tsx:101 - "Resetting..." → "Resetting…"
src/shell/lesson/LoadedLevel.tsx:51 - "Loading incident..." → "…"
src/shell/workspace/Workspace.tsx:110 - "Loading progress..." → "…"
src/shell/workspace/Workspace.tsx:84 - SheetTitle duplicates the nav heading
src/shell/workspace/Workspace.tsx:92 - brand link 37px tall under the coarse/≤1100 condition (others 44px)
src/shell/workspace/Workspace.tsx:128-137,222 - copy names the unit "exercises"/"lessons"/"levels"
src/shell/workspace/LevelMap.tsx:27 - "Loading progress..." → "…"
src/shell/workspace/LevelMap.tsx:54-57 - act heading name concatenates "Act 01Routes…" (add a separator or sr-only space)
src/shell/workspace/LevelMap.tsx:101 - aria-disabled on generic div (inert)
src/shell/workspace/IncidentNav.tsx:80-89 - svg with aria-label lacks role="img"
src/shell/workspace/IncidentNav.tsx:108 - aria-disabled on generic span (inert)
src/shell/lesson/LevelPage.tsx:66-83 - completion band inserted without a live region
src/shell/lesson/LevelPage.tsx:102 - route <code> lacks translate="no" (source paths have it)
src/app/(game)/level/[id]/page.tsx:38 - loading main lacks the route-message gutter
src/app/(game)/level/[id]/page.tsx:48 - locked copy doesn't name or link the prerequisite
src/app/layout.tsx:17-21 - no theme-color meta; description says "level"/"lesson"
src/shell/workspace/workspace.css - 15 roles at 11px, one at 10px (see P2-2)
src/shell/lesson/SourceFiles.tsx ✓ pass
src/shell/lesson/Prose.tsx ✓ pass
src/shell/lesson/HintBox.tsx ✓ pass (guideline-wise; see P2-5 for the learning-design gap)
```

**Rejected guideline findings:**
- Title Case on buttons: conflicts with the sentence case both seasons use.
- URL state for accordions and collapse: the owner decided these are local and reset with the route.
- Virtualization: there are only 13 rows.

## 8. React and Next.js best-practices review

- **Good:**
  - Literal per-incident `import()` loaders keep executable checks out of the register and the locked routes.
  - The catalog is lightweight.
  - `useSyncExternalStore` for progress.
  - AbortController ownership of runs.
  - No waterfalls on the client paths reviewed.
- **Medium, `rendering-hydration-no-flicker`:** a null progress snapshot renders every incident locked on the server (see P3). Render a neutral unknown state instead.
- **Low, re-renders:** the store publishes on every focus even when nothing changed. Compare the snapshot before notifying, especially before adding a case-log store.
- **Low:** `src/app/(game)/page.tsx` is `'use client'` only to render a client component; that directive is unnecessary.
- **For idea 2:** extend the existing external-store pattern with a versioned, minimal localStorage key (`client-localstorage-schema`) rather than adding React state paths. Format with `Intl.DateTimeFormat` on the client only; the shell already waits for progress, so there is no hydration mismatch.
- **Reliability (handoff question 10):** I reviewed the harness (`harness.ts:196-506`), run ownership, the generations in `progress-store.ts`, and cleanup. There are no new actionable issues beyond the documented limits.

## 9. Design ideas: Season 1 motifs, translated to the desk

The principle: **the family constants are structure and discipline** (a folio, an ID, a ruled record, one state word, the learner's own history, text statuses). **The desk's advance is density and chronology.** The notebook's summary becomes a case log, the ledger becomes a docket, and resolution becomes an entry in the verification record. Amber stays the family constant; teal stays S2's tool color. No cards, banners, shadows or terminal costume.

### Idea 1: Case IDs

**Season 1:** BUG-### on every register row and on the bug report, tying the register to the report.

**Desk translation:** BUG-### becomes the case's file number, shown wherever the case is referenced:
- the case header meta line (`Incident 01` folio + `BUG-001 · File-based Routing · Severity Low · Open`)
- the docket ID column
- case log entries
- the Closed record ("BUG-001 closed today at 14:31")

It moves out of today's hard-to-see 11px caption beside "Incident report".

**Variants:**
- **1a, recommended:** BUG-001 to BUG-013. Identical format to S1, and the number matches the folio.
- **1b:** season-coded BUG-201 to BUG-213. Unique across seasons and implies continuity with S1's numbering, but the folio match is lost ("Incident 01 · BUG-201").

**Cost:** trivial, derived from the incident number.

### Idea 2: Case log from real run and hint data

**Season 1:** "Your field notes", a summary list of check runs (including the resolving run), hints opened by tier, and last worked. Sourced only from local telemetry.

**Desk translation:** a chronological case log. This is the evolution from notebook summary to investigation timeline. It has two parts.

**Case record strip** under the case header (mono, 12px):

```
Opened Sep 24 · 4 runs · Hints 01 02 · Last worked today 14:31
```

Before any activity it reads: "No activity recorded yet. Runs and hints are logged here, in this browser only."

**Case log** in the investigation column, after Verification and before Hints. Newest first, ruled rows. It shows the latest six entries plus "Show full log (N entries)".

```
14:31  Run 4    4 of 4 passed · case closed
14:22  Hint 02  Closer look opened
14:05  Run 2    2 of 4 passed
13:58  Run 1    Cancelled
13:52  Opened   BUG-001
```

**What's recorded:**
- first open
- run finished (passed / total)
- run cancelled
- runner error
- hint tier opened (first time per tier; tier name only)
- closed

Never hint text, source, or anything simulated. That satisfies PRODUCT.md's "no fake telemetry" rule.

**Store:**
- a new additive, versioned key (e.g. `bugbound:s2:caselog:v1`) beside progress
- capped at about 50 events per incident
- the same external-store and cross-tab pattern as progress
- It **survives a progress reset**, as S1's field notes do, and the reset dialog says so.

**It also feeds:**
- the docket's Activity and Status columns
- the returning-learner band
- "opened before" marks and the answer-tier confirmation on hints (fixes P2-5)

**Risk:** a new state path, which needs tests like `progress.test.mjs`.

### Idea 3: Closed, recorded in the verification record (replaces the green band)

**Season 1:**
- The resolving run ends the log with a sage rule, a "Resolved." heading and a record.
- The page scrolls to it and focuses it.
- Later visits show a standing note.
- Next lives in the workbench; there is no banner.

**Desk translation:** "Verification" becomes the **verification record**.
- Each run is an entry, with its number, time and result above its check rows.
- Earlier runs from this visit fold into a muted list.
- The run that first passes everything appends a **Closed** entry:

```
────────────────────────────────────────  (sage rule)
Closed
BUG-001 closed today at 14:31 on run 4, after 2 hints. Saved in this browser.
A new run checks the source as it is now. It never reopens the case.
```

**Header:** "Open investigation" becomes "Closed · Sep 26", the one state mark outside the record. The green `.completion-record` band is removed.

**The sticky Evidence bar becomes the desk's workbench:**
- **Left:** the latest verdict as a jump link: "Not run this visit" / "Running check 2 of 4…" / "Run 3 · 2 of 4 passed".
- **Right:** Run checks, amber while the case is open. Once it is closed: Run again (outline) plus **Next incident (amber)**. If a later run fails, amber moves back to Run.

**It fixes:**
- P1-1: the verdict sits beside Run, and the page scrolls and focuses to the Closed entry.
- The amber rule.
- The silent completion (polite live region).
- P1-2 naturally (Run becomes `aria-disabled`).

**It keeps:**
- saved versus verified
- the "not saved yet" qualifier
- the existing recovery band

**State word:** **"Closed"** pairs with "Open" and is desk vocabulary. **"Resolved"** is Season 1's exact word. Either way, use one word everywhere: header, record, docket, sidebar marks.

### Idea 4: Docket-style register

**Season 1:** a ledger with column heads, BUG IDs, dated Resolved, "Opens after NN", per-act counts, a returning-learner hero, and a season record.

**Desk translation:** a docket, the desk's case list. It adds the one column S1 couldn't have: real severity. The spread is 2 Low, 4 Medium, 6 High and 1 Critical, and it escalates across acts.

**"On the desk" band** at the top:
- **First visit:** "First case · BUG-001 The Vanishing Venue", with the loop line (Reproduce in the live route · Repair in your editor · Verify with the checks) and Start.
- **Returning:** the current case with its record ("4 runs · Hints 01 02 · Last worked Tuesday") and Continue.
- **Season complete:** the season record (13 closed · Sep 12–Sep 26 · 61 runs · 9 hints).

**Per act:** "Act I · Routes & server boundary · 1 of 5 closed", then a table:

```
Case     Incident              Concept                     Severity  Activity          Status
BUG-001  The Vanishing Venue   File-based Routing          Low       4 runs · 2 hints  Closed Sep 26
BUG-002  The Forgetful Cart    next/link & Client Nav…     Low       —                 Open
BUG-003  Dead on Arrival       The "use client" Boundary   Medium    —                 Opens after 02
```

**Table details:**
- A real `<table>` with column headers: S2's "more tooling" step, navigable by screen-reader table commands.
- Each row links through its title cell.
- At ≤760px it reflows to stacked rows.

**What it solves:** the page earns its place next to the sidebar, fixing the 26 duplicate rows. Optionally, start the rail collapsed on `/` and make the collapsed rail a numeral index with state marks.

**Data:**
- catalog: ID and severity
- progress: closed
- case log: dates and activity

Without idea 2, Status can only say an undated "Closed".

### Idea 5: The type floor

**Season 1:** no shell text below 12px at any width.

**Desk translation:** the same 12px floor, used as a *simplification* pass rather than an enlargement.

- **Raise:**
  - nav numerals, check state, route address, "Source files", "Concept reference", act index and footer to 12px
  - register state to 12px at every width
  - **check failure messages to 13px mono at 1.6 leading** (evidence outranks metadata)
- **Remove rather than enlarge:**
  - the sidebar footnote ("Next.js App Router / 13 incidents / 3 acts" repeats the header and register)
  - the "Optional guidance" caption
  - the report-heading ID caption (it moves to the header via idea 1)
- **Consolidate:** about 20 size roles into seven steps: **12 · 13 · 14 · 16 · 22 · 30 · 42**. Update DESIGN.md, and retire the 10px `compact-state` and 11px `metadata` roles.
- **Check:** act names already fit on one line at 12px in the 260px rail, so nav titles stay at 12.

**Cost:** mostly CSS, low risk. It pairs naturally with turning the 45 hex literals into named custom properties.

### Also worth considering (outside the five)

- **Desktop loop line:** a one-time first-visit line in the case header with the loop verbs. It fixes P2-3's "loop never stated above 1100px" without a new surface.
- **Answer-tier confirmation and "opened before" marks** on hints, built on idea 2.
- **Ctrl/⌘+Enter** to run checks, advertised with a `kbd` element, as S1 does.

### Recommended order

- **Build order:**
  1. Idea 5 with idea 1 (a cheap system baseline)
  2. The idea 2 store (the foundation)
  3. Idea 3 (the biggest learning win; fixes both P1s)
  4. Idea 4 (needs idea 2's dates)
- **Mock up first:** 3 and 4, which are the most visible. Ideas 1, 2 and 5 appear inside both mockups.

## 10. Answers to the handoff's twelve questions

| # | Question | Answer |
|---|---|---|
| 1 | Advance from S1? Recognizable beyond color? | Yes in capability. Behind S1's newest record and ledger signatures. Recognizable through the folio, ID, ruled rows and framed preview, not only color, but the structure is docs-default. There is ample room left for Season 3. |
| 2 | Concept balance at 1100–1200; mobile distance | Workable but tight: about 37 characters per line at 1180, with about 566px for the investigation. Mobile is too distant (y≈1755–1856, after hints). Reorder at ≤760. |
| 3 | 11–12px roles | Contrast passes (6.4:1 and up); size does not serve failure detail. Adopt the 12px floor and simplify first (idea 5). |
| 4 | Register heading as title and link; accordion defaults | It reads as both, and aria-current plus hover work. Accordion defaults are predictable. The local collapse is fine, but the collapsed rail is empty. |
| 5 | Rail, header, Evidence bar at larger text and long titles | The sticky gap is 0 at every tested width, and the header uses `min-height`. True 200% zoom falls into the phone layout. Px-only type ignores text-size preferences. |
| 6 | Single report/Evidence rule; feedback noise | The single rule is clear. Copy, cancel and failure feedback are good. The completion transition is the weak point (P1-1). |
| 7 | Graphite Concept; amber and teal roles | Comfortable (12.6:1) and distinct from the work surface. Roles are clear, except that amber stays on Run after completion. |
| 8 | Mark and favicon legibility | The header mark renders cleanly at 32px beside the wordmark. The favicon across browser themes was not re-tested; the historical branding suite covers it. |
| 9 | Historical vs current vs unsaved, understood? | Distinct and honestly worded, but phrased as storage ("Saved", "This visit"). One state word plus a qualifier would read as case state. |
| 10 | Readiness, run ownership, generations, cleanup | No new actionable issues within the documented limits. A dev-server first-run reset was seen once and is not reproduced. |
| 11 | Folder structure proportionate? | Yes. The generated loaders are explicit and statically analyzable, and the phase 2 browser suite guards against eager imports. |
| 12 | Records to reconcile | DESIGN.md:335/350; the surface brief paths; the PRODUCT.md task line; the split critique slug; S1's pre-redesign `docs/bugbound-season-1.jpg`. |

## 11. Provocative questions

1. If this is an investigation desk, where is the case history? Would a visible record do more for "S2 as S1's successor" than any visual change?
2. Should the sticky Evidence bar become the workbench (verdict, Run, Next) and completion an entry in the record, never a banner?
3. Is the 260px rail earning its width on the register, where it duplicates the page, and when collapsed, where it shows nothing?
4. Is a developer with a 960px browser beside their editor "not on a desktop"?
5. Geist is the Next.js default. Is that the right voice for the desk, or should the mono (IDs, the log, timestamps) carry more of the identity?

## 12. Run notes

- **Critique target:** `src/shell/lesson/LevelPage.tsx`, slug `src-shell-lesson-levelpage-tsx` (new; earlier runs are under `src-shell-levelpage-tsx`). No ignore list exists.
- **Assessment independence:** A and B ran as separate sub-agents in their own tabs and did not see each other's output.
- **CLI detector:** exit 0, no findings. It was sanity-checked against a synthetic file and fires correctly there. URL mode timed out after 30s.
- **Overlay:** the injection preflight succeeded, and the live server started and was stopped. `detect.js` came back truncated (`ERR_CONNECTION_RESET`; 2,154,240 of 2,218,045 bytes), so no user-visible overlay exists. I removed the leftover `.impeccable/live/` state.
- **Browser state:**
  - Hints were never expanded.
  - Reset confirmations were never clicked.
  - A seeded completion for 01 only and removed it; I verified that no `bugbound` keys remain.
  - Viewports were reset and tabs closed.
- **Season 1:** I started a temporary dev server on :5173 for a side-by-side view, then stopped it.
- **Files touched:**
  - `.claude/launch.json` (review server config; **untracked, not gitignored**)
  - this report
  - the critique snapshot in `.impeccable/critique/`

  Nothing was committed.
