Reviewer: Opus 5.5 (fresh, read-only)
Reviewed: 86b9c67
Verdict: FIX
Findings:
1. MAJOR, WORKFLOW.md:170-171. "The gate per wave is mechanical: the named tests are green, the full suites and `:architecture-tests` are green" contradicts :190-193 and :201-202 (targeted tests between checkpoints; lead does one full run per merge batch). Fix: "the named and impact-based tests (Test scope below) are green".
2. MAJOR, WORKFLOW.md:180. "Money, security, numbering, locking or concurrency, migrations and isolation checkpoints also get the second, different reviewer" widens the guardrail (brief and :323 say money and security) and disagrees with :114 ("Money, security and statutory lanes"). Fix: one list in Working mode; :180 and :323 point to it; ask Jabran before adding a category.
3. MINOR, WORKFLOW.md:150-151, :135. "Design and architecture: the lead, on the reviewer's findings" / "change note to the lead, who decides" hands a decision owner to the lead; not a brief answer. Fix: open question for Jabran.
4. MINOR, WORKFLOW.md:112. "The lead session (Claude Code on Jabran's Mac) … pushes" contradicts :326 Two Macs, two leads (probation). Fix: "Lead sessions (one per Mac; see Two Macs, two leads)".
5. MINOR, WORKFLOW.md:281 (removed). "A fresh session is only needed when compaction has happened several times and quality drops." is still current. Fix: restore.
6. MAJOR, proposals.md:42. money-security-guardrails "delete" drops L18 (fail on unexpected skips) and the owners (accountant sign-off and pen test: Jabran; production invariant checks: lead). Fix: move both into WORKFLOW guardrails first.
7. MAJOR, proposals.md:37. gradle-one-at-a-time "delete" drops "lanes one at a time, no helper agents" and `./gradlew --stop` after Android/iOS compiles. Fix: move into WORKFLOW Test scope first.
8. MINOR, proposals.md:33. subagent-models "delete" drops review steps (`git fetch` first, list new migrations against origin, `--rerun`) and the new-model-release check. Fix: review steps to WORKFLOW Review; release check stays a lead habit.
9. MINOR, proposals.md:17. NeoERP-App/.codex/CODEX.md:104 is wrong; the stage list starts at :96. Fix: correct.
10. MINOR, proposals.md:26-71. Memory table misses two-macs-probation.md. Fix: add a row.
Notes: guardrail 3+5 merge kept every element; push, compaction, models and reviewer-channel text agree across the four files; no Fable 5.1 left.
