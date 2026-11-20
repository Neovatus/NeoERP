---
name: money-security-guardrails
description: "Money/security/statutory guardrails are mandatory, not trials: auto test per finding, invariant checks block push, second different reviewer, accountant sign-off + pen test at go-live"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 7ea71d1e-9845-4f9c-b0bc-6094b7d85c1b
  modified: 2026-11-20T15:12:42.137Z
---

Jabran (2026-11-20): "Safeguard & guard rails should be" — adopted as conventions at once (WORKFLOW.md "Guardrails…", workspace docs/lessons.md L11–L14, BackEnd go-live gates ERP-Q1–Q3).

**Why:** NeoERP handles finance and payments at large scale; G01/G02 were found only by hand, and AI review alone is not enough for statutory output.
**How to apply:** every money or security finding closes only with an automated test; money invariant checks (balanced journals, ledger = postings, subledger = control, no double post/pay on retry, currency rounding) run after seed and full runs and block the push; money/security lanes get a second reviewer of a different kind (Opus + Codex or /security-review); human accountant sign-off and outside pen test stay go-live gates. Batches may tune how these run, never drop them. Related: [[lessons-register]], [[check-test-result-before-push]].

Added 2026-11-20 after the Fable process review (docs/reviews/process-review-fable-2026-11-20.md): money/security reviewers re-run targeted tests from clean; nothing merged uncompiled; test runs fail on unexpected skips (61 Docker-skip files); tenant arch test on every service, RLS by ADR before first customer (gate ERP-Q4); owners: accountant sign-off + pen test = Jabran, production invariant checks = lead.
