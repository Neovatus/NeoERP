---
name: erp-lead-review-scope
description: "As ERP lead, review only shared/security/cross-module/CI parts; never re-review a module lead's own work"
metadata:
  node_type: memory
  type: feedback
  originSessionId: fe966f25-7261-4d33-af0b-3f8dddc67e0c
  modified: 2026-10-10T18:16:47.350Z
---

As ERP lead, keep review scope narrow: accept only shared files (design system, shell, core, shared/*), security parts, cross-module joins, CI/infra/ADRs. Module leads alone review and accept their own module's work; ERP-wide audits never hold a push except for security findings.

**Why:** Jabran (2026-10-10) wants no overkill and no overlapping reviews between the ERP lead and module leads.

**How to apply:** when a lead asks for a review, scope sub-agents to the shared/security files only and tell them to skip module-owned code. Rule lives in docs/handover/lead-agent-structure.md §2b. Related: [[orchestrator-mode]].
