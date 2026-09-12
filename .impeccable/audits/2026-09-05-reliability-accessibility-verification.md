# Reliability and Accessibility Verification

## Approved Scope

User selected reliability/accessibility first, an Investigation Desk identity for the later redesign, and a fully expanded Concept beside the investigation. This pass changes the engine and shell only. No full redesign, broader curriculum/code audit, file restructuring, commit, or push was performed. The installed AGENTS frontend workflow remains in place.

## Implemented

- Abortable checks with a 60-second asynchronous deadline, cancellation on unmount/reset, an explicit Cancel command, and eager iframe cleanup.
- Additive generation-scoped progress, validated legacy migration, cross-tab storage/focus synchronization, operation-specific retries, and no persistence in React state updaters.
- Historical saved milestones separated from visit-only completion and the latest check run. Revisited lessons start unchecked.
- Responsive header, map and preview tools; source-editor notice on smaller screens; shell-only contrast, wrapping, reduced motion, focus, headings, skip navigation, native links, and route titles.
- 18 Node regression tests and separate shell lint/typecheck commands. No dependencies installed.

## Final Gates

| Command | Exit | Outcome |
|---|---:|---|
| npm.cmd run test:shell | 0 | 18 tests passed |
| npm.cmd run lint:shell | 0 | Engine/UI/tests lint passed |
| npm.cmd run typecheck:shell | 0 | Engine/UI and imported curriculum contracts passed |
| npm.cmd run lint | 1 | Two existing protected lesson errors; first: "Cannot call impure function during render" |
| npx.cmd --no-install tsc --noEmit --incremental false | 1 | Existing protected lab route contract: TS2559, "has no properties in common with type RouteHandlerConfig" |
| npm.cmd run build | 1 | Compiled successfully in 2.9s; stopped at the same protected lab route type contract |
| git diff --exit-code HEAD -- src/app/lab src/proxy.ts src/levels | 0 | Protected exercise code/checks/hints unchanged |
| git diff --check | 0 | No whitespace errors; ordinary LF/CRLF warnings |
| Impeccable detect.mjs --json src/shell src/app/(game) | 0 | Independent assessment B returned [] |

TDD evidence: initial harness tests failed with missing expected cancellation rejections and "deadline missing"; the progress module was absent. Later targeted tests reproduced denied-legacy-read and redundant-save defects (16 passed, 2 failed) before the correction; final run passed all 18.

## Browser Evidence

- Parent map and lesson reflow measured at 320, 390, 768, and 1440px; document scroll width equaled client width throughout. Independent reviewers also inspected 320, 390, and 1440px.
- Live cancellation retained 0/13 saved milestones and left only the visible preview iframe. Navigating away during another run left zero iframes and unchanged completion.
- Reopening a lesson displayed "Not checked this visit."
- Skip link moved focus to main-content. Tab from map navigation reached closed Hint 1 with a 2px #9ecbff outline and 4px offset. No hints were opened.
- Locked and unknown incident routes had an H1 and a map recovery link. Lesson document title included its incident title.
- Final reload target measured 44 by 44px at 390px; the decorative progress strip was hidden at this width. Concept stayed expanded.
- No actual screen-reader session, browser storage-failure injection, or automated mounted React reset test was performed. Store and harness edge cases have synthetic tests; reset remount behavior was source-reviewed. Reduced-motion handling was source-reviewed, not OS-emulated.

## Independent Reviews

Read-only reliability reviewer found no actionable correctness defect and identified test gaps. Active-pause cancellation and interleaved reset/write regression coverage were then strengthened.

Independent Impeccable A/B follow-up scored 28/40. Remaining priorities are mobile context distance and the panel-heavy visual identity, both deferred to the Investigation Desk redesign. Suggested skills: layout and shape, followed by polish. Runner error wording and reload hit area were refined after that review; parent remeasurement confirmed the new target size. Fresh Vercel Web Interface Guidelines were also reviewed: https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md

## Environment and Limits

The prior Turbopack dev session repeatedly panicked; browser QA used the existing Next.js webpack option without changing the dev script. The webpack dev server remains running for the user at http://127.0.0.1:3002 (exec session 81835, stop with Ctrl+C). It was started for implementation QA and user preview, not solely for critique visualization.

No mutable browser injection API was available, so there are no live Impeccable overlays. Independent CLI findings, viewport screenshots, and read-only DOM measurements were used. Full-page capture stitching artifacts were excluded. All owned QA tabs were closed and viewport overrides reset; the original user tab was not modified.

Iframe cancellation isolates browser lifecycles, not server module state, synchronous infinite loops, or server mutations already received. Old generation records remain stored but inert after reset. Broader optimization and restructuring work remains pending.
