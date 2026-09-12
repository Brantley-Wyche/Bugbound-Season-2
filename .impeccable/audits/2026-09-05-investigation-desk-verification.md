# Investigation Desk Verification

## Scope and implementation

User-approved Season 2 redesign on main. No commit, push, or deployment. Season 1 was read-only context. The next broader code and file-structure audits remain separate work.

- Actual coss registry components installed through shadcn: Button, Accordion, Tooltip, AlertDialog, Sheet, Toolbar, plus their Spinner and ScrollArea dependencies. Runtime foundation: @base-ui/react 1.8.x.
- Persistent incident navigation; central report/source/evidence; full expanded Concept reference. Flat register rows replace the original card grid.
- Tablet/mobile notice uses Season 1's wording, with Next.js replacing Vite. Visible at widths <=1100px or coarse, non-hover pointers; lessons remain browsable.
- Copyable paths, coss tooltips, mobile navigation sheet, safe reset confirmation, native section anchors and sticky verification controls.
- Protected labs retain their original visual language inside the preview. No lab/proxy/level/check/hint source changed.
- Existing cancellation, generation-scoped additive progress, persistence retries, and distinction between historical completion and current verification are preserved.

## Verification commands

| Command | Exit | Outcome |
|---|---:|---|
| npm.cmd run test:shell | 0 | 18 passing harness/store regressions |
| npm.cmd run lint:shell | 0 | Final changed shell, components and tests pass |
| npm.cmd run typecheck:shell | 0 | Shell and imported curriculum contracts pass |
| node tests/browser/workspace.mjs | 0 | 7 responsive captures, 8 interaction groups, no browser runtime exceptions |
| git diff --check | 0 | No whitespace errors; Windows line-ending warnings only |
| git diff --exit-code -- src/app/lab src/proxy.ts src/levels | 0 | Protected source unchanged |
| npm.cmd run lint | 1 | Two existing findings confined to protected exercise content |
| npm.cmd run build | 1 | Production compilation succeeds; generated protected lab RouteHandlerConfig type mismatch blocks full build |
| Impeccable detect.mjs --json src/shell "src/app/(game)" src/components/ui | 0 | Exactly one final assessment scan: [], zero rule names/locations |

Browser command used PLAYWRIGHT_MODULE_PATH pointing to the Codex bundled Playwright installation and the installed Edge browser. No production browser-testing dependency was added. TEST_BASE_URL was http://127.0.0.1:3002. Evidence: ../review/browser-evidence.json and nine PNGs.

## Browser coverage

Lesson: 1440x1000, 1265x720, 1024x900, 390x844, 320x740. Register: 1440x1000 and 390x844. Additional captures: mobile navigation and reset confirmation. All layouts have no horizontal document overflow, closed initial hints, correct notice visibility and no undersized composed Button controls (36px desktop; 44px tablet/phone; icon width included).

Interactions: navigation sheet dismissal and focus return; reset confirmation default focus and non-destructive dismissal; clipboard success/failure feedback; hint disclosure and closure; cancellation and frame cleanup; original failing exercise checks; locked incident and unknown incident recovery. Mobile Concept anchors are additionally asserted to land below the sticky header. Browser checks use a fresh isolated context and do not alter the user's progress.

Success/save-failure UI was not fault-injected in this redesign browser pass. Existing store/harness tests cover persistence and abort edge cases. No screen-reader execution, all-incident visual sweep or production performance benchmark was performed.

## Audit and critique

Impeccable discovery/shaping followed the user-pinned, code-led direction. Adapt, harden, clarify and polish informed the implementation. A fresh audit and dual-agent critique followed browser QA. React Best Practices and current Web Interface Guidelines were reviewed against the actual Next16/React19 shell, without applying recommendations to protected exercises.

Assessment A (/root/desk_design_review): independent design score 35/40, Good; combined generic-role finish disposition ship for supplied visual scope. Assessment B (/root/desk_technical_review): independent detector, source, DOM, keyboard and responsive review. A finished before B findings entered synthesis.

