---
name: app-tests-hot-reload
description: "In-place NeoERP-App jvmTest runs fail with NoClassDefFoundError when Jabran's Compose Hot Reload session is running; use an isolated copy"
metadata:
  node_type: memory
  type: project
  originSessionId: 01e6cb16-5a8b-4e2e-998e-4f8ca7ee17b6
  modified: 2026-10-06T17:13:22.892Z
---

Jabran often has Compose Hot Reload running (`:composeApp:hotReloadJvmMain`). It recompiles jvmMain on every save and wipes `composeApp/build/classes` mid-test, so `:composeApp:jvmTest` in place gives BUILD FAILED / mass NoClassDefFoundError (seen 2026-10-06).

**Why:** not a flaky test; the build output is deleted under the test run. Never stop Jabran's Hot Reload process.
**How to apply:** for verification, rsync NeoERP-App (minus build/, .gradle/) into the scratchpad, set `NEOERP_KMM_NETWORK_PATH=/Users/jabransiddiqui/Offices/Neovatus/KMM-Module/KMM-Network`, run with `--no-configuration-cache`. Backend: avoid parallel Gradle runs on the same service module (XML result write failures). Related: [[orchestrator-mode]].
