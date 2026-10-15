// NeoERP — People & memberships.
// The unit is the membership, not the user: one human can own a company,
// franchise a branch of another, and be an employee at a third.

function PeopleList({ goto }) {
  const [q, setQ] = useState('');
  const rows = PEOPLE.filter(p =>
    !q || p.nm.toLowerCase().includes(q.toLowerCase()) || p.email.toLowerCase().includes(q.toLowerCase()) ||
    p.memberships.some(m => m.target.toLowerCase().includes(q.toLowerCase())));

  const scopeLabel = (p) => {
    const c = p.memberships.filter(m => m.scope === 'company').length;
    const b = p.memberships.filter(m => m.scope === 'branch').length;
    const pl = p.memberships.filter(m => m.scope === 'platform').length;
    return [pl && 'Platform', c && `${c} compan${c > 1 ? 'ies' : 'y'}`, b && `${b} branch${b > 1 ? 'es' : ''}`]
      .filter(Boolean).join(' · ');
  };

  return (
    <>
      <PageHead
        title="People"
        crumbs={['Super Admin', <span className="here" key="h">People</span>]}
        actions={<button className="btn btn-primary"><Icon name="plus" size={16}/> Invite person</button>}/>

      <div className="notice" style={{ marginBottom: 16 }}>
        <span className="dot"/>
        <div>
          <b>One person, many memberships</b>
          <p>Access is granted per <i>membership</i> — a pairing of person, scope and role. Someone can own one company and franchise a branch of another; those are unrelated grants.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="search" style={{ maxWidth: 340, flex: '1 1 auto' }}>
            <Icon name="search" size={15}/>
            <input placeholder="Search people, emails or companies" value={q} onChange={(e) => setQ(e.target.value)}/>
          </div>
          <span style={{ fontSize: 12.5, color: 'var(--fg-3)' }}>{rows.length} of {PEOPLE.length}</span>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: '30%' }}>Person</th>
              <th>Access</th>
              <th>Roles</th>
              <th>Last active</th>
              <th>Status</th>
              <th style={{ width: 1 }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(p => (
              <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => goto('person', { id: p.id })}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="avatar" style={{ width: 36, height: 36, fontSize: 13 }}>{p.initials}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600 }}>{p.nm}</div>
                      <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>{p.email}</div>
                    </div>
                  </div>
                </td>
                <td data-label="Access" style={{ fontSize: 13 }}>{scopeLabel(p)}</td>
                <td data-label="Roles">
                  <div className="mods">
                    {[...new Set(p.memberships.map(m => m.role))].map(r => (
                      <span key={r} className="mod-chip">{r}</span>
                    ))}
                  </div>
                </td>
                <td data-label="Last active" style={{ fontSize: 13, color: 'var(--fg-3)' }}>{p.lastActive}</td>
                <td data-label="Status">
                  <Pill tone={p.status === 'Active' ? 'success' : p.status === 'Invited' ? 'warn' : 'danger'}>{p.status}</Pill>
                </td>
                <td data-label="" onClick={(e) => e.stopPropagation()}>
                  <button className="btn btn-secondary btn-sm" onClick={() => goto('person', { id: p.id })}>Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="empty">
            <Icon name="search" size={48} className="ico"/>
            <h3>No one matches “{q}”</h3>
            <p style={{ margin: 0, fontSize: 13 }}>Try a company name, or clear the search.</p>
          </div>
        )}
      </div>
    </>
  );
}

