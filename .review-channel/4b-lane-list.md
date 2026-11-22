# Accounts 4b: the lane list for the old Mac's `phase4b-plan.md` (new-Mac lead, 2026-11-22)

Source: `.review-channel/brief-4b-plan.md` (lane order, readiness, Jabran's 4b decisions and the Fable conditions).
It is shaped per roadmap item (D-57): a BackEnd + App pair with one flow test each. Tiers follow WORKFLOW "Review
tiers" (D-46).

**Branch (proposal):** `phase/4b` in each repo, cut from `main` once the Phase 4 PRs merge. Lanes are named
`phase/4b-<lane>-<be|app>`. Under D-61 the new Mac runs the scoped gates and merges into `phase/4b`. The old Mac runs
the flow sessions, reviews shared code, and runs `phase/4b` → `main`.

| # | Roadmap item | Lane (BE / App) | Tier BE / App | Depends on | Shared code? (D-61) | Flow test |
|---|---|---|---|---|---|---|
| 1 | 4.14 dimension rules | DIM-RULES-BE / DIM-RULES-APP | 2 / 1 (Opus high, money display) | Phase 4 merge; OD-1…4 decided as recommended | no (accounts only) | rules page, matrix, rule-aware cells, branch default (NO + PK) |
| 2 | 4.12 platform A, actions (RT-1, A2 `Prefer`, A3, ADR-024 N5 locks) | PLAT-A-BE / — | 2 / — | Phase 4 merge | **yes**: shared platform. Old Mac: review or build? | none (API only); covered by item 4's flow |
| 3 | 4.12 platform B, data Stage 0 (N1–N4, N6–N8) | PLAT-B-BE / — | 2 / — | Phase 4 merge; N7 compose line first | **yes**: shared platform | none; covered by item 4 |
| 4 | 4.12 platform C, notification-service + in-app (RT-2) | PLAT-C-BE / PLAT-APP (RT-0 inbox `userId` fix, items by template key) | 2 / 1 (Opus high) | rebase on B's `compose.yml`; App after the C API table | **yes**: a new shared service | inbox: an item arrives, opens, is marked read; another user's items never show |
| 5 | 4.13 real-time (RT-3 hub incl. A1 snapshots; RT-4 app `core/realtime`; RT-5 first adopters) | RT-3-BE / RT-4-APP, then RT-5-BE / RT-5-APP | 2 / 1; RT-5: 1 / 1 | item 4 merged; RT-5 after items 2, 5's RT-3/RT-4 | RT-3 yes (shared hub); RT-4 App core | export/SIE/OB waiter live, badges, `access.changed` signs the user out of a removed company |
| 6 | 4.15 spreading | SPREAD-BE / SPREAD-APP | 2 / 1 (Opus high) | item 1 merged; Fable SP-1 c1/c2/c5 as scope rows | no | spread a prepaid over months, pause, post again with a non-writer approver |
| 7 | 4.16 allocations | ALC-BE / ALC-APP | 2 / 1 (Opus high) | item 6 merged (shared run table SP-5); A5 headcount key waits for HR H1 | no | allocation run by key version; contributors are listed on the run journal (A8 c1) |
| 8 | 4.17 budgets (stage 1) | BUD-BE / BUD-APP | 1 (Opus high; never posts) / 1 | item 1 merged; ADR-022 stage 1 set to Accepted in the BE lane | no | budget vs actual by dimension, the B5 state machine |

**Proposed batches** (each batch = one flow session on the merged heads):
- **4b-A:** item 1 (DIM-RULES pair). It is the first Accounts-only batch, so it tests D-61 cleanly.
- **4b-B:** items 2, 3 and 4 (PLAT A/B/C + PLAT-APP).
- **4b-C:** item 5 (RT).
- **4b-D:** item 6 (SPREAD).
- **4b-E:** item 7 (ALC).
- **4b-F:** item 8 (BUD).

4b-D/E/F can overlap with 4b-C, because they share no files.
**Question for the plan:** items 2, 3, 4 and RT-3 are shared platform code (D-61 item 2). Should the new Mac build
them with the old Mac reviewing, or should the old Mac build them? The proposal: the new Mac builds; the old Mac's
review is the second seat on those lanes.
**Measures (D-61 item 3):** per lane, gate minutes, swap during the gate (`vm_stat` before and after), and waiting for
a simulator slot. Reported in each Timeline and at the check-in after 4b-A.

## D-69 additions (Jabran 2026-11-22)
- Every 4b App lane brief has a row: "**Compose UI test of the main flow**". The same flow as the lane's flow test runs
  as a JVM Compose UI test (a fake server, the real route), and it fails on the base.
- T4 fix lanes: each failure gets an automated test that reproduces it (old FAIL / new PASS) before the fix.
- **E2E spike lane (proposal):** `phase/4b-e2e-spike` (App + workspace tooling, tier 1). It checks whether Maestro or an
  equivalent can drive the main money flows on the simulator: post a journal, approve a payment, a report. It is
  sized to one flow first, and it reports run time, flakiness and the slot cost on the old Mac. It runs alongside
  batch 4b-A and needs the old Mac's simulator slot.

## D-73 additions (Jabran via the old Mac, 2026-11-22)
- **STRICT-FAKES-APP** (App, tier 1, first, beside 4b-A): the App's shared fake backend validates company scope, ids and required fields the way the real API does, so the existing UI tests catch wrong requests.
- **Every 4b brief gets two more rows:**
  - contract tests: the BE publishes examples per endpoint, and the App asserts its requests match them;
  - a four-language size test (en/nb/sv/da) for each new screen.
- These start after the Phase 4 PRs merge, like the rest of 4b. See `phase4b-plan.md` "Test rows".

## D-75 (Jabran via the old Mac, 2026-11-22)
- **E2E spike scope** (`phase/4b-e2e-spike`): compare Maestro and AXe against our screenshot tester on run time, flakiness and cost per step. AXe drives the iOS simulator through the accessibility tree; first check that it can see our Compose Multiplatform iOS screens. No GitHub Actions.
- **Accessibility findings:** the old Mac's flow sessions now use personas (device × language × text size × dark mode) and run an accessibility check on each screen. Its findings arrive by feature, like failures, and go into the fix lanes by feature.
