// NeoERP — Company enrollment. Four steps, all of them things the service
// provider actually knows: identity, agreement, owner, send.
// Branches, warehouses and staff are the tenant's own first-run work.

const COUNTRIES = {
  PK: { nm: 'Pakistan', cur: 'PKR', fy: 'July – June', taxId: 'NTN', regLabel: 'STRN',
        pack: 'FBR (IRIS) filing · EOBI & PESSI deductions', locale: 'en-PK' },
  NO: { nm: 'Norway', cur: 'NOK', fy: 'January – December', taxId: 'Organisasjonsnummer', regLabel: 'MVA number',
        pack: 'Altinn · A-melding reporting', locale: 'nb-NO' },
  SE: { nm: 'Sweden', cur: 'SEK', fy: 'January – December', taxId: 'Organisationsnummer', regLabel: 'VAT number',
        pack: 'Skatteverket reporting', locale: 'sv-SE' },
  DK: { nm: 'Denmark', cur: 'DKK', fy: 'January – December', taxId: 'CVR number', regLabel: 'VAT number',
        pack: 'Statutory pack pending — payroll filing unavailable', locale: 'da-DK', warn: true },
};

// No plan tiers — every tenant has its own agreement, built module-by-module
// and limit-by-limit right here. This is just a sane starting point for a new,
// company-owned agreement; it is never shown to or named for the customer.
const DEFAULT_MODULES = ['finance', 'sales', 'inventory', 'hrms', 'payroll'];
const DEFAULT_LIMITS = { users: 50, branches: 10, warehouses: 20 };

const MOD_DESC = {
  finance: 'Ledger, receivables, payables, tax and reporting.',
  hrms: 'Employees, contracts, leave, attendance and documents.',
  payroll: 'Salary structures, runs, payslips and statutory deductions.',
  inventory: 'Stock by warehouse, batches, serials and transfers.',
  sales: 'Quotes, orders, invoicing, point of sale and customers.',
  mfg: 'Bills of material, work orders and quality control.',
};

