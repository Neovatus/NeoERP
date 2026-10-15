// NeoERP — Platform (Super Admin) mock data.
// Shapes are the point here, not the values.

const ENVS = [
  { id: 'dev',     nm: 'Development', tone: 'neutral', note: 'Seeded data · safe to break' },
  { id: 'staging', nm: 'Staging',     tone: 'warn',    note: 'Mirrors production nightly' },
  { id: 'prod',    nm: 'Production',  tone: 'danger',  note: 'Real tenants · real payroll' },
];

// Work queue — things that need a human. Ordered by severity, then age.
const QUEUE = [
  { id: 'q1', group: 'Failed runs', sev: 'danger', title: 'Payroll run failed — 84 employees unpaid',
    sub: 'Statutory tax table missing for FY 2026–27', tenant: 'Lahore Textiles', env: 'prod', age: '18m', cta: 'Open run' },
  { id: 'q2', group: 'Failed runs', sev: 'danger', title: 'FBR filing rejected',
    sub: 'Sales tax return · invalid NTN on 3 invoices', tenant: 'Karachi Foods', env: 'prod', age: '2h', cta: 'Open filing' },
  { id: 'q3', group: 'Security', sev: 'danger', title: 'Owner account locked out',
    sub: '5 failed attempts · unlocks in 12m · Ingrid Hansen', tenant: 'Kystgruppe Nordic', env: 'prod', age: '9m', cta: 'Unlock' },
  { id: 'q4', group: 'Access requests', sev: 'warn', title: 'Manufacturing module requested',
    sub: 'Requested by Bilal Ahmed (Company Owner) · requires an agreement amendment', tenant: 'Lahore Textiles', env: 'prod', age: '1d', cta: 'Review' },
  { id: 'q5', group: 'Access requests', sev: 'warn', title: 'Seat limit exceeded — 52 of 50',
    sub: '2 users provisioned above the agreement limit', tenant: 'Karachi Foods', env: 'prod', age: '2d', cta: 'Amend agreement' },
  { id: 'q6', group: 'Blocked onboarding', sev: 'warn', title: 'Enrolled 9 days ago, never signed in',
    sub: 'No branches, no users beyond the owner invite', tenant: 'Bergen Logistikk', env: 'prod', age: '9d', cta: 'Resend invite' },
  { id: 'q7', group: 'Blocked onboarding', sev: 'warn', title: 'Franchise branch has no owner',
    sub: 'Sialkot branch marked franchised with no owner membership', tenant: 'Lahore Textiles', env: 'prod', age: '4d', cta: 'Assign owner' },
  { id: 'q8', group: 'Expiring', sev: 'danger', title: 'Pilot agreement ends in 3 days',
    sub: 'AGR-2026-047 · 14 users active · no follow-on agreement drafted', tenant: 'Stockholm Handel', env: 'prod', age: '—', cta: 'Start renewal' },
  { id: 'q10', group: 'Expiring', sev: 'warn', title: 'Agreement ends in 15 days',
    sub: 'AGR-2025-031 · manual renewal · 52 users depend on it', tenant: 'Karachi Foods', env: 'prod', age: '—', cta: 'Start renewal' },
  { id: 'q11', group: 'Expiring', sev: 'info', title: 'Renewal window open — 57 days',
    sub: 'AGR-2025-018 · manual renewal · raise the branch limit at renewal', tenant: 'Lahore Textiles', env: 'prod', age: '—', cta: 'Start renewal' },
  { id: 'q9', group: 'Expiring', sev: 'info', title: '4 invitations unaccepted for 14 days',
    sub: 'Auto-expire in 16 days', tenant: 'Kystgruppe Nordic', env: 'prod', age: '14d', cta: 'Review' },
];

const QUEUE_GROUPS = ['Failed runs', 'Security', 'Access requests', 'Blocked onboarding', 'Expiring'];


