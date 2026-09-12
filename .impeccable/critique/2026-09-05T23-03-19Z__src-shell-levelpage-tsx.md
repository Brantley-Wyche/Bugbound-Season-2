---
target: Bugbound Season 2 frontend audit and critique
total_score: 21
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 3
timestamp: 2026-09-05T23-03-19Z
slug: src-shell-levelpage-tsx
---
Method: dual-agent (A: /root/critique_design; B: /root/critique_evidence), with parent responsive and lifecycle verification.

# Bugbound Season 2: Design Critique

Target: `src/shell/LevelPage.tsx`, supported by the map, game chrome, UI primitives, and root styles. Mode: Operate with substantial Read content. Date: 2026-09-05. Status: review only; no redesign approved or implemented.

## Design Specificity Verdict

The incident vocabulary is specific to Bugbound, but the composition is still interchangeable with a dark developer dashboard. Equal card columns, repeated side stripes, small uppercase monospace labels, blue badges, and familiar console colors make the generic structure more prominent than the learning experience. The greatest opportunity is to let investigating a real Next.js route determine the hierarchy.

The deterministic scan returned zero findings (`[]`, exit 0). That does not contradict the manual findings: state semantics, contrast, working hierarchy, and phone reflow were established through source and browser evidence outside the detector's coverage. No detector false positives were reported. No injected overlay is available because the exposed browser evaluation API is read-only.

## Design Health

| # | Heuristic | Score / 4 | Key issue |
|---|---|---:|---|
| 1 | Visibility of system status | 2 | Saved completion masquerades as current verification; save status is absent |
| 2 | Match with the real world | 3 | Incident vocabulary fits, but theory arrives before the report |
| 3 | User control and freedom | 2 | Back/reload/reset exist, but active checks have no cancellation ownership |
| 4 | Consistency and standards | 3 | Coherent primitives, with button-based navigation and redundant metadata |
| 5 | Error prevention | 2 | Reset confirmation and hint boundaries help; stale tabs/runs can undo reset intent |
| 6 | Recognition rather than recall | 2 | Report, reference, editor, and checks require repeated context switching |
| 7 | Flexibility and efficiency | 1 | Repeated edit/check controls scroll away from the working surface |
| 8 | Aesthetic and minimalist design | 2 | Repetitive panels and labels compete with the actual task |
| 9 | Error recovery | 1 | Save/reset failures have no recovery path; a stalled check can keep controls disabled |
| 10 | Help and documentation | 3 | Substantial contextual lessons and clearly tiered, collapsed hints |
| Total | | 21/40 | Acceptable band; substantial improvement needed |

All ten heuristics apply. These are review judgments, not a user study. Independent design assessment A scored 25/40 before the parent's persistence/cancellation findings were incorporated. The synthesized score reduces status, control, prevention, and recovery by one point each; the independent assessment was not shown detector results.

## What Works

- The actual route embedded beside its investigation is the right core interaction. Open in tab and Reload are useful working tools.
- Incident IDs, explicit PASS/FAIL/PEND text, progression, and a next-level completion action give the game a comprehensible language.
- Graduated hints remain closed and labeled. Preserve the learner's deliberate choice of assistance and the original learning content.

## Priority Issues

### C01 [P1] Make progress and verification trustworthy

`src/shell/progress.tsx:40`, `src/shell/ChecksRunner.tsx:23`, `src/shell/LevelPage.tsx:64`.

Saved progress, current source correctness, and successful persistence are different facts. The interface conflates them, while abandoned runs and stale tabs can still affect completion. A learner should be able to trust both an earned milestone and what the latest check actually established.

Direction: separate saved completion from current-visit check results and pending/failed saves. Own and cancel runs, invalidate reset-era callbacks, synchronize storage, and provide operation-specific recovery. These are source-supported state findings; races and storage exceptions were not injected into the live session.

Suggested skills: `impeccable harden`, then `clarify`.

### C02 [P1] Repair phone reflow and establish the desktop work boundary

`src/app/(game)/layout.tsx:21`, `src/shell/LevelMap.tsx:125`, `src/shell/LevelPage.tsx:157`.

At viewport 390, the content area is 375px but the document scrolls to 527px. The header progress count is off-screen. The lesson preview toolbar also exceeds its container. Mobile learners can read concepts, but the source-editing requirement needs clearer presentation.

Direction: compose a compact header, wrap act titles/route labels, adapt preview controls, and keep readable reference material available. Communicate that solving requires an editor and desktop development workflow. Do not unlock lessons or change progression merely to create mobile browsing.

