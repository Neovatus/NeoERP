---
name: no-compile-each-change
description: "Don't compile the app after every UI change; Jabran runs it and reports errors"
metadata:
  node_type: memory
  type: feedback
  originSessionId: fe966f25-7261-4d33-af0b-3f8dddc67e0c
  modified: 2026-10-24T14:51:08.585Z
---

When making app UI changes in Jabran's checkout, don't run Gradle compiles after each change. Commit the edit; Jabran runs the app (Hot Reload) and tells me if there is a compile error.

**Why:** compiles take minutes (and hit memory limits), slowing the live review loop; he sees errors immediately anyway.

**How to apply:** for UI-lane changes, edit → commit → tell him what to look at. Still compile before anything is pushed or handed to others, and for non-UI or critical changes. Related: [[targeted-test-runs]], [[builders-isolated-checkout]].
