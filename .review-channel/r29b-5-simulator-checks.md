# Simulator checks R29b-5 (audit + auth company isolation)

| Check | Device/user | Result | What you saw |
|---|---|---|---|
| 1 Company Activity list + filters | iPad Pro 13 / ola.nordmann | PASS | Company > Activity loads the Activity log (Kystgruppe entries, tax code/journal/bill events, today's QA rows); the Accounts filter narrows the list; Load older events offered; no error |
| 2 Notification inbox, mark read | iPad Pro 13 / ola.nordmann | N-A | Bell in the top bar does nothing when tapped (no click handler in NeoSmartTopBar.kt); InboxFeatureScreen is not routed anywhere; no inbox entry in the sidebar |
| 3 Platform audit view | iPhone 18 Pro / superadmin | PASS | Platform admin > Audit log opens: 360 entries last 7 days, 50 loaded, filter chips and search shown; no 503/error. Note: category chips show Everything 50 / Other 50 and all named categories 0 (not checked against the earlier build) |
| 4 Notification attempts / retry, then staff-retry row in Ola's Activity | iPhone 18 Pro / superadmin | N-A | Looked in the Platform admin menu (Companies, Agreements, Requests, People, Staff, Platform roles, Standard roles, Chart templates, Audit log), Profile, Settings, the bell (inert); no notification attempts view or retry exists in the app |
| 5 Ola sees no other company's audit entries | iPad Pro 13 / ola.nordmann | PASS | All Activity rows (All and Accounts filters) are Kystgruppe actors/system; no Lahore Textiles or Stockholm Handel text. Rows show only user ids, so this is a text spot check only |

Superadmin was used as the staff user (a Neovatus Super Admin, scope every company); demo-token script ran without a password prompt.
Minutes spent: ~2. No FAIL, so no screenshots.
