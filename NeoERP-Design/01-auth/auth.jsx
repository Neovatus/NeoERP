// NeoERP — Auth screens (Sign In, Forgot, Sent, Reset, Success)

// Left panel — the modules as one connected system.
// Deliberately NOT a dashboard preview: that is what comes after sign-in.
const AUTH_MODULES = [
  { id: 'tenants',   nm: 'Companies',  icon: 'building', x: 50, y: 9,
    line: 'One platform, many companies.',
    body: 'Each tenant keeps its own data, branches and warehouses — on shared modules.',
    inc: ['Branches', 'Warehouses', 'Module access', 'Tenant setup'],
    tag: 'Multi-tenant' },
  { id: 'hrms',      nm: 'HRMS',       icon: 'users',    x: 14, y: 35,
    line: 'One employee register.',
    body: 'Records, contracts, leave and documents live in one place instead of four.',
    inc: ['Employees', 'Contracts', 'Leave', 'Attendance', 'Documents'],
    tag: 'Source of record' },
  { id: 'payroll',   nm: 'Payroll',    icon: 'key',      x: 29, y: 76,
    line: 'Payroll runs on HR’s own data.',
    body: 'No re-entry and no spreadsheet round-trip between HR and Finance.',
    inc: ['Salary structures', 'Runs', 'Payslips', 'Statutory tax'],
    tag: 'Zero re-entry' },
  { id: 'finance',   nm: 'Finance',    icon: 'layers',   x: 71, y: 76,
    line: 'Every module posts to one ledger.',
    body: 'Payroll runs, stock movements and invoices all land in the same books.',
    inc: ['Ledger', 'Receivables', 'Payables', 'Tax', 'Reporting'],
    tag: 'Single ledger' },
  { id: 'sales',     nm: 'Sales',      icon: 'activity', x: 50, y: 52,
    line: 'Orders check live stock.',
    body: 'Quote, order and invoice against what is actually on the shelf right now.',
    inc: ['Quotes', 'Orders', 'Invoices', 'POS', 'Customers'],
    tag: 'Live stock' },
  { id: 'inventory', nm: 'Inventory',  icon: 'box',      x: 86, y: 35,
    line: 'Stock by warehouse and branch.',
    body: 'Batch and serial tracking, down to the bin, across every location.',
    inc: ['Stock', 'Batches & serials', 'Transfers', 'Purchasing'],
    tag: 'Per-branch' },
];

const AUTH_EDGES = [
  ['tenants', 'hrms'], ['tenants', 'inventory'], ['tenants', 'sales'],
  ['hrms', 'payroll'], ['payroll', 'finance'], ['sales', 'finance'],
  ['sales', 'hrms'], ['inventory', 'sales'], ['inventory', 'finance'],
];

const AUTH_DWELL = 3600;

