# D-123 Transactional e-mail provider: comparison and recommendation

Research only, read 2026-11-21 from public pages. No vendor was contacted and nothing was signed up. Every price and claim carries the date it was read; anything not confirmed from a source is marked *(not verified)* and collected in the last section.

## 1. What the provider must do

From the contract and the earlier decisions (read-only sources in this repo set):

| # | Need | Source |
|---|---|---|
| R1 | Send invoices and reminders with the issued PDF **attached, up to 10 MB**, no download links | BE `docs/api/accounts-docout.md` C-12 |
| R2 | Own NeoERP sending domain (`invoices.neoerp.{tld}`) with SPF, DKIM, DMARC; From `invoices@…`, display name "{sender name} via NeoERP" | C-12, C-35, D-123; go-live P-9 |
| R3 | Per-company **Reply-To** (only after the company confirms it) | C-12, C-35 |
| R4 | Up to 3 To + 3 Cc per message | C-35 |
| R5 | Bounces and complaints **pulled** from the provider's API every 5 min; **no public webhook**, no gateway route; matched by our own stored `message_id`; dedupe on the provider's event id | C-34 |
| R6 | EU/EEA hosting with a DPA; region, DPA and sub-processor list recorded before go-live | ADR-025 Q16; go-live H-7; contract §processors (C4) |
| R7 | No stored e-mail bodies on our side; short retention at the processor is preferable | ADR-025 Q6 |
| R8 | Later: notification e-mail (ADR-025 RT-6: digests, preferences) through the same `MailSender` port | ADR-025 RT-6 |
| R9 | Recipients in NO, SE, DK, FI, IS and **Pakistan**; PK use of a foreign provider is an open legal question | go-live H-6, ACC-R24; ADR-025 Q15 |

