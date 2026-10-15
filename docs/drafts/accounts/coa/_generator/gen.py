import csv, os, sys, collections
sys.path.insert(0, os.path.dirname(__file__))
from lib import COLS, CONTRA, CHECK_STATES, apply_provenance
import base, pk, no, se, tax
from roles import ROLES, LEVEL_TEXT
OUT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.makedirs(OUT, exist_ok=True)
packs=[("base-ifrs.csv",base.build(),"BASE"),("pk.csv",pk.build(),"PK"),("no-ns4102.csv",no.build(),"NO"),("se-bas.csv",se.build(),"SE")]
R={r[0]:r for r in ROLES}
errors=[]; summary=[]; mapping=collections.defaultdict(dict); anomalies=[]
for fn,c,key in packs:
    rows=sorted(c.rows,key=lambda r:r["code"])
    apply_provenance(key,rows)
    for r in rows:   # review M6: provenance is mandatory and the check state is closed
        if not r["source"] or not r["evidence_version"]: errors.append(f"{fn}: {r['code']} missing source/evidence_version")
        if r["check_state"] not in CHECK_STATES: errors.append(f"{fn}: {r['code']} bad check_state {r['check_state']}")
        if "Not yet checked against source" in r["notes"]: errors.append(f"{fn}: {r['code']} notes duplicate check_state")
    codes=collections.Counter(r["code"] for r in rows)
    for k,v in codes.items():
        if v>1: errors.append(f"{fn}: duplicate code {k}")
    by={r["code"]:r for r in rows}
    for r in rows:
        p=r["parent_code"]
        if p:
            if p not in by: errors.append(f"{fn}: {r['code']} parent {p} missing")
            elif by[p]["is_header"]!="true": errors.append(f"{fn}: {r['code']} parent {p} not header")
            elif len(p)>1 and by[p]["type"]!=r["type"]: errors.append(f"{fn}: {r['code']} type {r['type']} != parent {p} {by[p]['type']}")
        elif len(r["code"])!=1: errors.append(f"{fn}: {r['code']} has no parent")
        if r["is_header"]=="true" and (r["role"] or r["control"]!="none"): errors.append(f"{fn}: header {r['code']} has role/control")
        # review fix R2: a posting account's class must fit its type (1 = assets, 2 = equity/liabilities, 3-8 = P&L)
        if r["is_header"]=="false":
            k=r["code"][0]; t=r["type"]
            ok={"1":("ASSET",),"2":("EQUITY","LIABILITY")}.get(k,("INCOME","EXPENSE"))
            if t not in ok: errors.append(f"{fn}: {r['code']} type {t} does not fit class {k}")
        dflt = CONTRA.get(r["subtype"], "DEBIT" if r["type"] in("ASSET","EXPENSE") else "CREDIT")
        if r["is_header"]=="false" and r["normal_balance"]!=dflt: anomalies.append(f"{fn} {r['code']} {r['name_en']}: {r['type']} with normal {r['normal_balance']}")
        if r["role"]:
            role=r["role"]
            if role not in R: errors.append(f"{fn}: unknown role {role}"); continue
            if role in mapping[key]: errors.append(f"{fn}: role {role} mapped twice ({mapping[key][role]}, {r['code']})")
            mapping[key][role]=r["code"]
            if r["type"] not in R[role][4].split("|"): errors.append(f"{fn}: role {role} on {r['code']} type {r['type']} not in {R[role][4]}")
            need=R[role][6]
            if need and r["control"]!=need: errors.append(f"{fn}: role {role} on {r['code']} needs control {need}, has {r['control']}")
    for code,rr in R.items():
        if rr[3]=="R" and code not in mapping[key]: errors.append(f"{fn}: required role {code} not mapped")
    with open(os.path.join(OUT,fn),"w",newline="",encoding="utf-8") as f:
        w=csv.DictWriter(f,fieldnames=COLS,lineterminator="\n"); w.writeheader(); w.writerows(rows)
    nh=sum(1 for r in rows if r["is_header"]=="true")
    unm=[k for k in R if k not in mapping[key]]
    summary.append((fn,len(rows),nh,len(rows)-nh,len(mapping[key]),unm))
    globals()[f"BY_{key}"]=by
# tax codes
tc=collections.Counter()
for t in tax.ROWS:
    by=globals()["BY_"+t["country"]]
    tc[t["country"]]+=1
    for k in("output_role","input_role"):
        if t[k] and t[k] not in R: errors.append(f"tax {t['code']}: unknown role {t[k]}")
    for k in("output_account","input_account"):
        a=t[k]
        if a:
            if a not in by: errors.append(f"tax {t['code']}: account {a} missing in pack")
            elif by[a]["is_header"]=="true": errors.append(f"tax {t['code']}: account {a} is header")
    for rk,ak in(("output_role","output_account"),("input_role","input_account")):
        if t[rk] and not t[ak] and t[rk] not in mapping[t["country"]]: errors.append(f"tax {t['code']}: role {t[rk]} unmapped and no account")
    if not t["source"] or not t["evidence_version"]: errors.append(f"tax {t['code']}: missing source/evidence_version")
    if t["check_state"] not in CHECK_STATES: errors.append(f"tax {t['code']}: bad check_state")
    if t["active"] not in("true","false"): errors.append(f"tax {t['code']}: bad active flag")
    if t["kind"] not in("OUTPUT","INPUT","EXEMPT","ZERO","REVERSE_CHARGE","WITHHOLDING","OUT_OF_SCOPE"): errors.append(f"tax {t['code']}: bad kind")
codes=collections.Counter(t["code"] for t in tax.ROWS)
for k,v in codes.items():
    if v>1: errors.append(f"tax duplicate {k}")
with open(os.path.join(OUT,"tax-codes.csv"),"w",newline="",encoding="utf-8") as f:
    w=csv.DictWriter(f,fieldnames=tax.TCOLS,lineterminator="\n"); w.writeheader(); w.writerows(tax.ROWS)
# account-roles.md mapping tables
import json
json.dump(dict(mapping=mapping,summary=summary,tax=tc,anom=anomalies),open(os.path.join(os.path.dirname(os.path.abspath(__file__)),"out.json"),"w"),default=list,indent=1)
print("ERRORS",len(errors)); print("\n".join(errors))
for s in summary: print(s[0],"rows",s[1],"headers",s[2],"posting",s[3],"roles",s[4],"unmapped",s[5])
print("tax",dict(tc)); print("ANOMALIES"); print("\n".join(anomalies))
