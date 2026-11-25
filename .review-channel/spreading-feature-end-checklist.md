# Accounts spreading — feature-end checklist

Items a flow could not close on its own stack and the feature end (before `accounts/spreading/feature` → `main`) must run. Each row: what, why, where it came from.

| # | Item | Why | From |
|---|---|---|---|
| FE-1 | On a **fresh database**: run `scripts/seed-demo-accounts.sh` (the "Demo opening balances" OB now has Dr 1749 24 000,00) and `scripts/seed-demo-spreading.sh` case (d) (opening-balance schedule on 1749, within the cap); then simulator step 8 with a **real cap** on the approval card (ledger balance, other opening schedules, this one, the difference) and one refusal over the cap. Check the seed's journal-list memo filter finds the OB (unverified). | This Mac's DB has Jan 2026 LOCKED (final, A2 C-18), so the go-live balance can't be added; flow 1's simulator proved the refusal path only; the real-cap card is proven by `SpreadingDetailUiTest.openingCapOnApprovalCard` (phone + tablet) and `SpreadingOpeningTest`. | flow 1 FL-10 (module lead, route C), 2026-11-25 |
