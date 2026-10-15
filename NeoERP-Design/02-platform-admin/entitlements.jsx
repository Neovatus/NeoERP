// NeoERP — Entitlements: module → feature → per-branch override.
// Branch overrides are tri-state (inherit / on / off) because "off" and
// "not set" are different facts, and franchised branches diverge on purpose.

function Entitlements({ goto }) {
  const [tenant, setTenant] = useState('lahore');
  const [mods, setMods] = useState(() => JSON.parse(JSON.stringify(ENT_MODULES)));
  const [open, setOpen] = useState('payroll');
  const [openBranch, setOpenBranch] = useState(null);
  const [log, setLog] = useState(() => ENT_CHANGES.map(x => ({ ...x })));
  const toast = useToast();
  const { request, modal: reasonModal } = useReasonGate(({ label, reason, ref }) => {
    setLog(l => [{ when: 'Just now', who: 'Priya Raman', what: label, why: reason, ref: ref || '—' }, ...l]);
    toast && toast({ title: label, sub: `Recorded${ref ? ` against ${ref}` : ''} in the change history.` });
  });
  const p = usePlatform() || {};
  const co = TENANT_TREE.find(c => c.id === tenant) || TENANT_TREE[0];

  const setModule = (id, patch) => setMods(ms => ms.map(m => m.id === id ? { ...m, ...patch } : m));
  const toggleModule = (m, outside) => request({
    kind: 'module', mid: m.id,
    // Enabling something the agreement doesn't cover is allowed — you own the
    // agreement. It just has to be recorded as an extension, not a toggle.
    extends: outside && !m.on,
    label: `${m.nm} ${m.on ? 'disabled' : 'enabled'} for ${co.nm}`,
    apply: () => setModule(m.id, { on: !m.on }),
  });
  const setFeature = (mid, fid) => setMods(ms => ms.map(m => m.id !== mid ? m
    : { ...m, features: m.features.map(f => f.id === fid ? { ...f, on: !f.on } : f) }));
  const toggleFeature = (m, f) => request({
    kind: 'feature',
    label: `${m.nm} · ${f.nm} ${f.on ? 'disabled' : 'enabled'} for ${co.nm}`,
    reasonHint: 'Feature-level changes are recorded the same as modules.',
    apply: () => setFeature(m.id, f.id),
  });
  const requestOverride = (m, bid, bnm, val) => {
    const current = m.overrides[bid] || 'inherit';
    if (current === val) return;
    const willBeOn = val === 'inherit' ? m.on : val === 'on';
    const outside = willBeOn && !entitled.includes(m.id) && !addendumFor(bnm, m.id);
    request({
      kind: 'override', mid: m.id,
      // Same rule as the module toggle: a branch can be switched on outside
      // the agreement, but only as a recorded extension.
      extends: outside,
      label: `${m.nm} at ${bnm} set to ${val === 'inherit' ? 'inherit from company' : val}`,
      apply: () => setOverride(m.id, bid, val),
    });
  };

  const setFeatOverride = (mid, bid, fid, val) => setMods(ms => ms.map(m => {
    if (m.id !== mid) return m;
    const fo = { ...(m.featOverrides || {}) };
    const forBranch = { ...(fo[bid] || {}) };
    if (val === 'inherit') delete forBranch[fid]; else forBranch[fid] = val;
    if (Object.keys(forBranch).length) fo[bid] = forBranch; else delete fo[bid];
    return { ...m, featOverrides: fo };
  }));

  const requestFeatOverride = (m, bid, bnm, f, val) => {
    const current = ((m.featOverrides || {})[bid] || {})[f.id] || 'inherit';
    if (current === val) return;
    request({
      kind: 'feature-override', mid: m.id,
      label: `${m.nm} · ${f.nm} at ${bnm} set to ${val === 'inherit' ? 'inherit' : val}`,
      apply: () => setFeatOverride(m.id, bid, f.id, val),
    });
  };

  const setOverride = (mid, bid, val) => setMods(ms => ms.map(m => {
    if (m.id !== mid) return m;
    const next = { ...m.overrides };
    if (val === 'inherit') delete next[bid]; else next[bid] = val;
    return { ...m, overrides: next };
  }));

  const entitled = co.entitled || [];
  const addenda = co.addenda || [];
  // A module is available at a branch either through the group agreement, or
  // through an addendum scoped to that branch and billed to it.
  const addendumFor = (bnm, mid) => addenda.find(a => a.branch === bnm && a.mods.includes(mid));
  const onCount = mods.filter(m => m.on).length;
  const enabled = mods.filter(m => m.on && entitled.includes(m.id)).length;
  const extensions = onCount - enabled;

  return (
    <>
      <PageHead
        title="Entitlements"
        crumbs={['Super Admin', 'Companies', <span className="here" key="h">{co.nm}</span>]}
        actions={
          <div className="row-flex">
            <select className="input ent-tenant" value={tenant} onChange={(e) => setTenant(e.target.value)} aria-label="Company">
              {TENANT_TREE.map(c => <option key={c.id} value={c.id}>{c.nm}</option>)}
            </select>
            <EnterButton company={co.nm} label="Enter company"/>
          </div>
        }/>

      <div className="ent-summary card card-pad">
        <div className="ent-sum-item">
          <div className="ent-sum-n">
            {enabled}<span className="ent-sum-of"> / {entitled.length}</span>
            {extensions > 0 && <span className="ent-sum-ext">+{extensions}</span>}
          </div>
          <div className="ent-sum-l">
            {extensions > 0
              ? <>In agreement, plus <b style={{ color: 'var(--danger-fg)' }}>{extensions} extension{extensions > 1 ? 's' : ''}</b> awaiting renewal</>
              : <>Modules on, of {entitled.length} in the agreement</>}
          </div>
        </div>
        <div className="ent-sum-item">
          <div className="ent-sum-n">{co.branches.length}</div>
          <div className="ent-sum-l">Branches · {co.branches.filter(b => b.ownership === 'franchise').length} franchised</div>
        </div>
        <div className="ent-sum-item">
          <div className="ent-sum-n">{mods.reduce((n, m) => n + Object.values(m.overrides).filter(v => v !== 'inherit').length, 0)}</div>
          <div className="ent-sum-l">Branch overrides in force</div>
        </div>
        <div className="ent-sum-item">
          <div className="ent-sum-n" style={{ fontSize: 15, fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{co.agreement.ref}</div>
          <div className="ent-sum-l">{co.agreement.term} · {co.users} users · {co.country}</div>
        </div>
      </div>

      <div className="rgrid rgrid-2" style={{ marginTop: 16 }}>
        <AgreementCard agreement={co.agreement} tenant={co.nm}
          onRenew={() => toast && toast({ title: `Renewal started for ${co.nm}`, sub: `${co.agreement.ref} · modules and limits carry over unless changed.` })}/>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Limits</div>
              <div className="card-sub">Hard ceilings — the tenant is blocked, not billed, at the line</div>
            </div>
          </div>
          <div className="card-pad" style={{ paddingTop: 4 }}>
            {[['Users', ENT_LIMITS.users], ['Branches', ENT_LIMITS.branches], ['Warehouses', ENT_LIMITS.warehouses]].map(([nm, l]) => {
              const over = l.used > l.limit;
              const pct = Math.min(100, Math.round((l.used / l.limit) * 100));
              return (
                <div key={nm} className="lim">
                  <div className="lim-hd">
                    <span>{nm}</span>
                    <span className={over ? 'lim-over' : 'muted'}>{l.used} of {l.limit}{over ? ' · over' : ''}</span>
                  </div>
                  <div className="lim-track"><div className={`lim-fill${over ? ' over' : ''}`} style={{ width: `${pct}%` }}/></div>
                  {over && <div className="lim-note">Provisioned above the agreement. Raise the limit or the tenant stays blocked from adding more.</div>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Change history</div>
              <div className="card-sub">Every entitlement change carries a reason</div>
            </div>
          </div>
          <div className="card-pad" style={{ paddingTop: 4, maxHeight: 260, overflowY: 'auto' }}>
            {log.map((x, i) => (
              <div key={i} className="chg">
                <div className="chg-hd">
                  <span className="chg-what">{x.what}</span>
                  <span className="chg-ref">{x.ref}</span>
                </div>
                <div className="chg-why">“{x.why}”</div>
                <div className="chg-who">{x.who} · {x.when}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section-head">
        <div>
          <h2>Modules</h2>
          <p>Company default cascades to every branch that hasn't overridden it.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {mods.map(m => {
          const isOpen = open === m.id;
          const ovCount = Object.values(m.overrides).filter(v => v !== 'inherit').length;
          const foCount = Object.values(m.featOverrides || {}).reduce((n, o) => n + Object.keys(o).length, 0);
          const featOn = m.features.filter(f => f.on).length;
          const inAgr = entitled.includes(m.id);
          const viaAddenda = addenda.filter(x => x.mods.includes(m.id));
          return (
            <div key={m.id} className={`card ent-card${m.on ? '' : ' off'}${!inAgr ? ' locked' : ''}`}>
              <div className="ent-hd">
                <button className="ent-expand" onClick={() => setOpen(isOpen ? null : m.id)} aria-expanded={isOpen}>
                  <Icon name="chev" size={14} className={`ent-chev${isOpen ? ' open' : ''}`}/>
                </button>
                <div className="ent-icon"><Icon name={m.icon} size={18}/></div>
                <div className="ent-name">
                  <div className="ent-nm">{m.nm}</div>
                  <div className="ent-meta">
                    {m.on ? `${featOn} of ${m.features.length} features` : 'Disabled'}
                    {m.on && m.seats.limit > 0 && <> · {m.seats.used}/{m.seats.limit} seats</>}
                    {!inAgr && <> · </>}
                    {!inAgr && <>Not in {co.agreement.ref}</>}
                    {!inAgr && viaAddenda.length > 0 && <> · <b className="ent-ov">via addendum at {viaAddenda.map(x => x.branch).join(', ')}</b></>}
                    {inAgr && ovCount > 0 && <> · <b className="ent-ov">{ovCount} branch override{ovCount > 1 ? 's' : ''}</b></>}
                    {foCount > 0 && <> · <b className="ent-ov">{foCount} feature override{foCount > 1 ? 's' : ''}</b></>}
                  </div>
                </div>
                {inAgr
                  ? <Pill tone="default">In agreement</Pill>
                  : <Pill tone="warn">Outside agreement</Pill>}
                <Switch checked={m.on} onChange={() => toggleModule(m, !inAgr)}/>
              </div>

              {isOpen && !inAgr && (
                <div className="ent-body">
                  <div className="notice">
                    <span className="dot"/>
                    <div>
                      <b>Not in {co.agreement.ref}</b>
                      <p>
                        You can still switch {m.nm} on — here or at a single branch — but it will be recorded as an
                        extension with a reference, and it shows as outside the agreement until renewal absorbs it.
                      </p>
                    </div>
                  </div>
                  {viaAddenda.length > 0 && (
                    <>
                      <div className="ent-sub-hd" style={{ marginTop: 20 }}>
                        Available by addendum
                        <span className="ent-sub-note">A franchise can buy what the group hasn't.</span>
                      </div>
                      {viaAddenda.map(x => (
                        <div key={x.ref} className="add-row">
                          <div className="add-ico"><Icon name="layers" size={15}/></div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="add-nm">{x.branch} <span className="add-ref">{x.ref}</span></div>
                            <div className="add-note">{x.note}</div>
                          </div>
                          <span className={`ent-bill${x.billTo === 'own' ? ' own' : ''}`}>
                            {x.billTo === 'own' ? 'Own billing account' : 'Billed to group'}
                          </span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}

              {isOpen && (
                <div className="ent-body" style={inAgr ? undefined : { paddingTop: 0 }}>
                  {!m.on && (
                    <div className="notice" style={{ marginBottom: 18 }}>
                      <span className="dot"/>
                      <div>
                        <b>Module is off for {co.nm}</b>
                        <p>Feature and branch settings below are retained, and take effect again if you re-enable the module.</p>
                      </div>
                    </div>
                  )}

                  <div className="ent-sub-hd">Features</div>
                  <div className="ent-feats">
                    {m.features.map(f => (
                      <div key={f.id} className="ent-feat">
                        <Switch checked={f.on} onChange={() => toggleFeature(m, f)}/>
                        <span className="ent-feat-nm">{f.nm}</span>
                        {f.tag && <span className={`ent-tag${f.tag === 'Beta' ? ' beta' : f.tag === 'Add-on' ? ' addon' : ' region'}`}>{f.tag}</span>}
                      </div>
                    ))}
                  </div>

                  <div className="ent-sub-hd" style={{ marginTop: 22 }}>
                    Branch overrides
                    <span className="ent-sub-note">Franchised branches are separate businesses — they often need a different answer than the group.</span>
                  </div>
                  <div className="ent-branches">
                    {co.branches.map(b => {
                      const bid = (ENT_BRANCHES.find(x => x.nm === b.nm) || {}).id || b.nm;
                      const val = m.overrides[bid] || 'inherit';
                      const effective = val === 'inherit' ? m.on : val === 'on';
                      const bKey = `${m.id}:${bid}`;
                      const bOpen = openBranch === bKey;
                      const fo = (m.featOverrides || {})[bid] || {};
                      const foN = Object.keys(fo).length;
                      const bFeatOn = m.features.filter(f => {
                        const v = fo[f.id] || 'inherit';
                        return v === 'inherit' ? f.on : v === 'on';
                      }).length;
                      return (
                        <div key={b.nm} className={`ent-branch-wrap${bOpen ? ' open' : ''}`}>
                        <div className={`ent-branch${val !== 'inherit' ? ' overridden' : ''}`}>
                          <div className="ent-branch-nm">
                            {b.nm}
                            <span className={`ent-own${b.ownership === 'franchise' ? ' fr' : ''}`}>
                              {b.ownership === 'franchise' ? 'Franchised' : 'Company-owned'}
                            </span>
                          </div>
                          <div className="ent-branch-meta">
                            {b.owner ? `Owner · ${b.owner}` : <span className="ent-noowner">No owner assigned</span>}
                            {' · '}
                            {(ENT_BRANCHES.find(x => x.nm === b.nm) || {}).billing === 'own'
                              ? <span className="ent-bill own">Own billing account</span>
                              : <span className="ent-bill">Billed to group</span>}
                            {b.agreement && <> · <span className="ent-bill own">Own agreement {b.agreement.ref}</span></>}
                            {' · '}
                            {val === 'inherit'
                              ? <>Inherits <b>{m.on ? 'on' : 'off'}</b> from company</>
                              : <>Overridden to <b>{val}</b></>}
                          </div>
                          <div className="tri" role="group" aria-label={`${m.nm} for ${b.nm}`}>
                            {['inherit', 'on', 'off'].map(o => (
                              <button key={o} className={`tri-opt${val === o ? ' on' : ''}`}
                                onClick={() => requestOverride(m, bid, b.nm, o)} aria-pressed={val === o}>
                                {o === 'inherit' ? 'Inherit' : o === 'on' ? 'On' : 'Off'}
                              </button>
                            ))}
                          </div>
                          <span className={`ent-eff${effective ? ' yes' : ''}`}>
                            <Icon name={effective ? 'checkCircle' : 'x'} size={13}/>
                            {effective ? 'Active' : 'Not active'}
                          </span>
                        </div>

                        {effective && (
                          <button className="ent-feat-toggle" onClick={() => setOpenBranch(bOpen ? null : bKey)} aria-expanded={bOpen}>
                            <Icon name="chev" size={13} className={`ent-chev${bOpen ? ' open' : ''}`}/>
                            {foN > 0
                              ? <span>Features · <b>{bFeatOn} of {m.features.length} on</b> · {foN} set here</span>
                              : <span>Features · inherits all {m.features.length} from company</span>}
                          </button>
                        )}

                        {effective && bOpen && (
                          <div className="ent-featgrid">
                            {m.features.map(f => {
                              const fv = fo[f.id] || 'inherit';
                              const feff = fv === 'inherit' ? f.on : fv === 'on';
                              return (
                                <div key={f.id} className={`ent-featrow${fv !== 'inherit' ? ' overridden' : ''}`}>
                                  <div className="ent-featnm">
                                    {f.nm}
                                    {f.tag && <span className={`ent-tag${f.tag === 'Beta' ? ' beta' : f.tag === 'Add-on' ? ' addon' : ' region'}`}>{f.tag}</span>}
                                  </div>
                                  <div className="ent-featsrc">
                                    {fv === 'inherit' ? <>Inherits <b>{f.on ? 'on' : 'off'}</b></> : <>Set <b>{fv}</b> here</>}
                                  </div>
                                  <div className="tri sm">
                                    {['inherit', 'on', 'off'].map(o => (
                                      <button key={o} className={`tri-opt${fv === o ? ' on' : ''}`}
                                        onClick={() => requestFeatOverride(m, bid, b.nm, f, o)} aria-pressed={fv === o}>
                                        {o === 'inherit' ? 'Inherit' : o === 'on' ? 'On' : 'Off'}
                                      </button>
                                    ))}
                                  </div>
                                  <span className={`ent-eff${feff ? ' yes' : ''}`}>
                                    <Icon name={feff ? 'checkCircle' : 'x'} size={12}/>
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {reasonModal}

      <style>{`
        .lim { padding: 11px 0; border-top: 1px solid var(--border); }
        .lim:first-child { border-top: 0; padding-top: 0; }
        .lim-hd { display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 6px; }
        .lim-over { color: var(--danger-fg); font-weight: 600; }
        .lim-track { height: 6px; border-radius: 999px; background: var(--bg-soft); overflow: hidden; }
        .lim-fill { height: 100%; border-radius: 999px; background: var(--fg); transition: width 400ms var(--ease-out); }
        .lim-fill.over { background: var(--danger-fg); }
        .lim-note { font-size: 11.5px; color: var(--danger-fg); margin-top: 6px; line-height: 1.45; }

        .chg { padding: 11px 0; border-top: 1px solid var(--border); }
        .chg:first-child { border-top: 0; padding-top: 0; }
        .chg-hd { display: flex; align-items: baseline; gap: 10px; }
        .chg-what { font-size: 12.5px; font-weight: 500; flex: 1; line-height: 1.45; }
        .chg-ref { font-family: var(--font-mono); font-size: 10.5px; color: var(--fg-3); background: var(--bg-soft); padding: 2px 6px; border-radius: 4px; white-space: nowrap; }
        .chg-why { font-size: 11.5px; color: var(--fg-3); font-style: italic; margin-top: 3px; }
        .chg-who { font-size: 11px; color: var(--fg-4); margin-top: 3px; }

        .pend { padding: 12px 14px; background: var(--bg-soft); border-radius: var(--r-md); }
        .pend-l { font-size: 10.5px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--fg-4); margin-bottom: 4px; }
        .pend-v { font-size: 13.5px; font-weight: 500; }


        .ent-tenant { width: auto; min-width: 190px; height: 40px; font-size: 13px; }
        .ent-summary { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px; margin-bottom: 8px; }
        .ent-sum-n { font-size: 22px; font-weight: 700; letter-spacing: -.02em; line-height: 1.1; }
        .ent-sum-of { font-size: 14px; font-weight: 500; color: var(--fg-4); }
        .ent-sum-l { font-size: 12px; color: var(--fg-3); margin-top: 4px; }

        .ent-card.off { background: var(--bg-soft); }
        .ent-card.locked .ent-nm { color: var(--fg); }
        .ent-card.locked.off .ent-nm { color: var(--fg-3); }
        .ent-sum-ext { font-size: 14px; font-weight: 700; color: var(--danger-fg); margin-left: 6px; }
        .add-row { display: flex; align-items: center; gap: 12px; padding: 11px 14px; border: 1px solid var(--border); border-radius: var(--r-md); background: var(--bg); }
        .add-ico { width: 30px; height: 30px; border-radius: var(--r-sm); background: var(--bg-soft); color: var(--fg-2); display: grid; place-items: center; flex-shrink: 0; }
        .add-nm { font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .add-ref { font-family: var(--font-mono); font-size: 10.5px; font-weight: 400; color: var(--fg-3); background: var(--bg-soft); padding: 2px 6px; border-radius: 4px; }
        .add-note { font-size: 11.5px; color: var(--fg-3); margin-top: 2px; line-height: 1.45; }
        .ent-hd { display: flex; align-items: center; gap: 12px; padding: 14px 18px; }
        .ent-expand { width: 24px; height: 24px; display: grid; place-items: center; border: 0; background: transparent; color: var(--fg-3); cursor: default; border-radius: var(--r-sm); flex-shrink: 0; }
        .ent-expand:hover { background: var(--surface-hover); color: var(--fg); }
        .ent-chev { transform: rotate(-90deg); transition: transform var(--m-fast); }
        .ent-chev.open { transform: rotate(0deg); }
        .ent-icon { width: 36px; height: 36px; border-radius: var(--r-md); background: var(--bg-soft); display: grid; place-items: center; color: var(--fg-2); flex-shrink: 0; }
        .ent-card.off .ent-icon { background: var(--bg-elev); color: var(--fg-4); }
        .ent-name { flex: 1; min-width: 0; }
        .ent-nm { font-size: 14px; font-weight: 600; letter-spacing: -.01em; }
        .ent-meta { font-size: 12px; color: var(--fg-3); margin-top: 2px; }
        .ent-ov { color: var(--warn-fg); font-weight: 600; }

        .ent-body { padding: 4px 18px 20px 60px; border-top: 1px solid var(--border); }
        .ent-feats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 24px; }
        .ent-feat { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .ent-feat-nm { font-size: 13px; }

        .ent-branches { display: flex; flex-direction: column; gap: 6px; }
        .ent-branch-wrap { border: 1px solid var(--border); border-radius: var(--r-md); overflow: hidden; }
        .ent-branch-wrap.open { border-color: var(--border-strong); }
        .ent-branch-wrap > .ent-branch { border: 0; border-radius: 0; }
        .ent-feat-toggle { display: flex; align-items: center; gap: 8px; width: 100%; padding: 8px 14px; border: 0;
          border-top: 1px solid var(--border); background: var(--bg-soft); color: var(--fg-3); font-size: 11.5px; cursor: default; text-align: left; }
        .ent-feat-toggle:hover { color: var(--fg); }
        .ent-feat-toggle b { color: var(--fg-2); font-weight: 600; }
        .ent-featgrid { border-top: 1px solid var(--border); }
        .ent-featrow { display: grid; grid-template-columns: minmax(0, 1fr) 150px auto auto; gap: 14px; align-items: center;
          padding: 9px 14px; border-top: 1px solid var(--border); }
        .ent-featrow:first-child { border-top: 0; }
        .ent-featrow.overridden { background: var(--bg-soft); }
        .ent-featnm { font-size: 12.5px; display: flex; align-items: center; gap: 8px; min-width: 0; }
        .ent-featsrc { font-size: 11px; color: var(--fg-3); }
        .ent-featsrc b { color: var(--fg-2); font-weight: 600; }
        @media (max-width: 720px) { .ent-featrow { grid-template-columns: 1fr; gap: 6px; } }
        .ent-branch { display: grid; grid-template-columns: 1fr auto auto; grid-template-areas: 'nm tri eff' 'meta tri eff';
          gap: 2px 16px; align-items: center; padding: 11px 14px; border: 1px solid var(--border); border-radius: var(--r-md); }
        .ent-branch.overridden { border-color: var(--warn-dot); background: var(--bg-soft); }
        .ent-branch-nm { grid-area: nm; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .ent-branch.overridden .ent-own { background: var(--bg-elev); }
        .ent-branch-meta { grid-area: meta; font-size: 11.5px; color: var(--fg-3); }
        .ent-noowner { color: var(--danger-fg); font-weight: 500; }
        .ent-branch.overridden .tri { background: var(--bg-elev); }

        @media (max-width: 1024px) { .ent-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 720px) {
          .ent-summary { grid-template-columns: 1fr; gap: 14px; }
          .ent-body { padding-left: 18px; }
          .ent-feats { grid-template-columns: 1fr; }
          .ent-branch { grid-template-columns: 1fr; grid-template-areas: 'nm' 'meta' 'tri' 'eff'; gap: 8px; }
          .tri { justify-content: stretch; }
          .tri-opt { flex: 1; }
        }
      `}</style>
    </>
  );
}

Object.assign(window, { Entitlements });
