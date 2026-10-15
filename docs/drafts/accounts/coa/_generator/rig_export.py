# Writes the Screen Rig data file (NeoERP-App/docs/design/screen-rig/accounts-data.jsx) from the CSVs and account-roles.md.
# Run: python3 _generator/rig_export.py (from the coa folder).
import csv, json, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
B = os.path.join(HERE, '..') + os.sep
OUT = os.path.join(HERE, '..', '..', '..', '..', '..', 'NeoERP-App', 'docs', 'design', 'screen-rig', 'accounts-data.jsx')
T = {'ASSET':'A','LIABILITY':'L','EQUITY':'E','INCOME':'I','EXPENSE':'X'}
out = []
def chart(fn):
    rows = []
    for r in csv.DictReader(open(B+fn, encoding='utf-8')):
        rows.append([r['code'], r['name_en'], r['name_local'], T[r['type']], r['subtype'], r['normal_balance'][0],
                     1 if r['is_header']=='true' else 0, r['parent_code'], r['control'], r['role'], r['dimensions'], r['notes'],
                     r['source'], r['evidence_version'], r['check_state']])
    return rows
charts = {'BASE': chart('base-ifrs.csv'), 'PK': chart('pk.csv'), 'NO': chart('no-ns4102.csv'), 'SE': chart('se-bas.csv')}
for k,v in charts.items(): print(k, len(v), sum(1 for r in v if r[6]==0))
# roles catalogue
roles = []
md = open(B+'account-roles.md', encoding='utf-8').read()
cat = md.split('## Catalogue')[1].split('## Mapping per pack')[0]
for line in cat.splitlines():
    m = re.match(r'\| `([A-Z_]+)` \| (.*?) \| (.*?) \| (.*?) \| (.*?) \| (.*?) \| (.*?) \| (.*?) \|', line)
    if m:
        code, purpose, by, need, typ, normal, ctrl, in42 = m.groups()
        roles.append([code, purpose, by, need, typ, normal, ctrl.replace('—','none')])
print('roles', len(roles), sum(1 for r in roles if r[3]=='Required at setup'))
tax = []
for r in csv.DictReader(open(B+'tax-codes.csv', encoding='utf-8')):
    tax.append([r['country'], r['jurisdiction'], r['code'], r['name_en'], r['name_local'], r['kind'], r['rate_percent'], r['applies_to'],
                r['output_role'], r['input_role'], r['output_account'], r['input_account'], r['report_ref'], r['valid_from'], r['notes'], r['source'],
                r['evidence_version'], r['check_state'], 1 if r['active']=='true' else 0])
print('tax', len(tax))
js = ['// NeoERP — Accounts A0 template data (spec AC-A0).', '// Generated from docs/drafts/accounts/coa/ (CSV + account-roles.md) on 2026-10-06. Do not edit by hand: regenerate.',
      '// Chart row: [code, name_en, name_local, type A/L/E/I/X, subtype, normal D/C, header 0/1, parent, control, role, dimensions, notes, src, ev, chk]',
      '//   src = official source reference, ev = evidence version, chk = \'UNCHECKED\'|\'CHECKED\' (review M6). Notes no longer carry check text.',
      'const AC_CHARTS = ' + json.dumps(charts, ensure_ascii=False, separators=(',',':')) + ';',
      '// Role row: [code, purpose, posted by, needed from, allowed type, normal, control]',
      'const AC_ROLE_CATALOGUE = ' + json.dumps(roles, ensure_ascii=False, separators=(',',':')) + ';',
      '// Tax row: [country, jurisdiction, code, name_en, name_local, kind, rate, applies_to, output_role, input_role, output_account, input_account, report_ref, valid_from, notes, source, ev, chk, active]',
      '//   ev = evidence version, chk = \'UNCHECKED\'|\'CHECKED\', active = 1|0 (template copied switched on; PK-WHT-ST is 0 with its rate kept).',
      'const AC_TAX_TEMPLATES = ' + json.dumps(tax, ensure_ascii=False, separators=(',',':')) + ';']
js.append('')
js.append('Object.assign(window, { AC_CHARTS, AC_ROLE_CATALOGUE, AC_TAX_TEMPLATES });')
open(OUT,'w',encoding='utf-8').write('\n'.join(js)+'\n')
print(os.path.normpath(OUT), os.path.getsize(OUT))