const HEALTH = [
  { nm: 'Payroll job queue', val: 'Healthy', tone: 'success', meta: '2 queued · 0 failed' },
  { nm: 'FBR integration (PK)', val: 'Degraded', tone: 'warn', meta: '3 retries in last hour' },
  { nm: 'Altinn integration (NO)', val: 'Healthy', tone: 'success', meta: 'Last sync 4m ago' },
  { nm: 'Email delivery', val: 'Healthy', tone: 'success', meta: '99.8% · 24h' },
  { nm: 'Nightly backup', val: 'Healthy', tone: 'success', meta: 'Completed 03:12' },
];

const ADOPTION = [
  { nm: 'Finance', pct: 96 }, { nm: 'HRMS', pct: 88 }, { nm: 'Payroll', pct: 81 },
  { nm: 'Inventory', pct: 64 }, { nm: 'Sales', pct: 58 }, { nm: 'Manufacturing', pct: 12 },
];

// ── Entitlements ──────────────────────────────────────────────────────
// Three levels: module → feature → per-branch override.
const ENT_BRANCHES = [
  { id: 'lhr', nm: 'Lahore HQ',   city: 'Lahore',   ownership: 'company',   owner: null, billing: 'group' },
  { id: 'fsd', nm: 'Faisalabad',  city: 'Faisalabad', ownership: 'company', owner: null, billing: 'group' },
  { id: 'sia', nm: 'Sialkot',     city: 'Sialkot',  ownership: 'franchise', owner: 'Usman Tariq', billing: 'own' },
  { id: 'khi', nm: 'Karachi South', city: 'Karachi', ownership: 'franchise', owner: 'Nadia Qureshi', billing: 'group' },
];

// The group holds the agreement; a franchisee may hold its own billing account.
const ENT_LIMITS = { users: { used: 52, limit: 50 }, branches: { used: 4, limit: 10 }, warehouses: { used: 11, limit: 20 } };

const ENT_CHANGES = [
  { when: '6 Mar 2026', who: 'Priya Raman', what: 'Payroll enabled for Sialkot and Karachi South',
    why: 'Franchisees run their own payroll', ref: 'AMD-2026-014' },
  { when: '2 Feb 2026', who: 'Priya Raman', what: 'Finance disabled for Sialkot',
    why: 'Franchisee keeps separate books with their own accountant', ref: 'AMD-2026-009' },
  { when: '14 Jan 2026', who: 'Omar Farooq', what: 'Users raised 25 → 50, Payroll added',
    why: 'Signed 12-month agreement', ref: 'AGR-2025-018' },
];

const ENT_MODULES = [
  { id: 'finance', nm: 'Finance', icon: 'layers', on: true, seats: { used: 12, limit: 25 },
    features: [
      { id: 'gl', nm: 'General ledger', on: true },
      { id: 'ar', nm: 'Receivables', on: true },
      { id: 'ap', nm: 'Payables', on: true },
      { id: 'tax-pk', nm: 'Sales tax & FBR filing', on: true, tag: 'PK' },
      { id: 'multi-cur', nm: 'Multi-currency', on: false, tag: 'Add-on' },
    ],
    overrides: { sia: 'off' } },
  { id: 'hrms', nm: 'HRMS', icon: 'users', on: true, seats: { used: 8, limit: 25 },
    features: [
      { id: 'emp', nm: 'Employee register', on: true },
      { id: 'leave', nm: 'Leave & attendance', on: true },
      { id: 'docs', nm: 'Document vault', on: true },
      { id: 'appraisal', nm: 'Appraisals', on: false, tag: 'Beta' },
    ],
    overrides: {} },
  { id: 'payroll', nm: 'Payroll', icon: 'key', on: true, seats: { used: 3, limit: 5 },
    features: [
      { id: 'runs', nm: 'Payroll runs', on: true },
      { id: 'payslips', nm: 'Payslips', on: true },
      { id: 'stat-pk', nm: 'EOBI & PESSI deductions', on: true, tag: 'PK' },
      { id: 'stat-no', nm: 'A-melding reporting', on: false, tag: 'NO' },
    ],
    overrides: { sia: 'on', khi: 'on' } },
  { id: 'inventory', nm: 'Inventory', icon: 'box', on: true, seats: { used: 21, limit: 25 },
    features: [
      { id: 'stock', nm: 'Stock by warehouse', on: true },
      { id: 'batch', nm: 'Batch & serial tracking', on: true },
      { id: 'transfer', nm: 'Inter-branch transfers', on: true },
      { id: 'purchase', nm: 'Purchasing', on: false, tag: 'Add-on' },
    ],
    overrides: { fsd: 'off' } },
  { id: 'sales', nm: 'Sales', icon: 'activity', on: true, seats: { used: 19, limit: 25 },
    features: [
      { id: 'quotes', nm: 'Quotes & orders', on: true },
      { id: 'invoice', nm: 'Invoicing', on: true },
      { id: 'pos', nm: 'Point of sale', on: true },
      { id: 'crm', nm: 'Customer records', on: true },
    ],
    overrides: {}, featOverrides: { khi: { pos: 'off' } } },
  { id: 'mfg', nm: 'Manufacturing', icon: 'grid', on: false, seats: { used: 0, limit: 0 },
    features: [
      { id: 'bom', nm: 'Bills of material', on: false },
      { id: 'wo', nm: 'Work orders', on: false },
      { id: 'qc', nm: 'Quality control', on: false, tag: 'Beta' },
    ],
    overrides: {} },
];

