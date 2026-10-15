// NeoERP — Company requests. A request is a request, not a tenant: approving one

const REQ_TABS = [
  { id: 'all',     label: 'All',       title: 'All requests',     match: () => true },
  { id: 'branch',  label: 'Branches',  title: 'Branch requests',  match: x => x.type === 'branch' },
  { id: 'company', label: 'Companies', title: 'Company requests', match: x => x.type === 'company' },
];
// opens the enrollment wizard pre-filled. The agreement stays the provider's call.

function CompanyRequests({ goto }) {
  const toast = useToast();
  const p = usePlatform() || {};
  const [rows, setRows] = useState(() => [...BRANCH_REQUESTS, ...REQUESTS].map(r => ({ ...r })));
  const [sel, setSel] = useState(BRANCH_REQUESTS[0].id);
  const [tab, setTab] = useState('all');

  const r = rows.find(x => x.id === sel) || rows[0];
  const shown = rows.filter((REQ_TABS.find(t => t.id === tab) || REQ_TABS[0]).match);
  const openRows = rows.filter(isOpenRequest);
  const open = openRows.length;
  const branchOpen = openRows.filter(x => x.type === 'branch').length;
  const isBranch = r.type === 'branch';

  const setStatus = (id, status) => setRows(rs => rs.map(x => x.id === id ? { ...x, status } : x));

  const approve = () => {
    setStatus(r.id, 'Approved');
    toast && toast({ title: `${r.company} approved`, sub: 'Enrollment opened, pre-filled from the request.' });
    goto('enroll', { prefill: r });
  };

  // Branch approve/decline are gated by BranchRequestDetail itself (it shows
  // its own confirmation once the reason is recorded); these just mutate.
  const approveBranch = (decisions) => setStatus(r.id, 'Approved');
  const decline = () => setStatus(r.id, 'Declined');

  // §5: declining a company request is one click today — gate it.
  const { request, modal: reasonModal } = useReasonGate(({ label, sub, reason, ref }) => {
    toast && toast({ title: label, sub: sub || (ref ? `Recorded against ${ref}.` : `Reason recorded: “${reason}”`) });
  });

  const person = r.requester.personId ? PEOPLE.find(p => p.id === r.requester.personId) : null;

  return (
    <>
      <PageHead
        title="Requests"
        crumbs={['Platform Admin', <span className="here" key="h">Requests</span>]}
        actions={<button className="btn btn-primary" onClick={() => goto('enroll')}><Icon name="plus" size={16}/> Enroll directly</button>}/>

      <div className="notice" style={{ marginBottom: 16 }}>
        <span className="dot"/>
        <div>
          <b>{open} open · {branchOpen} branch{branchOpen === 1 ? '' : 'es'}</b>
          <p>Branches are request-only because each one carries module access and a billing arrangement. A company-owned branch inside the limit takes one click; a franchise needs three decisions from you.</p>
        </div>
      </div>

      <div className="tabs" style={{ maxWidth: 460, margin: '0 0 16px' }}>
        {REQ_TABS.map(t => (
          <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      <div className="rgrid rgrid-7-5">
        <div className="card">
          <div className="card-head">
            <div className="card-title">{(REQ_TABS.find(t => t.id === tab) || REQ_TABS[0]).title}</div>
            <span style={{ fontSize: 12.5, color: 'var(--fg-3)' }}>
              {(() => {
                const open = shown.filter(isOpenRequest).length;
                return open === shown.length
                  ? `${shown.length} open`
                  : `${open} open · ${shown.length} total`;
              })()}
            </span>
          </div>
          <div style={{ padding: 8 }}>
            {shown.map(x => (
              <button key={x.id} className={`req${sel === x.id ? ' on' : ''}`} onClick={() => setSel(x.id)}>
                <div className={`req-src ${x.type === 'branch' ? (x.ownership === 'franchise' ? 'owner' : 'branch') : x.source}`}>
                  <Icon name={x.type === 'branch' ? 'map' : x.source === 'owner' ? 'building' : 'mail'} size={14}/>
                </div>
                <div className="req-body">
                  <div className="req-nm">
                    {x.type === 'branch' ? x.branch : x.company}
                    {x.type === 'branch' && x.ownership === 'franchise' && <span className="req-tag">Franchise</span>}
                    {x.type === 'branch' && !x.withinLimit && <span className="req-tag over">Over limit</span>}
                  </div>
                  <div className="req-meta">
                    {x.type === 'branch'
                      ? <>{x.company} · {x.requester.nm} · {x.when}</>
                      : <>{x.requester.nm} · {x.country} · {x.when}{x.parent ? ` · under ${x.parent}` : ''}</>}
                  </div>
                </div>
                <Pill tone={x.status === 'Approved' ? 'success' : x.status === 'Declined' ? 'danger' : x.status === 'Qualified' ? 'info' : 'warn'}>{x.status}</Pill>
              </button>
            ))}
            {shown.length === 0 && (
              <div className="empty"><Icon name="inbox" size={48} className="ico"/><h3>Nothing here</h3></div>
            )}
          </div>
        </div>

        {isBranch ? (
          <BranchRequestDetail req={r} goto={goto}
            onApprove={approveBranch} onDecline={decline} onStatus={(s) => setStatus(r.id, s)}/>
        ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">{r.company}</div>
                <div className="card-sub">{r.source === 'owner' ? 'Requested by an existing owner' : 'Inbound request'} · {r.when}</div>
              </div>
              <Pill tone={r.status === 'Approved' ? 'success' : r.status === 'Declined' ? 'danger' : r.status === 'Qualified' ? 'info' : 'warn'}>{r.status}</Pill>
            </div>
            <div className="card-pad">
              <dl className="kv" style={{ gridTemplateColumns: '116px 1fr' }}>
                <dt>Requester</dt><dd>{r.requester.nm}<div style={{ fontSize: 12, color: 'var(--fg-3)', fontWeight: 400 }}>{r.requester.email}</div></dd>
                <dt>Country</dt><dd>{(COUNTRIES[r.country] || {}).nm} · {(COUNTRIES[r.country] || {}).cur} · FY {(COUNTRIES[r.country] || {}).fy}</dd>
                <dt>Size</dt><dd>{r.size}</dd>
                {r.parent && <><dt>Under</dt><dd>{r.parent} <AgreementChip agreement={(TENANT_TREE.find(t => t.nm === r.parent) || { agreement: { end: '2026-11-01', ref: '' } }).agreement}/></dd></>}
                <dt>Wants</dt><dd>{r.wants.map(id => (ENT_MODULES.find(m => m.id === id) || {}).nm).join(', ')}</dd>
              </dl>
              <div className="req-reason">
                <div className="req-reason-hd">In their words</div>
                <p>“{r.reason}”</p>
              </div>
            </div>
          </div>

          {person ? (
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">Already a customer</div>
                  <div className="card-sub">No invitation needed — their memberships extend</div>
                </div>
                <Pill tone="success">Known</Pill>
              </div>
              <div className="card-pad" style={{ paddingTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div className="avatar" style={{ width: 36, height: 36, fontSize: 13 }}>{person.initials}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{person.nm}</div>
                    <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>{person.memberships.length} existing membership{person.memberships.length > 1 ? 's' : ''} · last active {person.lastActive.toLowerCase()}</div>
                  </div>
                </div>
                {person.memberships.map((m, i) => (
                  <div key={i} className="req-mem">
                    <Icon name={m.scope === 'platform' ? 'shield' : m.scope === 'company' ? 'building' : 'map'} size={14}/>
                    <span className="req-mem-nm">{m.target}</span>
                    <span className="req-mem-role">{m.role}</span>
                  </div>
                ))}
                <button className="btn btn-ghost btn-sm" style={{ marginTop: 10, paddingLeft: 0 }} onClick={() => goto('person', { id: person.id })}>
                  View person <Icon name="arrowR" size={12}/>
                </button>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-head"><div className="card-title">Not a customer yet</div></div>
              <div className="card-pad" style={{ paddingTop: 4, fontSize: 12.5, color: 'var(--fg-2)', lineHeight: 1.6 }}>
                <p style={{ margin: '0 0 10px' }}>
                  No existing identity for <b>{r.requester.email}</b>. Approving creates the tenant and sends a fresh owner invitation.
                </p>
                <p style={{ margin: 0, color: 'var(--fg-3)' }}>
                  Qualify commercially first — an approved request is an agreement, and a free-mail address with a one-line brief usually isn't one.
                </p>
              </div>
            </div>
          )}

          <div className="card card-pad">
            {r.status === 'Approved' ? (
              <div className="notice"><span className="dot"/><div><b>Approved</b><p>Finish the agreement in the enrollment wizard to create the tenant.</p></div></div>
            ) : r.status === 'Declined' ? (
              <div className="notice error"><span className="dot"/><div><b>Declined</b><p>The requester was notified. Nothing was created.</p></div></div>
            ) : (
              <>
                <div className="field-label" style={{ marginBottom: 10 }}>Decision</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button className="btn btn-primary btn-block" onClick={approve}>
                    <Icon name="check" size={15}/> Approve &amp; set the agreement
                  </button>
                  <div className="row-flex" style={{ gap: 8 }}>
                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStatus(r.id, r.status === 'New' ? 'Contacted' : 'Qualified')}>
                      Mark {r.status === 'New' ? 'contacted' : 'qualified'}
                    </button>
                    <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => request({
                      kind: 'decline',
                      label: `${r.company} declined`,
                      sub: 'The requester is notified. No tenant was created.',
                      reasonHint: 'Shown to nobody but Neovatus \u2014 recorded in the platform audit log.',
                      apply: decline,
                    })}>Decline</button>
                  </div>
                  {r.source === 'owner' && p.isSuperAdmin && (
                    <button className="btn btn-ghost btn-block" style={{ marginTop: 4 }}
                      onClick={() => p.openLauncher({
                        company: r.parent || r.company,
                        reason: `Request ${r.id} — ${r.reason.slice(0, 70)}`,
                        onBehalfOf: r.requester.nm, requestId: r.id,
                      })}>
                      <Icon name="arrowR" size={14}/> Do it on their behalf
                    </button>
                  )}
                </div>
                <p style={{ fontSize: 11.5, color: 'var(--fg-3)', margin: '12px 0 0', lineHeight: 1.5 }}>
                  Approving doesn't create anything on its own — it opens enrollment pre-filled with the above. The agreement, limits and modules are still yours to set.
                </p>
              </>
            )}
          </div>
        </div>
        )}
      </div>

      {reasonModal}

      <style>{`
        .req-tag { font-size: 10px; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; background: var(--bg-soft); color: var(--fg-3); padding: 2px 6px; border-radius: 4px; margin-left: 7px; }
        .req.on .req-tag { background: var(--bg-elev); }
        .req-tag.over { background: var(--danger-bg); color: var(--danger-fg); }
        .req-src.branch { background: var(--bg-soft); color: var(--fg-2); }
        .req.on .req-src.branch { background: var(--bg-elev); color: var(--fg-2); }
        .req { display: flex; align-items: center; gap: 12px; width: 100%; text-align: left; padding: 12px;
          border: 1px solid transparent; border-radius: var(--r-md); background: transparent; cursor: default; }
        .req:hover { background: var(--bg-soft); }
        .req.on { background: var(--bg-soft); border-color: var(--border-strong); }
        .req-src { width: 32px; height: 32px; border-radius: var(--r-md); display: grid; place-items: center; flex-shrink: 0;
          background: var(--bg-soft); color: var(--fg-3); }
        .req.on .req-src { background: var(--bg-elev); color: var(--fg-3); }
        .req.on .req-src.owner { background: var(--accent); color: var(--accent-fg); }
        .req-src.owner { background: var(--accent); color: var(--accent-fg); }
        .req-body { flex: 1; min-width: 0; }
        .req-nm { font-size: 13.5px; font-weight: 600; }
        .req-meta { font-size: 11.5px; color: var(--fg-3); margin-top: 2px; }
        .req-mem { display: flex; align-items: center; gap: 9px; padding: 7px 0; border-top: 1px solid var(--border); font-size: 12.5px; color: var(--fg-2); }
        .req-mem-nm { font-weight: 500; }
        .req-mem-role { margin-left: auto; font-size: 11.5px; color: var(--fg-3); }
      `}</style>
    </>
  );
}

// Tenant-side: an existing owner asks for another company under their group.
function RequestCompany({ goto }) {
  const toast = useToast();
  const [f, setF] = useState({ company: '', country: 'PK', size: '10–30 staff', parent: 'Lahore Textiles', reason: '', mods: ['finance'] });
  const [err, setErr] = useState('');
  const set = (k, v) => setF(x => ({ ...x, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    if (!f.company.trim()) { setErr('Give the new company a name.'); return; }
    if (f.reason.trim().length < 10) { setErr('A sentence on why helps Neovatus set the right agreement — and speeds up approval.'); return; }
    setErr('');
    toast && toast({ title: 'Request sent', sub: 'Neovatus will confirm the agreement and set it up. You keep your existing sign-in.' });
    goto('firstrun');
  };

  return (
    <>
      <PageHead title="Request another company" crumbs={['Lahore Textiles', <span className="here" key="h">Request a company</span>]}/>

      <div style={{ maxWidth: 640 }}>
        {err && <div className="notice error" style={{ marginBottom: 16 }}><span className="dot"/><div><b>Almost there</b><p>{err}</p></div></div>}

        <div className="notice" style={{ marginBottom: 18 }}>
          <span className="dot"/>
          <div>
            <b>You won't need a new login</b>
            <p>This company is added to your existing account as another membership. Same email, same password, a switcher in the top bar.</p>
          </div>
        </div>

        <form className="card card-pad-lg" onSubmit={submit}>
          <div className="rgrid rgrid-2">
            <Field label="Company name"><input className="input" placeholder="Lahore Textiles Exports" value={f.company} onChange={e => set('company', e.target.value)}/></Field>
            <Field label="Part of">
              <select className="input" value={f.parent} onChange={e => set('parent', e.target.value)}>
                <option>Lahore Textiles</option>
                <option value="">Standalone — not part of my group</option>
              </select>
            </Field>
            <Field label="Country" hint="Sets currency, fiscal year and tax filing.">
              <select className="input" value={f.country} onChange={e => set('country', e.target.value)}>
                {Object.entries(COUNTRIES).map(([k, v]) => <option key={k} value={k}>{v.nm}</option>)}
              </select>
            </Field>
            <Field label="Roughly how many staff">
              <select className="input" value={f.size} onChange={e => set('size', e.target.value)}>
                <option>1–10 staff</option><option>10–30 staff</option><option>30–50 staff</option><option>50–100 staff</option><option>100+ staff</option>
              </select>
            </Field>
          </div>

          <div className="ent-sub-hd" style={{ marginTop: 22 }}>Which modules will it need</div>
          <div className="mods">
            {ENT_MODULES.map(m => {
              const on = f.mods.includes(m.id);
              return (
                <button type="button" key={m.id} className={`mod-chip${on ? ' on' : ''}`}
                  onClick={() => set('mods', on ? f.mods.filter(x => x !== m.id) : [...f.mods, m.id])}>
                  <span className="dot"/>{m.nm}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 22 }}>
            <Field label="Why do you need a separate company?" hint="Separate legal entity, different tax number, own books — whatever applies.">
              <textarea className="input" placeholder="Separate legal entity for the export business. Different NTN and its own books." value={f.reason} onChange={e => set('reason', e.target.value)}/>
            </Field>
          </div>

          <div className="wiz-foot">
            <button type="button" className="btn btn-ghost" onClick={() => goto('firstrun')}>Cancel</button>
            <div className="spacer"/>
            <button type="submit" className="btn btn-primary"><Icon name="mail" size={15}/> Send request</button>
          </div>
        </form>
      </div>
    </>
  );
}

Object.assign(window, { CompanyRequests, RequestCompany });
