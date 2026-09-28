import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { buildPlan, toCSV, toJSON, csvCell } = require('../assets/governance-test-planner.js');
const choices = ['yes', 'no', 'unknown'];
const all = { retrieval: 'yes', actions: 'yes', reuse: 'yes' };

// Independent RFC-style reader: quoted newlines, quotes and commas must survive export.
function parseCSV(source) {
  const rows = []; let row = [], cell = '', quoted = false;
  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === '"') {
      if (quoted && source[i + 1] === '"') { cell += '"'; i += 1; }
      else quoted = !quoted;
    } else if (!quoted && ch === ',') { row.push(cell); cell = ''; }
    else if (!quoted && ch === '\r' && source[i + 1] === '\n') {
      row.push(cell); rows.push(row); row = []; cell = ''; i += 1;
    } else cell += ch;
  }
  assert.equal(quoted, false, 'CSV quotes balance');
  assert.equal(cell, '', 'all rows end consistently');
  return rows;
}

test('all 27 workflows preserve unrun evidence fields and conservative unknown cases', () => {
  for (const retrieval of choices) for (const actions of choices) for (const reuse of choices) {
    const input = { retrieval, actions, reuse };
    const plan = buildPlan(input);
    assert.deepEqual(plan.selections, input);
    assert.equal(plan.tests.length, 3 + (retrieval === 'no' ? 0 : 4) + (actions === 'no' ? 0 : 3) + (reuse === 'no' ? 0 : 2));
    assert.equal(new Set(plan.tests.map(row => row.id)).size, plan.tests.length);
    for (const check of plan.tests) {
      assert.equal(check.status, 'Not run');
      for (const field of ['agreed_boundary', 'evidence_reference', 'observed_outcome', 'owner', 'reviewer', 'reviewed_date', 'next_action']) assert.equal(check[field], '');
      assert.ok(check.synthetic_input && check.proposed_boundary && check.evidence_to_inspect && check.suggested_review_roles);
    }
    for (const [index, value] of Object.values(input).entries()) {
      assert.match(plan.assumptions[index].follow_up, value === 'unknown' ? /Confirm this boundary/ : value === 'no' ? /Self-reported absence/ : /before running/);
    }
    assert.equal(Object.hasOwn(plan, 'score'), false);
    assert.equal(Object.hasOwn(plan, 'ready'), false);
  }
});

test('unknown keeps the same test cases as yes; no only removes its relevant category', () => {
  const baseline = buildPlan(all).tests.map(row => row.id);
  for (const topic of Object.keys(all)) {
    assert.deepEqual(buildPlan({ ...all, [topic]: 'unknown' }).tests.map(row => row.id), baseline);
    const omittedPrefix = { retrieval: 'ACCESS-', actions: 'ACTION-', reuse: 'REUSE-' }[topic];
    assert.deepEqual(buildPlan({ ...all, [topic]: 'no' }).tests.map(row => row.id), baseline.filter(id => !id.startsWith(omittedPrefix)));
  }
  assert.deepEqual(buildPlan({ retrieval: 'no', actions: 'no', reuse: 'no' }).tests.map(row => row.id), ['SCOPE-01', 'EVIDENCE-01', 'CONTENT-01']);
});

test('review scenarios inspect enforcement and effects, not just model refusal', () => {
  const rows = Object.fromEntries(buildPlan(all).tests.map(row => [row.id, row]));
  assert.match(rows['ACCESS-02'].proposed_boundary, /context/);
  assert.match(rows['ACCESS-03'].proposed_boundary, /does not fall back to broad shared access/);
  assert.match(rows['ACCESS-04'].evidence_to_inspect, /Permission-change time/);
  assert.match(rows['ACTION-02'].synthetic_input, /missing, denied and expired/);
  assert.match(rows['ACTION-03'].proposed_boundary, /do not assume exactly-once delivery/);
  assert.match(rows['REUSE-02'].synthetic_input, /existing conversation/);
});

test('fresh builds are deterministic and do not inherit previously filled evidence', () => {
  const first = buildPlan(all);
  const expected = toJSON(first);
  first.tests[0].status = 'Pass'; first.tests[0].owner = 'Example'; first.selections.retrieval = 'no';
  assert.equal(toJSON(buildPlan(all)), expected);
  assert.deepEqual(all, { retrieval: 'yes', actions: 'yes', reuse: 'yes' });
});

test('reject missing, unexpected or non-enumerated input instead of accepting free text', () => {
  for (const input of [null, {}, { ...all, actions: 'YES' }, { ...all, actions: '=HYPERLINK("x")' }, { ...all, email: 'person@example.test' }]) {
    assert.throws(() => buildPlan(input), TypeError);
  }
});

test('CSV and JSON retain every row, assumptions, blank result fields and limitations', () => {
  const plan = buildPlan({ retrieval: 'unknown', actions: 'yes', reuse: 'no' });
  const json = JSON.parse(toJSON(plan));
  assert.deepEqual(json, plan);
  const [header, ...records] = parseCSV(toCSV(plan));
  assert.equal(records.length, plan.tests.length);
  for (const [index, values] of records.entries()) {
    assert.equal(values.length, header.length);
    const row = Object.fromEntries(header.map((key, col) => [key, values[col]]));
    for (const [key, value] of Object.entries(plan.tests[index])) assert.equal(row[key], value);
    assert.match(row.assumptions, /Not sure/); assert.match(row.assumptions, /Self-reported absence/);
    assert.equal(row.limits, plan.limits);
    assert.equal(row.template_version, plan.version);
    assert.equal(row.references.split('\n').length, 3);
  }
});

test('CSV quotation and spreadsheet formula defense survive commas, quotes and newlines', () => {
  const ordinary = 'A "quoted" boundary, with\na second line';
  assert.equal(parseCSV(csvCell(ordinary) + '\r\n')[0][0], ordinary);
  for (const unsafe of ['=1+1', '+SUM(A1)', '-1+2', '@SUM(A1)', '\t=HYPERLINK("x")', '\r\n+1', '  =1', '\uFEFF=1']) {
    assert.equal(parseCSV(csvCell(unsafe) + '\r\n')[0][0], "'" + unsafe);
  }
});

test('page keeps static guidance and safe progressive enhancement without a lead form', () => {
  const html = readFileSync(new URL('../proof-assets/responsible-ai-governance-checklist.html', import.meta.url), 'utf8');
  const section = html.split('id="governance-planner"')[1].split('<section class="section"><div class="container asset-card"><h2>Use this checklist')[0];
  assert.match(section, /fictional HR policy assistant/);
  assert.match(section, /<noscript>/);
  assert.match(section, /data-planner-controls hidden/);
  assert.equal((section.match(/<fieldset>/g) || []).length, 3);
  assert.equal((section.match(/type="radio"/g) || []).length, 9);
  assert.doesNotMatch(section, /<form|type="(?:text|email)"/);
  assert.match(section, /role="status" aria-live="polite"/);
  assert.match(section, /href="\/solution-assessment"/);
});
