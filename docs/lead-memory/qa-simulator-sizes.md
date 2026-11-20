---
name: qa-simulator-sizes
description: UI size checks use 6 positions on 4 simulators (iPhone SE, iPhone 18 Pro, iPad mini, iPad Pro 13); app breakpoints 600/720/1024/1280; shut down unused simulators
metadata:
  type: project
---

Agreed with Jabran 2026-11-19. App layout switches at 600 (sheets/filters fold), 720 (cards vs tables), 1024 (☰ vs icon rail), 1280 (full sidebar).
Size checks (Jabran 2026-11-19): 1 iPhone SE portrait 375x667 (small), 2 iPhone SE landscape 667x375 (narrow+short, 600–720 band; replaces Split View),
3 iPhone 18 Pro landscape 874x402 (medium layout but short), 4 iPad mini portrait 744 (medium), 5 iPad Pro 13 portrait 1032 (tablet edge), 6 iPad Pro 13 landscape 1376 (desktop). Simulator 'QA iPhone SE' udid 53779766-6366-4742-A313-E07E49D9F380. Smallest phone 320 and desktop windows: automated size tests + Codex.
Flow tests still need one simulator per person; shut down simulators not in use (`xcrun simctl shutdown <udid>`).
Related: [[tester-agent-full-flows]].
