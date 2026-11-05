# Codex second review — BE-13 opening-balance import engine (M6, CP-OBI.1)

Role: independent second reviewer. READ ONLY. Write only `/Users/jabransiddiqui/Offices/Neovatus/NeoERP/docs/agents/be-13/codex-review.md`.

- Worktree `/Users/jabransiddiqui/Offices/Neovatus/NeoERP-worktrees/be-13-be`, branch `claude/be-13`, commit `de4bf31` (55 files). Migration `V64__ob_import_formats.sql` (V63 belongs to SB2d-3, merging first).
- Contract `docs/api/accounts-ob-import.md` (§10, §13, §15 decisions, new "as built" OB-B1…OB-B17) and `accounts-opening-items-import.md`. Phase 3 plan BE-13 row and M6 acceptance (Lahore PK). RULES.md.

Focus: (1) security of file handling — XLSX reader built on ZIP + StAX (zip bombs, XXE/entity expansion, entry count, ratio, path tricks), CSV parsing, size limits, quota, idempotency; (2) correctness of balances: delimiter/number-style detection, amount scale, debit/credit vs balance shapes, duplicate accounts, party column summing, skipped rows; (3) posting: year-start vs mid-year go-live (P&L folding), receivables/payables held to opening balance equity, difference target per country, year-result account rule, dimension sets via the draft writer; the Lahore scenario numbers; (4) OBI-12 pre-fill CSV (format matches the opening-items import, formula-injection risk of names starting with = + - @); (5) tenant isolation, rights (SIE_IMPORT.RUN), HISTORY imports 404; (6) SIE regression and `/sie-imports` behaviour unchanged.

Do NOT run full suites (builder: accounts 1792/0, arch 36/0). One test only if you add a probe or doubt a result.
Report: verdict, findings High/Medium/Low with file:line, scenario and fix, then "checked and correct". Short and plain.
