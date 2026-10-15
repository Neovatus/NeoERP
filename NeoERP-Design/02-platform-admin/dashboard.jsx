// NeoERP — Super Admin Dashboard

function Dashboard({ goto }) {
  const { COMPANIES, ADMIN_USERS, ENROLLMENT_TREND, MODULE_ADOPTION } = window.MOCK;
  const totals = {
    companies: COMPANIES.length,
    active: COMPANIES.filter(c => c.status === 'Active').length,
    pending: COMPANIES.filter(c => c.status === 'Pending').length,
    suspended: COMPANIES.filter(c => c.status === 'Suspended').length,
    branches: COMPANIES.reduce((s,c) => s+c.branches, 0),
    warehouses: COMPANIES.reduce((s,c) => s+c.warehouses, 0),
    admins: ADMIN_USERS.length,
    pendingInvites: ADMIN_USERS.filter(u => u.status === 'Pending').length,
  };
  const recent = [...COMPANIES].slice(0, 4);
  const actions = [
    { kind: 'invite', title: '1 admin invitation pending', sub: 'emil@neoerp.com — sent 2 days ago', cta: 'Resend', tone: 'warn' },
    { kind: 'billing', title: 'Aurora Retail suspended for billing', sub: 'Outstanding balance · escalate to billing team', cta: 'Review', tone: 'danger' },
    { kind: 'enroll', title: 'Fjord Logistics awaiting first sign-in', sub: 'Invited 5 days ago', cta: 'Nudge', tone: 'warn' },
    { kind: '2fa', title: '1 admin without 2FA', sub: 'Sara Holm — read-only · enforce on next sign-in', cta: 'Enforce', tone: 'neutral' },
  ];
  const activity = [
    { title: 'Enrolled Nordic Foods', who: 'niko@neoerp.com', when: '9 days ago' },
    { title: 'Added branch: Tromsø (Nordic Foods)', who: 'maria@neoerp.com', when: '8 days ago' },
    { title: 'Enabled Inventory for Nordic Foods', who: 'maria@neoerp.com', when: '6 days ago' },
    { title: 'Invited admin: emil@neoerp.com', who: 'maria@neoerp.com', when: '2 days ago' },
    { title: 'Suspended Aurora Retail', who: 'niko@neoerp.com', when: '12 days ago', kind: 'warn' },
    { title: 'Reset password for sara@devco.no', who: 'jonas@neoerp.com', when: '4 days ago' },
  ];

  return (
    <div className="page">
      <PageHead
        title="Super Admin Dashboard"
        crumbs={['Overview','Dashboard']}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={() => goto('adminUsers')}><Icon name="shield" size={14}/> Manage Admins</button>
            <button className="btn btn-primary" onClick={() => goto('enroll')}><Icon name="plus" size={14}/> Enroll Company</button>
          </div>
        }
      />

      <div className="kpi-grid">
        <Kpi label="Total Companies" value={totals.companies} delta="+2 this month" trend="up" icon="building"/>
        <Kpi label="Active" value={totals.active} delta={`${totals.pending} pending · ${totals.suspended} suspended`} icon="checkCircle"/>
        <Kpi label="Branches" value={totals.branches} delta={`${totals.warehouses} warehouses`} icon="map"/>
        <Kpi label="Super Admins" value={totals.admins} delta={`${totals.pendingInvites} pending invite`} icon="shield"/>
      </div>

      <div className="dash-row dash-2-1" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Tenant enrollments</div>
              <div className="card-sub">Last 12 weeks</div>
            </div>
            <select className="input" style={{ width: 140, height: 34 }}>
              <option>Weekly</option><option>Monthly</option>
            </select>
          </div>
          <div className="card-pad">
            <BarChart data={ENROLLMENT_TREND}/>
          </div>
        </div>
        <div className="card">
          <div className="card-head"><div className="card-title">Pending actions</div></div>
          <div className="card-pad" style={{ paddingTop: 4 }}>
            {actions.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 4px', borderTop: i === 0 ? '0' : '1px solid var(--border)' }}>
                <span className={`pin ${a.tone === 'warn' ? 'warn' : a.tone === 'danger' ? 'danger' : ''}`}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>{a.sub}</div>
                </div>
                <button className="btn btn-secondary btn-sm">{a.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dash-row dash-1-2" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Module adoption</div>
              <div className="card-sub">Across all tenants</div>
            </div>
          </div>
          <div className="card-pad">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {MODULE_ADOPTION.map(m => (
                <div key={m.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                    <span>{m.name}</span>
                    <span style={{ color: 'var(--fg-3)' }}>{m.pct}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 999, background: 'var(--bg-soft)' }}>
                    <div style={{ width: `${m.pct}%`, height: '100%', borderRadius: 999, background: 'var(--fg)' }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-head">
            <div className="card-title">Recently added</div>
            <button className="btn btn-ghost btn-sm" onClick={() => goto('companies')}>View all <Icon name="arrowR" size={12}/></button>
          </div>
          <div className="recent-grid">
            {recent.map((c, i) => (
              <button key={c.id} onClick={() => goto('company', { id: c.id })}
                style={{ textAlign: 'left', background: 'transparent', border: 0, padding: 16, borderTop: i > 1 ? '1px solid var(--border)' : '0', borderLeft: i % 2 === 1 ? '1px solid var(--border)' : '0', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div className="avatar sq" style={{ width: 32, height: 32, fontSize: 11 }}>{c.code.slice(0,2)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>{c.code}</div>
                  </div>
                  <Pill tone={c.status === 'Active' ? 'success' : c.status === 'Pending' ? 'warn' : 'danger'}>{c.status}</Pill>
                </div>
                <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>
                  {c.branches} branches · {c.warehouses} warehouses · {c.employees} employees
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-head">
          <div>
            <div className="card-title">Recent activity</div>
            <div className="card-sub">Across the platform</div>
          </div>
          <button className="btn btn-ghost btn-sm">View log <Icon name="arrowR" size={12}/></button>
        </div>
        <div className="card-pad">
          <div className="activity">
            {activity.map((a, i) => (
              <div key={i} className="activity-item">
                <span className={`pin ${a.kind === 'warn' ? 'warn' : ''}`}/>
                <div style={{ flex: 1 }}>
                  <h4>{a.title}</h4>
                  <p>by {a.who}</p>
                </div>
                <span className="when">{a.when}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, delta, icon, trend }) {
  return (
    <div className="kpi">
      <div className="kpi-icon"><Icon name={icon} size={18}/></div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-delta">
        {trend === 'up' && <span style={{ color: 'var(--success-fg)' }}>↑ </span>}
        {delta}
      </div>
    </div>
  );
}

function BarChart({ data }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 180, padding: '10px 0' }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
            <div style={{ width: '100%', height: `${(v/max)*100}%`, background: i === data.length - 1 ? 'var(--fg)' : 'var(--fg-3)', borderRadius: 4, opacity: i === data.length - 1 ? 1 : 0.45, transition: 'all 240ms' }}/>
          </div>
          <div style={{ fontSize: 10, color: 'var(--fg-4)' }}>W{i+1}</div>
        </div>
      ))}
    </div>
  );
}

window.Dashboard = Dashboard;