Size note for R1: MIME base64 encoding adds about 37 % (AWS gives 5 MB becoming about 6.85 MB, [SES sending quotas](https://docs.aws.amazon.com/ses/latest/dg/manage-sending-quotas.html), read 2026-11-21). A 10 MB PDF is therefore about **13.7 MB on the wire**, plus body and headers. A provider whose limit is "10 MB total" cannot carry our largest allowed PDF.

## 2. Official rules a sender must meet

### 2.1 Mailbox providers (deliverability)

| Rule | What it says | Source (read 2026-11-21) |
|---|---|---|
| Gmail sender guidelines | All senders: SPF or DKIM, valid PTR, TLS. Bulk senders: SPF **and** DKIM, a DMARC record (minimum `p=none`), alignment; keep user-reported spam below 0.1 % and never at 0.3 % or above. One-click unsubscribe is required for marketing mail only; **transactional messages are excluded**. | [Google sender guidelines FAQ](https://support.google.com/a/answer/14229414), [Postmaster Tools](https://support.google.com/mail/answer/14668346) |
| Outlook.com high-volume senders | From 2025-05-05, domains sending more than 5,000 mails a day to outlook.com / hotmail.com / live.com need SPF, DKIM and DMARC (at least `p=none`, aligned with SPF or DKIM); non-compliant mail goes to Junk first and may later be rejected (`550 5.7.515`). | [Microsoft Tech Community announcement](https://techcommunity.microsoft.com/blog/exchange/strengthening-email-ecosystem-outlooks-new-requirements-for-high-volume-senders/4399730) (last updated 2025-04-30) |

What this means for us: SPF + DKIM + DMARC on the NeoERP sending domain are required anyway (P-9 already decided). Invoice and reminder mail is transactional, so List-Unsubscribe is not required; ADR-025 RT-6 digests may count as non-transactional and should carry one-click unsubscribe *(our reading, not verified with Google)*.

### 2.2 Pakistan: deliverability and data transfer

- **Which mail systems Pakistani businesses use.** No official census exists. BuiltWith site counts for Pakistan (snapshot updated 2025-11-23) show Titan, Zoho Mail, Microsoft Exchange Online / Office 365 and GoDaddy among the most common MX hosts ([BuiltWith Pakistan MX](https://trends.builtwith.com/mx/country/Pakistan)); a Pakistani hosting firm names Google Workspace, Zoho and cPanel-hosted mail as the three usual business choices ([pakish.net, 2026](https://pakish.net/blog/google-workspace-vs-zoho-vs-custom-cpanel-email-for-pakistani-businesses), commercial source). No Pakistani mailbox provider with its own published sender rules was found. **Deliverability to PK therefore rests on the same SPF/DKIM/DMARC setup plus IP reputation**; shared cPanel hosts are the most likely place for silent filtering *(not verified; test before PK launch, see §6)*.
- **Data protection law.** Pakistan has **no enacted general data protection law**: the Personal Data Protection Bill 2023 is still not passed by both houses ([Chambers Data Protection & Privacy 2026, Pakistan](https://chambers.com/practice-guides/guides/data-protection-privacy-2026/pakistan/law-and-practice), read 2026-11-21; status "as of May 2026" confirmed by a 2026 guide in the same search, and an [Express Tribune column, 2026](https://tribune.com.pk/story/2625470/pakistan-can-no-longer-wait-for-personal-data-protection-law) still calls for enactment). The draft would allow transfers abroad on equivalent protection or explicit consent, and keep "critical personal data" in Pakistan ([MoITT final draft May 2023](https://moitt.gov.pk/SiteImage/Misc/files/Final%20Draft%20Personal%20Data%20Protection%20Bill%20May%202023.pdf)).
- **Cloud First Policy (2022) and Data Governance Policy draft (June 2026)** bind **public-sector** data: sensitive government data on servers in Pakistan ([Dawn, 2026-05-27](https://www.dawn.com/news/2003381)); the June 2026 draft data governance policy covers government data and contractors processing it, not private firms' own customer data ([Profit / Pakistan Today, 2026-06-30](https://profit.pakistantoday.com.pk/2026/06/30/govt-seeks-feedback-on-draft-data-governance-policy-2026)).
- **Result for D-123:** no binding rule found that forbids a PK company from e-mailing its own invoices through an EU-hosted provider today. Open points stay with the PK legal adviser under **ACC-R24 / ADR-025 Q15**: (a) whether this changes if the PDP Bill is enacted, (b) PK **government** customers (Cloud First Policy), (c) whether the invoice copy kept by the mail processor counts as a "record" under the PK keep-in-Pakistan duty (we expect not, since the issued copy lives in our own PK region, ADR-020 D12) *(not verified; legal question)*.

## 3. Candidates

Postmark and SendGrid were checked and dropped (§3.7); five candidates remain.

### 3.1 Amazon SES, region eu-north-1 (Stockholm)

- **Hosting:** AWS region chosen per account; SES SMTP and v2 endpoints exist in eu-north-1 ([SES endpoints](https://docs.aws.amazon.com/general/latest/gr/ses.html)). SES docs also appear on the AWS European Sovereign Cloud site with region `eusc-de-east-1` ([docs.aws.eu SES quotas](https://docs.aws.eu/ses/latest/dg/quotas.html)); that SES is generally available there is *not verified*.
- **Size:** **40 MB per message after base64** with the v2 API or SMTP (v1 API: 10 MB) ([SES quotas](https://docs.aws.amazon.com/ses/latest/dg/quotas.html)). Fits R1 with room. 50 recipients per message (R4 fine).
- **Bounces/complaints, pull:** events go from a configuration set to EventBridge (since 2024-06) or SNS, and from there into an **SQS queue in our own account that we poll**; no public endpoint ([EventBridge destination](https://docs.aws.amazon.com/ses/latest/dg/event-publishing-add-event-destination-eventbridge.html), [What's New 2024-06](https://aws.amazon.com/about-aws/whats-new/2024/06/amazon-ses-publishes-email-sending-events-eventbridge)). Only hard bounces and soft bounces that SES has stopped retrying are published. Fits R5, but `fetchEvents(since)` becomes "drain the queue" rather than "query since t" (adapter detail).
- **Stores content?** SES does not keep message bodies for later viewing *(general knowledge, not verified on a page this pass)*; fits R7.
- **Price (read 2026-11-21, [SES pricing](https://aws.amazon.com/ses/pricing/)):** à la carte **USD 0.10 per 1,000 mails + USD 0.12 per GB of attachments**. New accounts start on the **Essentials** plan from 2026-07-21 (USD 0.16 per 1,000, no monthly fee, includes basic Virtual Deliverability Manager) and may switch to à la carte at any time. Dedicated IP USD 24.95/month; managed dedicated IPs USD 15/month + USD 0.08 per 1,000. Plans also offer **Tenants** (per-tenant reputation isolation), useful later for per-company domains.
- **DPA / GDPR:** the AWS GDPR DPA and the 2021 SCCs are **incorporated into the AWS Service Terms** (updated 2026-05-11) and apply automatically, no separate signature ([AWS DPA blog](https://aws.amazon.com/blogs/security/aws-gdpr-data-processing-addendum/), [AWS Service Terms](https://aws.amazon.com/service-terms/), [AWS GDPR](https://aws.amazon.com/compliance/gdpr)). Sub-processor list: AWS publishes one *(page not read this pass)*.
- **Certifications:** ISO 27001 and SOC 2 for AWS; SES being in scope is *not verified* this pass (check AWS Artifact / "services in scope").
- **Onboarding:** new accounts start in the **sandbox** (200 mails/24 h, verified recipients only); production access is a Trust & Safety review of the use case and bounce handling; AWS aims at a first answer within 24 h, but community reports range from days to over a month ([request production access](https://docs.aws.amazon.com/console/ses/sandbox), [re:Post FAQ](https://repost.aws/knowledge-center/ses-production-access-request-faq)).
- **Test:** sandbox plus the SES mailbox simulator *(simulator not re-read this pass)*; Mailpit stays our local adapter.
- **Support:** forum and paid AWS Support plans.
- **Lock-in / exit:** low. Our side is SMTP or the v2 API behind `MailSender`; domain and DNS records are ours; leaving means new DKIM keys and DNS change.
- **Risks:** US-owned (CLOUD Act exposure discussed by Nordic buyers); production approval can be slow; more wiring (configuration set, EventBridge rule, SQS, IAM) than the API-only vendors; AWS support is paid.

### 3.2 Mailgun (Sinch), EU region

- **Hosting:** EU region chosen per domain at sign-up (self-serve), base URL `api.eu.mailgun.net`; domains, messages, event logs, suppressions, statistics and IPs are "processed and stored" in that region; account data is global ([Mailgun regions](https://www.mailgun.com/regions), [API overview](https://documentation.mailgun.com/docs/mailgun/api-reference/api-overview)). EU data-centre location: not stated (storage host `storage-europe-west1`, which suggests Google Cloud Belgium *(not verified)*).
- **Size:** 25 MB message limit, counted on the uncompressed body ([Mailgun sending docs](https://documentation.mailgun.com/docs/mailgun/api-reference/send/mailgun), from search snippet); fits R1.
- **Bounces/complaints, pull:** the v3 **Events API is deprecated** in favour of the **Logs API** (`POST /v1/analytics/logs`, time range, filters, pagination) ([Logs API](https://documentation.mailgun.com/docs/mailgun/api-reference/send/mailgun/logs), [Events deprecation](https://documentation.mailgun.com/docs/inboxready/api-reference/optimize/mailgun/events)). Fits R5; event-type filters for bounce/complaint in Logs are *not verified*.
- **Retention:** message bodies up to 7 days, metadata 30 days ([Mailgun GDPR page](https://mailgun.com/gdpr), last updated 2020-08-28); log retention by plan: Basic 1 day, Foundation 5 days, Scale 30 days ([pricing](https://www.mailgun.com/pricing/)).
- **Price (read 2026-11-21, USD):** Basic 15/month for 10,000 (overage from 1.80 per 1,000); Foundation 35/month for 50,000 (from 1.30); Scale 90/month for 100,000 (from 1.10); extra dedicated IP 59/month. Whether the EU region is on every plan: *not stated*. A 1-day log window (Basic) is too short for a 5-minute poller that must survive an outage; Foundation is the practical floor.
- **DPA / GDPR:** signable DPA with EU SCCs, hosted by Sinch; full sub-processor list given to customers (page names AWS, Rackspace, SoftLayer, Google Cloud as hosts) ([Mailgun GDPR](https://mailgun.com/gdpr)).
- **Certifications:** the regions page claims SOC 2 and ISO 27001 for the EU region ([regions](https://www.mailgun.com/regions)); certificate scope *not verified*.
- **Onboarding:** self-serve; domain verification by DNS. Test: free plan (100 mails/day).
- **Lock-in / exit:** low (SMTP or HTTP API behind `MailSender`).
- **Risks:** contracting entity and whether it is the US subsidiary of Swedish Sinch AB *(not verified)*; GDPR page is old; Events → Logs migration means our adapter must target the new API.

### 3.3 Brevo (France)

- **Hosting:** Brevo's help centre says all hosting servers are in the EU (own servers mostly in France, some Germany; cloud data on Google Cloud Belgium) (from search snippets of [Brevo data storage location](https://help.brevo.com/hc/en-us/articles/360001005510-Data-storage-location); the page itself returned 403). ISO 27001:2022 claimed ([Brevo security](https://www.brevo.com/security)).
- **Size:** help centre snippet: transactional mails up to 20 MB including content, but "attachment should be less than 4MB" ([Brevo attachments help](https://help.brevo.com/hc/en-us/articles/4402811730962), 403 on fetch, snippet only). The API reference states no size limit and allows PDF ([send transactional email](https://developers.brevo.com/reference/send-transac-email)). **A 4 MB attachment cap would fail R1** *(not verified)*.
- **Bounces/complaints, pull:** `GET /v3/smtp/statistics/events` with event types (`hardBounces`, `softBounces`, `spam`, `blocked`…), `messageId`, `startDate`/`endDate` in **whole days**, max 90-day range, offset paging ([event report](https://developers.brevo.com/reference/get-email-event-report.md)). Pullable, but no event id for dedupe and day-level filters *(event id absence not verified)*.
- **Price:** Brevo's transactional pricing could not be read this pass; third-party pages quote from USD 9/month with conflicting volumes *(not verified)*.
- **DPA:** GDPR-based privacy policy (2025-10-01); DPA text and sub-processor list not read *(not verified)*.
- **Risks:** attachment cap; marketing-first product; day-granular event query.

### 3.4 Mailjet (Sinch, France origin)

- **Hosting:** data stored only in EU data centres, Google Cloud Frankfurt and Saint-Ghislain (BE); ISO 27001; DPA with SCCs (Sinch Email as processor) ([Mailjet security and privacy](https://www.mailjet.com/security-privacy/), [DPA changelog](https://www.mailjet.com/legal/dpa-changelog/)).
- **Size:** total message **15 MB** ([Mailjet documentation](https://documentation.mailjet.com/hc/en-us/articles/360043179793)); a 10 MB PDF encoded (about 13.7 MB) plus body is right at the edge *(whether 15 MB is counted before or after encoding: not verified)*.
- **Bounces, pull:** `/v3/REST/bouncestatistics` and per-message lookups exist ([Mailjet message events](https://dev.mailjet.com/docs/api-reference/email-api/categories/message-events)); complaint pull and time-window paging *not verified*.
- **Price:** not read this pass.
- **Risks:** size edge; same group as Mailgun, so not a real diversity fallback.

### 3.5 Lettermint (EU start-up)

- **Hosting:** "processes and stores your email data only in the EU", DPA under Art. 28 on all plans ([Lettermint pricing](https://lettermint.co/pricing)); ISO 27001:2022 announced ([blog](https://lettermint.co/blog/lettermint-iso-27001-certified)). Company seat and country: not stated on the pages read *(not verified; reported as Dutch)*.
- **Price (read 2026-11-21, EUR/month):** Starter 10 for 10,000, 40 for 50,000, 85 for 125,000; Growth and Pro slightly higher; dedicated IP 50/month on Pro from 300,000/month. Message retention 28 days, Pro adjustable down to 0 days (good for R7).
- **Size:** not published *(not verified)*.
- **Pull:** Team API has "Get message events" per message; listing events by time window *not verified* ([Team API](https://lettermint.co/docs/api-reference/team)).
- **Risks:** young vendor, unknown size limit, unclear polling; EU-owned is its main advantage.

### 3.6 Scaleway Transactional Email (France)

- **Hosting:** French cloud, Paris region *(region only from search snippets; Scaleway pages returned 403)*.
- **Size:** **2 MB via API, 50 MB via SMTP**, 10 recipients per mail; PDF allowed ([TEM capabilities and limits](https://www.scaleway.com/en/docs/transactional-email/reference-content/tem-capabilities-and-limits.md), page validated 2025-10-29, snippet only). R1 only over SMTP.
- **Pull:** an e-mail list API with status exists per the developer reference *(not verified, 403)*.
- **Contract:** Specific Conditions v04-2026 published ([PDF](https://www-uploads.scaleway.com/Specific_Conditions_Transactionnal_Email_Services_v042026_3f5487a93c.pdf), not read).
- **Risks:** API size cap forces SMTP; least verified candidate.

### 3.7 Checked and dropped

- **Postmark:** hosted in the US (Deft near Chicago + AWS), "no plans" for EU servers; DPA with SCCs in the terms; Postmark itself has no SOC audit ([Postmark EU privacy](https://postmarkapp.com/euprivacy), read 2026-11-21). Message limit **10 MB total including attachments** ([Postmark size limits](https://postmarkapp.com/support/article/1056-what-are-the-attachment-and-email-size-limits)). Fails R1 and R6. The D-123 example "Postmark EU" does not exist.
- **Twilio SendGrid EU data residency:** launched 2025-07-15, only for Pro and Premier packages, data "primarily" in the EU and may leave for engineering issues ([Twilio blog](https://www.twilio.com/en-us/blog/products/data-residency-for-email-eu)); bounces are pushed by Event Webhook, pull needs the Email Activity add-on *(not verified)*. Weak fit for R5/R6 at our size.

## 4. Comparison table

All values read 2026-11-21; "?" = not verified.

| | Amazon SES eu-north-1 | Mailgun EU | Brevo | Mailjet | Lettermint | Scaleway TEM |
|---|---|---|---|---|---|---|
| R1 10 MB PDF attached | Yes (40 MB encoded) | Yes (25 MB) | Doubtful (4 MB attachment note) | Edge (15 MB total) | ? | SMTP only (API 2 MB) |
| R5 pull bounces + complaints, no webhook | Yes, via our SQS | Yes, Logs API | Yes, day-granular | Bounces yes, complaints ? | ? | ? |
| R6 EU/EEA hosting | Yes (Stockholm) | Yes (EU region) | Yes | Yes (DE/BE) | Yes | Yes (FR) |
| DPA | In Service Terms, automatic | Signable, SCCs | ? | Yes, SCCs | Yes, Art. 28 | Specific Conditions |
| Owner | US | Sinch (SE), US subsidiary ? | FR | Sinch | EU ? | FR |
| ISO 27001 / SOC 2 | AWS yes; SES scope ? | Claimed for EU region | ISO 27001 claimed | ISO 27001 | ISO 27001 | ? |
| Processor keeps bodies | No ? | Up to 7 days | ? | ? | 0–28 days | ? |
| Price, about 50k mails/month | about USD 5–8 + USD 0.12/GB | USD 35 (Foundation) | ? | ? | EUR 40 | ? |
| Onboarding | Sandbox + review (days to weeks) | Self-serve | Self-serve | Self-serve | Self-serve | Self-serve |
| Exit | Easy (SMTP/API, our DNS) | Easy | Easy | Easy | Easy | Easy |

## 5. Lead's recommendation

**Pick: Amazon SES in eu-north-1 (Stockholm), behind `MailSender`, sending over the SES v2 API; bounces and complaints via configuration set → EventBridge → SQS in our account, drained by `MailEventPoller`.**

Reasons:

1. It is the only fully verified candidate that meets **every hard rule at once**: 40 MB encoded size (R1), pull without a public endpoint (R5), EEA region (R6), DPA and SCCs that apply automatically (R6, H-7).
2. Lowest running cost by a wide margin (about USD 0.10–0.16 per 1,000 + USD 0.12/GB, read 2026-11-21), with no monthly floor; good for a product that starts small.
3. The SES **Tenants** feature and per-identity configuration sets fit the later "per-company custom domains" step in D-123 and per-tenant reputation.
4. Nordic region (Stockholm) is close to most of our recipients; the same adapter can later point at a PK-allowed region if ACC-R24 demands it (H-6).

Accepted trade-offs: US ownership (CLOUD Act) — mitigated by EEA region, SCCs and no stored bodies; slower start (production-access review), so apply early; more wiring than an API-only vendor (one-off, in CP-DO.2).

**Fallback: Mailgun EU region, Foundation plan or higher**, using the **Logs API** for pulls. Same adapter shape, 25 MB limit, self-serve EU region, signable DPA. Use it if SES production access is refused or delayed past the CP-DO.2 build, or if Jabran prefers a European parent group. If an **EU-owned** provider becomes a customer demand, re-check Lettermint (size limit and event polling) before Brevo.

## 6. What Jabran must do or sign

1. **Approve the pick and fallback** (records D-123 in `accounts-docout.md`; the ERP lead writes it there, not this file).
2. **Create a Neovatus-owned AWS account** (or decide which existing one), accept the AWS Customer Agreement; the **AWS GDPR DPA and SCCs come with the Service Terms**, nothing separate to sign. Billing card is entered by Jabran.
3. **Choose and register the sending domain** (`invoices.neoerp.{tld}`; TLD still open), and let the lead add SPF, the three SES DKIM CNAMEs, a custom MAIL FROM subdomain and DMARC (start `p=none` with a reporting address, move to `quarantine` after clean reports) (P-9).
4. **Submit the SES production-access request** from the console with the use case "invoices and reminders to the company's own customers; bounces pulled and suppressed" — early, because review time varies.
5. **Record the processor (H-7):** region eu-north-1, DPA = AWS Service Terms § 1.14 (version 2026-05-11), link to the AWS sub-processor list; add AWS to the customer-facing processor list and privacy notice.
6. **Pakistan (ACC-R24, ADR-025 Q15):** put three questions to the PK legal adviser: EU mail processor for PK companies' invoices today and after a PDP Act; PK government customers; whether the mail copy counts as a record. Until answered, PK go-live of e-mail delivery stays gated.
7. **Before PK launch:** approve a seed test to mailboxes on Gmail, Outlook/M365, Zoho, Titan and one Pakistani cPanel host, and a Nordic set, from the production domain.

## 7. Not verified

1. Brevo's 4 MB attachment note and Scaleway's 2 MB API limit come from search snippets; both help pages returned 403.
2. Mailjet's 15 MB limit: counted before or after base64.
3. Lettermint: maximum message size, polling of events by time window, company seat.
4. Mailgun: EU data-centre location, contracting entity, whether the EU region is on all plans, bounce/complaint filters in the Logs API.
5. SES: that message bodies are not retained; that SES is in scope of AWS ISO 27001 / SOC 2 reports; AWS sub-processor list; SES general availability in the AWS European Sovereign Cloud.
6. Pricing for Brevo, Mailjet and Scaleway.
7. Pakistani mailbox-provider shares and any filtering behaviour specific to Pakistani hosts; recipient-side size limits on Pakistani cPanel hosts.
8. Whether the PDP Bill moved in parliament after May 2026 (no 2026 vote found).
9. Whether ADR-025 RT-6 digests count as non-transactional for Gmail's one-click unsubscribe rule.
