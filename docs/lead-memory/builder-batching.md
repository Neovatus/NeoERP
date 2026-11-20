---
name: builder-batching
description: "Don't pile new items onto a running builder; one Gradle-running builder per checkout at a time; targeted tests only, full compile once per batch"
metadata:
  node_type: memory
  type: feedback
  originSessionId: fe966f25-7261-4d33-af0b-3f8dddc67e0c
  modified: 2026-10-29T16:39:59.066Z
---

Keep builder batches small and fixed: never SendMessage extra items to a builder that is already running —
queue them as the next batch. Only one builder compiles/tests in a checkout at a time (others may edit);
parallel Gradle runs in the same project block on the lock and break the build cache. While working, run only
the affected tests (no Android compile); full JVM + Android compile once at the end of a batch.

**Why:** Jabran (2026-10-29) asked why an Accounts re-check batch took 1 h 3 min — it had grown from 13 to 20
items mid-run, and four builders shared one NeoERP-App checkout, waiting on each other's Gradle runs.

**How to apply:** when new findings arrive mid-run, collect them for the next batch; stagger builders on the same
repo or give the second one edit-only work. Related: [[edit-in-place-test-in-copy]], [[targeted-test-runs]].

**Untracked files (2026-10-29):** twice a builder's pathspec commit left NEW files out (V24 migration; V38 + country lists + tests), so the commit didn't build. After every builder report, run `git status --short` in both repos and commit any `??` files that belong to the change before giving Jabran a push summary; tell builders to `git add` new files explicitly.

**One full run per batch, at the end (Jabran 2026-10-30, "why running full app + UI multiple times?"):** when a batch needs the full `:composeApp:jvmTest` (shell/DI/auth/money-date changed), run it ONCE after all edits — never at the start and again at the end. Android compile once per batch, at the end. Briefs must not say "full run first, then re-run".
