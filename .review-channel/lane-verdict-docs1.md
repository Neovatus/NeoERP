# Lane verdict: DOCS-1 — 2026-11-21

**Reviewed:** `df97a45..3452aa5` on `phase/4-b2-docs1` (WORKFLOW.md, AGENTS.md, .codex/CODEX.md, docs/agents/docs-cleanup/*), against `lane-ready-docs1.md`.
**Verdict: FIX (1 item), then MERGE without another verdict round.**

## Process: good
- Put a contract rewrite behind a verdict on its own initiative; local master reset to origin; based on current origin/master.
- Fresh Opus review, two rounds, all findings fixed or ruled; the lead's own round-2 edits match the reviewer's wording.
- Write scope respected (6 paths, all in the brief); no AI attribution; docs-only, so no tests is correct.
- Jabran's three answers applied as worded. "Two Macs, two leads" untouched.

## Result: checked
- Guardrails 3+5 merge keeps every element (re-runs, failing test or reproduction per finding, second different reviewer, nothing merged uncompiled, UI/wording one review) and adds the skip rule and the gate owners. Isolation item intact.
- Push, review, tests, compaction and usage thresholds now agree across WORKFLOW.md, AGENTS.md and .codex/CODEX.md. Cowork reviewer and `to-*.md` channel retired cleanly.

## FIX 1 (required): don't narrow the risk scope while the question is open
The old text gave a reviewer round to *risk-flagged* checkpoints: **money posting, numbering, locking or concurrency, security/auth, migrations, isolation**. The rewrite reduces the second reviewer and re-runs to "money and security" and moves the rest to an open question. That removes protection that existed before DOCS-1. Rule instead (it matches the existing Opus hard-rule list, so it is not a new decision):

> **Money and security lanes** means any change touching money posting, numbering, security/auth, locking or concurrency, migrations, or company isolation (the paths in `risk-paths.txt`). They get the re-runs and the second, different reviewer.

Put this definition once in Working mode, Review, and point guardrail 3 and the checkpoint step to it. Drop open question 1 from proposals.md as answered by this.

## Notes (no change needed for MERGE)
1. **Design and architecture owner** (open question 2) goes to Jabran. Overseer recommendation: "Design and architecture: the lead proposes (spec or ADR), Jabran approves; the reviewer checks the work against it." A fresh sub-agent shouldn't own decisions it doesn't remember.
2. **Memory deletes after MERGE:** `sync-lead-memory.sh` never deletes, so a memory file deleted on one Mac comes back from `docs/lead-memory/` on the next restore. Delete each file in three places in one commit: the Mac's memory, `docs/lead-memory/`, and the MEMORY.md line; tell the old Mac's lead to delete the same files there.
3. The 9 repo-guide edits go on b2 lane branches after Lane 0, as planned; each gets a lane-ready file like this one (short is fine).

After FIX 1: commit on `phase/4-b2-docs1`, merge to master, push, and note the commit in claims.md. No new verdict needed for this one-item fix.
