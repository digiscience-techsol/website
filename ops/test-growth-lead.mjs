import assert from 'node:assert/strict';
import fs from 'node:fs';
import {webcrypto} from 'node:crypto';
globalThis.crypto ||= webcrypto;
const source=fs.readFileSync(new URL('../functions/api/lead.js',import.meta.url),'utf8');
const {onRequest}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const lead={name:'Synthetic QA',email:'qa@example.invalid',company:'Synthetic company',businessProblem:'Synthetic form behavior test only',consent:'yes',sourcePage:'/contact?email=private',serviceId:'manufacturing-ai'};
let calls=[];
globalThis.fetch=async (url,options)=>{calls.push({url,options});return new Response('{}',{status:200});};
async function post(payload=lead,env={},extra={}) {
 const native=extra.native;
 const origin=extra.origin||'https://digisciencetechsol.com';
 const request=new Request((extra.url||origin)+'/api/lead',{method:'POST',headers:{origin,accept:native?'text/html':'application/json','content-type':native?'application/x-www-form-urlencoded':'application/json',referer:'https://digisciencetechsol.com/contact?email=private'},body:native?new URLSearchParams(payload):JSON.stringify(payload)});
 return onRequest({request,env});
}
let passed=0;
async function test(name,fn){calls=[];await fn();passed++;console.log('PASS',name);}
await test('no destination cannot report success',async()=>{const r=await post();assert.equal(r.status,503);assert.equal((await r.json()).delivery.accepted,false)});
await test('invalid input does not call external services',async()=>{const r=await post({...lead,email:'invalid'},{LEAD_WEBHOOK_URL:'https://mock.invalid'});assert.equal(r.status,400);assert.equal(calls.length,0)});
await test('storage accepts a lead and preserves service context without query data',async()=>{let record;const r=await post(lead,{LEADS_KV:{put:async(id,json)=>{record=JSON.parse(json)}}});const d=await r.json();assert.equal(d.delivery.accepted,true);assert.equal(record.lead.serviceId,'manufacturing-ai');assert.equal(record.lead.sourcePage,'/contact');assert.equal(record.lead.referrer,'https://digisciencetechsol.com');assert.ok(record.leadId);assert.equal(d.leadScore,undefined)});
await test('storage failure cannot suppress webhook acceptance',async()=>{const r=await post(lead,{LEADS_KV:{put:async()=>{throw Error('mock')}},LEAD_WEBHOOK_URL:'https://mock.invalid'});assert.equal((await r.json()).delivery.accepted,true);assert.equal(calls.length,1)});
await test('all rejected channels cannot report success',async()=>{globalThis.fetch=async()=>new Response('{}',{status:503});const r=await post(lead,{LEAD_WEBHOOK_URL:'https://mock.invalid'});assert.equal(r.status,503)});
await test('email provider failure does not suppress the other provider',async()=>{globalThis.fetch=async(url)=>{if(url.includes('microsoftonline'))throw Error('mock');return new Response('{}',{status:200})};const r=await post(lead,{MICROSOFT_TENANT_ID:'test',MICROSOFT_GRAPH_CLIENT_ID:'test',MICROSOFT_GRAPH_CLIENT_SECRET:'test',LEAD_NOTIFICATION_FROM:'test@example.invalid',LEAD_NOTIFICATION_TO:'test@example.invalid',RESEND_API_KEY:'test'});assert.equal((await r.json()).delivery.accepted,true)});
await test('native POST redirects without personal details',async()=>{const r=await post(lead,{LEADS_KV:{put:async()=>{}}},{native:true});assert.equal(r.status,303);assert.equal(r.headers.get('location'),'/thank-you?type=enquiry');assert.equal(r.headers.get('cache-control'),'no-store')});
await test('native rejected POST has usable static feedback without reflecting personal data',async()=>{const r=await post({...lead,name:'<script>secret</script>'},{},{native:true});assert.equal(r.status,503);const html=await r.text();assert.ok(html.includes('Back button'));assert.ok(!html.includes('secret'));assert.equal(r.headers.get('referrer-policy'),'no-referrer')});
await test('same-project preview works',async()=>{const r=await post(lead,{LEADS_KV:{put:async()=>{}}},{origin:'https://test.digisciencetechsol-org-website.pages.dev'});assert.equal(r.status,200)});
await test('unrelated preview is rejected',async()=>{const r=await post(lead,{LEADS_KV:{put:async()=>{}}},{origin:'https://attacker.pages.dev'});assert.equal(r.status,403)});
console.log(`${passed} isolated lead-endpoint tests passed; no real network calls or leads.`);
