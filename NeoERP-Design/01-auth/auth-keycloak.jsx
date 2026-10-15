// NeoERP — Keycloak-backed auth screens.
// Each screen maps to one Keycloak login-theme template. The badge at the
// bottom of each form names it, so the theme work is unambiguous.

function FtlBadge({ name, note }) {
  return (
    <div className="ftl-badge">
      <span className="ftl-name">{name}</span>
      {note && <span className="ftl-note">{note}</span>}
    </div>
  );
}

function AuthPage({ title, sub, back, goto, children, ftl, ftlNote, notice }) {
  return (
    <div className="auth">
      <AuthArt/>
      <div className="auth-form-wrap">
        <div className="auth-form">
          <div className="auth-brand">
            <div className="brand-mark">N</div>
            <div className="brand-name">NeoERP</div>
          </div>
          {back && (
            <button type="button" className="auth-back" onClick={() => goto(back.to)}>
              <Icon name="arrowL" size={14}/> {back.label}
            </button>
          )}
          <h1 className="auth-h1">{title}</h1>
          {sub && <p className="auth-p">{sub}</p>}
          {notice}
          {children}
          {ftl && <FtlBadge name={ftl} note={ftlNote}/>}
        </div>
      </div>
      <style>{`
        .auth-back { background: transparent; border: 0; padding: 0; margin-bottom: 16px; font-size: 13px; color: var(--fg-3); cursor: default; display: inline-flex; align-items: center; gap: 6px; }
        .auth-back:hover { color: var(--fg); }
        .ftl-badge { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; margin-top: 32px; padding-top: 14px; border-top: 1px solid var(--border); }
        .ftl-name { font-family: var(--font-mono); font-size: 11px; color: var(--fg-2); background: var(--bg-soft); padding: 3px 7px; border-radius: var(--r-sm); }
        .ftl-note { font-size: 11.5px; color: var(--fg-4); flex: 1; min-width: 180px; line-height: 1.45; }
        .idp-list { display: flex; flex-direction: column; gap: 8px; }
        .idp-btn { display: flex; align-items: center; gap: 12px; width: 100%; height: 48px; padding: 0 16px; border: 1px solid var(--border); border-radius: var(--r-md); background: var(--bg); color: var(--fg); font-size: 13.5px; font-weight: 500; cursor: default; text-align: left; }
        .idp-btn:hover { background: var(--surface-hover); border-color: var(--border-strong); }
        .idp-mark { width: 22px; height: 22px; border-radius: 5px; display: grid; place-items: center; font-size: 10px; font-weight: 700; flex-shrink: 0; color: var(--accent-fg); background: var(--accent); }
        .idp-btn .idp-hint { margin-left: auto; font-size: 11.5px; color: var(--fg-4); font-weight: 400; }
        .auth-div { display: flex; align-items: center; gap: 12px; margin: 20px 0; font-size: 11.5px; color: var(--fg-4); }
        .auth-div::before, .auth-div::after { content: ''; height: 1px; background: var(--border); flex: 1; }
        .otp-row { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 8px; }
        .otp-box { min-width: 0; width: 100%; height: 56px; text-align: center; font-family: var(--font-mono); font-size: 20px; font-weight: 500; border: 1px solid var(--border); border-radius: var(--r-md); background: var(--bg); color: var(--fg); outline: none; }
        .otp-box:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--focus-soft); }
        .otp-box.bad { border-color: var(--danger-fg); }
        .wsp-list { display: flex; flex-direction: column; gap: 6px; margin-top: 10px; }
        .wsp-item { display: flex; align-items: center; gap: 12px; width: 100%; padding: 11px 14px; border: 1px solid var(--border); border-radius: var(--r-md); background: var(--bg); cursor: default; text-align: left; }
        .wsp-item:hover { background: var(--surface-hover); border-color: var(--border-strong); }
        .wsp-nm { font-size: 13.5px; font-weight: 500; color: var(--fg); }
        .wsp-host { font-family: var(--font-mono); font-size: 11.5px; color: var(--fg-3); }
        .sub-wrap { display: flex; align-items: stretch; }
        .sub-wrap .input { border-top-right-radius: 0; border-bottom-right-radius: 0; text-align: right; }
        .sub-suffix { display: grid; place-items: center; padding: 0 14px; border: 1px solid var(--border); border-left: 0; border-top-right-radius: var(--r-md); border-bottom-right-radius: var(--r-md); background: var(--bg-soft); color: var(--fg-3); font-family: var(--font-mono); font-size: 12.5px; white-space: nowrap; }
        .pw-checks { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 16px; margin-top: 4px; }
        .pw-check { display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--fg-3); }
        .pw-check.on { color: var(--success-fg); }
        .lock-clock { font-family: var(--font-mono); font-size: 34px; font-weight: 500; letter-spacing: -0.02em; color: var(--fg); margin: 4px 0 2px; }
      `}</style>
    </div>
  );
}

