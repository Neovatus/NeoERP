---
name: builders-isolated-checkout
description: Builders must never build in the backend checkout Jabran's local services run from (DevTools hot-restart applies unfinished migrations)
metadata:
  type: feedback
---

Jabran runs `./scripts/run-all-services.sh` from `NeoERP-BackEnd`; Spring DevTools watches that checkout's `build/` and hot-restarts on change. A builder compiling in the same checkout makes the live accounts-service apply an unfinished Flyway migration to Jabran's real database (happened twice: V12 2026-10-16, V21 2026-10-20 → checksum mismatch, startup failure).

**Why:** applied migrations can't be edited afterwards; a mismatch blocks startup and risks his data.

**How to apply:** every backend build brief says: build/test in a separate worktree or isolated output dir; Testcontainers/disposable DBs only. A migration file is frozen the moment any database has applied it — later changes go into the next number. Never Flyway repair. See [[targeted-test-runs]].

**Never in /tmp (2026-10-23):** a Mac restart empties `/private/tmp`; Codex's checkouts there were wiped with accepted but unpushed CP-EV-1b. Isolated checkouts live in `/Users/jabransiddiqui/Offices/Neovatus/builds/<checkpoint>` with a `git bundle` after each commit; accepted work is pushed promptly. Codex session logs (`~/.codex/sessions/YYYY/MM/DD/*.jsonl`) hold its applied patches and can rebuild lost work.
