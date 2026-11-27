# Accounts spreading — feature-end checklist

Items a flow could not close on its own stack and the feature end (before `accounts/spreading/feature` → `main`) must run. Each row: what, why, where it came from.

| # | Item | Why | From |
|---|---|---|---|
| FE-1 | On a **fresh database**: run `scripts/seed-demo-accounts.sh` (the "Demo opening balances" OB now has Dr 1749 24 000,00) and `scripts/seed-demo-spreading.sh` case (d) (opening-balance schedule on 1749, within the cap); then simulator step 8 with a **real cap** on the approval card (ledger balance, other opening schedules, this one, the difference) and one refusal over the cap. Check the seed's journal-list memo filter finds the OB (unverified). | This Mac's DB has Jan 2026 LOCKED (final, A2 C-18), so the go-live balance can't be added; flow 1's simulator proved the refusal path only; the real-cap card is proven by `SpreadingDetailUiTest.openingCapOnApprovalCard` (phone + tablet) and `SpreadingOpeningTest`. | flow 1 FL-10 (module lead, route C), 2026-11-25 |

## Carried into spreading flow 2's simulator test (Jabran 2026-11-25)
One simulator session at flow 2's test stage covers, besides flow 2's own steps:
- **Dimension rules, the 7 steps** (inbox 2026-11-25 ~08:10): F2 journal refusal on iPhone + VoiceOver; F3 write-off prefill/None/Bergen; F9 receipt clearing one invoice carries its cost centre; credit note from an invoice (per-line values, reopen, refusal by line); accrual dialog (prefill, star, refusal); SIE/OB opening import with a Required project; accessibility pass on 4–6. Plus: postings still correct after spreading's engine change (steps 2, 3).
- **Spreading flow 1 leftovers:** retest step 8 (opening-cap message now shows balance / other / this / over-by) and step 4 (crumb); FE-1 opening cap with a real amount on a fresh database; steps 9 (Enter-company Owner) and 14 (user without READ) with demo users made for them.
- **Messages must explain** (tester template) on every refusal in these steps.
Then dimension rules + spreading go to `main` together in one PR (BE #16 / App #16); BE #11 / App #9 close as "included in #16".

## Status after flow 2's simulator session (module lead, 2026-11-27)
Source: `NeoERP-App/docs/agents/spreading/tester-results-change.md` on `accounts/spreading/feature` (fd62e05a). **Still open; the feature PR to `main` waits for them.**
- Step 29 (opening cap): first submit PASS, rest BLOCKED.
- FE-1 (step 30): BLOCKED, no fresh database.
- Dimension rules 32 (journal refusal): FAIL (part); 33 (write-off, F26): FAIL, judged a wrong test expectation (seed account not Required): re-run with the seed stating the rule.
- 34–38 (receipt, credit note, accrual, opening import, accessibility): BLOCKED or NOT RUN (no data, no test file, out of time).
- 39 (postings after the engine change): PARTLY PASS.
Next: one short simulator session for these steps only, fresh DB, demo data that sets each Required rule, steps naming the seeded rule.
