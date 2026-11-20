---
name: check-test-result-before-push
description: "Before any push read 'BUILD SUCCESSFUL' and '0 failed' yourself (and the verify marker once Lane 0 lands)"
metadata:
  type: feedback
---

Before any push read "BUILD SUCCESSFUL" and "0 failed" yourself (and the verify marker once Lane 0 lands); never chain a push after a background test or trust an echoed exit (2026-11-19 red push).

**Lives in:** WORKFLOW.md:60-61, :319.
