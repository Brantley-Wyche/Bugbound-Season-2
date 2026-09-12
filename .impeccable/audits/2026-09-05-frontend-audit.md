# Bugbound Season 2: Frontend Audit

Date: 2026-09-05. Checkout: `C:/Users/d69ha/Desktop/react-practice-site-s2`. Branch: `main`. Baseline commit: `23481d3910e3d7719016f191829d7d4d9c3f05f4`.

Status: findings and recommendations only. The authorized frontend workflow was installed in tracked `AGENTS.md`; application code, exercises, checks, hints, and the sibling Season 1/3 project were not changed. This is step 1 of the requested sequence. The broader code/curriculum audit and restructuring remain steps 2 and 3.

## Verdict

The game has a coherent incident vocabulary and a suitable component foundation. Its interface needs stronger reliability, accessibility, and working hierarchy. The current panels communicate a developer console more strongly than a distinctive learning workspace. Keep Next.js, Tailwind, the existing Radix/shadcn primitives, real-route previews, and deliberate progression. A new component library is not justified by this audit.

Implementation integrity: partial pass for consistent primitives and product vocabulary; fail for accurately communicating persistence and verification state. The automated design detector reported zero findings, but manual source and browser inspection found material issues outside its coverage.

| Technical dimension | Score / 4 | Basis |
|---|---:|---|
| Accessibility | 2 | Measured text contrast failures; no shell-owned announcement of check status |
| Performance | 3 | Small application; eager curriculum imports are an opportunity, not a measured speed regression |
| Responsive design | 1 | Confirmed horizontal overflow at phone widths; preview controls also overflow |
| Theming | 2 | Tokens exist, but hard-coded text colors, shared lab aliases, and missing native dark color scheme limit consistency |
| Implementation integrity | 2 | Shared primitives are coherent; progress and current verification are conflated |
| Total | 10/20 | Acceptable band, with significant work needed |

Scores are review judgments, not certification or a performance benchmark. Eleven grouped findings: five P1, six P2, no P0. Sub-bullets describe related failure modes, not additional issue counts.

## Coverage and Limits

- Read every file in `src/shell`, the game route group, all six UI primitives, root layout/styles, utility, package/config files, README, and applicable instructions. Read the shell-owned lab layout only for its logging/beacon integration.
- Inspected the manifest registry and structural metadata: 13 levels, 44 executable checks, 13 hint entries with three tiers each. No hints or solutions were decoded for the audit. This count is not a full curriculum validator or a claim that every check was run.
- Reviewed the installed Next.js 16.2.10 documentation for Server/Client Components, lazy loading, accessibility, StrictMode, package import optimization, and separate dev/build outputs. React is 19.2.4, Tailwind 4, with an npm lockfile.
- Used Impeccable audit, a separate formal critique with isolated design/evidence agents, React Best Practices, and fresh Web Interface Guidelines. Recommendations were filtered against the learning contracts and installed framework.
- Browser coverage: map, first lesson, locked second-lesson recovery, desktop and phone screenshots, responsive DOM measurements, and a limited keyboard traversal through Back and collapsed hint controls. No progress was changed, hints opened, checks run, or lab controls exercised.
- Success, save failure, cross-tab races, cancellation, and reset races are source-supported findings, not fault-injected browser reproductions. No full screen-reader, 200% text zoom, reduced-motion emulation, production performance profile, all-level navigation, or all-44-check run was performed.
- Season 1/3 context came from the supplied handoff; their current implementation was not audited or changed.

## Prioritized Findings

### F01 [P1] Abandoned check runs can still complete; asynchronous runs have no overall deadline

Locations: [ChecksRunner.tsx:23](C:/Users/d69ha/Desktop/react-practice-site-s2/src/shell/ChecksRunner.tsx:23), [harness.ts:277](C:/Users/d69ha/Desktop/react-practice-site-s2/src/shell/harness.ts:277), [harness.ts:68](C:/Users/d69ha/Desktop/react-practice-site-s2/src/shell/harness.ts:68).

