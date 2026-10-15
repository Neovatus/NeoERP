// NeoERP — Audit log. Every reason gate in the system writes here; without this
// screen the gates collect justifications and discard them, which is ceremony.

const AUDIT = [
  { id: 'a1', at: '2026-09-06T09:12:00', actor: 'Sana Iqbal', actorRole: 'Platform Admin',
    kind: 'entitlement', sev: 'extend', tenant: 'Lahore Textiles', env: 'prod',
    action: 'Manufacturing enabled for Lahore Textiles',
    detail: 'Outside AGR-2025-018 — recorded as an extension.',
    reason: 'Owner needs the mill live before the Sialkot handover; amendment signed but not yet filed.',
    ref: 'AGR-2025-018-A2' },
  { id: 'a2', at: '2026-09-06T08:41:00', actor: 'Sana Iqbal', actorRole: 'Platform Admin',
    kind: 'impersonation', sev: 'impersonation', tenant: 'Karachi Foods', env: 'prod',
    action: 'Entered Karachi Foods as Bilal Ahmed (Company Owner)',
    detail: 'Full access · 14 min · 6 actions taken, each double-logged below.',
    reason: 'Reproducing the invoice-total mismatch reported in ticket NEO-2291.',
    ref: 'NEO-2291', children: [
      { at: '08:43', action: 'Opened Finance → Receivables' },
      { at: '08:47', action: 'Recalculated invoice INV-4471' },
      { at: '08:52', action: 'Exported ledger extract (Aug 2026)' },
    ] },
  { id: 'a3', at: '2026-09-05T16:20:00', actor: 'Sana Iqbal', actorRole: 'Platform Admin',
    kind: 'branch', sev: 'normal', tenant: 'Lahore Textiles', env: 'prod',
    action: 'Branch created — Sialkot',
    detail: 'Franchised · own books · own billing account · own agreement AGR-2026-055.',
    reason: 'Approved BR-2026-118. Franchisee signed their own 12-month term.',
    ref: 'BR-2026-118' },
  { id: 'a4', at: '2026-09-05T11:03:00', actor: 'Erik Lindqvist', actorRole: 'Platform Admin',
    kind: 'limit', sev: 'normal', tenant: 'Kystgruppe Nordic', env: 'prod',
    action: 'User limit raised 120 → 160',
    detail: 'Within AGR-2025-004; renewal absorbs it.',
    reason: 'Seasonal hiring for the autumn catch. Confirmed with the account owner.',
    ref: 'AGR-2025-004-A1' },
  { id: 'a5', at: '2026-09-04T14:55:00', actor: 'Sana Iqbal', actorRole: 'Platform Admin',
    kind: 'people', sev: 'normal', tenant: 'Stockholm Handel', env: 'prod',
    action: 'Password reset sent to anna.berg@sthlmhandel.se',
    detail: 'Keycloak Execute-Actions email · UPDATE_PASSWORD.',
    reason: 'Sole owner locked out, no company admin exists yet to do it for them.',
    ref: 'NEO-2287' },
  { id: 'a6', at: '2026-09-04T09:30:00', actor: 'System', actorRole: 'Automated',
    kind: 'agreement', sev: 'normal', tenant: 'Stockholm Handel', env: 'prod',
    action: 'Agreement AGR-2026-047 entered Critical (7 days)',
    detail: 'Pilot term ends 2026-09-08. Renewal is manual — nobody has actioned it.',
    reason: null, ref: 'AGR-2026-047' },
  { id: 'a7', at: '2026-09-03T15:12:00', actor: 'Erik Lindqvist', actorRole: 'Platform Admin',
    kind: 'entitlement', sev: 'normal', tenant: 'Kystgruppe Nordic', env: 'prod',
    action: 'Point of Sale disabled at Bergen Warehouse',
    detail: 'Branch override · inherit → off.',
    reason: 'Warehouse site, no retail counter. Was never used.',
    ref: null },
  { id: 'a8', at: '2026-09-02T10:08:00', actor: 'Sana Iqbal', actorRole: 'Platform Admin',
    kind: 'company', sev: 'normal', tenant: 'Stockholm Handel', env: 'prod',
    action: 'Company enrolled — Stockholm Handel',
    detail: 'AGR-2026-047 · 60-day pilot · 2 modules · owner invited.',
    reason: 'Pilot agreed at the Nordic trade fair. Converts to a full term or lapses.',
    ref: 'AGR-2026-047' },
  { id: 'a9', at: '2026-09-01T13:44:00', actor: 'Sana Iqbal', actorRole: 'Platform Admin',
    kind: 'impersonation', sev: 'impersonation', tenant: 'Lahore Textiles', env: 'staging',
    action: 'Entered Lahore Textiles — read-only',
    detail: 'Read-only · 6 min · no writes possible.',
    reason: 'Checking the payroll run layout before the release.',
    ref: null },
];

