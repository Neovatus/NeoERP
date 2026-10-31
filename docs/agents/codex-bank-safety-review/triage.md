# Triage: Codex bank-details safety review

Adversarial check of `report.md` in this folder (Codex, brief §7 in `docs/agents/codex-briefs/README.md`), 2026-10-31.
Checked against the same commits Codex reviewed (backend dev `2cc8423`, app dev-app `7ef508a1`). Code only: no Gradle,
no services, no tests run. For every finding the cited file:line was opened, the failure scenario was walked through the
code and the V35–V39 guards, and the named tests were found. Backend paths are under
`NeoERP-BackEnd/services/accounts-service/src/main/kotlin/com/neovatus/accounts/` unless stated; app paths under
`NeoERP-App/composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/features/accounts/`.

Schema changes below say "forward migration" (the next free accounts number is V40, but other planned fixes also
take V40+).

## Summary

| ID | Codex sev. | Verdict | Our sev. | One line |
|---|---|---|---|---|
| BS-01 | Medium | CONFIRMED | **High** | The app never shows fraud signals (or evidence) to the approver |
| M-1 | (missed) | new | **Medium** | Leaving the account holder's name blank silences the name-mismatch signal |
| BS-02 | Medium | CONFIRMED | Medium | Same account as IBAN on one party and domestic number on another is not flagged |
| BS-05 | Medium | CONFIRMED | Medium | Notices to current/previous contact are recorded but never sent |
| BS-07 | Medium | CONFIRMED | Medium | No way to reseal under a new key, so an old key can never be retired |
| BS-08 | Medium | CONFIRMED (plus) | Medium | A well-formed wrong key starts fine; data written meanwhile is lost after correction |
| BS-04 | Medium | CONFIRMED | Low | Outside local/test, evidence files stay PENDING for ever and can't be opened |
| BS-06 | Medium | CONFIRMED | Low | A skipped or failed backfill batch is retried only at the next start |
| BS-03 | Medium | CONFIRMED | Low | Unreadable JSON is logged with the parser text at DEBUG (off by default) |
| BS-09 | Low | CONFIRMED | Low | Two key-generator runs at once can replace the first key file |
| M-2 | (missed) | new | Low | The approval doesn't record which signals were showing |
| M-3 | (missed) | new | Low | Reveal limit (60/h) is per instance and in memory |
| M-4 | (missed) | new | Low | App `SupplierBankDetails` prints full revealed values in `toString()` |
| M-5 | (missed) | UNVERIFIED | Low | Machine-client secret falls back to a built-in default when the env var is unset |

Counts. Codex findings: 9 checked, 9 CONFIRMED, 0 PARTLY, 0 WRONG, 0 UNVERIFIED. Our severities for them: 1 High,
4 Medium, 4 Low. Added: 5 (1 Medium, 4 Low; one of them UNVERIFIED). Codex's "what is solid" list was spot-checked
(AEAD binding, fingerprints, request immutability guards, approve lock order, Owner self-approval fail-closed, holder
count at level `any`, platform-write refusal, masked `BankDetails.toString()`, masked payment snapshot) and holds.

## Details

### BS-01 — CONFIRMED — High (Codex: Medium)

Checked: `data/remote/dto/PayablesDtos.kt:163` `BankChangeRequestDto` has no `signals`, `evidence` or `documentId`;
`domain/model/PayablesModels.kt:281` likewise; there is no "signal" or bank "evidence" anywhere under
`features/accounts` in the app. The backend puts `signals` and `evidence` on the single-request read
(`SupplierBankChangeService.kt:413-415`, `delivery/http/payables/supplier/SupplierJson.kt:82-85`); the app's
`PendingChange` panel (`presentation/payables/SuppliersScreen.kt:378`) shows only now/new/why. So package E (and the
evidence half of D) never reaches the approver. Unknown JSON keys are ignored, so nothing fails loudly.

Why High: E is the only automatic fraud control the approver gets, and the approval panel currently looks complete.
It is also the cheapest fix with the largest payoff.

Test: `SuppliersAndBankTest` (app) has no signal case; `BankChangeSignalsTest` (backend) checks the JSON only.

