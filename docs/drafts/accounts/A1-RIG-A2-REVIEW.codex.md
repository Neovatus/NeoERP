## 1. MAJOR — Changing an account retains forbidden tags and the rig submits them

**Evidence:** `NeoERP-App/docs/design/screen-rig/accounts-a1.jsx:914` changes only `acc` when an account is picked. The selectors at lines 896–912 hide disallowed tags without clearing them; `toRecord` (lines 835–842) still includes `loc` and `cc`. `ajProblems` / `ajModelOf` (lines 443–472) do not validate those tags. Approved spec AC-A1 §4.2.2 and §7.5, and contract A1 C-13 / §5.2 step 6, require allowed dimensions and a stock location belonging to the line's branch.

**Concrete failure (browser reproduced):** Open `app.html#accounts:kyst|journals|draft-49|edit` as Finance Manager. Change line 1 to 6300, choose cost centre Administrasjon, then change its account to 1920. The cost-centre cell becomes disabled and displays “—”, but the saved line retains `cc: ADM`. Submit remains enabled; clicking it moves the rig from 4 waiting journals to 5. The contracted server must refuse that line with `DIMENSION_NOT_ALLOWED`. Similarly, changing a header default branch can retain a stock location from the previous branch. The rig approves requests that fail in the real flow and hides the value the person must correct.

## 2. MAJOR — Overview claims opening-balance equity is zero merely because an OB was posted

**Evidence:** `NeoERP-App/docs/design/screen-rig/accounts-a1.jsx:322` sets `st.obDone` from the existence of an unreversed posted OB. `AjOverview` at line 1583 uses that same flag to mark “Opening-balance equity at zero” done and print `0.00`. Approved spec AC-A1 §4.4 has two separate predicates, `openingBalancesPosted` and `openingBalanceEquityZero`; contract A1 C-14 / §6.15 explicitly computes the latter from the mapped account's balance. Architecture AC-0 PM decision P4 requires the warning until that balance is zero.

**Concrete failure (source trace):** In Sialkot's empty live books, an OB debiting bank 1920 by 100.00 and crediting opening-balance equity 2098 by 100.00 is a valid balanced opening journal. After `ajPost` calls `ajSync`, `st.obDone` becomes true. Overview then reports “PKR 0.00. Every opening balance found its account,” although 2098 has a 100.00 credit balance. The readiness warning disappears while the year-end prerequisite remains unmet. The same false result follows any later JV to 2098 while an unreversed OB exists. The final mock posting click was blocked by automatic approval review under the read-only restriction; this finding is established by the source path, not a claimed completed browser posting.

## 3. MAJOR — A1 leaves chart replacement available while drafts or submitted journals exist

**Evidence:** `NeoERP-App/docs/design/screen-rig/accounts-a1.jsx:1620` delegates every non-Journals tab to the unchanged A0 page. Its sync at lines 318–322 sets `st.posted` only from posted journals. The delegated chart screen, `accounts-a0.jsx:991` and lines 1067–1072, offers and performs replacement based on `st.posted` and missing tax links; it never checks the A1 journal store. Contract A1 §15 B-1 requires 409 `HAS_JOURNALS` while any draft or submitted journal exists, and approved spec AC-A1 §9 supplies its refusal wording.

**Concrete failure (source trace):** Save a draft in Sialkot before its first posting, then open Chart of accounts and choose a different compatible chart. `st.posted` is still false, so the inherited handler replaces the chart and Used for links and shows “Chart replaced.” The draft remains in `AJ_STORE`, pointing to account codes from the previous chart; custom accounts can disappear and matching codes can acquire another meaning. The server would refuse replacement until the drafts/waiting journals were deleted. The A1 integration does not demonstrate that required guard or refusal.

## 4. MAJOR — The required report amount type cannot represent valid server aggregates

**Evidence:** `NeoERP-App/docs/design/specs/accounts-a2-a3.md:556` (§6) mandates A1's `AccountsAmount` for every report figure. Approved AC-A1 §6 stores minor units in an overflow-checked `Long`; contract A1 C-5 allows each journal side up to 999,999,999,999,999.99, while C-11 and draft A2 C-8 / §3.1 allow report aggregates in `NUMERIC(24,4)`. Architecture AC-0 §11 requires exact decimal report figures, without floating point.