const AUDIT_KINDS = [
  ['all', 'Everything'], ['entitlement', 'Entitlements'], ['agreement', 'Agreements'],
  ['branch', 'Branches'], ['company', 'Companies'], ['limit', 'Limits'],
  ['people', 'People'], ['impersonation', 'Impersonation'],
];

const KIND_ICON = {
  entitlement: 'layers', agreement: 'contract', branch: 'map', company: 'building',
  limit: 'activity', people: 'users', impersonation: 'eye',
};

function auditWhen(iso) {
  const d = new Date(iso);
  const day = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return { day, time };
}

function AuditLog({ goto }) {
  const toast = useToast();
  const [kind, setKind] = useState('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState('a1');

  const rows = AUDIT.filter(r => {
    if (kind !== 'all' && r.kind !== kind) return false;
    if (!q.trim()) return true;
    const hay = `${r.action} ${r.tenant} ${r.actor} ${r.ref || ''} ${r.reason || ''}`.toLowerCase();
    return hay.includes(q.trim().toLowerCase());
  });

  const counts = AUDIT_KINDS.map(([id]) => id === 'all' ? AUDIT.length : AUDIT.filter(r => r.kind === id).length);
  const extensions = AUDIT.filter(r => r.sev === 'extend').length;
  const imps = AUDIT.filter(r => r.kind === 'impersonation').length;
  const unreasoned = AUDIT.filter(r => r.actor !== 'System' && !r.reason).length;

  return (
    <>
      <PageHead
        title="Audit log"
        sub="Every change that required a reason, and every action taken inside a tenant."
        crumbs={['Platform Admin', <span className="here" key="h">Audit log</span>]}
        actions={
          <button className="btn btn-secondary" onClick={() => toast && toast({ title: 'Audit extract queued', sub: `${rows.length} entries · CSV, emailed to you. The log itself is append-only and cannot be edited.` })}>
            <Icon name="download" size={16}/> Export
          </button>
        }/>

      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <div className="kpi">
          <div className="kpi-icon"><Icon name="db" size={18}/></div>
          <div className="kpi-label">Entries</div>
          <div className="kpi-value">{AUDIT.length}</div>
          <div className="kpi-delta">last 7 days</div>
        </div>
        <div className="kpi">
          <div className={`kpi-icon${extensions ? ' urgent' : ''}`}><Icon name="layers" size={18}/></div>
          <div className="kpi-label">Agreement extensions</div>
          <div className="kpi-value" style={extensions ? { color: 'var(--danger-fg)' } : undefined}>{extensions}</div>
          <div className="kpi-delta">awaiting paperwork</div>
        </div>
        <div className="kpi">
          <div className="kpi-icon"><Icon name="eye" size={18}/></div>
          <div className="kpi-label">Impersonation sessions</div>
          <div className="kpi-value">{imps}</div>
          <div className="kpi-delta">all reasoned</div>
        </div>
        <div className="kpi">
          <div className={`kpi-icon${unreasoned ? ' urgent' : ''}`}><Icon name="activity" size={18}/></div>
          <div className="kpi-label">Missing a reason</div>
          <div className="kpi-value" style={unreasoned ? { color: 'var(--danger-fg)' } : undefined}>{unreasoned}</div>
          <div className="kpi-delta">{unreasoned ? 'investigate' : 'nothing slipped through'}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-head" style={{ gap: 12, flexWrap: 'wrap' }}>
          <div className="chips">
            {AUDIT_KINDS.map(([id, label], i) => (
              <button key={id} className={`chip${kind === id ? ' on' : ''}`} onClick={() => setKind(id)}>
                {label}<span className="chip-n">{counts[i]}</span>
              </button>
            ))}
          </div>
          <div className="search" style={{ marginLeft: 'auto', minWidth: 200 }}>
            <Icon name="search" size={15}/>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search actor, tenant, reference…"/>
          </div>
        </div>

        <div className="aud-list">
          {rows.length === 0 && (
            <div className="card-pad" style={{ textAlign: 'center', color: 'var(--fg-3)', fontSize: 13 }}>
              Nothing matches. The log is append-only, so an empty result means it did not happen.
            </div>
          )}
          {rows.map(r => {
            const w = auditWhen(r.at);
            const isOpen = open === r.id;
            return (
              <div key={r.id} className={`aud${isOpen ? ' on' : ''}`}>
                <button className="aud-hd" onClick={() => setOpen(isOpen ? null : r.id)}>
                  <div className="aud-when">
                    <span className="aud-day">{w.day}</span>
                    <span className="aud-time">{w.time}</span>
                  </div>
                  <div className={`aud-ico ${r.sev}`}><Icon name={KIND_ICON[r.kind] || 'layers'} size={15}/></div>
                  <div className="aud-main">
                    <div className="aud-action">
                      {r.action}
                      {r.sev === 'extend' && <span className="aud-tag ext">Extension</span>}
                      {r.kind === 'impersonation' && <span className="aud-tag imp">Impersonation</span>}
                      {r.env !== 'prod' && <span className="aud-tag env">{r.env}</span>}
                    </div>
                    <div className="aud-meta">
                      {r.actor} · {r.actorRole} · {r.tenant}
                      {r.ref && <> · <span className="aud-ref">{r.ref}</span></>}
                    </div>
                  </div>
                  <Icon name="chev" size={15} className="aud-chev"/>
                </button>

                {isOpen && (
                  <div className="aud-body">
                    <p className="aud-detail">{r.detail}</p>
                    {r.reason ? (
                      <div className="req-reason">
                        <div className="req-reason-hd">Reason given</div>
                        <p>{r.reason}</p>
                      </div>
                    ) : r.actor === 'System' ? (
                      <div className="aud-sys">Automated entry — no actor, no reason required.</div>
                    ) : (
                      <div className="notice error">
                        <span className="dot"/>
                        <div>
                          <b>No reason recorded</b>
                          <p>This change predates the reason gate, or bypassed it. Either way it cannot be defended at renewal.</p>
                        </div>
                      </div>
                    )}

                    {r.children && (
                      <>
                        <div className="ent-sub-hd" style={{ marginTop: 18 }}>
                          Actions inside the session
                          <span className="ent-sub-note">Logged twice — once as the tenant user, once as you.</span>
                        </div>
                        <div className="aud-kids">
                          {r.children.map((c, i) => (
                            <div key={i} className="aud-kid">
                              <span className="aud-kid-t">{c.at}</span>
                              <span>{c.action}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    <div className="aud-acts">
                      <button className="btn btn-secondary btn-sm"
                        onClick={() => {
                          const t = (window.MOCK.COMPANIES || []).find(x => x.name === r.tenant);
                          t ? goto('company', { id: t.id }) : goto('companies');
                        }}>
                        Open {r.tenant}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .kpi-icon.urgent { background: var(--danger-bg); color: var(--danger-fg); }
        .aud-list { padding: 4px 0; }
        .aud { border-bottom: 1px solid var(--border); }
        .aud:last-child { border-bottom: 0; }
        .aud.on { background: var(--bg-soft); }
        .aud-hd { display: flex; align-items: center; gap: 14px; width: 100%; padding: 13px 20px; background: transparent; border: 0; text-align: left; cursor: default; }
        .aud-hd:hover { background: var(--surface-hover); }
        .aud.on .aud-hd:hover { background: transparent; }
        .aud-when { display: flex; flex-direction: column; width: 52px; flex-shrink: 0; }
        .aud-day { font-size: 11.5px; font-weight: 600; }
        .aud-time { font-family: var(--font-mono); font-size: 11px; color: var(--fg-3); margin-top: 1px; }
        .aud-ico { width: 30px; height: 30px; border-radius: var(--r-sm); background: var(--bg-soft); color: var(--fg-2); display: grid; place-items: center; flex-shrink: 0; }
        .aud.on .aud-ico { background: var(--bg-elev); }
        .aud-ico.extend { background: var(--danger-bg); color: var(--danger-fg); }
        .aud-ico.impersonation { background: var(--accent); color: var(--accent-fg); }
        .aud-main { flex: 1; min-width: 0; }
        .aud-action { font-size: 13.5px; font-weight: 500; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .aud-meta { font-size: 11.5px; color: var(--fg-3); margin-top: 3px; }
        .aud-ref { font-family: var(--font-mono); font-size: 11px; }
        .aud-tag { font-size: 9.5px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; padding: 2px 6px; border-radius: 3px; background: var(--bg-soft); color: var(--fg-3); }
        .aud.on .aud-tag { background: var(--bg-elev); }
        .aud-tag.ext { background: var(--danger-bg); color: var(--danger-fg); }
        .aud-tag.imp { background: var(--accent); color: var(--accent-fg); }
        .aud-tag.env { background: var(--warn-bg); color: var(--warn-fg); }
        .aud-chev { color: var(--fg-4); flex-shrink: 0; transition: transform var(--m-fast) ease; }
        .aud.on .aud-chev { transform: rotate(180deg); }
        .aud-body { padding: 0 20px 18px 100px; }
        .aud-detail { font-size: 12.5px; color: var(--fg-2); line-height: 1.55; margin: 0 0 12px; }
        .aud-sys { font-size: 12px; color: var(--fg-3); font-style: italic; }
        .aud-kids { display: flex; flex-direction: column; gap: 1px; }
        .aud-kid { display: flex; gap: 14px; font-size: 12.5px; color: var(--fg-2); padding: 7px 12px; background: var(--bg-elev); border-radius: var(--r-sm); }
        .aud-kid-t { font-family: var(--font-mono); font-size: 11.5px; color: var(--fg-3); flex-shrink: 0; }
        .aud-acts { margin-top: 16px; }
        @media (max-width: 720px) { .aud-body { padding-left: 20px; } .aud-hd { flex-wrap: wrap; } }
      `}</style>
    </>
  );
}

Object.assign(window, { AuditLog, AUDIT });
