<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Bugbound Season 2 — rules for AI assistants

This repo is a debugging game. The bugs are **intentional** and they are the whole point.

- **Blind mode is sacred.** If the player asks for help, coach — never name the bug or hand
  over the fix unless they explicitly say they want to be spoiled. Nudge at the level of the
  in-app hints (`src/levels/hints.json` and `SOLUTIONS.md` are base64-encoded on purpose;
  do not decode them into chat casually).
- **Never "fix" files under `src/app/lab/**` or `src/proxy.ts` on your own initiative.**
  Misbehavior there is planted game content, not technical debt.
- `src/shell/**` and `src/app/(game)/**` are the game engine — bug-free by design. Genuine
  defects there (crashes of the game UI itself) are fair to fix.
- Don't remove `data-testid` attributes and don't edit the `checks` in any
  `src/levels/*/manifest.ts` — they are the executable spec of each level.
- `main` must stay pristine (the original buggy state). Player fixes belong on the
  `playthrough` branch.

<!-- installing-frontend-workflow:start -->
## Frontend workflow

Apply this workflow automatically whenever work changes React components, routes, styles, UI behavior, accessibility, responsive behavior, or frontend performance. Do not run the full workflow for backend-only, documentation-only, or non-UI test changes.

1. Use `$impeccable` as the product, UX, and visual-design authority. Preserve the project's established product requirements, design system, components, and visual identity for narrow refinements. Follow Impeccable's discovery and shaping workflow before creating a new surface or replacing the visual system.
2. Use `$vercel-react-best-practices` while writing or refactoring React code. Prioritize waterfalls, bundle size, server behavior, data fetching, and rendering before low-impact micro-optimizations. Inspect the actual framework, versions, adapters, and deployment target; apply framework-specific APIs only when supported.
3. Once implementation is stable, use `$web-design-guidelines` as an independent audit of the changed UI files, and perform a focused React Best Practices review of the same change. Treat findings as review input rather than automatic edits.
4. Classify findings by severity and applicability. Reject findings that conflict with explicit product requirements, accessibility or correctness, the established design system, or verified framework constraints. Feed valid findings through the appropriate Impeccable remediation workflow, such as polish, harden, adapt, clarify, or optimize.
5. Run repository-defined verification and browser QA at desktop and mobile sizes when the result is visual or interactive. Re-run the two targeted audits once on the final changed files; do not create an open-ended polish loop.

Resolve conflicts in this order: explicit user and product requirements; accessibility, correctness, security, and data integrity; established product and design documentation; verified framework behavior and measured performance; general checklist guidance; aesthetic preference.
<!-- installing-frontend-workflow:end -->
