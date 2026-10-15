// NeoERP — Agreements. No plan tiers: each tenant has an agreement with a term,
// modules and limits. An agreement that lapses quietly is a support incident, so
// the countdown escalates in visual weight as it approaches.

// D-6: the org-service computes `state` / `daysRemaining` / `percentElapsed`
// once, server-side, and documents why -- "so a table chip, a countdown card
// and the dashboard queue can never disagree." Every agreement record already
// carries these three fields (RULES.md §11). This reads them; it never
// recomputes a day count from `start`/`end` itself.
const AGR_STATE_META = {
  ACTIVE:   { key: 'active',   tone: 'success', label: 'Active' },
  RENEWAL:  { key: 'renewal',  tone: 'info',    label: 'Renewal window' },
  SOON:     { key: 'soon',     tone: 'warn',    label: 'Expiring soon' },
  CRITICAL: { key: 'critical', tone: 'danger',  label: 'Expires this week' },
  EXPIRED:  { key: 'expired',  tone: 'danger',  label: 'Expired' },
};

function agreementState(agreement) {
  const meta = AGR_STATE_META[agreement.state] || AGR_STATE_META.ACTIVE;
  const days = agreement.daysRemaining;
  const short = meta.key === 'expired' ? `${Math.abs(days)}d ago` : `${days}d left`;
  return { ...meta, days, percentElapsed: agreement.percentElapsed, short };
}

// Two datasets carry tenants (TENANT_TREE and MOCK.COMPANIES). Resolve across
// both and return null when there is genuinely no agreement — never fall back to
// someone else's, which is how a contract reference ends up on the wrong screen.
// Only a franchise needs its own owner — a company-owned branch is run by group
// staff, so a blank there is normal. One definition, or two screens disagree
// about whether the same branch is a problem.
function branchNeedsOwner(b) {
  return !!b && b.ownership === 'franchise' && !b.owner;
}

function agreementFor(name) {
  if (!name) return null;
  const t = tenantIndex().find(x => x.nm === name);
  return (t && t.agreement) || null;
}

// Every agreement on the platform — company-held and franchise-held alike.
// The dashboard and the renewal queue both read from this.
// TENANT_TREE and MOCK.COMPANIES now describe the same four tenants. Walking
// both without a key emits every company agreement twice, so every tenant is
// resolved once, by name, with TENANT_TREE winning where they overlap.
function tenantIndex() {
  const byName = new Map();
  ((window.MOCK || {}).COMPANIES || []).forEach(c => {
    byName.set(c.name, { id: c.id, nm: c.name, agreement: c.agreement || null, branches: [] });
  });
  (window.TENANT_TREE || []).forEach(t => {
    const prev = byName.get(t.nm);
    byName.set(t.nm, { id: t.id || (prev && prev.id), nm: t.nm, agreement: t.agreement || (prev && prev.agreement) || null, branches: t.branches || [] });
  });
  return [...byName.values()];
}

function allAgreements() {
  const out = [];
  tenantIndex().forEach(t => {
    if (t.agreement) out.push({ scope: 'company', id: t.id, name: t.nm, parent: null, agreement: t.agreement });
    t.branches.forEach(b => {
      if (b.agreement) out.push({ scope: 'franchise', id: t.id, name: b.nm, parent: t.nm, agreement: b.agreement });
    });
  });
  return out.sort((x, y) => x.agreement.daysRemaining - y.agreement.daysRemaining);
}

// The agreement that actually governs a branch: its own if it holds one,
// otherwise the group's. Never guess — the two expire on different days.
function agreementForBranch(company, branch) {
  const t = (window.TENANT_TREE || []).find(x => x.nm === company);
  if (!t) return { agreement: null, own: false };
  const b = (t.branches || []).find(x => x.nm === branch);
  if (b && b.agreement) return { agreement: b.agreement, own: true, group: t.agreement };
  return { agreement: t.agreement || null, own: false, group: t.agreement };
}