`runAll` continues its loop after navigation and invokes `onAllPass` without checking whether the run is still current. There is no cleanup/cancellation signal, reset generation, or overall timeout. Individual frame waits are bounded, but network reads and `check.run` as a whole are not. While the shared game provider remains mounted, a run left behind by navigation can still mark completion. A reset during a passing run can be followed by a stale completion.

Recommendation: give each run ownership, cancellation, an asynchronous deadline, and a reset generation; abort fetches and dispose owned frames when invalidated. Ignore all late results. Keep the executable checks intact. Preserve sequential checking unless the curriculum proves parallel execution is independent. An asynchronous deadline cannot protect against a synchronous infinite loop.

Evidence: source tracing, not live race reproduction. Suggested remediation: `impeccable harden`, with focused lifecycle regression tests during approved implementation.

### F02 [P1] Progress persistence can lose updates or fail without a recovery path

Locations: [progress.tsx:9](C:/Users/d69ha/Desktop/react-practice-site-s2/src/shell/progress.tsx:9), [progress.tsx:40](C:/Users/d69ha/Desktop/react-practice-site-s2/src/shell/progress.tsx:40), [progress.tsx:51](C:/Users/d69ha/Desktop/react-practice-site-s2/src/shell/progress.tsx:51).

- Each tab loads a snapshot once, then writes its entire local set. No storage-event subscription or merge protocol prevents an older tab from overwriting newer completion.
- `setItem` and `removeItem` can throw, with no operation-specific recovery UI. Saving occurs inside a React state updater, which should remain pure.
- Loading checks only whether JSON is an array. Unknown IDs and non-string entries enter the set and affect counts; `completed.size === levels.length` can misreport season completion for malformed data.

Recommendation: validate against the known curriculum, synchronize external storage with a stable server snapshot, and distinguish completed-this-visit from saved completion. Use additive records plus reset generations or an equivalently robust protocol. Provide separate save/reset retries, and keep persistence outside state updaters. The existing versioned storage key is a useful starting point.

Evidence: source tracing; no user storage changed. Suggested remediation: `impeccable harden`.

### F03 [P1] Historical completion is presented as current verification

Locations: [LevelPage.tsx:64](C:/Users/d69ha/Desktop/react-practice-site-s2/src/shell/LevelPage.tsx:64), [LevelPage.tsx:117](C:/Users/d69ha/Desktop/react-practice-site-s2/src/shell/LevelPage.tsx:117), [level route:45](C:/Users/d69ha/Desktop/react-practice-site-s2/src/app/(game)/level/[id]/page.tsx:45).

The saved completion set directly controls both the resolved banner and report status. A returning learner can see a resolved incident without any current check result, even after changing or restoring the source. The check runner correctly starts without restored result history, but the surrounding copy does not explain the distinction.

Recommendation: show saved completion separately from not-yet-run/current-visit verification and the last-run result. Keep earned progression unless the approved product rules say otherwise. Never infer current correctness merely from localStorage.

Evidence: source-supported state contract. Suggested remediation: `impeccable clarify` plus `harden`.

### F04 [P1] Phone layouts overflow horizontally

Locations: [game layout:21](C:/Users/d69ha/Desktop/react-practice-site-s2/src/app/(game)/layout.tsx:21), [LevelMap.tsx:125](C:/Users/d69ha/Desktop/react-practice-site-s2/src/shell/LevelMap.tsx:125), [LevelPage.tsx:157](C:/Users/d69ha/Desktop/react-practice-site-s2/src/shell/LevelPage.tsx:157).

At a 390px viewport, document client width was 375px and scroll width 527px. The header's inner scroll width was 528px: the fixed segment strip and count cannot fit beside branding. The first act heading also overflowed its own 319px container to 337px. On the first lesson, the preview toolbar needed 302px inside a 269px container. A phone screenshot confirmed the progress count off-screen and horizontal scrolling.

