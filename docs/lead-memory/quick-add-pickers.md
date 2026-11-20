---
name: quick-add-pickers
description: "Jabran 2026-11-08 — app-wide quick add from pickers (QA-1), built before I18N-1; setup data is link-only"
metadata:
  node_type: memory
  type: project
  originSessionId: fe966f25-7261-4d33-af0b-3f8dddc67e0c
  modified: 2026-11-08T12:57:57.780Z
---

Jabran approved 2026-11-08: every picker in a form, for everyday records, gets "Add “x”". It opens a short side panel over the form: required fields only, typed text prefilled, form kept, new record picked on save, "Open full record" link. It never appears in filters or where the record must already exist.

Setup data is not quick-added; its picker shows a "Not found. Add it in …" link instead. This covers chart accounts, tax codes, currencies, fiscal years, number series and bank accounts.

Quick add uses the same server create, rights and approvals as the full page, and never takes bank details. One shared component plugs into NeoSearchSelect(onAdd). Brief: docs/agents/quick-add/brief.md.

**Why:** the person stays focused on the form they're filling in, instead of closing it and coming back.

**How to apply:** every builder brief that adds a picker in a new module (HR, Inventory, Sales, Purchasing) must use quick add or state why not. QA-1 runs before I18N-1 ([[app-languages]]).
