# Supplier bank-details safety review

## Findings

Independent static review, 2026-10-31. Scope: approved package A–E in `accounts-decisions-for-jabran.md`, `accounts-c.md` C-3/§7.2, accounts bank flows, V35–V39, key generator, IAM holder-count read and app consumers. Reviewed workspace master `0c3b65c1831f2fa4103a9e555db8885f4166f4a3`, backend dev `2cc842303f9e9ec6ce4f2020595544dbd8c83b25`, app dev-app `7ef508a1c1353da53e0319e1de9a4fa2127e064f`. Backend and app working trees were clean at inspection. Unrelated workspace changes were excluded. Paths below are relative to the workspace; backend paths beginning `services/` or `scripts/` are relative to NeoERP-BackEnd; app paths beginning `composeApp/` are relative to NeoERP-App.

No Gradle, services, migrations or runtime tests were run; test references describe source coverage, not passing execution. No project-state files or secret files were read. Findings remain open; implementation is outside this review's authorization. Two read-only reviewers independently examined approval/IAM and evidence/app paths; the lead reviewed crypto/backfill and reconciled the findings. This report is the only authorized written artifact.

### BS-01 — Medium — The app discards fraud signals before the approver sees them

**Location:** `composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/features/accounts/data/remote/dto/PayablesDtos.kt:163`; `composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/features/accounts/domain/model/PayablesModels.kt:281`; `composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/features/accounts/presentation/payables/SuppliersScreen.kt:378`.

**Failure scenario:** Request a bank change to an account already used elsewhere, with a mismatched holder name or recently changed contact. The backend individual-request response supplies `signals`, but the DTO/domain omit them and unknown JSON fields are ignored. The app approval panel shows the request and allows approval without displaying those warnings. Evidence metadata is also absent from this model. Package E's human review control therefore does not reach the app approver.

**Existing test:** `SuppliersAndBankTest` covers request/reveal/approval; no signal mapping/rendering test found. Backend `BankChangeSignalsTest` exercises server responses only.

**Fix:** Carry typed signals and evidence metadata through DTO, mapper and domain; fetch the individual request for approval and render all server signals beside the approval action. Test the complete response-to-screen path.

### BS-02 — Medium — Equivalent IBAN/domestic routes evade the duplicate-account signal

**Location:** `services/accounts-service/src/main/kotlin/com/neovatus/accounts/infrastructure/crypto/BankDetailsCrypto.kt:181`; `services/accounts-service/src/main/kotlin/com/neovatus/accounts/infrastructure/persistence/jdbc/BankAccountMatchJdbcAdapter.kt:27`.

**Failure scenario:** Supplier A has only domestic account `86011117947`; supplier B requests only IBAN `NO9386011117947`. These denote the same account, including under the application's `PayeeRoutes.sameAccount` logic (`domain/payables/Payables.kt:195`). Fingerprints are generated only for supplied identifiers, with separate `account` and `iban` domains, so neither stored identifier matches and `SAME_ACCOUNT_ELSEWHERE` disappears. Reversing the representations has the same result.

**Existing test:** `BankChangeSignalsTest.sameAccountOnAnotherSupplierIsShownToTheApproverAndStillApproves` covers formatting differences within the same identifier type; no cross-representation test found.

**Fix:** Derive country-aware canonical account aliases from supported IBANs/domestic routes, preserving the bank and country context needed to avoid false matches. Match alias sets and backfill their fingerprints. Add supplier/customer tests in both directions.

### BS-03 — Medium — Malformed bank JSON can put plaintext identifiers into debug logs

**Location:** `services/accounts-service/src/main/kotlin/com/neovatus/accounts/delivery/http/error/ApiExceptionHandler.kt:249`.

**Failure scenario:** With this handler's DEBUG logging enabled, send a bank-change JSON body with an IBAN token accidentally left unquoted. Jackson's unrecognized-token exception can contain the literal IBAN. The handler logs the complete throwable and cause chain, retaining the value in application logs even though the HTTP error is fixed and `BankDetails.toString()` masks identifiers. This is conditional on DEBUG being enabled; no default-production logging leak is asserted.

**Existing test:** `PlatformWriteRefusalTest` test “an unreadable body is 400 VALIDATION with a fixed message, never the parser's text (A-9)” checks the HTTP response only; no log-capture assertion found for malformed bank JSON.

**Fix:** Log only the request ID and a safe error category for unreadable bodies, without the parser throwable/message. Add a DEBUG-level captured-log regression test using a distinctive synthetic identifier.

### BS-04 — Medium — Production evidence files never become readable

