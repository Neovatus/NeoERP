// NeoERP — Mock data
const MODULES = [
  { id: 'core',    name: 'Core Platform',     desc: 'Core platform shell and foundational app behavior' },
  { id: 'iam',     name: 'Identity & Access', desc: 'Users, memberships, roles, permissions, and onboarding' },
  { id: 'org',     name: 'Organization',      desc: 'Company, branch, and warehouse management' },
  { id: 'acc',     name: 'Accounts',          desc: 'Chart of accounts, journals, fiscal years, periods, reports' },
  { id: 'pay',     name: 'Payroll',           desc: 'Payroll structures, periods, runs, payslips, tax, statutory' },
  { id: 'hrms',    name: 'HRMS',              desc: 'Employees, leave, attendance, shifts, holidays, performance' },
  { id: 'inv',     name: 'Inventory',         desc: 'Items, stock, transfers, valuation, replenishment' },
  { id: 'crm',     name: 'CRM',               desc: 'Leads, contacts, deals, pipelines, communications' },
  { id: 'pos',     name: 'POS',               desc: 'Point of sale, registers, shifts, receipts' },
  { id: 'fin',     name: 'Finance',           desc: 'Budgets, cost centers, consolidations, AP/AR' },
];

const COMPANIES = [
  {
    id: 'lahore', name: 'Lahore Textiles', code: 'LHTX', status: 'Active',
    branches: 4, warehouses: 6, employees: 52,
    legal: 'Lahore Textiles (Pvt) Ltd', email: 'bilal@lahoretextiles.pk', phone: '+92 42 3576 1200',
    address: '14 Ferozepur Road', city: 'Lahore', state: 'Punjab', country: 'PK', postal: '54600',
    taxMode: 'TAXABLE', taxId: '3520112345678', registration: 'PK-SECP-0114523',
    enrolled: '2025-11-01',
    agreement: { ref: 'AGR-2025-018', term: '12 months', start: '2025-11-01', end: '2026-11-01', renewal: 'manual', state: 'RENEWAL', daysRemaining: 57, percentElapsed: 84 },
    modules: ['core','iam','org','acc','fin','hrms','pay','inv','crm','pos'],
    branchList: [
      { name: 'Lahore HQ', code: 'LHR', city: 'Lahore', status: 'Active' },
      { name: 'Faisalabad', code: 'FSD', city: 'Faisalabad', status: 'Active' },
      { name: 'Sialkot', code: 'SIA', city: 'Sialkot', status: 'Active' },
      { name: 'Karachi South', code: 'KHI', city: 'Karachi', status: 'Active' },
    ],
    warehouseList: [
      { name: 'Ferozepur Mill Store', code: 'LHR-WH1', type: 'WAREHOUSE', branch: 'Lahore HQ', status: 'Active' },
      { name: 'Faisalabad Yard', code: 'FSD-WH1', type: 'WAREHOUSE', branch: 'Faisalabad', status: 'Active' },
    ],
    activity: [
      { kind: 'system', when: '10 months ago', title: 'Company enrolled under AGR-2025-018', who: 'sana@neovatus.com' },
      { kind: 'event',  when: '9 months ago',  title: 'Owner accepted invitation: Bilal Ahmed', who: 'system' },
      { kind: 'event',  when: '4 days ago',    title: 'Branch created: Sialkot (franchised)', who: 'sana@neovatus.com' },
      { kind: 'warn',   when: 'Today',         title: 'Manufacturing enabled outside agreement', who: 'sana@neovatus.com' },
    ],
  },
  {
    id: 'karachi', name: 'Karachi Foods', code: 'KHFD', status: 'Active',
    branches: 2, warehouses: 3, employees: 52,
    legal: 'Karachi Foods Ltd', email: 'ayesha@karachifoods.pk', phone: '+92 21 3455 8800',
    address: 'Plot 42, SITE Area', city: 'Karachi', state: 'Sindh', country: 'PK', postal: '75700',
    taxMode: 'TAXABLE', taxId: '4220198765432', registration: 'PK-SECP-0098871',
    enrolled: '2025-09-20',
    agreement: { ref: 'AGR-2025-031', term: '12 months', start: '2025-09-20', end: '2026-09-20', renewal: 'manual', state: 'SOON', daysRemaining: 15, percentElapsed: 95 },
    modules: ['core','iam','org','acc','fin','inv','crm','pos'],
    branchList: [
      { name: 'Karachi Central', code: 'KHC', city: 'Karachi', status: 'Active' },
      { name: 'Hyderabad', code: 'HYD', city: 'Hyderabad', status: 'Active' },
    ],
    warehouseList: [
      { name: 'SITE Cold Store', code: 'KHC-WH1', type: 'WAREHOUSE', branch: 'Karachi Central', status: 'Active' },
    ],
    activity: [
      { kind: 'system', when: '12 months ago', title: 'Company enrolled under AGR-2025-031', who: 'sana@neovatus.com' },
      { kind: 'warn',   when: '2 days ago',    title: 'Seat limit exceeded — 52 of 50', who: 'system' },
    ],
  },
  {
    id: 'kyst', name: 'Kystgruppe Nordic', code: 'KYST', status: 'Active',
    branches: 2, warehouses: 6, employees: 143,
    legal: 'Kystgruppe Nordic AS', email: 'ingrid.hansen@kystgruppe.no', phone: '+47 555 12 312',
    address: 'Bryggen 8', city: 'Bergen', state: 'Vestland', country: 'NO', postal: '5003',
    taxMode: 'TAXABLE', taxId: '912 345 678', registration: 'NO-912345678',
    enrolled: '2025-07-01',
    agreement: { ref: 'AGR-2025-004', term: '24 months', start: '2025-07-01', end: '2027-06-30', renewal: 'auto', state: 'ACTIVE', daysRemaining: 298, percentElapsed: 59 },
    modules: ['core','iam','org','acc','fin','hrms','pay','inv','crm','pos'],
    branchList: [
      { name: 'Oslo', code: 'OSL', city: 'Oslo', status: 'Active' },
      { name: 'Bergen', code: 'BGO', city: 'Bergen', status: 'Active' },
    ],
    warehouseList: [
      { name: 'Bergen Kaianlegg', code: 'BGO-WH1', type: 'WAREHOUSE', branch: 'Bergen', status: 'Active' },
      { name: 'Oslo Distribusjon', code: 'OSL-WH1', type: 'WAREHOUSE', branch: 'Oslo', status: 'Active' },
    ],
    activity: [
      { kind: 'system', when: '14 months ago', title: 'Company enrolled under AGR-2025-004', who: 'erik@neovatus.com' },
      { kind: 'event',  when: '3 days ago',    title: 'User limit raised 120 → 160', who: 'erik@neovatus.com' },
      { kind: 'warn',   when: '9 minutes ago', title: 'Owner account locked out: Ingrid Hansen', who: 'system' },
    ],
  },
  {
    id: 'sthlm', name: 'Stockholm Handel', code: 'STHL', status: 'Pending',
    branches: 1, warehouses: 0, employees: 14,
    legal: 'Stockholm Handel AB', email: 'anna.berg@sthlmhandel.se', phone: '+46 8 555 010',
    address: 'Kungsgatan 44', city: 'Stockholm', state: 'Stockholm', country: 'SE', postal: '111 35',
    taxMode: 'TAXABLE', taxId: 'SE556677889901', registration: 'SE-556677-8899',
    enrolled: '2026-07-10',
    agreement: { ref: 'AGR-2026-047', term: '60-day pilot', start: '2026-07-10', end: '2026-09-08', renewal: 'manual', state: 'CRITICAL', daysRemaining: 3, percentElapsed: 95 },
    modules: ['core','iam','org','acc','fin','crm','pos'],
    branchList: [
      { name: 'Stockholm', code: 'STO', city: 'Stockholm', status: 'Active' },
    ],
    warehouseList: [],
    activity: [
      { kind: 'system', when: '2 months ago', title: 'Pilot enrolled under AGR-2026-047', who: 'sana@neovatus.com' },
      { kind: 'warn',   when: '2 days ago',   title: 'Pilot agreement ends in 3 days — no follow-on drafted', who: 'system' },
    ],
  },
];