function EnrollCompany({ goto, prefill }) {
  const toast = useToast();
  const pf = prefill || null;
  const known = pf && pf.requester && pf.requester.personId
    ? PEOPLE.find(p => p.id === pf.requester.personId) : null;
  const [step, setStep] = useState(1);
  const [d, setD] = useState({
    legal: '', display: '', code: '', country: 'PK',
    companyType: 'OWNED', parentCompanyId: '',
    taxMode: 'TAXABLE', taxId: '', registration: '',
    address: '', city: '', state: '', postal: '', email: '', phone: '',
    ref: 'AGR-2026-052', term: '12 months',
    startDate: '2026-10-01', endDate: '2027-09-30', renewal: 'manual',
    mods: DEFAULT_MODULES.slice(),
    limits: { ...DEFAULT_LIMITS },
    owner: { name: '', email: '' }, expiry: '14 days',
    ...(pf ? {
      legal: pf.company, display: pf.company, country: pf.country,
      mods: pf.wants && pf.wants.length ? pf.wants.slice() : DEFAULT_MODULES.slice(),
      owner: { name: pf.requester.nm, email: pf.requester.email },
    } : {}),
  });
  // 'own' — this company holds its own agreement. 'inherit' — RULES §8's first
  // arrangement: a franchise trading under its franchisor's contract. Only
  // reachable when companyType is FRANCHISE; irrelevant (and reset) otherwise.
  const [agreementSource, setAgreementSource] = useState('own');
  const [err, setErr] = useState('');
  const set = (k, v) => setD(x => ({ ...x, [k]: v }));
  const c = COUNTRIES[d.country];

  const isFranchise = d.companyType === 'FRANCHISE';
  const inherits = isFranchise && agreementSource === 'inherit';
  const franchisor = isFranchise ? COMPANIES.find(co => co.id === d.parentCompanyId) : null;
  const franchisorName = franchisor ? franchisor.name : '';

  const setCompanyType = (v) => {
    setD(x => ({ ...x, companyType: v, parentCompanyId: v === 'FRANCHISE' ? x.parentCompanyId : '' }));
    if (v !== 'FRANCHISE') setAgreementSource('own');
  };

  // A typed email that matches an existing person is the same fact a prefilled
  // request already knows: someone re-inviting an existing identity creates a
  // duplicate account. ignoreMatch is the escape hatch — "not them, let me type
  // a different address" — and clears itself the moment the address changes.
  const [ignoreMatch, setIgnoreMatch] = useState(false);
  const typedMatch = !known && !ignoreMatch && d.owner.email.trim()
    ? PEOPLE.find(p => p.email.toLowerCase() === d.owner.email.trim().toLowerCase())
    : null;
  const owner = known || typedMatch || null;
  const setOwnerEmail = (v) => { set('owner', { ...d.owner, email: v }); setIgnoreMatch(false); };

  const steps = ['Company & region', 'Agreement', owner ? 'Owner' : 'Owner invitation', 'Review & send'];

  const validate = () => {
    if (step === 1) {
      if (!d.legal.trim()) return 'Legal name is required — it appears on invoices and statutory filings.';
      if (!d.code.trim()) return 'Company code is required. It prefixes every document number.';
      if (isFranchise && !d.parentCompanyId) return 'Choose the franchisor this company operates under.';
    }
    if (step === 2) {
      if (inherits) return '';
      if (!d.ref.trim()) return 'An agreement reference is required — every entitlement change is traced back to it.';
      if (d.mods.length === 0) return 'An agreement with no modules gives the tenant nothing to sign in to.';
      if (new Date(d.endDate) <= new Date(d.startDate)) return 'The agreement must end after it starts.';
      const zeroed = ['users', 'branches', 'warehouses'].find(k => d.limits[k] !== null && d.limits[k] < 1);
      if (zeroed) return 'A limit is either a positive number or Unlimited — never zero.';
    }
    if (step === 3) {
      if (owner) return '';
      if (!d.owner.name.trim()) return "The owner's full name is required.";
      if (!d.owner.email.includes('@')) return 'Enter a valid email — the invitation goes here and nowhere else.';
    }
    return '';
  };

  const next = () => {
    const e = validate();
    if (e) { setErr(e); return; }
    setErr(''); setStep(s => Math.min(4, s + 1)); window.scrollTo(0, 0);
  };
  const back = () => { setErr(''); setStep(s => Math.max(1, s - 1)); };

  const finish = () => {
    toast && toast({
      title: `${d.display || d.legal} enrolled`,
      sub: owner
        ? `Added to ${owner.nm}'s memberships. No invitation sent.`
        : `Invitation sent to ${d.owner.email}. Expires in ${d.expiry}.`,
    });
    goto('companies');
  };

  const limitLabel = (n) => (n === null || n === undefined) ? 'Unlimited' : n;

  return (
    <>
      <PageHead title="Enroll company" crumbs={['Platform Admin', 'Companies', <span className="here" key="h">Enroll</span>]}/>

      {pf && (
        <div className="notice" style={{ marginBottom: 18 }}>
          <span className="dot"/>
          <div>
            <b>Pre-filled from {pf.requester.nm}'s request</b>
            <p>
              They told you the company, country and which modules they want. The agreement's term and limits are still yours to set —
              that's the part a request can't decide.{pf.parent ? ` This one sits under ${pf.parent}.` : ''}
            </p>
          </div>
        </div>
      )}
      <div className="notice" style={{ marginBottom: 18 }}>
        <span className="dot"/>
        <div>
          <b>You provision the agreement — the tenant does its own setup</b>
          <p>These four steps cover what the service provider knows: who they are, what they've bought, and who runs it. Branches, warehouses and staff are created by the owner inside the limits you set here.</p>
        </div>
      </div>

      <div className="stepper">
        {steps.map((s, i) => {
          const n = i + 1;
          return (
            <div key={s} className={`step ${n === step ? 'active' : n < step ? 'done' : ''}`}
              onClick={() => n < step && setStep(n)}>
              <span className="num">{n < step ? '✓' : n}</span>
              <span>{s}</span>
            </div>
          );
        })}
      </div>
      <div className="stepper-mobile">
        <span className="label">{steps[step - 1]}</span>
        <span className="count">Step {step} of 4</span>
      </div>

      {err && (
        <div className="notice error" style={{ marginBottom: 16 }}>
          <span className="dot"/><div><b>Can't continue</b><p>{err}</p></div>
        </div>
      )}

      <div className="card card-pad-lg">
        {/* ── 1. Company & region ── */}
        {step === 1 && (
          <>
            <div className="card-title">Company &amp; region</div>
            <div className="card-sub" style={{ marginBottom: 20 }}>
              Country isn't just an address field — it sets currency, fiscal year and which statutory pack the tenant runs on. Changing it after go-live means reposting the ledger.
            </div>
            <div className="rgrid rgrid-2">
              <Field label="Legal name" hint="As registered. Appears on invoices and filings.">
                <input className="input" placeholder="Lahore Textiles (Pvt) Ltd" value={d.legal} onChange={e => set('legal', e.target.value)}/>
              </Field>
              <Field label="Display name" hint="What users see in the product.">
                <input className="input" placeholder="Lahore Textiles" value={d.display} onChange={e => set('display', e.target.value)}/>
              </Field>
              <Field label="Company code" hint="Prefixes document numbers. Cannot change later.">
                <input className="input" placeholder="LHT" value={d.code} onChange={e => set('code', e.target.value.toUpperCase().slice(0, 6))}/>
              </Field>
              <Field label="Country">
                <select className="input" value={d.country} onChange={e => set('country', e.target.value)}>
                  {Object.entries(COUNTRIES).map(([k, v]) => <option key={k} value={k}>{v.nm}</option>)}
                </select>
              </Field>
              <Field label="Company type" hint="A franchise is its own tenant under a franchisor — never a branch.">
                <select className="input" value={d.companyType} onChange={e => setCompanyType(e.target.value)}>
                  <option value="OWNED">Company-owned</option>
                  <option value="FRANCHISE">Franchise</option>
                </select>
              </Field>
              {isFranchise && (
                <Field label="Franchisor" hint="The company this franchise operates under.">
                  <select className="input" value={d.parentCompanyId} onChange={e => set('parentCompanyId', e.target.value)}>
                    <option value="">Choose a company…</option>
                    {COMPANIES.map(co => <option key={co.id} value={co.id}>{co.name}</option>)}
                  </select>
                </Field>
              )}
            </div>

            {isFranchise && (
              <div className="notice" style={{ marginTop: 4, marginBottom: 4 }}>
                <span className="dot"/>
                <div>
                  <b>A franchise is its own company, not a branch</b>
                  <p>It gets its own row here, its own books, and can hold its own agreement or trade under {franchisorName || "the franchisor's"} — RULES §8. That's different from a franchised <i>branch</i>, which stays inside its parent company and is requested from the Branches screen instead.</p>
                </div>
              </div>
            )}

            <div className={`derived${c.warn ? ' warn' : ''}`}>
              <div className="derived-hd">
                <Icon name={c.warn ? 'x' : 'checkCircle'} size={15}/>
                Set automatically from {c.nm}
              </div>
              <div className="derived-grid">
                <div><span>Currency</span><b>{c.cur}</b></div>
                <div><span>Fiscal year</span><b>{c.fy}</b></div>
                <div><span>Locale</span><b>{c.locale}</b></div>
                <div className="wide"><span>Statutory pack</span><b>{c.pack}</b></div>
              </div>
            </div>

            <div className="rgrid rgrid-2" style={{ marginTop: 20 }}>
              <Field label={c.taxId}><input className="input" value={d.taxId} onChange={e => set('taxId', e.target.value)}/></Field>
              <Field label="Tax mode">
                <select className="input" value={d.taxMode} onChange={e => set('taxMode', e.target.value)}>
                  <option value="TAXABLE">Taxable</option>
                  <option value="EXEMPT">Exempt</option>
                </select>
              </Field>
              <Field label={c.regLabel}><input className="input" value={d.registration} onChange={e => set('registration', e.target.value)}/></Field>
              <Field label="Registered address"><input className="input" value={d.address} onChange={e => set('address', e.target.value)}/></Field>
              <Field label="City"><input className="input" value={d.city} onChange={e => set('city', e.target.value)}/></Field>
              <Field label="State / Province"><input className="input" value={d.state} onChange={e => set('state', e.target.value)}/></Field>
              <Field label="Postal code"><input className="input" value={d.postal} onChange={e => set('postal', e.target.value)}/></Field>
              <Field label="Company email" hint="Billing and system notices. Not a sign-in.">
                <input className="input" placeholder="accounts@lahoretextiles.pk" value={d.email} onChange={e => set('email', e.target.value)}/>
              </Field>
              <Field label="Company phone">
                <input className="input" value={d.phone} onChange={e => set('phone', e.target.value)}/>
              </Field>
            </div>
          </>
        )}

        {/* ── 2. Agreement ── */}
        {step === 2 && (
          <>
            <div className="card-title">Agreement</div>
            <div className="card-sub" style={{ marginBottom: 20 }}>
              {isFranchise
                ? "A franchise can hold its own contract, or trade under its franchisor's — RULES §8's first arrangement. Either way, this is separate from the ownership, books and billing flags set per-branch."
                : "What they've contracted for. Everything here is a ceiling the tenant works inside — they create branches and invite staff themselves, and hitting a limit raises a request in your queue."}
            </div>

            {isFranchise && (
              <>
                <div className="ent-sub-hd" style={{ marginTop: 4 }}>How is this franchise contracted?</div>
                <div className="src-grid">
                  <button type="button" className={`src-choice${agreementSource === 'own' ? ' on' : ''}`} onClick={() => setAgreementSource('own')}>
                    <div className="src-choice-nm">Its own agreement</div>
                    <div className="src-choice-note">A separate contract, its own limits and modules, billed on its own terms.</div>
                  </button>
                  <button type="button" className={`src-choice${agreementSource === 'inherit' ? ' on' : ''}`} onClick={() => setAgreementSource('inherit')}>
                    <div className="src-choice-nm">Trades under the franchisor's</div>
                    <div className="src-choice-note">No contract is created here. Entitlements and limits resolve to the franchisor's agreement.</div>
                  </button>
                </div>
              </>
            )}

            {inherits ? (
              <div className="notice" style={{ marginTop: isFranchise ? 20 : 4 }}>
                <span className="dot"/>
                <div>
                  <b>No agreement is created for this company</b>
                  <p>{franchisorName || 'The franchisor'}'s agreement already covers it. This company's modules, users, branches and warehouses all resolve against that agreement — an addendum can be added from {franchisorName ? `${franchisorName}'s` : "its"} agreement page later, if this franchise needs something the group doesn't have.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="rgrid rgrid-2" style={{ maxWidth: 720, marginTop: isFranchise ? 20 : 0, marginBottom: 24 }}>
                  <Field label="Agreement reference" hint="Every entitlement change is recorded against this.">
                    <input className="input" style={{ fontFamily: 'var(--font-mono)' }} value={d.ref} onChange={e => set('ref', e.target.value.toUpperCase())}/>
                  </Field>
                  <Field label="Term">
                    <select className="input" value={d.term} onChange={e => set('term', e.target.value)}>
                      <option>Monthly rolling</option><option>12 months</option><option>24 months</option><option>60-day pilot</option>
                    </select>
                  </Field>
                  <Field label="Starts on"><input className="input" type="date" value={d.startDate} onChange={e => set('startDate', e.target.value)}/></Field>
                  <Field label="Ends on" hint="Renewal reminders begin 90 days out.">
                    <input className="input" type="date" value={d.endDate} onChange={e => set('endDate', e.target.value)}/>
                  </Field>
                  <Field label="Renewal">
                    <select className="input" value={d.renewal} onChange={e => set('renewal', e.target.value)}>
                      <option value="manual">Manual — needs a decision</option>
                      <option value="auto">Automatic — rolls over</option>
                    </select>
                  </Field>
                </div>

                <div className="ent-sub-hd" style={{ marginTop: 24 }}>
                  Modules in this agreement
                  <span className="ent-sub-note">This is the ceiling. Branches can switch these off, never on.</span>
                </div>
                {ENT_MODULES.length === 0 ? (
                  // The live screen fetches this catalog; show a skeleton while it
                  // loads and a retry here on failure. An agreement can't be built
                  // with nothing to grant, so we never silently render an empty grid.
                  <div className="notice error" style={{ marginBottom: 12 }}>
                    <span className="dot"/>
                    <div><b>Module catalog unavailable</b><p>It didn't load. Refresh the page, or contact engineering if this persists.</p></div>
                  </div>
                ) : (
                  <>
                    <div className="mcount" style={{ marginBottom: 12 }}>
                      <b>{d.mods.length}</b> of {ENT_MODULES.length} included
                      <span className="spacer"/>
                      <button className="btn btn-ghost btn-sm" onClick={() => set('mods', ENT_MODULES.map(m => m.id))}>Select all</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => set('mods', [])}>Clear</button>
                    </div>
                    <div className="mgrid">
                      {ENT_MODULES.map(m => {
                        const on = d.mods.includes(m.id);
                        return (
                          <button type="button" key={m.id} className={`mcard${on ? ' on' : ''}`}
                            onClick={() => set('mods', on ? d.mods.filter(x => x !== m.id) : [...d.mods, m.id])}>
                            <div className="mcard-ico"><Icon name={m.icon} size={18}/></div>
                            <div className="mcard-body">
                              <div className="mcard-nm">{m.nm}</div>
                              <div className="mcard-desc">{MOD_DESC[m.id]}</div>
                              <div className="mcard-feat">{m.features.length} features · {m.features.filter(f => f.tag).map(f => f.tag).filter((v, i, s) => s.indexOf(v) === i).join(' · ') || 'no add-ons'}</div>
                            </div>
                            <span className="mcard-sw"><Switch checked={on} onChange={() => set('mods', on ? d.mods.filter(x => x !== m.id) : [...d.mods, m.id])}/></span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                <div className="ent-sub-hd" style={{ marginTop: 24 }}>
                  Limits
                  <span className="ent-sub-note">Hard ceilings — the tenant is blocked at the line and raises a request, never billed for an overage.</span>
                </div>
                <div style={{ maxWidth: 660 }}>
                  {[
                    ['users', 'Users', 'Everyone with a sign-in, across every branch.'],
                    ['branches', 'Branches', 'Locations and franchises. Each one is requested, then created by you.'],
                    ['warehouses', 'Warehouses / stores', 'Physical stock locations inside those branches.'],
                  ].map(([k, label, note]) => {
                    const unl = d.limits[k] === null;
                    return (
                      <div key={k} className="lrow">
                        <div>
                          <div className="lrow-nm">{label}</div>
                          <div className="lrow-note">{note}</div>
                        </div>
                        <div className="lrow-ctl">
                          <input className="input" type="number" min="1" disabled={unl}
                            value={unl ? '' : d.limits[k]} placeholder="∞"
                            onChange={ev => set('limits', { ...d.limits, [k]: Math.max(1, parseInt(ev.target.value || '1', 10)) })}/>
                          <label className="lrow-unl">
                            <Checkbox checked={unl} onChange={() => set('limits', { ...d.limits, [k]: unl ? 10 : null })} label="Unlimited"/>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* ── 3. Owner invitation ── */}
        {step === 3 && owner && (
          <>
            <div className="card-title">Owner</div>
            <div className="card-sub" style={{ marginBottom: 20 }}>
              {owner.nm} already has an account. Nothing is sent — this company is added to their memberships, and they reach it from the company switcher with the sign-in they already use.
            </div>
            <div className="known-owner">
              <div className="avatar" style={{ width: 44, height: 44, fontSize: 15 }}>{owner.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="known-nm">{owner.nm}</div>
                <div className="known-mail">{owner.email}</div>
              </div>
              <Pill tone="success">Existing account</Pill>
            </div>
            <div className="ent-sub-hd" style={{ marginTop: 24 }}>Memberships after this change</div>
            <div className="known-mems">
              {owner.memberships.map((m, i) => (
                <div key={i} className="known-mem">
                  <Icon name={m.scope === 'platform' ? 'shield' : m.scope === 'company' ? 'building' : 'map'} size={14}/>
                  <span className="known-mem-nm">{m.target}</span>
                  <span className="known-mem-role">{m.role}</span>
                </div>
              ))}
              <div className="known-mem added">
                <Icon name="building" size={14}/>
                <span className="known-mem-nm">{d.display || d.legal || 'New company'}</span>
                <span className="known-mem-role">Company Owner</span>
                <span className="known-new">New</span>
              </div>
            </div>
            <div className="notice" style={{ marginTop: 18 }}>
              <span className="dot"/>
              <div>
                <b>No second login, no second password</b>
                <p>Re-inviting someone who already has an identity creates a duplicate account, and duplicates are how audit trails stop making sense. Membership is the unit — so we add one.</p>
              </div>
            </div>
            {!known && (
              <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 14 }} onClick={() => setIgnoreMatch(true)}>
                Not {owner.nm.split(' ')[0]}? Use a different email
              </button>
            )}
          </>
        )}

        {step === 3 && !owner && (
          <>
            <div className="card-title">Owner invitation</div>
            <div className="card-sub" style={{ marginBottom: 20 }}>
              One person, and their role is fixed: <b>Company Owner</b>. Someone has to be able to invite everyone else, and that authority can't come from you — you're the service provider, not a member of their organisation.
            </div>

            <div className="rgrid rgrid-2" style={{ maxWidth: 720 }}>
              <Field label="Full name"><input className="input" placeholder="Bilal Ahmed" value={d.owner.name} onChange={e => set('owner', { ...d.owner, name: e.target.value })}/></Field>
              <Field label="Email" hint="The invitation goes here. This becomes their sign-in. If it matches an existing account, we add a membership instead.">
                <input className="input" placeholder="bilal@lahoretextiles.pk" value={d.owner.email} onChange={e => setOwnerEmail(e.target.value)}/>
              </Field>
              <Field label="Invitation expires in">
                <select className="input" value={d.expiry} onChange={e => set('expiry', e.target.value)}>
                  <option>7 days</option><option>14 days</option><option>30 days</option>
                </select>
              </Field>
            </div>

            <div className="ent-sub-hd" style={{ marginTop: 26 }}>What they receive</div>
            <div className="mail-preview">
              <div className="mail-hd">
                <div className="mail-from">NeoERP &lt;no-reply@neoerp.com&gt;</div>
                <div className="mail-to">to {d.owner.email || 'owner@company.com'}</div>
              </div>
              <div className="mail-body">
                <div className="mail-subj">You've been given access to {d.display || d.legal || 'your company'} on NeoERP</div>
                <p>{d.owner.name || 'Your name'} — your NeoERP workspace for <b>{d.display || d.legal || 'your company'}</b> is ready. You'll be asked to set a password and turn on two-factor authentication, then you can add your branches and invite your team.</p>
                <div className="mail-btn">Set your password</div>
                <p className="mail-fine">This link expires in {d.expiry}. It works once.</p>
              </div>
            </div>

            <div className="notice" style={{ marginTop: 18 }}>
              <span className="dot"/>
              <div>
                <b>No password is ever set for them</b>
                <p>The invitation triggers a Keycloak <span className="mono-inline">UPDATE_PASSWORD</span> action the owner completes themselves. Nobody at Neovatus — including you — can set or see it. On a system that runs payroll, that distinction is what keeps an audit trail meaningful.</p>
              </div>
            </div>
          </>
        )}

        {/* ── 4. Review ── */}
        {step === 4 && (
          <>
            <div className="card-title">Review &amp; send</div>
            <div className="card-sub" style={{ marginBottom: 20 }}>Nothing is created until you send. The invitation goes out immediately.</div>

            <div className="rev">
              <div className="rev-sec">
                <div className="rev-hd">Company <button className="rev-edit" onClick={() => setStep(1)}>Edit</button></div>
                <dl className="kv">
                  <dt>Legal name</dt><dd>{d.legal || '—'}</dd>
                  <dt>Display name</dt><dd>{d.display || d.legal || '—'}</dd>
                  <dt>Code</dt><dd style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5 }}>{d.code || '—'}</dd>
                  <dt>Type</dt><dd>{isFranchise ? `Franchise · under ${franchisorName || '—'}` : 'Company-owned'}</dd>
                  <dt>Region</dt><dd>{c.nm} · {c.cur} · FY {c.fy}</dd>
                  <dt>Statutory</dt><dd>{c.pack}</dd>
                  <dt>{c.taxId}</dt><dd>{d.taxId || '—'}</dd>
                  <dt>Tax mode</dt><dd>{d.taxMode === 'EXEMPT' ? 'Exempt' : 'Taxable'}</dd>
                  <dt>{c.regLabel}</dt><dd>{d.registration || '—'}</dd>
                </dl>
              </div>

              <div className="rev-sec">
                <div className="rev-hd">Agreement <button className="rev-edit" onClick={() => setStep(2)}>Edit</button></div>
                {inherits ? (
                  <dl className="kv">
                    <dt>Contract</dt><dd>Trades under {franchisorName || 'the franchisor'}'s agreement</dd>
                    <dt>Modules and limits</dt><dd>Resolve to {franchisorName ? `${franchisorName}'s` : "the franchisor's"} agreement</dd>
                  </dl>
                ) : (
                  <dl className="kv">
                    <dt>Reference</dt><dd style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5 }}>{d.ref}</dd>
                    <dt>Term</dt><dd>{d.term} · {d.startDate} → {d.endDate} · {d.renewal === 'auto' ? 'auto-renews' : 'manual renewal'}</dd>
                    <dt>Modules</dt><dd>{d.mods.map(id => (ENT_MODULES.find(m => m.id === id) || {}).nm).join(', ') || '—'}</dd>
                    <dt>Limits</dt><dd>{limitLabel(d.limits.users)} users · {limitLabel(d.limits.branches)} branches · {limitLabel(d.limits.warehouses)} warehouses</dd>
                  </dl>
                )}
              </div>

              <div className="rev-sec">
                <div className="rev-hd">Owner <button className="rev-edit" onClick={() => setStep(3)}>Edit</button></div>
                <dl className="kv">
                  <dt>Name</dt><dd>{d.owner.name || '—'}</dd>
                  <dt>Email</dt><dd>{d.owner.email || '—'}</dd>
                  <dt>Role</dt><dd>Company Owner <span className="rev-fixed">fixed</span></dd>
                  <dt>Invitation</dt>
                  <dd>{owner ? <>None needed — membership added to their existing account</> : <>Expires in {d.expiry}</>}</dd>
                </dl>
              </div>
            </div>

            <div className="ent-sub-hd" style={{ marginTop: 26 }}>What happens next</div>
            <ol className="next-steps">
              {owner ? (
                <>
                  <li><b>The company appears in {owner.nm.split(' ')[0]}'s switcher</b> immediately. No email, no new password.</li>
                  <li><b>They land on the first-run checklist</b> for the new company — their existing one is untouched.</li>
                </>
              ) : (
                <>
                  <li><b>The invitation is sent</b> to {d.owner.email || 'the owner'}. It appears in your queue if unaccepted after 7 days.</li>
                  <li><b>The owner sets a password and enrols two-factor</b>, then lands on their first-run checklist.</li>
                </>
              )}
              {inherits
                ? <li><b>They create branches and invite staff</b> inside {franchisorName || "the franchisor's"} limits. Requests above those come to you.</li>
                : <li><b>They create branches and invite staff</b> — up to {limitLabel(d.limits.branches)} branches and {limitLabel(d.limits.users)} users. Requests above that come to you.</li>}
            </ol>
          </>
        )}

        <div className="wiz-foot">
          <button className="btn btn-ghost" onClick={() => goto('companies')}>Cancel</button>
          <div className="spacer"/>
          {step > 1 && <button className="btn btn-secondary" onClick={back}><Icon name="arrowL" size={14}/> Back</button>}
          {step < 4
            ? <button className="btn btn-primary" onClick={next}>Continue <Icon name="arrowR" size={14}/></button>
            : <button className="btn btn-primary" onClick={finish}>
                <Icon name={owner ? 'check' : 'mail'} size={14}/> {owner ? 'Enroll & add membership' : 'Enroll & send invitation'}
              </button>}
        </div>
      </div>

      <style>{`
        .derived { margin-top: 20px; padding: 14px 16px; background: var(--bg-soft); border-radius: var(--r-md); }
        .derived.warn { background: var(--warn-bg); }
        .derived-hd { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: var(--fg-2); margin-bottom: 12px; }
        .derived.warn .derived-hd { color: var(--warn-fg); }
        .derived-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px 20px; }
        .derived-grid .wide { grid-column: 1 / -1; }
        .derived-grid span { display: block; font-size: 11px; color: var(--fg-3); margin-bottom: 2px; }
        .derived-grid b { font-size: 13px; font-weight: 600; }

        .src-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; max-width: 720px; margin-bottom: 8px; }
        .src-choice { text-align: left; padding: 14px 16px; border: 1px solid var(--border); border-radius: var(--r-md); background: var(--bg); cursor: default; }
        .src-choice:hover { border-color: var(--border-strong); }
        .src-choice.on { border-color: var(--fg); box-shadow: 0 0 0 1px var(--fg) inset; }
        .src-choice-nm { font-size: 13.5px; font-weight: 600; margin-bottom: 4px; }
        .src-choice-note { font-size: 12px; color: var(--fg-3); line-height: 1.5; }

        .mail-preview { border: 1px solid var(--border); border-radius: var(--r-md); overflow: hidden; max-width: 560px; }
        .mail-hd { padding: 10px 14px; background: var(--bg-soft); border-bottom: 1px solid var(--border); }
        .mail-from { font-size: 12px; font-weight: 600; }
        .mail-to { font-size: 11.5px; color: var(--fg-3); margin-top: 1px; }
        .mail-body { padding: 16px 18px; }
        .mail-subj { font-size: 14px; font-weight: 600; letter-spacing: -.01em; margin-bottom: 10px; }
        .mail-body p { font-size: 13px; color: var(--fg-2); line-height: 1.6; margin: 0 0 14px; }
        .mail-btn { display: inline-block; background: var(--accent); color: var(--accent-fg); font-size: 13px; font-weight: 500; padding: 10px 18px; border-radius: var(--r-md); }
        .mail-fine { font-size: 11.5px !important; color: var(--fg-3) !important; margin: 14px 0 0 !important; }
        .mono-inline { font-family: var(--font-mono); font-size: 11.5px; background: var(--bg-elev); padding: 1px 5px; border-radius: 4px; }

        .rev { display: flex; flex-direction: column; gap: 4px; }
        .rev-sec { padding: 16px 0; border-top: 1px solid var(--border); }
        .rev-sec:first-child { border-top: 0; padding-top: 0; }
        .rev-hd { display: flex; align-items: center; justify-content: space-between; font-size: 10.5px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--fg-4); margin-bottom: 12px; }
        .rev-edit { background: transparent; border: 0; padding: 0; font-size: 11.5px; font-weight: 500; letter-spacing: 0; text-transform: none; color: var(--fg-2); cursor: default; }
        .rev-edit:hover { color: var(--fg); text-decoration: underline; }
        .rev-fixed { font-size: 10px; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; background: var(--bg-soft); color: var(--fg-3); padding: 2px 6px; border-radius: 4px; margin-left: 8px; }

        .next-steps { counter-reset: n; list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
        .next-steps li { counter-increment: n; display: flex; gap: 12px; font-size: 13px; color: var(--fg-2); line-height: 1.55; }
        .next-steps li::before { content: counter(n); flex-shrink: 0; width: 20px; height: 20px; border-radius: 999px; background: var(--bg-soft); color: var(--fg-3); font-size: 11px; font-weight: 600; display: grid; place-items: center; margin-top: 1px; }

        .known-owner { display: flex; align-items: center; gap: 14px; padding: 14px 16px; background: var(--bg-soft); border-radius: var(--r-md); }
        .known-nm { font-size: 14px; font-weight: 600; }
        .known-mail { font-size: 12.5px; color: var(--fg-3); margin-top: 2px; }
        .known-mems { display: flex; flex-direction: column; }
        .known-mem { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-top: 1px solid var(--border); font-size: 13px; color: var(--fg-2); }
        .known-mem:first-child { border-top: 0; }
        .known-mem-nm { font-weight: 500; }
        .known-mem-role { margin-left: auto; font-size: 11.5px; color: var(--fg-3); }
        .known-mem.added { color: var(--fg); }
        .known-new { font-size: 10px; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; background: var(--success-bg); color: var(--success-fg); padding: 2px 6px; border-radius: 4px; }

        .stepper-mobile { display: none; }
        @media (max-width: 1024px) { .src-grid { grid-template-columns: 1fr; } }
        @media (max-width: 720px) {
          .derived-grid { grid-template-columns: 1fr 1fr; }
          .mgrid { grid-template-columns: 1fr; }
          .wiz-foot { flex-wrap: wrap; }
          .wiz-foot .btn { flex: 1 1 auto; }
        }
      `}</style>
    </>
  );
}

Object.assign(window, { EnrollCompany, COUNTRIES });
