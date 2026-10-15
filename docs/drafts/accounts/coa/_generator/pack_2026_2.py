"""Deterministic CP-P26.2 data. 2026.1 resources are read-only input; no wall-clock values."""
import csv, hashlib, json, pathlib, re
from local_names import NAMES, TAX_LOCAL
HERE=pathlib.Path(__file__).resolve().parent
ROOT=HERE.parents[4]/'NeoERP-BackEnd'
OLD=ROOT/'services/accounts-service/src/main/resources/packs/2026.1'
VERSION='2026.2'
PROV=['source','evidence_version','check_state']
CHART=['code','name_en','name_local','type','subtype','normal_balance','is_header','parent_code','control','role','dimensions','notes']+PROV+['std_account_ref']
ROLE=['code','purpose','posted_by','needed_from','allowed_types','normal_balance','control','required','payee_tag']+PROV
TAX=['country','jurisdiction','code','name_en','name_local','kind','rate_percent','applies_to','output_role','input_role','output_account','input_account','report_ref','valid_from','notes']+PROV+['active','additional','base_rule','base_type','regime','rate_hint','deductible_percent','credit_note_window_days','std_tax_code','std_vat_code_ref','side_note']
FILES={'BASE':'base-ifrs.csv','PK':'pk.csv','NO':'no-ns4102.csv','SE':'se-bas.csv','DK':'dk.csv','FI':'fi.csv','IS':'is.csv'}
SOURCE={'BASE':'NeoERP structure; IFRS IAS 1','PK':'STA 1990 s.23; STR 2006 Chapter XIV r.150R(13); ITO 2001','NO':'Bokføringsforskriften §§ 5-1-1 to 5-1-6; mval; SAF-T Financial','SE':'ML 2023:200; BAS 2026 kontoplan v1.1','DK':'Momsloven LBK 209/2024; momsbekendtgørelsen BEK 1435','FI':'AVL; kirjanpitolaki; kirjanpitoasetus 1339/1997; PMA 1753/2015','IS':'Lög 50/1988; lög 3/2006; reglugerð 50/1993','*':'NeoERP structure'}
def provenance(country='*',source=None):return dict(source=source or SOURCE[country],evidence_version='2026.2 contract verification 2026-10-09/10/13',check_state='UNCHECKED')
def read(name):return list(csv.DictReader((OLD/name).open(encoding='utf-8')))
def add(rows,code,name,typ,sub,role='',control='none',local='',notes='',normal=None):
 r=dict(code=code,name_en=name,name_local=local,type=typ,subtype=sub,normal_balance=normal or ('DEBIT' if typ in ('ASSET','EXPENSE') else 'CREDIT'),is_header='false',parent_code=code[:2],control=control,role=role,dimensions='branch|cost_centre|project' if typ in ('INCOME','EXPENSE') else 'branch',notes=notes,std_account_ref='',**provenance())
 rows[code]=r;return r
COUNTRY_ROLES=[('PROVINCIAL_SS_EXPENSE','PK','EXPENSE','none','NONE'),('PROVINCIAL_SS_PAYABLE','PK','LIABILITY','PAYROLL','REQUIRED'),('ST_WITHHELD_BY_CUSTOMER','PK','ASSET','TAX','NONE'),('NON_ADJUSTABLE_TAX','PK','EXPENSE','none','NONE'),('AM_CONTRIBUTION_PAYABLE','DK','LIABILITY','PAYROLL','NONE'),('ATP_PAYABLE','DK','LIABILITY','PAYROLL','NONE'),('ATP_EXPENSE','DK','EXPENSE','none','NONE'),('FERIEKONTO_PAYABLE','DK','LIABILITY','PAYROLL','NONE'),('TYEL_PAYABLE','FI','LIABILITY','PAYROLL','REQUIRED'),('UNEMPLOYMENT_INSURANCE_PAYABLE','FI','LIABILITY','PAYROLL','NONE'),('PENSION_FUND_PAYABLE','IS','LIABILITY','PAYROLL','REQUIRED'),('UNION_PAYABLE','IS','LIABILITY','PAYROLL','REQUIRED')]
def roles():
 rows=read('account-roles.csv')
 required_tags={'PENSION_PAYABLE','PAYROLL_OTHER_DEDUCTIONS'}
 for r in rows:
  r.update(provenance());r['payee_tag']='REQUIRED' if r['code'] in required_tags else 'OPTIONAL' if r['control']=='PAYROLL' else 'NONE'
 generic=[('SMALL_DIFFERENCES','EXPENSE|INCOME','none','B','NONE'),('PURCHASE_PRICE_VARIANCE','EXPENSE','none','PUR','NONE'),('HOLIDAY_PAY_EMPLOYER_CONTRIB_ACCRUED','LIABILITY','PAYROLL','PAY','OPTIONAL'),('EMPLOYEE_ADVANCES','ASSET','none','PAY','OPTIONAL'),('UNIDENTIFIED_RECEIPTS','LIABILITY','CLEARING','D','NONE')]
 for code,typ,ctrl,level,tag in generic+[(c,t,ctrl,'PAY' if ctrl=='PAYROLL' or c in ('ATP_EXPENSE','PROVINCIAL_SS_EXPENSE') else 'B',tag) for c,cc,t,ctrl,tag in COUNTRY_ROLES]:
  rows.append(dict(code=code,purpose=code.replace('_',' ').capitalize(),posted_by='NeoERP accounts modules',needed_from=level,allowed_types=typ,normal_balance='DEBIT' if typ in ('ASSET','EXPENSE','EXPENSE|INCOME') else 'CREDIT',control=ctrl,required='false',payee_tag=tag,**provenance()))
 return sorted(rows,key=lambda r:r['code'])