**Location:** `services/accounts-service/src/main/kotlin/com/neovatus/accounts/configuration/files/AccountsFileStoreConfig.kt:249`; `services/accounts-service/src/main/kotlin/com/neovatus/accounts/application/service/payables/supplier/SupplierBankEvidenceService.kt:159`; `services/accounts-service/src/main/kotlin/com/neovatus/accounts/application/service/payables/supplier/SupplierBankChangeService.kt:244`.

**Failure scenario:** Outside local/test, uploads are assigned to `PendingFileScanner`. There is no implemented scanner completion worker/API to transition stored evidence to CLEAN. Every subsequent download is refused, while bank-change approval still succeeds independently of evidence scan state. An approver cannot inspect an attached document in production. This is a documented unfinished part of package D, not a demonstrated malware-download bypass.

**Existing test:** `BankEvidenceFileTest.typeSizeAndScanAreChecked` verifies that PENDING files cannot be downloaded; no production scanner-completion test found.

**Fix:** Wire a real scanner and durable completion/retry/rejection handling, including storage cleanup and tests of the terminal states. Until operational, present evidence as unavailable and do not imply that uploaded evidence is inspectable. Any requirement to block approval pending evidence needs an explicit product decision.

### BS-05 — Medium — Current and previous-contact notices are never delivered

**Location:** `services/accounts-service/src/main/kotlin/com/neovatus/accounts/application/service/payables/supplier/SupplierBankChangeService.kt:301`; `services/accounts-service/src/main/kotlin/com/neovatus/accounts/infrastructure/persistence/jdbc/SupplierBankNoticeJdbcAdapter.kt:22`; `services/accounts-service/src/main/resources/db/migration/V37__supplier_bank_notices.sql:1`.

**Failure scenario:** Approve fraudulent bank details after changing the supplier's email. Current-contact and, within the defined window, previous-contact notice rows are inserted as PENDING, but no dispatcher consumes them. The legitimate previous contact receives no warning. Transactional recording is useful, but package C's notification protection is not operational. Contract §7.2 explicitly acknowledges the missing sender.

**Existing tests:** `SupplierBankNoticeTest.anApprovalRecordsANoticeToTheContactOnFileAndARejectionNone` and `aRecentContactChangeAlsoNotifiesThePreviousEmail` assert stored rows, not delivery.

**Fix:** Implement a durable sender with bounded retries, delivery status, duplicate-safe dispatch and alerts on old/failed notices. Exercise actual dispatch to both saved recipients without placing addresses or account data in logs.

### BS-06 — Medium — A partial or skipped backfill leaves plaintext indefinitely during uptime

**Location:** `services/accounts-service/src/main/kotlin/com/neovatus/accounts/infrastructure/persistence/jdbc/BankDetailsBackfill.kt:33`, `:62`, `:97`; `services/accounts-service/src/main/kotlin/com/neovatus/accounts/configuration/bank/BankCryptoConfig.kt:207`.

**Failure scenario:** Hold a legacy customer row lock while startup backfill runs. SKIP LOCKED omits the row and a short batch ends the loop. Release the lock after startup: nothing schedules another pass, so the identifier remains plaintext until another startup/manual run. Likewise, one batch failure rolls back that batch, the runner logs only its class and continues startup without retry. Concurrent workers are row-safe and completed batches remain sealed, but those properties do not ensure completion.

**Existing tests:** `BankDetailsSealedTest.theBackfillSealsLegacyPlaintextRowsOnce` proves idempotency; `theBackfillSkipsLockedRows` explicitly leaves one plaintext row and invokes a second manual run to seal it. No automatic eventual-completion/partial-failure recovery test found.

**Fix:** Retry durable outstanding work after startup, publish a remaining-row health/metric signal and alert on nonzero/failed backfill. Define a deployment completion gate before claiming encryption coverage or dropping legacy columns. Dropping columns also needs a separate plan for historical backups/WAL containing old plaintext.

### BS-07 — Medium — Encryption-key rotation cannot retire old keys

**Location:** `services/accounts-service/src/main/resources/db/migration/V35__bank_details_sealed.sql:106`, `:112`, `:180`; `services/accounts-service/src/main/kotlin/com/neovatus/accounts/infrastructure/crypto/BankDetailsCrypto.kt:173`.

**Failure scenario:** Add a new active AEAD key after suspected compromise. New writes use it and old rows remain readable while the old key is retained. There is no resealing path, and the database guard permits only initial plaintext-to-ciphertext backfill, forbidding ciphertext replacement on decided requests and live supplier rewrites under the same approved request. Removing the old key breaks historical reads; retaining it leaves historical data exposed to the compromised key. Key-ring read compatibility alone does not complete rotation.

