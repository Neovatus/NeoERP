---
name: secret-files-never-printed
description: "Never open/print/grep-content/copy .env (incl. tracked infra/.env), .local-secrets, token/session files, ~/.gradle/gradle.properties, ~/.netrc, ~/.npmrc, ~/.aws, keys; read one key only; put it in every brief (2026-11-22)"
metadata:
  type: feedback
---

Guardrail in WORKFLOW.md (after "No GitHub CI in dev"). To check one setting, read only that key (`grep -c '^org.gradle.java.home=' ~/.gradle/gradle.properties`), never print the file.

**Why:** 2026-11-22 a BE-JDK21 reviewer printed `~/.gradle/gradle.properties` in full; it holds third-party secrets from other projects (now in that sub-agent's transcript). Jabran's standing rule was "never open .env, .local-secrets, token or session files"; this widens it to user-level config files.
**How to apply:** every builder/reviewer brief carries the sentence; both leads. Related: [[short-handbacks]], [[lead-runs-demo-tokens]].

**Also (2026-11-22):** never copy `.local-secrets` into a worktree; point `NEOERP_ACCOUNTS_BANK_KEY_FILE` at `NeoERP-BackEnd/.local-secrets/accounts-bank-keys.properties` by path. Copies (644) appeared in the be-jdk21 worktree at 01:21 and were removed unread. When stopping a jar stack, match `services/.*/build/libs/.*\.jar`, never `java .*-jar` (that also kills the Gradle wrapper of a running gate).
