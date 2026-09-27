---
name: Bugbound Season 2
description: Investigation Desk for learning Next.js through real source-code incidents.
colors:
  amber-index: "#dfbe77"
  primary-ink: "#20211e"
  teal-focus: "#95c9c8"
  teal-tool: "#93b9b9"
  graphite: "#1b1e20"
  deep-graphite: "#131719"
  foreground: "#eceeea"
  muted-text: "#aeb7b6"
  rule: "#394143"
  input-border: "#4e595a"
  popover: "#24292b"
  hover: "#353e40"
  reference-surface: "#24292b"
  reference-ink: "#eceeea"
  reference-code: "#95c9c8"
  reference-code-bg: "#303638"
  pass: "#9bcead"
  fail: "#ffa5a8"
  destructive: "#b94348"
  selection: "#c0aa70"
  locked-index: "#929c9b"
  rail-footer: "#949f9e"
  preview-label: "#bed5d2"
  preview-address: "#b6c0c0"
  failure-detail: "#f4b5b5"
  reference-emphasis: "#eceeea"
  completion-surface: "#23332e"
  completion-detail: "#bcc9c3"
  recovery-surface: "#332d26"
  notice-surface: "#302e27"
  notice-rule: "#5a5442"
  notice-text: "#cfcec4"
  notice-reassurance: "#eeeadd"
  section-link: "#bdd6d2"
typography:
  sidebar-heading:
    fontFamily: "Geist, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "0"
  compact-state:
    fontFamily: "Geist, sans-serif"
    fontSize: "10px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
  metadata:
    fontFamily: "Geist, sans-serif"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
  navigation:
    fontFamily: "Geist, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0"
  source-code:
    fontFamily: "Geist Mono, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
  incident-prose:
    fontFamily: "Geist, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0"
  incident-prose-narrow:
    fontFamily: "Geist, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0"
  evidence-heading:
    fontFamily: "Geist, sans-serif"
    fontSize: "15px"
    fontWeight: 550
    lineHeight: 1.5
    letterSpacing: "0"
  brand:
    fontFamily: "Geist, sans-serif"
    fontSize: "20px"
    fontWeight: 650
    lineHeight: 1.15
    letterSpacing: "0"
  brand-narrow:
    fontFamily: "Geist, sans-serif"
    fontSize: "18px"
    fontWeight: 650
    lineHeight: 1.15
    letterSpacing: "0"
  next-incident-title:
    fontFamily: "Geist, sans-serif"
    fontSize: "23px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0"
  headline-mobile:
    fontFamily: "Geist, sans-serif"
    fontSize: "26px"
    fontWeight: 550
    lineHeight: 1.2
    letterSpacing: "0"
  headline-narrow:
    fontFamily: "Geist, sans-serif"
    fontSize: "24px"
    fontWeight: 550
    lineHeight: 1.2
    letterSpacing: "0"
  register-title-mobile:
    fontFamily: "Geist, sans-serif"
    fontSize: "28px"
    fontWeight: 550
    lineHeight: 1.2
    letterSpacing: "0"
  incident-number-mobile:
    fontFamily: "Geist Mono, monospace"
    fontSize: "36px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0"
  headline:
    fontFamily: "Geist, sans-serif"
    fontSize: "30px"
    fontWeight: 550
    lineHeight: 1.2
    letterSpacing: "0"
  register-title:
    fontFamily: "Geist, sans-serif"
    fontSize: "32px"
    fontWeight: 550
    lineHeight: 1.2
    letterSpacing: "0"
  reference-title:
    fontFamily: "Geist, sans-serif"
    fontSize: "22px"
    fontWeight: 550
    lineHeight: 1.25
    letterSpacing: "0"
  body:
    fontFamily: "Geist, sans-serif"
    fontSize: "14px"
    lineHeight: 1.5
    letterSpacing: "0"
  reference-body:
    fontFamily: "Geist, sans-serif"
    fontSize: "14px"
    lineHeight: 1.8
    letterSpacing: "0"
  incident-number:
    fontFamily: "Geist Mono, monospace"
    fontSize: "42px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0"
  command:
    fontFamily: "Geist, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    letterSpacing: "0"
rounded:
  inline-code: "2px"
  navigation: "4px"
  control: "5px"
  preview: "6px"
  dialog: "8px"