def chart(country):
 original=read(FILES[country] if country in ('BASE','PK','NO','SE') else 'base-ifrs.csv')
 rows={r['code']:dict(r,std_account_ref='') for r in original}
 def put(*args,**kw):return add(rows,*args,**kw)
 def move(old,new,**kw):
  if old not in rows:return
  r=rows.pop(old);r.update(code=new,parent_code=new[:2],**kw)
  if country=='SE':r.update(source=f'BAS 2026 kontoplan v1.1, BAS_kontoplan_2026_v2.pdf, account {new} (kontogrupp {new[:2]})',evidence_version='BAS 2026 v1.1')
  rows[new]=r
 def set_(code,**kw):rows[code].update(kw)
 put('3741' if country=='SE' else '7797','Small payment differences','INCOME' if country=='SE' else 'EXPENSE','ROUNDING','SMALL_DIFFERENCES',local='Små betalningsdifferenser' if country=='SE' else '')
 put('4968' if country=='SE' else '4396','Purchase price variances','EXPENSE','COST_OF_SALES','PURCHASE_PRICE_VARIANCE',local='Prisavvikelser vid inköp' if country=='SE' else '')
 if country in ('DK','FI','IS'):
  rows.pop('1620');rows.pop('2750')
  group_local=json.loads((HERE/'country-local.json').read_text())[country]
  for code,name in group_local.items():
   if code in rows:set_(code,name_local=name)
  set_('1570',role='EMPLOYEE_ADVANCES');set_('1940',notes='Currency rule ANY')
  role_local=json.loads((HERE/'role-local.json').read_text())[country]
  for code,name in role_local.items():
   if code in rows:set_(code,name_local=name)
  if country=='DK':
   for code,name,typ,sub,role,ctrl in [('2060','Proposed dividend','EQUITY','RESERVE','','none'),('2070','Net revaluation reserve','EQUITY','RESERVE','','none'),('2601','AM contribution payable','LIABILITY','PAYROLL_LIABILITY','AM_CONTRIBUTION_PAYABLE','PAYROLL'),('2771','ATP payable','LIABILITY','PAYROLL_LIABILITY','ATP_PAYABLE','PAYROLL'),('2772','Holiday pay payable (FerieKonto)','LIABILITY','PAYROLL_LIABILITY','FERIEKONTO_PAYABLE','PAYROLL'),('3010','Sales of goods, EU','INCOME','REVENUE','','none'),('3020','Sales of services, EU','INCOME','REVENUE','','none'),('7720','Restaurant services (25% deductible VAT)','EXPENSE','OPERATING_EXPENSE','','none'),('2706','Output VAT, reverse charge - services bought abroad','LIABILITY','TAX_PAYABLE','','TAX'),('5405','ATP, employer','EXPENSE','EMPLOYEE_BENEFITS','ATP_EXPENSE','none')]:put(code,name,typ,sub,role,ctrl,local=role_local.get(code,''))
   approved=json.loads((HERE/'dk-standard-map.json').read_text())
   assert {r[0] for r in approved}=={r['code'] for r in rows.values() if r['is_header']=='false'},'DK map must cover exactly approved posting chart'
   for code,ref,confidence,note in approved:
    r=rows[code];r['std_account_ref']='' if ref=='none' else ref;r.update(provenance('DK',f'Erhvervsstyrelsen standardkontoplan 2026-01-01, konto {ref}' if ref!='none' else 'NeoERP technical account; no standard account'))
    r['notes']+='; '+confidence+' mapping: '+note
   set_('5400',name_local='Arbejdsgiverbidrag (AUB, AES, Barsel.dk, finansieringsbidrag)')
  if country=='FI':
   for code,name,typ,sub in [('2080','Poistoero','EQUITY','UNTAXED_RESERVE'),('2085','Vapaaehtoiset varaukset','EQUITY','UNTAXED_RESERVE'),('8800','Poistoeron muutos','EXPENSE','APPROPRIATION'),('8810','Vapaaehtoisten varausten muutos','EXPENSE','APPROPRIATION'),('7720','Edustuskulut','EXPENSE','OPERATING_EXPENSE')]:put(code,name,typ,sub,local=name)
   rows['88']=dict(rows['83'],code='88',name_en='Appropriations',name_local='Tilinpäätössiirrot')
  if country=='IS':set_('2020',name_en='Statutory reserve',name_local='Lögbundinn varasjóður',subtype='RESERVE');put('1945','Bank EUR','ASSET','BANK',control='BANK',local='Gjaldeyrisreikningur EUR',notes='Currency rule ANY');put('7720','Entertainment','EXPENSE','OPERATING_EXPENSE',local='Risna')
  for code,role,local in [('2771',{'FI':'TYEL_PAYABLE','IS':'PENSION_FUND_PAYABLE'}.get(country),role_local.get('2771','')),('2772',{'FI':'UNEMPLOYMENT_INSURANCE_PAYABLE','IS':'UNION_PAYABLE'}.get(country),role_local.get('2772',''))]:
   if role:put(code,role.replace('_',' ').capitalize(),'LIABILITY','PAYROLL_LIABILITY',role,'PAYROLL',local=local)
  if country in ('FI','IS'):put('2941','Employer contributions accrued on holiday pay','LIABILITY','PAYROLL_LIABILITY','HOLIDAY_PAY_EMPLOYER_CONTRIB_ACCRUED','PAYROLL',local='Lomapalkkavelan henkilösivukulujaksotus' if country=='FI' else 'Áfallin launatengd gjöld af orlofi')
 if country=='PK':
  for code,role in [('2771','PROVINCIAL_SS_PAYABLE'),('5410','PROVINCIAL_SS_EXPENSE'),('1625','ST_WITHHELD_BY_CUSTOMER')]:set_(code,role=role)
  set_('2770',name_en='EOBI payable');set_('5400',name_en='EOBI - employer contribution')
  put('1572','Advances and loans to employees (payroll)','ASSET','OTHER_RECEIVABLE','EMPLOYEE_ADVANCES')
  put('7798','Non-adjustable sales tax','EXPENSE','OPERATING_EXPENSE','NON_ADJUSTABLE_TAX')
  for code,name in [('2703','Output sales tax - Sindh (SRB)'),('2704','Output sales tax - Khyber Pakhtunkhwa (KPRA)'),('2706','Output sales tax - Balochistan (BRA)'),('2755','WHT payable s.153(1)(b) services'),('2756','Sales tax withheld - Punjab'),('2757','Sales tax withheld - Sindh'),('2758','Sales tax withheld - KP'),('2759','Sales tax withheld - Balochistan'),('2760','WHT payable s.153(1)(c) contracts')]:put(code,name,'LIABILITY','TAX_PAYABLE',control='TAX')
  set_('2701',name_en='Output sales tax - Punjab (PRA)')
 if country=='SE':
  set_('3041',source='NeoERP extension within BAS group 30',evidence_version='BAS 2026 v1.1',notes='NeoERP extension; SRU / SIE maps as 3001; lead ruling ACC-93')
  set_('2091',role='RETAINED_EARNINGS');set_('2098',role='');set_('2099',role='CURRENT_YEAR_RESULT');set_('2009',role='OPENING_BALANCE_EQUITY')
  for old,new in [('1515','1516'),('1580','1686'),('1240','1226'),('1250','1224'),('1249','1229'),('7834','7832'),('7720','7730'),('4600','4610'),('4730','4091'),('4515','4075'),('4545','4085')]:move(old,new)
  rows.pop('1259',None);rows.pop('7835',None)
  set_('1229',name_en='Accumulated depreciation - equipment',name_local='Ackumulerade avskrivningar på inventarier')
  for code,local in {'1019':'Ack. avskr. på balanserade utgifter','1220':'Inventarier, verktyg och installationer','1350':'Andra långfristiga värdepappersinnehav','1930':'Företagskonto','2097':'Fri överkursfond','2330':'Kontokredit','2350':'Andra långfristiga skulder till kreditinstitut','3980':'Erhållna offentliga bidrag','3990':'Övriga ersättningar, bidrag och intäkter','5020':'El','6250':'Porto','7510':'Arbetsgivaravgifter 31,42 %','2614':'Utgående moms omvänd betalningsskyldighet, 25 %','2647':'Ingående moms omvänd betalningsskyldighet varor och tjänster i Sverige','1516':'Tvistiga kundfordringar','1686':'Fordringar för kontokort och kuponger','1224':'Datorer (ej för produktion)','1226':'Bilar och transportmedel','4091':'Erhållna kassarabatter (Handelsvaror)','4010':'Inköp av handelsvaror i Sverige','4610':'Inköp av tjänster och underentreprenader'}.items():
   if code in rows:set_(code,name_local=local)
  for code,name,typ,sub in [('2613','Utgående moms för uthyrning, 25 %','LIABILITY','TAX_PAYABLE'),('2624','Utgående moms omvänd betalningsskyldighet, 12 %','LIABILITY','TAX_PAYABLE'),('2634','Utgående moms omvänd betalningsskyldighet, 6 %','LIABILITY','TAX_PAYABLE'),('2625','Utgående moms import av varor, 12 %','LIABILITY','TAX_PAYABLE'),('2635','Utgående moms import av varor, 6 %','LIABILITY','TAX_PAYABLE'),('7732','Nedskrivningar av inventarier','EXPENSE','IMPAIRMENT'),('4076','Inköp av handelsvaror EU, 12 %','EXPENSE','COST_OF_SALES'),('4077','Inköp av handelsvaror EU, 6 %','EXPENSE','COST_OF_SALES'),('4086','Inköp av handelsvaror import, 12 %','EXPENSE','COST_OF_SALES'),('4087','Inköp av handelsvaror import, 6 %','EXPENSE','COST_OF_SALES')]:put(code,name,typ,sub,control='TAX' if typ=='LIABILITY' else 'none',local=name)
  put('2941','Employer contributions accrued on holiday pay','LIABILITY','PAYROLL_LIABILITY','HOLIDAY_PAY_EMPLOYER_CONTRIB_ACCRUED','PAYROLL',local='Beräknade upplupna sociala avgifter')
  if '1610' in rows:set_('1610',role='EMPLOYEE_ADVANCES')
  else:put('1610','Employee advances','ASSET','OTHER_RECEIVABLE','EMPLOYEE_ADVANCES',local='Kortfristiga fordringar hos anställda')
  put('7519','Employer contributions accrued on holiday pay','EXPENSE','EMPLOYEE_BENEFITS',local='Arbetsgivaravgifter för semester- och löneskulder')
  set_('3741',normal_balance='DEBIT')
  for code in ('3741','4968','2009'):set_(code,source='NeoERP structure — number not listed in BAS 2026',evidence_version='BAS 2026 v1.1')
 if country=='NO':
  for old,new,ref in [('1239','1234','1230'),('1249','1248','1237'),('1289','1288','1280'),('1490','1498','1460'),('1960','1915','1900'),('2945','2946','2999'),('3090','3095','3087'),('3710','3715','3900'),('4380','4370','4371'),('7610','7605','7605'),('1570','1579','1579')]:move(old,new,std_account_ref=ref)
  rows.pop('2970',None);rows.pop('3040',None);rows.pop('1575',None)
  for code,name,role,ref in [('2961','Goods received not invoiced','GRNI','2960'),('2965','Income received in advance','','2965')]:put(code,name,'LIABILITY','ACCRUAL' if code=='2961' else 'CONTRACT_LIABILITY',role,'INVENTORY' if role else 'none')['std_account_ref']=ref
  for r in rows.values():
   if r['role']=='SERVICE_REVENUE_DEFAULT':r['role']=''
  for code,name,role in [('3020','Sales of services, high rate','SERVICE_REVENUE_DEFAULT'),('3030','Sales of goods, middle rate',''),('3050','Sales of services, low rate','')]:put(code,name,'INCOME','REVENUE',role)
  for code,name,role in [('2780','Accrued employer contribution on accrued wages',''),('2781','Accrued employer contribution on accrued holiday pay','HOLIDAY_PAY_EMPLOYER_CONTRIB_ACCRUED')]:put(code,name,'LIABILITY','PAYROLL_LIABILITY',role,'PAYROLL')
  put('1572','Salary advances to employees','ASSET','OTHER_RECEIVABLE','EMPLOYEE_ADVANCES',local='Lønnsforskudd til ansatte');put('1573','Other loans to employees','ASSET','OTHER_RECEIVABLE')
  for code in ('2702','2703','2712'):rows.pop(code,None)
  for code,label,role in [('2703','Output VAT low rate',''),('2704','Output VAT foreign services high','SALES_TAX_OUTPUT_RC'),('2705','Output VAT imported goods high',''),('2706','Output VAT imported goods middle',''),('2707','Output VAT allowances and gold',''),('2709','Output VAT foreign services low',''),('2713','Input VAT low rate',''),('2714','Input VAT foreign services high','SALES_TAX_INPUT_RC'),('2715','Input VAT imported goods high',''),('2716','Input VAT imported goods middle',''),('2717','Input VAT allowances and gold',''),('2718','Input VAT foreign services low','')]:put(code,label,'LIABILITY','TAX_PAYABLE' if code.startswith('270') else 'TAX_RECEIVABLE',role,'TAX',normal='CREDIT' if code.startswith('270') else 'DEBIT')
  refs={'1089':'1000','1109':'1100','1209':'1200','1259':'1250','1240':'1237','3080':'3081','3720':'3900','3730':'3900','7795':'7740','7796':'7798','3800':'3880','5020':'5092','5410':'5405','5420':'5950'}
  for r in rows.values():
   if r['is_header']=='false':
    r['std_account_ref']=refs.get(r['code'],r['std_account_ref'] or ('' if r['code'] in {'1390','1720','1925','1930','1940','2098','2240','4395','6550','7330','7790','7791','7800','8061','8161','8170','7797','4396'} else r['code']));r['source']=f"NeoERP NO chart (NS 4102 structure); SAF-T mapping: standard account {r['std_account_ref']} (Skatteetaten saf-t repo, 4-character list, commit 2023-02-01)"
  if '2099' in rows:set_('2099',role='CURRENT_YEAR_RESULT',name_en='Result for the year (undistributed)')
  set_('2610',name_local='Utleggstrekk')
 for r in rows.values():
  if r['code'].startswith('23') and r['is_header']=='false' and r['subtype']=='BORROWING':r['subtype']='BORROWING_CURRENT'
  if country=='NO' and not r['std_account_ref'] and r['is_header']=='false':r['source']='NeoERP NO chart (NS 4102 structure); NeoERP extension number, SAF-T mapping pending';r['notes']+='; NeoERP extension number'
  if country in ('DK','FI','IS') and not r['source']:r.update(provenance(country))
  if country in ('FI','IS'):r.update(provenance(country))
  if not r['source']:r.update(provenance(country))
  if country in NAMES and not r['name_local']:r['name_local']=NAMES[country].get(r['code'],'')
  if country in NAMES:assert r['name_local'],f"Missing local name: {country} {r['code']}"
  r['check_state']='UNCHECKED'
 return sorted(rows.values(),key=lambda r:r['code'])
