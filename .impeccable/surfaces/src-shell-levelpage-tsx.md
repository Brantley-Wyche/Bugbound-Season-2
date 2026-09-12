---
version: 1
slug: "src-shell-levelpage-tsx"
primary_target: "src/shell/LevelPage.tsx"
related_targets: ["src/shell/Workspace.tsx","src/shell/IncidentNav.tsx","src/shell/LevelMap.tsx","src/shell/ChecksRunner.tsx","src/shell/HintBox.tsx","src/shell/SourceFiles.tsx","src/shell/Prose.tsx","src/shell/workspace.css"]
---

# Investigation Desk

## Scope and Mode

Operate, with a Read companion surface. Covers the incident register, investigation workspace, shared navigation, verification controls, optional hints, and expanded Concept reference.

## Audience and Task

A developer moves from incident selection to report, source files, real-route reproduction, source editing, and verification. The register foregrounds the next available investigation. The workspace keeps the selected incident identifiable while the developer switches between the browser and source editor.

## Built Direction

User-approved, pinned Investigation Desk direction implemented code-led. No approved generated comp or quality-bar card is recorded. Current source and the durable PRODUCT.md commitment establish authority; previous critiques do not define the world.

On desktop, the persistent incident rail, central report/evidence flow, and muted graphite expanded Concept reference form the first-viewport composition. The signature is the simultaneous presence of real route evidence and readable reference material. Evidence groups verification controls, the live route, and result rows. Source paths are directly copyable. See DESIGN.md for measured tokens and responsive thresholds.

The desktop sidebar is 260px wide and collapses to a 64px rail with its same toggle remaining in the top row. It never relocates to the header. The text-only register link and amber, unnumbered coss Accordion group names remain on one line; lesson numbers remain. The current act starts expanded. Clipboard success stays within the copy control, while failures reveal manual-copy guidance. Source files meet Evidence at one shared divider with no empty gap.

The register link is also the visible sidebar heading: 16px semibold, left-aligned with the group headings and lesson numbers, without an underline, and separated from the groups by one rule. Its native navigation behavior and distinct hover/focus treatment make the action explicit. The global header contains only the brand and saved progress; the static Investigation desk / Next.js label is removed.

The mobile navigation Sheet replaces the rail. At the narrow layout, section anchors lead to Report, Evidence, Concept, and Hints; the full reference remains expanded after the investigation. The mobile workflow is lesson browsing, with solving explicitly requiring the desktop toolchain.

## Required Notice

Show when the viewport is at most 1100px wide, or when both hover is unavailable and the primary pointer is coarse. Preserve the Season 1 wording adapted to Next.js exactly:

**Use a desktop to work on the exercises.**

Bugbound is a desktop-first project. To fix bugs, edit the actual source files in a local code editor, let Next.js recompile the app, then run the checks in a desktop browser.

You can still browse the lessons here.

## State and Content Constraints

Keep incident completion, successfully saved completion, and current-source verification distinct in every view. Preserve loading, recovery, cancellation, locked navigation, reset confirmation, and manual-copy fallback. Optional hints stay initially concealed. Keep the real lesson, symptom, file references, checks, and lab behavior as supplied.

## Unresolved Decisions

No new design decision is required for this documentation pass. Broader source restructuring is deferred. This brief records the built surface and is not a new proposal.