spacing:
  compact: "8px"
  control-gap: "12px"
  narrow-gutter: "16px"
  paragraph-gap: "20px"
  compact-gutter: "22px"
  overlay-padding: "24px"
  workspace-gutter: "28px"
components:
  button-primary:
    backgroundColor: "{colors.amber-index}"
    textColor: "{colors.primary-ink}"
    typography: "{typography.command}"
    rounded: "{rounded.control}"
    padding: "0 11px"
  button-outline:
    backgroundColor: "rgb(78 89 90 / 32%)"
    textColor: "{colors.foreground}"
    typography: "{typography.command}"
    rounded: "{rounded.control}"
    padding: "0 11px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    typography: "{typography.command}"
    rounded: "{rounded.control}"
  button-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "#ffffff"
    typography: "{typography.command}"
    rounded: "{rounded.control}"
    padding: "0 11px"
  incident-navigation:
    textColor: "{colors.foreground}"
    rounded: "{rounded.navigation}"
    padding: "8px 9px"
  concept-reference:
    backgroundColor: "{colors.reference-surface}"
    textColor: "{colors.reference-ink}"
    typography: "{typography.reference-body}"
    padding: "29px 27px 40px"
  reference-code:
    backgroundColor: "{colors.reference-code-bg}"
    textColor: "{colors.reference-code}"
    rounded: "{rounded.inline-code}"
    padding: "1px 3px"
---

# Design System: Bugbound Season 2

## Overview

**Creative North Star: "Investigation Desk"**

Investigation Desk is Bugbound Season 2's code-led visual world: a graphite working environment with amber incident indexing, restrained teal tool details, and a subtly lifted graphite Concept reference surface. It carries the Bugbound naming and incident notation forward with warm, readable typography and purposeful detail.

The system is flat and task-focused. Persistent navigation, ruled information, a framed live route, and a dedicated reference surface establish hierarchy without turning every section into a card. The current implementation and approved PRODUCT.md commitment are the authority; no approved generated comp or quality-bar card is recorded.

**Key Characteristics:**

- Graphite working surfaces with a subtly lighter reference surface.
- Amber indexing and primary commands; teal focus and tool details.
- Readable Geist prose with selective Geist Mono incident notation.
- Ruled sections, compact native controls, and explicit progress states.

Extracted from `src/shell/workspace/workspace.css`, the workspace components, and installed coss UI primitives. This document describes the built shell, not the retained console stylesheet or the independent exercises.

## Colors

Amber identifies incidents and primary commands; teal makes tools and focus discoverable. Graphite contains the active work, while a subtly lighter graphite reference surface separates sustained reading from verification without a bright light-dark split.

### Primary

- **Amber Index** (`amber-index`): incident numbers, navigation group labels, register act indices, saved count, brand icon, and primary command fill.
- **Primary Ink** (`primary-ink`): text on amber commands.

### Secondary

- **Teal Focus** (`teal-focus`): keyboard outline and interactive tap feedback.
- **Teal Tool** (`teal-tool`): source-file icons. `preview-label` and `section-link` distinguish the live route and mobile section links.
- **Selection** (`selection`): selected text, distinct from command fill.

### Neutral

- **Graphite / Deep Graphite**: main work surface versus header and navigation rail.
- **Foreground / Muted Text**: main reading and supporting metadata; status remains expressed in text.
- **Rule / Input Border / Popover / Hover**: separators, outlined controls, overlays, and interactive emphasis.
- **Reference Surface / Reference Ink**: the expanded Concept surface.
- **Reference Code / Reference Code Background**: inline code within Concept prose.

Pass and fail tints identify verification results alongside icons and words. Destructive red is reserved for the explicit reset action. Completion and storage recovery use localized green and warm-brown bands; they do not recolor the whole workspace.

Supporting roles are explicit in the frontmatter: `locked-index` and `rail-footer` for navigation, `preview-address` for the route, `failure-detail` for technical results, and `reference-emphasis` for Concept emphasis. Completion uses `completion-surface` and `completion-detail`; persistence recovery uses `recovery-surface`. The desktop-use notice has its own surface, rule, text, and reassurance roles. These are existing component states, not additional general-purpose brand accents.

## Typography