def tax_codes():
 rows=read('tax-codes.csv')
 for r in rows:
  r.update(additional='false',base_rule='NET',base_type='',regime='',rate_hint='',deductible_percent='100',credit_note_window_days='',std_tax_code='',std_vat_code_ref='',side_note='')
  if r['kind']=='EXEMPT':r['rate_percent']=''
  if not r['valid_from']:r['valid_from']='2025-07-01' if r['country']=='PK' else '2025-01-01'
  if r['country']=='NO':r['std_tax_code']=re.search(r'code (\d+)',r['report_ref']).group(1)
 by={r['code']:r for r in rows}
 def put(cc,code,kind,rate,ref='',oacc='',iacc='',orole=None,irole=None,source=None,local='',ded='100',date=None,notes=''):
  r=dict.fromkeys(TAX,'')
  r.update(country=cc,jurisdiction='PK-FED' if cc=='PK' else cc,code=code,name_en=code.replace('-',' ').title(),name_local=local,kind=kind,rate_percent=str(rate),applies_to='PURCHASES' if kind in ('INPUT','REVERSE_CHARGE') else 'SALES',output_role=orole if orole is not None else ('SALES_TAX_OUTPUT_RC' if kind=='REVERSE_CHARGE' else 'SALES_TAX_OUTPUT' if kind=='OUTPUT' else ''),input_role=irole if irole is not None else ('SALES_TAX_INPUT_RC' if kind=='REVERSE_CHARGE' else 'SALES_TAX_INPUT' if kind=='INPUT' else ''),output_account=oacc,input_account=iacc,report_ref=ref,valid_from=date or ('2015-01-01' if cc in ('DK','FI','IS') else '2025-07-01' if cc=='PK' else '2025-01-01'),notes=notes,active='true' if str(rate) or kind=='EXEMPT' else 'false',additional='false',base_rule='NET',deductible_percent=ded,**provenance(cc,source))
  by[code]=r;return r
 def set_(code,**kw):by[code].update(kw)
 # New country tables are frozen, approved contract rows (not runtime document parsing).
 for spec in json.loads((HERE/'new-tax-codes.json').read_text()):
  cc,code,kind,rate,ref,source,notes=spec
  put(cc,code,kind,rate,ref,source=source,notes=notes)
 dk={'25':'S01','0':'S02','EXPORT':'S41, S42','EU-GOODS':'S21','EU-GOODS-NR':'S22','EU-SVC':'S23','RC-DOM-SALE':'S02','EXEMPT':'S82, S24, S43','EU-TRIANG':'S25','OUT-OF-SCOPE':'S81','IN-25':'K010','IN-25-REP':'K070','IN-25-NODED':'K030','IN-25-50':'K040','IN-25-PRORATA':'K110','RC-EU-GOODS':'K210','RC-EU-SVC':'K260','RC-NONEU-SVC':'K460','RC-DOM':'K660','IMPORT':'K410'}
 for suffix,ref in dk.items():set_('DK-MOMS-'+suffix,std_vat_code_ref=ref)
 for suffix in ('RC-EU-SVC','RC-NONEU-SVC'):set_('DK-MOMS-'+suffix,output_account='2706')
 set_('DK-MOMS-RC-DOM',output_role='SALES_TAX_OUTPUT',input_role='SALES_TAX_INPUT')
 for suffix,ded in [('REP','25'),('NODED','0'),('50','50'),('PRORATA','0')]:set_('DK-MOMS-IN-25-'+suffix,deductible_percent=ded)
 set_('IS-VSK-RC-SVC-NODED',deductible_percent='0',input_role='',report_ref='RSK 10.24 (manual); off IS-VSK return')
 set_('IS-VSK-RC-SVC-IMPORT',report_ref='RSK 10.24 (manual); off IS-VSK return')
 set_('IS-VSK-IN-NODED',deductible_percent='0')
 set_('FI-ALV-IN-STD-NODED',deductible_percent='0')
 # Norway: same rates, separate standard codes and explicitly approved accounts.
 set_('NO-MVA-12',output_account='2703');set_('NO-MVA-IN-12',input_account='2713')
 set_('NO-MVA-RC-SVC',output_account='2704',input_account='2714');set_('NO-MVA-IMPORT-25',output_account='2705',input_account='2715')
 no_specs=[('RC-DOM-SALE','ZERO','0','51','',''),('IMPORT-25-NODED','REVERSE_CHARGE','25','82','2705',''),('IMPORT-15','REVERSE_CHARGE','15','83','2706','2716'),('IMPORT-15-NODED','REVERSE_CHARGE','15','84','2706',''),('IMPORT-EXEMPT','EXEMPT','','85','',''),('IMPORT-PAID-15','INPUT','15','15','','2711'),('RC-SVC-NODED','REVERSE_CHARGE','25','87','2704',''),('RC-SVC-12','REVERSE_CHARGE','12','88','2709','2718'),('RC-SVC-12-NODED','REVERSE_CHARGE','12','89','2709',''),('RC-DOM','REVERSE_CHARGE','25','91','2707','2717'),('RC-DOM-NODED','REVERSE_CHARGE','25','92','2707','')]
 for suffix,kind,rate,ref,oa,ia in no_specs:
  r=put('NO','NO-MVA-'+suffix,kind,rate,'SAF-T code '+ref,oa,ia,irole='' if suffix.endswith('NODED') else None,ded='0' if suffix.endswith('NODED') else '100',source='Skatteetaten Standard_Tax_Codes.csv, code '+ref);r['std_tax_code']=ref
 set_('NO-MVA-15',side_note='Food and drink for human consumption (mval § 5-2). Not alcohol, tobacco, medicines or tap water; serving-service food is 25 %.')
 set_('NO-MVA-EXEMPT',name_en='Sales outside the scope of or exempt from the VAT Act (code 6)',name_local='Omsetning og uttak utenfor merverdiavgiftsloven (unntatt)')
 for suffix in ('RC-DOM','RC-DOM-NODED','RC-DOM-SALE'):set_('NO-MVA-'+suffix,side_note='Only emission allowances or gold ≥ 325/1000 fineness (mval § 11-1). Non-VAT-registered business buyers pay when term purchases exceed NOK 2,000 excluding VAT.')
 # Sweden: every reduced-rate override named by the contract.
 se_specs=[('RC-DOM-GOODS','REVERSE_CHARGE','25','Ruta 23 / 30 / 48','2614','2647'),('RC-DOM-SALE','ZERO','0','Ruta 41','',''),('RC-EU-GOODS-12','REVERSE_CHARGE','12','Ruta 20 / 31 / 48','2624','2645'),('RC-EU-GOODS-6','REVERSE_CHARGE','6','Ruta 20 / 32 / 48','2634','2645'),('IMPORT-12','REVERSE_CHARGE','12','Ruta 50 / 61 / 48','2625','2645'),('IMPORT-6','REVERSE_CHARGE','6','Ruta 50 / 62 / 48','2635','2645'),('EU-TRIANG','ZERO','0','Ruta 38','',''),('SVC-ABROAD','ZERO','0','Ruta 40','',''),('25-RENT','OUTPUT','25','Ruta 08 / 10','2613',''),('IN-25-REP','INPUT','25','Ruta 48','','2641'),('IN-25-CAR50','INPUT','25','Ruta 48','','2641')]
 for suffix,kind,rate,ref,oa,ia in se_specs:put('SE','SE-MOMS-'+suffix,kind,rate,ref,oa,ia)
 set_('SE-MOMS-IN-25-CAR50',deductible_percent='50')
 set_('SE-MOMS-IN-25-REP',side_note='Deductible base at most SEK 300 excluding VAT per person and occasion; schablon SEK 46 per person, SEK 33 when food is at 6 %.')
 for code in ('SE-MOMS-12','SE-MOMS-6'):set_(code,side_note='Food and takeaway 6 % from 2026-04-01 through 2027-12-31, enacted and in force; restaurant/catering stay 12 %; food returns to 12 % from 2028-01-01.')
 set_('SE-MOMS-RC-DOM',name_local='Omvänd betalningsskyldighet inom Sverige')
 # Pakistan provincial tax accounts and withholding attributes/hints.
 for code,account in [('PK-PST-PB','2701'),('PK-SST-SD','2703'),('PK-ST-KP','2704'),('PK-ST-BA','2706')]:set_(code,output_account=account)
 put('PK','PK-ST-3RD','OUTPUT','18','FBR sales tax return','2700',source='STA 1990 s.3(2)(a)');set_('PK-ST-3RD',base_rule='RETAIL_PRICE')
 set_('PK-ST-FURTHER',additional='true',side_note='Federal Government notifications exclude some supplies; remove the code when the exclusion applies.')
 put('PK','PK-ST-WHT-BY-CUST','WITHHOLDING','','FBR return',iacc='1625',orole='',irole='ST_WITHHELD_BY_CUSTOMER',source='STA 1990 Eleventh Schedule');set_('PK-ST-WHT-BY-CUST',base_type='SALES_TAX')
 hints=[('153-GOODS-CO','2750','5','10'),('153-GOODS-OTHER','2750','5.5','11'),('153-SVC-CERTAIN','2755','7','14'),('153-SVC-IT','2755','4','8'),('153-SVC-PROF','2755','15','30'),('153-SVC-PORT','2755','12','24'),('153-SVC-MEDIA','2755','1.5','3'),('153-SVC-OTHER','2755','14','28'),('153-CONTRACT','2760','','')]
 for suffix,oa,filer,non in hints:
  r=put('PK','PK-WHT-'+suffix,'WITHHOLDING','','Withholding statement s.165',oa,orole='WHT_PAYABLE',irole='',source='FBR Withholding Tax Rates Card TY2027 (Finance Act 2026)',date='2026-07-01');r.update(base_type='NET_OF_SALES_TAX',regime='MINIMUM',rate_hint=filer,side_note='ATL filer / non-filer hints; confirm supplier scenario. Contracts: companies 7.5/15; others 8/16; sportspersons 15/30.' if suffix=='153-CONTRACT' else '')
 for suffix,oa in [('PB','2756'),('SD','2757'),('KP','2758'),('BA','2759')]:put('PK','PK-WHT-PST-'+suffix,'WITHHOLDING','','Provincial withholding',oa,orole='WHT_PAYABLE',irole='',source='Provincial sales tax withholding rules; authority-specific scenario *(verify)*')
 for r in by.values():
  if r['country']=='PK':
   if r['kind']=='OUTPUT':r['credit_note_window_days']='180'
   if r['kind']=='WITHHOLDING' and not r['base_type']:r['base_type']='SALES_TAX' if r['code']=='PK-WHT-ST' else 'NET_OF_SALES_TAX'
  if r['country']=='PK' and r['code'] in ('PK-WHT-153-GOODS','PK-WHT-153-SVC'):r['active']='false';r['side_note']='Use the dated filer-specific s.153 sub-codes.'
  if r['code']=='PK-WHT-153-SVC':r['output_account']='2755'
  if r['kind']=='EXEMPT':r['rate_percent']=''
  if r['kind']=='ZERO':r.update(output_role='',input_role='',output_account='',input_account='')
  if r['code'] in TAX_LOCAL:r['name_local']=TAX_LOCAL[r['code']]
 return sorted(by.values(),key=lambda r:(r['country'],r['code']))
