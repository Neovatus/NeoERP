# Phase 2 click-through — findings (Jabran, 2026-10-19)

| # | Step | Seen | Expected | Owner | Status |
|---|---|---|---|---|---|
| F1 | A1 | "Org d3300000" in breadcrumb and texts on Overview and Review and go live | Company name "Kystgruppe Nordic" | App (+ backend if the name isn't sent) | open |
| F2 | A1 | "23 codes for Norway, 23 not yet checked against source" | Confirmed in data: `templates.csv` NO row and codes have check_state UNCHECKED although verified 2026-10-10. Set the verified state in the next pack data fix | Backend pack data / lead | open |
| F3 | A1 | Chart chooser offers Pakistan, Sweden, Base for a Norwegian company | D-172: only the country's own charts; Base only without a country chart; hide when one | Backend (A0) + App | decided D-172 |
| F2b | A1 | "20 of the required accounts not yet checked against source" in Used for | Same as F2: the NO chart was verified 2026-10-10; mark it, or soften wording | Backend pack data / lead | open |
| F4 | A1 | Tax code column cut off: several rows show only "NO-MVA-" / "NO-MVA-IMPORT-" | Full code visible (wrap or wider column) | App | open |
| F5 | A1 | Import codes have machine names: "No Mva Import 15", "… 15 Noded", "… 25 Noded", "… Import Exempt", "… Paid 15", and no Norwegian name | Proper names, e.g. "Import of goods without deduction, low rate" / "Kjøp av varer fra utlandet uten fradragsrett, middels sats" (SAF-T 82/84 = without deduction) | Backend pack data (NO 2026.4 or fix) | open |
| F6 | A1 after go-live | Checklist shows "Opening-balance equity at zero" with a warning icon before any opening balance exists (balance is 0) | Done/neutral while the balance is 0; warning only when it isn't 0 | App (or backend checklist state) | open |
| F7 | A2 | **BLOCKER.** "Enter opening balances" opens the journal editor with only the footer (totals 0,00, buttons disabled): no header card (date, description), no line grid, no Add line. No backend error. `JournalEditorScreen.kt:185-192` puts header + lines in a `Column(Modifier.weight(1f)…verticalScroll)`; in this host the weighted column likely gets zero height | Header card and line grid visible; lines can be added | App | fixed d27ae775 (Codex), retest O-1 |
| F8 | R-2, R-3, D-3 (automated, phone 390 px) | General ledger row JV-2026-0001 and the expanded P&L "Office supplies" row never display at phone width (bounds 0×0 after scrolling) | Rows visible and reachable on phone | App | open |