Geist is loaded with `next/font/google` into `--font-geist-sans`; Geist Mono is loaded into `--font-geist-mono`. The workspace uses sans-serif fallbacks and selective monospace for incident numbering, source paths, and technical details. Letter spacing is zero throughout the shell and its overlays.

The frontmatter records desktop, supporting, and responsive roles. Incident report prose uses a larger reading size (16px, line-height 1.65, maximum 75ch), reducing to 15px only at the narrow breakpoint. Metadata is generally 11-12px, navigation titles 12px, and command text 13px. The 10px step is reserved for narrow register states, never reading prose. Component-specific brand, next-incident, and responsive title roles are not interchangeable body sizes. The interface has no marketing-scale display heading.

Concept paragraphs retain their full content, generous line-height, and 20px paragraph separation. Strong emphasis uses weight 650. Inline code is 12px and wraps; source paths remain selectable. The Incident label is horizontally centered over its number with an 8px gap.

## Layout

The spatial grammar uses persistent context around unframed work. Sections are separated by rules and whitespace; only the actual route preview and overlays need enclosing boundaries. The desktop workspace fills the available width. The register alone is constrained to 1300px.

The header is sticky with a 66px minimum height and contains the Bugbound brand and saved progress, without a static Investigation desk / Next.js label. The desktop navigation rail is 260px wide, sticky below the header, and independently scrollable. A labeled collapse icon beside the register link reduces it to a 64px rail. The same button remains mounted and focused in the rail's top row, changing to Expand; it never relocates to the header. Hidden navigation content leaves both the visual layout and keyboard order, while its disclosure state is retained. The brand and header stay fixed. This preference lasts within the mounted workspace, without writing progress or storage. The investigation and its Concept reference share the remaining width, with the reference at 350px. The reference is a continuous column, not a floating card. The Evidence toolbar sticks below the header.

Responsive behavior is exact:

- At widths below 1200px: reference 310px; selected content gutters 22px. The expanded desktop rail remains 260px to keep group names and the register link on one line.
- At widths up to 1100px: rail becomes a left navigation Sheet; header becomes a flex row; the content retains a 340px reference column until the next breakpoint.
- At widths up to 760px: investigation and full Concept stack; Report, Evidence, Concept, and Hints anchor links appear. The reference follows the investigation in source order. Incident titles become 26px and register titles 28px.
- At widths up to 420px: main gutters become 16px; incident title becomes 24px; the preview label is hidden to conserve space. The 32px Bugbound mark remains visible beside the wordmark.

The header uses the user-supplied vector mark at `public/bugbound-icon.svg`, with an amber silhouette and deep-graphite code details. The simplified mark at `src/app/icon.svg` supplies the favicon through Next.js metadata. Both retain transparent backgrounds and the existing palette; the wordmark stays live text.
- At widths from 1600px: reference expands to 400px with 34px inline padding; preview height grows from 360px to 420px.
- The preview is 350px tall at widths up to 420px.
- At widths up to 1100px **or** with both `hover: none` and `pointer: coarse`: enlarge workspace/overlay buttons from a 36px minimum height to 44px. Icon buttons use matching square dimensions. Coarse input alone does not replace the rail; that change is width-based.
- At widths up to 760px **or** with both `hover: none` and `pointer: coarse`: show the desktop notice. A narrow fine-pointer desktop window beside an editor does not get it, matching Season 1's rule (owner decision, 2026-09-26).

The notice's exact copy and route composition are recorded in the surface brief. Header safe-area padding, wrapping paths, and minimum-width-zero grid children protect constrained layouts.

## Elevation & Depth

The shell relies on tonal surfaces and one-pixel rules. Its button override removes box shadows; the verification toolbar has no enclosing border or background. The Concept surface obtains separation through a subtle graphite lift and a single structural divider, not a colored card edge.

Installed coss UI Sheet, AlertDialog, and Tooltip popups retain their subtle library overlay shadows and edge highlights. Sheet and reset-dialog backdrops use black at 32% opacity with a small blur. This overlay treatment does not authorize glass or shadows on ordinary page sections.

Accordion height and indicator motion, Sheet translation/opacity, and dialog scale/opacity use the installed 200ms transitions. Reduced-motion preferences disable animation and transitions within the shell and desk overlays. No decorative status pulsing is part of this world.

## Shapes