def tax_versions(codes):
 result=[]
 for r in codes:
  versions=[(r['valid_from'],r['rate_percent'],'','')]
  if r['country']=='FI' and (r['rate_percent']=='25.5' or 'STD' in r['code'] or r['kind']=='REVERSE_CHARGE'):versions=[('2015-01-01','24','',''),('2024-09-01','25.5','','')]
  if r['code'] in ('FI-ALV-RED','FI-ALV-IN-RED'):versions=[('2015-01-01','14','',''),('2026-01-01','13.5','','')]
  hints={'PK-WHT-153-GOODS-CO':('5','10'),'PK-WHT-153-GOODS-OTHER':('5.5','11'),'PK-WHT-153-SVC-CERTAIN':('7','14'),'PK-WHT-153-SVC-IT':('4','8'),'PK-WHT-153-SVC-PROF':('15','30'),'PK-WHT-153-SVC-PORT':('12','24'),'PK-WHT-153-SVC-MEDIA':('1.5','3'),'PK-WHT-153-SVC-OTHER':('14','28')}
  if r['code'] in hints:
   f,n=hints[r['code']];versions=[('2026-07-01','',f,n)]
   if r['code']=='PK-WHT-153-SVC-CERTAIN':versions.insert(0,('2025-07-01','','6','12'))
   if r['code']=='PK-WHT-153-SVC-OTHER':versions.insert(0,('2025-07-01','','15','30'))
  for i,(date,rate,filer,non) in enumerate(versions,1):result.append(dict(country=r['country'],code=r['code'],version_no=i,rate=f'{float(rate):.4f}' if rate else '',valid_from=date,rate_hint_filer=f'{float(filer):.4f}' if filer else '',rate_hint_non_filer=f'{float(non):.4f}' if non else '',source=r['source'],evidence_version=r['evidence_version'],check_state='UNCHECKED'))
  latest=versions[-1];r['valid_from']=latest[0];r['rate_percent']=latest[1]
 return result
