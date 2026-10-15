// NeoERP — Super Admin dashboard.
// Split: work queue on the left (why you opened this page), platform state on the right.

function PlatformDashboard({ goto }) {
  const [filter, setFilter] = useState('All');
  const toast = useToast();
  const p = usePlatform() || {};
  const [done, setDone] = useState([]);

  const items = QUEUE.filter(q => !done.includes(q.id));
  const shown = filter === 'All' ? items : items.filter(q => q.group === filter);
  const critical = items.filter(q => q.sev === 'danger').length;

  const grouped = QUEUE_GROUPS
    .map(g => ({ g, rows: shown.filter(q => q.group === g) }))
    .filter(x => x.rows.length);

  // §5: only some of these CTAs are a contract event (an amendment or a
  // renewal). Those go through the reason gate with a required reference;
  // the rest are plain queue triage and say so honestly — they were never
  // "recorded in the platform audit log" and shouldn't have claimed to be.
  const CONTRACT_CTAS = ['Amend agreement', 'Start renewal'];
  const { request, modal: reasonModal } = useReasonGate(({ label, sub, ref }) => {
    toast && toast({ title: label, sub: `${sub} Filed against ${ref}.` });
  });

  const resolve = (q) => {
    if (CONTRACT_CTAS.includes(q.cta)) {
      request({
        kind: 'queue-contract',
        label: `${q.cta} — ${q.tenant}`,
        sub: q.sub,
        showRef: true, refRequired: true,
        reasonHint: 'What’s changing, or why now — shown in the platform audit log.',
        refHint: 'Required — an agreement change needs a reference.',
        noticeTitle: 'This is a contract event',
        noticeBody: 'Amending or renewing an agreement is recorded against a reference, the same as on the Entitlements and Agreements screens.',
        apply: () => setDone(d => [...d, q.id]),
      });
      return;
    }
    setDone(d => [...d, q.id]);
    toast && toast({ title: `${q.cta} — ${q.tenant}`, sub: 'Marked done in the work queue.' });
  };

  if (p.session) {
    const s = p.session;
    // Owners land on the tenant's own first-run surface, not a platform view.
    if (s.role === 'Company Owner' || s.role === 'Branch Owner') {
      return <FirstRun session={s} onExit={p.exit} onGoto={goto}/>;
    }
    return (
      <>
        <PageHead
          title={s.branch || s.company}
          crumbs={[s.company, ...(s.branch ? [s.branch] : []), <span className="here" key="h">{s.role}</span>]}/>
        <div className="card card-pad-lg scoped-stub">
          <div className="stub-ico"><Icon name={s.branch ? 'map' : 'building'} size={22}/></div>
          <h3>The {s.role} dashboard isn't built yet</h3>
          <p>
            You are inside <b>{s.company}</b>{s.branch ? <> at <b>{s.branch}</b></> : null} as a <b>{s.role}</b>.
            Platform metrics are deliberately hidden here — showing 128 companies and 1,847 users while the banner
            says you are one tenant's {s.role.toLowerCase()} would make the banner untrustworthy.
          </p>
          <p className="stub-next">Tenant dashboards are next: company owner, franchise owner, then the role-scoped views.</p>
          <button className="btn btn-secondary" onClick={p.exit}>
            <Icon name="arrowL" size={16}/> Exit to platform
          </button>
        </div>
        <style>{`
          .scoped-stub { max-width: 560px; text-align: center; margin: 8px auto 0; }
          .stub-ico { width: 48px; height: 48px; border-radius: var(--r-lg); background: var(--bg-soft); color: var(--fg-2); display: grid; place-items: center; margin: 0 auto 16px; }
          .scoped-stub h3 { font-size: 17px; font-weight: 600; letter-spacing: -.015em; margin: 0 0 10px; }
          .scoped-stub p { font-size: 13.5px; color: var(--fg-3); line-height: 1.6; margin: 0 auto 14px; max-width: 46ch; text-wrap: pretty; }
          .scoped-stub p b { color: var(--fg-2); font-weight: 600; }
          .stub-next { font-size: 12.5px !important; color: var(--fg-4) !important; margin-bottom: 20px !important; }
        `}</style>
      </>
    );
  }

  return (
    <>
      <PageHead
        title="Platform"
        crumbs={['Super Admin', <span className="here" key="h">Overview</span>]}
        actions={
          <div className="row-flex">
            <button className="btn btn-secondary" onClick={() => goto('people')}>
              <Icon name="users" size={16}/> People
            </button>
            <button className="btn btn-primary" onClick={() => goto('enroll')}>
              <Icon name="plus" size={16}/> Enroll company
            </button>
          </div>
        }/>

      <div className="kpi-grid">
        {PLATFORM_KPIS.map(k => (
          <div className="kpi" key={k.label}>
            <div className={`kpi-icon${k.urgent ? ' urgent' : ''}`}>
              <Icon name={k.urgent ? 'activity' : k.label === 'Companies' ? 'building' : k.label === 'Branches' ? 'map' : 'users'} size={18}/>
            </div>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
            <div className="kpi-delta">{k.delta}</div>
          </div>
        ))}
      </div>

      <div className="dash-row dash-2-1" style={{ marginTop: 16 }}>
        {/* ── Work queue ── */}
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Needs attention</div>
              <div className="card-sub">
                {items.length === 0
                  ? 'Queue is clear'
                  : `${items.length} open · ${critical} critical`}
              </div>
            </div>
            <select className="input queue-filter" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter queue">
              <option>All</option>
              {QUEUE_GROUPS.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>

          {items.length === 0 ? (
            <div className="empty">
              <Icon name="checkCircle" size={48} className="ico"/>
              <h3>Nothing needs you</h3>
              <p style={{ margin: 0, fontSize: 13 }}>No failed runs, no pending requests, no blocked onboarding.</p>
            </div>
          ) : grouped.length === 0 ? (
            <div className="empty">
              <Icon name="filter" size={48} className="ico"/>
              <h3>No items in {filter}</h3>
              <p style={{ margin: 0, fontSize: 13 }}>Other groups still have open items.</p>
            </div>
          ) : grouped.map(({ g, rows }) => (
            <div key={g} className="q-group">
              <div className="q-group-hd">
                <span>{g}</span>
                <span className="q-count">{rows.length}</span>
              </div>
              {rows.map(q => (
                <div key={q.id} className="q-row">
                  <span className={`pin ${q.sev === 'danger' ? 'danger' : q.sev === 'warn' ? 'warn' : ''}`}/>
                  <div className="q-body">
                    <div className="q-title">{q.title}</div>
                    <div className="q-sub">{q.sub}</div>
                    <div className="q-meta">
                      <button className="q-tenant" onClick={() => p.openLauncher && p.openLauncher({ company: q.tenant })}>
                        <Icon name="building" size={12}/> {q.tenant}
                      </button>
                      <span>·</span>
                      <span>{q.age === '—' ? 'scheduled' : `${q.age} ago`}</span>
                    </div>
                  </div>
                  <button className="btn btn-secondary btn-sm q-cta" onClick={() => resolve(q)}>{q.cta}</button>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* ── Platform state ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">Agreements</div>
                <div className="card-sub">Soonest first · franchises included</div>
              </div>
              <span style={{ fontSize: 12.5, color: 'var(--fg-3)' }}>{allAgreements().length}</span>
            </div>
            <div className="card-pad" style={{ paddingTop: 4, maxHeight: 300, overflowY: 'auto' }}>
              {allAgreements().map(x => {
                const st = agreementState(x.agreement);
                return (
                  <div key={x.agreement.ref} className="agr-row">
                    <span className={`pin ${st.tone === 'warn' ? 'warn' : st.tone === 'danger' ? 'danger' : ''}`}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="agr-row-nm">
                        {x.name}
                        {x.scope === 'franchise' && <span className="agr-row-scope">Franchise</span>}
                      </div>
                      <div className="agr-row-meta">
                        {x.parent ? `${x.parent} · ` : ''}{x.agreement.ref} · {x.agreement.renewal === 'auto' ? 'auto' : 'manual'}
                      </div>
                    </div>
                    <AgreementChip agreement={x.agreement}/>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <div className="card-head"><div className="card-title">Platform health</div></div>
            <div className="card-pad" style={{ paddingTop: 4 }}>
              {HEALTH.map((h, i) => (
                <div key={h.nm} className="h-row" style={{ borderTop: i === 0 ? 0 : '1px solid var(--border)' }}>
                  <span className={`pin ${h.tone === 'warn' ? 'warn' : ''}`}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="h-nm">{h.nm}</div>
                    <div className="h-meta">{h.meta}</div>
                  </div>
                  <Pill tone={h.tone}>{h.val}</Pill>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div className="card-title">Module adoption</div>
              <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>128 companies</span>
            </div>
            <div className="card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ADOPTION.map(m => (
                <div key={m.nm}>
                  <div className="ad-hd">
                    <span>{m.nm}</span>
                    <span className="muted">{m.pct}%</span>
                  </div>
                  <div className="ad-track"><div className="ad-fill" style={{ width: `${m.pct}%` }}/></div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-head"><div className="card-title">Tenants by region</div></div>
            <div className="card-pad" style={{ paddingTop: 4 }}>
              {[
                { r: 'Pakistan', n: 74, note: 'FBR · EOBI · PESSI' },
                { r: 'Norway', n: 38, note: 'Altinn · A-melding' },
                { r: 'Sweden', n: 12, note: 'Skatteverket' },
                { r: 'Denmark', n: 4, note: 'Pending statutory pack' },
              ].map((x, i) => (
                <div key={x.r} className="h-row" style={{ borderTop: i === 0 ? 0 : '1px solid var(--border)' }}>
                  <div style={{ flex: 1 }}>
                    <div className="h-nm">{x.r}</div>
                    <div className="h-meta">{x.note}</div>
                  </div>
                  <span className="num" style={{ fontSize: 15, fontWeight: 600 }}>{x.n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {reasonModal}

      <style>{`
        .kpi-icon.urgent { background: var(--danger-bg); color: var(--danger-fg); }
        .queue-filter { width: auto; min-width: 150px; height: 34px; font-size: 12.5px; }
        .q-group + .q-group { border-top: 1px solid var(--border); }
        .q-group-hd { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: var(--bg-soft);
          font-size: 10.5px; font-weight: 600; letter-spacing: .07em; text-transform: uppercase; color: var(--fg-3);
          border-bottom: 1px solid var(--border); }
        .q-count { background: var(--bg-elev); border: 1px solid var(--border); border-radius: 999px; padding: 1px 7px; letter-spacing: 0; font-size: 10.5px; }
        .q-row { display: flex; align-items: flex-start; gap: 12px; padding: 14px 20px; border-bottom: 1px solid var(--border); }
        .q-row:last-child { border-bottom: 0; }
        .q-row:hover { background: var(--bg-soft); }
        .q-row .pin { margin-top: 6px; }
        .q-body { flex: 1; min-width: 0; }
        .q-title { font-size: 13.5px; font-weight: 600; line-height: 1.4; }
        .q-sub { font-size: 12.5px; color: var(--fg-3); margin-top: 2px; line-height: 1.45; }
        .q-meta { display: flex; align-items: center; gap: 7px; margin-top: 7px; font-size: 11.5px; color: var(--fg-4); flex-wrap: wrap; }
        .q-tenant { display: inline-flex; align-items: center; gap: 5px; background: transparent; border: 0; padding: 0;
          font-size: 11.5px; font-weight: 500; color: var(--fg-2); cursor: default; }
        .q-tenant:hover { color: var(--fg); text-decoration: underline; }
        .q-cta { flex-shrink: 0; }
        .agr-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-top: 1px solid var(--border); }
        .agr-row:first-child { border-top: 0; padding-top: 0; }
        .agr-row .pin { flex-shrink: 0; }
        .agr-row-nm { font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .agr-row-scope { font-size: 9.5px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; background: var(--accent); color: var(--accent-fg); padding: 2px 5px; border-radius: 3px; }
        .agr-row-meta { font-size: 11px; color: var(--fg-3); margin-top: 2px; }
        .h-row { display: flex; align-items: center; gap: 12px; padding: 11px 0; }
        .h-row .pin { flex-shrink: 0; }
        .h-nm { font-size: 13px; font-weight: 500; }
        .h-meta { font-size: 11.5px; color: var(--fg-3); margin-top: 1px; }
        .ad-hd { display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 5px; }
        .ad-track { height: 6px; border-radius: 999px; background: var(--bg-soft); overflow: hidden; }
        .ad-fill { height: 100%; border-radius: 999px; background: var(--fg); transition: width 400ms var(--ease-out); }
        @media (max-width: 720px) {
          .q-row { flex-wrap: wrap; }
          .q-cta { width: 100%; margin-top: 4px; }
          .q-group-hd, .q-row { padding-left: 16px; padding-right: 16px; }
        }
      `}</style>
    </>
  );
}

Object.assign(window, { PlatformDashboard });