function PersonDetail({ id, goto }) {
  const person = PEOPLE.find(p => p.id === id) || PEOPLE[0];
  const [sel, setSel] = useState(0);
  const toast = useToast();
  // §12: a 2FA reset on someone else's account is "reason-gated, and is
  // logged" — no amendment reference, this isn't a contract event.
  const { request, modal: reasonModal } = useReasonGate(({ label, sub, reason }) => {
    toast && toast({ title: label, sub: `${sub} Reason: “${reason}”` });
  });
  const m = person.memberships[sel];

  // Effective permissions = role baseline, then direct grants, then revokes.
  const rows = useMemo(() => {
    if (!m) return [];
    const base = ROLE_PERMS[m.role] || [];
    const scopeName = m.target;
    const out = base.map(perm => {
      const rev = person.grants.find(g => g.perm === perm && g.effect === 'revoke' && g.scope === scopeName);
      return rev
        ? { perm, state: 'revoked', src: `Revoked by ${rev.by} · ${rev.when}`, why: rev.reason }
        : { perm, state: 'role', src: `From role ${m.role}`, why: null };
    });
    person.grants
      .filter(g => g.effect === 'grant' && g.scope === scopeName && !base.includes(g.perm))
      .forEach(g => out.push({ perm: g.perm, state: 'granted', src: `Granted by ${g.by} · ${g.when}`, why: g.reason }));
    return out.sort((a, b) => a.perm.localeCompare(b.perm));
  }, [person, sel]);

  const counts = {
    active: rows.filter(r => r.state !== 'revoked').length,
    granted: rows.filter(r => r.state === 'granted').length,
    revoked: rows.filter(r => r.state === 'revoked').length,
  };

  const scopeIcon = (s) => s === 'platform' ? 'shield' : s === 'company' ? 'building' : 'map';

  return (
    <>
      <PageHead
        title={person.nm}
        crumbs={['Super Admin',
          <button className="crumb-btn" key="p" onClick={() => goto('people')}>People</button>,
          <span className="here" key="h">{person.nm}</span>]}
        actions={
          <div className="row-flex">
            {person.status === 'Locked' && (
              <button className="btn btn-secondary" onClick={() => toast && toast({ title: 'Account unlocked', sub: `${person.nm} can sign in again. Logged to audit.` })}>
                <Icon name="lock" size={16}/> Unlock
              </button>
            )}
            <button className="btn btn-secondary" onClick={() => request({
              kind: 'reset-2fa',
              label: 'Two-factor reset',
              sub: 'A new enrolment email has been sent.',
              reasonHint: `Why ${person.nm.split(' ')[0]} needs a reset — shown in the audit log.`,
              reasonPlaceholder: 'Lost their authenticator device',
              apply: () => {},
            })}>
              <Icon name="key" size={16}/> Reset 2FA
            </button>
            <button className="btn btn-primary"><Icon name="plus" size={16}/> Add membership</button>
          </div>
        }/>

      <div className="rgrid rgrid-7-5">
        <div>
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">Memberships</div>
                <div className="card-sub">{person.memberships.length} across {new Set(person.memberships.map(x => x.parent || x.target)).size} organisations</div>
              </div>
            </div>
            <div style={{ padding: 8 }}>
              {person.memberships.map((mm, i) => (
                <button key={i} className={`mem${sel === i ? ' on' : ''}`} onClick={() => setSel(i)}>
                  <div className="mem-ico"><Icon name={scopeIcon(mm.scope)} size={16}/></div>
                  <div className="mem-body">
                    <div className="mem-nm">
                      {mm.target}
                      {mm.ownership === 'franchise' && <span className="mem-own fr">Franchised</span>}
                      {mm.ownership === 'company' && mm.scope === 'branch' && <span className="mem-own">Company-owned</span>}
                      {mm.scope === 'platform' && <span className="mem-own pl">Platform</span>}
                    </div>
                    <div className="mem-meta">
                      {mm.parent ? <>Branch of {mm.parent} · </> : null}
                      <b>{mm.role}</b> · granted by {mm.by} · {mm.when}
                    </div>
                  </div>
                  <Icon name="chevR" size={15} className="mem-chev"/>
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <div className="card-head">
              <div>
                <div className="card-title">Effective permissions</div>
                <div className="card-sub">
                  As <b>{m && m.role}</b> at <b>{m && m.target}</b> · {counts.active} active
                  {counts.granted ? `, ${counts.granted} granted directly` : ''}
                  {counts.revoked ? `, ${counts.revoked} revoked` : ''}
                </div>
              </div>
            </div>
            <div style={{ padding: '4px 0' }}>
              {rows.map(r => (
                <div key={r.perm} className={`perm ${r.state}`}>
                  <span className="perm-nm">{r.perm}</span>
                  <span className={`perm-src ${r.state}`}>
                    {r.state === 'role' ? 'Role' : r.state === 'granted' ? 'Direct grant' : 'Revoked'}
                  </span>
                  <span className="perm-why">
                    {r.src}
                    {r.why && <span className="perm-reason">“{r.why}”</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card card-pad">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div className="avatar lg">{person.initials}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{person.nm}</div>
                <div style={{ fontSize: 12.5, color: 'var(--fg-3)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{person.email}</div>
              </div>
            </div>
            <dl className="kv" style={{ gridTemplateColumns: '100px 1fr' }}>
              <dt>Status</dt>
              <dd><Pill tone={person.status === 'Active' ? 'success' : person.status === 'Invited' ? 'warn' : 'danger'}>{person.status}</Pill></dd>
              <dt>Country</dt><dd>{person.country}</dd>
              <dt>Last active</dt><dd>{person.lastActive}</dd>
              <dt>Memberships</dt><dd>{person.memberships.length}</dd>
              <dt>Overrides</dt><dd>{person.grants.length || 'None'}</dd>
            </dl>
          </div>

          <div className="card">
            <div className="card-head"><div className="card-title">Why this matters</div></div>
            <div className="card-pad" style={{ paddingTop: 4, fontSize: 12.5, color: 'var(--fg-2)', lineHeight: 1.6 }}>
              <p style={{ margin: '0 0 10px' }}>
                Revokes are the hard part. A permission removed from one membership stays intact on the others — so
                <b> {person.nm.split(' ')[0]}</b> can be blocked from group reports at a franchised branch while keeping
                them at their own company.
              </p>
              <p style={{ margin: 0, color: 'var(--fg-3)' }}>
                Every row above names its source. If a permission can't be traced to a role or a named grant, it shouldn't exist.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .mem { display: flex; align-items: center; gap: 12px; width: 100%; text-align: left; padding: 12px 12px;
          border: 1px solid transparent; border-radius: var(--r-md); background: transparent; cursor: default; }
        .mem:hover { background: var(--bg-soft); }
        .mem.on { background: var(--bg-soft); border-color: var(--border-strong); }
        .mem-ico { width: 34px; height: 34px; border-radius: var(--r-md); background: var(--bg-soft); display: grid; place-items: center; color: var(--fg-2); flex-shrink: 0; }
        .mem.on .mem-ico { background: var(--accent); color: var(--accent-fg); }
        .mem-body { flex: 1; min-width: 0; }
        .mem-nm { font-size: 13.5px; font-weight: 600; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .mem-own { font-size: 10px; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; background: var(--bg-elev); border: 1px solid var(--border); color: var(--fg-3); }
        .mem-own.fr { background: var(--accent); color: var(--accent-fg); border-color: var(--accent); }
        .mem-own.pl { background: var(--info-bg); color: var(--info-fg); border-color: transparent; }
        .mem-meta { font-size: 11.5px; color: var(--fg-3); margin-top: 3px; }
        .mem-chev { color: var(--fg-4); flex-shrink: 0; }

        .perm { display: grid; grid-template-columns: 190px 92px 1fr; gap: 14px; align-items: baseline;
          padding: 10px 20px; border-bottom: 1px solid var(--border); font-size: 12.5px; }
        .perm:last-child { border-bottom: 0; }
        .perm-nm { font-family: var(--font-mono); font-size: 12px; color: var(--fg); }
        .perm.revoked .perm-nm { color: var(--fg-4); text-decoration: line-through; }
        .perm-src { font-size: 10px; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; padding: 2px 7px; border-radius: 4px; text-align: center;
          background: var(--bg-soft); color: var(--fg-3); }
        .perm-src.granted { background: var(--success-bg); color: var(--success-fg); }
        .perm-src.revoked { background: var(--danger-bg); color: var(--danger-fg); }
        .perm-why { color: var(--fg-3); font-size: 11.5px; line-height: 1.5; }
        .perm-reason { display: block; color: var(--fg-4); font-style: italic; margin-top: 2px; }

        @media (max-width: 720px) {
          .perm { grid-template-columns: 1fr; gap: 4px; }
          .perm-src { justify-self: start; }
        }
      `}</style>
      {reasonModal}
    </>
  );
}

Object.assign(window, { PeopleList, PersonDetail });
