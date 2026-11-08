# App languages: plan (Opus plan, 2026-11-08; lead decisions included)

Brief: [brief.md](brief.md). Standard: [naming-standard.md](naming-standard.md).

## Lead decisions (from the plan's open questions)
1. **Type name:** `NeoUiText` (`NeoText` is already the design-system text composable).
2. **Module codes** (within the approved list):

   | Folder | Code |
   |---|---|
   | organization | `org` |
   | people, roles, security, companyaccess | `iam` |
   | agreement, entitlement, platform | `platform` |
   | hr, ess | `hr` |
   | payroll | `payroll` |
   | audit, profile, inbox, dashboard, auth, context, reports (cross-module), ui/shell | `shell` |
   | accounts | `accounts` |

3. **fi and is folders:** keep them and rename their keys with the script. They aren't translated further.
4. **Sign-in:**
   - Keycloak shows its own language picker, with nb, sv and da messages (approved by Jabran).
   - The app passes `ui_locales` (the app language).
5. **Dates:** month and weekday names follow the app language. Date order and numbers follow the company's country.
6. **Language switch:** may reset open dialogs. It is made only in Settings.
7. **Pseudo-locale:** yes. Gradle flag `-Pi18n.pseudo=true` generates `values-en-rXA` (+40% length).

## 1. NeoUiText (`core/text/NeoUiText.kt`)

```kotlin
@Immutable sealed interface NeoUiText {
  data class Res(val res: StringResource, val args: List<Any> = emptyList())
  data class Plural(val res: PluralStringResource, val count: Int, val args: List<Any>)
  data class Item(val res: StringArrayResource, val index: Int)
  data class Raw(val value: String)                 // user or server data only
  data class Joined(val items: List<NeoUiText>, val join: NeoJoin = NeoJoin.And)
}
fun text(res, vararg args)
fun plural(res, count: Long, vararg args)
fun raw(value)
fun List<NeoUiText>.joined(join)
@Composable fun NeoUiText.resolve(): String
suspend fun NeoUiText.load(): String
```

- Args are String, Int, Long or NeoUiText.
- View models, rules, mappers and `NeoFailure` hold `NeoUiText`, never `String`.
- The `*Wording`, `*Texts` and `*Support` objects return `NeoUiText`.
- `SieCopy`, `RefundText`, `ReceiptNotice` and the Words classes are folded in lane by lane.
- Glued nouns (`NeoStateCopy.firstUse("customers")`, `NeoNotAvailableCopy.of(things)`) become one key per noun.

**Tests:**
- `commonTest/.../testing/NeoTestText.kt` adds `fun NeoUiText?.en(): String = runBlocking { load() }`, so English stays the oracle.
- The test JVM is pinned to `user.language=en` and `user.country=US` in `composeApp/build.gradle.kts`.

## 2. Runtime language switch (`core/i18n/NeoLanguage.kt`)

**Language model:**
- `enum class NeoAppLanguage(tag) { Device(null), English("en"), Norwegian("nb"), Swedish("sv"), Danish("da") }`
- `no` is normalised to `nb`; any other device language falls back to English.

**Applying it:** `expect fun applyNeoLocale(tag: String?)`, per platform:

| Platform | How |
|---|---|
| JVM | `Locale.setDefault` |
| Android | `Locale.setDefault`, `LocaleList.setDefault` and the configuration |
| iOS | `AppleLanguages` in `NSUserDefaults`. Check on the simulator; if it doesn't apply live, show "Restart to apply". |

**Recomposition:**
- Compose resources 1.10 keys on `Locale.current` and has no public override.
- `NeoLanguageScope` therefore applies the locale and wraps content in `key(tag)` plus `LocalNeoLanguage`.
- It sits in `App.kt`, below the Decompose root and session, so navigation and view models survive a switch.

**Storage:**
- `AppPreferencesState.language` and `AppPreferencesEmitter.setLanguage()`, kept per device in `NeoKeyValueStore` under the key `neoerp.app.language`.
- Read before the first frame.

**Settings:** a Language row in the "On this device" card (`ui/features/NeoFeatureScreens.kt`). Each language name is written in its own language.

**Dates:**
- `rememberNeoDateText()` follows `LocalNeoLanguage`.
- nb, sv and da arrays: `core_fmt_months_short`, `core_fmt_months_long`, `core_fmt_weekdays_short`.
- Callers outside composition use `NeoUiText.Item`: `CompanyFiscalFacts.kt:27`, `AccountsFormat.kt:34`, `AccountsTabWords.kt:32`.
- `AccountsMonthRanges.kt:22` parses ISO dates, never English month names.

## 3. Build checks (`jvmTest/.../i18n/`, data in `NeoERP-App/i18n/`)

