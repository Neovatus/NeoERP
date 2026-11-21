# Claims — two Macs, two leads (Jabran 2026-11-21)

Write a line before starting, remove it when done. Never touch work the other lead has claimed.

| Mac | Lead | Claimed | Branches | Since |
|---|---|---|---|---|
| New Mac (Ultra) | lead on probation | QA batch 2: Lane 0, fix lanes R01–R30, retest; DOCS-1 (merged), ISO-1 ADR-026 draft, DOCS-2a/2b/2c, Accounts roadmap draft; docs lanes UX-1 → HRP-DES (HR/Payroll design refresh) → INV-SCOPE (Items/Inventory scope), then Purchase/Sales/Reports scope one at a time; later ROADMAP-P; **HR/Payroll v2 build** on `phase/hrp-v2` once Jabran approves the HRP-DES change list (batch 2 keeps Gradle-lock priority, one build at a time) | `phase/4-b2-*` lane branches only (now: lane0-app, ux1; docs2-be merging; next: hrp-des, inv-scope after UX-1's review) | 2026-11-21 |
| Old Mac (Team) | overseeing lead | Reviews each new-Mac lane before it merges; reconciles state; may take over the HR/Payroll stream from Monday with its own Gradle lock (Jabran 2026-11-21) | `phase/hrp-v2` (only after a handover from the new Mac) | 2026-11-21 |

## New-Mac lead rules (Jabran 2026-11-21; this lead only, the old-Mac lead's process is unchanged)
1. Every sub-agent the new-Mac lead starts runs at **High** effort.
2. An open decision where the lead has a recommendation is written to [lead-decisions.md](lead-decisions.md): question, options, pick and **why**. A fresh Fable 5.2 reviewer at high effort (given the entry and its sources only) approves or rejects it. APPROVE → the lead acts. REJECT or still open → Jabran. Critical decisions (money, security, approved scope, product direction) go to Jabran directly, with the Fable view attached. Decisions Jabran already owns stay his.

## Merged lanes
- 2026-11-21 Lane 0 BE: fast-forward of BE `phase/4` to `5e00b131` (verdict MERGE). `scripts/install-hooks.sh` run in this Mac's BE checkout; old Mac: run it after pulling.
- 2026-11-21 DOCS-2a: fast-forward of App `phase/4` to `f19a101b`.
- 2026-11-21 ROADMAP-A, ISO-1: merged to workspace `master` as drafts (3b28e8b, c79edb3).
- 2026-11-21 DOCS-1: `phase/4-b2-docs1` merged to workspace `master` as 16112eb (verdict FIX 1 applied in 5106364, no second verdict per lane-verdict-docs1.md). Memory deletes from proposals.md still to do: each file removed from this Mac's memory, `docs/lead-memory/` and MEMORY.md in one commit; old-Mac lead deletes the same files there.
