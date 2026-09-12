# Phase 2 Remediation

Date: 2026-09-12. Scope: the approved follow-up to the Phase 2 code audit, on the current `main` working tree. No commit, push, deployment, exercise solution, or broad Phase 3 restructuring.

## Changes

- **F1, dependencies:** Next.js and eslint-config-next pinned to 16.3.5; PostCSS updated; compatible transitive updates cleared the remaining advisory findings. Final npm audit reports zero vulnerabilities across production and development dependencies. This is an advisory scan, not a security certification. Development scripts now bind to 127.0.0.1.
- **F2, readiness:** navigation deadlines reject instead of returning a blank frame; hydration beacon and console capture are required; missing instrumentation returns an explicit retryable failure. Streamed content still requires an explicit selector/predicate wait. Frames are disposed on failure and cancellation.
- **F3, repeatability:** capstone persistence checks compare fresh before/after totals instead of accepting any historical order. Exhausted stock identifies the fixture recovery operation. The guestbook polls for its unique note instead of sleeping a fixed duration; generated test messages/headlines use UUIDs. Registered cookie cleanup is attempted on success, failure, cancellation, and timeout, with bounded requests. Cleanup failures cannot yield a passing result and are visible when cancelling an active run.
- **F3, explicit reset:** a coss AlertDialog and Button expose development-only Launch Day fixture reset with safe initial focus, confirmation, pending state, failure/retry, success feedback, and preview reload. It restores only mock stock/orders, not progress or source. The route rejects production, non-local Host values, missing/mismatched Origin, wrong content type, and unknown fixture IDs. It ignores forwarded-host headers. Next's development adapter normalizes the internal URL to localhost, so same-origin validation uses the allowlisted browser-facing Host. Loopback binding remains the network boundary, not these headers alone.
- **F4, teaching prose:** updated async-parameter diagnostics, current tag revalidation/freshness semantics, and React serialization terminology. Used the installed Next.js 16.3.5 guides plus the [React serialization reference](https://react.dev/reference/rsc/use-client#serializable-types-returned-by-server-components). No hints or solution files were decoded or changed.
- **Bundle boundaries:** the register/progress/metadata import a generated lightweight catalog. Explicit per-incident imports load executable manifests after the route passes its progression gate. Loading and retry states are present; route/reset keys and effect cleanup prevent stale module results from replacing another incident. Generated metadata and loaders are checked against the original manifests.
- **Targeted cleanup:** moved act definitions/unlock rules out of UI modules, removed four unused wrappers and the unused Radix dependency, consolidated shell CSS ownership, and formatted 21 shell/game-route files. The preserved lab stylesheet section is byte-identical to the pre-cleanup text. No new suppression rules were added.
- **Contributor tooling:** local Playwright/Prettier development dependencies, named browser and curriculum scripts, Node engines/runtime file, and documented maintenance contracts. Explicit formatter enumeration handles Windows cloud-file reparse points that ordinary globs skipped.

## Protected Content

Only `src/app/lab/13-launch-day/store.ts` changed under the lab tree: fixture initialization was factored into a seed factory and an explicit reset was added. Existing order behavior is preserved. `src/proxy.ts`, hint JSON, solutions, test IDs, and planted implementations are unchanged.

Approved executable-contract edits are limited to unique generated inputs, polling, cleanup registration, capstone before/after assertions, and fixture-exhaustion guidance. No assertion was relaxed to make a planted bug pass. The first lesson still produces its expected failing check in real browser verification.

## Review And Evidence

- Impeccable **harden** and **polish** guided the bounded UI changes: existing dialog components, graphite palette, secondary reset control, explicit operation-specific recovery, and preserved sidebar/lesson layout. Desktop/mobile reset screenshots were inspected after transitions settled; a missing existing `desk-dialog` class was corrected. This was a focused remediation review, not another formal full-site critique.
- React Best Practices review covered explicit dynamic imports, stable route ownership, external-store usage, and async cancellation. An independent reviewer found one P2: cancellation swallowed failed cleanup. A red/green regression confirmed the issue and its repair; the bounded re-review found no remaining actionable issue.
- Independent checklist review used fresh [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md). Valid follow-ups: use the established dialog radius/line-height class, retain Cancel focus, announce reset errors and cancellation status, preserve reduced motion, and mark source identifiers `translate="no"`. Final targeted review found no remaining blocker. Generic title-case/ellipsis preferences were not applied over existing copy conventions. No design-system values or broad exceptions were added.
- Existing browser suite: seven viewport captures, eight interactions, real first-lesson preview/check execution, no runtime errors. Sidebar refinements: five viewports, collapse rail/focus, single-line navigation, one divider, clipboard states, contrast.
- New browser suite: synthetic same-origin missing beacon/capture, delayed navigation, streamed content, frame disposal; sampled executable checks absent from register scripts; first-lesson checks loaded while locked capstone code remains absent. This is webpack development evidence, not production transfer-size measurement.
- Reset UI tested at 1166px and 390px: confirmation, initial Cancel focus, non-mutating dismissal, failed transport and retry, success state, unchanged saved progress. Reset transport and capstone preview were mocked to avoid erasing real server data. Real API requests verified rejection of cross-origin and unknown-fixture requests. The real fixture reset function was exercised in an isolated Node process, not through a live successful HTTP reset.

Artifacts: `.impeccable/review/phase-2-remediation.json`, `phase2-reset-1166.png`, `phase2-reset-390.png`, existing browser/refinement evidence, and the focused Node regressions under `tests/`. The earlier audit's `phase-2-probes.mjs` is historical defect-reproduction code, not a post-repair green gate.

## Verification

All commands ran from the Season 2 root using Node 24.18.0. Browser commands used local Playwright and installed headless Edge against the loopback dev server.

| Command | Exit | Result |
| --- | --- | --- |
| `npm.cmd run test:shell` | 0 | 31 tests pass. |
| `npm.cmd run lint:shell` | 0 | Shell, maintenance API, tooling, and test lint pass. |
| `npm.cmd run typecheck:shell` | 0 | Shell and imported curriculum/API contracts pass. |
| `npm.cmd run validate:curriculum` | 0 | 13 incidents, 44 checks, 39 encoded hint tiers; generated files current. |
| `npm.cmd run format:check` | 0 | 21 shell files, no formatting drift. |
| `npm.cmd audit --json` | 0 | Zero reported vulnerabilities. |
| `npm.cmd run test:browser` | 0 | Seven viewport captures and eight interactions. |
| `npm.cmd run test:browser:refinements` | 0 | Five viewports and existing navigation/spacing regressions. |
| `npm.cmd run test:browser:phase2` | 0 | New readiness/loading/reset regression suite. |
| `npm.cmd run lint` | 1 | Protected labs: two existing errors plus one new framework lint warning. First error: "Cannot call impure function during render". No lab fixes applied. |
| `npm.cmd run build` with system CA option | 1 | Next 16.3.5 compiled successfully, then protected lab RouteHandlerConfig validation failed. Not a production-build pass. |
| `git diff --check` | 0 | No whitespace errors; Windows line-ending warnings only. |

Intermediate failures were investigated, not counted as passing evidence: initial regressions reproduced the audited defects; the first formatter glob skipped Windows reparse-point files and was replaced with explicit enumeration; an early browser assertion raced navigation and was changed to wait for the lesson route/check list; the reset guard's localhost/Host mismatch was reproduced with a diagnostic, fixed, and the temporary diagnostic removed. No blocked install script was broadly approved; the final dependency pin used `--ignore-scripts`.

## Remaining Boundaries

- Lab inventory and cookies remain shared across tabs. The capstone order delta proves a new order occurred during the measurement window, not a uniquely identified operation. Do not run mutation checks alongside another tab placing orders or resetting fixtures. A per-session server fixture system would be a separate architectural change.
- Cancellation cannot roll back server requests already accepted, guarantee cleanup after a process crash, or stop synchronous infinite loops. Cleanup warnings can be shown while the runner remains mounted; leaving the page removes that UI.
- No solved 13-incident playthrough, production bundle-size benchmark, successful production build, load test, exploit attempt, or comprehensive assistive-technology/cross-browser certification was performed.
- StrictMode remains unchanged. Its old render-count rationale was corrected; enabling it globally needs curriculum compatibility evidence rather than copying Season 1's setting or forcing a shell-only partial mode without validation.
- Broad Phase 3 file restructuring remains separate. Season 1 and Season 3 were not changed.

Preview remains available at `http://127.0.0.1:3002/`.
