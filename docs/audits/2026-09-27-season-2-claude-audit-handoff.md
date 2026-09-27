# Season 2 audit and desk build: handoff for the Season 3 audit

Dates: 2026-09-26 to 2026-09-27 · Branch: `main` · Auditor: Claude Code (Opus 5.5, with Sonnet 5 sub-agents)
Starting point: `36b0183` (after Codex's redesign; Codex's audit handoff is `docs/bugbound-season-2-audit-handoff.md`, untracked in the owner's working copy)
End point: the commit that adds this file. The shell changes are `a404111` through `d187812`.

This document is spoiler-free. It does not contain hint text, lesson solutions or planted causes.

## 1. What was asked

1. Audit the Investigation Desk against Codex's handoff and the AGENTS.md frontend workflow (`$impeccable`, `$vercel-react-best-practices`, `$web-design-guidelines`), with no implementation until the owner chose next steps. The report is `docs/audits/2026-09-26-season-2-claude-audit.md`.
2. Make Season 2 read as a natural evolution of Season 1's Field Notebook, translating its motifs into desk equivalents: case IDs, a case log from real data, resolution recorded in the verification record, a docket-style register, and the 12px type floor.
3. For each idea the owner picked: a static mockup on a claude.ai Design canvas, owner approval, then the build.

All five ideas are built. The owner also asked for named color tokens, a cross-season `FAMILY.md` (identical in all three repos) and a Bugbound design system on claude.ai.

## 2. Contracts preserved (verify these first in Season 3)

- Nothing under `src/app/lab/**` or `src/proxy.ts` was touched. Manifests, checks, `data-testid`s and `hints.json` are unchanged.
- No hint was opened to test anything. Hint and run history were seeded in localStorage instead.
- No incident was solved. The closing-run moment (see section 7) was left for the player to see.
- The owner authorized shell work on `main`. Player fixes still belong on `playthrough`.
- Controls stay coss UI on Base UI. No new component library or dependency was added.
- Page content has no cards, shadows or banners. The only framed element is the live route.

## 3. Commits in order

| Commit | Summary |
|---|---|
| `a404111` | **Quick accessibility pass.** Run checks keeps keyboard focus during a run. Standalone state marks are `role="img"`. Locked rows are no longer inert `aria-disabled` spans. The act heading's accessible name has its separator. First paint no longer shows every incident locked. The desktop notice is touch-only: at 760px and below, or with a coarse pointer. |
| `36b1108` | **Closed record and desk enhancements.** Verification is now a sticky **workbench** (verdict, Run, Next) and the close is an entry in the verification record, replacing the green completion band. The close time and run number are stored beside the saved flag. Also adds: named `--desk-*` color tokens, a 13-mark header progress strip, the case **record row** (Case `BUG-###`, Concept, Severity, Status), a numbered collapsed rail, Source Serif 4 for Concept prose, and one authored motion (the sage rule drawing across on close). The vocabulary becomes "incident" and "Closed" everywhere. |
| `a56f101` | The audit report, the critique snapshot and `FAMILY.md`. |
| `7dc53f7` | **The 12px floor.** No shell text is below 12px at any width. It was done by simplifying first (the sidebar footnote was removed) rather than only enlarging. |
| `b6d2fff` | **Case log.** A per-incident history in this browser: first visit, every run (numbered across all visits), each hint tier the first time it opens (the tier number only), and resets. It survives a progress reset. The record row gains Runs, Hints opened and Last worked. |
| `d187812` | **Docket register.** The register leads with the incident on the desk, drawn like its case header, with Start or Continue. It becomes a season record once everything is closed. Each act is a real table: Case, Incident, Concept, Severity, Activity and dated Status. The rail starts collapsed on the register, and a note marks a reset until the next close. |

## 4. Files added to the shell

- `src/shell/format.ts`: `formatTime`, `formatDay` ("today", "Sep 24", or with the year), `bugId`, `folio`, all through `Intl`.
- `src/shell/progress/case-log.ts`: the case log store (`useSyncExternalStore`), plus `summarize` (runs, hint tiers, last worked), `latestReset` and `entriesFor`.
- `src/shell/lesson/CaseLog.tsx`: the log section on the incident page.
- `src/shell/lesson/CaseRecord.tsx`: the record row, shared by the incident page and the register.
- Tests: `tests/case-log.test.mjs`. The shell suite is **44 tests**, all passing.
- **Storage:** progress keys are generation-scoped (`bugbound:s2:progress:v2:done:<gen>:<id>`, and `…closed:<gen>:<id>` holding `{at, run}`). Case logs are not generation-scoped (`bugbound:s2:log:v1:<id>` holding `{runs, events}`, capped at 50 events, plus `bugbound:s2:log:v1:resets`), which is why they outlive a reset.

## 5. Verification method (repeatable)

- **Repository checks:** `npm run lint:shell`, `typecheck:shell`, `test:shell`, `format:check` and `validate:curriculum`. Format with `npm run format:shell`; plain `npx prettier` switches the repo's single quotes to double quotes.
- **Browser suites:** `test:browser`, `test:browser:refinements`, `test:browser:phase2` and `test:browser:branding` (Playwright on Edge). They expect the review server (`npm run dev:review`, `127.0.0.1:3002`), and they rewrite the PNG evidence in `.impeccable/review/`.
- **Fonts in dev:** the review server needs `NODE_OPTIONS=--use-system-ca`, and a cleared `.next` if a Google font download failed earlier. Without them it silently renders fallback fonts.
- **States without spoilers:** seed the progress and log keys above in localStorage to get returning, after-reset and season-complete states. A real **Reset progress** on seeded data is safe. Clear the `bugbound*` keys afterwards.
- **Viewports:** desktop at 1440 and 1280 (rail open and closed), tablet at 1024 and 768, and phone at 390, 375 and 320 for overflow only.
- **Detector:** `impeccable detect --json <files>`. Its only remaining note is an advisory on the header strip's 1px mark radius.
- **Dev quirk:** the first visit to a newly compiled route does a full page reload, which resets in-memory state such as the rail choice once. Client navigation afterwards keeps it.

## 6. Critique and scores

- The audit baseline was **25/40** (Nielsen, Opus reviewer) and **14/20** on the technical audit. An earlier 35/40 was recorded under an old slug before branding. As in Season 1, scores swing with the reviewer model, so 25 is a new baseline, not a regression.
- Following Season 1's advice, there was one critique at the start and no scored rounds per fix. **Season 2 has not been re-scored since the build.** If the Season 3 audit wants a family comparison, one post-build critique of Season 2 would give it a fair number.

## 7. Open items (known, not done)

**Declined or deferred by the owner:**
- The phone reading order stays Report → Evidence → Hints → Concept, and the Concept column stays 350px until 1600px.
- The answer-tier confirmation and "opened before" hint marks are out of scope for now. The case log already has the data for them.
- **Phones and tablets are low priority.** The project can't be worked on there. Keep the notice and avoid horizontal overflow; skip phone-only polish.

**Not done (P3):**
- The header brand link is about 37px tall on phones. Every other header control is 44px.
- The mobile navigation sheet says "Incident register" twice in a row.
- The progress store republishes on every window focus, so every consumer re-renders when the learner returns from the editor.
- Shell type is px-only, so a browser default-font-size preference doesn't scale it (zoom does).
- `PRODUCT.md` still carries a one-time instruction ("Keep the preview server running after the redesign…").
- There's no Ctrl/⌘+Enter shortcut for Run checks (Season 1 has one).
- Retired `completion-*` tokens remain in the claude.ai design system, awaiting the owner's OK to delete.
- Season 1's `docs/bugbound-season-1.jpg` shows Season 1 before its redesign, so it's a misleading family reference.

**Not verified:**
- The closing-run moment live (focus on the Closed heading, the scroll, the rule drawing across). It needs an incident solved.
- Safari and Firefox. The docket's explicit ARIA table roles exist mainly for Safari.
- Screen-reader speech, real touch devices, and text-size preferences.

## 8. Mockups and the design system

All private to the owner until shared:
- [Closed record and workbench](https://claude.ai/artifact/NnBvqK9yg2iqxBWpeKVr3m)
- [Desk enhancements](https://claude.ai/artifact/TBnwvSeVFsqPAN4mEpdCiJ) (header strip, record row, numbered rail, Concept face, closing moment)
- [Case log](https://claude.ai/artifact/J6TFkKFBBKu1XNp14QQSQE)
- [Docket register](https://claude.ai/artifact/Mt65fUZJk9uycDNKthkVUj)
- [Bugbound Investigation Desk design system](https://claude.ai/artifact/Qyi7UsdUAehxEuL1hdGwUP): tokens and a pattern book built from `DESIGN.md`. It is Season 2's system, not a family system.

The canvases were drawn with the design system installed, used placeholders for check names and failure text, and skipped a label above a heading (Impeccable's craft floor bans it).

## 9. Guidance for Season 3's design

Season 3 is the Engineering Lab. `FAMILY.md` lists the constants every season keeps; this section names what now carries Season 2's identity, so the audit can judge what Season 3 inherits, translates or leaves behind.

What carries the desk:
- The folio beside the headline, and the ruled **record row** under it.
- Text statuses, with one finished word ("Closed") and one qualifier ("not saved yet").
- The **workbench** and the **Closed entry** in the verification record (resolution recorded, never a banner).
- The **case log**: the learner's own history, from real events only.
- The **docket**: the register as tables with IDs, severity, activity and dated status.
- The numbered collapsed rail and the header progress strip.
- The single framed live route.

Season 1 → Season 2 moved from *notebook* to *case file*: more density, more tooling, and the learner's record kept prominent. A natural Season 3 step is the *lab*: instruments and measurements rather than more records. It should keep the constants and the learner's history, not add costume.

The owner's process worked well and is worth repeating:
1. Audit (no edits).
2. Design ideas that translate the previous season's motifs.
3. Static mockups on a Design canvas with that season's design system installed.
4. Owner approval.
5. Build with the full gate set and browser QA.

The owner rejects costume: for the desk that meant typewriter faces, stamps, paper textures and redaction bars. Blind mode applies to mockups and docs as much as to the interface.
