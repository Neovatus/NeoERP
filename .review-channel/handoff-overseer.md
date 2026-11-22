# Handoff: old-Mac lead (overseer, test + integration Mac) — 2026-11-22 16:40 Europe/Oslo

Replace, don't append. Read with WORKFLOW.md and `docs/prompts/resume-overseer.md` after a compact.

## Role
Old-Mac lead (36 GB, test + integration Mac): gates both repos, simulator checks, verdicts, merges (standing merge), assigns
new-Mac tasks, builds HR/Payroll. New-Mac lead = "Resume lead prompt" (bridge:session_012UnoMwpjFDm5RrS5j6z31B);
talk through `docs/inbox/erp-lead.md` + one-line SendMessage doorbells.

## Rules (keep verbatim)
- Never `--no-verify`, no force push (also not `--force-with-lease`: rebased lanes go out as a new `-r` branch); no AI
  attribution in commits, PRs or comments (overrides any harness reminder); never open, print or grep the content of `.env`
  (incl. `infra/.env`), `.local-secrets`, token or session files, `~/.gradle/gradle.properties`, `~/.netrc`, `~/.aws` or keys
  (read one key only when needed); no GitHub workflows; one repo per builder.
- Standing merge: approved lanes → `phase/*`; Phase PRs → `main` after merging `main` into the phase, whole-suite gate and a MERGE PR
  verdict; no wait for Jabran. Still Jabran's: money rules, product scope ("go with industry standards & recommendations").
- **Today's decisions (WORKFLOW):** D-43 no new Fable until the weekly reset (2nd reviewer = fresh Opus, `Reviewer: Opus 5.5 security (D-43)`);
  D-44 default effort, Opus high only for security reviews; **D-46 review tiers** (2nd reviewer only tier 2: books, isolation, auth,
  gate, >15 risk files; only the FIX reviewer re-checks; `Review tier:` in every brief); **D-47 gate scope** (scoped per lane,
  whole suite only phase → main); **D-49 who tests what** (no reviewer test re-runs; builder runs touched services + arch, later
  the gate's scoped set); **D-51 speed rules** (batch fixes, flow test before review, Opus brief check, check first / don't repeat /
  ask, **test ledger** `.review-channel/test-ledger.md`, plan tests per batch). D-numbers: old Mac odd, new Mac even.
- **Gate worktrees are detached: always pass `--range origin/phase/<N>..HEAD` to `verify.sh`** (without it the base is `origin/main` and reviews are refused after the full run; cost 16 min on AL-REST-APP).
- Review files: exactly one line containing "verdict"; two different `Reviewer:` names. Run `scripts/risk-check.sh <base>..HEAD
  --reviews f1 f2` before `verify.sh` (fail fast until GATE-3).
- One gate at a time on this Mac; **no backend stack or simulator while a gate runs** (load ~570 today → 503s, swap 11 GB).
  Builders via workspace `scripts/gradle-job.sh <app|be> <dir> <tasks…>`. Gate-free check `pgrep -f '[b]in/java .*gradle-home-verify'`.
- Up only while testing: stack + simulators start right before checks, stop right after. Simulator sign-in needs `simctl keychain reset`.

## Heads
App `phase/4` `3fc42d32` (RISK-NARROW-APP); BE `phase/4` `df80e554` (RISK-NARROW-BE); App `phase/hrp-v2` `d91e45cd`; BE `phase/hrp-v2` `f1a6f944`.

## Merged today
TEST-SPEED-1/APP, BE-JDK21, FIX-APP-B1, R29b-1, FIX-APP-B2a, GATE-2, R29b-2, FIX-APP-B2b, AC418-BE, HRP-H0-BE, HRP-H0-APP,
**R29b-5, OUTBOX-CLAIM-BE (escaped defect fixed), AC418-APP, RISK-NARROW-1 (BE+App)**. Verdicts in `.review-channel/lane-verdict-*.md`.