def legal_texts(codes):
 texts={'NO':('nb','Omvendt avgiftsplikt – Merverdiavgift ikke beregnet','Fritatt for merverdiavgift','Unntatt merverdiavgift'), 'SE':('sv','Omvänd betalningsskyldighet','Undantag från momsplikt','Undantag från momsplikt'), 'DK':('da','omvendt betalingspligt, køber afregner momsen','momsfritaget','momsfritaget'), 'FI':('fi','Käännetty verovelvollisuus','Veroton myynti','Arvonlisäveroton myynti'), 'IS':('is','Öfug skattskylda','Velta skv. 12. gr. laga nr. 50/1988','Undanþegið samkvæmt 2. gr. 3. mgr. laga nr. 50/1988'), 'PK':('ur','ریورس چارج','سیلز ٹیکس کی صفر شرح','سیلز ٹیکس سے مستثنیٰ')}
 result=[]
 for r in codes:
  if r['kind'] not in ('ZERO','EXEMPT','REVERSE_CHARGE'):continue
  lang,rc,zero,ex=texts[r['country']]
  local=rc if r['kind']=='REVERSE_CHARGE' or 'RC-DOM-SALE' in r['code'] or r['code'].endswith('EU-SVC') else zero if r['kind']=='ZERO' else ex
  en='Reverse charge' if r['kind']=='REVERSE_CHARGE' or 'RC-DOM-SALE' in r['code'] or r['code'].endswith('EU-SVC') else 'Zero-rated supply' if r['kind']=='ZERO' else 'Exempt supply'
  if r['country']=='DK':
   if r['code']=='DK-MOMS-EU-SVC':local='omvendt betalingspligt';en='reverse charge'
   elif 'RC' in r['code']:en='reverse charge, buyer settles the VAT'
   if r['code']=='DK-MOMS-EU-TRIANG':local='trekantshandel, køber afregner momsen (artikel 141)';en='triangulation, VAT accounted for by the customer (Article 141)'
   if r['code']=='DK-MOMS-OUT-OF-SCOPE':local='uden for momslovens anvendelsesområde';en='outside the scope of Danish VAT'
  for language,text in [('en',en),(lang,local)]:result.append(dict(country=r['country'],code=r['code'],lang=language,text=text,**provenance(r['country'],r['source'])))
 return result
