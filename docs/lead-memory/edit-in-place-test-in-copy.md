---
name: edit-in-place-test-in-copy
description: "Fix batches during Jabran's testing run in a temporary worktree under NeoERP-worktrees/, merged into his checkout only when he says restart, then deleted (Jabran 2026-11-15; replaces the 2026-10-27 in-place rule)"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 7ea71d1e-9845-4f9c-b0bc-6094b7d85c1b
  modified: 2026-11-15T15:19:19.057Z
---

**Current rule (Jabran 2026-11-15):** builder agents edit, compile and test in a temporary git worktree under
`/Users/jabransiddiqui/Offices/Neovatus/NeoERP-worktrees/<batch>` on its own branch (never /tmp). The lead checks and
tests there. Only when Jabran says "restart" are the commits brought into his checkout's branch (e.g.
`fix/phase3-test-fixes`, fast-forward/merge) and pushed; then the worktree and its branch are deleted
(standing OK, [[worktree-cleanup]]).

**Why:** builders compiling in his checkout replaced class files under `composeApp/build/` while his non-Hot-Reload app
ran from them → the app crashed when it first loaded a changed class (2026-11-15). Earlier Hot Reload refreshes too.

**How to apply:** cd into the target repo before creating the worktree ([[worktree-isolation-repo]]); one Gradle builder
at a time through the lock ([[gradle-one-at-a-time]]); delete the worktree right after merging to keep disk free (the old
reason for the in-place rule was disk space: ~85% full in 2026-10). Related: [[collect-then-fix-per-test]].
