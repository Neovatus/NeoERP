# Opus review: I18N-4 backend (a1ac2c6, d7b497a, c92c13f, 9874203) — 2026-11-08

Verdict: no High. V66 is safe (amounts, journals and posting guards untouched; every INSERT path still works).

## Medium (all to fix before push)
- M1 SieOpeningConfirmService.kt:457 still writes the English "Opening balances from <format> file <name> (n of m)" memo; add it to LedgerText; update SieImportOpeningTest:300/323, ObImportApiTest:162.
- M2 LedgerText uses nb "Åpningsbalanse" and da "Åbningsbalance"; the glossary says nb Inngående balanse, da Primosaldo (sv Ingående balans is fine).
- M3 FI and IS ledger text is English while their names are local; the language comes from setup.countryCode, not the chart pack.
- M4 SieExporter:211 `nameLocal ?: name` ignores a rename made after V66.
- M5 Phase2ApiSuiteTest:256 finds the bank account by name ("Bank"), which breaks for local names; V66 needs a migration test.
- M6 Sign-in wording against the glossary:
  - sv Bolag → Företag; da Selskab → Virksomhed; da Afdeling → Filial for branch.
  - Typo Modeladgang → Moduladgang.
  - Leave → Fravær/Frånvaro/Fravær; nb Attendance "Fravær" → Oppmøte.
  - nb ansattkontoer → personalkontoer.
  - Ett siffer / Ét ciffer.
  - The PageExpired footer must match the button names.
  - da "Login mislykkedes".
- M7 Keycloak base has no `_nb`: define the keys it renders (invalidUserMessage, accountTemporarilyDisabledMessage, expiredActionMessage, loginTimeout, required actions) and locale_en/nb/sv/da labels in our four files.
- M8 hr- and audit-service 500 responses echo ex.message (existing leak): return a generic message with a requestId.

## Low
- L1 c92c13f doesn't build alone (squash with 9874203; put the Keycloak files into a1ac2c6).
- L2 V66: bump version/updated_at.
- L3 V66: join via template_ref like V22.
- L4 pk adoption.sql clones name_en (test-only).
- L5 The setup preview shows English names (app side).
- L6 payroll.md lists codes payroll doesn't send.
- L7 IDENTITY_PROVIDER_* pass the auth-service detail to the client: use fixed messages; add WebMvc asserts for the new codes.
- L8 Keycloak picker escaping: OK.
- L9 Add a "Reset password" row to the glossary (sv Återställ lösenord).
- SAF-T exporter (future) must use `name`: backlog.
