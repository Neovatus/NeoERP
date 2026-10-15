// NeoERP — Super Admin Users (list, invite, detail)

function SuperAdminUsers({ goto }) {
  const { ADMIN_USERS } = window.MOCK;
  const [q, setQ] = useState('');
  const [role, setRole] = useState('all');
  const [openInvite, setOpenInvite] = useState(false);
  const filtered = ADMIN_USERS.filter(u =>
    (role === 'all' || u.role === role) &&
    (u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()))
  );
  const counts = {
    total: ADMIN_USERS.length,
    active: ADMIN_USERS.filter(u => u.status === 'Active').length,
    pending: ADMIN_USERS.filter(u => u.status === 'Pending').length,
  };

  return (
    <div className="page">
      <PageHead
        title="Super Admin Users"
        crumbs={['Platform Admin','IAM / RBAC','Super Admins']}
        actions={
          <button className="btn btn-primary" onClick={() => setOpenInvite(true)}>
            <Icon name="plus" size={14}/> Invite Admin
          </button>
        }
      />
      <div className="stats-grid">
        <Stat icon="shield" value={counts.total} label="Total Admins"/>
        <Stat icon="checkCircle" value={counts.active} label="Active"/>
        <Stat icon="mail" value={counts.pending} label="Pending Invites"/>
      </div>

      <div className="card">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="input-wrap" style={{ flex: 1 }}>
            <span className="leading"><Icon name="search" size={16}/></span>
            <input className="input has-icon" placeholder="Search by name or email…" value={q} onChange={e => setQ(e.target.value)}/>
          </div>
          <select className="input" style={{ width: 160 }} value={role} onChange={e => setRole(e.target.value)}>
            <option value="all">All roles</option>
            <option value="Owner">Owner</option>
            <option value="Admin">Admin</option>
            <option value="Support">Support</option>
            <option value="Read-only">Read-only</option>
          </select>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: '32%' }}>User</th>
              <th>Role</th>
              <th>Scope</th>
              <th>Last sign-in</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} style={{ cursor: 'pointer' }} onClick={() => goto('adminUser', { id: u.id })}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="avatar" style={{ width: 36, height: 36, fontSize: 13 }}>{u.initials}</div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600 }}>{u.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td data-label="Role"><RolePill role={u.role}/></td>
                <td data-label="Scope" style={{ fontSize: 13 }}>{u.scope === 'all' ? <span className="muted">All companies</span> : `${u.scope.length} compan${u.scope.length === 1 ? 'y' : 'ies'}`}</td>
                <td data-label="Last sign-in" style={{ fontSize: 13, color: 'var(--fg-3)' }}>{u.lastSignIn}</td>
                <td data-label="Status"><Pill tone={u.status === 'Active' ? 'success' : u.status === 'Pending' ? 'warn' : 'danger'}>{u.status}</Pill></td>
                <td data-label="" onClick={e => e.stopPropagation()}>
                  <button className="btn btn-secondary btn-sm">Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InviteAdminModal open={openInvite} onClose={() => setOpenInvite(false)}/>
    </div>
  );
}

function RolePill({ role }) {
  const tone = role === 'Owner' ? 'fg' : role === 'Admin' ? 'neutral' : role === 'Support' ? 'success' : 'muted';
  return <Pill tone={tone}>{role}</Pill>;
}

