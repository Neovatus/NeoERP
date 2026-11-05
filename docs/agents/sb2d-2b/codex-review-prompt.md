# Codex second review — SB2d-2b balances keyed by dimension set (V62)

Role: independent second reviewer. READ ONLY. Write only `/Users/jabransiddiqui/Offices/Neovatus/NeoERP/docs/agents/sb2d-2b/codex-review.md`.

- Worktree `/Users/jabransiddiqui/Offices/Neovatus/NeoERP-worktrees/sb2d-2b-be`, branch `claude/sb2d-2b`, commit `239c755` (parent 61e29f4 = SB2d-2a + FE-2 + dev). Migration `V62__sb2d_balance_key_by_set.sql`.
- Plan `docs/agents/accounts-sb2d/plan.md` §5, §10 M2b, §11 SB2d-2b, §12, and the "SB2d-2a review notes" section. Contracts `docs/api/accounts-a2.md` (C-25 replaced), `accounts-a3.md` (C-12 buckets, YearEnd.hash) incl. the new "as built" notes.

Focus: (1) V62 rebuild correctness and the totals check (null-safe, all five amounts, period and year), the swap, FKs incl. composite branch FK, indexes, grants; (2) BalanceKey/YearBalanceKey and every reader — engine upsert, ledger check (new BRANCH_EQUALS_SET), year-end buckets per (P&L account, set) now including stock location, reports (TB, GL, P&L, BS, comparatives, cash flow) and filters (branch from row, cost centre via set, untagged excluded), SIE export grouping; (3) YearEnd.hash compatibility (unchanged without locations); (4) year-end refusing sets with project/free dimension until SB2d-4; (5) concurrency of the upsert on the new key; (6) the load-check numbers (V61 125 s, V62 27 s, ~10 GB WAL) and the Merge Join plan for the V61 journal_lines UPDATE.

Do NOT run full suites (builder: accounts 1758/0, arch 33/0). One test only if you add a probe or doubt a result.
Report: verdict, findings High/Medium/Low with file:line, scenario and fix, then "checked and correct". Short and plain.