function AuthArt() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep(s => (s + 1) % AUTH_MODULES.length), AUTH_DWELL);
    return () => clearInterval(id);
  }, []);
  const active = AUTH_MODULES[step];
  const byId = useMemo(() => Object.fromEntries(AUTH_MODULES.map(m => [m.id, m])), []);

  return (
    <div className="auth-art">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="brand-mark" style={{ width: 36, height: 36 }}>N</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 16, letterSpacing: '-0.02em' }}>NeoERP</div>
          <div style={{ fontSize: 11.5, color: 'var(--fg-3)', letterSpacing: '0.04em' }}>by Neovatus</div>
        </div>
      </div>

      <div className="art-body">
        <div className="art-graph">
          <svg className="art-wires" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {AUTH_EDGES.map(([a, b]) => {
              const A = byId[a], B = byId[b];
              const live = a === active.id || b === active.id;
              return (
                <line key={a + b} x1={A.x} y1={A.y} x2={B.x} y2={B.y}
                  className={`art-wire${live ? ' live' : ''}`}
                  vectorEffect="non-scaling-stroke"/>
              );
            })}
          </svg>
          {AUTH_MODULES.map((m, k) => {
            const on = k === step;
            return (
              <button key={m.id} type="button"
                className={`art-node${on ? ' on' : ''}`}
                style={{ left: `${m.x}%`, top: `${m.y}%` }}
                onClick={() => setStep(k)}
                aria-label={m.nm} aria-current={on}>
                <Icon name={m.icon} size={18}/>
                <span className="art-node-nm">{m.nm}</span>
              </button>
            );
          })}
        </div>

        <div className="art-caption">
          <div className="art-tag"><span className="art-tag-dot"/>{active.tag}</div>
          <h2 className="art-line">{active.line}</h2>
          <p className="art-copy">{active.body}</p>
          <ul className="art-inc">
            {active.inc.map(x => <li key={x}>{x}</li>)}
          </ul>
          <div className="art-ticks">
            {AUTH_MODULES.map((m, k) => (
              <span key={m.id} className={`art-tick${k === step ? ' on' : ''}`}>
                {k === step && <i key={step} className="art-tick-fill"/>}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, fontSize: 11.5, color: 'var(--fg-4)' }}>
        © 2026 NeoERP · Neovatus
      </div>

      <style>{`
        .art-body { margin-top: auto; display: flex; flex-direction: column; gap: 30px; }
        .art-graph { position: relative; width: 100%; max-width: 340px; aspect-ratio: 1 / 0.92; margin: 0 auto; }
        .art-wires { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
        .art-wire { stroke: var(--border-strong); stroke-width: 1; opacity: .5; transition: stroke var(--m-base) ease, opacity var(--m-base) ease; }
        .art-wire.live { stroke: var(--fg); opacity: 1; stroke-dasharray: 3 5; animation: artFlow 900ms linear infinite; }
        @keyframes artFlow { to { stroke-dashoffset: -16; } }

        .art-node {
          position: absolute; transform: translate(-50%, -50%);
          width: 50px; height: 50px; padding: 0;
          display: grid; place-items: center;
          border: 1px solid var(--border); border-radius: var(--r-md);
          background: var(--bg-elev); color: var(--fg-3);
          cursor: default;
          transition: color var(--m-base) ease, background var(--m-base) ease, border-color var(--m-base) ease, box-shadow var(--m-base) ease;
        }
        .art-node .art-node-nm {
          position: absolute; top: calc(100% + 7px); left: 50%; transform: translateX(-50%);
          font-size: 10.5px; font-weight: 500; letter-spacing: .02em;
          color: var(--fg-4); white-space: nowrap;
          transition: color var(--m-base) ease;
        }
        .art-node:hover { border-color: var(--border-strong); color: var(--fg-2); }
        .art-node.on {
          background: var(--accent); color: var(--accent-fg); border-color: var(--accent);
          box-shadow: var(--shadow-2);
        }
        .art-node.on .art-node-nm { color: var(--fg); font-weight: 600; }
        .art-node.on::after {
          content: ''; position: absolute; top: -3px; right: -3px;
          width: 9px; height: 9px; border-radius: 999px;
          background: var(--success-dot);
          border: 2px solid var(--bg-sunken);
        }

        .art-caption { min-height: 186px; }
        .art-tag {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 10.5px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase;
          color: var(--fg-2); background: var(--bg-elev);
          border: 1px solid var(--border); border-radius: 999px;
          padding: 4px 10px 4px 8px;
        }
        .art-tag-dot { width: 5px; height: 5px; border-radius: 999px; background: var(--success-dot); }
        .art-line { font-size: 21px; font-weight: 700; letter-spacing: -.025em; line-height: 1.2; margin: 14px 0 8px; color: var(--fg); text-wrap: pretty; }
        .art-copy { font-size: 13px; color: var(--fg-3); line-height: 1.55; margin: 0; max-width: 40ch; text-wrap: pretty; }
        .art-inc { display: flex; flex-wrap: wrap; gap: 4px 0; list-style: none; padding: 0; margin: 12px 0 0; max-width: 40ch; }
        .art-inc li { font-size: 11.5px; color: var(--fg-4); letter-spacing: .01em; }
        .art-inc li:not(:last-child)::after { content: '·'; margin: 0 7px; color: var(--border-strong); }
        .art-caption > * { animation: artIn var(--m-base) var(--ease-out) both; }
        @keyframes artIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }

        .art-ticks { display: flex; gap: 5px; margin-top: 22px; }
        .art-tick { width: 22px; height: 3px; border-radius: 999px; background: var(--border-strong); overflow: hidden; }
        .art-tick.on { background: var(--bg-soft); width: 34px; }
        .art-tick-fill { display: block; height: 100%; width: 100%; background: var(--fg); transform-origin: left; animation: artTick ${AUTH_DWELL}ms linear both; }
        @keyframes artTick { from { transform: scaleX(0); } to { transform: scaleX(1); } }

        @media (max-height: 720px) {
          .art-body { gap: 20px; }
          .art-graph { max-width: 270px; }
          .art-line { font-size: 18px; }
          .art-caption { min-height: 168px; }
          .art-inc { display: none; }
        }
      `}</style>
    </div>
  );
}