// ── People & memberships ──────────────────────────────────────────────
// One human, many memberships. This is the shape that matters.
const ROLE_PERMS = {
  'Super Admin':    ['platform.*', 'tenant.read', 'tenant.write', 'tenant.impersonate', 'billing.write', 'audit.read'],
  'Company Owner':  ['company.read', 'company.write', 'users.invite', 'users.write', 'finance.read', 'finance.write', 'payroll.read', 'payroll.approve', 'reports.read'],
  'Branch Owner':   ['branch.read', 'branch.write', 'users.invite', 'finance.read', 'inventory.write', 'sales.write', 'reports.read'],
  'Branch Manager': ['branch.read', 'users.read', 'inventory.write', 'sales.write', 'reports.read'],
  'HR Manager':     ['hrms.read', 'hrms.write', 'payroll.read', 'users.read'],
  'Accountant':     ['finance.read', 'finance.write', 'payroll.read', 'reports.read'],
  'Sales Person':   ['sales.read', 'sales.write', 'inventory.read'],
  'Employee':       ['self.read', 'self.write'],
};

const PEOPLE = [
  { id: 'usman', nm: 'Usman Tariq', initials: 'UT', email: 'usman@sialkotmills.pk',
    lastActive: '12 minutes ago', status: 'Active', country: 'PK',
    memberships: [
      { scope: 'branch', target: 'Sialkot', parent: 'Lahore Textiles', role: 'Branch Owner', ownership: 'franchise', by: 'Bilal Ahmed', when: '4 Jan 2026' },
      { scope: 'company', target: 'Sialkot Mills', parent: null, role: 'Company Owner', ownership: 'company', by: 'Platform', when: '2 Nov 2025' },
      { scope: 'branch', target: 'Karachi South', parent: 'Lahore Textiles', role: 'Branch Manager', ownership: 'franchise', by: 'Bilal Ahmed', when: '19 Feb 2026' },
    ],
    grants: [
      { perm: 'payroll.approve', effect: 'grant', scope: 'Sialkot', by: 'Bilal Ahmed', when: '6 Mar 2026', reason: 'Runs payroll for his own franchise' },
      { perm: 'finance.write', effect: 'revoke', scope: 'Karachi South', by: 'Bilal Ahmed', when: '19 Feb 2026', reason: 'Manager scope only — not his branch' },
    ] },
  { id: 'ingrid', nm: 'Ingrid Hansen', initials: 'IH', email: 'ingrid.hansen@kystgruppe.no',
    lastActive: 'Locked out · 9 minutes ago', status: 'Locked', country: 'NO',
    memberships: [
      { scope: 'company', target: 'Kystgruppe Nordic', parent: null, role: 'Company Owner', ownership: 'company', by: 'Platform', when: '14 Aug 2025' },
    ],
    grants: [] },
  { id: 'bilal', nm: 'Bilal Ahmed', initials: 'BA', email: 'bilal@lahoretextiles.pk',
    lastActive: '2 hours ago', status: 'Active', country: 'PK',
    memberships: [
      { scope: 'company', target: 'Lahore Textiles', parent: null, role: 'Company Owner', ownership: 'company', by: 'Platform', when: '3 Mar 2025' },
      { scope: 'branch', target: 'Lahore HQ', parent: 'Lahore Textiles', role: 'Branch Owner', ownership: 'company', by: 'Self', when: '3 Mar 2025' },
    ],
    grants: [] },
  { id: 'nadia', nm: 'Nadia Qureshi', initials: 'NQ', email: 'nadia@khisouth.pk',
    lastActive: 'Yesterday', status: 'Active', country: 'PK',
    memberships: [
      { scope: 'branch', target: 'Karachi South', parent: 'Lahore Textiles', role: 'Branch Owner', ownership: 'franchise', by: 'Bilal Ahmed', when: '11 Dec 2025' },
    ],
    grants: [
      { perm: 'reports.read', effect: 'revoke', scope: 'Karachi South', by: 'Bilal Ahmed', when: '11 Dec 2025', reason: 'Group-level reports withheld from franchisees' },
    ] },
  { id: 'priya', nm: 'Priya Raman', initials: 'PR', email: 'priya@neovatus.com',
    lastActive: 'Online now', status: 'Active', country: 'PK',
    memberships: [
      { scope: 'platform', target: 'NeoERP Platform', parent: null, role: 'Super Admin', ownership: null, by: 'Platform', when: '1 Jan 2025' },
    ],
    grants: [] },
  { id: 'sara', nm: 'Sara Lindqvist', initials: 'SL', email: 'sara@stockholmhandel.se',
    lastActive: '3 days ago', status: 'Invited', country: 'SE',
    memberships: [
      { scope: 'company', target: 'Stockholm Handel', parent: null, role: 'Company Owner', ownership: 'company', by: 'Platform', when: '2 Sep 2026' },
    ],
    grants: [] },
];