const ADMINS = [
  {
    id: 'naomi', name: 'Naomi Eide', email: 'naomi@neovatus.com',
    role: 'Owner', status: 'Active', mfa: true, lastLogin: '2 minutes ago',
    scope: 'all', companies: 'All',
    avatar: 'N', tone: 'fg',
  },
  {
    id: 'mateo', name: 'Mateo Solberg', email: 'mateo@neovatus.com',
    role: 'Admin', status: 'Active', mfa: true, lastLogin: '14 minutes ago',
    scope: 'all', companies: 'All',
    avatar: 'M',
  },
  {
    id: 'priya', name: 'Priya Anand', email: 'priya@neovatus.com',
    role: 'Support', status: 'Active', mfa: true, lastLogin: '3 hours ago',
    scope: 'scoped', companies: 'Lahore Textiles, Karachi Foods',
    avatar: 'P',
  },
  {
    id: 'lukas', name: 'Lukas Berg', email: 'lukas@neovatus.com',
    role: 'Read-only', status: 'Active', mfa: false, lastLogin: 'Yesterday',
    scope: 'scoped', companies: 'Kystgruppe Nordic',
    avatar: 'L',
  },
  {
    id: 'ingrid', name: 'Ingrid Holt', email: 'ingrid@neovatus.com',
    role: 'Admin', status: 'Invited', mfa: false, lastLogin: '—',
    scope: 'all', companies: 'All',
    avatar: 'I',
  },
  {
    id: 'tomas', name: 'Tomas Riis', email: 'tomas@neovatus.com',
    role: 'Support', status: 'Suspended', mfa: true, lastLogin: '11 days ago',
    scope: 'scoped', companies: 'Stockholm Handel',
    avatar: 'T',
  },
];

const PERMISSIONS = [
  { group: 'Companies', items: [
    ['view','View companies'],['create','Enroll companies'],['edit','Edit company details'],['suspend','Suspend / activate'],['delete','Delete companies'],
  ]},
  { group: 'Modules',  items: [
    ['mod_view','View module access'],['mod_toggle','Enable / disable modules'],
  ]},
  { group: 'Users', items: [
    ['u_view','View users'],['u_invite','Invite users'],['u_role','Change roles'],['u_suspend','Suspend / activate users'],
  ]},
  { group: 'Platform', items: [
    ['logs','View activity logs'],['settings','Edit platform settings'],['billing','View billing & plans'],
  ]},
];

// Enrollment trend (companies enrolled per month, last 12 months)
const ENROLLMENT_TREND = [1, 2, 1, 3, 2, 4, 3, 5, 4, 3, 5, 6];

// Module adoption across tenants (count of companies with module enabled)
const MODULE_ADOPTION = MODULES.map(m => ({
  id: m.id, name: m.name,
  count: COMPANIES.filter(c => c.modules.includes(m.id)).length,
}));

// Aliases — components reference both shapes
const ADMIN_USERS = ADMINS;

window.MOCK = { MODULES, COMPANIES, ADMINS, ADMIN_USERS, PERMISSIONS, ENROLLMENT_TREND, MODULE_ADOPTION };
