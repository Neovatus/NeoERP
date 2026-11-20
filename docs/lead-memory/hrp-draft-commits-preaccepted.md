---
name: hrp-draft-commits-preaccepted
description: HRP commits ending "(Draft)" that touch only HR/Payroll/ESS docs, specs, rig or contracts are pre-accepted for push
metadata:
  type: project
---

HR & Payroll lead standing answer (HRP-59, 2026-10-16): any HRP commit whose subject ends "(Draft)" and touches only HR/Payroll/ESS docs, specs, rig blocks or contracts may go with an Accounts push without asking per commit.

**Why:** their commits often sit mid-branch under Accounts work on dev / dev-app; asking each time stalled pushes.

**How to apply:** when scope-checking a push range, verify subject + files; if it matches, include it. Anything else from HRP (code, non-Draft) still needs their OK. See [[review-channel]].
