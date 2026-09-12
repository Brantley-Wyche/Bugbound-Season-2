# Sidebar Rail and Divider Correction

## Changes

User-approved follow-up to the browser-comment refinements. The expanded desktop sidebar is now 260px, including at the 1166px reference viewport. Register and act headings remain single-line without smaller type; the decorative register list icon is removed. Collapse leaves a 64px rail and preserves the same mounted, focused button in its top row. The header and brand no longer change position. Navigation disclosure state is retained while hidden.

The earlier clipboard cleanup removed the empty live-region height but missed two adjacent borders and 10px report padding. The final source row now has no bottom border, the report has no bottom padding, and Evidence owns the sole divider. Error feedback still appears when copying fails.

## Frontend Workflow

- Impeccable polish/adapt: inspected expanded and collapsed desktop screenshots, the mobile Sheet, and five viewport measurements. The requested one-line labels, fixed header, compact rail, and single divider are visible and verified.
- Impeccable technical audit: the hook stopped repeating CSS hints after its per-session edit threshold, so a targeted manual detector run covered all three changed UI files. Exit 0, no findings. No ignore or suppression was added by this pass.
- React Best Practices: eliminated the focus-transfer effect and three refs instead of adding more synchronization. The same coss Button remains mounted; state updates remain functional. No data requests, new dependencies, persistence changes, layout reads in render, or artificial memoization were introduced. Final focused recheck found no actionable issue.
- Web Design Guidelines: fetched upstream rules and checked semantic navigation/actions, accessible names, focus retention, aria-expanded/aria-controls, hidden content, target sizes, and responsive wrapping. The collapse command now references the actual accordion container rather than its containing sidebar. Final focused recheck found no actionable issue. Existing sentence case and purposeful coss disclosure motion remain consistent with the approved system.

Guidelines: https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md

## Regression Evidence

The strengthened browser test failed before implementation with three wrapping labels: Incident register, Routes & server boundary, and Data, caching & mutations. It now passes and verifies:

- 260px expanded sidebar and 64px visible collapsed rail.
- Same DOM button and focus across both states; unchanged vertical position and unchanged brand rectangle.
- Single-line register and group labels in the desktop sidebar and 320px mobile Sheet.
- Exactly zero source-to-Evidence gap at 1440, 1166, 1024, 390, and 320px; no bottom border on the last source row and one 1px Evidence top border.
- Existing accordion defaults, keyboard disclosure, clipboard success/failure, Concept contrast, and direct-route group selection.
- No horizontal document overflow or runtime errors.

Latest captures and metrics are in ../review/refinement-evidence.json, ../review/refinement-1166.png, ../review/collapsed-desktop.png, and ../review/refinement-mobile-nav.png. The existing seven-view browser suite also passed its eight interaction groups. These are bounded refinement checks, not a new full-app independent critique or accessibility certification.

## Validation

| Command | Exit | Result |
| --- | --- | --- |
| node tests/browser/workspace-refinements.mjs, before edits | 1 | Expected assertion failure on wrapping labels |
| node tests/browser/workspace-refinements.mjs, after edits | 0 | All new and retained assertions passed |
| node tests/browser/workspace.mjs | 0 | Seven captures, eight interaction groups passed |
| npm.cmd run lint:shell | 0 | Passed |
| npm.cmd run typecheck:shell | 0 | Passed |
| npm.cmd run test:shell | 0 | 18 tests passed |
| Impeccable detect.mjs --json on changed UI files | 0 | No findings |
| Node validation of DESIGN.md and sidecar references | 0 | Passed |
| git diff --check | 0 | Passed; existing line-ending notices only |
| git diff --exit-code -- src/app/lab src/proxy.ts src/levels | 0 | Intentional curriculum unchanged |
| npm.cmd run lint | 1 | Two unchanged protected exercise errors; first diagnostic: Cannot call impure function during render |
| npm.cmd run build | 1 | Compiled successfully; existing generated lab route-validator typecheck failure remains |
| Invoke-WebRequest to the lesson after build | 0 | HTTP 200 |

The dev server remains on http://127.0.0.1:3002 in owned session 9452. No package installation, commit, push, or deployment. No screen-reader execution or production performance benchmark. Protected exercise diagnostic details are omitted to preserve blind mode.
