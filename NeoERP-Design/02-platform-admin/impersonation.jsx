// NeoERP — Platform frame: view-as / impersonation + environment.
// Entry points live on the company and branch they refer to, not in a global bar.
// Full unrestricted access by design; the guardrail is attribution, not restriction.

const PlatformCtx = createContext(null);
const usePlatform = () => useContext(PlatformCtx);

function PlatformProvider({ children, goto, isSuperAdmin = true }) {
  const [env, setEnv] = useState(() => localStorage.getItem('neoerp.env') || 'dev');
  const [session, setSession] = useState(null);
  const [launcher, setLauncher] = useState(false);
  const [preset, setPreset] = useState(null);
  const [envConfirm, setEnvConfirm] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => { localStorage.setItem('neoerp.env', env); }, [env]);

  useEffect(() => {
    if (!session) { setElapsed(0); return; }
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, [session]);

  // A non-super-admin can never hold a session or switch environment.
  useEffect(() => { if (!isSuperAdmin && session) setSession(null); }, [isSuperAdmin]);

  const enter = (s) => { setSession({ ...s, startedAt: Date.now() }); setLauncher(false); goto('dashboard'); };
  const exit = () => { setSession(null); goto('dashboard'); };

  const openLauncher = (pre) => {
    if (!isSuperAdmin) return;
    setPreset(pre || null);
    setLauncher(true);
  };

  const requestEnv = (next) => {
    if (!isSuperAdmin || next === env) return;
    if (next === 'prod' || env === 'prod') setEnvConfirm(next);
    else setEnv(next);
  };

  const envMeta = ENVS.find(e => e.id === env) || ENVS[0];

  return (
    <PlatformCtx.Provider value={{ env, envMeta, envs: ENVS, setEnv: requestEnv, session, enter, exit, openLauncher, isSuperAdmin }}>
      <div className={`platform-frame env-${env}${session ? ' impersonating' : ''}`}>
        {session && <ImpersonationBar session={session} elapsed={elapsed} env={env} onExit={exit}/>}
        {!session && env !== 'dev' && isSuperAdmin && <EnvStrip envMeta={envMeta}/>}
        {children}
      </div>

      <ViewAsLauncher open={launcher} env={env} preset={preset}
        onClose={() => setLauncher(false)} onEnter={enter}/>

      <Modal open={!!envConfirm} onClose={() => setEnvConfirm(null)}
        title={envConfirm === 'prod' ? 'Switch to Production?' : 'Leave Production?'}
        footer={<>
          <button className="btn btn-secondary" onClick={() => setEnvConfirm(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { setEnv(envConfirm); setEnvConfirm(null); }}>
            {envConfirm === 'prod' ? 'Switch to Production' : `Switch to ${(ENVS.find(e => e.id === envConfirm) || {}).nm}`}
          </button>
        </>}>
        {envConfirm === 'prod' ? (
          <div className="notice error">
            <span className="dot"/>
            <div>
              <b>This is live data</b>
              <p>Real tenants, real employees, real payroll. Actions here affect people who get paid, and a strip stays pinned to the top of the screen for as long as you are in Production.</p>
            </div>
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: 13.5, color: 'var(--fg-2)' }}>
            You are leaving Production. Any view-as session will end.
          </p>
        )}
      </Modal>

      <style>{`
        .platform-frame { display: flex; flex-direction: column; height: 100vh; }
        .platform-frame > .app { height: auto; flex: 1; min-height: 0; }

        /* Environment strip — warning only, no controls. Never shown in Development. */
        .estrip { display: flex; align-items: center; gap: 10px; height: 28px; padding: 0 16px; flex-shrink: 0;
          font-size: 11.5px; font-weight: 600; letter-spacing: .04em; }
        .estrip .edot { width: 6px; height: 6px; border-radius: 999px; background: currentColor; }
        .estrip .enote { font-weight: 400; letter-spacing: 0; opacity: .8; }
        .env-staging .estrip { background: var(--warn-bg); color: var(--warn-fg); border-bottom: 1px solid var(--warn-dot); }
        .env-prod .estrip { background: var(--danger-bg); color: var(--danger-fg); border-bottom: 1px solid var(--danger-fg); }

        /* Environment switcher — lives in Settings */
        .env-seg { display: flex; gap: 2px; padding: 2px; background: var(--bg-soft); border: 1px solid var(--border); border-radius: var(--r-md); }
        .env-opt { border: 0; background: transparent; padding: 7px 13px; border-radius: 7px; font-size: 12.5px; font-weight: 500; color: var(--fg-3); cursor: default; display: inline-flex; align-items: center; gap: 7px; }
        .env-opt:hover { color: var(--fg); }
        .env-dot { width: 6px; height: 6px; border-radius: 999px; background: currentColor; opacity: .55; }
        .env-opt.on { background: var(--accent); color: var(--accent-fg); font-weight: 600; }
        .env-opt.on .env-dot { opacity: 1; }
        .env-opt.on.warn { background: var(--warn-fg); color: #fff; }
        .env-opt.on.danger { background: var(--danger-fg); color: #fff; }

        /* Impersonation bar — deliberately the loudest surface in the product */
        .ibar { display: flex; align-items: center; gap: 14px; min-height: 48px; padding: 8px 16px; flex-shrink: 0;
          background: #7A3E00; color: #FFEFD9; border-bottom: 2px solid #F59E0B; flex-wrap: wrap; }
        .ibar-badge { display: inline-flex; align-items: center; gap: 7px; font-size: 10.5px; font-weight: 700; letter-spacing: .09em; text-transform: uppercase;
          background: #F59E0B; color: #241100; padding: 4px 9px; border-radius: 999px; white-space: nowrap; }
        .ibar-badge .blip { width: 6px; height: 6px; border-radius: 999px; background: #241100; animation: iblip 1.4s ease-in-out infinite; }
        @keyframes iblip { 0%,100% { opacity: 1 } 50% { opacity: .25 } }
        .ibar-path { font-size: 13.5px; font-weight: 600; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .ibar-path .sep { opacity: .5; }
        .ibar-path .role { background: rgba(255,255,255,.16); padding: 2px 8px; border-radius: 999px; font-size: 12px; font-weight: 600; }
        .ibar-meta { font-size: 11.5px; color: #E8C9A0; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .ibar-clock { font-family: var(--font-mono); font-size: 12px; color: #FFEFD9; }
        .ibar-exit { margin-left: auto; height: 34px; padding: 0 14px; border-radius: var(--r-md); border: 1px solid #FFEFD9;
          background: #FFEFD9; color: #241100; font-size: 12.5px; font-weight: 600; cursor: default; display: inline-flex; align-items: center; gap: 7px; white-space: nowrap; }
        .ibar-exit:hover { background: #fff; }
        .impersonating .app { box-shadow: inset 0 0 0 2px #F59E0B; }

        .va-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .va-opt { text-align: left; padding: 11px 13px; border: 1px solid var(--border); border-radius: var(--r-md); background: var(--bg); cursor: default; }
        .va-opt:hover { border-color: var(--border-strong); }
        .va-opt.on { border-color: var(--fg); box-shadow: 0 0 0 1px var(--fg) inset; }
        .va-opt-nm { font-size: 13px; font-weight: 500; }
        .va-opt-sub { font-size: 11.5px; color: var(--fg-3); margin-top: 2px; }
        .va-scroll { max-height: 210px; overflow-y: auto; padding-right: 2px; }

        @media (max-width: 720px) {
          .estrip { height: auto; padding: 6px 12px; }
          .estrip .enote { display: none; }
          .va-grid { grid-template-columns: 1fr; }
          .ibar-exit { margin-left: 0; width: 100%; justify-content: center; }
        }
      `}</style>
    </PlatformCtx.Provider>
  );
}

