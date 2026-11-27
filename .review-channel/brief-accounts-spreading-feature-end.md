# Brief: spreading feature end · branch `accounts/spreading/feature-end` → `accounts/spreading/feature` · BackEnd + App

Read first: `docs/PRINCIPLES.md`, `docs/templates/brief.md`, `docs/templates/done.md`, `docs/templates/tester.md` ("Messages must explain").

**Where the work happens (D-92, D-93):** in Jabran's checkouts `NeoERP-BackEnd` / `NeoERP-App`. Cut `accounts/spreading/feature-end` from `accounts/spreading/feature` in each repo, push it, and open its draft PR into the feature.

## Goal
Close every spreading leftover so the feature (flows 1 + 2 + dimension rules) can go to `main` as one PR (#16), proven on a device.

## Steps, in order (one new agent per step, titled "<BE|App> <role> · <model> · spreading feature end")
| # | Step | Agent | Done when |
|---|---|---|---|
| 1 | Flow 1 items marked "Owner: flow 2" in `docs/backlog.md` (next-fiscal-year warning, FL-9 credit-line branch check, run `lastDetails` from the run's own version). Check first whether flow 2 covers each one (file:line + grep); fix or record why not. | BE engineer · Opus | each item: covered (cite) or fixed with a test that fails on the old code |
| 2 | App LOWs in `docs/backlog.md` "Spreading flow 2 change leftovers": R-F2, R-F3, R-F4, R-F5, R-2 (match by user id), R-3 (check the answer and wording before changing). | App engineer · Sonnet | each fixed with a unit/UI test; four languages; nothing cut off at the largest text |
| 3 | Test data: **fresh local database** (Jabran OK 2026-11-27: wipe this Mac's local stack DB and re-seed), demo data that sets each Required dimension rule the steps need, an Enter-company (Neovatus) Owner session, a user without SPREADING.READ, FE-1's opening balance. Run the seeds for real. | BE test data · Sonnet | seeds ran green; a table of seeded rules and users the tester uses |
| 4 | Simulator test on this Mac, real stack: the open steps in `.review-channel/spreading-feature-end-checklist.md` ("Status after flow 2's simulator session": 29, FE-1/30, 32–39, plus 8, 4, 9, 14 if not yet PASS) and a quick check of the step 2 fixes. Each step names the seeded rule it relies on. Flow lead opens the money screenshots itself. | App tester · Opus medium | every step PASS, or a finding with screenshot |
| 5 | Fixes, only for failed steps, then a re-test of those steps only. | fixer · Opus 5.5 medium; re-test Sonnet | re-tested PASS |

A review (Opus 5.5 high) of steps 1 and 5's money code before the merge, beyond the diff.

## Decided rules (don't reopen)
Spec AC-SPR, D-82, D-90, D-91 G4, D-96, FL-1..11, flow 2's FC decisions. Open questions: check these and the industry standard first; decide what's clear and record it; raise only what changes a rule, the scope or the contract.

## Hand-back
Results in `NeoERP-App/docs/agents/spreading/tester-results-feature-end.md`; mark each backlog row done or moved; update the checklist status; one measures line in `.review-channel/v2-trial-measures.md`. BE + App tests 0 failed and the money-invariants check green before the merge into the feature. Then report to the module lead: ready for PR #16 to `main`.

## Never
- `--no-verify`, force push, AI attribution, GitHub workflows; builders don't push, merge or rebase.
- Never edit an applied migration.
- Never open, print, grep the content of or copy `.env` files (incl. tracked `infra/.env`), `.local-secrets/**`, token/session files, `~/.gradle/gradle.properties` and other user-level `gradle.properties`, `~/.netrc`, `~/.npmrc`, `~/.aws/**`, or keys. Read one key only when needed (`grep -c '^key=' file`).