Small radii distinguish controls, navigation rows, inline code, and the live route. The reset dialog uses an 8px radius. Ordinary report, verification, hints, and register sections have no card silhouette. The reference divider is structural; colored side-border cards are prohibited.

## Components

### Buttons and Composition

The active controls use the installed coss UI Button implementation with Base UI `useRender` and `mergeProps`. Navigation uses `render={<Link ... />}`; TooltipTrigger, ToolbarButton, SheetTrigger, and AlertDialog controls compose through `render`.

The workspace styles buttons through stable `data-size` and `data-variant` attributes. Do not depend on `data-slot="button"` for shared button sizing: the outer Base UI primitive can supply its own slot. This applies to portaled controls through `desk-overlay` as well.

Default buttons are amber; outline buttons use a faint input-colored fill; ghost icon commands are transparent until hover; destructive reset is red. Minimum dimensions follow Layout. Hover and pressed states come from the coss variants. Disabled controls dim to 64% opacity and reject pointer interaction. Keyboard focus adds a 2px teal outline with 3px offset. Icon commands use Lucide, explicit accessible names, and contextual Tooltips.

### Incident Navigation and Register

Navigation is a grouped coss Accordion with amber single-line group names, no group-number prefix, amber lesson indices, muted locked items, and an active background. The register link is text-only and stays on one line; no decorative list icon competes with the collapse control. Groups expand independently; the current lesson group starts open and other groups closed. On the register, all groups start open. Route changes reset this disclosure to reveal the destination group. Links use `aria-current="page"`; unavailable incidents are inert labeled items. The register presents a next-incident band followed by three acts of rows, not a card grid. Saved completion and completion during this visit have different labels.

Incident register is the sidebar's visible h2 and a real navigation link. It uses the 16px semibold sidebar-heading role, left-aligned with the group headings and lesson numbers, with no underline, and a tonal background on hover or keyboard focus. The heading link uses the same 9px horizontal inset as the group triggers and lesson rows; the collapse control stays in its separate right-hand track. A single rule below its row separates it from the act accordions; their coss h3 headings follow this visible heading. The collapse control remains a separate button. The row has a stable 57px minimum including its 12px bottom inset and 1px rule, so hiding the heading does not move the toggle vertically.

### Investigation and Reference

Incident report and source-file rows lead directly into Evidence with one shared divider: the last source row has no bottom border, the report has no bottom padding, and the Evidence toolbar supplies the rule. Source rows provide a copy icon, an inline success checkmark and Copied tooltip, and a persistent live region for announcements. Empty and successful feedback takes no extra layout height. Copy failures reveal a readable manual-copy fallback below the paths. The real route has a framed address bar with open-in-tab and reload controls. Verification rows expose their name and state before a run; results use icon, word, and color together. Running can be cancelled. Engine errors provide recovery text and optional technical details.

The full Concept remains expanded in its graphite reference column. Soft off-white prose, muted labels, and teal inline code maintain readable contrast. `Prose` renders inline code, emphasis, and strong emphasis without changing the supplied lesson text.

### Hints and Overlays

Hints use the coss Base UI Accordion with multiple independently open items; all start closed. The navigation Sheet opens from the left and closes on incident navigation. Reset uses a coss Base UI AlertDialog with Keep progress and Reset progress actions, plus a description of the effect on completion and active checks. Its `bottomStickOnMobile` is false.

The active workspace does not use an editable input, chip, or Card component. Retained `card.tsx`, `badge.tsx`, and other legacy files are inventory, not authority for this surface. No replacement primitive has been invented for documentation.

## Do's and Don'ts

### Do:

- Do keep the full Concept reference expanded beside the investigation on desktop.
- Do use coss UI controls with Base UI render composition and stable data-size/data-variant styling.
- Do preserve readable wrapping, visible focus, reduced-motion behavior, and labeled icon actions.
- Do distinguish earned completion, saved completion, and the latest verification result.
- Do keep design changes scoped to the workspace; the lab retains its independent visual world.

### Don't:

- Don't restore colored side-border cards, decorative dot grids, terminal costume, or decorative dashboard metrics.
- Don't promote retained legacy Card or Badge primitives into the Investigation Desk's visual authority.
- Don't collapse the Concept reference or turn optional hints into automatically revealed guidance.
- Don't treat code-led direction as evidence of an approved generated comp or quality-bar card.
