// NeoERP — Cross-tenant views: every branch, and the renewal pipeline.
// Both exist because "show me every X across all tenants" has no answer when
// the only path to a record is through its parent company.

function allBranches() {
  const out = [];
  (window.TENANT_TREE || []).forEach(t => {
    (t.branches || []).forEach(b => {
      const meta = (window.ENT_BRANCHES || []).find(x => x.nm === b.nm) || {};
      const gov = agreementForBranch(t.nm, b.nm);
      out.push({
        nm: b.nm, company: t.nm, companyId: t.id, country: t.country,
        ownership: b.ownership, owner: b.owner,
        city: b.city || meta.city || null, code: b.code || (meta.id || '').toUpperCase() || null,
        billing: meta.billing || 'group',
        books: b.ownership === 'franchise' ? 'own' : 'group',
        agreement: gov.agreement, ownAgreement: gov.own,
        status: meta.status || 'Active',
      });
    });
  });
  return out;
}

function BranchesList({ goto }) {
  const [own, setOwn] = useState('all');
  const [q, setQ] = useState('');
  const all = allBranches();
  const rows = all.filter(b => {
    if (own !== 'all' && b.ownership !== own) return false;
    if (!q.trim()) return true;
    return `${b.nm} ${b.company} ${b.city} ${b.code} ${b.owner || ''}`.toLowerCase().includes(q.trim().toLowerCase());
  });
  const fr = all.filter(b => b.ownership === 'franchise').length;
  const ownAgr = all.filter(b => b.ownAgreement).length;
  const noOwner = all.filter(branchNeedsOwner).length;

  return (
    <>
      <PageHead
        title="Branches"
        sub="Every branch and franchise on the platform, across all tenants."
        crumbs={['Platform Admin', <span className="here" key="h">Branches</span>]}
        actions={<button className="btn btn-secondary" onClick={() => goto('requests')}>
          <Icon name="inbox" size={16}/> Branch requests
        </button>}/>

      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <div className="kpi"><div className="kpi-icon"><Icon name="map" size={18}/></div><div className="kpi-label">Branches</div><div className="kpi-value">{all.length}</div><div className="kpi-delta">across {(window.TENANT_TREE || []).length} tenants</div></div>
        <div className="kpi"><div className="kpi-icon"><Icon name="building" size={18}/></div><div className="kpi-label">Franchised</div><div className="kpi-value">{fr}</div><div className="kpi-delta">{all.length - fr} company-owned</div></div>
        <div className="kpi"><div className="kpi-icon"><Icon name="contract" size={18}/></div><div className="kpi-label">Own agreement</div><div className="kpi-value">{ownAgr}</div><div className="kpi-delta">separate expiry dates</div></div>
        <div className="kpi"><div className={`kpi-icon${noOwner ? ' urgent' : ''}`}><Icon name="user" size={18}/></div><div className="kpi-label">No owner assigned</div><div className="kpi-value" style={noOwner ? { color: 'var(--danger-fg)' } : undefined}>{noOwner}</div><div className="kpi-delta">{noOwner ? 'franchise without a signer' : 'every franchise has one'}</div></div>
      </div>

      <div className="card">
        <div className="card-head" style={{ gap: 12, flexWrap: 'wrap' }}>
          <div className="chips">
            {[['all', 'All'], ['company', 'Company-owned'], ['franchise', 'Franchised']].map(([id, label]) => (
              <button key={id} className={`chip${own === id ? ' on' : ''}`} onClick={() => setOwn(id)}>{label}</button>
            ))}
          </div>
          <div className="search" style={{ marginLeft: 'auto', minWidth: 200 }}>
            <Icon name="search" size={15}/>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search branch, company, city…"/>
          </div>
        </div>
        <div className="tbl-scroll">
          <table className="tbl">
            <thead><tr>
              <th>Branch</th><th>Company</th><th>Type</th><th>Owner</th>
              <th>Books</th><th>Agreement</th><th style={{ width: 1 }}></th>
            </tr></thead>
            <tbody>
              {rows.map(b => (
                <tr key={b.company + b.nm}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{b.nm}</div>
                    {(b.city || b.code) && (
                      <div style={{ fontSize: 11.5, color: 'var(--fg-3)', marginTop: 2 }}>
                        {[b.city, b.code].filter(Boolean).join(' · ')}
                      </div>
                    )}
                  </td>
                  <td data-label="Company"><span className="muted">{b.company}</span></td>
                  <td data-label="Type"><span className={`ent-own${b.ownership === 'franchise' ? ' fr' : ''}`}>{b.ownership === 'franchise' ? 'Franchise' : 'Company'}</span></td>
                  <td data-label="Owner">
                    {b.owner
                      ? b.owner
                      : branchNeedsOwner(b)
                        ? <span style={{ color: 'var(--danger-fg)', fontSize: 12.5, fontWeight: 500 }}>Unassigned</span>
                        : <span className="muted" style={{ fontSize: 12.5 }}>Group-run</span>}
                  </td>
                  <td data-label="Books"><span className={`ent-bill${b.books === 'own' ? ' own' : ''}`}>{b.books === 'own' ? 'Own' : 'Group'}</span></td>
                  <td data-label="Agreement">
                    {b.agreement ? <AgreementChip agreement={b.agreement}/> : <span className="muted" style={{ fontSize: 12.5 }}>None</span>}
                    {b.ownAgreement && <div style={{ fontSize: 10.5, color: 'var(--fg-3)', marginTop: 3 }}>its own</div>}
                  </td>
                  <td data-label="">
                    <button className="btn btn-secondary btn-sm" onClick={() => goto('branch', { company: b.company, branch: b.nm })}>Open</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function AgreementsList({ goto }) {
  const toast = useToast();
  const [filter, setFilter] = useState('all');
  // Renewal is a contract event — the backend already requires an
  // amendment reference for it, the design just never asked for one.
  const { request, modal: reasonModal } = useReasonGate(({ label, sub, ref }) => {
    toast && toast({ title: label, sub: `${sub} Filed against ${ref}.` });
  });
  const all = allAgreements();
  const state = a => agreementState(a.agreement);
  const rows = all.filter(x => {
    if (filter === 'all') return true;
    if (filter === 'manual') return x.agreement.renewal !== 'auto';
    if (filter === 'franchise') return x.scope === 'franchise';
    return true;
  });
  const attention = all.filter(x => x.agreement.daysRemaining <= 30).length;
  const manual = all.filter(x => x.agreement.renewal !== 'auto').length;

  return (
    <>
      <PageHead
        title="Agreements"
        sub="The renewal pipeline. Company and franchise contracts, soonest expiry first."
        crumbs={['Platform Admin', <span className="here" key="h">Agreements</span>]}/>

      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <div className="kpi"><div className="kpi-icon"><Icon name="contract" size={18}/></div><div className="kpi-label">Agreements</div><div className="kpi-value">{all.length}</div><div className="kpi-delta">{all.filter(x => x.scope === 'franchise').length} held by franchises</div></div>
        <div className="kpi"><div className={`kpi-icon${attention ? ' urgent' : ''}`}><Icon name="activity" size={18}/></div><div className="kpi-label">Inside 30 days</div><div className="kpi-value" style={attention ? { color: 'var(--danger-fg)' } : undefined}>{attention}</div><div className="kpi-delta">need a decision now</div></div>
        <div className="kpi"><div className="kpi-icon"><Icon name="edit" size={18}/></div><div className="kpi-label">Manual renewal</div><div className="kpi-value">{manual}</div><div className="kpi-delta">will lapse untouched</div></div>
        <div className="kpi"><div className="kpi-icon"><Icon name="refresh" size={18}/></div><div className="kpi-label">Auto renewal</div><div className="kpi-value">{all.length - manual}</div><div className="kpi-delta">roll unless cancelled</div></div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="chips">
            {[['all', 'All'], ['manual', 'Manual renewal'], ['franchise', 'Franchise-held']].map(([id, label]) => (
              <button key={id} className={`chip${filter === id ? ' on' : ''}`} onClick={() => setFilter(id)}>{label}</button>
            ))}
          </div>
        </div>
        <div className="agl">
          {rows.map(x => {
            const st = agreementState(x.agreement);
            const days = x.agreement.daysRemaining;
            return (
              <div key={x.agreement.ref} className="agl-row">
                <span className={`pin ${st.tone === 'warn' ? 'warn' : st.tone === 'danger' ? 'danger' : ''}`}/>
                <div className="agl-main">
                  <div className="agl-nm">
                    {x.name}
                    {x.scope === 'franchise' && <span className="ent-own fr">Franchise</span>}
                  </div>
                  <div className="agl-meta">
                    {x.parent ? `${x.parent} · ` : ''}
                    <span className="aud-ref">{x.agreement.ref}</span> · {x.agreement.term} ·
                    {' '}{x.agreement.renewal === 'auto' ? 'auto-renews' : 'manual renewal'} · ends {fmtDate(x.agreement.end)}
                  </div>
                </div>
                <AgreementChip agreement={x.agreement}/>
                <div className="agl-acts">
                  {days <= 90 && (
                    <button className="btn btn-primary btn-sm"
                      onClick={() => request({
                        kind: 'renew',
                        label: `Renewal started for ${x.name}`,
                        sub: `${x.agreement.ref} \u00b7 ${days} days remaining.`,
                        showRef: true, refRequired: true,
                        reasonHint: 'What changed, or why now \u2014 shown in the change history.',
                        refHint: 'Required \u2014 the backend won\u2019t start a renewal without a reference.',
                        noticeTitle: 'A renewal is a contract event',
                        noticeBody: 'Modules and limits carry over unless changed here. Six months from now the reference is what proves what was agreed.',
                        apply: () => {},
                      })}>
                      Renew
                    </button>
                  )}
                  <button className="btn btn-secondary btn-sm"
                    onClick={() => x.scope === 'franchise'
                      ? goto('branch', { company: x.parent, branch: x.name })
                      : x.id
                        ? goto('company', { id: x.id })
                        : goto('companies')}>
                    Open
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {reasonModal}

      <style>{`
        .kpi-icon.urgent { background: var(--danger-bg); color: var(--danger-fg); }
        .agl { padding: 4px 0; }
        .agl-row { display: flex; align-items: center; gap: 14px; padding: 14px 20px; border-bottom: 1px solid var(--border); flex-wrap: wrap; }
        .agl-row:last-child { border-bottom: 0; }
        .agl-row .pin { flex-shrink: 0; }
        .agl-main { flex: 1; min-width: 180px; }
        .agl-nm { font-size: 14px; font-weight: 600; letter-spacing: -.01em; display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
        .agl-meta { font-size: 11.5px; color: var(--fg-3); margin-top: 3px; }
        .agl-acts { display: flex; gap: 8px; flex-shrink: 0; }
      `}</style>
    </>
  );
}

Object.assign(window, { BranchesList, AgreementsList, allBranches });
