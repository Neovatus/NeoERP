---
name: tester-agent-full-flows
description: "A dedicated tester sub-agent may run full flows (post, approve, pay, refund) as demo users on the LOCAL stack only (Jabran 2026-11-19)"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 7ea71d1e-9845-4f9c-b0bc-6094b7d85c1b
  modified: 2026-11-19T09:20:15.046Z
---

Jabran (2026-11-19) wants a proper tester sub-agent, not just a layout checker: it runs each flow end to end as the demo people, including Post, Approve, Pay and Refund, and checks the data is right afterwards (ledger, reports, balances, audit). This replaces the earlier "lead never clicks Post/Approve for demo users", but only within these limits:
- local stack (localhost) and seeded demo users only; never hosted stacks or real accounts
- sign-in only through the dev session files Jabran makes with `make-demo-tokens.sh` (NEOERP_DEV_SESSION=1); the agent never sees or types passwords and never reads token contents
- one person per simulator (iPhone, iPad, desktop) so approvals by a second person need no re-sign-in

**Why:** Jabran wants real QA coverage of flows and data correctness, not only screens.
**How to apply:** brief the tester with test steps (see [[test-steps-format]]), expected data after each step, and read-only DB checks; findings come back as a report and fixes go in batches. Related: [[collect-then-fix-per-test]].

**Fixing (Jabran 2026-11-19):** collect ALL findings of the round first, then fix once at the end (group by root cause, one review, one build, one retest). Fix immediately ONLY blockers that stop other test flows (Jabran 2026-11-19: money/security findings also wait for the end, flagged at the top of the list).