function EnvStrip({ envMeta }) {
  return (
    <div className="estrip">
      <span className="edot"/>
      {envMeta.nm}
      <span className="enote">{envMeta.note} · switch in Settings</span>
    </div>
  );
}

function EnvSwitcher() {
  const p = usePlatform() || {};
  if (!p.isSuperAdmin) return null;
  return (
    <div className="env-seg" role="group" aria-label="Environment">
      {(p.envs || []).map(e => (
        <button key={e.id} className={`env-opt${p.env === e.id ? ' on' : ''} ${e.tone}`}
          onClick={() => p.setEnv(e.id)} aria-pressed={p.env === e.id}>
          <span className="env-dot"/>{e.nm}
        </button>
      ))}
    </div>
  );
}

// Reusable entry button. Renders nothing for anyone but a super admin.
function EnterButton({ company, branch, label, variant = 'btn-secondary', size = '', iconOnly = false }) {
  const p = usePlatform() || {};
  if (!p.isSuperAdmin) return null;
  const text = label || (branch ? 'Enter branch' : 'Enter');
  const cls = `btn ${variant} ${size} ${iconOnly ? 'btn-icon-only' : ''}`.replace(/\s+/g, ' ').trim();
  return (
    <button className={cls} onClick={() => p.openLauncher({ company, branch })}
      title={iconOnly ? text : undefined} aria-label={iconOnly ? text : undefined}>
      <Icon name="arrowR" size={size === 'btn-sm' ? 12 : 14}/>
      {!iconOnly && <span>{text}</span>}
    </button>
  );
}