function InviteAdminModal({ open, onClose }) {
  const { COMPANIES } = window.MOCK;
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Admin');
  const [scopeMode, setScopeMode] = useState('all');
  const [picked, setPicked] = useState([]);
  const [enforce2FA, setEnforce2FA] = useState(true);
  const valid = name.trim() && /\S+@\S+\.\S+/.test(email);

  const reset = () => { setName(''); setEmail(''); setRole('Admin'); setScopeMode('all'); setPicked([]); setEnforce2FA(true); };

  return (
    <Modal
      open={open}
      onClose={() => { onClose(); reset(); }}
      title="Invite Super Admin"
      width={620}
      footer={<>
        <button className="btn btn-secondary" onClick={() => { onClose(); reset(); }}>Cancel</button>
        <button className="btn btn-primary" disabled={!valid}
          onClick={() => { toast({ title: 'Invitation sent', sub: email }); onClose(); reset(); }}>
          <Icon name="mail" size={14}/> Send invitation
        </button>
      </>}>
      <p style={{ margin: '0 0 18px', fontSize: 13.5, color: 'var(--fg-3)', lineHeight: 1.5 }}>
        They'll receive an email to set a password and complete sign-in.
      </p>
      <div className="rgrid rgrid-2">
        <Field label="Full Name"><input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe"/></Field>
        <Field label="Email"><input className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@neoerp.com"/></Field>
      </div>
      <Field label="Role" style={{ marginTop: 14 }}>
        <div className="role-grid">
          {[
            { id: 'Owner', desc: 'Full control of the platform' },
            { id: 'Admin', desc: 'Manage tenants, users, modules' },
            { id: 'Support', desc: 'Read + limited write across tenants' },
            { id: 'Read-only', desc: 'View everything; cannot edit' },
          ].map(r => (
            <button key={r.id} type="button" className={`role-card ${role === r.id ? 'on' : ''}`} onClick={() => setRole(r.id)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 13.5 }}>
                <span className="radio-dot"/>{r.id}
              </div>
              <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 4 }}>{r.desc}</div>
            </button>
          ))}
        </div>
      </Field>
      <Field label="Company scope" style={{ marginTop: 14 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <button type="button" className={`btn ${scopeMode === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setScopeMode('all')}>All companies</button>
          <button type="button" className={`btn ${scopeMode === 'specific' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setScopeMode('specific')}>Specific companies</button>
        </div>
        {scopeMode === 'specific' && (
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-md)', maxHeight: 160, overflow: 'auto' }}>
            {COMPANIES.map(c => (
              <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}>
                <input type="checkbox" checked={picked.includes(c.id)} onChange={e => setPicked(e.target.checked ? [...picked, c.id] : picked.filter(x => x !== c.id))}/>
                <div style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--bg-soft)', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 700 }}>{c.code.slice(0,2)}</div>
                <div style={{ fontSize: 13 }}>{c.name}</div>
                <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--fg-3)' }}>{c.code}</div>
              </label>
            ))}
          </div>
        )}
      </Field>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, padding: 12, background: 'var(--bg-soft)', borderRadius: 'var(--r-md)' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Enforce 2FA</div>
          <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>Require an authenticator app on first sign-in.</div>
        </div>
        <Switch checked={enforce2FA} onChange={setEnforce2FA}/>
      </div>
    </Modal>
  );
}

