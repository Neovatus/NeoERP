// ACC-230: execute the rig's real pure functions against synthetic, isolated state.
// Run from any directory: node /absolute/path/to/rig-regression.cjs
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../../..');
const override = process.argv.indexOf('--source');
const file = override < 0 ? path.join(root, 'NeoERP-App/docs/design/screen-rig/accounts-bc.jsx') : process.argv[override + 1];
const source = fs.readFileSync(file, 'utf8');
const names = ['bcDoc', 'bcMon', 'bcCalcLine', 'bcTotals', 'bcMonTotals', 'bcSrcUsed', 'bcCredits', 'bcAdvances', 'bcPostMoney', 'bcReverseMoney', 'bcOpen'];
if (source.includes('function bcAdjustmentTotal(')) names.push('bcAdjustmentTotal');
const functions = names.map(name => {
  const start = source.indexOf(`function ${name}(`);
  assert(start >= 0, `missing ${name}`);
  return source.slice(start, source.indexOf('\n}', start) + 2);
}).join('\n');
// Stub only unrelated UI/environment seams. Money/availability/post/reversal functions are extracted unchanged.
const seams = `
const BC_Z=0n, BC_E2=100n, BC_E4=10000n, BC_E6=1000000n; let BC_K=0, number=0, store, code=null;
const BC_NOTAX=['ZERO','EXEMPT','OUT_OF_SCOPE'];
const BC_SERIES={RECEIPT:'RCT',PAYMENT:'PAY',REFUND:'RFD',SREFUND:'SRF'}, BC_JTYPE={};
const bcDiv=(n,d)=>{const neg=n<0n,a=neg?-n:n,q=(a*2n+d)/(d*2n);return neg?-q:q;};
const bcB=n=>BigInt(Math.round(n*100)), bcPad6=n=>String(n).padStart(6,'0');
const bcAl=(kind,from,ref,amount,date,by,extra)=>Object.assign({id:'a'+(++BC_K),kind,from,ref,amount:bcB(amount),date,by},extra||{});
const bcStore=()=>store, bcNext=(cid,p)=>p+'-'+(++number), bcFyLabel=()=>2026, bcRole=()=> 'DISCOUNT';
const ajNow=()=>new Date('2026-10-01T00:00:00Z'), bcTl=()=>{}, bcCode=()=>code;
const bcDebit=d=>d.status==='POSTED'&&(d.kind==='INV'||d.kind==='BILL');
globalThis.setStore=s=>{store=s;}; globalThis.setCode=c=>{code=c;};
`;
const context = vm.createContext({});
vm.runInContext(seams + functions + `\nglobalThis.api={${names.join(',')}};`, context);
const a = context.api;
let passed = 0, failed = 0;
function test(name, run) { try { run(); passed++; console.log(`PASS ${name}`); } catch (e) { failed++; console.log(`FAIL ${name}: ${e.message}`); } }
const date = new Date('2026-10-01T00:00:00Z');
const actor = {nm:'Approver'};
const credits = s => a.bcCredits('c', s, 'p').reduce((sum,c)=>sum+c.left,0n);
function discount(area) {
  context.setCode(null);
  const invoice = a.bcDoc({id:'invoice',area,kind:area==='ar'?'INV':'BILL',party:'p',number:'DOC-1',date,lines:[{q:10000n,p:1000000n}]});
  const money = a.bcMon({id:'money',area,kind:area==='ar'?'RECEIPT':'PAYMENT',party:'p',amount:9800n,date,settles:[{doc:invoice.id,amount:9800n,disc:200n}]});
  const s={docs:[invoice],money:[money],parties:[]}; context.setStore(s); a.bcPostMoney('c',money,actor,false);
  return {s,invoice,money,note:s.docs.find(d=>d.subtype==='SETTLEMENT_DISCOUNT')};
}
test('BC-R1 payment 1010 includes fee10, bill1000 -> zero left',()=>assert.equal(a.bcMonTotals({kind:'PAYMENT',amount:101000n,adj:[{kind:'BANK_FEE',amount:1000n}],settles:[{amount:100000n}]}).left,0n));
test('BC-R1 receipt990 plus fee10, invoice1000 -> zero left',()=>assert.equal(a.bcMonTotals({kind:'RECEIPT',amount:99000n,adj:[{kind:'BANK_FEE',amount:1000n}],settles:[{amount:100000n}]}).left,0n));
test('BC-R1 payment bank fee subtracts; settling adjustment adds',()=>assert.equal(a.bcMonTotals({kind:'PAYMENT',amount:9900n,adj:[{kind:'BANK_FEE',amount:100n},{kind:'ROUNDING',amount:200n}],settles:[{amount:10000n}]}).left,0n));
for(const area of ['ar','ap']) {
 test(`BC-R2 ${area}: 98+discount2 settles100, no spare credit`,()=>{const {s,invoice}=discount(area);assert.equal(a.bcOpen('c',invoice),0n);assert.equal(credits(s),0n);});
 test(`BC-R2 ${area}: generated note is its own allocation source`,()=>{const {invoice,note}=discount(area);assert(note);assert.equal(invoice.alloc.filter(x=>x.from===note.id&&!x.undone).reduce((n,x)=>n+x.amount,0n),200n);});
 test(`BC-R2 ${area}: undo money allocation restores98, not discount twice`,()=>{const {s,invoice,money,note}=discount(area);invoice.alloc.filter(x=>x.from===money.id).forEach(x=>x.undone={at:date});assert.equal(a.bcOpen('c',invoice),9800n);assert.equal(credits(s),9800n);assert.equal(a.bcSrcUsed(s,note.id),200n);});
 test(`BC-R2 ${area}: undo note allocation offers its2 once`,()=>{const {s,invoice,note}=discount(area);const allocation=invoice.alloc.find(x=>x.from===note.id);assert(allocation);allocation.undone={at:date};assert.equal(a.bcOpen('c',invoice),200n);assert.equal(credits(s),200n);allocation.undone={at:date};assert.equal(credits(s),200n);});
 test(`BC-R2 ${area}: reversal keeps issued note allocated with warning`,()=>{const {s,invoice,money,note}=discount(area);a.bcReverseMoney('c',money,actor,'Bank reversal');assert.equal(note.status,'POSTED');assert.equal(a.bcOpen('c',invoice),9800n);assert.equal(credits(s),0n);assert.equal(money.reversalWarnings[0].code,'SETTLEMENT_DISCOUNT_STAYS');assert.equal(money.reversalWarnings[0].notes[0].id,note.id);});
}
function advance(refund={}) {
 const m=a.bcMon({id:'adv',kind:'ADVANCE',area:'ap',party:'p',amount:10000n});
 const r=a.bcMon({id:'refund',kind:'SREFUND',area:'ap',party:'p',amount:10000n,advParts:[{id:'adv',amount:10000n}],...refund});
 const s={docs:[],money:[m,r],parties:[]};context.setStore(s);return {s,m,r};
}
const advanceLeft=s=>a.bcAdvances(s,'p').reduce((n,x)=>n+x.open,0n);
test('BC-R3 posted supplier refund consumes100',()=>assert.equal(advanceLeft(advance().s),0n));
test('BC-R3 reversal restores100',()=>{const {s,r}=advance();a.bcReverseMoney('c',r,actor,'Returned');assert.equal(advanceLeft(s),10000n);});
test('BC-R3 another party cannot consume advance',()=>assert.equal(advanceLeft(advance({party:'other'}).s),10000n));
test('BC-R3 opposite area cannot consume advance',()=>assert.equal(advanceLeft(advance({area:'ar'}).s),10000n));
test('BC-R3 pending refund does not consume advance',()=>assert.equal(advanceLeft(advance({status:'SUBMITTED'}).s),10000n));
test('BC-R3 wrong refund kind does not consume supplier advance',()=>assert.equal(advanceLeft(advance({kind:'REFUND'}).s),10000n));
test('BC-R3 customer advance refund still works',()=>{const {s,m,r}=advance({area:'ar',kind:'REFUND'});m.area='ar';assert.equal(advanceLeft(s),0n);});
for (const [percent,want] of [[0,0n],[50,1250n],[100,2500n],[12.5,313n]]) test(`BC-R4 deductible${percent}% of tax25`,()=>{context.setCode({kind:'INPUT',rate:25,ded:percent});const c=a.bcCalcLine('c',{q:10000n,p:1000000n,tax:'INPUT'});assert.equal(c.ded,want);assert.equal(c.nonded,2500n-want);});
test('BC-R4 absent deduction defaults to100%',()=>{context.setCode({kind:'INPUT',rate:25});assert.equal(a.bcCalcLine('c',{q:10000n,p:1000000n,tax:'INPUT'}).ded,2500n);});
if(override<0) {
 test('embedded B/C source equals standalone',()=>{const html=fs.readFileSync(path.join(root,'NeoERP-App/docs/design/screen-rig/app.html'),'utf8');assert.equal(html.match(/<script[^>]*data-file="accounts-bc\.jsx"[^>]*>([\s\S]*?)<\/script>/)[1].trim(),source.trim());});
 test('editor uses signed fees; reversal warning rendered',()=>{assert(source.includes('bcAdjustmentTotal(adjs.map'));assert(source.includes('title="Settlement discount stays"'));assert(source.includes('total - discSum; const o'));});
}
console.log(`RESULT ${passed} passed, ${failed} failed`);
process.exitCode=failed?1:0;
