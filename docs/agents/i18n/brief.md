# App languages: brief (I18N, all steps)

**Jabran, 2026-11-08:** "Language all steps, make sure its professional, not repeated text have many keys, should work on desktop, tablets, & phones." The naming standard ([naming-standard.md](naming-standard.md)) is approved. Languages: English (en, base), Norsk bokmål (nb), Svenska (sv), Dansk (da).

## What we found (2026-11-08)
- 51 string files with 2,411 keys in `composeResources/values/`. The prefixes are mixed: `accounts_*`, `core_*`, `shared`, `format`, `file_picker`, `entitlements_off`, `shell_context`.
- About **7,500 hard-coded multi-word English texts** in Kotlin, plus single-word labels. The earlier estimate of ~170 counted only accounts rule files.
  - By area: accounts 3,180, organization 1,160, people 510, data 430, platform 290, designsystem 250, roles 220, hr 210, payroll 200, core 190, reports 160, audit 160, the rest under 120 each.
- Only 118 of 1,022 Kotlin files read string resources.
- Translations so far: `values-nb` 16, `values-sv` 16, `values-da` 4. `values-fi` and `values-is` also have 4 each and stay out of scope; leave them as they are.
- Compose Multiplatform 1.10.0 and Kotlin 2.2.21. Targets: JVM desktop, Android, iOS.
- Formats: `NeoFormat` (core/format) writes dates with `NeoDateText.English` month and weekday names. Numbers follow the company's country.
- The backend sends refusal codes plus details. The app maps codes to words and never shows the server's free text (NeoEntitlementRefusal). Chart and tax-code packs carry `name_en` and `name_local`.

## Steps

| Step | What | Done when |
|---|---|---|
| **I18N-1a Foundation** | `NeoText` (a text reference usable from view models and rules: resource + args, plural, or raw user data) and its Compose resolver; the language setting (English, Norsk, Svenska, Dansk; default = device language, kept on the device) with a runtime switch on JVM, Android and iOS; `NeoDateText` for nb, sv and da; the core files per the standard; the build checks (hard-coded UI text, duplicate English, a generic word in a module file, a key missing in a language, unused keys) with a baseline file that only shrinks; the standard moved into `NeoERP-App/docs/` and into AGENTS/ARCHITECTURE | Tests green; switching language redraws the app without a restart |
| **I18N-1b Rename** | One script with one rename map: today's 2,411 keys renamed per the standard, all uses changed, duplicates merged into core | No old names left; the duplicate check passes for the renamed keys |
| **I18N-1c Move (per module lanes)** | All hard-coded UI text moved into module files, named by meaning, with no repeats (reuse core first) | The baseline for that module is empty |
| **I18N-2 Translate (per module lanes)** | nb, sv and da for every key, professional business register, official accounting and tax terms (NS 4102 / BAS / Standardkontoplan; Skatteetaten, Skatteverket and Skattestyrelsen terms), one glossary for all lanes | The missing-key check passes; glossary review by Opus |
| **I18N-3 Fit** | Desktop, tablet and phone screenshots in the longest language: no clipped buttons, tabs, column headers or pills; long labels wrap or ellipsize with full text on hover or long-press; table headers allow two lines | Screenshot tests per form factor for the key screens; Jabran's test steps |
| **I18N-4 Backend text** | See "Backend" below (approved) | Server free text replaced by codes; seeded names in the company language; sign-in page in four languages |

## Rules for every lane
- Follow naming-standard.md exactly; "No text in Kotlin code" applies to all text a user can see or hear, accessibility text included.
- Not UI text, stays in code: log lines, exception messages that are never shown, API field names, test fixtures, codes.
- User data (names typed by a company: customers, accounts, dimension values) is never translated.
- Look in core before adding a key. A text two modules need goes to core.
- Whole sentences with numbered placeholders; counts as `<plurals>`; nothing glued together in code.
- English wording is not changed while moving it, except to fix an abbreviation or a glued sentence.
- Lanes work in worktrees (`NeoERP-worktrees/i18n-<lane>`), one Gradle build per worktree, commit by path, and never push. The lead merges, runs the full test run, and pushes.
- Commits co-authored by the Sonnet line. Opus reviews the foundation, the rename script, and the glossary and translations.

## Backend (I18N-4; Jabran approved 2026-11-08: account and tax names in the company language, sign-in page included)
1. **Refusals and validation:** the backend keeps sending codes plus details, and the app writes the words. Audit the places where the backend sends only free text that the app shows (e.g. the SIE mapping copy message) and turn them into code + args.
2. **Platform catalog words** (roles, permissions, module and feature names, statuses, document types): the app translates them by code (`core_feature_<code>`, `core_module_<code>`).
3. **Seeded master data** (chart of accounts, tax codes): company data in the company's own language, created from `name_local`, with the English name kept as a searchable second name. It is not swapped by the reader's language, because an account's name is the company's record and appears in the books, SAF-T and SIE. The API also returns `nameEn` so the English view can show it as secondary text.
4. **Texts the server writes into the books** (automatic posting descriptions, audit lines): written in the company's language when the record is created, because ledger text must not change afterwards. Audit lines are better stored as code + args and written by the app.
5. **Sign-in (Keycloak):** turn on the theme's internationalization with `messages_nb/sv/da`; the app passes `ui_locales`. Approved by Jabran (2026-11-08): text and language picker only, the sign-in flow is unchanged.
6. **Emails and documents to customers** (invites, invoices, reminders): the recipient's language. Emails go with the invite flow; documents go with Phase 5 document output.
