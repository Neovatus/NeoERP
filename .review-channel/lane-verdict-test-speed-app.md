# Lane verdict: TEST-SPEED-APP — 2026-11-22

**Verdict: MERGE** (old-Mac lead, test Mac). Needs Jabran's MERGE before the fast-forward of App `phase/4` to `496c1517`.
- Fast-forward possible; write scope as listed; no AI attribution.
- Two different reviewers ACCEPT after one fix round; Fable's three MEDIUMs closed with failing-then-passing self-tests; light gate aligned with the BackEnd.
- `verify: OK`, 3905/0/1; 512m forks proven on a full run; 1786 size shots identical with 1 and 3 forks.
- After the merge: reinstall the App hook (`scripts/install-hooks.sh`) in every App checkout; then rebase FIX-APP-B1 onto `496c1517` for its gate.

**Merged 2026-11-22 (Jabran MERGE):** App `phase/4` `324d3039` → `496c1517` by fast-forward through the pre-push hook (marker verified, RISK). Hooks reinstalled in Jabran's checkouts; worktree removed.
