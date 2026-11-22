# Phase 4b plan: lanes, order, reviewers, readiness (lead draft, 2026-11-22)

**Source:** `docs/drafts/accounts-roadmap.md` "Phase 4b: platform and planning" (decisions 1, 3, 14; backlog:347, 320, 389).
**Base:** `phase/4b`, cut from `main` per repo the day the Phase 4 PR (4.19) merges. Lanes `phase/4b-<lane>`,
worktrees `NeoERP-worktrees/<lane>`, merge lane → `phase/4b` → one PR per repo (4.20). Slicing L37 option B.
**Approved order (backlog:389):** platform lane **in parallel with** account dimension rules → spreading → allocations
→ budgets. Gradle: one job per repo at a time (lock), so parallel lanes in one repo queue for builds and tests.

## Lanes in order
| # | Lane | Repo | Roadmap | After | Kind | Reviews |
|---|---|---|---|---|---|---|
| 1 | PLAT-A actions (RT-1, A2 `Prefer`, A3 rule, ADR-024 N5 locks) | BE | 4.12 | Phase 4 merge | platform | Opus |
| 2 | PLAT-B data Stage 0 (N1–N4, N6–N8) | BE | 4.12 | Phase 4 merge (N7 compose line first) | money read (F1) | Opus + Fable |
| 3 | PLAT-C notification-service (RT-2, in-app) | BE | 4.12 | Phase 4 merge; rebase on B's `compose.yml` | security | Opus + Fable |
| 4 | PLAT-APP: RT-0 inbox `userId` fix + inbox items by template key | App | 4.12 | PLAT-C API table | security display | Opus |
| 5 | DIM-RULES-BE (D6 rules, ranges, branch default) | BE | 4.14 | Phase 4 merge + OD-1…4 | money | Opus + Fable |
| 6 | DIM-RULES-APP (rules page, matrix, rule-aware cells, branch default) | App | 4.14 | lane 5 API table | money display | Opus |
| 7 | RT-3 stream hub (incl. A1 event snapshots) | BE | 4.13 | lane 3 merged | security | Opus + Fable |
| 8 | RT-4 app `core/realtime` (fake server first) | App | 4.13 | lane 7 API table | platform | Opus |
| 9 | RT-5 first adopters (exports/SIE/OB waiter, badges, `access.changed`) | BE + App (two lanes) | 4.13 | lanes 1, 7, 8 | platform | Opus |
| 10 | SPREAD-BE / SPREAD-APP | BE, App | 4.15 | lane 5 merged; spec approved | money | Opus + Fable (BE), Opus (App) |
| 11 | ALC-BE / ALC-APP | BE, App | 4.16 | lane 10 merged (shared run table SP-5) | money | Opus + Fable (BE), Opus (App) |
| 12 | BUD-BE / BUD-APP | BE, App | 4.17 | lane 5 merged; ADR-022 stage 1 accepted | none (never posts) | Opus |
| 13 | Phase 4b PR (one per repo) | both | 4.20 | 1–12 merged, final gate | — | gate reviews |

## What runs in parallel (no shared files)
- **Day one:** lanes 1, 2, 3 and 5 (BE) and, once its API is fixed, 6 (App). Shared files and the rule for each:
  `infra/compose.yml` (B changes the Postgres line, C adds its DB: C rebases on B); `settings.gradle.kts` (A adds
  `:shared:actions`, C adds the service: second to merge rebases); user-service migration numbers (C and 5: second
  to merge renumbers before anyone applies it). Lane 5 alone owns `PostingValidator.kt`, chart and dimension files.
- **App:** lanes 4 and 6 touch different features (inbox vs Accounts dimensions); parallel.
- **Serial by design:** 7 after 3 (same service); 10 after 5 (reads the rules; posts through the same checks);
  11 after 10 (run table); 12 after 11 in the approved order. Option for Jabran: 12 may run beside 10/11 (budgets
  never post and share no files), but that changes the approved order, so only with his OK.

## Before each lane starts
| Lane | Needs |
|---|---|
| 1–3 | ADR-024/025 accepted (done). Jabran confirms 4.12 OD-1…OD-4 (ADR-025 Q answers, old in-app rows, `Prefer` reach, load target). Lead supplies ADR reference copies (builders see one repo). |
| 4 | PLAT-C API table (inbox item shape). Brief to write. |
| 5, 6 | AC-DIM §12 answers: 4.14-BE OD-1 storage (DM-6), OD-2 drafts at Submit + impact read (DM-7), OD-3 permission code (DM-8), OD-4 locked pack rules (Q7). |
| 7–9 | Lanes 1, 3 merged; ADR-025 D3/D4 and A1 cover the design. Briefs to write after those API tables. |
| 10 | Jabran approves `docs/drafts/spec-4-15-spreading-schedules.md` and answers SP-1…SP-10 (SP-1 widens D-108/C-3). Then the BE contract (`docs/api/accounts-spreading.md`) and the App spec move into the repos. |
| 11 | AC-ALC §12 A1–A9 answered (decision 14 already fixes the keys: %, key tables, ledger shares; headcount later with L.9); A1/A6 amended for the SP-5 run table. |
| 12 | ADR-022 stage 1 accepted (file still says Proposed: `BE/docs/adr/ADR-022-budget-control.md:5`); AC-BUD §12 B1–B8 answered. |

## Status
| Lane | Status | Brief |
|---|---|---|
| 1 PLAT-A | **Ready to brief** (brief written; OD-1…OD-4 to confirm) | `brief-4b-412-be.md` |
| 2 PLAT-B | **Ready to brief** (same brief) | `brief-4b-412-be.md` |
| 3 PLAT-C | **Ready to brief** (same brief) | `brief-4b-412-be.md` |
| 4 PLAT-APP | Ready to brief after lane 3's API table | to write |
| 5 DIM-RULES-BE | **Needs Jabran** (4 answers; brief written) | `brief-4b-414-be.md` |
| 6 DIM-RULES-APP | Needs Jabran (via lane 5) | `brief-4b-414-app.md` |
| 7–9 RT-3…RT-5 | Ready to brief after lanes 1 and 3 | to write |
| 10 Spreading | **Needs spec** (draft written) + **needs Jabran** (SP-1…SP-10) | spec draft |
| 11 Allocations | **Needs Jabran** (AC-ALC A1–A9) | — |
| 12 Budgets | **Needs Jabran** (ADR-022 stage 1, AC-BUD B1–B8) | — |
| 13 PR | After all | — |

## Reviewers
Money or security lanes: fresh Opus (whole diff) + Fable (diff + brief only, independent; Fable budget ≤ 50 % weekly,
security reviews and batched decision checks only). Others: fresh Opus. Only a FIX reviewer re-checks. Builders:
Opus 5.5 high on the builder Mac, targeted tests only; the old Mac runs `verify.sh` before each merge to `phase/4b`.