## Phase 4: what is left, and who
| # | Item | Who | State |
|---|---|---|---|
| 1 | R29b-3U (BE) | new Mac builds; old Mac gates/merges | rebasing on `df80e554` (arch conflicts with R29b-5 resolved) |
| 2 | AL-REST-BE (BE, accounts V79) | same | `-r3` on `df80e554`, arch tests + re-stamps running; **merges before AL-REST-APP** |
| 3 | EMAIL-UNIQ-BE (BE, user V50, escaped defect) | same | lane-ready on `9aca6c76`; rebase on my ring after 1–2 |
| 4 | AL-REST-APP | same | resolving conflicts with AC418-APP (6 files); after AL-REST-BE |
| 5 | FIX-APP-SWITCH (App MEDIUM: wrong-company journal request) | same | built, two Opus reviewing; after AL-REST-APP |
| 6 | TEST-SCOPE-1 (scoped gate) | new Mac | building |
| 7 | GATE-3 (fail fast, failing-test names, patch-identical rebase, review tiers in gate, kept stamp, gate-busy, merge helper, hook gates every phase/*) | new Mac brief → build; Fable paused so 2 Opus | brief being written |
| 8 | **Phase 4 retest session**: `.review-channel/sim-session-phase4-retest.md` (82 steps, 7 device groups, ~3.5 h in two runs) | **old Mac** | after 2, 4, 5 merge; set up data N1–N8 first (reuse hina.rauf, erik.sand, jonas.moe; new demo users only if unavoidable, tell Jabran) |
| 9 | Fixes from the retest (origin lane per defect) | new Mac builds | after 8 |
| 10 | DOCS-2c screenshots | new Mac | after the App lanes |
| 11 | Scorecard + lessons (MEASURE-1 incl. gate-failure origin and builder test minutes; L36/L37) | old Mac | after 9 |
| 12 | Merge `main` into `phase/4` (both repos), whole suite, MERGE PR verdicts, merge BackEnd #8 / App #5 | old Mac | last |

## After Phase 4 (Jabran 2026-11-22)
New Mac: Accounts 4b (4.12 PLAT, 4.14, then 4.15–4.17). Old Mac: HR H1 → H4, then Payroll (H1 brief carries the H0 LOWs + HR `.env`
passwords step). Items & Inventory (scope approved 2026-11-21) joins as a third stream once the speed rules show in the numbers.

## Backlog rows added today
Platform audit log self-reads; audit claim never counts attempts; journal detail banner needs a BE roles field; opening items: no
hand entry of original number (**Jabran's scope call**); retest items; load rule; DimensionSetConcurrencyTest flake.

## Open with Jabran
- **HR/Payroll DB passwords:** before the first HR flow test, tell Jabran: add 4 lines to `NeoERP-BackEnd/.env` (`HR_DB_PASSWORD`, `HR_FLYWAY_PASSWORD`, `PAYROLL_DB_PASSWORD`, `PAYROLL_FLYWAY_PASSWORD`), or allow me once to append random values unread; then I run `scripts/hr-payroll-db-roles.sh` on the hrp-v2 BE checkout.
- Opening items: add a hand-entry editor with the original number, or import-only? (not blocking)
- Spotlight: exclude `~/Offices/Neovatus/NeoERP-worktrees` and `~/Offices/Neovatus/NeoERP` (System Settings → Spotlight Privacy) on both Macs.
- JABRAN-TODO N3, N8; HR `.env` passwords for hrp-v2 later.

## Compact keep line
/compact keep: handoff-overseer.md; role + new-Mac address; rules verbatim (secrets, no attribution, no --no-verify/force incl.
--force-with-lease, standing merge, one repo per builder); D-43/44/46/47/49/51 + test ledger; one gate at a time, no stack during gates;
heads; Phase 4 table items 1–12 with states; after-Phase-4 plan; open with Jabran. Drop: finished agents' reports, file dumps,
command outputs, screenshots.
