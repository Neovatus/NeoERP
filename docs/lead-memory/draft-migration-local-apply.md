---
name: draft-migration-local-apply
description: A backend restart while a builder has a draft migration in the checkout applies the draft; later edits then fail Flyway checksum
metadata:
  node_type: memory
  type: project
  originSessionId: fe966f25-7261-4d33-af0b-3f8dddc67e0c
  modified: 2026-10-31T13:33:00.195Z
---

2026-10-31: Jabran's local accounts DB applied a draft V34 at 23:47 (builder still editing in NeoERP-BackEnd); the commit at 00:24 differed, so the next start failed "checksum mismatch for version 34". Fixed by backing up the schema, dropping V34's (empty) objects and its flyway row so the committed V34 re-applied.

**Why:** we work directly in the checkouts ([[edit-in-place-test-in-copy]]), so a restart picks up uncommitted migrations.

**How to apply:** while a backend builder is adding a migration, tell Jabran not to restart the backend until it is committed. On a checksum mismatch, compare `installed_on` with the commit time; if the migration's tables are empty, undo it locally (backup first) instead of `flyway repair`, which would hide a schema difference. Related: [[builder-batching]].