Recommendation: compose a compact header with readable count, adapt or relocate its segments, allow act headings and route labels to wrap, and give preview tools responsive placement. Fix the overflowing elements rather than hiding horizontal overflow globally. Preserve a useful reading experience on phones and state the desktop/editor requirement clearly.

Evidence: browser measurements and screenshot; relevant to reflow, WCAG 1.4.10. Suggested remediation: `impeccable adapt`.

### F05 [P1] Important secondary text fails contrast and check changes lack accessible status

Locations: [globals.css:89](C:/Users/d69ha/Desktop/react-practice-site-s2/src/app/globals.css:89), [HintBox.tsx:38](C:/Users/d69ha/Desktop/react-practice-site-s2/src/shell/HintBox.tsx:38), [ChecksRunner.tsx:55](C:/Users/d69ha/Desktop/react-practice-site-s2/src/shell/ChecksRunner.tsx:55).

Computed `#55657a` on card `#0f141b` measures 3.11:1. File-location labels and hint-tier descriptions use this at 11px. Footer/reset copy measures about 3.27:1. Normal-sized text requires 4.5:1 for WCAG AA. Check rows and completion update without a shell-owned live status; framework dev-tool alerts do not announce these application results.

Recommendation: strengthen the secondary instructional/control token and add a concise polite status summary for running, pass/fail totals, and save outcome. Keep detail rows available without announcing every intermediate update. Do not call disabled-card contrast alone a WCAG failure: inactive controls are exempt, although legible future lesson titles remain useful.

Evidence: computed browser colors, independent contrast calculation, source and DOM. Standards: WCAG 1.4.3 and 4.1.3. Suggested remediation: `impeccable harden`.

### F06 [P2] The task and verification controls arrive after substantial reference content

Locations: [LevelPage.tsx:94](C:/Users/d69ha/Desktop/react-practice-site-s2/src/shell/LevelPage.tsx:94), [LevelPage.tsx:152](C:/Users/d69ha/Desktop/react-practice-site-s2/src/shell/LevelPage.tsx:152), [LevelPage.tsx:185](C:/Users/d69ha/Desktop/react-practice-site-s2/src/shell/LevelPage.tsx:185).

At 1280x720, the first viewport is dominated by Concept and preview; Run checks begins around document y=881, preview tools at y=741, and hints at y=1113. The incident report is below the opening theory. On phones, the entire left column precedes the preview and checks. This increases repeated scrolling and the memory burden of connecting the report, source editor, and results. Scrolling is not itself a defect; the issue is priority during repeated work.

Recommendation: lead with a compact incident brief and file location, retain readable lesson content nearby, and keep verification reachable beside the working evidence. Consider a deliberate reference view for repeat visits, with disclosure defaults approved before implementation. Do not add panels simply to look advanced.

Evidence: independent desktop screenshots/measurements and source ordering. Suggested remediation: `impeccable layout`, then `distill`.

### F07 [P2] Navigation and document semantics miss useful browser conventions

Locations: [LevelMap.tsx:29](C:/Users/d69ha/Desktop/react-practice-site-s2/src/shell/LevelMap.tsx:29), [LevelPage.tsx:41](C:/Users/d69ha/Desktop/react-practice-site-s2/src/shell/LevelPage.tsx:41), [PanelTitle.tsx:20](C:/Users/d69ha/Desktop/react-practice-site-s2/src/shell/PanelTitle.tsx:20), [root layout:18](C:/Users/d69ha/Desktop/react-practice-site-s2/src/app/layout.tsx:18).

Unlocked lesson navigation, Start/Continue, Back, and Next use buttons with `router.push`, losing link conventions such as opening in another tab. Workspace headings skip H2; no skip link is supplied. The shell has one shared document title; Next's announcer prefers document title over H1, so route-specific titles would improve orientation. Loading renders an empty main, and locked/unknown routes lack an identifying heading. Several secondary controls are small: Back was 16px high, preview actions 32px, Run checks 36px.

