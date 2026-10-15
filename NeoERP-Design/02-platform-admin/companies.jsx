// NeoERP — Companies list, detail, enrollment wizard

const MOD_ICON = {
  core: 'grid', iam: 'shield', org: 'building', acc: 'layers', pay: 'key',
  hrms: 'users', inv: 'box', crm: 'user', pos: 'activity', fin: 'layers',
};

function CompaniesList({ goto }) {
  const { COMPANIES } = window.MOCK;
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const filtered = COMPANIES.filter(c =>
    (statusFilter === 'all' || c.status.toLowerCase() === statusFilter) &&
    (c.name.toLowerCase().includes(q.toLowerCase()) || c.code.toLowerCase().includes(q.toLowerCase()))
  );
  const totals = {
    total: COMPANIES.length,
    active: COMPANIES.filter(c => c.status === 'Active').length,
    branches: COMPANIES.reduce((s,c) => s+c.branches, 0),
  };
  return (
    <div className="page">
      <PageHead
        title="Companies"
        crumbs={['Org Setup','Companies']}
        actions={
          <button className="btn btn-primary" onClick={() => goto('enroll')}>
            <Icon name="plus" size={14}/> Enroll Company
          </button>
        }
      />
      <div className="stats-grid">
        <Stat icon="building" value={totals.total} label="Total Companies"/>
        <Stat icon="checkCircle" value={totals.active} label="Active"/>
        <Stat icon="map" value={totals.branches} label="Total Branches"/>
      </div>

      <div className="card">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="input-wrap" style={{ flex: 1 }}>
            <span className="leading"><Icon name="search" size={16}/></span>
            <input className="input has-icon" placeholder="Search by name or code…" value={q} onChange={(e) => setQ(e.target.value)}/>
          </div>
          <select className="input" style={{ width: 160 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
          <button className="btn btn-secondary"><Icon name="filter" size={14}/> Filter</button>
        </div>

        <div className="tbl-scroll">
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: '34%' }}>Company</th>
              <th>Code</th>
              <th>Agreement</th>
              <th className="num">Branches</th>
              <th className="num">Warehouses</th>
              <th>Status</th>
              <th style={{ width: 1 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="avatar sq" style={{ width: 36, height: 36, fontSize: 12 }}>{c.code.slice(0,2)}</div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>{c.legal}</div>
                    </div>
                  </div>
                </td>
                <td data-label="Code" className="num" style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5 }}>{c.code}</td>
                <td data-label="Agreement">{c.agreement ? <AgreementChip agreement={c.agreement}/> : <span className="muted" style={{ fontSize: 12.5 }}>None on file</span>}</td>
                <td data-label="Branches" className="num">{c.branches}</td>
                <td data-label="Warehouses" className="num">{c.warehouses}</td>
                <td data-label="Status"><Pill tone={c.status === 'Active' ? 'success' : c.status === 'Pending' ? 'warn' : 'danger'}>{c.status}</Pill></td>
                <td data-label="">
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => goto('company', { id: c.id })}>View</button>
                    <EnterButton company={c.name} label={`Enter ${c.name}`} size="btn-sm" iconOnly/>
                    <button className="btn btn-secondary btn-sm">Edit</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {filtered.length === 0 && (
          <div className="empty">
            <div className="ico"><Icon name="search" size={48}/></div>
            <h3>No companies match</h3>
            <p>Try a different search or clear filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Company detail with tabs
function CompanyDetail({ id, goto }) {
  const { COMPANIES, MODULES } = window.MOCK;
  // Falling back to COMPANIES[0] on an unknown id silently shows a different
  // tenant's contract and branches — the worst possible failure on this screen.
  const c = COMPANIES.find(x => x.id === id) || (id ? null : COMPANIES[0]);

  // Hooks run unconditionally, before the not-found return below — calling
  // them after a conditional return changes the hook count between renders
  // (e.g. navigating from an unknown id to a known one) and React throws.
  const [tab, setTab] = useState('overview');
  const toast = useToast();
  const [moduleState, setModuleState] = useState(() =>
    MODULES.reduce((acc, m) => ({ ...acc, [m.id]: c ? c.modules.includes(m.id) : false }), {})
  );
  const [confirmAction, setConfirmAction] = useState(null);
  // §9: deactivate (operational, owner-reversible) and suspend (commercial,
  // only Neovatus can lift it) are two different verbs — kept as separate
  // status values here rather than one toggle. The mock has no write path,
  // so the change lives in this override until the page remounts.
  const [statusOverride, setStatusOverride] = useState(null);
  const { request, modal: reasonModal } = useReasonGate(({ label, reason, ref }) => {
    toast && toast({ title: label, sub: `Reason recorded${ref ? ` against ${ref}` : ''}: “${reason}”` });
  });

  if (!c) {
    return (
      <>
        <PageHead title="Company not found"
          crumbs={['Platform Admin',
            <button className="crumb-btn" key="c" onClick={() => goto('companies')}>Companies</button>,
            <span className="here" key="h">—</span>]}/>
        <div className="card card-pad-lg" style={{ maxWidth: 520 }}>
          <div className="notice">
            <span className="dot"/>
            <div>
              <b>No company with id “{id}”</b>
              <p>Rather than show another tenant's agreement and branches, this page shows nothing.</p>
            </div>
          </div>
          <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => goto('companies')}>
            <Icon name="arrowL" size={15}/> Back to companies
          </button>
        </div>
      </>
    );
  }
  const status = statusOverride || c.status;
  const toneFor = (s) => s === 'Active' ? 'success' : s === 'Pending' ? 'warn'
    : s === 'Inactive' ? 'default' : 'danger';

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <button className="icon-btn" onClick={() => goto('companies')}><Icon name="arrowL" size={16}/></button>
        <div className="page-crumbs">
          <button className="here" style={{ background: 'transparent', border: 0, padding: 0, color: 'var(--fg-3)', fontSize: 13, cursor: 'default' }}
            onClick={() => goto('companies')}>Companies</button>
          <span className="sep">/</span>
          <span className="here">{c.name}</span>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div className="avatar sq" style={{ width: 56, height: 56, fontSize: 18, flexShrink: 0 }}>{c.code.slice(0,2)}</div>
          <div style={{ flex: '1 1 220px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>{c.name}</div>
              <Pill tone={toneFor(status)}>{status}</Pill>
            </div>
            <div style={{ fontSize: 13, color: 'var(--fg-3)', marginTop: 2 }}>Code: {c.code}</div>
            <div style={{ display: 'flex', gap: 18, marginTop: 10, fontSize: 12.5, color: 'var(--fg-3)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="map" size={14}/> {c.branches} Branches</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="box" size={14}/> {c.warehouses} Warehouses</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="users" size={14}/> {c.employees} Employees</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <EnterButton company={c.name} label="Enter company"/>
            <button className="btn btn-secondary"><Icon name="plus" size={14}/> Add Branch</button>
            <button className="btn btn-primary"><Icon name="edit" size={14}/> Edit Company</button>
            {status === 'Active' && (
              <>
                <button className="btn btn-danger" onClick={() => request({
                  kind: 'suspend',
                  label: `${c.name} suspended`,
                  reasonHint: 'Commercial hold — non-payment or a compliance issue. Only Neovatus can lift a suspension.',
                  reasonPlaceholder: 'Account 45 days past due',
                  noticeTitle: 'This is a commercial hold, not an operational pause',
                  noticeBody: 'Suspend is Neovatus-initiated, and only Neovatus can lift it. Users lose access to every module immediately.',
                  apply: () => setStatusOverride('Suspended'),
                })}>Suspend</button>
                <button className="btn btn-secondary" onClick={() => request({
                  kind: 'deactivate',
                  label: `${c.name} deactivated`,
                  reasonHint: 'Operational — the owner can reverse this themselves. Not a commercial hold.',
                  reasonPlaceholder: 'Shop closed for renovation',
                  noticeTitle: 'Operational, and reversible by the owner',
                  noticeBody: 'Deactivate is the owner’s own switch — they can reactivate it without us. It carries no commercial implication.',
                  apply: () => setStatusOverride('Inactive'),
                })}>Deactivate</button>
              </>
            )}
            {status === 'Suspended' && (
              <button className="btn btn-secondary" onClick={() => setConfirmAction('reactivate')}>Reactivate</button>
            )}
            {status === 'Inactive' && (
              <button className="btn btn-secondary" onClick={() => setConfirmAction('activate')}>Activate</button>
            )}
          </div>
        </div>
      </div>

      <div className="tabs" style={{ maxWidth: 760, margin: '0 0 24px' }}>
        {[
          ['overview','Overview'],
          ['modules','Modules'],
          ['branches','Branches'],
          ['warehouses','Warehouses'],
          ['activity','Activity'],
        ].map(([id, label]) => (
          <button key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="rgrid rgrid-7-5">
          <div className="card">
            <div className="card-head">
              <div className="card-title">Company Information</div>
              <button className="btn btn-ghost btn-sm"><Icon name="edit" size={12}/> Edit</button>
            </div>
            <div className="card-pad">
              <dl className="kv">
                <dt>Company ID</dt><dd style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5 }}>{c.id}</dd>
                <dt>Legal Name</dt><dd>{c.legal}</dd>
                <dt>Display Name</dt><dd>{c.name}</dd>
                <dt>Code</dt><dd>{c.code}</dd>
                <dt>Email</dt><dd>{c.email}</dd>
                <dt>Phone</dt><dd>{c.phone}</dd>
                <dt>Address</dt><dd>{c.address}</dd>
                <dt>City</dt><dd>{c.city}</dd>
                <dt>State</dt><dd>{c.state}</dd>
                <dt>Country</dt><dd>{c.country}</dd>
                <dt>Postal Code</dt><dd>{c.postal}</dd>
                <dt>Tax Mode</dt><dd>{c.taxMode}</dd>
                <dt>Tax ID</dt><dd>{c.taxId}</dd>
                <dt>Registration</dt><dd>{c.registration}</dd>
                <dt>Status</dt><dd><Pill tone={toneFor(status)}>{status}</Pill></dd>
              </dl>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card card-pad">
              <div className="card-title" style={{ marginBottom: 14 }}>At a glance</div>
              <div className="rgrid rgrid-2">
                <div style={{ padding: 14, background: 'var(--bg-soft)', borderRadius: 'var(--r-md)' }}>
                  <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>Agreement</div>
                  <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>{c.agreement.ref}</div>
                </div>
                <div style={{ padding: 14, background: 'var(--bg-soft)', borderRadius: 'var(--r-md)' }}>
                  <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>Enrolled</div>
                  <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>{c.enrolled}</div>
                </div>
                <div style={{ padding: 14, background: 'var(--bg-soft)', borderRadius: 'var(--r-md)' }}>
                  <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>Modules</div>
                  <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>{c.modules.length}/{MODULES.length}</div>
                </div>
                <div style={{ padding: 14, background: 'var(--bg-soft)', borderRadius: 'var(--r-md)' }}>
                  <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>Status</div>
                  <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>{status}</div>
                </div>
              </div>
            </div>
            <div className="card card-pad">
              <div className="card-title" style={{ marginBottom: 12 }}>Active modules</div>
              <div className="mods">
                {MODULES.map((m) => (
                  <span key={m.id} className={`mod-chip ${c.modules.includes(m.id) ? 'on' : ''}`}>
                    <span className="dot"/>{m.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'modules' && (
        <div>
        <div className="notice" style={{ marginBottom: 16 }}>
          <span className="dot"/>
          <div>
            <b>Entitlements live on their own screen</b>
            <p>Module access is bounded by the agreement and can be overridden per branch and per feature — more than a flat toggle list can express. This tab stays as a quick read.</p>
            <button className="btn btn-secondary btn-sm" style={{ marginTop: 10 }} onClick={() => goto('entitlements')}>
              <Icon name="layers" size={12}/> Open entitlements
            </button>
          </div>
        </div>
        <div className="card card-pad-lg">
          <div className="mcount" style={{ marginBottom: 14 }}>
            <b>{Object.values(moduleState).filter(Boolean).length}</b> of {MODULES.length} enabled for {c.name}
            <span className="spacer"/>
            <button className="btn btn-secondary btn-sm" onClick={() => setModuleState(MODULES.reduce((a,m) => ({...a,[m.id]:c.modules.includes(m.id)}), {}))}>Reset</button>
            <button className="btn btn-primary btn-sm" onClick={() => request({
              kind: 'modules',
              label: `Module access saved for ${c.name}`,
              reasonHint: 'Module access is bounded by the agreement — recorded in the change history and the platform audit log.',
              reasonPlaceholder: `${Object.values(moduleState).filter(Boolean).length} modules enabled`,
              apply: () => {},
            })}>Save changes</button>
          </div>
          <div className="mgrid">
            {MODULES.map(m => {
              const on = !!moduleState[m.id];
              return (
                <button type="button" key={m.id} className={`mcard${on ? ' on' : ''}`}
                  onClick={() => setModuleState({ ...moduleState, [m.id]: !on })}>
                  <div className="mcard-ico"><Icon name={MOD_ICON[m.id] || 'layers'} size={18}/></div>
                  <div className="mcard-body">
                    <div className="mcard-nm">{m.name}</div>
                    <div className="mcard-desc">{m.desc}</div>
                  </div>
                  <span className="mcard-sw" onClick={(e) => e.stopPropagation()}><Switch checked={on} onChange={(v) => setModuleState({ ...moduleState, [m.id]: v })}/></span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      )}

      {tab === 'branches' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {c.branchList.length === 0 && (
            <div className="card">
              <div className="empty">
                <div className="ico"><Icon name="map" size={48}/></div>
                <h3>No branches yet</h3>
                <p>Add the first branch for {c.name} to start tracking locations.</p>
                <button className="btn btn-primary mt-3"><Icon name="plus" size={14}/> Add Branch</button>
              </div>
            </div>
          )}
          {c.branchList.map((b, i) => (
            <div key={i} className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: 'var(--bg-soft)', display: 'grid', placeItems: 'center' }}>
                  <Icon name="map" size={16}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{b.name}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--fg-3)' }}>{b.code} · {b.city}</div>
                </div>
                <Pill tone={toneFor(b.status)}>{b.status}</Pill>
                <EnterButton company={c.name} branch={b.name} label={`Enter ${b.name}`} size="btn-sm" iconOnly/>
                <button className="btn btn-secondary btn-sm" onClick={() => goto('branch', { company: c.name, branch: b.name })}>Open</button>
              </div>
              <div style={{ padding: '14px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>Warehouses ({c.warehouseList.filter(w => w.branch === b.code).length})</div>
                  <button className="btn btn-ghost btn-sm"><Icon name="plus" size={12}/> Warehouse</button>
                </div>
                {c.warehouseList.filter(w => w.branch === b.code).map((w, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--bg-soft)', borderRadius: 'var(--r-md)', marginBottom: 6 }}>
                    <Icon name="box" size={16}/>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{w.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>{w.code} · {w.type}</div>
                    </div>
                    <Pill tone={toneFor(w.status)}>{w.status}</Pill>
                  </div>
                ))}
                {c.warehouseList.filter(w => w.branch === b.code).length === 0 && (
                  <div style={{ padding: 16, textAlign: 'center', color: 'var(--fg-3)', fontSize: 13 }}>No warehouses yet.</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'warehouses' && (
        <div className="card">
          <table className="tbl">
            <thead>
              <tr><th>Warehouse</th><th>Code</th><th>Type</th><th>Branch</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {c.warehouseList.map((w, i) => (
                <tr key={i}>
                  <td data-label="Warehouse" style={{ fontWeight: 500 }}>{w.name}</td>
                  <td data-label="Code" style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5 }}>{w.code}</td>
                  <td data-label="Type"><span className="muted">{w.type}</span></td>
                  <td data-label="Branch">{w.branch}</td>
                  <td data-label="Status"><Pill tone={toneFor(w.status)}>{w.status}</Pill></td>
                  <td data-label=""><button className="btn btn-secondary btn-sm">Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {c.warehouseList.length === 0 && (
            <div className="empty">
              <div className="ico"><Icon name="box" size={48}/></div>
              <h3>No warehouses yet</h3>
              <p>Add a warehouse from a branch to start managing inventory.</p>
            </div>
          )}
        </div>
      )}

      {tab === 'activity' && (
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Activity Log</div>
              <div className="card-sub">Recent structural changes</div>
            </div>
            <select className="input" style={{ width: 160, height: 36 }}>
              <option>All events</option>
              <option>Structural</option>
              <option>Modules</option>
              <option>Status changes</option>
            </select>
          </div>
          <div className="card-pad">
            <div className="activity">
              {c.activity.map((a, i) => (
                <div key={i} className="activity-item">
                  <span className={`pin ${a.kind === 'system' ? 'system' : a.kind === 'warn' ? 'warn' : ''}`}/>
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
      )}

      <Modal
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={confirmAction === 'reactivate' ? 'Lift the suspension?' : 'Activate company?'}
        footer={<>
          <button className="btn btn-secondary" onClick={() => setConfirmAction(null)}>Cancel</button>
          <button className="btn btn-primary"
            onClick={() => { setConfirmAction(null); setStatusOverride('Active'); toast({ title: confirmAction === 'reactivate' ? 'Suspension lifted' : 'Company activated', sub: c.name }); }}>
            {confirmAction === 'reactivate' ? 'Lift suspension' : 'Activate'}
          </button>
        </>}>
        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--fg-2)', lineHeight: 1.5 }}>
          {confirmAction === 'reactivate'
            ? `${c.name} regains access to every module it had before the suspension. Only Neovatus could lift this.`
            : `${c.name} will regain access to all enabled modules. The owner could also have done this themselves.`}
        </p>
      </Modal>
      {reasonModal}
    </div>
  );
}

window.CompaniesList = CompaniesList;
window.CompanyDetail = CompanyDetail;