Fix (app only, no backend change): add `signals: List<BankSignalDto>` (`code`, `details`) and `evidence`
(`documentId`, `contentType`, `sizeBytes`, `scanState`) to `BankChangeRequestDto` → mapper → `BankChangeRequest`;
load the pending request through `PayablesApi.bankChangeRequest(...)` for anyone holding `PAYMENT.APPROVE`; render
each signal as a warning line above the approve button in plain words (no codes shown), plus the evidence row
(download only when `scanState = CLEAN`). Test: response JSON → state → panel shows each of the five signal kinds.

### M-1 (missed) — Medium — the holder-name signal is silenced by a blank holder name

`domain/payables/BankSignals.kt:96-99` raises `HOLDER_NAME_MISMATCH` only when `accountTitle` is non-blank, and
`BankDetailsRules.check` (`application/service/payables/supplier/SupplierBankChangeService.kt:84`) keeps
`accountTitle` optional. Scenario: a fraudster requests a change with only a domestic account number and no holder
name → no name signal, and (no IBAN, no BIC) no `BANK_COUNTRY_MISMATCH` either. The approver sees a clean request.
Test: `BankSignalsTest.holderNameAndCountryAndChecks` covers a wrong name, not a missing one.

Fix: add a signal `HOLDER_NAME_MISSING` when the route is a transfer method (not CHEQUE/CASH) and `accountTitle` is
blank (or make `accountTitle` required for those methods — product choice, see decisions). Optionally a
`BANK_COUNTRY_UNKNOWN` signal when neither IBAN nor BIC is given. Domain + `BankSignalsTest`; app wording with BS-01.

### BS-02 — CONFIRMED — Medium

Checked: `infrastructure/crypto/BankDetailsCrypto.kt:177-200` fingerprints each identifier under its own domain
(`account`, `iban`); `infrastructure/persistence/jdbc/BankAccountMatchJdbcAdapter.kt:27-60` matches only exact
fingerprints. NO `86011117947` vs `NO9386011117947` therefore never match, although `PayeeRoutes.sameAccount`
(`domain/payables/Payables.kt:195`) treats them as the same account. Also missed: the match looks only at live
supplier/customer routes, not at other PENDING requests, so two simultaneous requests to one account on two suppliers
are not flagged until one is approved.

Test: no cross-representation or pending-vs-pending test.

Fix, no schema change: expand the wanted set at query time. From a request IBAN of a country where the domestic
number is the IBAN's national part (NO, DK, FI; PK bank code + account), also fingerprint the national number under
`account`; from a domestic account number plus the supplier's (or company's) country, compute the IBAN (check digits
are deterministic) and also fingerprint it under `iban`. Leave SE (clearing-number rules) for later. Also search
`supplier_bank_change_requests` with status PENDING (its `*_fp` columns already exist). Tests: supplier/customer, both
directions, NO and DK, plus pending-vs-pending. A stored alias column is only needed if more countries are added.

### BS-05 — CONFIRMED — Medium

Checked: `SupplierBankChangeService.kt:301-327` inserts PENDING rows (`SupplierBankNoticeJdbcAdapter.kt:22`, table
`V37`, kinds widened in `V39`); nothing in the backend reads `supplier_bank_notices` with status PENDING (the
partial index `ix_supplier_bank_notices_pending` has no consumer). `accounts-c.md` §7.2 (line ~548) says "Not sent
yet". Package C gives no protection today. Note also `notices` is an optional constructor parameter
(`SupplierBankChangeService.kt:151`, `notices?.let`), so a missing bean would silently record nothing.

Test: `SupplierBankNoticeTest` asserts rows, not delivery.

Fix: a dispatcher job (claim `FOR UPDATE SKIP LOCKED`, send, set SENT/FAILED, bounded `attempts`, alert on PENDING older
than N minutes or FAILED); channel per the decision below. Make `notices` non-nullable. No schema change needed (the
V37 columns cover status, attempts, sent_at). No address or digits in logs.

### BS-07 — CONFIRMED — Medium

Checked: the V35 request guard (`V35__bank_details_sealed.sql:106-128`) only lets `bank_ct` change from NULL to
non-NULL (the backfill) and otherwise forbids any change to a decided request; the supplier guard (`:134-185`) allows
the live columns to change only to a newer approved request (or the backfill). `BankDetailsCrypto` reads any key in
the ring but nothing reseals. So after a suspected key compromise the old key must stay in the ring for ever.