const TENANT_TREE = [
  { id: 'lahore', nm: 'Lahore Textiles', country: 'PK', users: 52,
    agreement: { ref: 'AGR-2025-018', term: '12 months', start: '2025-11-01', end: '2026-11-01', renewal: 'manual', state: 'RENEWAL', daysRemaining: 57, percentElapsed: 84 },
    entitled: ['finance', 'hrms', 'payroll', 'inventory', 'sales'],
    addenda: [
      { ref: 'AGR-2025-018-A1', branch: 'Karachi South', mods: ['mfg'], billTo: 'own',
        note: 'Franchisee bought Manufacturing on the group’s paper. Billed to their sub-account, not the group.' },
    ],
    branches: [
      { nm: 'Lahore HQ', city: 'Lahore', code: 'LHR', ownership: 'company', owner: 'Bilal Ahmed' },
      { nm: 'Faisalabad', city: 'Faisalabad', code: 'FSD', ownership: 'company', owner: null },
      { nm: 'Sialkot', city: 'Sialkot', code: 'SIA', ownership: 'franchise', owner: 'Usman Tariq',
        agreement: { ref: 'AGR-2026-055', term: '12 months', start: '2025-10-01', end: '2026-09-30', renewal: 'manual', state: 'SOON', daysRemaining: 25, percentElapsed: 93 },
        entitled: ['finance', 'hrms', 'payroll', 'inventory', 'sales', 'mfg'] },
      { nm: 'Karachi South', city: 'Karachi', code: 'KHI', ownership: 'franchise', owner: 'Nadia Qureshi' },
    ] },
  { id: 'karachi', nm: 'Karachi Foods', country: 'PK', users: 52,
    agreement: { ref: 'AGR-2025-031', term: '12 months', start: '2025-09-20', end: '2026-09-20', renewal: 'manual', state: 'SOON', daysRemaining: 15, percentElapsed: 95 },
    entitled: ['finance', 'sales', 'inventory'], addenda: [],
    branches: [
      { nm: 'Karachi Central', city: 'Karachi', code: 'KHC', ownership: 'company', owner: 'Ayesha Malik' },
      { nm: 'Hyderabad', city: 'Hyderabad', code: 'HYD', ownership: 'franchise', owner: 'Imran Shah' },
    ] },
  { id: 'kyst', nm: 'Kystgruppe Nordic', country: 'NO', users: 143,
    agreement: { ref: 'AGR-2025-004', term: '24 months', start: '2025-07-01', end: '2027-06-30', renewal: 'auto', state: 'ACTIVE', daysRemaining: 298, percentElapsed: 59 },
    entitled: ['finance', 'hrms', 'payroll', 'inventory', 'sales', 'mfg'], addenda: [],
    branches: [
      { nm: 'Oslo', city: 'Oslo', code: 'OSL', ownership: 'company', owner: 'Ingrid Hansen' },
      { nm: 'Bergen', city: 'Bergen', code: 'BGO', ownership: 'company', owner: null },
    ] },
  { id: 'sthlm', nm: 'Stockholm Handel', country: 'SE', users: 14,
    agreement: { ref: 'AGR-2026-047', term: '60-day pilot', start: '2026-07-10', end: '2026-09-08', renewal: 'manual', state: 'CRITICAL', daysRemaining: 3, percentElapsed: 95 },
    entitled: ['finance', 'sales'], addenda: [],
    branches: [{ nm: 'Stockholm', city: 'Stockholm', code: 'STO', ownership: 'company', owner: null }] },
];