COUNTRY_COLS=['country','version','tax_on_advances','bad_debt_relief','settlement_discount_reduces_tax','default_payment_reference','tax_point_basis','late_document_rule','return_frequency_default','return_frequency_options','yearly_period','eu_sales_list_box_set','eu_sales_list_frequency_default','eu_sales_list_services_frequency_default','credit_note_tax_window_days','cash_payment_warn_limit','cash_receipt_warn_limit','fiscal_registration_required_with_strn','supplier_tax_id_warn','simplified_invoice_limit','invoice_language_default','content_rule_version']+PROV
def country_rules():
 rows=[]
 data=[('PK',True,False,'NONE','TAX_POINT','NEXT_RETURN','MONTHLY','MONTHLY','','','','','180','50000','200000',True,True,'','en'),('NO',False,True,'KID','TAX_POINT','CORRECT_EARLIER','BIMONTHLY','BIMONTHLY|YEARLY|MONTHLY','CALENDAR_YEAR','','','','','10000','',False,False,'','nb'),('SE',True,True,'OCR','ENTRY_DATE','NEXT_RETURN','QUARTERLY','MONTHLY|QUARTERLY|YEARLY','FISCAL_YEAR','SE-PS','MONTHLY','QUARTERLY','','','',False,False,'4000','sv'),('DK',True,True,'FIK71','TAX_POINT','CORRECT_EARLIER','QUARTERLY','MONTHLY|QUARTERLY|HALF_YEARLY','CALENDAR_YEAR','DK-EU-SALG','MONTHLY','MONTHLY','','8000','',False,False,'3000','da'),('FI',True,True,'FI_REF','TAX_POINT','CORRECT_EARLIER','MONTHLY','MONTHLY|QUARTERLY|YEARLY','CALENDAR_YEAR','FI-YVI','MONTHLY','MONTHLY','','','',False,False,'400','fi'),('IS',False,True,'FREE','TAX_POINT','NEXT_RETURN','BIMONTHLY','BIMONTHLY|YEARLY|MONTHLY','CALENDAR_YEAR','','','','','','',False,False,'','is'),('*',False,False,'NONE','ENTRY_DATE','NEXT_RETURN','MONTHLY','MONTHLY|BIMONTHLY|QUARTERLY|HALF_YEARLY|YEARLY','FISCAL_YEAR','','','','','','',False,False,'','en')]
 for cc,advance,bad,ref,point,late,freq,options,yearly,box,eu,svc,window,cash,receipt,fiscal,warn,simple,lang in data:
  rows.append(dict(zip(COUNTRY_COLS[:22],[cc,VERSION,str(advance).lower(),str(bad).lower(),'true',ref,point,late,freq,options,yearly,box,eu,svc,window,cash,receipt,str(fiscal).lower(),str(warn).lower(),simple,lang,VERSION]),**provenance(cc)))
 return rows
