// NeoERP — Branch detail. The page that was missing: where a branch, its
// warehouses, its owner, its billing and its resolved entitlements are edited.

function BranchDetail({ company, branch, goto }) {
  const toast = useToast();
  const p = usePlatform() || {};
  const rec = branchRecord(company, branch);
  const [active, setActive] = useState(true);
  if (!rec) {
    return (
      <>
        <PageHead title={branch || 'Branch'}
          crumbs={['Platform Admin',
            <button className="crumb-btn" key="c" onClick={() => goto('companies')}>Companies</button>,
            <span className="here" key="h">{branch || '—'}</span>]}/>
        <div className="card card-pad-lg" style={{ maxWidth: 520 }}>
          <div className="notice">
            <span className="dot"/>
            <div>
              <b>No record for this branch</b>
              <p>
                {branch ? <>“{branch}”</> : 'This branch'} isn't on file{company ? <> under {company}</> : ''}.
                Rather than show another tenant's owner and contract, this page shows nothing — a wrong
                agreement reference is worse than a blank.
              </p>
            </div>
          </div>
          <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => goto('companies')}>
            <Icon name="arrowL" size={15}/> Back to companies
          </button>
        </div>
      </>
    );
  }
  const { co, b, meta } = rec;
  const fr = b.ownership === 'franchise';
  const addenda = (co.addenda || []).filter(a => a.branch === b.nm);
  const gov = rec.full ? agreementForBranch(co.nm, b.nm) : { agreement: co.agreement, own: false, group: co.agreement };
  const agr = gov.agreement || co.agreement;
  const hasEnt = Array.isArray(co.entitled);
  // A franchise holding its own contract is entitled by that contract, not the group's.
  const entitled = (gov.own && b.entitled) ? b.entitled : (co.entitled || []);

  // Resolved entitlement per module: agreement ceiling → company default → branch override
  const rows = ENT_MODULES.map(m => {
    const add = addenda.find(a => a.mods.includes(m.id));
    const inAgr = entitled.includes(m.id) || !!add;
    const ov = (m.overrides || {})[meta.id] || 'inherit';
    const on = !inAgr ? false : ov === 'inherit' ? m.on : ov === 'on';
    const fo = (m.featOverrides || {})[meta.id] || {};
    const feats = m.features.filter(f => {
      const v = fo[f.id] || 'inherit';
      return v === 'inherit' ? f.on : v === 'on';
    }).length;
    return {
      m, on, feats, foN: Object.keys(fo).length,
      src: !inAgr ? `Not in ${agr ? agr.ref : 'the agreement'}` : add ? `Addendum ${add.ref}` : gov.own ? `Own agreement ${agr.ref}` : ov === 'inherit' ? 'Inherited from company' : `Set ${ov} at this branch`,
      kind: !inAgr ? 'locked' : add ? 'addendum' : gov.own ? 'own' : ov === 'inherit' ? 'inherit' : 'override',
    };
  });

  const warehouses = ['Main store', 'Overflow yard'].map((nm, i) => ({
    nm, code: `${(meta.id || 'BR').toUpperCase()}-WH${i + 1}`, type: i === 0 ? 'Store' : 'Warehouse', status: 'Active',
  }));

  return (
    <>
      <PageHead
        title={b.nm}
        crumbs={['Platform Admin',
          <button className="crumb-btn" key="c" onClick={() => goto('companies')}>Companies</button>,
          co.nm,
          <span className="here" key="h">{b.nm}</span>]}
        actions={
          <div className="row-flex">
            <EnterButton company={co.nm} branch={b.nm} label="Enter branch"/>
            <button className="btn btn-secondary" onClick={() => toast && toast({ title: 'Edit branch', sub: 'Form not built yet.' })}>
              <Icon name="edit" size={16}/> Edit
            </button>
            <button className={`btn ${active ? 'btn-danger' : 'btn-secondary'}`}
              onClick={() => { setActive(a => !a); toast && toast({ title: active ? `${b.nm} deactivated` : `${b.nm} reactivated`, sub: active ? 'Operational — the owner can reverse this. Not a suspension.' : 'Trading again.' }); }}>
              {active ? 'Deactivate' : 'Reactivate'}
            </button>
          </div>
        }/>

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div className="bd-hd">
          <div className="bd-ico"><Icon name="map" size={22}/></div>
          <div style={{ flex: '1 1 240px', minWidth: 0 }}>
            <div className="bd-nm">
              {b.nm}
              <span className={`ent-own${fr ? ' fr' : ''}`}>{fr ? 'Franchised' : 'Company-owned'}</span>
              <Pill tone={active ? 'success' : 'warn'}>{active ? 'Active' : 'Deactivated'}</Pill>
            </div>
            <div className="bd-meta">
              {meta.city} · code {(meta.id || '').toUpperCase()} · branch of {co.nm}
            </div>
          </div>
        </div>
        <dl className="kv" style={{ marginTop: 18, gridTemplateColumns: '150px 1fr' }}>
          <dt>Ownership</dt>
          <dd>{fr ? 'Franchised — a separate business operating under the group' : 'Company-owned — operated by the group'}</dd>
          <dt>Owner</dt>
          <dd>
            {b.owner
              ? b.owner
              : branchNeedsOwner(b)
                ? <span style={{ color: 'var(--danger-fg)', fontWeight: 500 }}>Unassigned — a franchise needs its own signer</span>
                : <span className="muted">Group-run — no separate owner, which is normal for a company-owned branch</span>}
          </dd>
          <dt>Financials</dt>
          <dd>
            {fr
              ? <>Own chart of accounts and its own P&amp;L. {co.nm} sees it consolidated; {b.owner || 'the franchisee'} sees only this branch.</>
              : <>Posts to the {co.nm} ledger and rolls into the group P&amp;L.</>}
          </dd>
          <dt>Billing</dt>
          <dd>
            {meta.billing === 'own'
              ? <>Own sub-account — invoiced directly by Neovatus</>
              : <>Billed to {co.nm}{agr ? <> under {agr.ref}</> : null}</>}
          </dd>
          <dt>Agreement</dt>
          <dd>
            {!agr ? <span className="muted" style={{ fontSize: 12.5 }}>None on file for {co.nm}</span> : <>
            <AgreementChip agreement={agr} showRef/>{' '}
            <span className="muted" style={{ fontSize: 12 }}>
              {gov.own ? 'this franchise’s own contract' : 'held by the group'}
            </span>
            {gov.own && gov.group && (
              <div style={{ marginTop: 6, fontSize: 12, color: 'var(--fg-3)', fontWeight: 400 }}>
                The group’s <b style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>{gov.group.ref}</b> expires separately
                — <AgreementChip agreement={gov.group}/>. Neither renewal affects the other.
              </div>
            )}
            </>}
          </dd>
        </dl>
      </div>

      {gov.own && agr && (
        <div style={{ marginBottom: 16 }}>
          <AgreementCard agreement={agr} tenant={b.nm}
            onRenew={() => toast && toast({ title: `Renewal started for ${b.nm}`, sub: `${agr.ref} · this franchise's own contract, separate from the group's.` })}/>
        </div>
      )}

      <div className="rgrid rgrid-7-5">
        <div>
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">Entitlements here</div>
                <div className="card-sub">Resolved: agreement ceiling → company default → this branch</div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => goto('entitlements')}>Edit</button>
            </div>
            {!hasEnt ? (
              <div className="card-pad">
                <div className="notice">
                  <span className="dot"/>
                  <div>
                    <b>No entitlement record for {co.nm}</b>
                    <p>This company predates the agreement model. Attach an agreement and its module ceiling, then this branch resolves against it.</p>
                  </div>
                </div>
              </div>
            ) : (
            <div style={{ padding: '4px 0' }}>
              {rows.map(r => (
                <div key={r.m.id} className={`bd-mod ${r.kind}`}>
                  <div className="bd-mod-ico"><Icon name={r.m.icon} size={15}/></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="bd-mod-nm">{r.m.nm}</div>
                    <div className="bd-mod-src">
                      {r.src}
                      {r.on && r.foN > 0 && <> · {r.feats} of {r.m.features.length} features · {r.foN} set here</>}
                    </div>
                  </div>
                  <span className={`bd-tag ${r.kind}`}>
                    {r.kind === 'locked' ? 'Not entitled' : r.kind === 'addendum' ? 'Addendum' : r.kind === 'own' ? 'Own agreement' : r.kind === 'override' ? 'Overridden' : 'Inherited'}
                  </span>
                  <span className={`ent-eff${r.on ? ' yes' : ''}`}>
                    <Icon name={r.on ? 'checkCircle' : 'x'} size={13}/>
                    {r.on ? 'Active' : 'Off'}
                  </span>
                </div>
              ))}
            </div>
            )}
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <div className="card-head">
              <div className="card-title">Warehouses &amp; stores</div>
              <button className="btn btn-secondary btn-sm" onClick={() => toast && toast({ title: 'Add warehouse', sub: 'Form not built yet.' })}>
                <Icon name="plus" size={12}/> Add
              </button>
            </div>
            <div className="tbl-scroll">
              <table className="tbl">
                <thead><tr><th>Name</th><th>Code</th><th>Type</th><th>Status</th><th style={{ width: 1 }}></th></tr></thead>
                <tbody>
                  {warehouses.map(w => (
                    <tr key={w.code}>
                      <td style={{ fontWeight: 500 }}>{w.nm}</td>
                      <td data-label="Code" style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5 }}>{w.code}</td>
                      <td data-label="Type"><span className="muted">{w.type}</span></td>
                      <td data-label="Status"><Pill tone="success">{w.status}</Pill></td>
                      <td data-label=""><button className="btn btn-secondary btn-sm">Edit</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {addenda.length > 0 && (
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">Addenda</div>
                  <div className="card-sub">Bought by this franchise, not the group</div>
                </div>
              </div>
              <div className="card-pad" style={{ paddingTop: 4 }}>
                {addenda.map(a => (
                  <div key={a.ref} style={{ paddingBottom: 12 }}>
                    <div className="add-nm2">{a.mods.map(id => (ENT_MODULES.find(m => m.id === id) || {}).nm).join(', ')}</div>
                    <div className="add-ref2">{a.ref}</div>
                    <p className="add-note2">{a.note}</p>
                    <span className={`ent-bill${a.billTo === 'own' ? ' own' : ''}`}>
                      {a.billTo === 'own' ? 'Own billing account' : 'Billed to group'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-head"><div className="card-title">Deactivate vs suspend</div></div>
            <div className="card-pad" style={{ paddingTop: 4 }}>
              <div className="wdw">
                <div className="wdw-hd">Deactivate — the owner</div>
                <p>Operational. The shop is shut for renovation. Reversible by the company owner, no agreement change.</p>
              </div>
              <div className="wdw">
                <div className="wdw-hd">Suspend — Neovatus</div>
                <p>Commercial. Non-payment or a compliance hold. Only you can lift it. Two different words on purpose: one button for both is how a paying customer's shop gets shut off by accident.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .bd-hd { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
        .bd-ico { width: 52px; height: 52px; border-radius: var(--r-lg); background: var(--bg-soft); color: var(--fg-2); display: grid; place-items: center; flex-shrink: 0; }
        .bd-nm { font-size: 20px; font-weight: 700; letter-spacing: -.02em; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .bd-meta { font-size: 12.5px; color: var(--fg-3); margin-top: 4px; }
        .bd-mod { display: flex; align-items: center; gap: 12px; padding: 11px 20px; border-bottom: 1px solid var(--border); }
        .bd-mod:last-child { border-bottom: 0; }
        .bd-mod.locked { background: var(--bg-soft); }
        .bd-mod-ico { width: 28px; height: 28px; border-radius: var(--r-sm); background: var(--bg-soft); color: var(--fg-2); display: grid; place-items: center; flex-shrink: 0; }
        .bd-mod.locked .bd-mod-ico { background: var(--bg-elev); color: var(--fg-4); }
        .bd-mod-nm { font-size: 13px; font-weight: 600; }
        .bd-mod.locked .bd-mod-nm { color: var(--fg-3); }
        .bd-mod-src { font-size: 11.5px; color: var(--fg-3); margin-top: 2px; }
        .bd-tag { font-size: 10px; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; padding: 2px 7px; border-radius: 4px; background: var(--bg-soft); color: var(--fg-3); white-space: nowrap; }
        .bd-mod.locked .bd-tag { background: var(--warn-bg); color: var(--warn-fg); }
        .bd-tag.override { background: var(--accent); color: var(--accent-fg); }
        .bd-tag.addendum { background: var(--info-bg); color: var(--info-fg); }
        .bd-tag.own { background: var(--success-bg); color: var(--success-fg); }
        .add-nm2 { font-size: 13.5px; font-weight: 600; }
        .add-ref2 { font-family: var(--font-mono); font-size: 11px; color: var(--fg-3); margin-top: 2px; }
        .add-note2 { font-size: 12.5px; color: var(--fg-2); line-height: 1.55; margin: 8px 0 10px; }
        @media (max-width: 720px) { .bd-mod { flex-wrap: wrap; } }
      `}</style>
    </>
  );
}

Object.assign(window, { BranchDetail });
