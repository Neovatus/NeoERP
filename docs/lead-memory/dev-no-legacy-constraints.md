---
name: dev-no-legacy-constraints
description: "NeoERP is in development with no live customers; old modules (HR, Payroll, ESS, inbox) will be replaced, so decisions should pick the right new design, not work around old code (Jabran 2026-11-15)"
metadata:
  type: project
---

Jabran (2026-11-15): "we're in dev, we can directly change to new rules"; the old Payroll (and HR, ESS, inbox — see [[app-languages]]) is being replaced.

**Why:** plans kept proposing interim gates or compromises because an old module or service lacked something (e.g. payroll limits, user-service holder lookup, two user ids).

**How to apply:** when a decision is shaped by an old module or a missing capability, propose the target design first (build the missing piece) and name the compromise only as an alternative. Still respected: applied Flyway migrations stay frozen (add new ones), security/auth changes need Jabran's approval, Opus review for money/security. Related: [[product-direction-large]], [[check-approved-decisions]].
