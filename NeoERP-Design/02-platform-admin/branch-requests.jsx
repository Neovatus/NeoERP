// NeoERP — Branch requests. Two speeds in one queue: a company-owned branch
// inside the limit is nearly mechanical; a franchised one is a new commercial
// relationship and needs real decisions.

function BranchRequestDetail({ req, onApprove, onDecline, onStatus, goto }) {
  const toast = useToast();
  const p = usePlatform() || {};
  // §5: approving creates a branch (a commercial decision) and declining
  // is one click today — both go through the same reason gate.
  const { request, modal: reasonModal } = useReasonGate(({ label, sub, reason, ref }) => {
    toast && toast({ title: label, sub: sub || (ref ? `Recorded against ${ref}.` : `Reason recorded: “${reason}”`) });
  });
  const r = req;
  const fr = r.ownership === 'franchise';
  const fast = !fr && r.withinLimit;
  const [ownership, setOwnership] = useState(r.ownership);
  const [billing, setBilling] = useState(r.billing);
  const [books, setBooks] = useState(r.ownership === 'franchise' ? 'own' : 'group');
  const [mods, setMods] = useState(() => Array.isArray(r.wants) ? r.wants.slice() : []);
  const inheritReq = !Array.isArray(r.wants);
  const [override, setOverride] = useState(false);
  const inherit = inheritReq && !override;
  // Decisions are a function of ownership, not of the limit. A company-owned
  // branch that is merely over-limit needs no decisions — just a raised ceiling.
  const needsDecisions = ownership === 'franchise' || fr;

  useEffect(() => {
    setOwnership(r.ownership); setBilling(r.billing); setOverride(false);
    setBooks(r.ownership === 'franchise' ? 'own' : 'group');
    setMods(Array.isArray(r.wants) ? r.wants.slice() : []);
  }, [r.id]);

  const decided = r.status === 'Approved' || r.status === 'Declined';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">{r.branch}</div>
            <div className="card-sub">Branch of {r.company} · requested {r.when}</div>
          </div>
          <div className="row-flex" style={{ gap: 8 }}>
            {fast && <Pill tone="success">Fast path</Pill>}
            <Pill tone={r.status === 'Approved' ? 'success' : r.status === 'Declined' ? 'danger' : 'warn'}>{r.status}</Pill>
          </div>
        </div>
        <div className="card-pad">
          <dl className="kv" style={{ gridTemplateColumns: '120px 1fr' }}>
            <dt>Requested by</dt>
            <dd>{r.requester.nm}<div style={{ fontSize: 12, color: 'var(--fg-3)', fontWeight: 400 }}>{r.requester.email}</div></dd>
            <dt>Location</dt><dd>{r.city} · code {r.code}</dd>
            <dt>Type</dt>
            <dd>{fr ? 'Franchised — separate business' : 'Company-owned'}</dd>
            <dt>Module access</dt>
            <dd>{inherit ? 'Inherit the company defaults' : mods.map(id => (ENT_MODULES.find(m => m.id === id) || {}).nm).join(', ')}</dd>
          </dl>
          <div className="req-reason">
            <div className="req-reason-hd">In their words</div>
            <p>“{r.reason}”</p>
          </div>
        </div>
      </div>

      {!r.withinLimit && (
        <div className="card card-pad" style={{ borderColor: 'var(--danger-dot)' }}>
          <div className="notice error" style={{ marginBottom: 14 }}>
            <span className="dot"/>
            <div>
              <b>Blocked by the branch limit</b>
              <p>{r.limitNote} They can't add this themselves — that's why it's sitting here.</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-block" onClick={() => goto('entitlements')}>
            <Icon name="layers" size={15}/> Raise the limit in Entitlements
          </button>
        </div>
      )}

      {!decided && (
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">{needsDecisions ? 'Decisions' : 'Confirm and create'}</div>
              <div className="card-sub">
                {needsDecisions
                  ? 'A franchised branch is a new commercial relationship. These three answers are yours, not theirs.'
                  : r.withinLimit
                    ? 'Company-owned, inside the limit, inheriting company modules. Nothing here needs a judgement call.'
                    : 'Company-owned and inheriting company modules — no decisions to make. The branch limit is the only thing in the way.'}
              </div>
            </div>
          </div>
          <div className="card-pad">
            {needsDecisions && (
              <>
                <div className="brq-q">
                  <div className="brq-l">Ownership</div>
                  <div className="tri">
                    {[['company', 'Company-owned'], ['franchise', 'Franchised']].map(([v, label]) => (
                      <button key={v} className={`tri-opt${ownership === v ? ' on' : ''}`} onClick={() => setOwnership(v)}>{label}</button>
                    ))}
                  </div>
                  <div className="brq-note">
                    {ownership === 'franchise'
                      ? 'Gets its own branch owner and can hold its own books. The group still holds the agreement.'
                      : 'Operated by the group. Inherits the group’s entitlements and billing.'}
                  </div>
                </div>

                <div className="brq-q">
                  <div className="brq-l">Financials</div>
                  <div className="tri">
                    {[['own', 'Own books'], ['group', 'Group books']].map(([v, label]) => (
                      <button key={v} className={`tri-opt${books === v ? ' on' : ''}`} onClick={() => setBooks(v)} disabled={ownership === 'company'}>{label}</button>
                    ))}
                  </div>
                  <div className="brq-note">
                    {ownership === 'company'
                      ? 'Company-owned branches always post to the group ledger.'
                      : books === 'own'
                        ? 'Its own chart of accounts and its own P&L. The group sees it consolidated; the franchisee sees only their own.'
                        : 'Financially consolidated into the group despite being franchised — unusual, but it happens with managed franchises.'}
                  </div>
                </div>

                <div className="brq-q">
                  <div className="brq-l">Billing</div>
                  <div className="tri">
                    {[['group', 'Billed to group'], ['own', 'Own sub-account']].map(([v, label]) => (
                      <button key={v} className={`tri-opt${billing === v ? ' on' : ''}`} onClick={() => setBilling(v)} disabled={ownership === 'company'}>{label}</button>
                    ))}
                  </div>
                  <div className="brq-note">
                    {ownership === 'company'
                      ? 'Company-owned branches are always billed to the group.'
                      : billing === 'own'
                        ? 'You invoice the franchisee directly. The agreement stays with the group.'
                        : 'The group pays for this franchise, and settles with the franchisee themselves.'}
                  </div>
                </div>

                <div className="brq-q">
                  <div className="brq-l">Module access</div>
                  {inherit ? (
                    <>
                      <div className="brq-inherit">
                        <Icon name="checkCircle" size={15}/>
                        <span>Inherits the company defaults</span>
                      </div>
                      <div className="brq-note">
                        {r.requester.nm.split(' ')[0]} didn't ask for anything specific, so this branch gets whatever {r.company} has enabled — and follows it as that changes.
                      </div>
                      <button className="btn btn-ghost btn-sm" style={{ paddingLeft: 0, marginTop: 6 }} onClick={() => setOverride(true)}>
                        Set modules for this branch instead
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="mods">
                        {ENT_MODULES.map(m => {
                          const on = mods.includes(m.id);
                          return (
                            <button key={m.id} className={`mod-chip${on ? ' on' : ''}`}
                              onClick={() => setMods(on ? mods.filter(x => x !== m.id) : [...mods, m.id])}>
                              <span className="dot"/>{m.nm}
                            </button>
                          );
                        })}
                      </div>
                      <div className="brq-note">
                        {inheritReq
                          ? <>Overriding the company defaults for this branch only. <button className="brq-link" onClick={() => { setOverride(false); setMods([]); }}>Go back to inheriting</button></>
                          : <>{r.requester.nm.split(' ')[0]} asked for {r.wants.length} of these. What you grant is what applies.</>}
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {fr && r.proposedOwner && (
              <div className="brq-owner">
                <div className="brq-l" style={{ marginBottom: 8 }}>Proposed branch owner</div>
                <div className="va-locked">
                  <div className="avatar" style={{ width: 36, height: 36, fontSize: 13 }}>
                    {r.proposedOwner.nm.split(' ').map(x => x[0]).join('')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="va-locked-nm">{r.proposedOwner.nm}</div>
                    <div className="va-locked-sub">{r.proposedOwner.email}</div>
                  </div>
                  <Pill tone="warn">New account</Pill>
                </div>
                <div className="brq-note" style={{ marginTop: 8 }}>
                  No existing identity. Approving invites them as Branch Owner — they set their own password, same as any owner.
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20 }}>
              <button className="btn btn-primary btn-block" disabled={!r.withinLimit}
                onClick={() => request({
                  kind: 'approve',
                  label: `${needsDecisions ? (ownership === 'franchise' ? 'Franchised' : 'Company-owned') + ' branch created' : 'Branch created'}: ${r.branch}`,
                  sub: needsDecisions ? `${books === 'own' ? 'Own books' : 'Group books'} \u00b7 ${billing === 'own' ? 'own billing account' : 'billed to group'}` : undefined,
                  reasonHint: 'A new branch is a commercial decision \u2014 shown in the change history.',
                  apply: () => onApprove({ ownership, billing, books, mods: inherit ? 'inherit' : mods }),
                })}>
                <Icon name="check" size={15}/> {needsDecisions ? `Create ${ownership === 'franchise' ? 'franchised' : 'company-owned'} branch` : 'Approve & create branch'}
              </button>
              <div className="row-flex" style={{ gap: 8 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => onStatus('Contacted')}>Ask a question</button>
                <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => request({
                  kind: 'decline',
                  label: `Declined: ${r.branch}`,
                  sub: 'The requester is notified. No branch was created.',
                  reasonHint: 'Shown to nobody but Neovatus \u2014 recorded in the platform audit log.',
                  apply: onDecline,
                })}>Decline</button>
              </div>
              {p.isSuperAdmin && (
                <button className="btn btn-ghost btn-block" onClick={() => p.openLauncher({
                  company: r.company,
                  reason: `Request ${r.id} — set up ${r.branch}`,
                  onBehalfOf: r.requester.nm, requestId: r.id,
                })}>
                  <Icon name="arrowR" size={14}/> Set it up on their behalf
                </button>
              )}
            </div>
            {!r.withinLimit && (
              <p style={{ fontSize: 11.5, color: 'var(--danger-fg)', margin: '10px 0 0', lineHeight: 1.5 }}>
                Creation is disabled until the limit is raised. The block is deliberate — a silent overage is how agreements drift.
              </p>
            )}
          </div>
        </div>
      )}

      {decided && (
        <div className="card card-pad">
          {r.status === 'Approved' ? (
            <div className="notice"><span className="dot"/><div><b>Branch created</b><p>{r.branch} is live under {r.company}. {r.requester.nm.split(' ')[0]} was notified.</p></div></div>
          ) : (
            <div className="notice error"><span className="dot"/><div><b>Declined</b><p>{r.requester.nm.split(' ')[0]} was notified. Nothing was created.</p></div></div>
          )}
        </div>
      )}

      {reasonModal}

      <style>{`
        .brq-q { padding: 14px 0; border-top: 1px solid var(--border); }
        .brq-q:first-child { border-top: 0; padding-top: 0; }
        .brq-l { font-size: 10.5px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--fg-4); margin-bottom: 8px; }
        .brq-note { font-size: 11.5px; color: var(--fg-3); margin-top: 8px; line-height: 1.5; max-width: 60ch; }
        .brq-owner { padding: 14px 0; border-top: 1px solid var(--border); }
        .tri-opt[disabled] { opacity: .4; }
        .brq-inherit { display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px; background: var(--bg-soft); border-radius: var(--r-md); font-size: 13px; font-weight: 500; color: var(--fg-2); }
        .brq-inherit svg { color: var(--success-fg); }
        .brq-link { background: transparent; border: 0; padding: 0; font: inherit; color: var(--fg-2); text-decoration: underline; cursor: default; }
        .brq-link:hover { color: var(--fg); }
      `}</style>
    </div>
  );
}

// Tenant side: an owner asks for a branch or a franchise.
function RequestBranch({ goto }) {
  const toast = useToast();
  const [f, setF] = useState({ branch: '', city: '', code: '', ownership: 'company', ownerNm: '', ownerEmail: '', reason: '' });
  const TYPES = [
    { id: 'company', nm: 'Company-owned', sub: 'A location you operate',
      pts: ['Posts to the group ledger', 'Rolls into the group P&L', 'Managed by your staff', 'No separate invoice'] },
    { id: 'franchise', nm: 'Franchised', sub: 'A separate business under your brand',
      pts: ['Keeps its own books and P&L', 'Has its own owner with their own sign-in', 'Can be invoiced directly by Neovatus', 'Can hold its own agreement'] },
  ];
  const [err, setErr] = useState('');
  const set = (k, v) => setF(x => ({ ...x, [k]: v }));
  const fr = f.ownership === 'franchise';

  const submit = (e) => {
    e.preventDefault();
    if (!f.branch.trim()) { setErr('Give the branch a name.'); return; }
    if (fr && !f.ownerEmail.includes('@')) { setErr('A franchised branch needs an owner — that is what makes it a franchise.'); return; }
    if (f.reason.trim().length < 10) { setErr('One line on why helps Neovatus set module access correctly the first time.'); return; }
    setErr('');
    toast && toast({ title: 'Branch request sent', sub: 'Neovatus sets module access and billing, then creates it.' });
    goto('firstrun');
  };

  return (
    <>
      <PageHead title="Request a branch" crumbs={['Lahore Textiles', <span className="here" key="h">Request a branch</span>]}/>
      <div style={{ maxWidth: 640 }}>
        {err && <div className="notice error" style={{ marginBottom: 16 }}><span className="dot"/><div><b>Almost there</b><p>{err}</p></div></div>}

        <div className="notice" style={{ marginBottom: 18 }}>
          <span className="dot"/>
          <div>
            <b>Why this isn't a button you press yourself</b>
            <p>A branch carries module access and a billing arrangement, and a franchised one is a separate business. Neovatus sets those, so branches are created on request — usually the same day.</p>
          </div>
        </div>

        <form className="card card-pad-lg" onSubmit={submit}>
          <div className="rgrid rgrid-2">
            <Field label="Branch name"><input className="input" placeholder="Multan" value={f.branch} onChange={e => set('branch', e.target.value)}/></Field>
            <Field label="City"><input className="input" placeholder="Multan" value={f.city} onChange={e => set('city', e.target.value)}/></Field>
            <Field label="Code" hint="Prefixes documents raised at this branch.">
              <input className="input" placeholder="MUL" value={f.code} onChange={e => set('code', e.target.value.toUpperCase().slice(0, 5))}/>
            </Field>
          </div>

          <div className="ent-sub-hd" style={{ marginTop: 22 }}>
            Type
            <span className="ent-sub-note">This decides where the money lands. It is hard to change once the branch is trading.</span>
          </div>
          <div className="type-grid">
            {TYPES.map(t => (
              <button type="button" key={t.id} className={`type-card${f.ownership === t.id ? ' on' : ''}`}
                onClick={() => set('ownership', t.id)}>
                <div className="type-hd">
                  <div>
                    <div className="type-nm">{t.nm}</div>
                    <div className="type-sub">{t.sub}</div>
                  </div>
                  <span className="radio-dot"/>
                </div>
                <ul className="type-pts">
                  {t.pts.map(p => <li key={p}><Icon name="check" size={12}/>{p}</li>)}
                </ul>
              </button>
            ))}
          </div>

          {fr && (
            <>
              <div className="ent-sub-hd" style={{ marginTop: 22 }}>
                Franchise owner
                <span className="ent-sub-note">They get their own sign-in and their own books.</span>
              </div>
              <div className="rgrid rgrid-2">
                <Field label="Full name"><input className="input" placeholder="Farhan Iqbal" value={f.ownerNm} onChange={e => set('ownerNm', e.target.value)}/></Field>
                <Field label="Email"><input className="input" placeholder="farhan@gujranwalatex.pk" value={f.ownerEmail} onChange={e => set('ownerEmail', e.target.value)}/></Field>
              </div>
            </>
          )}

          <div style={{ marginTop: 22 }}>
            <Field label="Anything Neovatus should know?" hint="Which modules it needs, whether the franchisee is billed directly, when it opens.">
              <textarea className="input" placeholder="Franchise agreement signed. He runs his own payroll and wants his own invoice." value={f.reason} onChange={e => set('reason', e.target.value)}/>
            </Field>
          </div>

          <div className="wiz-foot">
            <button type="button" className="btn btn-ghost" onClick={() => goto('firstrun')}>Cancel</button>
            <div className="spacer"/>
            <button type="submit" className="btn btn-primary"><Icon name="mail" size={15}/> Send request</button>
          </div>
        </form>
      </div>
      <style>{`
        .type-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
        .type-card { text-align: left; padding: 14px 16px; border: 1px solid var(--border); border-radius: var(--r-md); background: var(--bg); cursor: default; }
        .type-card:hover { border-color: var(--border-strong); }
        .type-card.on { border-color: var(--fg); box-shadow: 0 0 0 1px var(--fg) inset; }
        .type-hd { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
        .type-nm { font-size: 14px; font-weight: 600; letter-spacing: -.01em; }
        .type-sub { font-size: 12px; color: var(--fg-3); margin-top: 2px; }
        .type-card.on .radio-dot { border-color: var(--fg); }
        .type-card.on .radio-dot::after { content: ''; position: absolute; inset: 2px; border-radius: 999px; background: var(--fg); }
        .type-pts { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
        .type-pts li { display: flex; align-items: flex-start; gap: 8px; font-size: 12px; color: var(--fg-2); line-height: 1.45; }
        .type-pts svg { color: var(--fg-4); flex-shrink: 0; margin-top: 2px; }
        .type-card.on .type-pts svg { color: var(--success-fg); }
        @media (max-width: 720px) { .type-grid { grid-template-columns: 1fr; } }
      `}</style>
    </>
  );
}

Object.assign(window, { BranchRequestDetail, RequestBranch });
