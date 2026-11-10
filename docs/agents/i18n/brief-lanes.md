# App languages: lane brief (I18N-1c move + I18N-2 translate, per lane)

Read first: [brief.md](brief.md), [plan.md](plan.md) (Lead decisions, §5), `NeoERP-App/docs/i18n/naming-standard.md`, `style-guide.md` and `glossary.csv`, plus `NeoERP-App/ARCHITECTURE.md` and AGENTS.md. Do not read or touch any PROJECT-STATE*.md.

## Your lane
Each lane owns:
- its Kotlin folders (main and tests);
- its `strings_<module>_<area>.xml` files in `values`, `values-nb`, `values-sv` and `values-da`;
- its `i18n/baseline/<module>.txt` line(s) and its rows in `i18n/baseline/bridges.txt`.

Do not edit other lanes' folders, the `strings_core_*.xml` files, or shared design-system code.

| Lane | Folders (features/…) | Module code |
|---|---|---|
| L1 | accounts/presentation/receivables, tax, templates | accounts |
| L2 | accounts/presentation/payables | accounts |
| L3 | accounts/presentation/journals, periods, yearend, calendar, chart, dimensions, home, review, usedfor; root accounts/presentation/*.kt; accounts/domain and accounts/data | accounts |
| L4 | accounts/presentation/reports, sie, obimport, openingimport | accounts |
| L5 | organization, agreement, entitlement | org, platform |
| L6 | people, roles, security, companyaccess, platform, audit | iam, platform, shell |
| L7 | dashboard: only PlatformDashboardScreen/ViewModel and the platform overview (the company users' part of DashboardScreen.kt is old and skipped), profile, auth (sign-in, sign-up), context | shell |

The accounts lanes share `strings_accounts_common.xml`:
- Only **L3** edits it.
- L1, L2 and L4 add shared accounts words to `strings_accounts_req_<lane>.xml`, which the lead promotes.
- New core words go to `values/strings_core_req_<lane>.xml` (English plus nb/sv/da). The lead promotes them at merge.

## Skipped modules (Jabran 2026-11-10: old, to be redesigned and rebuilt)
hr, payroll, ess, reports (HR employee/attendance reports), inbox, and the company users' part of the dashboard (DashboardScreen.kt below the platform branch) are April prototypes that only got sweep fixes (Jabran: HR, Payroll and ESS were not built properly). They are not moved or translated now. Their HardcodedUiText baseline lines stay frozen. When a module is rebuilt, its new code follows the standard from day one (keys only, en/nb/sv/da in the same commit) and its baseline line is removed. Built properly and translated: platform dashboard (features/dashboard, L7), platform admin (features/platform, L6), organization, sign-up/sign-in, accounts.

## Work, in this order
1. **Move.** Every hard-coded UI text in your folders goes into keys.
   - Look in core first: reuse, never repeat.
   - Name keys by meaning; use whole sentences with numbered placeholders; counts as `<plurals>`; no glued text.
2. **NeoUiText.** View models, rules, mappers and `*Wording` / `*Texts` / `*Support` objects hold `NeoUiText`, never `String`.
   - Fold `SieCopy`, `RefundText`, `ReceiptNotice` and the Words classes into NeoUiText.
   - Remove every bridge use in your folders (`untranslated()`, `NeoStateCopy.*`, `refusalCopy`, `neoModuleName`, `NeoRelativeTime.ago`, `displayText` …).
   - Pass ISO dates and `NeoFormat` instead of English month names.
3. **Server texts.** Map server codes to words; never show a server's free English `message`.
   - The backend added codes for hr, payroll, audit and user-service (`docs/agents/i18n/report-b1.md`).
   - L6 and L7: list any HR, payroll or audit sentences that still reach the screen without their own code, in your report.
   - Account and tax code names are company data in the company's language (`name`, with `nameEn` as a search and secondary name). Never translate them.
4. **Tests.** Assert English through `.en()`. English text stays as it is, except abbreviations, Title Case, straight apostrophes (use ’) and glued sentences.
5. **Translate** every key you own into nb, sv and da.
   - Follow the glossary and the style guide exactly.
   - Mark a doubt with `<!-- review: … -->`.
   - Then add your module to `i18n/translated-modules.txt`. For an accounts lane, the lead adds `accounts` when L1–L4 have all landed.
6. **Baselines.** Run `--tests 'com.neovatus.neoerp.app.i18n.*' -Pi18n.updateBaseline=true`. Your module's lines in the HardcodedUiText baseline and in `bridges.txt` must end at 0.
7. **Fit.** No fixed widths that clip longer text in your screens:
   - buttons, tabs, column headers and pills use the design-system components;
   - a row of actions wraps or stacks on a phone.

   Check a narrow width (390 dp) and a tablet width (820 dp) in your screen tests where a screen has them.

## Rules
- **One lane at a time, no helper agents** (Jabran 2026-11-10): lanes run one after another; a lane builder does its own work and never starts sub-agents.
- **Workspace.** Work in your own worktree: `/Users/jabransiddiqui/Offices/Neovatus/NeoERP-worktrees/i18n-<lane>`, on branch `i18n-<lane>`, made from dev-app at the rename commit. Never push. Commit by path:
  `git -c user.name=jabransiddiqui -c user.email=jabransiddiqui@outlook.com commit -m "<msg>" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>" -- <paths>`.
- **Gradle.** `JAVA_HOME=/Users/jabransiddiqui/Library/Java/JavaVirtualMachines/jbr-21.0.7/Contents/Home GRADLE_USER_HOME=/tmp/gradle-home ./gradlew … -Pkotlin.daemon.jvmargs=-Xmx4g`.
  - One Gradle build on the whole machine at a time: start every Gradle command as `lockf -k /private/tmp/neoerp-gradle.lock ./gradlew …` (36 GB machine; parallel builds fill memory). Run `./gradlew --stop` after the Android or iOS compile.
  - Run targeted tests per step.
  - Run no tests at all (Jabran 2026-11-10): the lead runs every test once after merging the round. Compile only when needed to see errors, and once at the end (JVM main + test, then iOS, then Android) so the branch builds.
- **Behaviour.** No behaviour change beyond text. If a screen needs a layout change for longer text, keep it minimal and say so in the report.
- **Report.** Your report lists:
  - the commits;
  - the keys added per file;
  - the core and accounts-common requests;
  - the bridges removed;
  - the server sentences without codes;
  - the translation doubts;
  - the test counts.
