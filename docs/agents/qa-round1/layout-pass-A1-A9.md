# Layout pass — A1–A9 main screens (14:28–14:30)
Bands checked: phone (iPhone 18 Pro portrait 402, during the flows), mobile (iPad mini portrait 744, during the flows), tablet (iPad Pro 13 **portrait 1032**, per the lead's band change), desktop (iPad Pro 13 landscape 1376). Not done: iPad Pro 11 landscape, Split View half, Larger Text.

| Screen | Phone 402 | iPad mini 744 | iPad Pro 13 portrait 1032 | iPad Pro 13 landscape 1376 |
|---|---|---|---|---|
| Journals list | cards, tags readable | cards, tags readable | table; **Type-column tags cut**: "Reverses 1 Jan" (2027 missing), "Reversal" (for "Reversal cancelled") | table, tags complete ("Reverses 1 Jan 2027", "Reversal cancelled") |
| Journal detail + Automatic reversal card | OK | OK | OK (two columns, card under lines) | OK |
| Accrual panel | full-screen sheet; footer covers lower fields until you scroll | — | — | — |
| Recurring journals list | cards | — | table Name / Repeats / Next date / Amount / Status | same table |
| Recurring journal editor/detail | OK; Insert menu overlaps the sticky footer | — | — | — |
| Period close | — | **title/subtitle one letter per line; Status column empty** (A1 finding 3) | not checked | not checked |

## Findings
1. Journals list, iPad Pro 13 portrait (1032) — the small tags under "Journal" in the Type column are clipped: JV-2026-000005 shows "Reverses 1 Jan" and JV-2026-000003 shows "Reversal" (it is "Reversal cancelled"), which reads as if the journal were a reversal. Landscape shows them in full. Severity: layout. Screenshot: LP-A-journals-portrait-ipadpro13.png. Time: 14:29
2. Recurring journals list (tablet and desktop) — the table has no "Creates" and no "Last" columns (script A5 step 13 expects both); on the phone card they exist. Severity: layout. Time: 14:30
3. Phone — the Insert menu in the recurring editor opens over the sticky footer (items under "Total debit…" text), and in the accrual sheet the footer hides Balance account until you scroll. Severity: layout. Time: 13:33
