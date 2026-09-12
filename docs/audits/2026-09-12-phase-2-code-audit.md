# Phase 2 Code Audit

Date: 2026-09-12. Repository: `C:\Users\d69ha\Desktop\react-practice-site-s2`, current `main` working tree including the approved, uncommitted frontend work.

Status: audit and recommendations only. No application fixes, dependency installations, curriculum edits, commits, or restructuring were performed. The new probe script and its generated evidence are audit artifacts. Existing browser evidence was refreshed.

## Prioritized Findings

### F1 - P1: Upgrade the vulnerable framework before other remediation

Evidence: `package.json:20`, `next.config.ts:3`, `package-lock.json`; installed Next.js is 16.2.10. `npm.cmd audit --omit=dev --json` exited 1 with six affected package entries: one critical, three high, two moderate. These are package totals, not six independently exploitable application paths.

The maintainer's Windows-server advisory affects Next.js 16 versions below 16.3.3, for Pages/App Router applications without Cache Components. This repository runs App Router on Windows without that option. There is also an applicable Server Actions denial-of-service advisory affecting versions below 16.2.11. No exploit was attempted and there is no evidence of compromise.

Sources checked live:
- [Windows-hosted server advisory](https://github.com/vercel/next.js/security/advisories/GHSA-p293-qw3h-jr36).
- [Server Actions denial-of-service advisory](https://github.com/vercel/next.js/security/advisories/GHSA-m99w-x7hq-7vfj).

Recommendation: upgrade Next.js and the matching ESLint configuration together to a currently patched compatible 16.x release, at least 16.3.3 for the cited Windows issue. Refresh the lockfile and re-audit rather than treating this minimum as a guarantee that every advisory is resolved. Review PostCSS, nanoid, sharp, and baseline-browser-mapping transitive findings by actual usage. The application does not currently use a custom server, configured rewrites, or `next/image`; those advisory prerequisites must not be assumed present.

Keep development bound to 127.0.0.1 and do not publish or tunnel this intentionally vulnerable teaching app. Loopback binding reduces network exposure; it is not a patch or a claim of complete safety. The current preview was started with that binding. The default `next dev` script should also be assessed for a loopback-only default. Do not run an indiscriminate `npm audit fix --force`: the curriculum is framework-version-sensitive.

### F2 - P2: Readiness failures can be reported as healthy hydration

Evidence: `src/shell/harness.ts:150`, `:180`, `:224`. Navigation timeout resolves instead of rejecting. `waitForReady` falls through when the beacon never arrives. Missing console capture is then represented as an empty error array.

Reproduced with the actual harness in headless Edge against a synthetic same-origin document that never hydrates and never installs console capture. The hydration-health assertion returned `pass: true`. A separate delayed response returned a usable `LabPage` for the initial blank document instead of a navigation error. Frames were cleaned up successfully afterward.

Impact: a failed or slow runtime can produce a false-green health check, or unrelated missing-selector errors that blame the exercise. This reproduction establishes an individual check false positive, not an all-green completion of an actual broken lesson.

Recommendation: distinguish document arrival, hydration readiness, and capture availability. Timeouts or unavailable instruments should produce a readable infrastructure failure. Preserve raw HTTP inspection for intentional error-page exercises. Add unit/browser tests for missing beacon, missing capture, delayed navigation, and streamed content readiness. A layout-level beacon alone should not be treated as proof that every later Suspense boundary has hydrated.

### F3 - P2: Repeated runs can exhaust fixtures and accept historical success

Evidence: `src/app/lab/13-launch-day/store.ts:17`, `:35`; `src/levels/13-launch-day/manifest.ts:34`, `:43`, `:54`. These are fixture/check-contract findings, not proposed solutions to the planted bugs.

Two separate probes confirmed the problem:
- In a separate Node process, the fixture accepted 40 orders, reached zero stock, then rejected the 41st. Nothing resets this inventory between checks or runs; HMR deliberately retains the global store. The existing positive-stock and decrement checks consequently depend on earlier user actions/runs, even when source behavior is correct.
- The existing server-persistence check returned success with one historical order and zero orders persisted by the simulated current action. It tests an absolute historical total rather than evidence from the current attempt. This was a synthetic helper reproduction, not a live-server mutation.

Recommendation: agree on fixture lifecycle and per-run identity first. Consider a narrowly scoped, local-only fixture reset/session mechanism and assertions tied to the current operation. Do not silently reset the user's preview or use browser progress reset to imply server fixture reset. Server state and cookies are shared beyond the disposable iframe; abort cannot undo a request the server has already accepted.

Related coverage risks, not independently reproduced defects: fixed waits in mutation checks (`src/levels/08-silent-guestbook/manifest.ts:36`, `src/levels/13-launch-day/manifest.ts:59`) can be sensitive to cold compilation/slow machines. Cookie cleanup in `src/levels/12-the-bouncer/manifest.ts` is after assertions rather than guaranteed cleanup. Review these under the same repeatability contract.

Any changes to lab fixtures or executable checks need separate explicit approval because AGENTS.md protects them. Do not loosen expected behavior merely to make checks pass.

### F4 - P2: Some teaching guidance is stale for the installed framework

Evidence: `src/levels/07-yesterdays-news/manifest.ts:20` teaches a single-argument tag-invalidation call. The installed declaration at `node_modules/next/dist/server/web/spec-extension/revalidate.d.ts:9` requires two arguments. Installed documentation explicitly marks the one-argument behavior deprecated and notes that TypeScript errors would need suppression. The official [revalidateTag reference](https://nextjs.org/docs/app/api-reference/functions/revalidateTag) also distinguishes stale-while-revalidate from immediate freshness.

Impact: a learner following the explanatory text can receive a compiler error or choose a freshness policy different from the text's promise. This is instructional drift, not a planted exercise to repair.

Secondary wording issue: the dynamic-route lesson describes the failure as silent (`src/levels/06-lost-in-the-params/manifest.ts:15`). On the installed version, a fresh request still returned the narrated fallback with HTTP 200, but the dev server also logged an explicit framework diagnostic. Do not incorrectly rewrite the symptom as necessarily a 500. Compare against the installed guides and the official [Next.js 16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16).

Recommendation: a prose-only compatibility pass after selecting the security upgrade. Keep incident symptoms, lesson examples, actual framework diagnostics, and freshness semantics consistent. Preserve checks and encoded hints unless separately authorized. No hint or solution content was decoded during this audit.

## Cleanup And Optimization Candidates

These are lower priority than F1-F4 and are not approvals to implement.

- `src/levels/index.ts:3`, `src/shell/progress.tsx:4`, `src/shell/IncidentNav.tsx:8`: navigation/progress import complete executable manifests. The register's served webpack development scripts contained all 13 manifest modules. Separate a small catalog from lazily loaded per-level checks/lessons if measurement justifies it. Manifest source totals 46,283 bytes; that is not a production transfer-size measurement. A successfully completed production build was unavailable.
- `src/shell/LevelMap.tsx:7`, `src/shell/IncidentNav.tsx:11`, `src/shell/progress.tsx:41`: act definitions live in a UI module, and pure unlock rules live beside the React provider. Move those responsibilities into a small curriculum-domain module when Phase 3 ownership/layout is approved. Do not add a state-management library for this.
- `src/components/ui/{alert,badge,card,separator}.tsx`: no importing application modules were found. The two remaining `radix-ui` imports are confined to unused Badge/Separator wrappers. Remove verified unused wrappers and then the unused direct Radix dependency in an approved cleanup. Spinner is used by Button and should not be deleted just because no current screen requests its loading variant.
- `src/app/globals.css:141` and `src/shell/workspace.css:43`: old shell safeguards and newer component overrides overlap. Unreferenced status-dot/uptime-strip styles remain. Consolidate shell ownership carefully, preserving lab CSS and cascade order; do not remove lab tokens because the new shell does not use them.
- Several shell components compress substantial JSX into very long lines. Apply consistent formatting to the touched shell files, then extract only genuinely repeated or independently meaningful sections. Avoid a broad component hierarchy rewrite.
- `package.json:5`: browser gates and structural curriculum checks are not declared scripts, and Playwright is externally resolved. The documented Node 22.18+/24 test requirement is not enforced with `engines` or a runtime-version file. Make the contributor verification path reproducible with approved development tooling, not production dependencies.
- `next.config.ts:4`: the comment copies Season 1's render/effect-count rationale, but Season 2's 44 checks do not directly count renders/effect firings. Keep the existing setting during the audit. Assess shell-scoped StrictMode and mount-level regression tests independently; do not globally enable it without a curriculum compatibility run.

## Season 1 Lessons Applied

| Season 1 concern | Season 2 assessment |
| --- | --- |
| Cancel abandoned runs | Present: abortable helpers, unmount cleanup, and version-key remount on progress reset. Existing tests pass. |
| Stale-tab overwrite/reset resurrection | Additive per-level keys and reset generations are already present; corresponding store tests pass. No new data-loss defect was reproduced. |
| Storage failures/retries | Explicit load/save/reset state and retries exist. Persistence occurs outside React state updater functions. Pending visit completion is separate from saved completion. |
| Saved milestone versus current verification | Separated in source and UI; revisiting starts with no restored check history. |
| Disposable execution contexts | Client iframes are disposed, including on cancellation. They do not isolate cookies/server globals, and readiness still needs F2. |
| Telemetry validation | No persisted telemetry subsystem is present; do not add one merely to copy Season 1. |
| Accurate lesson narratives | Needs F4 and a version-aware review after the framework upgrade. |
| Desktop workflow notice | Present. Existing responsive browser suite verifies it. |
| Compiler and curriculum gates | Shell compiler gate exists; current structural probe passes. Promote appropriate checks into repeatable maintenance tooling later. |
| StrictMode exception | Reassess the Season 2 rationale rather than copying Season 1's global choice. |

## Review Coverage And Limits

- Read the engine's persistence, runner, harness, navigation, source-copy, hints, prose, layouts, route gating, metadata, and UI wrappers. Inspected shared styling, manifests, imports, configs, package/lockfile state, tests, and relevant lab integration/fixture code. Parsed all 92 TypeScript/TSX source files without syntax diagnostics.
- Structural checks covered all 13 manifests, contiguous numbers, unique IDs/check names, existing entry routes and source references, executable check functions, and exactly three encoded hint tiers per incident. Total: 44 checks and 39 encoded tiers. Encoded shape is validated without decoding content.
- Reviewed React patterns against React Best Practices, particularly client bundle boundaries, external-store subscriptions, derived state, and lifecycle cancellation. Existing functional state updates and the external store are preferable to introducing new abstractions.
- Targeted Web Interface Guidelines review of the existing shell: no newly confirmed blocker in native control semantics, icon labels, focus replacement, reduced-motion rules, or status feedback. Low-priority source observations: `src/app/layout.tsx:16` has no theme-color declaration; `src/shell/SourceFiles.tsx:27` does not mark code identifiers `translate="no"`. Neither warrants expanding this pass into a redesign. General title-case, ellipsis, URL-state, or transform-only accordion advice was not applied over established copy, concealment, and library behavior. [Guidelines reviewed](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md).
- This is a code audit, not another formal Impeccable visual critique. No frontend behavior or styling was changed, so no remediation/design loop was started. The approved desktop design was retained.
- Existing browser suite passed seven viewport captures and eight interaction checks with a real first-lesson preview/check run. Initial two attempts failed during dev refresh/navigation activity; a restarted, prewarmed server passed. This does not establish cold-start reliability. First attempt overlapped the build, so it is not clean evidence of an independent product defect.
- Additional matrix: all 13 completed lesson shells at 1166px and 390px, no document overflow, all three hint disclosures closed, no shell runtime errors. Lab previews were deliberately stubbed for this matrix. Browser progress was seeded only in disposable contexts, not the user's profile.
- Did not solve exercises or run a fully corrected 13-level playthrough. Did not load-test the server, attempt security exploits, certify assistive-technology/browser coverage beyond Edge, or benchmark production bundles. Remaining fixture/timing compatibility requires a controlled maintenance test setup, not edits on the player's cartridge.
- Season 1 and Season 3 were not modified. Phase 3 restructuring has not begun. Protected lab/proxy/manifest contents have no diff against HEAD.

## Fresh Verification

All commands ran from the Season 2 repository. Browser commands used the documented bundled Playwright override and localhost:3002. Node version was 24.18.0.

| Command | Exit | Outcome |
| --- | --- | --- |
| `npm.cmd ls --depth=0` | 0 | Installed direct dependency tree resolves. |
| `npm.cmd run test:shell` | 0 | 18/18 tests passed. |
| `npm.cmd run lint:shell` | 0 | Shell lint passed. |
| `npm.cmd run typecheck:shell` | 0 | Shell and imported curriculum types passed. |
| `npm.cmd run lint` | 1 | Two diagnostics in protected lab content. First: "Cannot call impure function during render". Not treated as shell remediation. |
| `npm.cmd run build` with system CA option | 1 | Compiled successfully, then "Failed to type check." Generated protected-lab RouteHandlerConfig mismatch. Not a production-build pass. |
| `npm.cmd audit --omit=dev --json` | 1 | Six affected package entries; F1. No dependency changes. |
| `node tests/browser/workspace.mjs` | 0 on final run | Seven viewport captures, eight interactions, no runtime errors. Earlier exits 1: 65s result wait timeout, then `net::ERR_ABORTED` on navigation. |
| `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON docs/audits/phase-2-probes.mjs` | 0 | Structural checks, confirmed reproductions, development bundle inventory, 26 lesson-shell layouts. A probe pass confirms findings, not repaired behavior. |
| `npm.cmd exec -- eslint docs/audits/phase-2-probes.mjs` | 0 | Audit script lint passed. |
| TypeScript parser inventory (read-only Node command) | 0 | 92 source files, zero parse diagnostics. |
| `git diff --check` | 0 | No tracked whitespace errors; existing Windows line-ending warnings only. |
| `git diff --numstat -- src/app/lab src/proxy.ts src/levels` | 0 | Empty: protected cartridge unchanged. |

Evidence: `docs/audits/evidence/phase-2-probes.json` and `.impeccable/review/browser-evidence.json`. Audit probes do not belong to the normal green shell suite because they intentionally assert the presence of current defects.

## Proposed Remediation Order

1. Security/dependency upgrade plus reproducible, local-only development setup and compatibility verification.
2. Shell-owned readiness/error-reporting fix with focused regression coverage.
3. Separately approved fixture/check-contract repeatability work and prose-only curriculum corrections.
4. Targeted unused-code, formatting, and bundle-boundary cleanup after measurement.
5. Phase 3 file-structure proposal, keeping fixture/check ownership explicit and preserving lab source.

All five items are recommendations awaiting approval, not work already implemented.