Recommendation: use Next Link for navigation while keeping locked entries noninteractive, restore heading hierarchy, add skip navigation and descriptive per-level titles, and improve narrow-screen target comfort. Do not label every sub-44px control a WCAG AA failure; minimum-target rules and spacing exceptions need context. Limited keyboard inspection confirmed native focus on Back and Radix focus/expanded state on hints, so a claim that all keyboard focus is absent would be false.

Suggested remediation: `impeccable harden` and `adapt`.

### F08 [P2] Motion and theme handling need a scoped hardening pass

Locations: [globals.css:151](C:/Users/d69ha/Desktop/react-practice-site-s2/src/app/globals.css:151), [button.tsx:8](C:/Users/d69ha/Desktop/react-practice-site-s2/src/components/ui/button.tsx:8), [accordion.tsx:35](C:/Users/d69ha/Desktop/react-practice-site-s2/src/components/ui/accordion.tsx:35), [Prose.tsx:20](C:/Users/d69ha/Desktop/react-practice-site-s2/src/shell/Prose.tsx:20).

The status dot pulses indefinitely without a reduced-motion alternative; shared button/accordion primitives use `transition-all`. The dark-only app does not declare a native `color-scheme`. Several instructional and error colors are hard-coded, and shell/lab styles share global aliases.

Recommendation: supply intentional reduced-motion states, narrow transitions, declare the native dark scheme, and give repeated text/error colors semantic tokens. Dark-only is an existing product choice, not a defect. Any approved shell recoloring must preserve lab CSS, aliases, and cascade behavior.

Evidence: source inspection; reduced-motion emulation not run. Suggested remediation: `impeccable harden`, `animate`, and `polish`.

### F09 [P2] The presentation is consistent but visually generic, with unnecessary pressure in assistance copy

Locations: [LevelMap.tsx:30](C:/Users/d69ha/Desktop/react-practice-site-s2/src/shell/LevelMap.tsx:30), [LevelPage.tsx:94](C:/Users/d69ha/Desktop/react-practice-site-s2/src/shell/LevelPage.tsx:94), [HintBox.tsx:27](C:/Users/d69ha/Desktop/react-practice-site-s2/src/shell/HintBox.tsx:27).

Equal card treatment, repeated side stripes, small uppercase monospace, blue pills, and familiar dark-console colors overwhelm the more specific incident/learning material. The hint introduction explains encoding and suggests an unaided attempt is worth more than the hints, which can make assistance feel judgmental. This is design judgment, not a deterministic violation.

Recommendation: evolve toward an investigation desk with a continuous incident document, a clear evidence area, an ordered incident register, readable typography, and real verification state. Keep graphite/off-white and a restrained family accent, with color primarily identifying actions and outcomes. Use monospace for code, paths, identifiers, and results. Reword help neutrally while preserving explicit escalation and closed hints. Keep severity where it helps the story rather than repeating it across several badges.

Suggested workflow: `impeccable shape` before a replacement visual system; `layout`, `distill`, and `clarify` after direction approval. The formal critique is archived separately.

### F10 [P2] Shared navigation imports the executable curriculum eagerly

Locations: [levels/index.ts:3](C:/Users/d69ha/Desktop/react-practice-site-s2/src/levels/index.ts:3), [game layout:4](C:/Users/d69ha/Desktop/react-practice-site-s2/src/app/(game)/layout.tsx:4), [progress.tsx:4](C:/Users/d69ha/Desktop/react-practice-site-s2/src/shell/progress.tsx:4).

The registry imports all 13 manifests, each containing lessons and check functions; client-side chrome and progression import that registry. Manifest source totals 46,283 bytes. Hints add 11,772 source bytes to the lesson import graph. These are source sizes, not compressed transfer sizes or measured performance savings.

Recommendation: evaluate a lightweight catalog for map/progression plus explicit per-level loaders when the broader audit reaches module boundaries. Keep checks client-executable; ordinary function props cannot simply be serialized across a Server Component boundary. Measure benefit before a larger split. The installed Next.js already optimizes `lucide-react` imports; blanket deep-import rewrites, virtualization for 13 entries, a query library, or indiscriminate memoization are unwarranted.