// ── 1. Workspace entry — realm / home-IdP discovery ───────────────────
function WorkspaceEntry({ goto }) {
  const [sub, setSub] = useState('');
  const [err, setErr] = useState('');
  const recent = [
    { nm: 'Kystgruppe Nordic', host: 'kystgruppe' },
    { nm: 'DevCo Industries', host: 'devco' },
  ];
  const submit = (e) => {
    e.preventDefault();
    if (!sub.trim()) { setErr('Enter your workspace address to continue.'); return; }
    setErr('');
    goto('signin');
  };
  return (
    <AuthPage goto={goto} title="Find your workspace"
      sub="Your company has its own sign-in address. Enter it to continue."
      ftl="app route — not a Keycloak template"
      ftlNote="Resolves which realm (or home IdP) to redirect to. Runs before Keycloak sees the request."
      notice={err ? <div className="notice error" style={{ marginBottom: 18 }}><span className="dot"/><div><b>Workspace required</b><p>{err}</p></div></div> : null}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Workspace address">
          <div className="sub-wrap">
            <input className="input" placeholder="acme" value={sub}
              onChange={(e) => setSub(e.target.value.replace(/[^a-z0-9-]/gi, '').toLowerCase())}/>
            <div className="sub-suffix">.neoerp.com</div>
          </div>
        </Field>
        <button type="submit" className="btn btn-primary btn-lg btn-block">Continue</button>
      </form>
      <div className="auth-div">recent on this device</div>
      <div className="wsp-list">
        {recent.map(r => (
          <button key={r.host} className="wsp-item" onClick={() => goto('signin')}>
            <div className="avatar sq" style={{ width: 32, height: 32, fontSize: 11 }}>{r.nm.slice(0,2).toUpperCase()}</div>
            <div>
              <div className="wsp-nm">{r.nm}</div>
              <div className="wsp-host">{r.host}.neoerp.com</div>
            </div>
            <Icon name="chevR" size={16} style={{ marginLeft: 'auto', color: 'var(--fg-4)' }}/>
          </button>
        ))}
      </div>
      <p style={{ marginTop: 20, fontSize: 12.5, color: 'var(--fg-3)' }}>
        Don't know your address? Ask your company administrator — or check the invitation email you were sent.
      </p>
    </AuthPage>
  );
}

// ── 2. SSO / identity providers ───────────────────────────────────────
function SsoSignIn({ goto }) {
  const idps = [
    { id: 'entra', nm: 'Microsoft Entra ID', mark: 'MS', hint: 'default' },
    { id: 'google', nm: 'Google Workspace', mark: 'G' },
    { id: 'saml', nm: 'Kystgruppe SAML', mark: 'S', hint: 'SAML 2.0' },
  ];
  return (
    <AuthPage goto={goto} title="Sign in to Kystgruppe"
      sub="This workspace uses single sign-on. Choose your provider to continue."
      back={{ to: 'workspace', label: 'Change workspace' }}
      ftl="login.ftl — social providers block"
      ftlNote="Rendered from social.providers. Order and labels come from realm config, not from this design.">
      <div className="idp-list">
        {idps.map(p => (
          <button key={p.id} className="idp-btn" onClick={() => goto('otp')}>
            <span className="idp-mark">{p.mark}</span>
            Continue with {p.nm}
            {p.hint && <span className="idp-hint">{p.hint}</span>}
          </button>
        ))}
      </div>
      <div className="auth-div">or</div>
      <button className="btn btn-secondary btn-lg btn-block" onClick={() => goto('signin')}>
        Sign in with email and password
      </button>
      <p style={{ marginTop: 20, fontSize: 12.5, color: 'var(--fg-3)' }}>
        Password sign-in can be disabled per workspace. When it is, only the providers above appear.
      </p>
    </AuthPage>
  );
}