// ── Company requests ─────────────────────────────────────────────────
// A request is NOT a company. Approving one opens the enrollment wizard
// pre-filled; the agreement is still the provider's decision.
const REQUESTS = [
  { id: 'r1', type: 'company', source: 'owner', status: 'New', when: '2 hours ago',
    company: 'Lahore Textiles Exports', country: 'PK', size: '30–50 staff',
    requester: { nm: 'Bilal Ahmed', email: 'bilal@lahoretextiles.pk', personId: 'bilal' },
    parent: 'Lahore Textiles', reason: 'Separate legal entity for the export business. Different NTN, own books, shares the Sialkot warehouse.',
    wants: ['finance', 'sales', 'inventory'] },
  { id: 'r2', type: 'company', source: 'owner', status: 'New', when: '1 day ago',
    company: 'Sialkot Mills', country: 'PK', size: '10–30 staff',
    requester: { nm: 'Usman Tariq', email: 'usman@sialkotmills.pk', personId: 'usman' },
    parent: null, reason: 'Incorporating my franchise as its own company. Want payroll separate from the group.',
    wants: ['finance', 'hrms', 'payroll'] },
  { id: 'r3', type: 'company', source: 'inbound', status: 'Qualified', when: '3 days ago',
    company: 'Bergen Sjømat AS', country: 'NO', size: '50–100 staff',
    requester: { nm: 'Marte Solberg', email: 'marte@bergensjomat.no', personId: null },
    parent: null, reason: 'Replacing spreadsheets. Needs A-melding reporting before January.',
    wants: ['finance', 'hrms', 'payroll', 'inventory'] },
  { id: 'r4', type: 'company', source: 'inbound', status: 'New', when: '4 days ago',
    company: 'Quick Mart', country: 'PK', size: '1–10 staff',
    requester: { nm: 'A. Khan', email: 'akhan.free@gmail.com', personId: null },
    parent: null, reason: 'need pos system price?',
    wants: ['sales'] },
];