Suggested remediation: `impeccable optimize`, after higher-priority work.

### F11 [P2] Current verification commands mix shell problems with intentional exercise failures

Locations: [package.json:5](C:/Users/d69ha/Desktop/react-practice-site-s2/package.json:5), [eslint.config.mjs:1](C:/Users/d69ha/Desktop/react-practice-site-s2/eslint.config.mjs:1), [progress.tsx:37](C:/Users/d69ha/Desktop/react-practice-site-s2/src/shell/progress.tsx:37).

There are only dev/build/start/lint scripts. Scoped shell lint fails on the existing effect-based progress initialization; whole-project lint and generated TypeScript validation also encounter protected exercise code. No shell test script or structural curriculum validator is declared.

Recommendation: in step 2, define focused shell lint/types/tests and spoiler-free curriculum validation, with whole-cartridge checks reported separately. Rework external-state synchronization when fixing persistence, not by blindly suppressing lint or moving localStorage into server rendering. Keep the intentional exercises and executable checks intact.

## Browser Evidence

Measured actual viewport values, not assumed requested sizes:

| Map viewport width | Document client width | Document scroll width | Result |
|---:|---:|---:|---|
| 320 | 305 | 527 | Overflow |
| 375 | 360 | 527 | Overflow |
| 390 | 375 | 527 | Overflow |
| 430 | 415 | 527 | Overflow |
| 768 | 753 | 753 | No map overflow |
| 1024 | 1009 | 1009 | No map overflow |
| 1440 | 1425 | 1425 | No map overflow |

The first lesson also measured 527px document scroll width at 320, 390, and 430; at 768 it measured 753px for both client and scroll width. The toolbar needed 302px within 199px at viewport 320, and within 269px at viewport 390. A separate 390px screenshot confirmed the clipped header. Desktop lesson screenshots were inspected by both critique agents and the parent. Screenshot artifacts are in the conversation tool evidence, not exported image files.

Keyboard evidence was limited to header link -> Back -> Hint 1 -> Hint 2, with no hint reveal. Back received a visible native outline; Hint 1 received the component's 3px focus ring and remained collapsed. A complete keyboard workflow, screen-reader review, text zoom, and later-level long-content matrix remain follow-up verification.

## Season 1 Lessons Applied to Season 2

| Supplied lesson | Assessment here |
|---|---|
| Cancel abandoned checks and invalidate reset-era runs | Directly applicable: F01 |
| Additive completion, cross-tab sync, reset generations | Directly applicable: F02 |
| Distinguish visit completion from saved completion; specific retries | Directly applicable: F02 |
| Separate historical progress from current verification | Directly applicable: F03 |
| Disposable preview/check isolation | Partially present: hidden check frames are disposed in finally; preview remounts on Reload. Add cancellation ownership, not a blind transplant. Same-origin cookies, dev-server memory, and caches remain shared. This is not a security sandbox. |
| Validate optional telemetry | No application telemetry persistence found in the inspected shell. Do not add telemetry just to port the validation. Next.js framework telemetry is separate. |
| Match lesson narratives to starting behavior | Defer to step 2; not all lesson narratives or starting routes were audited here. |
| Desktop/editor requirement with browsable mobile material | Applicable. Current copy mentions an editor, but no responsive desktop requirement notice or explicit reading mode is present. Preserve progression gates unless browsing locked lessons is separately approved. |
| Compiler/editor feedback independent of build | Applicable: lint/type failures were independently identified. See command table. |
| Shell regression tests separate from planted failures | Applicable and currently missing as a declared workflow. |
| Structural curriculum validation | Useful; only counts/tier shape were checked in this pass. Validate IDs/order/routes/file references/check structure without decoding solutions. |
| Pure progression rules | Reasonable when revising the storage module; no runtime UI import cycle was proven here. |
| Split shell and preserved exercise styling | Applicable candidate for step 3; preserve aliases, ordering, and emitted behavior. |
| Tests in tests/, maintenance in scripts/, one lesson folder | Useful for future additions. Preserve App Router reserved filenames and existing lab URLs; arbitrary route relocation would alter the learning contract. |
| StrictMode exemption | Currently explicitly disabled. Do not toggle during this frontend audit. Step 2 should establish the actual check dependence before changing it. |

