---
name: dev-speed-review
description: "After the new Mac finishes the speed lanes + B1: review dev speed (tests slower than development, services/tests not releasing memory and disk, GitHub to speed up, two Macs in parallel) (Jabran 2026-11-22)"
metadata:
  type: project
---

Jabran 2026-11-22: testing takes more time than development; the app/services take space (memory, disk) and do not release it when closed or after tests. Let the new Mac finish its current work first (TEST-SPEED-1, TEST-SPEED-APP, FIX-APP-B1), then review and improve: faster tests, clean-up that actually frees resources, GitHub to speed up development, both Macs working in parallel.

**Why:** test gates (BE 54 min, App 36 min before the speed lanes) block both leads; leftover processes slow the Macs.
**How to apply:** when the speed lanes have merged, propose a short plan with measured numbers. GitHub Actions stay off until Jabran approves a concrete proposal ([[no-github-ci-dev]]); a self-hosted runner on one Mac is an option to weigh. Clean-up rules today: L32 ([[gradle-one-at-a-time]]). Related: [[two-macs-probation]].
