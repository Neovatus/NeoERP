# Claims — two Macs, two leads (Jabran 2026-11-21)

Write a line before starting, remove it when done. Never touch work the other lead has claimed.

| Mac | Lead | Claimed | Branches | Since |
|---|---|---|---|---|
| New Mac (Ultra) | lead on probation | QA batch 2: Lane 0, fix lanes R01–R30, retest; DOCS-1 (merged), ISO-1 ADR-026 draft, DOCS-2a/2b/2c, Accounts roadmap draft | `phase/4-b2-*` lane branches only (now: lane0-app; docs2-be merging) | 2026-11-21 |
| Old Mac (Team) | overseeing lead | Reviews each new-Mac lane before it merges; reconciles state | none | 2026-11-21 |

## Merged lanes
- 2026-11-21 Lane 0 BE: fast-forward of BE `phase/4` to `5e00b131` (verdict MERGE). `scripts/install-hooks.sh` run in this Mac's BE checkout; old Mac: run it after pulling.
- 2026-11-21 DOCS-2a: fast-forward of App `phase/4` to `f19a101b`.
- 2026-11-21 ROADMAP-A, ISO-1: merged to workspace `master` as drafts (3b28e8b, c79edb3).
- 2026-11-21 DOCS-1: `phase/4-b2-docs1` merged to workspace `master` as 16112eb (verdict FIX 1 applied in 5106364, no second verdict per lane-verdict-docs1.md). Memory deletes from proposals.md still to do: each file removed from this Mac's memory, `docs/lead-memory/` and MEMORY.md in one commit; old-Mac lead deletes the same files there.