**Existing test:** `BankDetailsCryptoTest.oldKeysStillOpenAfterRotationAndAnUnknownKeyIsRefused` verifies ring behavior only; no persisted reseal/retirement test found.

**Fix:** Provide an audited maintenance path that decrypts/verifies/reseals under unchanged bindings, preserves logical request immutability, updates linked supplier copies atomically, and verifies remaining old-key references before retirement. Include history and backup recovery in the key-retention policy.

### BS-08 — Medium — A structurally valid wrong key passes startup

**Location:** `services/accounts-service/src/main/kotlin/com/neovatus/accounts/configuration/bank/BankCryptoConfig.kt:114`, `:159`, `:207`; `services/accounts-service/src/main/kotlin/com/neovatus/accounts/infrastructure/persistence/jdbc/BankDetailsBackfill.kt:62`.

**Failure scenario:** Restart against existing sealed data with a different valid 32-byte AEAD key under the same ID, or omit an old ID. Configuration validates shape only; backfill skips existing ciphertext, so startup succeeds. Reads subsequently fail with 503. Replacing the separate fingerprint key with a valid but different key similarly starts successfully and silently splits duplicate detection between old and new fingerprints. Missing configuration outside local correctly refuses startup; this finding concerns well-formed but incompatible configuration.

**Existing tests:** `BankCryptoPolicyTest.incompleteOrMalformedKeysRefuseToStart` covers syntax/completeness, and crypto tests cover read-time unknown-key rejection; no database-backed startup compatibility test found.

**Fix:** Maintain a non-secret key identity inventory plus authenticated verification records for every required AEAD key and the fingerprint key. Check compatibility before readiness and refuse incompatible startup; do not log key bytes or decrypted routes. Support explicit, separately validated rotation workflows.

### BS-09 — Low — Concurrent key generation can overwrite a newly created permanent key file

**Location:** `scripts/accounts-bank-keys.sh:17`, `:37`.

**Failure scenario:** Two generator processes target an absent path. Both pass the existence check and create different temporary key files. Both use overwriting `mv`; the second replaces the first file despite the script's “never overwrites” promise. If the service starts or a backup is taken between those moves, ciphertext can be written with keys no longer present in the final file. This requires concurrent provisioning and a narrow timing window.

**Existing test:** None found for concurrent generator invocations.

**Fix:** Publish the completed mode-600 file with an atomic no-replace operation, treating an existing destination as success without replacing it; test simultaneous invocations and preservation of the winning file.

## What is solid

- Tink `AesGcmJce` uses 32-byte AES keys, fresh encryption nonces and authenticated, length-delimited company/table/row/purpose/service/key-ID binding. The route is one encrypted object: individual fields cannot be spliced. Cross-binding/tamper tests exist. Supplier copies intentionally retain their approved request's binding; tenant/supplier relationship checks and database guards constrain that copy.
- Fingerprints use a separate, company-scoped HMAC-SHA256 key, normalized identifiers and identifier domains. A database-only reader cannot perform an unkeyed offline dictionary attack on short account numbers. Authorized duplicate lookups remain an intentional online equality oracle; key compromise would permit enumeration. Short identifiers are fully masked, not exposed as “last four.”
- New writes null legacy plaintext and transactional batches seal/clear atomically; backfill is idempotent. Local ephemeral keys refuse sealing; absent production keys and malformed configuration refuse startup. Local key files are gitignored and POSIX group/other access is rejected.
- Requests are immutable, one PENDING request per supplier is enforced, and approval locks supplier then request with status/version checks. Ordinary edits cannot replace bank details while approval is pending. Owner self-approval requires the real Owner, explicit flag/reason and a fresh zero-other-holder answer; unknown IAM answers fail closed, as P3-30 requires.
- Reviewed bank request/history/reveal/decision/evidence queries enforce company and supplier ownership. Machine holder-count authorization checks narrow scope, audience and allowlisted machine identity; exclusions use the authorized same-company IAM user ID, and responses contain counts rather than names.
- Evidence enforces size and sniffed type, avoids supplied filenames/paths, uses encrypted storage, and serves only CLEAN files to authorized approvers with no-store and pre-download audit. Repeated contact changes preserve the original previous email within the defined 30-day window.
- Normal audit/events and payment snapshots avoid full account identifiers; snapshots retain request ID/fingerprint and masked values. App reveal data is held in memory with a timed remask; no confirmed persistent plaintext/crash-report sink was found in the reviewed paths. This source review does not establish deployment logging, crash-agent or backup configuration.
