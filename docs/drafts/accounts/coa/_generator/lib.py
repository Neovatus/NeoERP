CONTRA = {"ACCUM_DEPRECIATION":"CREDIT","ALLOWANCE":"CREDIT","INVENTORY_PROVISION":"CREDIT",
          "REVENUE_DEDUCTION":"DEBIT","OWNER_DRAWINGS":"DEBIT","PURCHASE_DEDUCTION":"CREDIT"}
class Chart:
    def __init__(self, name):
        self.name=name; self.rows=[]; self.idx={}
    def _add(self,r):
        self.rows.append(r); self.idx.setdefault(r["code"],[]).append(r)
    def H(self,code,en,loc,typ,parent=None,notes=""):
        if parent is None:
            parent = "" if len(code)==1 else (code[0] if len(code)==2 else code[:2])
        self._add(dict(code=code,name_en=en,name_local=loc,type=typ,subtype="HEADER",
            normal_balance="DEBIT" if typ in("ASSET","EXPENSE") else "CREDIT",is_header="true",
            parent_code=parent,control="none",role="",dimensions="",notes=notes,source="",evidence_version="",check_state="UNCHECKED"))
    def A(self,code,en,loc,typ,sub,ctrl="none",role="",nb=None,notes="",dims=None,parent=None):
        if parent is None: parent=code[:2]
        if nb is None:
            nb = CONTRA.get(sub, "DEBIT" if typ in("ASSET","EXPENSE") else "CREDIT")
        if dims is None:
            if typ in("INCOME","EXPENSE"): dims="branch|cost_centre|project"
            elif sub=="INVENTORY": dims="branch|stock_location"
            elif typ=="EQUITY": dims=""
            else: dims="branch"
        self._add(dict(code=code,name_en=en,name_local=loc,type=typ,subtype=sub,normal_balance=nb,
            is_header="false",parent_code=parent,control=ctrl,role=role,dimensions=dims,notes=notes,source="",evidence_version="",check_state="UNCHECKED"))
    def get(self,code): return self.idx[code][0]
    def set(self,code,**kw): self.get(code).update(kw)
COLS=["code","name_en","name_local","type","subtype","normal_balance","is_header","parent_code","control","role","dimensions","notes",
      "source","evidence_version","check_state"]
# Review M6 (2026-10-06): every account carries its provenance. source = the official reference the row is checked against;
# evidence_version = the edition of that reference; check_state = UNCHECKED until NeoERP has checked the row against it
# (then CHECKED). No accountant gate. Rows may set source/evidence_version themselves; gen.py fills the pack default otherwise.
CHECK_STATES=("UNCHECKED","CHECKED")
# Pack-level provenance defaults (review M6). A row that already names its source keeps it.
EV={"BASE":"IFRS Accounting Standards 2026 (IAS 1)","PK":"draft","NO":"SAF-T Financial 1.30","SE":"BAS 2026 v1.1"}
def _ext(r): return "NeoERP extension" in r["notes"]
def default_source(pack,r):
    code=r["code"]; cls=code[0]; grp=code[:2]
    if pack=="BASE":
        if r["type"] in("INCOME","EXPENSE"): return "IFRS / IAS 1 presentation — profit or loss, expenses by nature (IAS 1.82, 1.102); NeoERP numbering"
        return "IFRS / IAS 1 presentation — statement of financial position (IAS 1.54); NeoERP numbering"
    if pack=="PK":
        return "SECP — Companies Act 2017, Fourth/Fifth Schedule presentation (IFRS / IFRS for SMEs); NeoERP numbering"
    if pack=="NO":
        if len(code)==1: return f"NS 4102 structure, class {cls}"
        if len(code)==2: return f"NS 4102 structure, class {cls}, group {grp}"
        if _ext(r): return f"NS 4102 structure, class {cls}, group {grp} (NeoERP extension number); SAF-T standard account: map to group {grp}"
        return f"NS 4102 structure, class {cls}, group {grp}; SAF-T standard account {code}"
    if pack=="SE":
        if len(code)==1: return f"BAS 2026 kontoplan, kontoklass {cls}"
        if len(code)==2: return f"BAS 2026 kontoplan, kontogrupp {grp}"
        if _ext(r):   # re-review R1: "not listed" only for numbers checked against the BAS 2026 PDF (se.BAS_FREE)
            from se import BAS_FREE
            if code in BAS_FREE: return f"NeoERP extension in BAS 2026 kontogrupp {grp} (number not listed in BAS 2026 kontoplan)"
            return f"NeoERP extension in BAS group {grp} (not yet checked against BAS 2026)"
        return f"BAS 2026 kontoplan, account {code} (kontogrupp {grp})"
    raise ValueError(pack)
def apply_provenance(pack,rows):
    for r in rows:
        if not r["source"]: r["source"]=default_source(pack,r)
        if not r["evidence_version"]: r["evidence_version"]=EV[pack]
        if not r["check_state"]: r["check_state"]="UNCHECKED"
        r["notes"]=r["notes"].strip()
