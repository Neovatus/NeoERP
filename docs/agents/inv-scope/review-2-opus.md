# INV-SCOPE review 2 (fixes only)

Reviewer: Opus 5.5 (fresh, read-only)
Reviewed: 4339101ea13975c62bc1aa0455511c2f200964b7
Range: 60f001e..4339101ea13975c62bc1aa0455511c2f200964b7
Verdict: **FIX**

I checked each of the 17 review-1 findings against the draft at HEAD (`draft:N` below) and against its sources.
The base is fine: `854ad08` is an ancestor of HEAD. Since then origin/master has moved one docs commit
(`b6ccb08`), which does not touch this lane.

## Findings

1. **MAJOR (money) — decision 8 says what happens on a failure, not on a refusal or a cancel**
   (`draft:832-851`, `:421-422`, `:427-429`). With stock first, the receipt or issue posts before the bill or invoice
   does. Three cases are not covered:
   - A person rejects the draft, or discards it, after the stock call. The receipt then stays as phantom stock, or
     the issue stays as COGS with no sale.
   - A PK invoice is refused after approval (`accounts.sales_invoice.rejected`, `ADR-018:77`).

   The ADR-018 amendment also does not say that Accounts now calls inventory-service synchronously during
   approval. That is a new service dependency, and the approval needs a clear answer for when Inventory is down.
   **Fix:** add a rule. A document that is refused, cancelled or rejected after its stock move reverses the move by
   the same key, through the A1 C-2 reverse endpoint (`accounts-a1.md:65`). Add to the invariant check (`draft:762`):
   "no stock move without a live source document". In the §9.1 ADR row (`draft:760`), state which service runs the
   flow and what happens when Inventory is down (the approval is refused and can be retried).

2. **MAJOR (money) — the inter-company receivable account in S3c-1 does not match Accounts F**
   (`draft:444`, `:373`).
   - The draft posts "INTERCOMPANY receivable via `linkedCompanyId`". Accounts F instead posts a linked
     company's invoice to `AR_CONTROL`, with the customer carrying `linkedCompanyId`, and the bill to `AP_CONTROL`
     (`BE/docs/api/accounts-f-design.md:162-163`). INTERCOMPANY is a separate protected control kind
     (`accounts-a1.md:73`).
   - `linkedCompanyId` does not exist yet: PR-9 is "not in B/C drafts yet", and XF-2 leaves it to F's contract
     (`accounts-f-design.md:47`, `:354`).

   **Fix:** use AR and AP with `linkedCompanyId`, as F does, or name the INTERCOMPANY choice as an open point for
   the Accounts lead. Add PR-9 to §9.1, and to INV-4b's dependencies in §5 (`draft:595`) and §9.2 (`draft:775`).

3. **MAJOR (statutory, Nordic) — S3c-1 assumes VAT on every inter-company transfer** (`draft:444` "with VAT",
   `:373` "Two sales: VAT …"). Companies in a Norwegian VAT group (fellesregistrering, mval § 2-2 (3)) count as one
   VAT subject. Sales between them are not VAT-able supplies (Skatteetaten, URL in the GK table). SE, DK and FI have
   VAT groups too (GK). A Nordic regnskap system has to get this right for exactly the large groups this feature is
   for. **Fix:**
   - The VAT on a linked transfer follows the pair of companies: none inside a VAT group; the normal rules otherwise,
     including cross-border.
   - The transfer price still posts in both sets of books.
   - Add a VAT-group fact to the §3.9 S3c-1 row and the §6 rows. Mark SE, DK and FI as GK for ERP-Q1.

4. **MINOR — one GK label left over.** `draft:178` still says "rule itself GK" for the Third Schedule
   retail-price tax. The draft now cites STGO 08 of 2026 (`draft:185`, `:391`). **Fix:** cite it here too.