Suggested skill: `impeccable adapt`.

### C03 [P1] Make instructions legible and results perceivable

`src/app/globals.css:89`, `src/shell/HintBox.tsx:38`, `src/shell/ChecksRunner.tsx:55`.

Instructional labels measure 3.11:1 contrast at 11px. Check changes have no shell-owned live status. This is more consequential than decorative consistency: users need to read where to work and know when verification changes.

Direction: strengthen instructional/control contrast and announce a concise run/save summary. Keep detailed results available without flooding assistive technology. Disabled-card dimming is a separate readability preference, not automatically a WCAG violation.

Suggested skill: `impeccable harden`.

### C04 [P2] Put the investigation before its reference material

`src/shell/LevelPage.tsx:94`, `src/shell/LevelPage.tsx:152`, `src/shell/LevelPage.tsx:185`.

At 1280x720, Run checks begins around document y=881, and the report follows a long Concept card. First-time understanding and repeated edit/check work both require unnecessary scrolling between relevant information.

Direction: lead with the incident brief and file location, place a substantial live route beside it, and keep verification within easy reach. Preserve the complete concept lesson nearby. Whether reference content stays expanded or becomes an optional view needs an explicit product choice.

Suggested skills: `impeccable layout`, then `distill`.

### C05 [P2] Give Season 2 an authored identity and a supportive learning tone

`src/shell/LevelMap.tsx:30`, `src/shell/LevelPage.tsx:94`, `src/shell/HintBox.tsx:27`.

The existing visual language is consistent, but too much personality comes from familiar console decoration. The hints introduction discusses encoding and assigns greater worth to an unaided attempt, introducing pressure when a learner needs help.

Direction: evolve the Season 1 notebook into a Bugbound Investigation Desk: an ordered incident register, continuous case document, focused evidence area, and readable typography. Reserve monospace for technical material. Use neutral language around progressively revealing assistance. Express advancement through working tools and information hierarchy, not additional effects or panels.

Suggested workflow: `impeccable shape` before redesign, followed by `layout`, `distill`, `clarify`, and finally `polish` after approval.

## Cognitive Load and Emotional Journey

The load comes mainly from context switching, not an excessive number of active options. Five substantial lesson regions have similar visual weight; the player must connect reference, report, editor, preview, and checks. Single focus, working-memory continuity, and hierarchy are the weakest checklist items. Grouping and explicit hint disclosure are strengths. Five map entries in an act exceed a simplistic four-item guideline, but disabled future entries are not five simultaneous active decisions; do not treat the count alone as a defect.

The opening critical status supplies game tension, but presents a backlog before the learner earns a win. The difficult middle needs more support: put the actual report first, keep verification nearby, and make choosing a hint feel ordinary. The source-defined next-level completion banner is a good ending; success was reviewed in code, not simulated in the browser.

## Persona Red Flags

- Jordan, first-timer: sees an extended concept lesson before the actual incident, and may need a clearer desktop/editor expectation.
- Alex, returning developer: repeats edit/check cycles with verification below the preview and static reference material occupying the main working space.
- Sam, assistive-technology user: encounters faint instructional labels, H1-to-H3 section structure, and check changes without deliberate status announcements. Limited keyboard focus testing succeeded; no full screen-reader claim is made.

## Minor Observations

Use links for navigation and H2 for principal workspace sections. Improve route-specific document titles and loading/locked headings. Honor reduced motion, narrow broad transitions, and make native dark controls coherent. Preserve useful status words, iframe titles, Radix disclosure semantics, and confirmed reset. Dark-only styling is an existing design choice, not a correctness failure. No new design-system dependency is needed.

## Proposed Direction and Review Decisions

Recommended direction: Bugbound Investigation Desk. Preserve family resemblance through graphite/off-white, restrained accent use, prominent incident numbers, and disciplined typography. Let Season 2 feel more capable through real route evidence, clear current verification, and an efficient repeat-work layout. The existing React/Tailwind/Radix foundation can support this.

Three decisions for the review close: prioritize reliability/reflow first or combine them with the workspace redesign; evolve into the investigation desk or retain a refined console; keep Concept expanded or make it a deliberate reference view. These are choices for subsequent work, not permission inferred from this critique. No remediation edits or file restructuring were performed.

The detailed technical audit and Season 1 applicability matrix are in `.impeccable/audits/2026-09-05-frontend-audit.md`.
