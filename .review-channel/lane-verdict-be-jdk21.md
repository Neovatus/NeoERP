# Lane verdict: BE-JDK21 — 2026-11-22

**Verdict: MERGE** (old-Mac lead, test Mac). Needs Jabran's MERGE before the fast-forward of BE `phase/4` `50ac03dc` → `6c31dfbb`.
- Fast-forward possible; scope = build files, the floor check, locale pins, risk paths, go-live row, docs; `.github/workflows/services-test.yml` JDK lines only (no trigger, Actions stay off); no AI attribution.
- Opus FIX → fixed and ACCEPT; Sonnet ACCEPT; the MEDIUM proven by a check and a test that fail on the old JDKs.
- `verify: OK` on Java 21, 4332/0/59, money invariants OK; jar mode on 21 healthy.

**Merged 2026-11-22 (Jabran MERGE):** BE `phase/4` `50ac03dc` → `6c31dfbb` by fast-forward through the pre-push hook (marker verified, RISK). Jabran's BE checkout fast-forwarded, hooks reinstalled. Worktree kept until B1's simulator checks (the jar-mode stack runs from it).
