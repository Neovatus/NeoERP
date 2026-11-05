# AP-8 ↔ BE-13 wiring notes (from the BE-13 builder, 2026-11-05)

BE-13 (backend branch `claude/be-13`, commit de4bf31; contract `NeoERP-BackEnd/docs/api/accounts-ob-import.md` incl. the new "as built" section OB-B1…OB-B17) is the real API for the AP-8 wizard. When AP-8 is wired to it:
- Base `/api/accounts/opening-balance-imports?companyId=`; `GET /formats` (country's own format first, then XLSX, CSV; `available:false` for SAF-T), `GET /template.csv`, multipart `POST /` with `format` first, optional `encoding`, then `file` (+ Idempotency-Key).
- Add the column role **"Customer or supplier" (`party`)** to the "Used as" dropdown.
- "Use these columns" must send `table.columns` explicitly (the proposed ones if unchanged) — that sets `columnsSource=PERSON`. A key sent as null returns to the server's proposal.
- `delimiter` is an enum name (COMMA|SEMICOLON|TAB); `numberStyle` POINT|COMMA; `headerRow` 1–50; `sheet` by name.
- Read `summary.resultToChoices`, `summary.folded`, `summary.parties`, `summary.acknowledge[]` (CSV/Excel need `BALANCES_AT_DATE` at confirm, else 422 OB_ACKNOWLEDGE_REQUIRED).
- Pre-filled opening items (OBI-12): `GET /{id}/opening-items.csv?side=AR|AP` → upload that file to `/ar-opening-imports` or `/ap-opening-imports` with the side's total as control total.
- Error codes to word: OB_FILE_NOT_FORMAT, OB_HEADER_NOT_FOUND, OB_TOO_MANY_ROWS, XLSX_UNSAFE, OB_TOO_MANY_ACCOUNTS, OB_COLUMNS_REQUIRED, OB_AMOUNT_FORMAT, OB_AMOUNT_SCALE, OB_DUPLICATE_ACCOUNT, XLSX_FORMULA_NO_VALUE, OB_DEBIT_AND_CREDIT, OB_ROWS_SKIPPED, OB_RESULT_ACCOUNTS_FOLDED, OB_CHARSET_SUSPECT, OB_IMPORT_FORMAT_NOT_FOR_COUNTRY, OB_COLUMNS_INVALID, FILE_TOO_LARGE (10 MB), OB_IMPORT_QUOTA.

## From the BE-13 review (2026-11-05)
- Journal detail: CSV/Excel opening journals carry `openingImport` (not `sieImport`) — read `openingImport` for the import link (OB-B14).
- A CSV uploaded as SIE fails with an `SIE_*` reader code — show a generic "This file isn't a SIE file" message (OB-B4).
- Opening-items hand-off: send `summary.parties.AR|AP.controlTotal` (the held-out control-account balance) as the opening-items control total — NOT the sum of party rows — so gaps show as CONTROL_TOTAL_DIFFERS.
- New refusal: OB_DUPLICATE_ACCOUNT with reason PARTY_BLANK (a subtotal row without a party next to party rows).
- Check screen: when the proposed number style is COMMA and every sample is a whole number like "1,250", show the samples prominently (could be thousands separators).