**Concrete failure (arithmetic):** Post 100 individually valid journals, each debiting the same bank account and crediting the same equity account by 999,999,999,999,999.99. A2 can return a debit movement/closing balance of `99999999999999999.00`, which fits the server aggregate. Its minor-unit integer is 9,999,999,999,999,999,900, exceeding `Long.MAX_VALUE` (9,223,372,036,854,775,807). The mandated app type must reject/overflow on a valid trial balance or ledger response. Showing server totals without re-summing them does not avoid the parse overflow. The draft has no wider report representation or aggregate bound to reconcile this mismatch.

## 5. MINOR — The screen spec blocks reads the A2 contract explicitly permits before go-live

**Evidence:** `NeoERP-App/docs/design/specs/accounts-a2-a3.md:539` (§5) puts both reports and Period close behind “start when the books are live.” Draft contract A2 C-24 (line 91) and §6.2 (lines 234–239) allow report reads/exports and fiscal-year/period reads with books CREATED; only period actions require LIVE.

**Concrete failure:** A permitted Accounts Viewer opens Trial balance with books `READY_TO_GO_LIVE`. The API permits the zero report, but the specified screen substitutes the go-live notice and prevents seeing/exporting it. The same screen rule hides readable calendar/period status. Backend and app acceptance therefore disagree for the same state and rights; this distinction is not resolved in the draft's conflict table.

## 6. MINOR — Failed reads erase the last successful Waiting-for-you badge

**Evidence:** `NeoERP-App/docs/design/screen-rig/accounts-a1.jsx:1451`–1456 starts the badge at zero and only computes it when `st.load === 'ok'`; the catch also resets it to zero. Approved spec AC-A1 §3 says a failed read keeps the last count and shows no error.

**Concrete failure:** The initial Kyst Finance Manager view displays 3 waiting journals. Selecting “Load failed” changes `st.load` to `error`; the next badge render removes the count even though the journals and persona are unchanged. A read failure is presented as an empty posting queue instead of retaining the known count.

## 7. MINOR — A2 still specifies the submit/close race that its own amendment removes

**Evidence:** `NeoERP-BackEnd/docs/api/accounts-a2.md:490`–492 (§6.8) says Submit does not lock the period and a journal can become SUBMITTED after the close check, leaving it waiting in a closed period. The same draft's §19 A1-A4 (line 845), §20 R2-6, and named `SubmitPeriodLockTest.submitRacingCloseIsRefusedOrWaits` (line 726) require Submit to take the period `FOR SHARE`. Architecture AC-0 §3 A2 acceptance 4 requires closing to be refused while submitted journals exist in the period.

**Concrete failure:** For a close racing a submit, §6.8 accepts CLOSED + a newly SUBMITTED journal; §19 requires either Submit to see CLOSED and fail, or Close to wait and then see the submitted journal and refuse. Those are different acceptance outcomes for the same interleaving. The later amendment supplies the intended fix, so this is a stale normative contract instruction, not evidence that the planned amended locking still permits the race.

## Resolution (2026-10-08)

1. Rig `accounts-a1.jsx` (and app.html copy): picking an account clears cost centre / stock location it doesn't allow; changing the default branch clears stock locations outside it; `ajProblems`/`ajModelOf` refuse a disallowed tag or wrong-branch location (spec §9 wording), blocking Submit and Post.
2. Rig: separate `obPosted` and `obEquityZero` (balance of the OPENING_BALANCE_EQUITY account over posted journals); Overview shows the real amount when not zero.
3. Rig: with drafts or waiting journals, the Chart tab shows the HAS_JOURNALS wording with the count and offers no replacement (wrapper in `AccountsPageA1`; accounts-a0.jsx unchanged).
4. A2 spec §6: `AccountsReportAmount` (exact decimal string, no arithmetic) replaces `AccountsAmount` for reports; test `AccountsReportAmountTest.handlesAggregatesBeyondLong`; contract C-8 mirrors it (CX-1).
5. A2 spec §5: reports and period reads available on READY books with a "not live yet" note; only period actions need live (CX-2).
6. Rig: the Waiting-for-you badge keeps the last successful count on a failed read.
7. A2 contract §6.8: Submit takes the period `FOR SHARE`; race refused or waited (CX-3).