## Validation

Each command ran from the Season 2 root. No dependency installation was performed.

| Command | Exit | Outcome |
|---|---:|---|
| `python <installer>/scripts/install_frontend_workflow.py --project <root>` | 0 | Preview inspected; managed block only |
| Same installer with `--write` | 0 | Updated tracked AGENTS.md |
| Installer preview after write | 0 | `status=preview-unchanged`; idempotence confirmed |
| `npm.cmd run lint -- src/shell 'src/app/(game)' src/components src/lib src/app/layout.tsx` | 1 | Existing shell failure at progress.tsx:37, `react-hooks/set-state-in-effect` |
| `npm.cmd run lint` | 1 | Three errors: one shell, two protected-lab findings; no exercise fixes applied |
| `npx.cmd --no-install tsc --noEmit --incremental false` | 1 | Generated route-contract validation encounters a protected exercise; not a clean typecheck |
| `npm.cmd run build` | 1 | Compilation succeeded, then the same exercise route contract failed TypeScript validation |
| `node <impeccable>/scripts/detect.mjs --json src/shell 'src/app/(game)' src/components/ui` | 0 | Assessment B: `[]`, zero static detector findings |
| Read-only TypeScript AST curriculum inventory | 0 | 13 manifests, 44 checks, 13 three-tier hint entries; no solution decoding |
| `git diff --check` | 0 | Workflow edit has no whitespace errors; Git emitted an LF/CRLF advisory |
| `git diff --exit-code HEAD -- src/app/lab src/proxy.ts src/levels` | 0 | Protected curriculum matches baseline |

First actionable shell error: `Calling setState synchronously within an effect can trigger cascading renders`, at `src/shell/progress.tsx:37`. This is a shell lint issue, not a demonstrated performance measurement.

Whole-project compiler error: `TS2559` in generated route validation. Exercise-specific cause is intentionally omitted from this spoiler-free report. A failing whole-cartridge build is not evidence that the frontend workflow installation broke the app.

### Toolchain Observation

The audit dev server served the map and lesson routes successfully, but logged intermittent Turbopack panics: `Failed to write app endpoint /(game)/page`, caused by `Next.js package not found`. Node independently resolves `node_modules/next/package.json`, so the dependency is present. Root cause is unresolved; classify this as a toolchain/environment investigation, not a proven shell-code defect or expected exercise failure. Panic log: `C:/Users/d69ha/AppData/Local/Temp/next-panic-5d675ed8ad1e261710d9022de62c76c8.log`.

The dev process was stopped after QA (interrupt exit 1). An HTTP probe then failed to connect, confirming port 3002 was no longer serving. No performance or HMR reliability claim should be inferred from this session. Browser synchronization/renderer failures also occurred; fresh-tab recovery enabled the final measurements and screenshots.

## Proposed Follow-Up, Pending Review

1. Confirm the investigation-workspace direction and desired reference-content disclosure before implementing a redesign (`impeccable shape`).
2. Address progress ownership, persistence, and status truth (`harden`), with focused shell tests.
3. Fix reflow and accessible text/status/navigation (`adapt`, `harden`).
4. Improve incident/reference/evidence hierarchy and neutral assistance copy (`layout`, `distill`, `clarify`).
5. Profile the curriculum import opportunity only if it remains worthwhile (`optimize`).
6. Finish approved UI work with `polish`, targeted React/Web Interface Guidelines review, desktop/mobile QA, and the requested follow-up critique.

These are recommendations, not an implementation approval or a completed redesign. Broader server/curriculum analysis and file restructuring follow the user's staged sequence.

## Sources

The primary evidence is the checked-out source, installed framework docs, and browser observations above. The separate UI checklist used the fresh [Vercel Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md). Framework-specific recommendations were checked against the installed Next.js docs rather than copied from another season.
