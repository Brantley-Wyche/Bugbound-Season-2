---
target: Season 2 Investigation Desk (lesson workspace + register), family continuity with Season 1
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:C:\\Users\\d69ha\\Desktop\\bugbound-season-2\\src\\shell\\lesson\\LevelPage.tsx"
target_fingerprint: "sha256:bad1a9d1cf4aaa1f5dff533dd0bb1ee1ec716e7e33b09f3463b434cfeff6f822"
target_path: "C:\\Users\\d69ha\\Desktop\\bugbound-season-2\\src\\shell\\lesson\\LevelPage.tsx"
timestamp: 2026-09-26T18-17-57Z
slug: src-shell-lesson-levelpage-tsx
---
Method: dual-agent (A: design review, Opus 5.5 · B: detector + browser evidence, Sonnet 5)

# Investigation Desk critique: family continuity with Season 1

## Design Specificity Verdict
**LLM assessment:** Specific in vocabulary, generic in structure. The folio, BUG-001, severity, real route frame, Evidence and act names drawn from Next.js concepts are authored. The composition (nav tree / article / aside) is the documentation default, with almost no investigation-only structure: no case record, run timeline or verdict entry. The family advance in capability is real, but S2 lacks every signature S1 added on 2026-09-24 to 26 (IDs on rows, dated ledger, field notes, in-log resolution, workbench, 12px floor, returning-learner hero). It also uses two patterns S1 dropped (top completion banner, broad desktop-notice trigger).

**Deterministic scan:** `impeccable detect` exit 0, no findings, on src/shell, src/app/(game), src/components and src/app/layout.tsx. It was sanity-checked on a synthetic file. The detector's size floor is 11px, so the 11px roles do not trip it.

**Visual overlays:** none. `detect.js` was served truncated (ERR_CONNECTION_RESET), so injection failed.

## Design Health Score (reviewer: Opus 5.5)
| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 2 | Results and the completion band are off-screen at 1440×900 |
| 2 | Match System / Real World | 3 | State uses storage words ("Saved") |
| 3 | User Control and Freedom | 3 | Answer tier opens in one click |
| 4 | Consistency and Standards | 2 | incident/lesson/exercise/investigation/level; completed/saved/resolve |
| 5 | Error Prevention | 2 | Focus lost on Run; notice shown at 960px |
| 6 | Recognition Rather Than Recall | 2 | No record of runs, hints or dates; loop unstated on desktop |
| 7 | Flexibility and Efficiency | 2 | No run shortcut; Next not in the sticky bar; empty collapsed rail |
| 8 | Aesthetic and Minimalist Design | 3 | Register duplicates the rail |
| 9 | Error Recovery | 3 | Failure text is 11px |
| 10 | Help and Documentation | 3 | How-to-play hidden on desktop |
| **Total** | | **25/40** | **Acceptable** |

## Priority Issues
- **[P1] Verify moment out of view; completion split across three places.** Status at y=931 and results at y=964 at 1440×900. The band is inserted at y≈194 with no live region. Run stays amber after completion. ChecksRunner.tsx:101-154, LevelPage.tsx:66-83. Fix: a Closed entry in the verification record plus a sticky verdict, Run and Next workbench bar. Suggested command: $impeccable layout, then $impeccable harden.
- **[P1] Focus drops to body on Run checks.** Native `disabled` on the focused button, ChecksRunner.tsx:107-113. Fix: aria-disabled plus the re-entry guard. Suggested command: $impeccable harden.
- **[P2] No case record (family regression).** No runs, hints or dates; undated "Saved" rows; the same entry for first-timers and returning learners. Fix: a case log store, a case record strip and a docket register. Suggested command: $impeccable shape.
- **[P2] 15 roles at 11px, one at 10px; failure detail is the smallest text.** Fix: 12px floor with simplification; failure messages 13px mono. Suggested command: $impeccable typeset.
- **[P2] Notice condition and loop instruction.** Desktop users beside an editor (961–1100px) are told to use a desktop; above 1100px the loop is never stated. This conflicts with an owner decision. Suggested command: $impeccable clarify / $impeccable adapt.

## Persona Red Flags
- **Jordan:** no "edit in your editor" on desktop; Run appears to do nothing; unframed first failures; answer tier one click away.
- **Sam:** focus lost on Run; completion unannounced; "Act 01Routes…" accessible name; at true 200% zoom, the sticky chrome takes about 28% of the viewport.
- **Alex:** no Ctrl/⌘+Enter, no Open in editor, no run history, Next not sticky, collapsed rail has no index.
- **Returning learner:** undated Saved rows, no last-worked context, no "opened before" hints, everything-locked flash on hard reload.

## Minor Observations
- The mobile Sheet repeats "Incident register".
- The locked page doesn't name the prerequisite.
- Concept measure is about 41ch at 1440.
- Phone order puts the Concept after Hints.
- The register duplicates the rail (26 rows).
- 45 hex literals in workspace.css.
- Doc drift: DESIGN.md card/badge lines, surface brief paths, PRODUCT.md task line, S1's pre-redesign screenshot.

## Questions to Consider
1. Where is the case history on an investigation desk?
2. Should the sticky Evidence bar become the workbench, and completion an entry, never a banner?
3. Is the 260px rail earning its width on the register and when collapsed?
4. Is a developer with a 960px browser beside their editor "not on a desktop"?
5. Should the mono (IDs, log, timestamps) carry more identity than default Geist?
