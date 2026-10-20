# Inbox: accounts-lead-design

Append-only. Only the lead writes briefs here (protocol §3). The main marks items done in `accounts-lead-design.done.md`.
Handover: docs/handover/main-agent-handover.md

---

## 2026-10-10 09:48 · ACC-19 · From: Code · Accounts lead (trial) · REQUEST · → Accounts · Design — Opus 5.5 — Checkpoint id VER-NDFI-1 (pack verification NO, DK, FI, IS)
Needs answer by: before CP-P26.2 is accepted · Blocking: no
Repeat the checkpoint id back when you start. You are new: read docs/handover/main-agent-handover.md first.
1. **Task:** verify the Accounts packs for **NO, DK, FI, IS** against official sources only (law, regulation, the tax authority's guidance or forms; no blogs as a source). Jabran's rule R-9: no external auditor; a CHECKED row means verified by us with a source link, version/date and a short note.
2. **Scope per country:** every row of `NeoERP-BackEnd/docs/api/accounts-packs-2026-2.md` for that country (chart, "Used for" roles incl. §6 payroll roles, tax codes and rates, invoice content, retention rows §4.1a) and the NO chart in `docs/drafts/accounts/coa/no-ns4102.csv`. FI also: review item TAX-11 (FI channel label, missing FI bases, FI reduced rates incl. food 13.5 %?) in docs/reviews/design-review-2026-10-09.md.
3. **Output:** one file per country, `docs/drafts/accounts/verification/{NO,DK,FI,IS}-accounts-verification.md`, in the same shape as `SE-accounts-verification.md` / `PK-accounts-verification.md` (how checked and limits; Summary "Must change" with exact proposed text; per-row CHECKED / WRONG / UNCLEAR with source). **Do not edit the packs contract or any other file**; I fold the results in.
4. **How:** one sub-agent per country in parallel (separate files, no worktrees needed); WebSearch/WebFetch only; record fetch limits honestly. Nothing is committed.
5. **Later (not now):** brief 2 will be the rig follow-ups (TAX-8/11/15/18/19, BNK-7/8/11, X-6 demo data, A3 design-index rows). Until I send it, don't edit any rig or spec file; my own pass is running on them.
6. Report to `docs/inbox/accounts-lead.md` (ACC-D-n, ≤ 20 lines): per country counts CHECKED / WRONG / UNCLEAR, the must-change list, fetch limits.
Refs: docs/drafts/accounts/verification/SE-accounts-verification.md; docs/handover/target-countries.md

## 2026-10-10 13:27 · ACC-26 · From: Code · Accounts lead (trial) · REQUEST · → Accounts · Design — addendum to VER-NDFI-1
Needs answer by: with your VER-NDFI-1 report · Blocking: no
1. While verifying, propose an account (number + local name + source) for `HOLIDAY_PAY_EMPLOYER_CONTRIB_ACCRUED` in FI, DK, IS and `EMPLOYEE_ADVANCES` in DK, FI, IS (packs 2026.2 §6.2a / §6.2b), from the country's common chart. PK I do myself. Put them in each country's "Must change" list.

## 2026-10-10 14:35 · ACC-31 · From: Code · Accounts lead (trial) · DECISION · → Accounts · Design — models (§3a, ERP-37/39); change to VER-NDFI-1
Needs answer by: before you start VER-NDFI-1 · Blocking: no
Your session: **Haiku 5.5** (was Opus in ACC-19). VER-NDFI-1 per task: fetching and reading official sources, filling the per-row tables → **Sonnet** sub-agent per country (statutory text needs more than Haiku); every WRONG / UNCLEAR row and the must-change list → fresh read-only **Opus review** before you report (tax rules; proposed for the critical list, ACC-32). Rig and spec work in later briefs → **Haiku**.

## 2026-10-10 15:01 · ACC-40 · From: Code · Accounts lead (trial) · DECISION · → Accounts · Design — VER-NDFI-1 withdrawn (Jabran)
Needs answer by: — · Blocking: no
1. ACC-19, ACC-26 and ACC-31 are withdrawn: Jabran asked the lead to run the NO/DK/FI/IS verification itself. If you start, don't do it; wait for a new brief.

## 2026-10-20 · ERP-147 · From: Code · ERP lead (trial) · FYI · Design principles index: read first; three contradictions fixed
Needs answer by: — · Blocking: no
1. **`docs/handover/design-principles.md`** is the one index of everything settled for design (process, UX principles, layout and widths, building blocks, rig ownership), with links to the shared specs. It's now in every lead's and design main's **read-first list**. Read it before any design or screen work, together with `NeoERP-App/docs/design/ux-principles.md`.
2. Fixed today in the shared specs:
   - **Dates:** screen-standard §8 now follows building-blocks "Typing dates" (company format plus ISO), not `YYYY-MM-DD`.
   - **Sideways scroll:** never for the page or a record table (cards below the tight width); only matrix grids (permission, compare, time/month grids) may scroll inside their own card, row labels pinned (screen-standard §4, building-blocks "Tables").
   - **Required widths:** rig review at **1440 · 1280 · 1024 · 768 · 390**; screenshot tests at 1440 and 390 plus the 320–1440 sweep (screen-standard §9, playbook §2).
3. Also today (ERP-145/146): one date-picker style for single and range dates; list width rule under LC-23.
