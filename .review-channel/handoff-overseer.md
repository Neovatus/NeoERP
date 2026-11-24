# Handoff: old-Mac lead (overseer, test + integration Mac) — 2026-11-24 18:00 Europe/Oslo

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
- **Never let a reviewer write into a worktree while its gate runs** (gate ends "tree is not clean" → no marker; 13 min lost on DEMO-FM2-BE). Reviewers write to `.review-channel/<lane>/` or wait for the gate.
- Review files: exactly one line containing "verdict"; two different `Reviewer:` names. Run `scripts/risk-check.sh <base>..HEAD
  --reviews f1 f2` before `verify.sh` (fail fast until GATE-3).
- **After a Mac restart, before any gate:** `docker info` (start Docker Desktop with `open -a Docker` if down) and the infra containers (`cd <be-checkout>/infra && docker compose -f compose.yml up -d`; wait for `neoerp-postgres`). Without them every BE gate fails in ~3 min (Testcontainers "lateinit … not initialized", "invariants not run") — not a code failure (TEST-SCOPE-1 BE, 2026-11-24).
- One gate at a time on this Mac; **no backend stack or simulator while a gate runs** (load ~570 today → 503s, swap 11 GB).
  Builders via workspace `scripts/gradle-job.sh <app|be> <dir> <tasks…>`. Gate-free check `pgrep -f '[b]in/java .*gradle-home-verify'`.
- Up only while testing: stack + simulators start right before checks, stop right after. Simulator sign-in needs `simctl keychain reset`.

## Heads
App `phase/4` `82b815b0`; BE `phase/4` `7ee082be`; App `phase/hrp-v2` `d91e45cd`; BE `phase/hrp-v2` `f1a6f944`.

## Merged today
TEST-SPEED-1/APP, BE-JDK21, FIX-APP-B1, R29b-1, FIX-APP-B2a, GATE-2, R29b-2, FIX-APP-B2b, AC418-BE, HRP-H0-BE, HRP-H0-APP,
**R29b-5, OUTBOX-CLAIM-BE (escaped defect fixed), AC418-APP, RISK-NARROW-1 (BE+App)**. Verdicts in `.review-channel/lane-verdict-*.md`.

## Phase 4: state at handoff (2026-11-24 ~18:00, context ~81 %)
Heads: **BE `phase/4` `7ee082be`, App `phase/4` `82b815b0`** — ALL lanes merged (feature, T4 fixes, B2A-REFRESH `dae20eb1`, DOCS-2c `5b65071e`, TEST-SCOPE-1 BE+App). All 7 missing verdicts written (`a86ad29`). Hooks: BE gate-v3 dispatcher reinstalled from the `phase/4` tip on both Macs (Jabran OK), App keeps `core.hooksPath=.githooks`.
- **Merge check DONE, clean:** ff possible both repos, `main` has 0 commits `phase/4` lacks, 0 AI-attribution lines, gate markers for both heads, no duplicate migrations (accounts V79, user V50).
- **Fast-forward to `main` is PAUSED for Jabran's go.** Reason: 4 dev-secret files (`.env`, `infra/.env`, `.local-secrets/accounts-bank-keys.properties`, `.local-secrets/demo-passwords`) are NEW in `phase/4` (commit `856ba3a`, Jabran's own 2026-11-20 decision, ERP-Q5) and would reach `main` for the first time. Never open them.
- **Also open with Jabran:** run a **Fable 5.2 high seam review** of the whole Phase 4 first (two reviewers split **by feature**, each reading BE + App: (1) money/approvals — AL-REST, approval limits + stand-ins, OB import, AC418, recurring; (2) isolation/platform — R29b, outbox, email-uniq, company switch, auth/user/org); ~1–2 h; Phase 4 code was tested whole but never read whole (~1,260 code files, ~72 k lines). My recommendation: seam review first, then merge.
- **Phase 4 review DONE:** `phase4-review.md` (lead), `phase4-review-independent.md` (Opus, raw sources only, D-79), `phase4-review-compare.md` (neutral agent: 6 agreed, **12 decisions for Jabran — deferred to the workflow review**, Jabran: "for next phase we review the workflow, that might change a lot"; don't record new rules now).
- **Known hole to fix in the workflow review:** with scoped lane gates (D-47) + the 11-24 "fast-forward without whole suite" plan line, nothing tests all code together. Phase 4 is safe (every gate ran full).
- **Next after `main`:** workflow review (`.review-channel/workflow-review-topics.md`, incl. Jabran's architecture questions: calls per screen, thin App, cross-service consistency) → GATE-3 phase (maybe cut to a 1-day incident-backed list) → 4b (new Mac) + HR H1 (here) in parallel.
- **After a Mac restart:** check Docker + infra before any gate (handoff rule).

## Order (Jabran 2026-11-24, D-77): Phase 4 → `main` → **workflow review** → **GATE-3 phase** (gate scripts + App dispatcher port) → then 4b and HR in parallel

## After Phase 4 (Jabran 2026-11-22; **Phase 4 closes first**, then HR and 4b start together)
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