Test: `BankDetailsCryptoTest.oldKeysStillOpenAfterRotationAndAnUnknownKeyIsRefused` is ring-only.

Fix: forward migration that `CREATE OR REPLACE`s both guard functions with one more allowed change: `bank_ct`
non-NULL → non-NULL with every other column (all `*_fp`, `bank_fp`, `*_last4`, request facts) unchanged, so a reseal
cannot alter the route; the supplier copy may follow its own request's new `bank_ct` (same request id, values equal
the request's). Then a maintenance job: per batch, open with the old key, reseal under the active key and the same
binding, update the request and its supplier copy in one transaction, audit counts; a report of rows per key id
(`keyIdOf` exists) gates removing a key. Backup retention for the old key is policy, not code.

### BS-08 — CONFIRMED, plus a data-loss angle — Medium

Checked: `configuration/bank/BankCryptoConfig.kt:114-139` checks shape only (ids, base64, 32 bytes); the backfill
skips sealed rows, so a different key under the same id, a missing old id, or a different fingerprint key all start
cleanly. Reads then fail (503); fingerprint matches silently stop. Codex missed: while the wrong active key is in place,
new requests are sealed with it; once the right key is restored those rows (immutable, and copied onto suppliers) are
unreadable, so their suppliers can't be paid until re-requested. The local script makes this likely: the key id is
`local<yyyymmdd>` (`scripts/accounts-bank-keys.sh:27`), so deleting the file and regenerating on the same day gives the
same id with a different key.

Test: `BankCryptoPolicyTest.incompleteOrMalformedKeysRefuseToStart` is syntax only.

Fix: forward migration adding a small `bank_key_checks` table (key id, purpose `AEAD`/`FINGERPRINT`, a sealed known
constant per AEAD key, the HMAC of a known constant for the fingerprint key + version). At start: for every key id that
`keyIdOf` finds in use (or that has a check row), open the check; compare the fingerprint check; insert rows for new
keys; refuse readiness on any mismatch (no key bytes in logs). Script: add a random suffix to the key id.

### BS-04 — CONFIRMED — Low (Codex: Medium)

Checked: `configuration/files/AccountsFileStoreConfig.kt:249-256` uses `PendingFileScanner` (always PENDING) outside
local/test; `infrastructure/files/BankEvidenceFiles.kt:54` sets CLEAN only at upload; nothing else moves an evidence
row to CLEAN; `SupplierBankEvidenceService.kt:159` refuses non-CLEAN downloads. V36's guard (`:56`) allows
PENDING → CLEAN, so a scanner needs no schema change. Approval does not depend on evidence.

Why Low: fails closed (nothing unscanned is served), it is documented, and evidence is "not proof of authenticity".

Fix: a scanner (e.g. ClamAV sidecar) and a job moving PENDING → CLEAN/INFECTED with retries; INFECTED deletes the
object via the V39 store-objects table. Until then the app (BS-01) shows "file not yet checked" instead of a download.

### BS-06 — CONFIRMED — Low (Codex: Medium)

Checked: `infrastructure/persistence/jdbc/BankDetailsBackfill.kt:33-46` stops a loop on a short batch (skipped locked
rows shorten it); `copySuppliers` skips a supplier whose request was skipped; `BankCryptoConfig.kt:200-215` logs a
failure's class and carries on; `remaining()` has no caller outside tests. Plaintext stays until the next start.

Why Low: V35 states no pre-V35 bank data outside local, writes since V35 never store plaintext, and reads of a legacy
row work. The real risk is dropping the plaintext columns (planned follow-up) before every row is sealed.

Test: `BankDetailsSealedTest.theBackfillSkipsLockedRows` proves the skip and a manual second run.

Fix: rerun the backfill on a schedule while `remaining() > 0` (cheap count), expose `remaining()` as a gauge/health
detail, and make the column-drop migration refuse (a `DO` block raising when any legacy row is left).

### BS-03 — CONFIRMED — Low (Codex: Medium)

