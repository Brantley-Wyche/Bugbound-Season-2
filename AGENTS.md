<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
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
