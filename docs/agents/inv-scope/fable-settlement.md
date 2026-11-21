# Items and Inventory scope: decision settlement

Reviewer: Fable 5.2 (high), decision settlement
Reviewed: 86707d089c4325dfd098eb25bb1e703d3c8306cf

Draft: `docs/drafts/items-inventory-scope.md` (21 decisions). The two Opus reviews were not read.

**Summary:** 3 non-critical decisions: 1 settled, 2 settled with a change, 0 sent to Jabran. 18 critical decisions:
4 agree, 13 agree with a change, 1 agree with the goal but not yet with the mechanism (decision 8). No wrong labels.
11 flags, of which 4 are decisions the draft makes in its text without a number.

Short names as in the draft: **BE** = `NeoERP-BackEnd`, **WS** = the workspace.

## Non-critical decisions (settled here)

| Decision | Verdict |
|---|---|
| 4. Variants | **SETTLED.** Variants with attributes from v1, each variant its own item id, grid editor in INV-1b before the stock ledger. It keeps ADR-021's single item field (`BE/docs/adr/ADR-021-shared-dimensions.md:62`). |
| 18. Who sees stock values | **SETTLED WITH CHANGE.** A separate value-read code, quantities only for Stock Clerk and store staff. Change: the backend leaves the values out of responses, exports, reports and count variance amounts for a person without the code. Hiding them only in the app is not enough. |
| 21. Camera scanning for counts | **SETTLED WITH CHANGE.** In INV-6, phones only. Change: the "M-size" figure is a guess, so INV-6's design step confirms the size and names the barcode decoder as a dependency choice before build. The App has no camera or barcode library today and builds for Android, iOS and desktop. |

## Critical decisions (view for Jabran)

| Decision | View |
|---|---|
| 1. Who can use items | **Agree, with a change.** Non-stock and service items with Finance alone fit "sold by module" and the regnskap benchmark. Change: approving an invoice or bill that has no stock line must not depend on the inventory service being up, and RULES §3 has no "on from any of four modules" rule today, so that rule needs its own wording in RULES and ADR-018. |
| 2. Starter category sets | **Agree.** It mirrors the chart of accounts (country rules, company copy, roles). Keep the sets as versioned data like the packs, not code. |
| 3. Group or company item master | **Agree, with a change.** Catalogue plus per-company settings from v1, group catalogue behind an ADR and off by default, matches the product direction. Change: the draft puts HS / CN codes in the shared catalogue, but a group can span Sweden and Pakistan, where the 8-digit codes differ. Country fields must be held per country, not once per catalogue. |
| 5. Valuation methods | **Agree, with a change.** FIFO default in the Nordics is right: Norway's tax rule treats the first goods bought as the first sold (skatteloven § 14-5 (2) b, checked on Lovdata). Change: store the method on the item (inherited from the company) even though v1 offers one choice per company. §2.2 already lists a method per category, Denmark allows a method per goods group, and standard cost arrives with Manufacturing; a company-only column would need re-keying. |
| 6. Valuation off | **Agree, with a change.** Periodic stock for small companies and perpetual for large ones serves both. Change: the switch may only change at the start of a period with a tie-out journal, and cost per item is still captured when it is off, because the period-end journal needs it. |
| 7. Valuation pool | **Agree with the pool, but it contradicts §8.8.** Cost per item per company is right for the company's books. With one company pool, value per location cannot tie exactly to a location-tagged GL balance: a receipt at one location changes the average for stock at every other location with no journal there. §8.8 and §3.9 promise a daily tie-out "per company and location". Jabran picks one: tie out per company and account only and show location value as a report (my recommendation), or keep cost layers per location. |
| 8. Stock before Purchase and Sales | **Agree with the goal, not yet with the mechanism.** An Accounts-only company should be able to keep stock. The proposed path makes accounts-service call inventory-service inside an approval, and inventory-service call back into accounts-service to post. That is a two-way synchronous dependency around money, held together by retries, a reversal rule and a sweeper job. Before approving the ADR-018 change, the amendment should weigh the simpler path: Inventory owns a small receipt and delivery document, the bill or invoice line points to it, and ADR-018 stays as written with INVENTORY added beside PURCHASING as a source. |
| 9. Price variance and landed costs | **Agree.** In v1 the receipt is priced from the bill itself, so the variance is zero; the decision only bites with Purchase. The real v1 gap is freight and duty not added to stock cost, so an importing customer should not go live on v1 valuation without landed costs or a documented revaluation step. |
| 10. Opening stock | **Agree.** Adopting the GL balance with a refusal until it ties avoids a doubled balance. |
| 11. Negative stock | **Agree.** Refused by default, allowed on Store locations only, with a daily list. It matches how shops work and the offline POS direction. |
| 12. Posting detail | **Agree, with a change.** Daily summaries are needed at retail volumes. Change: decision 17 puts item on COGS lines, and a summary "per dimension set" then has one line per item per location per day, which removes most of the saving. State the rule for summarised sources (see 17), and say how a late move for an already summarised day posts (a further summary, never an edit). |
| 13. Inter-company transfers | **Agree, with a change.** Linked transfers before Phase 7 and eliminations in Phase 7 is the right split, and the product direction says not to wait for Phase 7. Change: INV-4b covers pairs of companies in the same country first; cross-border pairs (customs, EU reverse charge, EC sales list) are a named later step, not "normal rules otherwise". |
| 14. Batch, serial and expiry | **Agree, with a change.** INV-9 as the first slice after v1 is acceptable for the first Swedish customers. Change: nullable ids on moves are not enough; the stored balances and cost layers in INV-2 must be able to carry a lot. Also `BATCH_SERIAL` is on by default (`EntitlementCatalog.kt:175`) and only the module has an "implemented" flag (`:30`), so the module grid would show a feature that does not exist until INV-9. |
| 15. Counts and close | **Agree, with a change.** Blind counts and no self-approval are right; Norway's year-end count rule is real. Change: automatic posting under a value limit lets a counter post their own small variances, which is how shrinkage is hidden. Default the limit to zero until the company sets one, and report auto-posted variances per counter. |
| 16. Write-downs | **Agree, with a change.** Provision account plus role in the next pack edition is right, and the Norway books-versus-tax report is needed (§ 14-5 (2) c checked: write-downs are ignored for tax). Change: the Swedish 97 % journal must be a company choice, not automatic, and the country accountant must confirm whether a K3 company may book it (I could not confirm this either way; large customers are K3 companies). |
| 17. Item on journal lines | **Agree, with a change.** Item on COGS, adjustment and variance lines only. Change: for sources posted as daily summaries, COGS carries no item (or category only) and margin by item comes from the reporting layer's stock facts. ADR-021 Q18 already allows moving item out of the set if the count grows (`ADR-021:239`). |
| 19. Country item fields in v1 | **Agree, with a change.** Fields now, reports later. Changes: hold them per country (see 3); add a Pakistan federal excise fact per item, since Accounts B already prints and posts FED (`BE/docs/api/accounts-b.md:1008`, `:1500`). |
| 20. Build order | **Agree, with a change.** It depends on decision 8. Change the wording "Purchase and Sales replace the document-driven moves": decisions 1 and 8 keep that path for companies without Purchase or Sales, so it is a permanent second path to maintain, and Jabran should approve it knowing that. |

