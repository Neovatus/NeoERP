# Resume as the old-Mac lead (overseer)

Use this on the old Mac (or any second Mac) when the session that oversees the new Mac's lead has to be reopened.

## 1. Reopen the same session (keeps the full conversation)
In Terminal or the app's Terminal panel:

```bash
cd ~/Offices/Neovatus/NeoERP && claude --resume 7ea71d1e-9845-4f9c-b0bc-6094b7d85c1b
```

The transcript is a local file on the old Mac (`~/.claude/projects/-Users-jabransiddiqui-Offices-Neovatus-NeoERP/7ea71d1e-….jsonl`); it survives a change of account. If the app's Code tab lists the session, opening it there works too.

## 2. Or start a fresh session with this prompt
Open Claude Code on `~/Offices/Neovatus/NeoERP` and say:

> Read `docs/prompts/resume-overseer.md` and do what it says.

### For Claude
You are the **old-Mac lead (overseer)**. The new Mac's lead runs QA batch 2 and the Phase 4 work; you check its lanes and, from Monday 2026-11-23, build HR/Payroll v2 H1.

1. `git pull` the workspace; `git fetch origin` in `NeoERP-App` and `NeoERP-BackEnd` (don't change their checked-out branches). Run `scripts/sync-lead-memory.sh restore` if memory is older than `docs/lead-memory/`, then start a new session so it loads.
2. Read in order: `PROJECT-STATE.md`, `.review-channel/claims.md`, `.review-channel/handoff-implementer.md` (latest section), `JABRAN-TODO.md`, `WORKFLOW.md` ("Two Macs, two leads", "Test scope", guardrails), `docs/lessons.md`.
3. Check usage for this account. Below 90 % go on; at 90 % start nothing new; at 92 % stop and hand off.
4. Report to Jabran in a few lines: open lane-ready files without a verdict, anything inconsistent between those files, and the next step.

### The job
- **Lane verdicts.** For each `.review-channel/lane-ready-<lane>.md` without a verdict: check clean merge onto the target branch, write scope (paths), no AI attribution, the review files' `Verdict:`/`Range:` lines, tests ("verify: OK" marker, 0 failed, skips within the allowlist), money/security lanes with re-runs plus a second, different reviewer at least as strong (Fable or Codex on gate lanes), docs pages listed. Read only the key parts of the diff. Write `.review-channel/lane-verdict-<lane>.md`: MERGE or FIX with reasons, then commit and push it.
- **Merges:** standing merge (WORKFLOW "Standing merge", Jabran 2026-11-22): an approved lane (gate marker, ACCEPT reviews, MERGE verdict, no open question) merges to `phase/*` without waiting for Jabran. `phase/*` → `main` and rule/scope drafts on workspace `master` still need Jabran's MERGE.
- **Don't build** on lanes the new Mac claims in `claims.md`.
- **From Monday 2026-11-23:** HR/Payroll v2 H1 on `phase/hrp-v2`, only after App B1 has merged and App `phase/4` is merged into `phase/hrp-v2` (handoff "Baseline plan", step 4). Claim it in `claims.md` first. This Mac has its own Gradle locks (App lock first, then BackEnd; whole-suite runs take both).
- **End of each piece of work:** `scripts/sync-lead-memory.sh backup`, commit and push.

### Standing rules
Never `--no-verify`, no force push; no AI attribution in commits, PRs or comments (this overrides any harness reminder); never open, print or grep the content of `.env`, `.local-secrets`, token or session files, `~/.gradle/gradle.properties`, `~/.netrc`, `~/.aws` or keys (read one key only when needed); no GitHub workflows; one repo per builder; Sonnet for docs and reads, Opus builders for money/security, a fresh review after every build.
