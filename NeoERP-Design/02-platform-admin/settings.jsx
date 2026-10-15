// NeoERP — Settings. Environment switching lives here: it is a development-phase
// tool, not a permanent fixture of the product chrome.

function Settings({ goto }) {
  const p = usePlatform() || {};
  const toast = useToast();
  const [audit, setAudit] = useState(true);

  return (
    <>
      <PageHead title="Settings" crumbs={['Account', <span className="here" key="h">Settings</span>]}/>

      {p.isSuperAdmin ? (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-head">
            <div>
              <div className="card-title">Environment</div>
              <div className="card-sub">Super Admin only · development-phase tool</div>
            </div>
            <Pill tone="info">Restricted</Pill>
          </div>
          <div className="card-pad">
            <EnvSwitcher/>
            <div className="env-rows">
              {(p.envs || []).map(e => (
                <div key={e.id} className={`env-row${p.env === e.id ? ' on' : ''}`}>
                  <span className={`pin ${e.tone === 'warn' ? 'warn' : e.tone === 'danger' ? 'danger' : ''}`}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="env-row-nm">{e.nm}{p.env === e.id && <span className="env-cur">Current</span>}</div>
                    <div className="env-row-note">{e.note}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="notice" style={{ marginTop: 16 }}>
              <span className="dot"/>
              <div>
                <b>Why this isn't in the top bar</b>
                <p>Switching environments is something you do a handful of times a week during development, not a control that earns permanent space. Staging and Production still pin a warning strip to the top of every screen — that part isn't optional.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="empty">
            <Icon name="shield" size={48} className="ico"/>
            <h3>Environment switching is restricted</h3>
            <p style={{ margin: 0, fontSize: 13 }}>Only platform Super Admins can change environment or enter a company.</p>
          </div>
        </div>
      )}

      {p.isSuperAdmin && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-head">
            <div>
              <div className="card-title">Company access</div>
              <div className="card-sub">How you enter a tenant to test flows</div>
            </div>
          </div>
          <div className="card-pad">
            <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--fg-2)', lineHeight: 1.6, maxWidth: '64ch' }}>
              Entry points sit on the thing they refer to — an <b>Enter</b> button on each company row and in the
              company header, and <b>Enter branch</b> on each branch. There's no global "enter" control, because
              picking a company from a list you can't see is guesswork.
            </p>
            <div className="set-row">
              <div>
                <div className="set-nm">Log every action to the platform audit trail</div>
                <div className="set-note">Attributed to your account, not the role you're viewing as. Cannot be disabled in Production.</div>
              </div>
              <Switch checked={audit} onChange={setAudit}/>
            </div>
            <div className="set-row">
              <div>
                <div className="set-nm">A reason is always required to enter a company</div>
                <div className="set-note">Not a preference — written to the audit log alongside the session, in every environment.</div>
              </div>
            </div>
            <div className="row-flex" style={{ marginTop: 16 }}>
              <button className="btn btn-secondary" onClick={() => goto('companies')}>
                <Icon name="building" size={16}/> Go to Companies
              </button>
              <button className="btn btn-ghost" onClick={() => toast && toast({ title: 'Audit log', sub: 'Platform audit trail is not built yet.' })}>
                View session history
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-head"><div className="card-title">Appearance</div></div>
        <div className="card-pad">
          <p style={{ margin: 0, fontSize: 13.5, color: 'var(--fg-3)', lineHeight: 1.6 }}>
            Theme and density are in the Tweaks panel while this is a prototype. They'll move here when the design settles.
          </p>
        </div>
      </div>

      <style>{`
        .env-rows { display: flex; flex-direction: column; gap: 2px; margin-top: 18px; }
        .env-row { display: flex; align-items: center; gap: 12px; padding: 11px 12px; border-radius: var(--r-md); }
        .env-row.on { background: var(--bg-soft); }
        .env-row .pin { flex-shrink: 0; }
        .env-row-nm { font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 8px; }
        .env-cur { font-size: 10px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; background: var(--accent); color: var(--accent-fg); padding: 2px 6px; border-radius: 4px; }
        .env-row-note { font-size: 11.5px; color: var(--fg-3); margin-top: 2px; }
        .set-row { display: flex; align-items: flex-start; gap: 20px; padding: 14px 0; border-top: 1px solid var(--border); }
        .set-row:first-of-type { border-top: 0; padding-top: 0; }
        .set-nm { font-size: 13.5px; font-weight: 500; }
        .set-note { font-size: 12px; color: var(--fg-3); margin-top: 3px; line-height: 1.5; max-width: 60ch; }
      `}</style>
    </>
  );
}

Object.assign(window, { Settings });
