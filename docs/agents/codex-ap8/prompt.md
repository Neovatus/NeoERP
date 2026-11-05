# Codex build — AP-8 generalised opening-balance import wizard (app, on mocks)

You are a builder for NeoERP. Work ONLY in the worktree below. Commit there; **never push, never merge, never force-push**. When done, write a short report to `/Users/jabransiddiqui/Offices/Neovatus/NeoERP/docs/agents/codex-ap8/report.md`.

## Where
- App worktree: `/Users/jabransiddiqui/Offices/Neovatus/NeoERP-worktrees/codex-ap8-app`, branch `codex/ap-8` (from dev-app). Kotlin Multiplatform + Compose Multiplatform (Android / iOS / JVM desktop).
- Do not touch any other checkout or worktree (Claude builders work in `sb2d-2a-be` and `fe-2-be`).

## What
AP-8 = CP-OBI.2: one opening-balance (OB) import wizard for every country — CSV and Excel upload, mapping, preview with the trial balance, opening items pre-filled from party balances (OBI-12), confirm. The existing SIE-only OB path (`/sie-imports` OB path) is retired from the UI once this replaces it; the SIE import wizard itself must keep working (regression).
- The backend (BE-13, CP-OBI.1) is NOT built yet. Build the app **against mocks** (mock repository with realistic data and refusals), behind the same repository interface the real API will use, exactly as the contract describes. No fake "live" success against the real server: when the backend endpoints are missing, the real repository returns the explicit "not available yet" state.

## Read first
- Contract: `NeoERP-BackEnd/docs/api/accounts-ob-import.md` (OBI, incl. §13 and §15 decisions OBI-1…OBI-12, OBI-A1…A3) and `accounts-opening-items-import.md` (OI). Checkout: `/Users/jabransiddiqui/Offices/Neovatus/NeoERP/NeoERP-BackEnd/docs/api/`.
- App specs: `NeoERP-App/docs/design/specs/accounts-ob-import.md`, `accounts-opening-items-import.md`; rig `NeoERP-App/docs/design/screen-rig/accounts-obi.jsx` (the clickable design — match it).
- Phase 3 plan: `/Users/jabransiddiqui/Offices/Neovatus/NeoERP/docs/agents/accounts-phase3/plan.md` rows BE-13 / AP-8 and the M6 acceptance text (AC-OBI).
- App rules: `NeoERP-App/.claude/CLAUDE.md`, `ARCHITECTURE.md`; UX: `/Users/jabransiddiqui/Offices/Neovatus/NeoERP/docs/handover/design-principles.md`, ux-principles §14/§21/§22, `screen-standard.md`; tokens `docs/design/design-system/neoerp-tokens.json`. Domain `/Users/jabransiddiqui/Offices/Neovatus/NeoERP/docs/domain/RULES.md`.
- Existing SIE import wizard code in the app (search `SieImport`) — reuse its upload/preview components where they fit.

## Rules
- Existing components (side panels, dialog sheets, reason gates, money/date/table/select controls); disabled-with-reason, not hidden; errors on the field; state in view models; all words in strings files; no hard-coded colours; Liquid Glass = system defaults only.
- commonMain must compile for iOS: **never use `String.format`/`"…".format`, `putIfAbsent` or `assert(`**.
- Tests: view-model state tests for every step and refusal (wrong file, unmapped columns, unbalanced TB, period closed, missing rights), the OBI-12 pre-fill, and the SIE wizard regression. Run only those tests plus the accounts app package: `./gradlew :composeApp:jvmTest --tests '…'`; then `./gradlew :composeApp:compileKotlinIosSimulatorArm64` must have 0 errors. One Gradle run at a time. No full suite.
- Never read `PROJECT-STATE*.md`, `.local-secrets` or key material; no passwords or tokens.
- Commit identity: `git -c user.name=jabransiddiqui -c user.email=jabransiddiqui@outlook.com commit -m "feat(accounts): AP-8 opening-balance import wizard (mocks)" -m "Co-Authored-By: Codex <noreply@openai.com>"`.

## Report (`report.md`)
Screens built, mock contract assumptions (anything the contract left open), tests and counts, iOS result, commit hash, open questions.
