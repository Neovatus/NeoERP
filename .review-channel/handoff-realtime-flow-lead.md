# Handoff: core/realtime flow lead (old Mac) · 2026-11-25 07:37 CET

Paused by Jabran until this evening (via module lead). No agents running. Nothing merged by me.

## Flows
| Flow | Repo | State |
|---|---|---|
| `actions` | BE | merged into `core/realtime/feature` (702ce2c) |
| `hub` | BE | merged (9f372ce) |
| `app` | App | merged (2a7ccef8) |
| `first-users` | BE + App | **built, reviewed (Opus high), 4 fix rounds, simulator re-tested; NOT merged** |

## first-users heads (pushed)
- BE `origin/core/realtime/first-users` @ `ff3898a1452833f26c4836e7e79555df2a34e798` (worktree `~/Offices/Neovatus/NeoERP-worktrees/rt-fu-be`)
- App `origin/core/realtime/first-users` @ `f99dbabed29a271e208cf151fd1807661fe1d00e` (worktree `~/Offices/Neovatus/NeoERP-worktrees/rt-fu-app`)

## Where it stands
- Review: FIX (2 MEDIUM) → fixed; option A (person-level `access.changed` delivery, module-lead approved) security re-check ACCEPT.
- Simulator (`.review-channel/rt-first-users-sim-results.md`): PASS export live / Continue in background / toast, reconnect after restart, removal → No-company (round 3), sign-out everywhere, nb + large text, phone notice position. BLOCKED-DATA: SIE steps (Kyst is NO books), 7b grant second company.
- Fix round 4 (Sonnet, D-86): reactivated person stuck on No-company → App re-reads the company-less bootstrap every 30 s in foreground + on foreground return while company-less (f99dbabe; NoCompanyRereadTest 4/4 FAIL old → 49/0 after; android + iOS compile green). Module lead: no simulator re-test needed if the test proves it (MEDIUM, v2 add. 12).

## Next (this evening)
1. Module lead checks fix round 4's test, then merges `core/realtime/first-users` into `core/realtime/feature` in both repos (not me).
2. Send report B for first-users (not yet sent): commits, counts per round (in each hand-back's fix-round sections), review result (2 MEDIUM + 6 LOW, 0 invalid; re-check ACCEPT), simulator findings (step 7 cause chain: no retry on 403 → mapper used DEACTIVATED membership → no-company never re-reads; BE port 8080 clash; stale slot sweep), measures (plan 04:07–04:18, build to ~05:05, review 05:08–05:22, fix 1 to 05:48, sim + fixes 2–4 to 07:36), tokens (BE builder ~600k, App builder ~750k, reviewer ~390k, Sonnet fixer ~124k).
3. Feature end (module lead, gate on Jabran's yes): risk-check pins (6 BE lines in `handback-first-users-be.md` + hub's AuthProductionSecretValidator / AccountsServiceContextTest), `gateway-route-check.sh` §3 add `/api/internal/iam/events` (+`/ack`) and accounts feed paths; ship user V53 + org V43 + accounts V82/V83 + realtime V1/V2 with realtime-service; bootstrap doc line (bootstrap lists non-ACTIVE memberships).
4. Backlog already written: b1a6d13, 1ad72b8, bd6f2ac; module lead has: server-driven approve-all run, ADR-019 D7 amendment for company-less session events, KMM-Network desktop read-idle, size-harness narrow top bar.
5. Strings: new core keys live in `strings_core_realtime.xml` in four languages (flows 3–4) instead of the `strings_core_req_<lane>.xml` English-only rule — module lead to accept or move at merge.

## Rules in force
D-86: mechanical fixes → fresh Sonnet builder; no agent past ~50 % context (don't resume the first-users Opus builders — start fresh with the hand-back files). Builders never edit gate scripts; own tests only; finding validity CONFIRMED/PLAUSIBLE.
Notes log: `~/Library/Application Support/Claude/side-session-notes/local_790aaaa5-…/rt-actions-flow-lead.md`.

## Added 2026-11-25 (D-87, Jabran via module lead)
Before the core/realtime feature review: write `docs/agents/realtime/done.md` for first-users in each repo (template `docs/templates/done.md`, 85bcaa6) from its brief + the 4 fix rounds, with evidence from a **fresh run** of its own tests (not memory); the feature reviewer verifies it. Do this tonight after the merge question, before report B / feature review.
