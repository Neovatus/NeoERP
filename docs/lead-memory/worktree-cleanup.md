---
name: worktree-cleanup
description: Jabran 2026-11-05 — delete each merged worktree and its local branch right after the batch merges (standing permission)
metadata:
  type: feedback
---

Jabran (2026-11-05) said yes to cleaning up merged worktrees and to doing it automatically after each merge. Standing permission for: `git worktree remove` + `git branch -d/-D` of worktrees under NeoERP-worktrees/ whose work is on the merge target (today `origin/phase/<N>` or `origin/main`; was origin/dev / origin/dev-app) (check `merge-base --is-ancestor`, else `git cherry` + commit subject on dev) and that have no uncommitted changes. Never touch active builder/Codex worktrees, Codex's own ~/.codex/worktrees, or anything with uncommitted work — ask first there.

**Why:** ~95 stale worktrees had piled up (3.9 GB); first cleanup left 4 active ones (380 MB).
**How to apply:** last step of every batch merge. In zsh scripts never name a variable `path` (it is tied to PATH and breaks every command). Related: [[builders-isolated-checkout]], [[edit-in-place-test-in-copy]].

**2026-11-22:** both Macs: each Mac removes the worktrees it created, after the lane is on the target branch (`merge-base --is-ancestor <lane head> origin/phase/<N>`), together with the local lane branch; remote lane branches stay until the Phase PR merges. Worktree build folders hold most of the disk (Gradle outputs), so this is also the disk clean-up.