## Flags

| # | Flag | Kind |
|---|---|---|
| 1 | Labels: none wrong. Decisions 4, 18 and 21 are fairly non-critical. | Labels |
| 2 | Decision 7 (company cost pool) against §8.8 and the §3.9 S1 row (tie-out per location). | Contradiction inside the draft |
| 3 | Decision 12 (daily summaries) against decision 17 (item on COGS lines). | Contradiction inside the draft |
| 4 | Decision 5 (one method per company) against §2.2 (method as a category default). | Contradiction inside the draft |
| 5 | Decision 8 changes ADR-018, which is accepted. The draft says so openly; it needs Jabran's explicit yes, not a settlement. | Approved decision |
| 6 | Decision 13 says linked transfers "can wait for Phase 7 without harm" if roadmap decision 15 stays. That hedge is against the product direction (large multi-company from day one, `WS/docs/large-customer-roadmap.md:7`). | Product direction |
| 7 | X5 excise is "Not planned". NeoERP is also a taxation system and Pakistan FED is already in Accounts B. It should be "Later", with the item fact in v1. | Product direction |
| 8 | Pakistan's monthly sales tax return now needs stock statements: Annex-J for manufacturers and Annex-H1 for commercial importers, distributors and wholesalers, by HS code with opening and closing stock (SRO 55(I)/2025, from the January 2025 return; EY tax alert 2025-0358). The draft lists only "records kept" for Pakistan. This is a v1-or-later statutory report that is missing. | Product direction |
| 9 | Decided in the text, not numbered: manual journals on INVENTORY accounts refused after the first move (§8.8). This is a posting rule, so critical. | Missing decision |
| 10 | Decided in the text, not numbered: "tax class" on items and categories. No Accounts A0, B or E document defines a tax class today; how it maps to tax codes per country, and who maintains the mapping, is a statutory decision. | Missing decision |
| 11 | Not decided anywhere: whether a move may be dated before later moves of the same item, and whether later issues are then re-costed (money). Also unnumbered: Org must ask Inventory before deactivating a location (§7), and the volume figures "to confirm". | Missing decision |

Checked and consistent with approved decisions: the pricing boundary (`WS/PROJECT-STATE.md:28`), the full catalogue and
the five-question lens of the common brief, large-customer features off by default (`large-customer-roadmap.md:11`),
ADR-018 ownership apart from decision 8, and the pack accounts and roles the draft cites.

## Is the feature catalogue complete enough?

For the Inventory area it is broad and close to complete: item master, locations, moves, planning, costing, reports and
compliance are all covered with a phase each, and the cross-module map gives Purchase, Sales, Manufacturing, POS and
Accounts their share. It is not on its own "all features across all modules"; that needs the Purchase, Sales and
Reports drafts and ROADMAP-P. What is missing and should get a row: the Pakistan Annex-J and Annex-H1 stock statements;
Pakistan federal excise per item (and excise as "Later", not "Not planned"); the rule for back-dated moves and
re-costing; printed stock documents (transfer note, goods received note, count sheet); internal store requisitions with
approval, and gate passes, both common Pakistani practice; stock held at an outside processor (textile dyeing and
finishing), which the draft's own textile starter set implies; packaging producer-responsibility data per item for the
Nordics; planning fields beyond reorder point (lead time, safety stock, minimum order quantity, order multiples);
available-to-promise and back orders (with Sales); count import from a file; and report rows for lists that §3.9 names
but §3.6 does not number (GRNI ageing, transfers in transit, negative stock, expiry, items missing statutory data).