// Resolve a branch across both tenant datasets. Returns null when there is no
// record — a wrong owner and contract reference is worse than an empty state.
function branchRecord(company, branch) {
  const t = tenantIndex().find(x => x.nm === company);
  if (!t) return null;
  const b = (t.branches || []).find(x => x.nm === branch);
  if (b) {
    return {
      co: { nm: t.nm, agreement: t.agreement, entitled: (window.TENANT_TREE || []).find(x => x.nm === company)?.entitled || null,
            addenda: (window.TENANT_TREE || []).find(x => x.nm === company)?.addenda || [], branches: t.branches },
      b,
      meta: (window.ENT_BRANCHES || []).find(x => x.nm === branch) || { billing: 'group', city: b.city || null, id: b.code || branch },
      full: true,
    };
  }
  // Tenants carried only by MOCK.COMPANIES keep their flat branchList.
  const c = ((window.MOCK || {}).COMPANIES || []).find(x => x.name === company);
  const bl = c && (c.branchList || []).find(x => x.name === branch);
  if (!bl) return null;
  return {
    co: { nm: c.name, agreement: c.agreement || null, entitled: null, addenda: [], branches: [] },
    b: { nm: bl.name, ownership: 'company', owner: null, city: bl.city, code: bl.code },
    meta: { billing: 'group', city: bl.city, id: bl.code, status: bl.status },
    full: false,
  };
}

