# I18N-4 lane B1 report (backend text) — saved by the lead from the builder's hand-back

Commits (NeoERP-BackEnd dev, not pushed): `a1ac2c6` Keycloak sign-in nb/sv/da + picker + realm i18n; `d7b497a` codes on legacy error bodies (hr, payroll, audit, user-service), messageCode/warningCode on security responses, API docs.

## Codes added (old `message` kept as deprecated English fallback)
- hr/audit: RESOURCE_NOT_FOUND, INVALID_REQUEST, INVALID_STATE, VALIDATION_ERROR (+fieldErrors), UNEXPECTED_ERROR. payroll: RESOURCE_NOT_FOUND, INVALID_REQUEST.
- user-service: RESOURCE_NOT_FOUND, VALIDATION_ERROR, PARAMETER_MISSING, PARAMETER_INVALID, IDENTITY_PROVIDER_FAILED (502), IDENTITY_PROVIDER_UNAVAILABLE (503), BODY_UNREADABLE, METHOD_NOT_SUPPORTED {method}, MEDIA_TYPE_NOT_SUPPORTED {contentType}, ENDPOINT_NOT_FOUND {method,path}, UNEXPECTED_ERROR; PEOPLE_LOOKUP_RATE_LIMITED (PeopleController:90); `messageCode` SESSION_INCLUDES_CURRENT; `warningCode` SIGN_OUT_INCOMPLETE.

## For the app lanes
- user-service ClientRequestException has no code (a test asserts it): use fieldErrors + HTTP status.
- HR (~130), payroll (~60), audit (~35) specific English sentences reach the app as `message` under generic codes. Per-site codes only for the ones the app shows: lanes L6/L7 list them.
- Bean Validation fieldErrors text (org `@Pattern`, user `@Size`) is English: the app writes its own text per field + code.
- SIE mapping copy audit line (Pack2026_3Writer.kt:215, frozen migration V15): app writes it from payload args chartVersion/copied/skipped, ignores `message`.

## Seeded names (today)
Packs: name_en → `name`, name_local → `name_local` (NO/SE/DK/FI/IS filled; PK and base-ifrs empty). Copied by BooksCreator / ChartMaterializer:37-38. API returns name + nameLocal; search matches both; SIE export uses nameLocal ?: name; reports use `name`; users can PATCH both.

## Stored English text written by the server
ObImportService:144 "Opening balance from <file>"; ArDocumentDraftService:164 / BillDraftService:208 "Opening balance"; WriteOffRules:120 "Bad debt". Party memos "<name> · <ref>" are language-neutral.

## Lead decisions (2026-11-08), sent to B1 as part 2
- Company language = the pack country's language (FI → Finnish, IS → Icelandic: company records, not app language); PK and base-ifrs stay English.
- New migration: `name_en` on accounts.accounts and accounts.tax_codes; `name` = nameLocal ?: name for new companies; API adds `nameEn`, `nameLocal` deprecated.
- Backfill pack-created rows never renamed (pre-go-live, demo data only); renamed rows skipped.
- Server-written ledger text in the company language (nb/sv/da, else English), at creation.
