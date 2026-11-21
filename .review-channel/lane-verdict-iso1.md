# Lane verdict: ISO-1 (ADR-026 row-level security draft) — 2026-11-21
**Reviewed:** workspace `phase/4-b2-iso1` (own changes: two reviews and `docs/drafts/ADR-026-row-level-security.md`). **Verdict: MERGE** (as a draft; Jabran decides D1–D11).
- Merges into master without conflict; no AI attribution.
- Review 1 FIX (BLOCKER: system-job flag leaked every company's queue/outbox rows on a reused pooled connection) and review 2 FIX (MAJOR: Super Admin platform-read audit rows with no company would be refused) were both fixed; the last fix was made by the lead after round 2 under the two-round rule. As overseer I accept that for a draft.
- **Before any build from this ADR:** the implementation lane is money/security scope, so it gets the re-runs and the second, different reviewer (Fable or Codex `/security-review`), and the reviewer re-checks the pooled-connection and platform-audit cases specifically.
- Minor: the draft still names the old branch `phase/4-lane0-be`; fix when it moves to `NeoERP-BackEnd/docs/adr/`.
