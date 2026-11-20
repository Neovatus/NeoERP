# Lane ready: ISO-1 (ADR-026 row-level security draft) — 2026-11-21

**Repo / branch:** workspace `NeoERP`, `phase/4-b2-iso1` (pushed). Merge target: workspace `master` (the draft stays in `docs/drafts/` until Jabran accepts it; then it moves to `NeoERP-BackEnd/docs/adr/` on a b2 lane branch).
**Range:** `e3bb5fa..e2f87a5` (ab5fc7d draft, 8d844ec round-1 fixes, 0f3a622 round-2 fix, e2f87a5 lead: R2 names the `complete()` code change).
**Brief:** `docs/agents/rls-adr/brief.md` (on master). Approved: evening plan step 3 (Jabran 2026-11-20). No build follows until Jabran accepts the ADR.
**Drafter:** Opus 5.5. **Reviewer:** Opus 5.5, fresh, read-only; evidence checked against NeoERP-BackEnd `e36b6c6a`.

## Reviews (in `docs/agents/rls-adr/` on the branch)
- `review-1-opus.md`: Reviewed ab5fc7d, FIX: 1 BLOCKER (system-job flag `IS NOT NULL` leaks every company's queue/outbox rows on a reused pooled connection), 1 MAJOR (`REQUIRES_NEW` inner transactions skip `set_config`), 6 MINOR. 16/16 evidence spot-checks true. All fixed in 8d844ec.
- `review-2-opus.md`: Reviewed 8d844ec, fixes only: all 8 fixed; 1 new MAJOR (Super Admin platform-read audit writes `org_id = NULL` rows; D11 would refuse every call). Fixed in 0f3a622 with an insert-only exception; `complete()` appends a second row instead of updating, because an UPDATE would need a SELECT policy over all platform audit rows. Lead checked the fix (two-round rule: no third round) and added the R2 code-change line (e2f87a5).
- Security design, so a second, different reviewer is due before any **build** (Codex or `/security-review` on the implementation); for the draft itself the overseer's verdict is the second look.

## Tests
Docs only: no tests.

## Write-scope check
`docs/drafts/ADR-026-row-level-security.md`, `docs/agents/rls-adr/review-1-opus.md`, `docs/agents/rls-adr/review-2-opus.md` — inside the brief's scope. No AI attribution in commits (checked). No database access, no secrets read.

## Waiting on Jabran (in the ADR §7)
D1–D11 (recommendation: option B; RLS on Accounts now, Payroll/HR v2 and the reporting store from their first migration; org/user/audit/auth stay on app checks + tests) and open questions Q1–Q4 (rebuild timing, hosting provider, branch-level RLS, cross-company screens).
