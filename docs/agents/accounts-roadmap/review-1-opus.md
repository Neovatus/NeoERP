Reviewer: Opus 5.5 (fresh, read-only)
Reviewed: 1bd98e6
Verdict: FIX
Findings:
1. MAJOR draft:189,195,199 vs :102,223: critical path goes AL P2 → Phase 4 PR (4.19) and calls 4.11–4.17 critical "only if the first customer is large", but 4.19 depends on 4.1–4.18 and decision 1 keeps them before the PR; Phase 5 starts from the PR. Fix: draw 4.11–4.18 before the PR in §5 and the Mermaid graph (or narrow 4.19 and add a Phase 4b lane); reword decision 2.
2. MAJOR draft:113 (5.6): BE docs/api/accounts-roadmap.md:125 says D + D2 needs B, C, A5 (payroll payables clearing); the draft lists B, C, AL only and moves A5 to Later. Fix: name the A5 dependency in 5.6 and decision 5; recommend D v1 without payroll-payable clearing (comes with A5).
3. MINOR draft:148,231: Payroll v2 "not active" cites state:46, which is an open question. Fix: "unconfirmed (state:46)" + question in §7.
4. MINOR draft:110 (5.3): backlog:287 / gate L-2 only say receiving by 2030-01-01; the send-and-receive rule is roadmap:22-23,154. Fix the citation.
5. MINOR draft:87 (DOCS-1): cite 16112eb (merge), not 906fa94. (Lead: the state row was closed in e2a71d5 after 659ea4a.)
6. MINOR draft:93 (A4 leftovers): settled — UI not built (RecurringAccess.kt:24,66-70,76 and ScheduledReversalsApi.kt exist; no composable uses the tab or notice). Fix: "Not started (UI); access rules and data layer present". Unclear count 0.
7. MINOR draft:86 (4.3): R29 is 60 entries (fix-list.md:43, 5d33c65).
8. MINOR completeness: go-live rows not placed: P-23, P-24, ACC-R10, ACC-R12, ACC-R15, ACC-R17, P-1, P-14; tagged backlog:362 missing; untagged money/tax items backlog:265 (AR invoices cannot be reversed), :327 (NO domestic bill defaults to import VAT code), :245 (M5-B1 follow-up). Fix: place them or list as not placed.
9. MINOR draft:90-92: AL S6 acceptance (roadmap:121) missing.
10. MINOR draft:35,215: 28 accounts-*.md API docs (29th is accounts.md); draft:61 "0 hits for depreciation" → "no fixed-asset code" (3 hits in V5, V13, V14).
11. MINOR draft:226-228 (decision 3): ADR-024/025 already approved 2026-11-16 "accept after the lead's one-page summary" (backlog:385); say approved, waiting on the summary and the 3 ADR-025 additions. §5 puts SE e-invoice (5.2) on the critical path but the SE launch gate (roadmap:154) asks only for document output: mark 5.2 optional for SE or say why required.
Checked fine: 24 state rows (no wrong "done"), all 19 app specs and 28 API docs present, ADR 021–026 dependencies, decisions 5/8/13 say what they change, decision 1 matches backlog:389, AL S5 after QA-B2 matches state:44.