function AdminUserDetail({ id, goto }) {
  const { ADMIN_USERS, COMPANIES } = window.MOCK;
  const u = ADMIN_USERS.find(x => x.id === id) || ADMIN_USERS[0];
  const [tab, setTab] = useState('overview');
  const [role, setRole] = useState(u.role);
  const [scopeMode, setScopeMode] = useState(u.scope === 'all' ? 'all' : 'specific');
  const [picked, setPicked] = useState(u.scope === 'all' ? [] : u.scope);
  const [confirmAction, setConfirmAction] = useState(null);
  const toast = useToast();
  // Platform authority and its scope are the two things a Neovatus staff
  // account can do platform-wide — the backend already mandates a reason
  // and audits both; the design never asked for one.
  const { request, modal: reasonModal } = useReasonGate(({ label, sub, reason }) => {
    toast && toast({ title: label, sub: `${sub} Reason: “${reason}”` });
  });

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <button className="icon-btn" onClick={() => goto('adminUsers')}><Icon name="arrowL" size={16}/></button>
        <div className="page-crumbs">
          <span style={{ color: 'var(--fg-3)', cursor: 'pointer' }} onClick={() => goto('adminUsers')}>Super Admin Users</span>
          <span className="sep">/</span>
          <span className="here">{u.name}</span>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="avatar" style={{ width: 56, height: 56, fontSize: 18 }}>{u.initials}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>{u.name}</div>
              <RolePill role={u.role}/>
              <Pill tone={u.status === 'Active' ? 'success' : u.status === 'Pending' ? 'warn' : 'danger'}>{u.status}</Pill>
            </div>
            <div style={{ fontSize: 13, color: 'var(--fg-3)', marginTop: 2 }}>{u.email}</div>
            <div style={{ display: 'flex', gap: 18, marginTop: 10, fontSize: 12.5, color: 'var(--fg-3)' }}>
              <span>Last sign-in: <b style={{ color: 'var(--fg-1)' }}>{u.lastSignIn}</b></span>
              <span>Joined: <b style={{ color: 'var(--fg-1)' }}>{u.joined}</b></span>
              <span>2FA: <b style={{ color: 'var(--fg-1)' }}>{u.twofa ? 'On' : 'Off'}</b></span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={() => toast({ title: 'Password reset link sent', sub: u.email })}>
              <Icon name="key" size={14}/> Reset password
            </button>
            {u.status === 'Active' ? (
              <button className="btn btn-danger" onClick={() => setConfirmAction('suspend')}>Suspend</button>
            ) : (
              <button className="btn btn-secondary" onClick={() => setConfirmAction('activate')}>Activate</button>
            )}
          </div>
        </div>
      </div>

      <div className="tabs" style={{ maxWidth: 580, margin: '0 0 24px' }}>
        {[['overview','Overview'],['permissions','Permissions'],['scope','Company Scope'],['activity','Activity']].map(([k,l]) => (
          <button key={k} className={`tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="rgrid rgrid-7-5">
          <div className="card">
            <div className="card-head"><div className="card-title">User Information</div></div>
            <div className="card-pad">
              <dl className="kv">
                <dt>User ID</dt><dd style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5 }}>{u.id}</dd>
                <dt>Name</dt><dd>{u.name}</dd>
                <dt>Email</dt><dd>{u.email}</dd>
                <dt>Role</dt><dd><RolePill role={u.role}/></dd>
                <dt>Status</dt><dd><Pill tone={u.status === 'Active' ? 'success' : 'warn'}>{u.status}</Pill></dd>
                <dt>2FA</dt><dd>{u.twofa ? 'Enabled' : 'Disabled'}</dd>
                <dt>Joined</dt><dd>{u.joined}</dd>
                <dt>Last sign-in</dt><dd>{u.lastSignIn}</dd>
              </dl>
            </div>
          </div>
          <div className="card card-pad">
            <div className="card-title" style={{ marginBottom: 12 }}>Quick stats</div>
            <div className="rgrid rgrid-2">
              <div style={{ padding: 14, background: 'var(--bg-soft)', borderRadius: 'var(--r-md)' }}>
                <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>Companies in scope</div>
                <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4, letterSpacing: '-0.02em' }}>{u.scope === 'all' ? COMPANIES.length : u.scope.length}</div>
              </div>
              <div style={{ padding: 14, background: 'var(--bg-soft)', borderRadius: 'var(--r-md)' }}>
                <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>Actions (30d)</div>
                <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4, letterSpacing: '-0.02em' }}>{u.actions30d}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'permissions' && (
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Role & permissions</div>
              <div className="card-sub">Pick a role; we'll apply the matching permission set.</div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => request({
              kind: 'grant-role',
              label: 'Role updated',
              sub: `${u.name} is now ${role}`,
              reasonHint: 'Granting platform authority is audited — why is this admin becoming this role?',
              reasonPlaceholder: `Promoted to cover ${u.name.split(' ')[0]}'s region`,
              apply: () => {},
            })}>Save</button>
          </div>
          <div className="card-pad">
            <div className="role-grid">
              {[
                { id: 'Owner', desc: 'Full control of the platform' },
                { id: 'Admin', desc: 'Manage tenants, users, modules' },
                { id: 'Support', desc: 'Read + limited write across tenants' },
                { id: 'Read-only', desc: 'View everything; cannot edit' },
              ].map(r => (
                <button key={r.id} type="button" className={`role-card ${role === r.id ? 'on' : ''}`} onClick={() => setRole(r.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 13.5 }}>
                    <span className="radio-dot"/>{r.id}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 4 }}>{r.desc}</div>
                </button>
              ))}
            </div>
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>What this role can do</div>
              <PermissionMatrix role={role}/>
            </div>
          </div>
        </div>
      )}

      {tab === 'scope' && (
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Company scope</div>
              <div className="card-sub">Which tenants this admin can manage.</div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => request({
              kind: 'grant-scope',
              label: 'Scope updated',
              sub: scopeMode === 'all' ? 'All companies' : `${picked.length} companies`,
              reasonHint: 'Widening or narrowing what this admin can touch is audited.',
              reasonPlaceholder: 'Taking over EMEA accounts',
              apply: () => {},
            })}>Save</button>
          </div>
          <div className="card-pad">
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button className={`btn ${scopeMode === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setScopeMode('all')}>All companies</button>
              <button className={`btn ${scopeMode === 'specific' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setScopeMode('specific')}>Specific companies</button>
            </div>
            {scopeMode === 'specific' && (
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
                {COMPANIES.map((c, i) => (
                  <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', cursor: 'pointer', borderTop: i === 0 ? '0' : '1px solid var(--border)' }}>
                    <input type="checkbox" checked={picked.includes(c.id)} onChange={e => setPicked(e.target.checked ? [...picked, c.id] : picked.filter(x => x !== c.id))}/>
                    <div className="avatar sq" style={{ width: 30, height: 30, fontSize: 11 }}>{c.code.slice(0,2)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 500 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>{c.code} · {c.branches} branches</div>
                    </div>
                    <Pill tone={c.status === 'Active' ? 'success' : 'warn'}>{c.status}</Pill>
                  </label>
                ))}
              </div>
            )}
            {scopeMode === 'all' && (
              <div style={{ padding: 16, background: 'var(--bg-soft)', borderRadius: 'var(--r-md)', fontSize: 13.5, color: 'var(--fg-2)' }}>
                <Icon name="checkCircle" size={16}/> &nbsp;This admin can access all <b>{COMPANIES.length}</b> companies and any future enrollments.
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'activity' && (
        <div className="card">
          <div className="card-head"><div className="card-title">Activity</div></div>
          <div className="card-pad">
            <div className="activity">
              {u.activity.map((a, i) => (
                <div key={i} className="activity-item">
                  <span className={`pin ${a.kind === 'warn' ? 'warn' : ''}`}/>
                  <div style={{ flex: 1 }}>
                    <h4>{a.title}</h4>
                    <p>{a.detail}</p>
                  </div>
                  <span className="when">{a.when}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Modal
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={confirmAction === 'suspend' ? 'Suspend this admin?' : 'Activate this admin?'}
        footer={<>
          <button className="btn btn-secondary" onClick={() => setConfirmAction(null)}>Cancel</button>
          <button className={`btn ${confirmAction === 'suspend' ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => { setConfirmAction(null); toast({ title: confirmAction === 'suspend' ? 'Admin suspended' : 'Admin activated', sub: u.email }); }}>
            {confirmAction === 'suspend' ? 'Suspend' : 'Activate'}
          </button>
        </>}>
        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--fg-2)', lineHeight: 1.5 }}>
          {confirmAction === 'suspend'
            ? `${u.name} will lose access immediately. Active sessions are revoked.`
            : `${u.name} will regain access at their previous role and scope.`}
        </p>
      </Modal>
      {reasonModal}
    </div>
  );
}

function PermissionMatrix({ role }) {
  const M = {
    'Owner':     { Tenants: 'manage', Users: 'manage', Modules: 'manage', Billing: 'manage', Audit: 'view' },
    'Admin':     { Tenants: 'manage', Users: 'manage', Modules: 'manage', Billing: 'view',   Audit: 'view' },
    'Support':   { Tenants: 'limited',Users: 'view',   Modules: 'view',   Billing: 'none',   Audit: 'view' },
    'Read-only': { Tenants: 'view',   Users: 'view',   Modules: 'view',   Billing: 'none',   Audit: 'view' },
  };
  const row = M[role] || M['Admin'];
  const tone = (v) => v === 'manage' ? 'success' : v === 'view' ? 'neutral' : v === 'limited' ? 'warn' : 'muted';
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
      {Object.entries(row).map(([k,v], i) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', borderTop: i === 0 ? '0' : '1px solid var(--border)', alignItems: 'center' }}>
          <span style={{ fontSize: 13.5, fontWeight: 500 }}>{k}</span>
          <Pill tone={tone(v)}>{v === 'none' ? 'No access' : v.charAt(0).toUpperCase() + v.slice(1)}</Pill>
        </div>
      ))}
    </div>
  );
}

window.SuperAdminUsers = SuperAdminUsers;
window.AdminUserDetail = AdminUserDetail;
