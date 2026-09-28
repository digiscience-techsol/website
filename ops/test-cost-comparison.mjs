import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const {evaluate, csv, csvCell, decimal} = createRequire(import.meta.url)('../assets/cost-comparison.js');
const sample = () => ({currency:'INR','a-cost':'120000','a-attempted':'10000','a-accepted':'8000','b-cost':'165000','b-attempted':'15000','b-accepted':'12000', confirmations:{basis:true,period:true,outcome:true},source:'fictional-example'});
let count=0;
function test(name, fn){fn();count++;console.log('PASS '+name);}
test('fictional worked example: exact units, percentages and arithmetic components',()=>{
 const r=evaluate(sample()); assert.equal(r.valid,true); assert.equal(r.periods[0].cost_per_accepted_result,'15.000000000000');assert.equal(r.periods[1].cost_per_accepted_result,'13.750000000000');
 assert.deepEqual(r.comparison.metrics,{total_cost_change:'45000.00',total_cost_change_pct:'37.500000',accepted_result_change:4000,accepted_result_change_pct:'50.000000',unit_cost_change:'-1.250000000000',unit_cost_change_pct:'-8.333333',acceptance_rate_change_pp:'0.000000',volume_component:'60000.00',unit_cost_component:'-15000.00'});
});
test('lower spend may still mean worse unit economics',()=>{
 const r=evaluate({...sample(),'a-cost':'12000','a-attempted':'4000','a-accepted':'3000','b-cost':'10000','b-attempted':'4000','b-accepted':'2000'});
 assert.equal(r.periods[0].cost_per_accepted_result,'4.000000000000'); assert.equal(r.periods[1].cost_per_accepted_result,'5.000000000000');
 for(const [k,v] of Object.entries({total_cost_change:'-2000.00',total_cost_change_pct:'-16.666667',accepted_result_change_pct:'-33.333333',unit_cost_change_pct:'25.000000',acceptance_rate_change_pp:'-25.000000',volume_component:'-4000.00',unit_cost_component:'2000.00'})) assert.equal(r.comparison.metrics[k],v);
});
test('each of three comparability gates is required independently',()=>{
 for(let mask=0;mask<8;mask++){const r=evaluate({...sample(),confirmations:{basis:!!(mask&1),period:!!(mask&2),outcome:!!(mask&4)}}); assert.equal(r.comparison.available,mask===7);if(mask!==7)assert.equal(r.comparison.metrics,null);}
});
test('zero denominators retain period values and withhold unsupported comparisons',()=>{
 for(const p of ['a','b']){const r=evaluate({...sample(),[p+'-attempted']:'0',[p+'-accepted']:'0'}); assert.equal(r.comparison.available,false);assert.equal(r.periods[p==='a'?0:1].acceptance_rate_pct,null);assert.equal(r.periods[p==='a'?0:1].cost_per_accepted_result,null);}
 const r=evaluate({...sample(),'a-cost':'0'});assert.equal(r.comparison.available,true);assert.equal(r.comparison.metrics.total_cost_change_pct,null);assert.equal(r.comparison.metrics.unit_cost_change_pct,null);assert.equal(r.comparison.metrics.total_cost_change,'165000.00');
});
test('invalid values never yield plausible results',()=>{
 for(const bad of ['', '-1','NaN','Infinity','1e3','1,000','1000000000001','0.001','9'.repeat(200)])assert.equal(evaluate({...sample(),'a-cost':bad}).valid,false,bad);
 for(const bad of ['-1','1.2','1e3','1000000001',''])assert.equal(evaluate({...sample(),'a-attempted':bad}).valid,false,bad);
 assert.equal(evaluate({...sample(),'a-accepted':'10001'}).valid,false);assert.equal(evaluate({...sample(),currency:'<script>'}).valid,false);assert.equal(evaluate().valid,false);
});
test('extreme valid inputs retain exact small differences; rounding boundaries disclosed',()=>{
 const r=evaluate({...sample(),'a-cost':'999999999999.99','b-cost':'1000000000000','a-attempted':'1000000000','b-attempted':'1000000000','a-accepted':'1000000000','b-accepted':'1000000000'});assert.equal(r.comparison.metrics.total_cost_change,'0.01');assert.equal(r.comparison.metrics.unit_cost_change,'0.000000000010');assert.equal(r.comparison.metrics.unit_cost_component,'0.01');
 assert.equal(decimal(1n,200n), '0.01');assert.equal(decimal(-1n,200n),'-0.01');assert.equal(decimal(0n,0n),null);
 const tiny=evaluate({...sample(),'a-cost':'.01','a-attempted':'2','a-accepted':'2','b-cost':'.02','b-attempted':'3','b-accepted':'3'});assert.equal(tiny.comparison.metrics.volume_component,'0.01');assert.equal(tiny.comparison.metrics.unit_cost_component,'0.01');assert.equal(tiny.comparison.metrics.total_cost_change,'0.01');assert.match(tiny.limits,/one minor currency unit/);
});
test('CSV contains provenance, withheld conditions, undefined values and safe numeric cells',()=>{
 const r=evaluate(sample()); const text=csv(r);assert.match(text,/Assumed for fictional example/);assert.match(text,/"-15000.00"/);assert.doesNotMatch(text,/"'-15000.00"/);assert.match(text,/not causal attribution/);
 const blocked=csv(evaluate({...sample(),'a-accepted':'0',confirmations:{}}));assert.match(blocked,/Withheld/);assert.match(blocked,/Undefined: zero accepted results/);assert.match(blocked,/Not confirmed/);assert.doesNotMatch(blocked,/"unit_cost_change"/);
 for(const attack of ['=1+1','+CMD',' @SUM(A1)','-1+2'])assert.ok(csvCell(attack).startsWith('"\''));assert.equal(csvCell('-1.25'),'"-1.25"');assert.equal(csvCell('a,"b"'),'"a,""b"""');assert.throws(()=>csv({valid:false}));
});
test('progressive static page supplies method, fictional example, limits and accessible controls',()=>{
 const html=readFileSync(new URL('../guides/ai-cloud-cost-control/index.html',import.meta.url),'utf8'); const section=html.split('<section class="section cost-worksheet"')[1].split('</section>')[0];assert.equal((section.match(/type="number"/g)||[]).length,6);assert.equal((section.match(/type="checkbox"/g)||[]).length,3);assert.doesNotMatch(section,/<form|type="text"|type="email"/);assert.match(section,/<noscript>/);assert.match(section,/fictional/i);assert.match(section,/60,000/);assert.match(section,/15,000/);assert.match(section,/not.*savings/i);assert.match(section,/role="region"/);assert.match(html,/href="#cost-comparison-worksheet"/);
});
console.log(`${count} cost comparison tests passed.`);