PAYMENT_COLS=['country','version','type','algorithm','min_length','max_length','control_levels','default_control_level','is_default','needs_creditor_no']+PROV
def payment_schemes():
 rows=[]
 for cc in ('PK','NO','SE','DK','FI','IS','*'):
  default={'PK':'NONE','NO':'KID','SE':'OCR','DK':'FIK71','FI':'FI_REF','IS':'FREE','*':'NONE'}[cc]
  types=['FREE'] if cc=='IS' else [default,'FREE']
  if cc=='DK':types+=['FIK73','FIK75']
  if cc in ('FI','*'):types+=['RF']
  for typ in types:
   algorithm,low,high={'KID':('MOD10|MOD11','2','25'),'OCR':('MOD10','2','25'),'FIK71':('MOD10','15','15'),'FIK73':('NONE','',''),'FIK75':('MOD10','16','16'),'FI_REF':('WEIGHTS_731','4','20'),'RF':('MOD97_10','5','25')}.get(typ,('NONE','',''))
   rows.append(dict(country=cc,version=VERSION,type=typ,algorithm=algorithm,min_length=low,max_length=high,control_levels='SOFT|HARD|VARIABLE_LENGTH|FIXED_LENGTH' if typ=='OCR' else '',default_control_level='SOFT' if typ=='OCR' else '',is_default=str(typ==default).lower(),needs_creditor_no=str(typ.startswith('FIK')).lower(),**provenance(cc,'Bankgirot Bankgiro Inbetalningar Användarmanual Oct 2023 §5.2' if typ=='OCR' else 'ISO 11649' if typ=='RF' else 'Finance Finland Finnish reference number; 7-3-1 check digit' if typ=='FI_REF' else SOURCE[cc]+'; payment reference scheme')))
 return rows
INVOICE_COLS=['country','rule_version','side','field','seq','applies_when','severity','owner']+PROV
def invoice_rules():
 rows=[]
 common=['seller.legalName','seller.address','customer.name','customer.address','number','invoiceDate','lines[].quantity','lines[].unitOfMeasure','lines[].description','lines[].unitPrice','lines[].discount','taxSummary[].taxableAmount','taxSummary[].taxAmount','lines[].legalText','supplyDate','creditedInvoiceRef','paymentReference','seller.bank']
 for cc in ('PK','NO','SE','DK','FI','IS','*'):
  fields=common+(['seller.taxNumber','seller.vatNumber'] if cc=='PK' else ['seller.identityNumber','seller.vatNumber'] if cc in ('NO','FI','IS') else ['seller.vatNumber'])+['customer.vatNumber','dueDate']
  if cc=='PK':fields+=['customer.taxNumber','customer.cnic','fiscalInvoiceNumber','fiscalQrCode','fiscalLogo','fiscalRegistrationNumber','lines[].hsCode','lines[].sroNumber','lines[].sroSerialNumber','taxSummary[].furtherTax','taxSummary[].extraTax','taxSummary[].taxWithheld','taxSummary[].fed','creditedInvoiceRef.fiscalInvoiceNumber']
  if cc=='IS':fields+=['customer.identityNumber','lines[].saleType','taxIncluded']
  if cc=='NO':fields+=['customer.identityNumber']
  for side in ('SALE','PURCHASE'):
   for seq,field in enumerate(fields,1):
    when={};severity='REQUIRED' if side=='SALE' else 'WARN';owner='COMPANY' if field.startswith('seller.') and side=='SALE' else 'COUNTERPARTY'
    if field=='supplyDate':when={'supplyDiffersFromInvoiceDate':True}
    if field.startswith('creditedInvoiceRef'):when={'documentKind':'CREDIT_NOTE'}
    if field=='lines[].legalText':when={'taxKinds':['ZERO','EXEMPT','REVERSE_CHARGE']}
    if field=='customer.vatNumber':when={'taxKinds':['REVERSE_CHARGE'],'intraEu':True};severity='REQUIRED' if side=='SALE' and cc in ('SE','DK','FI','*') else 'WARN'
    buyer_codes={'DK':['DK-MOMS-EU-GOODS','DK-MOMS-EU-SVC','DK-MOMS-EU-TRIANG','DK-MOMS-RC-DOM-SALE'],'SE':['SE-MOMS-EU-GOODS','SE-MOMS-EU-SVC','SE-MOMS-EU-TRIANG','SE-MOMS-RC-DOM-SALE'],'FI':['FI-ALV-EU-GOODS','FI-ALV-EU-SVC','FI-ALV-RC-CONSTR-SALE']}
    if field=='customer.vatNumber' and cc in buyer_codes:when={'taxCodes':buyer_codes[cc]};severity='REQUIRED' if side=='SALE' else 'WARN'
    if cc=='PK' and field in ('customer.taxNumber','customer.vatNumber'):when={'buyerRegistered':True};severity='REQUIRED' if side=='SALE' else 'WARN'
    if cc=='NO' and field=='customer.identityNumber':when={'taxCodes':['NO-MVA-RC-DOM-SALE']};severity='REQUIRED' if side=='SALE' else 'WARN'
    if field in ('paymentReference','seller.bank','dueDate'):severity='REQUIRED' if cc=='NO' and side=='SALE' else 'WARN'
    if field=='seller.vatNumber':when={'taxRegistered':True}
    if cc=='PK' and side=='PURCHASE' and field=='seller.vatNumber':when={'taxKinds':['INPUT']};severity='REQUIRED'
    if field.startswith('fiscal'):when={'taxRegistered':True}
    if field=='customer.cnic':when={'unregisteredBuyerAboveThreshold':True}
    if field.startswith('lines[].sro'):when={'requiresSroReference':True}
    rows.append(dict(country=cc,rule_version=VERSION,side=side,field=field,seq=seq,applies_when=json.dumps(when,separators=(',',':')),severity=severity,owner=owner,**provenance(cc)))
 return rows
RETENTION_COLS=['country','key','document_class','years','counted_from','note']+PROV
def retention_rules():
 specs=[('NO','BOOKKEEPING','','5','FY_END','Five years for all attachments. §13 items 5–8: 3 years 6 months. Norway; EEA/UK/Switzerland electronic storage with written notice and access from Norway (§7-5). From 2027-01-01 e-invoices kept in original format (LOV-2026-06-19-39).','Bokføringsloven §13; bokføringsforskriften §7-5; LOV-2026-06-19-39'),('SE','BOOKKEEPING','','7','FY_END','Seven years (verify).','Bokföringslagen retention; pack §4.1a (verify)'),('DK','BOOKKEEPING','','5','FY_END','Five years from end of fiscal year.','Bogføringsloven LOV 700/2022 §12 stk.1'),('DK','BOOKKEEPING.PROPERTY','PROPERTY','10','FY_END_OF_EVENT_YEAR','Acquisition or completion fiscal year; never shorter than legal period.','Momsbekendtgørelsen §92 stk.3; ML §§43–44'),('DK','BOOKKEEPING.TILL_ROLLS','TILL_ROLL','1','FY_END','One year from signing annual accounts.','LOV 700/2022 §12 stk.2; BEK 1435 §92 stk.1'),('FI','LEDGERS','LEDGER','10','FY_END','Financial statements, annual report, ledgers including payroll book, chart and list of ledgers.','Kirjanpitolaki 2 luku 10 §1 mom.; OVML 28 §'),('FI','VOUCHERS','VOUCHER','6','CALENDAR_YEAR_END_OF_FY','Vouchers and transaction correspondence; counted from calendar year in which FY ended. Inspectable from Finland (2:9 §).','Kirjanpitolaki 2 luku 10 §2 mom.'),('IS','BOOKKEEPING','','7','FY_END','Kept in Iceland; abroad up to six months; electronic records always accessible to authorities. Till inner rolls three years.','Lög 145/1994 20.gr.; lög 50/1988 17.gr.2.mgr.'),('PK','BOOKKEEPING','','6','FY_END','Six years; invoices/debit/credit notes STR r.150S.','STA 1990; STR Chapter XIV r.150S')]
 return [dict(country=cc,key=cc+'.RETENTION.'+key,document_class=cls,years=years,counted_from=counted,note=note,**provenance(cc,src)) for cc,key,cls,years,counted,note,src in specs]