// ── 3. OTP challenge ──────────────────────────────────────────────────
function OtpChallenge({ goto }) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const refs = useRef([]);

  const setDigit = (i, v) => {
    const d = v.replace(/\D/g, '');
    if (d.length > 1) {
      const next = [...code];
      d.split('').slice(0, 6 - i).forEach((ch, k) => { next[i + k] = ch; });
      setCode(next);
      const last = Math.min(i + d.length, 5);
      refs.current[last] && refs.current[last].focus();
      return;
    }
    const next = [...code]; next[i] = d; setCode(next); setErr('');
    if (d && i < 5) refs.current[i + 1] && refs.current[i + 1].focus();
  };
  const onKey = (i, e) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) refs.current[i - 1].focus();
  };
  const submit = (e) => {
    e && e.preventDefault();
    const full = code.join('');
    if (full.length < 6) { setErr('Enter all six digits.'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (full === '000000') { setErr('That code is invalid or has expired. Codes are valid for 30 seconds.'); setCode(['','','','','','']); refs.current[0].focus(); }
      else goto('dashboard');
    }, 700);
  };

  if (recovery) {
    return (
      <AuthPage goto={goto} title="Use a recovery code"
        sub="Enter one of the twelve codes you saved when you set up two-factor authentication. Each code works once."
        back={{ to: 'otp', label: 'Back to authenticator' }}
        ftl="login-recovery-authn-code-config.ftl"
        ftlNote="Keycloak asks for a specific numbered code, not any code. The label is dynamic.">
        <form onSubmit={(e) => { e.preventDefault(); goto('dashboard'); }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Recovery code 7 of 12">
            <input className="input" placeholder="xxxx-xxxx-xxxx" style={{ fontFamily: 'var(--font-mono)' }}/>
          </Field>
          <button type="submit" className="btn btn-primary btn-lg btn-block">Verify and sign in</button>
        </form>
        <p style={{ marginTop: 18, fontSize: 12.5, color: 'var(--fg-3)' }}>
          Out of codes? Your company administrator can reset two-factor authentication on your account.
        </p>
      </AuthPage>
    );
  }

  return (
    <AuthPage goto={goto} title="Two-factor authentication"
      sub="Open your authenticator app and enter the six-digit code for NeoERP."
      back={{ to: 'signin', label: 'Back to sign in' }}
      ftl="login-otp.ftl"
      ftlNote="Shown when the user has an OTP credential, or when 2FA is required by a realm flow."
      notice={err ? <div className="notice error" style={{ marginBottom: 18 }}><span className="dot"/><div><b>Verification failed</b><p>{err}</p></div></div> : null}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <div className="field-label" style={{ marginBottom: 8 }}>Authentication code</div>
          <div className="otp-row">
            {code.map((d, i) => (
              <input key={i} ref={(el) => { refs.current[i] = el; }} className={`otp-box${err ? ' bad' : ''}`}
                inputMode="numeric" autoComplete="one-time-code" maxLength={6} size={1} value={d}
                onChange={(e) => setDigit(i, e.target.value)} onKeyDown={(e) => onKey(i, e)}
                aria-label={`Digit ${i + 1}`}/>
            ))}
          </div>
        </div>
        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
          {loading ? 'Verifying…' : 'Verify and sign in'}
        </button>
      </form>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
        <button className="btn btn-ghost" style={{ justifyContent: 'flex-start', padding: 0, height: 'auto' }} onClick={() => setRecovery(true)}>
          <Icon name="key" size={15}/> Lost your device? Use a recovery code
        </button>
        <p style={{ margin: 0, fontSize: 12.5, color: 'var(--fg-3)' }}>
          Enter <span className="wsp-host">000000</span> to see the failed state.
        </p>
      </div>
    </AuthPage>
  );
}

