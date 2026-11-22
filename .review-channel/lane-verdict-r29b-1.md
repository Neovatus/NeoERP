# Lane verdict: R29b-1 (org-service company scope) — 2026-11-22

**Verdict: MERGE** (old-Mac lead, test Mac). Needs Jabran's MERGE before the fast-forward of BE `phase/4` `6c31dfbb` → `64509abe`.
- Fast-forward possible; 135 files, no migration; no AI attribution.
- Security / company-isolation lane: Opus + Fable (builder Mac), each FIX in round 1, both ACCEPT after two fix rounds; final gate files written by the reviewers (`review-final-1-opus.md`, `review-final-2-fable.md`); REVIEWS OK.
- **Full gate (old Mac):** `verify: OK`, 12 min, 4438 tests (+106), 0 failed, 59 skipped; money invariants OK; Docker up for `PlatformWriteRealTransactionTest`.
- Baseline ratchet: 44 → 35 unclassified, R34 scan 1 → 0; `OrgScopeResolver` mints reach from ACTIVE memberships or a checked platform permission.
- **Behaviour changes for wrong callers only** (lane-ready table): another company's or out-of-reach request → 404 (was 403); scope-all staff without the endpoint's permission on by-id resources → 404; user-service down → 503 `AUTHZ_UNAVAILABLE` on by-id and list reads; platform writes and the 3 platform-wide reads refused (503) when their audit cannot be written. The App retest covers the new 404/503 pages.

**Merged 2026-11-22** after Jabran's MERGE: BE `phase/4` `6c31dfbb` → `64509abe`, fast-forward through the pre-push hook (verify marker, RISK). Jabran's checkout fast-forwarded, hooks reinstalled, worktree and lane branches removed.
