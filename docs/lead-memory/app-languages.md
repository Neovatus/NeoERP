---
name: app-languages
description: Jabran 2026-11-08 — one app, many languages; I18N-1/2 (en/nb/sv/da) run after dimension pickers, before Phase 4; every new string in en+nb+sv+da
metadata:
  type: project
---

Jabran approved 2026-11-08: one app with language packs (not separate apps). I18N-1 (move hard-coded text to resources, build check, language setting) then I18N-2 (full Norwegian bokmål + Swedish + Danish (Danish added same day)) run right after the dimension pickers slice and before Phase 4. Native accountant review is go-live gate L-7. FI/IS only when sold there; Urdu only on request.

**Why:** waiting makes translation debt grow with every new screen.

**How to apply:** after I18N-2, every builder brief must require new strings in values/, values-nb/, values-sv/, values-da/ in the same commit; a slice is not done without all four. Related: [[phase3-finish-plan]], [[release-gates]].

Structure (Jabran 2026-11-08): one core set of string files (actions, states, fields, format) + per-module files with module-prefixed keys; generic words only in core, keys named by meaning (action_open vs status_open).

**Order (Jabran 2026-11-08, later):** I18N-1 starts only after Jabran has tested and every issue he found is resolved (the quick add, document branch and lines block batch included). Then I18N-1 and I18N-2, then Phase 4.

**Update (Jabran 2026-11-08, late):** start I18N-1 now, right after the context compaction; Jabran tests the open items (quick add/branch/lines re-checks) later. Brief and naming standard: docs/agents/i18n/.

**Scope (Jabran 2026-11-08, after compact):** "Language all steps": I18N-1 through I18N-4 in one go, professional translations, no repeated text, fits desktop/tablet/phone. ~7,500 hard-coded texts (not ~170). Backend decisions: seeded account/tax names in the COMPANY language (not per user; English kept as searchable second name); Keycloak sign-in page gets nb/sv/da (approved, text and picker only). Brief: docs/agents/i18n/brief.md.

**Skipped as old (Jabran 2026-11-10):** hr, payroll, ess, reports (HR reports), inbox are April prototypes to be redesigned/rebuilt — not localized now; when rebuilt they follow the standard with en/nb/sv/da from day one. Built properly and localized: platform dashboard (features/dashboard), platform admin, org, sign-up/sign-in, accounts.
