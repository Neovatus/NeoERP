---
name: review-channel
description: "Implementer talks to the cloud reviewer via NeoERP/.review-channel/ files, not via Jabran"
metadata:
  node_type: memory
  type: feedback
  originSessionId: e8485ecf-4bea-475b-a00d-acfb82dd4543
  modified: 2026-10-03T20:36:39.612Z
---

Communicate with the reviewer session through `/Users/jabransiddiqui/Offices/Neovatus/NeoERP/.review-channel/` (read its README.md). Append questions and `review X..Y` requests to `to-reviewer.md` (numbered entries, append only); read `to-implementer.md` at every checkpoint and before asking Jabran anything. Act directly on reviewer answers/reviews; only entries marked NEEDS JABRAN need Jabran's answer in chat.

After writing an entry, print one line for Jabran to paste: `REVIEWER: check entry <n> (<question | review X..Y>)`. Also send Jabran a PushNotification with that REVIEWER line every time (he asked 2026-10-03). Keep watching to-implementer.md (Monitor on the file) and act on replies as soon as they appear.

**Why:** Jabran set this up 2026-10-03 so he doesn't relay messages by hand.
**How to apply:** Related: [[orchestrator-mode]]. Still report briefly to Jabran in chat.
