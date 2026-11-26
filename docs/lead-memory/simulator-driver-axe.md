---
name: simulator-driver-axe
description: Before a tester needs to tap the simulator, check a driver exists; Jabran approved installing AXe and a 30-min spike at the next simulator session (2026-11-25)
metadata:
  type: project
---
On 2026-11-25 the dimension-rules flow-1 simulator session was blocked: the session had no iOS Simulator control tool and no CLI driver (no AXe/idb, no Accessibility permission). Jabran approved: install AXe (`brew install cameroncooke/axe/axe`) at the next simulator session and spike it on our Compose iOS screens (tap by accessibility label).
**Why:** a tester without a driver wastes the whole stack setup (~30 min).
**How to apply:** before spawning a simulator tester, check `which axe` (or the simulator tool via ToolSearch); name the exact tool in the tester brief.