5. **MINOR — the review is cited as a source.** `draft:302` ("review 1 spot-check 7"), `:383` ("review 1
   finding 9"), `:478`, `:529` and `:610` ("review 1 spot-check 10") cite the review. A review is not a source.
   **Fix:** cite the primary URLs that are already in the review's GK table. For `:383`, cite the FBR DI technical
   document's "HS Code with UOM" reference method (the v1.12 PDF URL already at `draft:226`).

6. **MINOR — wrong count rule in §3.9.** `draft:353` says "every catalogue feature is in exactly one row". But I17
   and S1/C10 have several country rows, and R10 (books versus tax stock) sits in the "All other … none" row
   (`draft:395`) even though it is a tax report. **Fix:** "every feature is in at least one row; country rows split
   a feature". Take R10 out of the last row; it is answered in the NO and SE rows.

7. **MINOR — the new features need module and scope rules** (`draft:646-648`).
   - `GROUP_CATALOGUE` and `INTERCOMPANY_TRANSFERS` are company-scope features, but each spans two or more
     companies. **Fix:** say whose switch counts: the parent's for the group catalogue, and both companies' for a
     transfer.
   - Decision 1 lets companies on Finance only use items (`draft:797-799`). **Fix:** say which module owns these
     rows. If it is INVENTORY, a group on Finance only cannot share a catalogue; state that.

8. **MINOR — style.** Several lines in round 2 run far past the wrap width of the rest of the file: `draft:404`,
   `:480`, `:485`, `:534`, `:824`, `:858`, `:875`, `:894`, `:899`. `:785` breaks mid-sentence. **Fix:** reflow them.
   The content does not change.

## GK spot-check (round 2)

| # | Claim in the draft | Result | Source |
|---|---|---|---|
| 1 | NO VAT 25 % standard, 15 % food, 12 % lower rate (`draft:606`) | Confirmed (third-party guides citing the yearly VAT resolution; Skatteetaten page not opened) | https://www.avalara.com/vatlive/en/country-guides/europe/norway/norwegian-vat-rates.html |
| 2 | PK Tier-1 retailers must link their POS to FBR (`draft:346`, `:610`) | Confirmed: Sales Tax Act s.3(9A). Chapter XIV-AA of the rules was omitted and merged into a new Chapter XIV by SRO 69(I)/2025 | https://assets.kpmg.com/content/dam/kpmg/pk/pdf/2025/02/A-Brief-on-Integration-Rules.pdf |
| 3 | Inter-company sales carry VAT (`draft:373`, `:444`) | **Incomplete**: no VAT between companies in a Norwegian VAT group (mval § 2-2 (3)); see finding 3 | https://www.skatteetaten.no/en/rettskilder/type/uttalelser/bfu/fellesregistrering---omsetning-fra-utenlandsk-hovedkontor-til-norsk-filial-og-omsetning-mellom-filial-og-fellesregistrerte-selskaper/ |
| 4 | PK textile HS chapters 52, 54, 55, 60-63 (`draft:102`) | Confirmed: 52 cotton, 54 man-made filaments, 55 man-made staple fibres, 60 knitted fabrics, 61-62 apparel, 63 other made-up textiles | https://tdap.gov.pk/wp-content/uploads/2022/01/201210916104244605CustomsTariff.pdf |

## Checked correct (review-1 findings)

| Review-1 finding | Result |
|---|---|
| 1 Feature defaults | Fixed. `EntitlementCatalog.kt:173-178` (`default = true`), `:177` for `INVENTORY_VALUATION`; the V41 column list `:19-26` is right (`draft:19-26`, `:642-649`, `:824`) |
| 2 Provision accounts | Fixed. 1490 in base, PK, DK, FI and IS; 1498 in NO; none in SE; no role (`draft:489-494`, decision 16) |
| 3 NO tax write-downs | Fixed. § 14-5 (2) b and c with the Lovdata URL; R10 added (`draft:479-482`, `:530`, `:606`, `:365`, `:378`) |
| 4 SE 97 % rule | Fixed. IL 17 kap. 4 §, booked in the accounts (`draft:483-485`, `:605`, `:366`, `:379`, decision 16) |
| 5 Decision 8 | Mostly fixed. Named as an ADR-018 change; receipt first, so GRNI is never debit, matching C-27 (`accounts-c.md:218`); §9.1 rows `:760-762`. Gap: finding 1 |
| 6 Group catalogue | Fixed. Scope ADR in INV-0, INV-1c behind `GROUP_CATALOGUE`, off by default, before INV-2 (`draft:128-132`, `:233`, `:754`, `:771`, decision 3). Fits the product direction |
| 7 Inter-company split | Fixed in structure: S3c-1 in INV-4b, S3c-2 in Phase 7, roadmap decision 15 cited (`draft:261-262`, `:444-445`, decision 13). Gaps: findings 2 and 3 |
| 8 Phone scanning | Fixed. Camera scanning for counts in INV-6, cost noted, decision 21 (`draft:449-455`, `:290`, `:777`) |
| 9 Addition 5 | Fixed. §3.9 is per country with a Payments column; rows for C8, S13, S12, S8, I5, own use and the retail price added. Gaps: findings 3 and 6 |
| 10 Finance only | Fixed. Non-stock and service items with FINANCE, stock items need INVENTORY; the RULES §3 and ADR-018 notes are there (decision 1, `draft:761`). Gap: finding 7 |
| 11 Variants late | Fixed: INV-1b straight after INV-1 (`draft:784`, decision 20) |
| 12 Valuation rules | Fixed. FIFO is the default in every Nordic country; the DK and FI rules are stated with sources (`draft:529-539`, `:607-608`, decision 5, C5) |
| 13 PK fields | Fixed. SRO schedule and item serial, fixed notified value or retail price per unit and variant (`draft:184-185`, `:226`, `:360`, `:391`, decision 19) |
| 14 Citations | Fixed: 30 unit codes; `App/docs/module-sequence.md:36-43`; `ADR-021:103`; the ADR-018 key pattern; ADR-024 acceptance at roadmap:96. The new `module-sequence.md:61` citation (audit events) is right |
| 15 Opening tie-out | Fixed: per account, per location only where tagged (`draft:731-734`, decision 10, `:387`) |
| 16 Labels and gaps | Fixed. Decision 14 is now critical for pharma and food customers; I26 to I28 and L9 added |
| 17 Final home | Fixed (`draft:6-7`) |

**Product direction.** The round-2 fixes create no new conflict with "large multi-company from day one", except
for findings 2 and 3:
- the group catalogue and linked transfers now have slots, both off by default;
- companies on Finance only get items, as the Nordic regnskap benchmark expects;
- payments and tax are answered per country.

**Slice order** stays consistent with the Accounts roadmap once PR-9 is added (finding 2).
