# Phase 3: Structural Cleanup

Implemented on 2026-09-12 after approval of the local Phase 3 specification. Work remains uncommitted on `main`; no staging, push, release, dependency installation, or sibling-project change was performed.

## Scope

17 files were relocated, with imports and direct consumers updated:

| Previous location | New location |
| --- | --- |
| `src/shell/Workspace.tsx` | `src/shell/workspace/Workspace.tsx` |
| `src/shell/IncidentNav.tsx` | `src/shell/workspace/IncidentNav.tsx` |
| `src/shell/LevelMap.tsx` | `src/shell/workspace/LevelMap.tsx` |
| `src/shell/workspace.css` | `src/shell/workspace/workspace.css` |
| `src/shell/LoadedLevel.tsx` | `src/shell/lesson/LoadedLevel.tsx` |
| `src/shell/LevelPage.tsx` | `src/shell/lesson/LevelPage.tsx` |
| `src/shell/HintBox.tsx` | `src/shell/lesson/HintBox.tsx` |
| `src/shell/Prose.tsx` | `src/shell/lesson/Prose.tsx` |
| `src/shell/SourceFiles.tsx` | `src/shell/lesson/SourceFiles.tsx` |
| `src/shell/ChecksRunner.tsx` | `src/shell/checks/ChecksRunner.tsx` |
| `src/shell/harness.ts` | `src/shell/checks/harness.ts` |
| `src/shell/LabDataReset.tsx` | `src/shell/checks/LabDataReset.tsx` |
| `src/shell/fixture-reset.ts` | `src/shell/checks/fixture-reset.ts` |
| `src/shell/progress.tsx` | `src/shell/progress/ProgressProvider.tsx` |
| `src/shell/progress-store.ts` | `src/shell/progress/progress-store.ts` |
| `src/levels/catalog.json` | `src/levels/generated/catalog.json` |
| `src/levels/loaders.ts` | `src/levels/generated/loaders.ts` |

Only the five approved, unreferenced starter assets were deleted: `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, and `public/window.svg`. The scan of active source, scripts, tests, current docs, public assets, and package manifest returned no references before deletion.

The generator now writes to `src/levels/generated/`, creates that directory only in write mode, and retains literal dynamic imports to each manifest. Test paths and the explicit lint target follow the moves. README documents ownership; DESIGN and the globals.css header point to the relocated stylesheet. Historical audit paths remain historical evidence.

## Preservation Evidence

The comparison baseline was the approved Phase 1/2 working tree immediately before these moves, not HEAD. The local helper and snapshot live under ignored `docs/superpowers/`.

- All 17 destinations exist and old file paths are absent. The structural test first failed with `Missing destination: src/shell/workspace/Workspace.tsx` before the moves, then passed afterward.
- 63 protected/dependency hashes match: existing lab files, all manifests, encoded hints, SOLUTIONS, proxy, and lockfile. No hint or solution content was decoded into the report.
- 25 source snapshots match after normalizing import module specifiers with the TypeScript parser/printer. The comparison covers moved shell code, stable shell boundaries, game routes, fixture API, and curriculum entry points. No non-import source change was found.
- Workspace CSS and catalog are byte-identical. The globals.css change is only its stylesheet-path comment. Dependency versions are unchanged.
- Two generator runs produced identical SHA-256 hashes for both outputs. Curriculum validation remains 13 incidents, 44 checks, and 39 encoded hint tiers.

## Verification

Each npm command below was run separately with its own observed exit code.

| Command | Exit | Result |
| --- | --- | --- |
| `node docs/superpowers/phase-3-preservation.mjs capture` | 0 | Pre-move baseline captured |
| `node docs/superpowers/phase-3-preservation.mjs destinations` before moves | 1 | Expected structural red result |
| `node docs/superpowers/phase-3-preservation.mjs verify` after moves and after build | 0 | Protected bytes, source structure, paths, and dependencies preserved |
| `npm.cmd run test:shell` before/after | 0 | 31 passing tests |
| `npm.cmd run typecheck:shell` before/after | 0 | Shell compiler check passes |
| `npm.cmd run lint:shell` before/after | 0 | Shell lint passes |
| `npm.cmd run format:check` before/after | 0 | 21 shell files; no formatting required |
| `npm.cmd run validate:curriculum` before/after | 0 | Curriculum contracts and generated output match |
| `npm.cmd run curriculum:generate` twice | 0 | Deterministic output; no checks executed |
| `npm.cmd run test:browser` | 0 | 7 viewport captures, 8 interaction checks, no runtime errors |
| `npm.cmd run test:browser:refinements` | 0 | Single-line navigation, persistent 64px rail/focus, one divider, clipboard states, five viewports, contrast |
| `npm.cmd run test:browser:phase2` | 0 | Lazy loading, readiness/cleanup, API rejection, and reset recovery checks |
| `npm.cmd run lint` | 1 | Existing protected-lab findings: 2 errors and 1 warning |
| `npm.cmd run build` with `NODE_OPTIONS=--use-system-ca` | 1 | Compiled successfully; protected lesson type checking blocks completion |
| `git diff --check` | 0 | No whitespace errors; existing LF/CRLF notices remain |
| Loopback preview HTTP request | 0 | HTTP 200 at `http://127.0.0.1:3002/`; server left running |

Full lint's first error remains `Cannot call impure function during render` in protected lesson 05. Build's first type diagnostic is `TS2559` in the generated Next validator for protected lesson 10. These match the previous phase's failure categories, and their source hashes are unchanged. They are expected curriculum constraints, not relocation regressions; no fixes or suppressions were applied.

## Reviews And Browser Evidence

An independent, fresh-context reviewer found no actionable issues. They separately reran preservation and curriculum validation (both exit 0), checked the import graph, generated output paths, tests, deletion list, and documentation. Their review found no eager manifest loading, compatibility barrels, client/server boundary changes, or lifecycle changes.

The frontend workflow was scoped to preservation rather than redesign:

- Impeccable craft-floor/polish: retained the approved Investigation Desk identity, component composition, stylesheet, and responsive behavior. Desktop 1166px and mobile 390px captures were visually inspected; no relocation-related visual defect was found.
- React Best Practices: focused and final bounded review confirmed explicit lazy loaders, lightweight catalog consumers, stable provider ownership, and unchanged cancellation/loading behavior. The phase-2 browser suite checks sampled executable-content boundaries.
- [Web Design Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md): fetched for the initial and final targeted review. Semantics, focus, live feedback, navigation, responsive containment, and motion handling remain unchanged. Existing sentence-case labels and ASCII loading ellipses were retained under the explicit no-copy-change scope; disclosure state was not moved into URLs. No new accessibility issue was introduced by the moves.

No new formal full-site Impeccable critique was claimed for this structural-only phase. No design-hook suppressions were added. Screenshots and machine-readable browser evidence are under `.impeccable/review/`, including `refinement-1166.png`, `refinement-390.png`, and the reset-state captures.

## Limits

The browser suites use isolated contexts and sample workflows, not a solved playthrough of all 13 exercises. Fixture-reset success/retry UI uses mocked transport; live requests only exercise rejection paths without clearing real inventory. The import-normalized snapshots prove unchanged non-import code, while compiler, generator, browser, and independent review checks validate the relocated import targets. The snapshot does not cover prior versions of README, DESIGN, tests, or generator; those were reviewed against the approved scope. Full lint/build remain intentionally non-green for protected curriculum reasons.
