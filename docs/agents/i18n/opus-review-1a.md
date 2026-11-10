# Opus review: I18N-1a foundation (fb1d14e2..9489afb7) — 2026-11-09

**Live switch:** works without `key(tag)`. It was proven on JVM, including lazy lists and popups. Android follows from the library sources and needs a device check. iOS is unverified.

The ViewModel and `remember` Strings keep the old language until the lanes adopt NeoUiText.

## Findings

**High (must fix before the 1c lanes open)**
- **H1** Device mode on no/nn device locales shows English, because the raw "no" locale has no `values-no` folder. Always apply the effective tag; keep the device's region.
- **H2** The English bridges are hidden behind `i18n-ignore` / `@NeoNotUiText` and mostly not deprecated:
  - NeoStateCopy (and `NeoNoResults`' default line), NeoReasonGateCopy, `neoPermissionActionLabel`, NeoRelativeTime NEVER/ago, `neoModuleName`, NeoAuthMessages, refusalCopy/ambiguousCopy.
  - Fix:
    - Add `@Deprecated` with ReplaceWith.
    - Use an `// i18n-bridge:` marker.
    - Add a shrinking `i18n/baseline/bridges.txt`.
    - Make NeoNoResults' line required.
- **H3** The HardcodedUiTextTest lexer misses:
  - `"$n selected"`-style templates;
  - escaped quotes;
  - `"Total:"` and `OK`;
  - nested template literals;
  - `append(" items")`;
  - `toasts.info(...)`.

  False positives: `key("…")` and `log.d`. Fix the lexer and regenerate the baselines.

**Medium**
- **M1** MissingTranslationTest counts `strings_core_req_*`. Lead decision: exclude the req files; the lead translates at promotion.
- **M2** `%%` is not unescaped by Compose Resources. Fix the style guide; PlaceholderParityTest fails on `%%`, `%s` and `%n$f`.
- **M3** A Danish string at `values-da/strings_core_components.xml:74` is missing a word.
- **M4** The `LocalNeoFormat` default, NoCompany, carries English months. Provide the language's NeoDateText in the scope.
- **M5** Verify iOS on the simulator and set `neoLocaleAppliesLive`.
- **M6** Add the NeoUiText exception to ARCHITECTURE.md: ViewModels may import resource types and `Res` only.
- **M7** NeoFooterContent writes state during measure, which costs one frame and is sticky. Use intrinsics and no state.
- **M8** sv `core_msg_selected_count` reads "1 valda". Make it `<plurals>`.

**Low**
- Add a `plural()` overload for Int.
- Document that args are pre-formatted Strings.
- `joinWith` single-pass replace.
- NeoUiText tests in nb/sv/da.
- NeoError `shownText` computed instead of a copied default.
- DuplicateEnglishTest:
  - use a distinct `<!-- distinct: -->` tag;
  - the "keep" rule should prefer an existing core key over a req key.
- Pin the Android/iOS unit tests to en.
- NeoOverflowText:
  - the tooltip hit area should cover the whole control;
  - the pill's long press inside a row is swallowed;
  - add a test.
- Rename `ProfileValidation`'s `object NeoValidation`.
- Translation fixes (16 keys), listed in the review hand-back:
  - da: Angiven årsag, Nederlandene, aftalehændelse, Moduladgang, Sessionen er udløbet;
  - sv: Löneadministratör, objekt, Räkenskapskalender, Redovisning/Redovisningsrapporter, Ingen dubbelregistrering;
  - nb: Slått sammen, I permisjon, Nivå for %1$s, "i produksjon";
  - sv/da "ago" capitals;
  - level label "Visning".
