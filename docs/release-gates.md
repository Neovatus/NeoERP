# Release gates: what must be done before each go-live

One list of items we deliberately deferred, grouped by **when** they must be done. Check the matching section
before a release, before a country's first customer, and before each dated deadline. When an item is done, tick
it and add the commit. Sources are linked; decisions are in `docs/agents/codex-decisions-2026-10-31.md` and
`docs/agents/accounts-phase3/m5-plan-review.md`.

Started 2026-11-03 (Jabran: "write them so we remember").

## Before ANY real customer (first production release)

- [ ] **Malware scan for bank-change proof files** (B4). Until then proof files show "not yet checked" and are optional.
- [ ] **Real email channel for notifications.** Email is still simulated in audit-service; supplier bank-change notices (C11) are only recorded, not delivered. Notices are at-least-once: duplicates possible.
- [ ] **Drop plaintext bank columns** (B6) — only after a decrypt test and a restore test of the encrypted copy pass on a production-like backup (R2).
- [ ] **Bank key rotation runbook tested** (`NeoERP-BackEnd/docs/operations/bank-key-rotation.md`); fingerprint key cannot be rotated yet (C22-FP-ROTATION).
- [ ] **Payroll company isolation** (I4): payroll has no company column and is safe only via the local/test-profile gate. Confirm no shared environment runs payroll on local/test only; real fix in the payroll rebuild.
- [ ] **HR company checks** (I2/I3, triage TI-01, TI-02, NEW-02, TI-03/05): requirements for the HR rebuild — owners from stored rows, acting employee from the token, delete the `employee_id` fallback. HR is not production-ready until done.
- [ ] **Retention and purge rules live** (R1–R4, C13): no purge job may run before the per-country rules in `hosting-and-go-live-requirements.md` ACC-R6 are implemented.
- [ ] **Reveal rate limit is per instance** (bank details, M-3): move to a shared store before running more than one instance.
- [ ] **CI runs the Docker-backed security tests** (SharedProfileAccessHttpTest skips silently without Docker): add a check that fails when they are skipped.

## Before a country's FIRST customer

### Norway
- [ ] **E-invoice sending (Peppol/EHF) live before 2027-01-01** for B2B (R6). Provider: evaluate Storecove first (`docs/agents/codex-peppol-providers/report.md`). Receiving is required from 2030-01-01.
- [ ] **Keep the original e-invoice XML** from 2027-01-01 (bokføringsloven §13 as amended).
- [ ] **SAF-T Financial 1.40** export for periods from 2027-01-01 (S1); re-check the grouping-code list Skatteetaten publishes for 2027.
- [ ] Payee verification provider (KAR) if the customer wants bank checks (P2). Before any provider goes live: NOT_POSSIBLE / NOT_VERIFIED need the reason + second-person exception, and the approval audit must record the check result (C23 follow-ups).

### Sweden
- [ ] SRU export scope: INK2R account annotation only (S3); NE / INK2S not supported — tell the customer.
- [ ] Denmark/Sweden companies with activity on DK 7830 / SE 6352 stay on chart 2026.4 until a "review and adopt" step exists (C17) — build it (recommended with M5).

### Denmark
- [ ] A7 holds: DK 4700, 4710, 5900, 5920, 6050, 6860, 7150, 7550, 7790, 7800 are unmapped in the new expense lines — an accountant classifies them per company.

### Finland
- [ ] Archive examinable from Finland (kirjanpitolaki 2:9).
- [ ] No 14 % reduced-rate import code for 2025 dates (C19 note).

### Iceland
- [ ] Records must be stored in Iceland until the new act (planned 2028) — hosting decision.

### Pakistan
- [ ] **FBR Digital Invoicing** (mandatory already): sending, retries, 72-hour cancel window, Annex-C match, advance-receipt invoices, credit-note mapping confirmed in the PRAL sandbox (R8, D6).
- [ ] **Records kept in Pakistan:** legal opinion from a Pakistani tax lawyer on whether an abroad-hosted copy counts; until then a full export the company keeps in Pakistan.
- [ ] **Pakistani accountant:** AFRS-for-SSE statement format and whether minimum/final taxes need a "levies" line (L6); statements stay "management" until then.
- [ ] Provincial sales-tax withholding codes stay inactive until registration per province is modelled (T5); provincial rule texts re-read (T-02, T-23).
- [ ] Withholding on advances (M5 D5): design and build.
- [ ] Retention purges stay off until PK rules are implemented (companies 10 y, others 6 y, holds during proceedings).

## Before a dated deadline

- [ ] **Every VAT/tax rate change** (Pakistan each 1 July Finance Act; Nordic budgets each 1 January): advances spanning a rate change are refused in M5 (D3) — build the correct rule right after M5, before 2027-07-01 at the latest.
- [ ] **2027-01-01:** Norway e-invoicing, SAF-T 1.40, original-XML retention (above).

## Later phases

- [ ] GRNI owner row moves to Purchasing/Inventory with the GRNI account reclassification (D7).
- [ ] Customer refunds by bank transfer only once customer bank details (M5 B0) ship.
- [ ] Peppol receiving (by 2030-01-01 in Norway).
- [ ] Hash-chained ledger evidence against a stolen service DB login (E3), with the retention work.
- [ ] Next pack: C18 adoption overlay must null `role_code` for new 1395/2810 accounts.
