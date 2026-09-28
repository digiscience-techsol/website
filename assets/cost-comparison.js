/* Local decision aid. No provider connection, storage or test of a buyer's records. */
(function (root) {
  'use strict';
  const currencies = { INR: 'INR', USD: 'USD', GBP: 'GBP', EUR: 'EUR', units: 'currency units' };
  const gateLabels = {
    basis: 'Same currency, billing scope and accounting treatment, including shared costs, credits and taxes',
    period: 'Equivalent complete reporting periods, with the same duration',
    outcome: 'Same accepted-result definition and comparable workload mix'
  };
  const limits = 'User-entered arithmetic only. Confirmations are self-reported, not verified. No bill reconciliation, provider pricing, forecast, ROI, causal diagnosis or savings guarantee. The spend bridge uses period A unit cost for its volume component and period B accepted volume for its unit-cost component. Components are rounded separately and may differ from the displayed total by one minor currency unit. Investigate quality, workload mix, timing and allocation before making changes.';

  // Integer rational arithmetic avoids early rounding and cancellation in the spend bridge.
  function decimal(numerator, denominator, places = 2) {
    if (denominator === 0n) return null;
    if (denominator < 0n) { numerator = -numerator; denominator = -denominator; }
    const negative = numerator < 0n;
    const absolute = negative ? -numerator : numerator;
    const scale = 10n ** BigInt(places);
    const rounded = (absolute * scale * 2n + denominator) / (denominator * 2n);
    const whole = rounded / scale;
    const fraction = (rounded % scale).toString().padStart(places, '0');
    return `${negative && rounded !== 0n ? '-' : ''}${whole}${places ? '.' + fraction : ''}`;
  }
  function evaluate(input = {}) {
    const errors = [];
    const parsed = {};
    if (!Object.hasOwn(currencies, input.currency)) errors.push({ field: 'currency', message: 'Choose a listed currency label.' });
    for (const period of ['a', 'b']) {
      for (const field of ['cost', 'attempted', 'accepted']) {
        const key = period + '-' + field;
        const raw = typeof input[key] === 'string' ? input[key].trim() : '';
        const money = field === 'cost';
        const pattern = money ? /^(?:\d+(?:\.\d{1,2})?|\.\d{1,2})$/ : /^\d+$/;
        if (raw.length > 30 || !pattern.test(raw)) {
          errors.push({ field: key, message: money ? 'Enter a non-negative cost with up to two decimal places; no commas or currency symbols.' : 'Enter a whole number of results, including zero.' });
          continue;
        }
        const [whole, fraction = ''] = raw.split('.');
        const value = money ? BigInt(whole || '0') * 100n + BigInt(fraction.padEnd(2, '0')) : BigInt(raw);
        const maximum = money ? 100000000000000n : 1000000000n;
        if (value > maximum) {
          errors.push({ field: key, message: money ? 'This worksheet supports costs up to 1,000,000,000,000 per period.' : 'This worksheet supports up to 1,000,000,000 results per period.' });
          continue;
        }
        parsed[key] = value;
      }
      if (parsed[period + '-accepted'] !== undefined && parsed[period + '-attempted'] !== undefined && parsed[period + '-accepted'] > parsed[period + '-attempted']) {
        errors.push({ field: period + '-accepted', message: 'Accepted results cannot exceed attempted results in the same period.' });
      }
    }
    if (errors.length) return { valid: false, errors };
    const confirmations = Object.fromEntries(Object.keys(gateLabels).map(key => [key, input.confirmations?.[key] === true]));
    const periods = ['a', 'b'].map(key => ({
      period: key === 'a' ? 'A' : 'B',
      cost: decimal(parsed[key + '-cost'], 100n),
      attempted: Number(parsed[key + '-attempted']), accepted: Number(parsed[key + '-accepted']),
      acceptance_rate_pct: decimal(parsed[key + '-accepted'] * 100n, parsed[key + '-attempted'], 6),
      cost_per_accepted_result: decimal(parsed[key + '-cost'], parsed[key + '-accepted'] * 100n, 12)
    }));
    const reasons = Object.keys(gateLabels).filter(key => !confirmations[key]).map(key => 'Not confirmed: ' + gateLabels[key] + '.');
    if (!parsed['a-accepted'] || !parsed['b-accepted']) reasons.push('Both periods need at least one accepted result for a unit-cost comparison.');
    let metrics = null;
    if (reasons.length === 0) {
      const c0 = parsed['a-cost'], c1 = parsed['b-cost'], q0 = parsed['a-accepted'], q1 = parsed['b-accepted'];
      const volumeNumerator = (q1 - q0) * c0;
      const unitNumerator = c1 * q0 - c0 * q1;
      metrics = {
        total_cost_change: decimal(c1 - c0, 100n),
        total_cost_change_pct: decimal((c1 - c0) * 100n, c0, 6),
        accepted_result_change: Number(q1 - q0),
        accepted_result_change_pct: decimal((q1 - q0) * 100n, q0, 6),
        unit_cost_change: decimal(unitNumerator, q0 * q1 * 100n, 12),
        unit_cost_change_pct: decimal(unitNumerator * 100n, q1 * c0, 6),
        acceptance_rate_change_pp: decimal((q1 * parsed['a-attempted'] - q0 * parsed['b-attempted']) * 100n, parsed['a-attempted'] * parsed['b-attempted'], 6),
        volume_component: decimal(volumeNumerator, q0 * 100n),
        unit_cost_component: decimal(unitNumerator, q0 * 100n)
      };
    }
    return { valid: true, template: 'DigiScience two-period cost worksheet', version: '1.0',
      source: input.source === 'fictional-example' ? 'Fictional example; invented arithmetic, not customer results' : 'Entered values; not independently verified',
      currency: currencies[input.currency], confirmations, periods,
      comparison: { available: reasons.length === 0, reasons, metrics }, limits };
  }
  function csvCell(value) {
    const text = String(value ?? '');
    const safe = /^[\s\uFEFF]*[=+@-]/u.test(text) && !/^-?\d+(?:\.\d+)?$/.test(text) ? "'" + text : text;
    return '"' + safe.replaceAll('"', '""') + '"';
  }
  function csv(result) {
    if (!result.valid) throw new TypeError('Export only a valid worksheet.');
    const rows = [['Section', 'Metric', 'Value', 'Unit or context'], ['Scope', 'Source', result.source, ''], ['Scope', 'Currency', result.currency, 'No conversion performed']];
    for (const [key, value] of Object.entries(result.confirmations)) rows.push(['Confirmation', gateLabels[key], value ? (result.source.startsWith('Fictional example') ? 'Assumed for fictional example' : 'Confirmed by user') : 'Not confirmed', 'Not independently verified']);
    for (const p of result.periods) {
      rows.push([`Period ${p.period}`, 'Allocated cost', p.cost, result.currency], [`Period ${p.period}`, 'Attempted results', p.attempted, 'results'], [`Period ${p.period}`, 'Accepted results', p.accepted, 'results'], [`Period ${p.period}`, 'Acceptance rate', p.acceptance_rate_pct ?? 'Undefined: zero attempted results', 'percent'], [`Period ${p.period}`, 'Cost per accepted result', p.cost_per_accepted_result ?? 'Undefined: zero accepted results', result.currency]);
    }
    rows.push(['Comparison', 'Availability', result.comparison.available ? 'Arithmetic based on recorded assumptions' : 'Withheld', result.comparison.reasons.join(' ')]);
    if (result.comparison.metrics) {
      for (const [key, value] of Object.entries(result.comparison.metrics)) rows.push(['Comparison', key, value ?? 'Undefined: zero baseline', key.endsWith('_pct') ? 'percent' : key.endsWith('_pp') ? 'percentage points' : key === 'accepted_result_change' ? 'results' : result.currency]);
    }
    rows.push(['Method', 'Spend bridge', '(B accepted - A accepted) * A unit cost + B accepted * (B unit cost - A unit cost) = B cost - A cost', 'Arithmetic identity; not causal attribution'], ['Limits', 'Read before using', result.limits, ''], ['Template', 'Version', result.version, '']);
    return rows.map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
  }
  function display(value, suffix = '') {
    if (value === null) return 'Undefined — zero denominator';
    const parts = String(value).split('.');
    const whole = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const fraction = parts[1]?.replace(/0+$/, '');
    return whole + (fraction ? '.' + fraction : '') + suffix;
  }
  function initialize(document) {
    const worksheet = document.getElementById('cost-comparison-worksheet');
    if (!worksheet) return;
    const controls = worksheet.querySelector('[data-cost-controls]');
    const results = worksheet.querySelector('[data-cost-results]');
    const status = worksheet.querySelector('[data-cost-status]');
    const errorSummary = worksheet.querySelector('[data-cost-errors]');
    let current = null, source = 'entered-values';
    function node(tag, text, className) { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (className) e.className = className; return e; }
    function clearErrors() {
      errorSummary.replaceChildren(); errorSummary.hidden = true;
      controls.querySelectorAll('[aria-invalid]').forEach(e => e.removeAttribute('aria-invalid'));
      controls.querySelectorAll('[data-cost-field-error]').forEach(e => { e.textContent = ''; });
    }
    function invalidate() {
      const leftExample = source === 'fictional-example';
      if (leftExample) for (const key of Object.keys(gateLabels)) controls.querySelector('#cost-confirm-' + key).checked = false;
      current = null; source = 'entered-values'; results.hidden = true; clearErrors();
      status.textContent = leftExample || status.textContent.includes('Reconfirm')
        ? 'Values changed. Example assumptions were cleared. Reconfirm all three conditions for your own values before comparing periods.'
        : 'Values changed. Calculate again to update the worksheet.';
    }
    controls.addEventListener('input', invalidate);
    controls.addEventListener('change', invalidate);
    worksheet.querySelector('[data-cost-calculate]').addEventListener('click', () => {
      clearErrors(); results.hidden = true; current = null;
      const input = { currency: controls.querySelector('#cost-currency').value, source, confirmations: {} };
      for (const period of ['a', 'b']) for (const field of ['cost', 'attempted', 'accepted']) input[period + '-' + field] = controls.querySelector('#cost-' + period + '-' + field).value;
      for (const key of Object.keys(gateLabels)) input.confirmations[key] = controls.querySelector('#cost-confirm-' + key).checked;
      const evaluated = evaluate(input);
      if (!evaluated.valid) {
        errorSummary.append(node('p', 'Please correct these fields before calculating:'));
        const list = node('ul');
        for (const error of evaluated.errors) {
          const target = controls.querySelector('#cost-' + error.field);
          target.setAttribute('aria-invalid', 'true');
          controls.querySelector('#cost-error-' + error.field).textContent = error.message;
          const item = node('li'); const link = node('a', (target.labels?.[0]?.textContent.trim() || 'Currency') + ': ' + error.message);
          link.href = '#cost-' + error.field; link.addEventListener('click', event => { event.preventDefault(); target.focus(); }); item.append(link); list.append(item);
        }
        errorSummary.append(list); errorSummary.hidden = false; errorSummary.focus();
        status.textContent = 'No result calculated. Correct the highlighted fields.'; return;
      }
      current = evaluated;
      worksheet.querySelector('[data-cost-source]').textContent = current.source;
      const body = worksheet.querySelector('[data-cost-periods]'); body.replaceChildren();
      for (const p of current.periods) {
        const row = node('tr'); const heading = node('th', `Period ${p.period}`); heading.scope = 'row'; row.append(heading);
        for (const value of [display(p.cost, ' ' + current.currency), display(p.attempted), display(p.accepted), display(p.acceptance_rate_pct, '%'), display(p.cost_per_accepted_result, ' ' + current.currency)]) row.append(node('td', value));
        body.append(row);
      }
      const assumptions = worksheet.querySelector('[data-cost-confirmations]'); assumptions.replaceChildren(...Object.entries(current.confirmations).map(([key, value]) => node('li', `${value ? (source === 'fictional-example' ? 'Assumed for fictional example' : 'Confirmed by user') : 'Not confirmed'}: ${gateLabels[key]}.`)));
      const comparison = worksheet.querySelector('[data-cost-comparison]'); comparison.replaceChildren();
      if (!current.comparison.available) {
        comparison.append(node('h4', 'Comparison withheld'));
        const ul = node('ul'); ul.append(...current.comparison.reasons.map(reason => node('li', reason))); comparison.append(ul);
        comparison.append(node('p', 'The period figures above are arithmetic on your entries only. Resolve the missing conditions before comparing them.'));
      } else {
        comparison.append(node('h4', 'Arithmetic comparison based on recorded assumptions'));
        const m = current.comparison.metrics;
        const rows = [
          ['Total allocated cost change', display(m.total_cost_change, ' ' + current.currency) + ' (' + (m.total_cost_change_pct === null ? 'percentage undefined: zero A cost' : display(m.total_cost_change_pct, '%')) + ')'],
          ['Accepted-result change', display(m.accepted_result_change) + ' (' + display(m.accepted_result_change_pct, '%') + ')'],
          ['Cost-per-accepted-result change', display(m.unit_cost_change, ' ' + current.currency) + ' (' + (m.unit_cost_change_pct === null ? 'percentage undefined: zero A unit cost' : display(m.unit_cost_change_pct, '%')) + ')'],
          ['Acceptance-rate change', display(m.acceptance_rate_change_pp, ' percentage points')],
          ['Volume component — at period A unit cost', display(m.volume_component, ' ' + current.currency)],
          ['Unit-cost component — at period B accepted volume', display(m.unit_cost_component, ' ' + current.currency)]
        ];
        const dl = node('dl', undefined, 'cost-metrics'); for (const [label, value] of rows) { const item = node('div'); item.append(node('dt', label), node('dd', value)); dl.append(item); } comparison.append(dl);
        comparison.append(node('p', 'The last two components explain the arithmetic change in the entered totals. A negative component is not proven savings, and a lower unit cost does not prove better quality. The split depends on the disclosed baseline convention; rounding can create a one-minor-unit difference.'));
      }
      results.hidden = false; worksheet.querySelector('[data-cost-result-title]').focus();
      status.textContent = current.comparison.available ? 'Worksheet calculated. Comparison uses recorded assumptions, not verified cost or quality evidence.' : 'Period figures calculated. Cross-period comparison withheld; review the listed conditions.';
    });
    worksheet.querySelector('[data-cost-example]').addEventListener('click', () => {
      const example = { 'a-cost': '120000', 'a-attempted': '10000', 'a-accepted': '8000', 'b-cost': '165000', 'b-attempted': '15000', 'b-accepted': '12000' };
      for (const [key, value] of Object.entries(example)) controls.querySelector('#cost-' + key).value = value;
      controls.querySelector('#cost-currency').value = 'INR';
      for (const key of Object.keys(gateLabels)) controls.querySelector('#cost-confirm-' + key).checked = true;
      current = null; source = 'fictional-example'; results.hidden = true; clearErrors();
      status.textContent = 'Fictional example loaded. Equal periods, cost basis and acceptance rules are assumed for this invented example. Select Calculate to inspect it.';
      worksheet.querySelector('[data-cost-calculate]').focus();
    });
    worksheet.querySelector('[data-cost-reset]').addEventListener('click', () => {
      for (const field of controls.querySelectorAll('input[type="number"]')) field.value = '';
      for (const field of controls.querySelectorAll('input[type="checkbox"]')) field.checked = false;
      controls.querySelector('#cost-currency').value = 'INR'; current = null; source = 'entered-values'; results.hidden = true; clearErrors();
      status.textContent = 'Reset. Values are blank, confirmations are unchecked, and no worksheet is saved.'; controls.querySelector('#cost-a-cost').focus();
    });
    worksheet.querySelector('[data-cost-download]').addEventListener('click', () => {
      if (!current) return;
      const url = URL.createObjectURL(new Blob([csv(current)], { type: 'text/csv;charset=utf-8' }));
      const link = node('a'); link.href = url; link.download = 'digiscience-two-period-cost-worksheet.csv'; document.body.append(link); link.click(); link.remove(); root.setTimeout(() => URL.revokeObjectURL(url), 1000);
      status.textContent = 'CSV download requested. Keep its assumptions and limits with the figures.';
    });
    worksheet.querySelector('[data-cost-print]').addEventListener('click', () => { if (current) root.print(); });
    controls.hidden = false;
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { evaluate, csv, csvCell, decimal };
  if (root.document) initialize(root.document);
})(typeof window !== 'undefined' ? window : globalThis);