function fmtDate(d) {
  return new Date(d + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Compact status for tables and headers.
function AgreementChip({ agreement, showRef }) {
  const s = agreementState(agreement);
  return (
    <span className={`agr-chip ${s.key}`}>
      <span className="agr-dot"/>
      {showRef ? <span className="agr-ref">{agreement.ref}</span> : null}
      <span>{s.key === 'active' ? fmtDate(agreement.end) : s.short}</span>
    </span>
  );
}

// Full panel: term elapsed, countdown, and an action that escalates with urgency.
function AgreementCard({ agreement, tenant, onRenew, tenantView }) {
  const s = agreementState(agreement);
  const elapsed = s.percentElapsed;
  // Cosmetic only: where the "renewal window opens" tick sits along the term
  // bar. The backend doesn't hand back a total-term-length field, so this is
  // the one date computation left here -- it positions a tick, it does not
  // decide urgency (that's s.key, straight off the record).
  const termDays = Math.max(1, Math.round((new Date(agreement.end) - new Date(agreement.start)) / 86400000));
  const urgent = s.key === 'critical' || s.key === 'expired' || s.key === 'soon';

  return (
    <div className={`card agr-card ${s.key}`}>
      <div className="card-head">
        <div>
          <div className="card-title">{tenantView ? 'Your agreement' : 'Agreement'}</div>
          <div className="card-sub">{agreement.ref} · {agreement.term} · {agreement.renewal === 'auto' ? 'auto-renews' : 'manual renewal'}</div>
        </div>
        <Pill tone={s.tone}>{s.label}</Pill>
      </div>
      <div className="card-pad">
        <div className="agr-count">
          <div>
            <div className={`agr-days ${s.key}`}>
              {s.key === 'expired' ? `Expired ${Math.abs(s.days)} days ago` : `${s.days} days remaining`}
            </div>
            <div className="agr-window">{fmtDate(agreement.start)} → {fmtDate(agreement.end)}</div>
          </div>
          <div className="agr-pct">{elapsed}%<span className="agr-pct-l">elapsed</span></div>
        </div>
        <div className="agr-track">
          <div className={`agr-fill ${s.key}`} style={{ width: `${elapsed}%` }}/>
          <span className="agr-mark" style={{ left: `${Math.min(100, Math.round(((termDays - 90) / termDays) * 100))}%` }} title="Renewal window opens"/>
        </div>
        <div className="agr-legend">
          <span/>
          <span>Renewal window opens 90 days out</span>
        </div>

        {urgent && (
          <div className={`agr-alert ${s.key}`}>
            <Icon name={s.key === 'expired' ? 'x' : 'bell'} size={16}/>
            <div>
              <b>
                {s.key === 'expired'
                  ? 'This agreement has lapsed'
                  : s.key === 'critical'
                    ? `${s.days} days left — this needs a decision now`
                    : `Renewal is late — ${s.days} days left`}
              </b>
              <p>
                {tenantView
                  ? s.key === 'expired'
                    ? 'Your access continues for now, but new documents may be blocked. Contact Neovatus to renew.'
                    : 'Nothing stops working on the day it expires — but renew before then so it never comes up mid-payroll.'
                  : s.key === 'expired'
                    ? `${tenant} is operating past their term. Either renew it or suspend, but don't leave it ambiguous.`
                    : `Confirm renewal with ${tenant}. Modules and limits carry over unless the new agreement changes them.`}
              </p>
            </div>
          </div>
        )}

        {onRenew && (
          <button className={`btn ${urgent ? 'btn-primary' : 'btn-secondary'} btn-block`} style={{ marginTop: 14 }} onClick={onRenew}>
            {tenantView ? 'Contact Neovatus about renewal' : s.key === 'expired' ? 'Reinstate or suspend' : 'Start renewal'}
          </button>
        )}
      </div>

      <style>{`
        .agr-card.critical, .agr-card.expired { border-color: var(--danger-dot); }
        .agr-card.soon { border-color: var(--warn-dot); }
        .agr-count { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 12px; }
        .agr-days { font-size: 19px; font-weight: 700; letter-spacing: -.02em; }
        .agr-days.soon { color: var(--warn-fg); }
        .agr-days.critical, .agr-days.expired { color: var(--danger-fg); }
        .agr-window { font-size: 12px; color: var(--fg-3); margin-top: 3px; }
        .agr-pct { font-size: 20px; font-weight: 700; letter-spacing: -.02em; text-align: right; line-height: 1; white-space: nowrap; }
        .agr-pct-l { display: block; font-size: 10.5px; font-weight: 500; letter-spacing: .06em; text-transform: uppercase; color: var(--fg-4); margin-top: 4px; }
        .agr-track { position: relative; height: 8px; border-radius: 999px; background: var(--bg-soft); overflow: visible; }
        .agr-fill { height: 100%; border-radius: 999px; background: var(--fg); transition: width 400ms var(--ease-out); }
        .agr-fill.soon { background: var(--warn-dot); }
        .agr-fill.critical, .agr-fill.expired { background: var(--danger-fg); }
        .agr-mark { position: absolute; top: -3px; width: 2px; height: 14px; background: var(--border-strong); border-radius: 2px; }
        .agr-legend { display: flex; align-items: center; gap: 7px; margin-top: 8px; font-size: 11px; color: var(--fg-4); }
        .agr-legend > span:first-child { width: 2px; height: 10px; background: var(--border-strong); border-radius: 2px; flex-shrink: 0; }
        .agr-alert { display: flex; gap: 12px; padding: 13px 14px; border-radius: var(--r-md); margin-top: 16px; }
        .agr-alert.soon { background: var(--warn-bg); color: var(--warn-fg); }
        .agr-alert.critical, .agr-alert.expired { background: var(--danger-bg); color: var(--danger-fg); }
        .agr-alert svg { flex-shrink: 0; margin-top: 1px; }
        .agr-alert b { font-size: 13px; font-weight: 600; display: block; }
        .agr-alert p { margin: 3px 0 0; font-size: 12.5px; line-height: 1.5; color: var(--fg-2); }
      `}</style>
    </div>
  );
}

// Tenant-side banner. Only appears inside 30 days — earlier than that it is noise.
function AgreementBanner({ agreement, onAct }) {
  const s = agreementState(agreement);
  if (s.key === 'active' || s.key === 'renewal') return null;
  return (
    <div className={`agr-banner ${s.key}`}>
      <Icon name="bell" size={16}/>
      <div className="agr-banner-txt">
        <b>
          {s.key === 'expired'
            ? 'Your agreement has expired'
            : `Your agreement ends in ${s.days} day${s.days === 1 ? '' : 's'}`}
        </b>
        <span>Ends {fmtDate(agreement.end)} · {agreement.ref}</span>
      </div>
      <button className="agr-banner-btn" onClick={onAct}>Talk to Neovatus</button>
      <style>{`
        .agr-banner { display: flex; align-items: center; gap: 14px; padding: 12px 16px; border-radius: var(--r-lg); margin-bottom: 16px; flex-wrap: wrap; }
        .agr-banner.soon { background: var(--warn-bg); color: var(--warn-fg); }
        .agr-banner.critical, .agr-banner.expired { background: var(--danger-bg); color: var(--danger-fg); }
        .agr-banner svg { flex-shrink: 0; }
        .agr-banner-txt { flex: 1; min-width: 200px; }
        .agr-banner-txt b { display: block; font-size: 13.5px; font-weight: 600; }
        .agr-banner-txt span { font-size: 12px; color: var(--fg-2); }
        .agr-banner-btn { height: 34px; padding: 0 14px; border-radius: var(--r-md); border: 1px solid currentColor; background: transparent; color: inherit; font-size: 12.5px; font-weight: 600; cursor: default; white-space: nowrap; }
        .agr-banner-btn:hover { background: var(--bg-elev); }
      `}</style>
    </div>
  );
}

Object.assign(window, { agreementState, fmtDate, agreementFor, allAgreements, agreementForBranch, branchRecord, tenantIndex, branchNeedsOwner, AgreementChip, AgreementCard, AgreementBanner });
