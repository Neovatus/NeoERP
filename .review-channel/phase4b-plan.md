# Phase 4b plan (Accounts: platform and planning) — owner: old-Mac lead · DRAFT for Jabran's review · 2026-11-22

Starts after the Phase 4 PRs merge to `main`, the workflow review, and the **GATE-3 phase** (D-77): 4b branches from a `main` with the finished gate. Read `docs/PRINCIPLES.md` first. Source: the new
Mac's lane list (`4b-lane-list.md`), `brief-4b-plan.md` (Jabran's 4b decisions and Fable's conditions), the accounts roadmap.
Changes from the Phase 4 review are added here before the first lane starts.

## How 4b runs (D-61 trial)
- **New Mac** runs Accounts end to end: briefs (with the D-63 principles link, `Review tier:`, a Compose UI test of the main
  flow (D-69) and the D-67 brief-gap line), builders, reviewers, **its own scoped gates and fast-forward merges into
  `phase/4b`** (one gate at a time on 16 GB, no builder during a gate).
- **Old Mac:** writes and keeps this plan, runs the flow sessions (36 GB), is the **second review seat** and the
  **gate + merge** for shared platform lanes (PLAT-A/B/C, RT-3), and runs `phase/4b` → `main`.
- Branches: `phase/4b` in each repo from `main` after the Phase 4 PRs; lanes `phase/4b-<lane>-<be|app>`; a lane rebases once on
  its turn; clean rebases carry reviews (GATE-3a).

## Lanes
| # | Item | Lanes (BE / App) | Tier BE / App | Built by | Gate + merge | Depends on | Batch |
|---|---|---|---|---|---|---|---|
| 1 | 4.14 dimension rules | DIM-RULES-BE / -APP | 2 / 1 (Opus high) | new Mac | new Mac | Phase 4 merged | **4b-A** |
| S | E2E spike: **Maestro and AXe** (AXe drives the iOS simulator through the accessibility tree; check it sees our Compose Multiplatform iOS screens), one money flow first; compare run time, flakiness, cost per step against the screenshot tester | — / E2E-SPIKE (App + tooling) | 1 | new Mac | new Mac; **runs in an old-Mac simulator slot** | — | beside 4b-A |
| T | **Strict fakes** (App shared fake backend validates company scope, ids, required fields like the real API: 404/400 on nonsense) | — / STRICT-FAKES-APP | 1 | new Mac | new Mac | Phase 4 merged | **first, beside 4b-A** |
| 2 | 4.12 platform A (RT-1, `Prefer`, A3, N5 locks) | PLAT-A-BE | 2 | new Mac | **old Mac** (shared) | Phase 4 merged | 4b-B |
| 3 | 4.12 platform B, data Stage 0 | PLAT-B-BE | 2 | new Mac | **old Mac** | N7 compose line first | 4b-B |
| 4 | 4.12 platform C, notification-service + inbox | PLAT-C-BE / PLAT-APP | 2 / 1 | new Mac | **old Mac** (BE) / new Mac (App) | rebase on B's `compose.yml`; App after C's API table | 4b-B |
| 5 | 4.13 real-time | RT-3-BE / RT-4-APP, then RT-5-BE / -APP | 2 / 1; RT-5 1 / 1 | new Mac | **old Mac** (RT-3) / new Mac | item 4 merged | 4b-C |
| 6 | 4.15 spreading | SPREAD-BE / -APP | 2 / 1 | new Mac | new Mac | item 1 merged; Fable SP-1 c1/c2/c5 as scope rows | 4b-D |
| 7 | 4.16 allocations | ALC-BE / -APP | 2 / 1 | new Mac | new Mac | item 6 (shared run table); A5 headcount key waits for HR H1 | 4b-E |
| 8 | 4.17 budgets stage 1 | BUD-BE / -APP | 1 (Opus high) / 1 | new Mac | new Mac | item 1; ADR-022 stage 1 Accepted in the BE lane | 4b-F |

4b-D/E/F may overlap 4b-C (no shared files). **Cross-module touch:** allocations' headcount key (A5) needs HR H1's headcount
read, built on the old Mac in parallel; ALC-BE takes it as a later item, not a blocker for the rest of 4.16.

## Test rows in every 4b brief (D-73)
- **Contract test** for each new or changed endpoint: the BE lane publishes example requests/responses; the App lane's tests assert its requests match them; the BE asserts it still accepts them.
- **Compose UI test of the main flow** (D-69), on the strict fakes.
- **Four-language size test** for every new or changed screen: the screen-size test renders in en, nb, sv and da.

## Test points (same as Phase 4, scoped gates from TEST-SCOPE-1)
T1 builder (tests per fix + touched services + architecture, later the gate's scoped set) · T2 review (tier) · T3 scoped gate
(new Mac for Accounts lanes, old Mac for shared lanes) · **T4 one flow session per batch on the old Mac** (two testers by
company if > 15 steps; data prepared first; steps covered by automated tests dropped) · T5 phase gate on the old Mac
(`main` merged in, whole suite both repos in parallel, smoke flow, MERGE verdict).
Flow session slots: 4b-A ~ day 2, 4b-B ~ day 4, then one per batch; the new Mac asks a day ahead in the inbox.

## Budgets and measures
Scoped gate ≤ 6 min on the old Mac, ≤ 10 min on the new Mac (measure swap); flow session ≤ 1½ h per batch; ≤ 1 review round + 1
re-check. Per lane (MEASURE-1 + D-63): time per bucket, cost (tokens), first-pass gate + origin, review runs first vs repeat,
brief-gap lines (D-67), new-Mac swap during gates, waiting for a simulator slot.
**Check-in after 4b-A** (D-61): keep / shift more to the new Mac / shift back.
**Gradle lock on the new Mac (16 GB):** feature and fix lanes have priority over tooling lanes. Heavy test runs of a lane (many timing or whole-suite runs) may be run on the old Mac on request, with the builder staying on the new Mac. Observed 2026-11-22: a Phase 4 fix builder waited ~40 min for the BE lock behind TEST-SCOPE-1.

## Open for Jabran's review
1. The lane order above (DIM-RULES first, then platform, then real-time, spreading, allocations, budgets).
2. The E2E spike beside 4b-A (one flow first; decide after it whether E2E tests join the gates).

## Simulator sessions: personas and accessibility (D-75)
Every flow session (T4) runs with **personas** instead of one default device: at least (1) iPhone small screen · Norwegian · largest text, (2) iPad · Swedish · dark mode, (3) iPhone · Danish · default, (4) iPad Pro · English · default; each persona covers the batch's look/feel/wording steps. On **every screen visited**, the tester runs an **accessibility check**: unnamed buttons/controls, touch targets under 44 pt, text cut at large text. Findings go to the lane by feature like any FAIL. Idea source: the open-source "mobile-agent-testers" template (personas, a11y pass); we run it locally (no GitHub Actions).
