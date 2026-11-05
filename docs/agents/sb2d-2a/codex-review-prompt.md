# Codex second review — SB2d-2a dimension sets on every line (V61)

Role: independent second reviewer. READ ONLY: no edits, commits, pushes, or migrations against shared databases. Write only your report: `/Users/jabransiddiqui/Offices/Neovatus/NeoERP/docs/agents/sb2d-2a/codex-review.md`.

## What to review
- `/Users/jabransiddiqui/Offices/Neovatus/NeoERP-worktrees/sb2d-2a-be`, branch `claude/sb2d-2a`, commit `30deb78` (parent `9bf2a2e`). Migration `V61__sb2d_dimension_sets_on_lines.sql` (accounts-service); V60 storage/resolver already merged.
- Approved plan `docs/agents/accounts-sb2d/plan.md` §2, §4 (M2a), §6, §7 (Q5: a document line takes the document's branch; journals per-line branch), §11 row SB2d-2a, §12. Contracts `docs/api/accounts-a1.md` (SB2d-0 amendments + "as built" note), `accounts-b.md`, `accounts-c.md`.

## Focus
1. V61 backfill: correctness (every row gets the set equal to its old columns; nil-uuid join trick; all-null set per company), the trigger list disabled/enabled by name, FKs incl. the composite branch FK, project_id drop guard, failure modes, run time on large data (5M lines — no per-row hashing, hash joins).
2. Posting engine step 10.4a: placement (after accounts FOR SHARE, before sequence/balances), once per posting, reversal copies sets, year-end and machine posts, manual post re-resolve.
3. Draft writers: DraftDimensionSets validation (existence, company, slot) → 422 DIMENSION_INVALID without aborting the transaction; all 5 adapters; deduction lines copy the advance's set.
4. Lock invariant and the POSTING_RETRY mapping (40P01/55P03/40001 → 409, service-wide incl. draft saves — acceptable? side effects on non-posting endpoints, idempotency on retry).
5. Idempotency hashes: normaliser keeps existing stored keys' hashes unchanged; DIMENSION_CONFLICT.
6. Branch rule: document/advance lines hold branch null in their set; journal lines carry the header branch; C-13 against it.
7. Test-fixture helper `withPreV61DimensionColumns` — does it hide anything real?

Tests: do NOT run full suites (builder: accounts 1750 with 6 fixture/version failures fixed and re-run; arch 33). Run a single test only if you add a probe or doubt a result.

## Report (`codex-review.md`)
Verdict, findings High / Medium / Low with file:line, concrete failing scenario and fix, then "checked and correct". Short and plain.