// Sign In
function SignIn({ goto, signedOut }) {
  const [email, setEmail] = useState('admin@neoerp.com');
  const [pw, setPw] = useState('••••••••');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (e) => {
    e && e.preventDefault();
    setErr('');
    if (!email.includes('@')) { setErr('Please enter a valid email'); return; }
    if (!pw || pw.length < 4) { setErr('Password is too short'); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); goto('dashboard'); }, 700);
  };

  return (
    <div className="auth">
      <AuthArt/>
      <div className="auth-form-wrap">
        <form className="auth-form" onSubmit={submit}>
          <div className="auth-brand">
            <div className="brand-mark">N</div>
            <div className="brand-name">NeoERP</div>
          </div>
          <h1 className="auth-h1">Sign In</h1>
          <p className="auth-p">Please enter your details to sign in</p>

          {signedOut && (
            <div className="notice" style={{ marginBottom: 18 }}>
              <span className="dot"/>
              <div>
                <b>Notice</b>
                <p>Signed out.</p>
              </div>
            </div>
          )}
          {err && (
            <div className="notice error" style={{ marginBottom: 18 }}>
              <span className="dot"/>
              <div>
                <b>Couldn't sign in</b>
                <p>{err}</p>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Email Address">
              <div className="input-wrap">
                <span className="leading"><Icon name="mail" size={16}/></span>
                <input className="input has-icon" placeholder="Enter your email"
                  value={email} onChange={(e) => setEmail(e.target.value)}/>
              </div>
            </Field>
            <Field label="Password">
              <div className="input-wrap">
                <span className="leading"><Icon name="lock" size={16}/></span>
                <input className="input has-icon has-icon-r" type={show ? 'text' : 'password'}
                  placeholder="Enter your password" value={pw} onChange={(e) => setPw(e.target.value)}/>
                <button type="button" className="trailing" onClick={() => setShow(!show)} aria-label="Toggle password">
                  <Icon name={show ? 'eyeOff' : 'eye'} size={16}/>
                </button>
              </div>
            </Field>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Checkbox checked={remember} onChange={setRemember} label="Remember me"/>
              <button type="button" className="btn-ghost" style={{ background: 'transparent', border: 0, padding: 0, fontSize: 13, fontWeight: 500, color: 'var(--fg)', cursor: 'default' }}
                onClick={() => goto('forgot')}>Forgot Password?</button>
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </div>

          <p style={{ marginTop: 28, fontSize: 12, color: 'var(--fg-4)', textAlign: 'center' }}>
            © 2026 NeoERP — Neovatus
          </p>
        </form>
      </div>
    </div>
  );
}

// Forgot password
function ForgotPassword({ goto }) {
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const submit = (e) => {
    e.preventDefault();
    setErr('');
    if (!email.includes('@')) { setErr('Enter the email address on your account.'); return; }
    goto('sent', { email });
  };
  return (
    <div className="auth">
      <AuthArt/>
      <div className="auth-form-wrap">
        <form className="auth-form" onSubmit={submit}>
          <div className="auth-brand">
            <div className="brand-mark">N</div>
            <div className="brand-name">NeoERP</div>
          </div>
          <button type="button" className="btn-ghost" style={{ background: 'transparent', border: 0, padding: 0, fontSize: 13, color: 'var(--fg-3)', marginBottom: 16, cursor: 'default', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            onClick={() => goto('signin')}>
            <Icon name="arrowL" size={14}/> Back to sign in
          </button>
          <h1 className="auth-h1">Forgot Password?</h1>
          <p className="auth-p">No worries. Enter your email and we'll send you a reset link.</p>

          {err && (
            <div className="notice error" style={{ marginBottom: 18 }}>
              <span className="dot"/>
              <div><b>Check your email</b><p>{err}</p></div>
            </div>
          )}

          <Field label="Email Address">
            <div className="input-wrap">
              <span className="leading"><Icon name="mail" size={16}/></span>
              <input className="input has-icon" placeholder="you@company.com"
                value={email} onChange={(e) => setEmail(e.target.value)}/>
            </div>
          </Field>

          <button type="submit" className="btn btn-primary btn-lg btn-block" style={{ marginTop: 20 }}>
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
}

// Email sent
function EmailSent({ goto, email }) {
  return (
    <div className="auth">
      <AuthArt/>
      <div className="auth-form-wrap">
        <div className="auth-form" style={{ textAlign: 'center' }}>
          <div className="auth-brand" style={{ justifyContent: 'center' }}>
            <div className="brand-mark">N</div>
            <div className="brand-name">NeoERP</div>
          </div>
          <div style={{ width: 64, height: 64, margin: '0 auto 22px', borderRadius: 16, background: 'var(--success-bg)', color: 'var(--success-fg)', display: 'grid', placeItems: 'center' }}>
            <Icon name="mail" size={28}/>
          </div>
          <h1 className="auth-h1" style={{ textAlign: 'center' }}>Check your email</h1>
          <p className="auth-p" style={{ textAlign: 'center' }}>
            We've sent a password reset link to{' '}
            <b style={{ color: 'var(--fg)' }}>{email || 'your inbox'}</b>.
            The link expires in 30 minutes.
          </p>

          <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: 8 }}
            onClick={() => goto('reset')}>
            Open Reset (demo)
          </button>
          <button className="btn btn-secondary btn-lg btn-block" style={{ marginTop: 10 }}
            onClick={() => goto('signin')}>
            Back to Sign In
          </button>

          <p style={{ marginTop: 24, fontSize: 12.5, color: 'var(--fg-3)' }}>
            Didn't get it? Check spam, or{' '}
            <button type="button" style={{ background: 'transparent', border: 0, padding: 0, color: 'var(--fg)', fontWeight: 500, textDecoration: 'underline', cursor: 'default' }}
              onClick={() => goto('forgot')}>resend</button>.
          </p>
        </div>
      </div>
    </div>
  );
}

// Reset password
function ResetPassword({ goto }) {
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');

  const checks = {
    len: pw.length >= 8,
    num: /\d/.test(pw),
    sym: /[^A-Za-z0-9]/.test(pw),
    case: /[A-Z]/.test(pw) && /[a-z]/.test(pw),
  };
  const score = Object.values(checks).filter(Boolean).length;
  const strength = ['Weak','Fair','Good','Strong','Excellent'][score];
  const submit = (e) => {
    e.preventDefault();
    setErr('');
    if (score < 3) { setErr('Please choose a stronger password.'); return; }
    if (pw !== pw2) { setErr('Passwords don\'t match.'); return; }
    goto('reset-success');
  };
  return (
    <div className="auth">
      <AuthArt/>
      <div className="auth-form-wrap">
        <form className="auth-form" onSubmit={submit}>
          <div className="auth-brand">
            <div className="brand-mark">N</div>
            <div className="brand-name">NeoERP</div>
          </div>
          <h1 className="auth-h1">Set new password</h1>
          <p className="auth-p">Choose a password you haven't used before.</p>

          {err && (
            <div className="notice error" style={{ marginBottom: 18 }}>
              <span className="dot"/>
              <div><b>Try again</b><p>{err}</p></div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="New Password">
              <div className="input-wrap">
                <span className="leading"><Icon name="lock" size={16}/></span>
                <input className="input has-icon has-icon-r" type={show ? 'text' : 'password'}
                  placeholder="At least 8 characters" value={pw} onChange={(e) => setPw(e.target.value)}/>
                <button type="button" className="trailing" onClick={() => setShow(!show)}>
                  <Icon name={show ? 'eyeOff' : 'eye'} size={16}/>
                </button>
              </div>
            </Field>

            {pw.length > 0 && (
              <div>
                <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                  {[0,1,2,3].map((i) => (
                    <div key={i} style={{
                      flex: 1, height: 4, borderRadius: 2,
                      background: i < score ? (score >= 3 ? 'var(--success-dot)' : score >= 2 ? 'var(--warn-dot)' : 'var(--danger-dot)') : 'var(--border)',
                      transition: 'background 150ms'
                    }}/>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>
                  Strength: <b style={{ color: 'var(--fg)' }}>{strength}</b>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
                  {[
                    ['len','At least 8 characters'],
                    ['case','Upper & lower case'],
                    ['num','A number'],
                    ['sym','A symbol'],
                  ].map(([k, t]) => (
                    <span key={k} style={{ fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 5, color: checks[k] ? 'var(--success-fg)' : 'var(--fg-4)' }}>
                      <Icon name={checks[k] ? 'check' : 'dot'} size={12}/> {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Field label="Confirm Password">
              <div className="input-wrap">
                <span className="leading"><Icon name="lock" size={16}/></span>
                <input className="input has-icon" type={show ? 'text' : 'password'}
                  placeholder="Re-enter password" value={pw2} onChange={(e) => setPw2(e.target.value)}/>
              </div>
            </Field>

            <button type="submit" className="btn btn-primary btn-lg btn-block">
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Reset success
function ResetSuccess({ goto }) {
  return (
    <div className="auth">
      <AuthArt/>
      <div className="auth-form-wrap">
        <div className="auth-form" style={{ textAlign: 'center' }}>
          <div className="auth-brand" style={{ justifyContent: 'center' }}>
            <div className="brand-mark">N</div>
            <div className="brand-name">NeoERP</div>
          </div>
          <div style={{ width: 64, height: 64, margin: '0 auto 22px', borderRadius: 999, background: 'var(--success-bg)', color: 'var(--success-fg)', display: 'grid', placeItems: 'center' }}>
            <Icon name="check" size={32} strokeWidth={2.5}/>
          </div>
          <h1 className="auth-h1" style={{ textAlign: 'center' }}>Password reset</h1>
          <p className="auth-p" style={{ textAlign: 'center' }}>
            Your password has been updated. You can now sign in with your new credentials.
          </p>
          <button className="btn btn-primary btn-lg btn-block" onClick={() => goto('signin')}>
            Continue to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SignIn, ForgotPassword, EmailSent, ResetPassword, ResetSuccess });