// ── 4. Account temporarily locked ─────────────────────────────────────
function AccountLocked({ goto }) {
  const [left, setLeft] = useState(884);
  useEffect(() => {
    const id = setInterval(() => setLeft(v => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');
  return (
    <AuthPage goto={goto} title="Account temporarily locked"
      sub="Too many failed sign-in attempts. For your protection this account is locked for a short period."
      ftl="login.ftl — brute-force error state"
      ftlNote="Keycloak's temporary lockout. Realm brute-force detection must be enabled or this screen never appears."
      notice={<div className="notice error" style={{ marginBottom: 22 }}><span className="dot"/><div><b>5 failed attempts</b><p>Last attempt 2 minutes ago from 89.12.44.7 · Oslo, Norway</p></div></div>}>
      <div className="card card-pad" style={{ textAlign: 'center', marginBottom: 18 }}>
        <div style={{ fontSize: 12, color: 'var(--fg-3)', fontWeight: 500 }}>Unlocks automatically in</div>
        <div className="lock-clock">{mm}:{ss}</div>
        <div style={{ fontSize: 12, color: 'var(--fg-4)' }}>No action needed — just wait, then sign in again.</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn btn-primary btn-lg btn-block" onClick={() => goto('forgot')}>
          Reset my password instead
        </button>
        <button className="btn btn-secondary btn-lg btn-block" onClick={() => goto('signin')}>
          Back to sign in
        </button>
      </div>
      <p style={{ marginTop: 20, fontSize: 12.5, color: 'var(--fg-3)' }}>
        Wasn't you? Someone may be trying to access your account. Reset your password, and tell your company administrator.
      </p>
    </AuthPage>
  );
}

// ── 5. Verify email ───────────────────────────────────────────────────
function VerifyEmail({ goto, email = 'ingrid.hansen@kystgruppe.no' }) {
  return (
    <AuthPage goto={goto} title="Verify your email"
      sub={`We sent a verification link to ${email}. Open it to finish signing in.`}
      ftl="login-verify-email.ftl"
      ftlNote="A required action, not a page the user navigates to. It interrupts the flow until the address is confirmed.">
      <div className="notice" style={{ marginBottom: 20 }}>
        <span className="dot"/>
        <div>
          <b>Waiting on you</b>
          <p>This page will continue on its own once you've clicked the link. You can close this tab and use the link instead.</p>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn btn-secondary btn-lg btn-block" onClick={() => goto('verify')}>
          <Icon name="refresh" size={16}/> Resend verification email
        </button>
        <button className="btn btn-ghost btn-lg btn-block" onClick={() => goto('signin')}>
          Sign in with a different account
        </button>
      </div>
      <p style={{ marginTop: 20, fontSize: 12.5, color: 'var(--fg-3)' }}>
        Wrong address? Your administrator can correct it on your user record — you can't change it yourself before verifying.
      </p>
    </AuthPage>
  );
}

// ── 6. Set / update password (invite acceptance + forced rotation) ─────
function SetPassword({ goto, mode = 'invite' }) {
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const invite = mode === 'invite';

  const checks = {
    'At least 12 characters': pw.length >= 12,
    'One uppercase letter': /[A-Z]/.test(pw),
    'One number': /[0-9]/.test(pw),
    'One symbol': /[^A-Za-z0-9]/.test(pw),
  };
  const score = Object.values(checks).filter(Boolean).length;

  const submit = (e) => {
    e.preventDefault();
    if (score < 4) { setErr('Your password must meet all four requirements.'); return; }
    if (pw !== pw2) { setErr("Passwords don't match."); return; }
    setErr('');
    goto(invite ? 'otp' : 'dashboard');
  };

  return (
    <AuthPage goto={goto}
      title={invite ? 'Welcome to NeoERP' : 'Update your password'}
      sub={invite
        ? 'Priya Raman invited you to Kystgruppe Nordic as HR Manager. Set a password to activate your account.'
        : 'Your administrator requires a password change before you continue.'}
      ftl="login-update-password.ftl"
      ftlNote={invite
        ? 'Reached from an Execute-Actions email (UPDATE_PASSWORD), which is how invited staff onboard. Same template, different framing.'
        : 'The UPDATE_PASSWORD required action, set on the user or by password policy expiry.'}
      notice={err ? <div className="notice error" style={{ marginBottom: 18 }}><span className="dot"/><div><b>Check your password</b><p>{err}</p></div></div> : null}>
      {invite && (
        <div className="card card-pad" style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="avatar sq" style={{ width: 36, height: 36, fontSize: 12 }}>KY</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>Kystgruppe Nordic</div>
            <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>ingrid.hansen@kystgruppe.no · HR Manager</div>
          </div>
          <span className="pill pill-success"><span className="dot"/>Invited</span>
        </div>
      )}
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label={invite ? 'Create a password' : 'New password'}>
          <div className="input-wrap">
            <span className="leading"><Icon name="lock" size={16}/></span>
            <input className="input has-icon has-icon-r" type={show ? 'text' : 'password'}
              placeholder="Enter a strong password" value={pw} onChange={(e) => setPw(e.target.value)}/>
            <button type="button" className="trailing" onClick={() => setShow(!show)} aria-label="Toggle password">
              <Icon name={show ? 'eyeOff' : 'eye'} size={16}/>
            </button>
          </div>
        </Field>
        <div className="pw-checks">
          {Object.entries(checks).map(([label, ok]) => (
            <div key={label} className={`pw-check${ok ? ' on' : ''}`}>
              <Icon name={ok ? 'checkCircle' : 'dot'} size={14}/> {label}
            </div>
          ))}
        </div>
        <Field label="Confirm password">
          <div className="input-wrap">
            <span className="leading"><Icon name="lock" size={16}/></span>
            <input className="input has-icon" type={show ? 'text' : 'password'}
              placeholder="Re-enter your password" value={pw2} onChange={(e) => setPw2(e.target.value)}/>
          </div>
        </Field>
        <button type="submit" className="btn btn-primary btn-lg btn-block">
          {invite ? 'Activate account' : 'Update password and continue'}
        </button>
      </form>
      <p style={{ marginTop: 20, fontSize: 12.5, color: 'var(--fg-3)' }}>
        {invite
          ? 'Next you\'ll set up two-factor authentication, which is required for all staff accounts.'
          : 'You will stay signed in on this device. Other sessions are ended.'}
      </p>
    </AuthPage>
  );
}

// ── 7. Page / session expired ─────────────────────────────────────────
function PageExpired({ goto }) {
  return (
    <AuthPage goto={goto} title="This page has expired"
      sub="You were away too long and the sign-in attempt timed out. Nothing was submitted."
      ftl="login-page-expired.ftl"
      ftlNote="Keycloak-specific and unavoidable — it fires on back-button and stale-tab submits. Both actions are required by the template.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn btn-primary btn-lg btn-block" onClick={() => goto('signin')}>
          Restart sign-in
        </button>
        <button className="btn btn-secondary btn-lg btn-block" onClick={() => goto('dashboard')}>
          Continue where I left off
        </button>
      </div>
      <p style={{ marginTop: 20, fontSize: 12.5, color: 'var(--fg-3)' }}>
        <b style={{ color: 'var(--fg-2)', fontWeight: 600 }}>Restart</b> begins a fresh attempt.
        <b style={{ color: 'var(--fg-2)', fontWeight: 600 }}> Continue</b> resumes the original one, which only works if it hasn't fully expired.
      </p>
    </AuthPage>
  );
}

Object.assign(window, {
  AuthPage, FtlBadge, WorkspaceEntry, SsoSignIn, OtpChallenge,
  AccountLocked, VerifyEmail, SetPassword, PageExpired,
});