Checked: `delivery/http/error/ApiExceptionHandler.kt:249` logs the throwable at DEBUG; Jackson's "Unrecognized token
'...'" message carries the token (e.g. an unquoted IBAN). No logging config raises this logger to DEBUG
(`application.properties` has none), so production is not affected by default. Other bank paths checked: no exception
message interpolates bank values; the catch-all (`:290`) logs at ERROR but no bank code path builds such messages.

Test: the A-9 test checks the HTTP body only.

Fix: log `requestId` and `ex.javaClass.simpleName` only (drop the throwable); captured-log test with a synthetic IBAN.

### BS-09 — CONFIRMED — Low

Checked: `scripts/accounts-bank-keys.sh:17-37` checks existence then `mv` (replaces). Local developer script only.
Fix: publish with `ln "$TMP" "$TARGET"` (fails if the target exists, atomically), then `rm "$TMP"`; on failure print
"[keep]" and exit 0. Plus the key-id suffix from BS-08.

### M-2 (missed) — Low — signals aren't recorded with the decision

`approve()` (`SupplierBankChangeService.kt:231-361`) never computes signals; the `BANK_CHANGE_APPROVE` audit has no
trace of the warnings that were showing. After a fraud, nobody can show whether the approver overrode a
`SAME_ACCOUNT_ELSEWHERE`. Fix: compute signals inside approve and add `signals: [codes]` (codes only, no party names or
digits) to the audit and the approved event. Optional product step: require an extra tick when any signal is present.

### M-3 (missed) — Low — reveal limit is per instance

`BankRevealLimiter` (`application/service/payables/supplier/BankRevealLimiter.kt:27-51`) is a field of the service
(`SupplierBankChangeService.kt:154`): with N instances a person gets N × 60 reveals an hour, and a restart resets it.
Fix: count `BANK_DETAILS_REVEALED` per person in the last hour from a durable store (forward migration for a small
counter table, or the local audit outbox if it is queryable).

### M-4 (missed) — Low — app model prints revealed values

App `SupplierBankDetails` (`domain/model/PayablesModels.kt:247`) is a plain data class; when it holds a reveal, its
`toString()` contains the full numbers. No body logging or state dump was found today, so this is hardening: override
`toString()` to mask, as the backend's `BankDetails.toString()` does (`domain/payables/Payables.kt:50`).

### M-5 (missed) — Low, UNVERIFIED — default machine-client secret

`application.properties:40-48` and `configuration/security/IamPermissionHolderCount.kt:62` fall back to a built-in
client secret when `ACCOUNTS_SERVICE_CLIENT_SECRET` is unset. Whether any deployed auth server accepts that value is
deployment config (not checked). The same pattern exists in other services. Fix: outside `local`/`test`, refuse to
start while the default is in use (one shared check for all services).

## Decisions for Jabran

1. **Fix the approval screen first (BS-01, M-1, M-2) — recommend yes, now.** The fraud warnings exist on the server but
   the app never shows them, and a blank account-holder name hides the name warning. Recommend: show every warning
   above the Approve button, add a "holder name missing" warning, and record in the audit which warnings were showing.
   Sub-choice: make the holder name required for transfers instead of warning? Recommend the warning (some foreign
   payees genuinely don't give one).
2. **Duplicate-account check across IBAN and plain account numbers (BS-02) — recommend the light fix.** Translate
   between IBAN and domestic number for Norway, Denmark, Finland (and Pakistan) when checking, with no database change;
   leave Sweden for later; also check other pending requests.
3. **How notices get sent (BS-05) — needs your choice.** Recommend: accounts asks the notification service to send
   (give accounts' machine client the send right), rather than accounts sending mail itself. Until it works, the
   approval screen should say the supplier has not been told.
4. **Malware scanner for proof files (BS-04) — recommend a go-live blocker, not now.** Until it exists, show
   "file not yet checked" and no download. Keep proof files optional for approval (no change).
5. **Key safety before the first real deployment (BS-07, BS-08) — recommend yes, one batch.** A startup check that the
   keys are the right ones, and a reseal job so an old key can be retired. Both need one forward migration.
6. **Before dropping the old plaintext columns (BS-06) — recommend a hard gate.** The drop runs only when no unsealed row
   is left; the backfill retries until then.
7. **Small hardening (BS-03, BS-09, M-3, M-4, M-5) — recommend batch them with any of the above.** None is urgent.
