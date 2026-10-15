// NeoERP — Tenant first-run. What the company owner lands on after accepting
// the invitation. The work the service provider deliberately doesn't do for them.

function isDoneSafe(done, id) { return done.includes(id); }

function FirstRun({ session, onExit, onGoto }) {
  const toast = useToast();
  const s = session || { company: 'Lahore Textiles', role: 'Company Owner' };
  const [done, setDone] = useState(['account']);
  const limits = { branches: 10, users: 50, warehouses: 20 };
  const agreement = agreementFor(s.company);
  const [atLimit, setAtLimit] = useState(false);
  const used = {
    branches: atLimit ? limits.branches : done.includes('branches') ? 4 : 0,
    users: done.includes('team') ? 12 : 1,
    warehouses: done.includes('warehouses') ? 6 : 0,
  };

  const items = [
    { id: 'account', ico: 'lock', nm: 'Secure your account',
      note: 'Password set and two-factor authentication enrolled.', cta: 'Done' },
    { id: 'confirm', ico: 'building', nm: 'Confirm your company details',
      note: 'Currency PKR, fiscal year July – June and FBR filing were set from your region. Check them before you post anything.',
      cta: 'Review details' },
    { id: 'branches', ico: 'map', nm: 'Request your branches',
      note: 'Every location you operate from. Neovatus creates them — each branch carries module access and a billing arrangement, and a franchised one is a separate business.',
      cta: 'Request branches', meter: `${used.branches} of ${limits.branches} used`,
      blocked: used.branches >= limits.branches },
    { id: 'warehouses', ico: 'box', nm: 'Add warehouses and stores',
      note: 'Where stock physically sits. A branch can have several; a store is a warehouse that sells.',
      cta: 'Add warehouses', meter: `${used.warehouses} of ${limits.warehouses} used`, needs: 'branches' },
    { id: 'team', ico: 'users', nm: 'Invite your team',
      note: 'Managers, accountants, sales staff. Assign each person a role and the branch they work at.',
      cta: 'Invite people', meter: `${used.users} of ${limits.users} used` },
    { id: 'tax', ico: 'layers', nm: 'Connect FBR filing',
      note: 'Links your NTN so sales tax returns file directly. Needed before you raise your first tax invoice.',
      cta: 'Connect', needs: 'confirm' },
    { id: 'payroll', ico: 'key', nm: 'Set up your payroll cycle',
      note: 'Pay dates, salary structures, and EOBI and PESSI deductions. Import employees first if you have them.',
      cta: 'Set up payroll', needs: 'team' },
  ];

  const total = items.length;
  const complete = done.length;
  const pct = Math.round((complete / total) * 100);
  const nextItem = items.find(i => !done.includes(i.id) && (!i.needs || done.includes(i.needs)));

  const toggle = (it) => {
    if (done.includes(it.id)) { setDone(d => d.filter(x => x !== it.id)); return; }
    setDone(d => [...d, it.id]);
    toast && toast({ title: `${it.nm} — done`, sub: 'Prototype: marks the step complete.' });
  };

  return (
    <>
      <PageHead
        title={complete === total ? `${s.company} is ready` : `Welcome to ${s.company}`}
        crumbs={[s.company, <span className="here" key="h">Getting started</span>]}
        actions={onExit ? <button className="btn btn-secondary" onClick={onExit}><Icon name="arrowL" size={16}/> Exit to platform</button> : null}/>

      {agreement && <AgreementBanner agreement={agreement} onAct={() => toast && toast({ title: 'Renewal enquiry sent', sub: 'Neovatus will confirm the new term.' })}/>}

      <div className="rgrid rgrid-7-5">
        <div>
          <div className="card card-pad" style={{ marginBottom: 16 }}>
            <div className="fr-progress-hd">
              <div>
                <div className="fr-progress-n">{complete} of {total} done</div>
                <div className="fr-progress-l">
                  {complete === total ? 'Everything is set up. You can start trading.' : nextItem ? `Next: ${nextItem.nm.toLowerCase()}` : 'Finish the steps above to continue.'}
                </div>
              </div>
              <div className="fr-pct">{pct}%</div>
            </div>
            <div className="fr-track"><div className="fr-fill" style={{ width: `${pct}%` }}/></div>
            <button className="fr-demo" onClick={() => setAtLimit(v => !v)}>
              {atLimit ? 'Show branches under the limit' : 'Preview: branch limit reached'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map(it => {
              const isDone = done.includes(it.id);
              const blocked = it.needs && !done.includes(it.needs);
              const capped = it.blocked && !isDoneSafe(done, it.id);
              const isNext = nextItem && nextItem.id === it.id;
              return (
                <div key={it.id} className={`fr-item${isDone ? ' done' : ''}${blocked ? ' blocked' : ''}${isNext ? ' next' : ''}`}>
                  <button className="fr-check" onClick={() => !blocked && toggle(it)} aria-label={isDone ? 'Mark not done' : 'Mark done'}>
                    {isDone ? <Icon name="check" size={14}/> : <Icon name={it.ico} size={15}/>}
                  </button>
                  <div className="fr-body">
                    <div className="fr-nm">
                      {it.nm}
                      {isNext && <span className="fr-badge">Start here</span>}
                      {blocked && <span className="fr-badge muted-badge">After “{(items.find(x => x.id === it.needs) || {}).nm}”</span>}
                    </div>
                    <div className="fr-note">{it.note}</div>
                    {it.meter && <div className={`fr-meter${capped ? ' capped' : ''}`}>{it.meter}{capped ? ' · limit reached' : ''}</div>}
                    {capped && (
                      <div className="fr-cap">
                        You've used all {limits.branches} branches under your agreement. Adding another needs Neovatus to raise the limit —
                        request it and nothing else you're doing is interrupted.
                      </div>
                    )}
                  </div>
                  {capped ? (
                    <button className="btn btn-primary btn-sm fr-cta" onClick={() => toast && toast({ title: 'Request sent to Neovatus', sub: 'You will be notified the moment the limit is raised.' })}>
                      Request more
                    </button>
                  ) : !isDone && !blocked ? (
                    <button className="btn btn-secondary btn-sm fr-cta"
                      onClick={() => (it.id === 'branches' && onGoto) ? onGoto('request-branch') : toggle(it)}>{it.cta}</button>
                  ) : null}
                  {isDone && <span className="fr-done-tag"><Icon name="checkCircle" size={13}/> Done</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {agreement ? (
            <AgreementCard agreement={agreement} tenant={s.company} tenantView
              onRenew={() => toast && toast({ title: 'Renewal enquiry sent', sub: 'Neovatus will confirm the new term.' })}/>
          ) : (
            <div className="card">
              <div className="card-head"><div className="card-title">Your agreement</div></div>
              <div className="card-pad">
                <div className="notice">
                  <span className="dot"/>
                  <div>
                    <b>No agreement on file for {s.company}</b>
                    <p>Nothing is restricted, but there is no term or renewal date recorded. Neovatus should attach one — an unrecorded agreement is one nobody renews.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">What you're entitled to</div>
                <div className="card-sub">Set by Neovatus{agreement ? ` under ${agreement.ref}` : ''}</div>
              </div>
              <Pill tone="info">Read-only</Pill>
            </div>
            <div className="card-pad" style={{ paddingTop: 4 }}>
              <dl className="kv" style={{ gridTemplateColumns: '110px 1fr' }}>
                <dt>Region</dt><dd>Pakistan · PKR</dd>
                <dt>Fiscal year</dt><dd>July – June</dd>
                <dt>Statutory</dt><dd>FBR · EOBI · PESSI</dd>
                <dt>Users</dt><dd>{used.users} of {limits.users}</dd>
                <dt>Branches</dt><dd>{used.branches} of {limits.branches}</dd>
                <dt>Warehouses</dt><dd>{used.warehouses} of {limits.warehouses}</dd>
              </dl>
              <div className="fr-mods">
                {['Finance', 'HRMS', 'Payroll', 'Inventory', 'Sales'].map(m => <span key={m} className="mod-chip on">{m}</span>)}
                <span className="mod-chip">Manufacturing</span>
              </div>
              <p className="fr-plan-note">
                Need more branches, more users, or Manufacturing? Request it and Neovatus will action the change — you won't be blocked mid-task.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="btn btn-secondary btn-block" onClick={() => toast && toast({ title: 'Request sent to Neovatus', sub: 'It appears in the provider queue as an access request.' })}>
                  Request a change
                </button>
                {onGoto && (
                  <>
                    <button className="btn btn-ghost btn-block" onClick={() => onGoto('request-branch')}>
                      <Icon name="map" size={14}/> Request a branch
                    </button>
                    <button className="btn btn-ghost btn-block" onClick={() => onGoto('request-company')}>
                      <Icon name="plus" size={14}/> Add another company
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><div className="card-title">Who does what</div></div>
            <div className="card-pad" style={{ paddingTop: 4 }}>
              <div className="wdw">
                <div className="wdw-hd">You</div>
                <p>Branches, stores, staff, roles, and day-to-day operations. You can deactivate a branch any time — say, a store closed for renovation.</p>
              </div>
              <div className="wdw">
                <div className="wdw-hd">Neovatus</div>
                <p>Your agreement, module access, limits, and the statutory pack for your region. They can suspend an account for non-payment, but they don't run your business.</p>
              </div>
              <div className="wdw">
                <div className="wdw-hd">Passwords</div>
                <p>Nobody can set yours — not your admins, not Neovatus. Resets always go to the person who owns the account.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .fr-progress-hd { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 14px; }
        .fr-progress-n { font-size: 17px; font-weight: 600; letter-spacing: -.015em; }
        .fr-progress-l { font-size: 12.5px; color: var(--fg-3); margin-top: 3px; }
        .fr-pct { font-size: 26px; font-weight: 700; letter-spacing: -.025em; line-height: 1; }
        .fr-track { height: 6px; border-radius: 999px; background: var(--bg-soft); overflow: hidden; }
        .fr-fill { height: 100%; border-radius: 999px; background: var(--fg); transition: width 400ms var(--ease-out); }

        .fr-item { display: flex; align-items: flex-start; gap: 14px; padding: 15px 18px; background: var(--bg-elev);
          border: 1px solid var(--border); border-radius: var(--r-lg); }
        .fr-item.next { border-color: var(--fg); box-shadow: 0 0 0 1px var(--fg) inset; }
        .fr-item.blocked { background: var(--bg-soft); }
        .fr-item.blocked .fr-nm, .fr-item.blocked .fr-note { color: var(--fg-3); }
        .fr-check { width: 30px; height: 30px; flex-shrink: 0; border-radius: 999px; border: 1px solid var(--border-strong);
          background: var(--bg); color: var(--fg-3); display: grid; place-items: center; cursor: default; margin-top: 1px; }
        .fr-check:hover { border-color: var(--fg); color: var(--fg); }
        .fr-item.done .fr-check { background: var(--accent); border-color: var(--accent); color: var(--accent-fg); }
        .fr-item.blocked .fr-check { border-style: dashed; color: var(--fg-4); }
        .fr-body { flex: 1; min-width: 0; }
        .fr-nm { font-size: 14px; font-weight: 600; letter-spacing: -.01em; display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
        .fr-item.done .fr-nm { color: var(--fg-3); }
        .fr-badge { font-size: 10px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase;
          background: var(--accent); color: var(--accent-fg); padding: 2px 7px; border-radius: 4px; }
        .fr-badge.muted-badge { background: var(--bg-soft); color: var(--fg-3); text-transform: none; letter-spacing: .01em; font-weight: 500; }
        .fr-note { font-size: 12.5px; color: var(--fg-3); line-height: 1.5; margin-top: 4px; max-width: 62ch; }
        .fr-meter { font-size: 11.5px; color: var(--fg-4); margin-top: 6px; font-weight: 500; }
        .fr-meter.capped { color: var(--danger-fg); }
        .fr-cap { font-size: 12px; color: var(--fg-2); line-height: 1.5; margin-top: 8px; padding: 10px 12px; background: var(--danger-bg); border-radius: var(--r-md); max-width: 62ch; }
        .fr-demo { margin-top: 12px; background: transparent; border: 0; padding: 0; font-size: 11.5px; color: var(--fg-4); cursor: default; text-decoration: underline; }
        .fr-demo:hover { color: var(--fg-2); }
        .fr-cta { flex-shrink: 0; }
        .fr-done-tag { display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; font-weight: 500; color: var(--success-fg); flex-shrink: 0; }

        .fr-mods { display: flex; flex-wrap: wrap; gap: 6px; margin: 16px 0 14px; }
        .fr-plan-note { font-size: 12px; color: var(--fg-3); line-height: 1.55; margin: 0 0 14px; }

        @media (max-width: 720px) {
          .fr-item { flex-wrap: wrap; }
          .fr-cta { width: 100%; margin-top: 4px; }
        }
      `}</style>
    </>
  );
}

Object.assign(window, { FirstRun });