def currencies():
 return [dict(code=cc,scale=str(scale),rounding_mode='HALF_UP',small_difference_default=small,tax_override_threshold=threshold,cash_rounding_unit=cash,**provenance('*','ISO 4217 currency scale; NeoERP default thresholds (pack §4.4)')) for cc,scale,small,threshold,cash in [('PKR',2,'100','10','1'),('NOK',2,'10','1','1'),('SEK',2,'10','1','1'),('DKK',2,'10','1','0.50'),('EUR',2,'1','0.10',''),('ISK',0,'100','10',''),('USD',2,'1','0.10',''),('GBP',2,'1','0.10','')]]
def units():
 specs=[('C62','One'),('H87','Piece'),('NPR','Number of pairs'),('KGM','Kilogram'),('GRM','Gram'),('TNE','Tonne'),('LTR','Litre'),('MLT','Millilitre'),('MTR','Metre'),('CMT','Centimetre'),('MMT','Millimetre'),('MTK','Square metre'),('MTQ','Cubic metre'),('KMT','Kilometre'),('HUR','Hour'),('MIN','Minute'),('SEC','Second'),('DAY','Day'),('WEE','Week'),('MON','Month'),('ANN','Year'),('SET','Set'),('DZN','Dozen'),('KWT','Kilowatt'),('MAW','Megawatt'),('CEL','Degree Celsius'),('KEL','Kelvin'),('KWH','Kilowatt hour'),('AMP','Ampere'),('VLT','Volt')]
 return [dict(code=code,name=name,name_local=json.dumps({'en':name},separators=(',',':')),sort_order=i,**provenance('*','UN/ECE Recommendation 20 common-code subset')) for i,(code,name) in enumerate(specs,1)]
def write_csv(target,name,columns,rows):
 with (target/name).open('w',encoding='utf-8',newline='') as f:
  w=csv.DictWriter(f,fieldnames=columns,lineterminator='\n');w.writeheader();w.writerows(rows)
def export(target=None):
 target=pathlib.Path(target) if target else ROOT/'services/accounts-service/src/main/resources/packs'/VERSION
 assert target.resolve()!=OLD.resolve(),'2026.1 is frozen'
 target.mkdir(parents=True,exist_ok=True)
 entries=[]
 def emit(name,kind,code,columns,rows):write_csv(target,name,columns,rows);entries.append((name,kind,code))
 emit('account-roles.csv','ROLES','ROLES',ROLE,roles())
 emit('account-role-countries.csv','ROLE_COUNTRIES','ROLE_COUNTRIES',['role_code','country']+PROV,[dict(role_code=role,country=cc,**provenance(cc)) for role,cc,*_ in COUNTRY_ROLES])
 templates=[dict(code=cc,kind='BASE' if cc=='BASE' else 'COUNTRY',country='' if cc=='BASE' else cc,version=VERSION,name={'BASE':'International IFRS chart','DK':'Denmark','FI':'Finland','IS':'Iceland','NO':'Norway','SE':'Sweden','PK':'Pakistan'}[cc],year_end_target_role='CURRENT_YEAR_RESULT' if cc=='SE' else 'RETAINED_EARNINGS',pl_layout='',bs_layout='',**provenance(cc)) for cc in FILES]
 emit('templates.csv','TEMPLATES','TEMPLATES',['code','kind','country','version','name','year_end_target_role','pl_layout','bs_layout']+PROV,templates)
 for cc,name in FILES.items():emit(name,'CHART',cc,CHART,chart(cc))
 codes=tax_codes();versions=tax_versions(codes)
 emit('tax-codes.csv','TAX','TAX',TAX,codes)
 emit('tax-rate-versions.csv','TAX_VERSIONS','TAX_VERSIONS',['country','code','version_no','rate','valid_from','rate_hint_filer','rate_hint_non_filer']+PROV,versions)
 emit('tax-legal-texts.csv','LEGAL_TEXTS','LEGAL_TEXTS',['country','code','lang','text']+PROV,legal_texts(codes))
 emit('country-rules.csv','COUNTRY_RULES','COUNTRY_RULES',COUNTRY_COLS,country_rules())
 emit('invoice-content-rules.csv','INVOICE_RULES','INVOICE_RULES',INVOICE_COLS,invoice_rules())
 emit('payment-reference-schemes.csv','PAYMENT_SCHEMES','PAYMENT_SCHEMES',PAYMENT_COLS,payment_schemes())
 emit('currencies.csv','CURRENCIES','CURRENCIES',['code','scale','rounding_mode','small_difference_default','tax_override_threshold','cash_rounding_unit']+PROV,currencies())
 emit('units-of-measure.csv','UNITS','UNITS',['code','name','name_local','sort_order']+PROV,units())
 emit('retention-rules.csv','RETENTION_RULES','RETENTION_RULES',RETENTION_COLS,retention_rules())
 assert (target/'schema.sql').exists(),'migration worker supplies schema.sql before manifest'
 lines=['# NeoERP accounts pack 2026.2: file kind code version sha256 (load and hash order)']
 for name,kind,code in [('schema.sql','SCHEMA','SCHEMA')]+entries:lines.append(f'{name} {kind} {code} {VERSION} {hashlib.sha256((target/name).read_bytes()).hexdigest()}')
 (target/'MANIFEST.txt').write_text('\n'.join(lines)+'\n',encoding='utf-8')
 print(json.dumps({name:sum(1 for _ in csv.DictReader((target/name).open())) for name,_,_ in entries},sort_keys=True))
 return versions
if __name__=='__main__':
 import sys
 export(sys.argv[1] if len(sys.argv)>1 else None)