One P2 integration finding: Base UI composition replaced data-slot=button and bypassed shell sizing rules. A new regression reproduced five affected desktop controls. Stable data-size/data-variant selectors corrected it; the final seven-view suite passed. Assessment B then independently scored this exact fix resolved and found no further issue in its focused final Web Interface Guidelines/React integration review. This is a fix-specific closure, not whole-app certification.

The mobile Concept anchor uncertainty from A was independently resolved by B: heading y=112, header bottom=66, visible gap=46px.

Guidelines: https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
Components: https://coss.com/ui/docs/get-started

## Environment and process limits

The initial package install encountered npm-cache permissions, then certificate validation failure. The authorized elevated retry used command-scoped NODE_OPTIONS=--use-system-ca; TLS verification remained enabled. The same setting allowed the configured font build to compile.

Writing screenshot artifacts during browser interactions provoked dev-watcher reloads and intermittent generated JSON read failures. Deferring all screenshot writes until after interactions made the suite pass, and it passed again after the control-size correction. This is a test-environment observation, not a planted-exercise fix.

The browser API permits read-only DOM evaluation, so no Impeccable overlay was injected and no detector visualization server was started. Source, screenshots and DOM measurements were used instead. Assessment tabs were closed and viewport overrides reset.

User-pinned direction overrides concept discovery. The concept-seed attempt ran but external catalog access was unavailable; no approved comp or quality-bar card exists. The platform could not spawn another named finish reviewer (agent thread limit reached), so the fresh independent design reviewer also applied the finish contract. Documentation used an available worker and actual source as its authority.

## Post-documentation hook triage

After DESIGN.md was generated, the Stop hook reported 12 design-system mismatches in the old PanelTitle helper and shared globals. All were reviewed against actual usage, not suppressed as a group.

- Removed the unreferenced PanelTitle component, including its old 11.5px console heading and decorative bar.
- Replaced the stale shell focus literal with var(--ring) and corrected outdated global-style comments. The workspace already overrides that fallback, so the rendered focus treatment is unchanged.
- Preserved ten lab-only finding instances through nine exact-value, file-scoped exceptions in .impeccable/config.json, written using hook-admin.mjs. Four font sizes (15.5px, 10.5px, 25px, 15px) and five original lab colors are exempt only in src/app/globals.css. No rule-wide or file-wide ignore was added.
- Standing findings: none for these targets. Targeted detector, lint:shell and typecheck:shell all completed with exit 0. No PanelTitle references remain in source, tests or design documentation. The lab styles themselves were not changed.

## Workspace token follow-up

The subsequent Stop hook reported 59 design-system findings in workspace.css. These were checked against the reviewed implementation: the frontmatter omitted supporting and responsive typography and component-state colors described only in prose.

- Removed the unused case-heading paragraph and divider selectors; LevelPage renders an h1 and case-meta div instead. This removes two finding instances without changing the rendered page.
- Documented 15 existing semantic colors and 14 typography roles covering the 12 omitted size steps in DESIGN.md. Synchronized sidecar metadata and eight-step color ramps. This resolves the other 57 finding instances without changing active styles.
- Added no suppressions; no findings remain in the targeted workspace.css and globals.css detector run (exit 0).
- Design YAML, sidecar metadata, ramps, and token references validated (exit 0); lint:shell and git diff --check passed (exit 0). The lesson URL returned HTTP 200 (command exit 0).
- This was documentation and unused-CSS cleanup, not another visual critique or redesign. No exercise files or active UI behavior changed; browser screenshots were not repeated for this nonvisual pass.

## Server handoff

The persistent dev server remains at http://127.0.0.1:3002, launched with npm.cmd run dev -- --webpack --hostname 127.0.0.1 --port 3002 and command-scoped system CA trust. Owned execution session: 92208; stop with Ctrl+C in that session. The normal dev script remains unchanged.
