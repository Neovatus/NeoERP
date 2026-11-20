# DOCS-1: remove contradictions from the guides (brief)

Approved by Jabran 2026-11-20 (evening plan step 2). Source: `docs/reviews/process-review-fable-2026-11-20.md` H1,
M1, M2 (and H7/M3 where they name dead links); lesson L25 ("rules that bind builders or reviewers live in the repo;
memory holds only lead habits; a new rule names what it supersedes and the old text is deleted in the same commit").

## Goal
`WORKFLOW.md` is the single current answer for push, review, test scope, compaction and models. No guide in the
workspace says something different.

## Current answers (Jabran-approved; do not change them, only make the docs agree)
- **Push:** the lead pushes right after verified commits ("BUILD SUCCESSFUL" and "0 failed" read, verify marker once
  Lane 0 lands); builders never push; pushes outside approved work need Jabran.
- **Review:** every build gets a fresh independent Opus review before it lands. Money/security lanes: the reviewer
  re-runs the builder's targeted tests from clean, writes a failing test or reproduction per finding, and a second,
  different reviewer (Codex or `/security-review`) checks before merge. UI and wording lanes: one review, no re-runs.
- **Tests:** builders run their targeted tests through the Gradle lock (compile only for wording lanes); the lead runs
  one full run per merge batch (≤ 3 related slices) before push. An unrelated failure gets a backlog row with an owner
  the same turn, or it blocks.
- **Compaction:** the lead asks for `/compact` at about 50 % context; other sessions hand off at about 80 %.
- **Models:** Opus 5.5 default builder and every review; Sonnet 5.5 only fully decided work and scripted testers;
  Haiku 5.5 mechanical; Fable 5.2 only critical problems. Remove references to retired models (e.g. "Fable 5.1").
- **Reviewer channel:** `.review-channel/to-*.md` and the cloud Cowork reviewer are retired; reviews are fresh Opus
  sub-agents plus Codex or `/security-review`. `.review-channel/handoff-*.md` stays for handoffs.
- **One repo per builder; write scope + read scope in every brief; Gradle through `lockf`; no AI attribution.**

## Write scope (workspace repo only; anything else: stop and ask)
`WORKFLOW.md`, `AGENTS.md`, `CLAUDE.md`, `.codex/CODEX.md`, `docs/agents/docs-cleanup/**`.
Do not edit `PROJECT-STATE.md`, `docs/lessons.md`, `.review-channel/handoff-implementer.md`, anything in
`NeoERP-App/` or `NeoERP-BackEnd/` (Lane 0 builders are working there), or the lead's memory.

## Read scope
The files above, `NeoERP-App/AGENTS.md`, `NeoERP-App/.claude/CLAUDE.md`, `NeoERP-App/.codex/CODEX.md`,
`NeoERP-BackEnd/AGENTS.md`, `NeoERP-BackEnd/.claude/CLAUDE.md`, `NeoERP-BackEnd/.codex/CODEX.md`, and the memory folder
`docs/lead-memory/` (a copy of the lead's memory). Never open `.local-secrets`, token or session files.

## Output
1. Edits to the write-scope files: delete superseded text (don't stack "update:" paragraphs), keep WORKFLOW.md's
   structure, plain short sentences. Where a section is history only, cut it to one line with its date.
2. `docs/agents/docs-cleanup/proposals.md` with two tables the lead will apply after Lane 0 merges:
   - **Repo guides:** file:line, current text (≤ 15 words), replacement, which current answer it breaks.
   - **Memory:** memory file, keep / delete / move-to-repo, reason (memory keeps lead habits only).
3. One commit on workspace `master`: `git -c user.name="Jabran Siddiqui" commit -m "docs(workflow): one current answer per rule (DOCS-1)"`.
   No Co-Authored-By, no AI attribution. Do not push.

## Stop and ask
A current answer above is unclear or two Jabran decisions seem to conflict; a change would alter a rule rather than
remove a contradiction; you would edit outside the write scope.

## Report (final message, ≤ 25 lines)
Commit hash, what was removed or merged per file, counts of proposals in each table, open questions.
