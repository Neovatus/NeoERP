# Codex second review — FE-2 resolved entitlements, statutory and scope rules, effective API (org-service)

Role: independent second reviewer. READ ONLY: do not edit code, commit, push or run migrations against shared databases. Write only your report: `/Users/jabransiddiqui/Offices/Neovatus/NeoERP/docs/agents/fe-2/codex-review.md`.

## What to review
- `/Users/jabransiddiqui/Offices/Neovatus/NeoERP-worktrees/fe-2-be`, branch `claude/fe-2`, range `9bf2a2e..b29c18b` (`0d23647` contract doc `docs/api/org-entitlements-effective.md`, `b29c18b` code). New org migration `V41__fe_upgrade_entitlement_rows.sql`.
- Approved plan: `docs/agents/fe-plan/plan.md` (§2, §4, §5, §7 FE-2, §12 decisions — Q5/Q7 "upgrade the data", §13 notes). Domain `docs/domain/RULES.md` §3, §5, §7, §8, §9.

## Focus
1. Security: the member endpoint's read rule (active member / platform Enter-company / platform with company in scope; 403 vs 404 leaks); it checks membership by calling user-service `/api/app/bootstrap` — judge that dependency, recursion risk and failure behaviour; branch of another company → 404; no references/reasons/actors in the body; internal facts machine-token only.
2. Resolver correctness: Bugs 1–4, country as ISO or name, statutory on regardless of company rows, company-scope ignores branch overrides, branch-scope duty off at a branch, DOCUMENT_OUTPUT kept on where FBR/NO e-invoicing is on, suspended/inactive company and branch, unimplemented modules never on, franchise arrangements with the franchise's own country, per-feature source/offCause.
3. Write refusals (409 codes) on every write path incl. agreement decisions and org requests (requests are only refused at approval today — is that acceptable?).
4. V41: which rows it removes/moves, history rows, idempotency, no audit-outbox writes from SQL, behaviour on a fresh database.
5. ETag/304 correctness, Cache-Control private.
6. Anything that changes today's behaviour for existing demo companies (e.g. LHRTEX branch overrides removed).

Tests: do NOT run full suites (builder: org 492 with one count test fixed, arch 30). Run a single test only if you add a probe or doubt a result.

## Report format (`codex-review.md`)
Verdict, findings High / Medium / Low with file:line, a concrete failing scenario and a suggested fix, then "checked and correct". Plain English, short.