| Check | What it enforces |
|---|---|
| HardcodedUiTextTest | A lexer over main sources. Allowlist: `@NeoNotUiText("reason")` and `// i18n-ignore: reason`. Baseline file `i18n/baseline/<module>.txt` (`path\|count`) that only shrinks. |
| KeyStandardTest | The key pattern, the fixed list of kinds, and that a key's prefix matches its file. |
| DuplicateEnglishTest | No two keys with the same English, unless the second carries `<!-- context: -->`. |
| GenericWordInModuleTest | About 80 core words are not allowed in module files. |
| MissingTranslationTest | Applies to the modules listed in `i18n/translated-modules.txt`. |
| PlaceholderParityTest | The same placeholders in every language, `one`/`other` plural forms, and an `args` comment for each placeholder. |
| UnusedKeyTest | Every key is used in main code. |

`AccountsStringResourcesTest` is replaced.

## 4. Rename (I18N-1b): `NeoERP-App/tools/i18n/rename.py`

1. **Inventory:** list every key with its English text and where it is used.
2. **Classify:** suggest the new key and file from a prefix map and kind tokens. A text goes to core when its English is generic or two areas use it.
3. **Opus review:** Opus checks `rename-map.csv`.
4. **Apply:** rewrite the XML in every language folder and the Kotlin `Res.*` uses and imports.

Keys are merged only when the English text and the kind are both the same. Today 249 values are repeated across 656 keys. The rename lands as one commit during a freeze, with no lanes open.

## 5. Lanes

Order:
1. **1a** foundation
2. **1b** rename (freeze)
3. **1c** lanes in parallel
4. glossary (drafted in parallel)
5. **I18N-2** in the same lanes
6. **I18N-3** fit

| Lane | Scope | Texts |
|---|---|---|
| L1 | accounts receivables, tax, templates | ~1,050 |
| L2 | accounts payables | ~950 |
| L3 | accounts journals, periods, yearend, calendar, chart, dimensions, home, review, usedfor, plus root `Accounts*.kt` | ~650 |
| L4 | accounts reports, sie, obimport, openingimport | ~550 |
| L5 | organization, agreement, entitlement | ~1,250 |
| L6 | people, roles, security, companyaccess, platform, audit | ~1,350 |
| L7 | hr, payroll, ess, reports, dashboard, inbox, profile, auth, context, ui/shell | ~900 |
| Foundation | core, designsystem, app | ~450 (in 1a) |
| B1 (backend, I18N-4) | server free text to code + args; seeded chart and tax names in the company language; Keycloak messages nb/sv/da plus `ui_locales` | — |

**How lanes work:**
- Each lane owns its Kotlin folders, its tests, its module string files in all four language folders, and its own baseline file.
- A lane writes new core keys into `values/strings_core_req_<lane>.xml`.
- The lead promotes them into core (`tools/i18n/promote_core.py`) at each merge wave.
- Lanes run in worktrees `NeoERP-worktrees/i18n-<lane>` and never push.

## 6. Translation

**Glossary:** `NeoERP-App/docs/i18n/glossary.csv` (en, nb, sv, da, source, note), about 250 terms. Opus approves it before I18N-2.

**Sources:**
- Norwegian: NS 4102 and Skatteetaten
- Swedish: BAS and Skatteverket
- Danish: Standardkontoplan and Skattestyrelsen
- SAF-T and SIE terms stay unchanged.

**Style:**
- Address the reader with "du".
- Sentence case, no exclamation marks, and verbs for actions.
- Moderate bokmål forms.
- Quotes: «» in nb, ”” in sv, »« in da.

**Plurals and placeholders:** plurals use `one` and `other`; placeholders `%n$s` are kept and may be reordered.

**Opus review:**
- The glossary in full.
- All core keys and all `error` and `msg` keys.
- A 15% sample of the rest.
- The nb screenshots per lane.

## 7. Fit on desktop, tablet and phone

**Screenshot tests:** 390×844, 820×1180 and 1440×900, in nb, pseudo and en. They cover the shell and sidebar, a table list, a form dialog, a wizard, a footer and the status pills.

**Component changes:**
- **NeoButton and NeoStatusBadge:** ellipsis, with the full text on hover or long-press (`NeoOverflowText`).
- **NeoTableHeader:** `maxLines` 2.
- **NeoFooterLayout:** stacks full-width when the buttons alone don't fit.
- **To check:** NeoTabs badges, NeoSegmentedChoice (a select when narrow), NeoWizardStepper, NeoPageHeader breadcrumbs, the 232dp sidebar labels, and field labels (wrap).

## 8. Risks
- Test churn: 922 assertion lines plus field type changes in view models.
- The iOS live switch.
- `key()` resets form state when the language changes.
- Parsing English month names breaks once months are translated.
- Compile time grows with about 10k `Res` accessors.