// Branch requests. A branch carries module access and a billing arrangement,
// so creating one is an entitlement event — hence request-only.
const BRANCH_REQUESTS = [
  { id: 'b1', type: 'branch', status: 'New', when: '35 minutes ago',
    company: 'Lahore Textiles', branch: 'Multan', city: 'Multan', code: 'MUL',
    ownership: 'company', proposedOwner: null, billing: 'group',
    requester: { nm: 'Bilal Ahmed', email: 'bilal@lahoretextiles.pk', personId: 'bilal' },
    wants: 'inherit', withinLimit: true,
    reason: 'Third company-owned outlet. Same setup as Faisalabad — nothing special.' },
  { id: 'b2', type: 'branch', status: 'New', when: '6 hours ago',
    company: 'Lahore Textiles', branch: 'Gujranwala', city: 'Gujranwala', code: 'GUJ',
    ownership: 'franchise', proposedOwner: { nm: 'Farhan Iqbal', email: 'farhan@gujranwalatex.pk', personId: null }, billing: 'own',
    requester: { nm: 'Bilal Ahmed', email: 'bilal@lahoretextiles.pk', personId: 'bilal' },
    wants: ['finance', 'sales', 'inventory', 'payroll'], withinLimit: true,
    reason: 'Franchise agreement signed with Farhan Iqbal. He runs his own payroll and wants his own invoice from you, not from us.' },
  { id: 'b3', type: 'branch', status: 'New', when: '2 days ago',
    company: 'Kystgruppe Nordic', branch: 'Trondheim', city: 'Trondheim', code: 'TRD',
    ownership: 'company', proposedOwner: null, billing: 'group',
    requester: { nm: 'Ingrid Hansen', email: 'ingrid.hansen@kystgruppe.no', personId: 'ingrid' },
    wants: 'inherit', withinLimit: false, limitNote: '2 of 2 branches used — the agreement caps branches here, needs the ceiling raised first',
    reason: 'Opening the Trondheim site in November. Blocked from adding it ourselves.' },
];

const REQ_STATUSES = ['New', 'Contacted', 'Qualified', 'Approved', 'Declined'];

const VIEW_ROLES = ['Company Owner', 'Branch Owner', 'Branch Manager', 'HR Manager', 'Accountant', 'Sales Person', 'Employee'];

// RULES §15 — requests are one inbox, so there is one count. The KPI, the
// sidebar badge and the inbox header all read this; three tallies of the same
// queue is how a dashboard ends up disagreeing with the page it links to.
function isOpenRequest(r) {
  return !!r && r.status !== 'Approved' && r.status !== 'Declined';
}

function openRequests() {
  const a = (typeof REQUESTS !== 'undefined' ? REQUESTS : []).filter(isOpenRequest);
  const b = (typeof BRANCH_REQUESTS !== 'undefined' ? BRANCH_REQUESTS : []).filter(isOpenRequest);
  return a.length + b.length;
}

// Derived, not typed. A hardcoded headline number stops matching the tables
// under it the first time the data changes, and then nothing on the page agrees.
const PLATFORM_KPIS = (() => {
  const branches = TENANT_TREE.reduce((n, t) => n + (t.branches || []).length, 0);
  const users = TENANT_TREE.reduce((n, t) => n + (t.users || 0), 0);
  return [
    { label: 'Companies', value: String(TENANT_TREE.length), delta: `${TENANT_TREE.filter(t => t.country === 'PK').length} PK · ${TENANT_TREE.filter(t => t.country !== 'PK').length} Nordic` },
    { label: 'Branches', value: String(branches), delta: `${TENANT_TREE.reduce((n, t) => n + (t.branches || []).filter(b => b.ownership === 'franchise').length, 0)} franchised` },
    { label: 'Users', value: String(users), delta: 'across all tenants' },
    { label: 'Open requests', value: String(openRequests()), delta: 'awaiting a decision', urgent: true },
  ];
})();

Object.assign(window, {
  ENVS, QUEUE, QUEUE_GROUPS, PLATFORM_KPIS, HEALTH, ADOPTION,
  ENT_BRANCHES, ENT_MODULES, ROLE_PERMS, PEOPLE, TENANT_TREE, VIEW_ROLES,
  REQUESTS, BRANCH_REQUESTS, REQ_STATUSES, ENT_LIMITS, ENT_CHANGES, openRequests, isOpenRequest,
});