function ImpersonationBar({ session, elapsed, env, onExit }) {
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');
  return (
    <div className="ibar">
      <span className="ibar-badge"><span className="blip"/>Viewing as</span>
      <div>
        <div className="ibar-path">
          {session.company}
          {session.branch && <><span className="sep">/</span>{session.branch}</>}
          <span className="role">{session.role}</span>
        </div>
        <div className="ibar-meta">
          {session.onBehalfOf
            ? <span>On behalf of <b style={{ color: '#FFEFD9' }}>{session.onBehalfOf}</b>{session.requestId ? <> · per request {session.requestId}</> : null} · logged as <b style={{ color: '#FFEFD9' }}>Priya Raman</b></span>
            : <span>Full access · every action is logged as <b style={{ color: '#FFEFD9' }}>Priya Raman</b></span>}
          <span>·</span>
          <span className="ibar-clock">{mm}:{ss}</span>
          <span>·</span>
          <span>{(ENVS.find(e => e.id === env) || {}).nm}</span>
        </div>
      </div>
      <button className="ibar-exit" onClick={onExit}>
        <Icon name="x" size={14}/> Exit to platform
      </button>
    </div>
  );
}

function ViewAsLauncher({ open, env, preset, onClose, onEnter }) {
  const [company, setCompany] = useState(null);
  const [branch, setBranch] = useState(null);
  const [role, setRole] = useState('Company Owner');
  const [reason, setReason] = useState('');
  const [err, setErr] = useState('');

  // Opened from a company or branch page — that scope is the context, not a choice.
  useEffect(() => {
    if (!open) return;
    setErr('');
    setReason('');
    if (preset && preset.company) {
      const match = TENANT_TREE.find(c => c.nm === preset.company || c.id === preset.company);
      setCompany(match ? match.id : null);
      setBranch(preset.branch || null);
      setRole(preset.branch ? 'Branch Owner' : 'Company Owner');
      if (preset.reason) setReason(preset.reason);
    } else {
      setCompany(null); setBranch(null); setRole('Company Owner');
    }
  }, [open, preset]);

  const co = TENANT_TREE.find(c => c.id === company);
  const presetName = preset && preset.company;
  const locked = !!presetName;

  const go = () => {
    if (!locked && !co) { setErr('Choose a company.'); return; }
    if (reason.trim().length < 6) { setErr('A reason is required before entering. It is written to the audit log.'); return; }
    setErr('');
    onEnter({ company: co ? co.nm : presetName, branch, role, reason: reason.trim(), env,
      onBehalfOf: preset && preset.onBehalfOf, requestId: preset && preset.requestId });
  };

  return (
    <Modal open={open} onClose={onClose} size="lg" title={locked ? `Enter ${presetName}` : 'Enter a company'}
      footer={<>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={go}>Enter as {role}</button>
      </>}>
      {err && <div className="notice error" style={{ marginBottom: 16 }}><span className="dot"/><div><b>Can't continue</b><p>{err}</p></div></div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {locked ? (
          <div className="va-locked">
            <div className="avatar sq" style={{ width: 36, height: 36, fontSize: 12 }}>{presetName.slice(0, 2).toUpperCase()}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="va-locked-nm">{presetName}{branch ? ` / ${branch}` : ''}</div>
              <div className="va-locked-sub">
                {branch ? 'Branch scope' : 'Company scope — all branches'}
                {co ? ` · ${co.country} · ${co.users} users · ${co.agreement.ref}` : ''}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="field-label" style={{ marginBottom: 8 }}>Company</div>
            <div className="va-scroll">
              <div className="va-grid">
                {TENANT_TREE.map(c => (
                  <button key={c.id} className={`va-opt${company === c.id ? ' on' : ''}`}
                    onClick={() => { setCompany(c.id); setBranch(null); }}>
                    <div className="va-opt-nm">{c.nm}</div>
                    <div className="va-opt-sub">{c.country} · {c.users} users · {c.branches.length} branches · {c.agreement.ref}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {co && !preset?.branch && (
          <div>
            <div className="field-label" style={{ marginBottom: 8 }}>Branch <span style={{ color: 'var(--fg-4)', fontWeight: 400 }}>· optional</span></div>
            <div className="va-grid">
              <button className={`va-opt${branch === null ? ' on' : ''}`} onClick={() => setBranch(null)}>
                <div className="va-opt-nm">Company level</div>
                <div className="va-opt-sub">All branches, group-wide view</div>
              </button>
              {co.branches.map(b => (
                <button key={b.nm} className={`va-opt${branch === b.nm ? ' on' : ''}`} onClick={() => setBranch(b.nm)}>
                  <div className="va-opt-nm">{b.nm}</div>
                  <div className="va-opt-sub">
                    {b.ownership === 'franchise' ? `Franchised · ${b.owner || 'no owner'}` : `Company-owned${b.owner ? ` · ${b.owner}` : ''}`}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <Field label="View as role" hint="Flows differ sharply by role — a Sales Person sees a different product than an Owner.">
          <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
            {VIEW_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>

        <Field label="Reason"
          hint="Required — written to the audit log alongside every action you take in the session.">
          <input className="input" placeholder="e.g. Reproducing the failed payroll run for FY 2026–27"
            value={reason} onChange={(e) => setReason(e.target.value)}/>
        </Field>

        {preset && preset.onBehalfOf && (
          <div className="notice" style={{ borderColor: 'var(--border-strong)' }}>
            <span className="dot"/>
            <div>
              <b>Acting on {preset.onBehalfOf}'s request</b>
              <p>They asked for this, which is what makes it defensible. The audit entry reads “performed by Priya Raman on behalf of {preset.onBehalfOf}{preset.requestId ? `, per request ${preset.requestId}` : ''}”. Acting without a request looks identical afterwards — so don't.</p>
            </div>
          </div>
        )}
        <div className="notice">
          <span className="dot"/>
          <div>
            <b>You keep full access</b>
            <p>Nothing is read-only. You can create, edit and approve exactly as this role can — and every one of those actions is attributed to your account, not theirs.</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}

Object.assign(window, {
  PlatformProvider, usePlatform, EnvStrip, EnvSwitcher, EnterButton,
  ImpersonationBar, ViewAsLauncher,
});
