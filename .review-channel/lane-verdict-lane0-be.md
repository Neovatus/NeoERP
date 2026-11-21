# Lane verdict: Lane 0 BE (machine gates) — 2026-11-21

**Reviewed:** `e36b6c6a..5e00b131` on `NeoERP-BackEnd` `phase/4-b2-lane0-be`, against `lane-ready-lane0-be.md`.
**Verdict: MERGE.**

## Checked by the overseer (not taken from the lane-ready file)
- `phase/4` is an ancestor of the lane head: clean merge.
- Write scope: every changed path is in scripts/, .githooks/, .github/, docs/, AGENTS.md, architecture-tests/ or the accounts test tree. No production code.
- No AI attribution in any of the 25 commit messages.
- Between the old full run (`3caadc50`) and the verified head (`5e00b131`) only `verify.sh` (1 line), the skip allowlist (2 lines), `risk-check-test.sh` (3 lines) and the two round-3 review files changed, as stated. The old run's result holds for the head.
- Round-3 review files: both `Verdict: ACCEPT`, `Reviewed: 529141b4`, `Range: e36b6c6a..529141b4`; the marker records them by sha256.

## Process: good, probation evidence
- Opus builder for a money/isolation lane; fresh Opus review plus an independent Fable `/security-review` (diff and brief only). Both found the same gate-bypass BLOCKER on their own; fixed with fail-before/pass-after regression tests (19 old-code failures shown).
- The old-vs-new full-run comparison did its job: it caught two `verify.sh` defects before the gate was trusted. Both fixed with a regression test and re-reviewed.
- Stop-and-ask used for the tenant scan; the ratchet only shrinks, with R29 owner and deadline. Money invariants refuse an empty ledger and passed on 25 posted journals / 73 lines.
- Docs pages listed (developer: verify.md, AGENTS.md; user guide: none, with reason).

## After merge
1. Merge to `phase/4`, push, note it in claims.md. Run `scripts/install-hooks.sh` in your checkout; the old Mac installs it in its own checkout after pulling.
2. Follow-up for WORKFLOW (with the DOCS-1 repo-guide edits): `verify.sh`'s `verify: OK` line and its marker replace reading "BUILD SUCCESSFUL" (hidden by `-q`); "0 failed" stays.
3. App Lane 0 next, with the same old-`jvmTest`-vs-`verify.sh` comparison.
