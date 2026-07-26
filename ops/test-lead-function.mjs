#!/usr/bin/env node
import assert from 'node:assert/strict';
import { onRequest } from '../functions/api/lead.js';

const productionOrigin = 'https://digisciencetechsol.com';
const previewOrigin = 'https://agent-lead-delivery-measurement.digisciencetechsol-org-website.pages.dev';

const validPayload = {
  fullName: 'Milestone 1 Delivery Verification (Internal Test)',
  businessEmail: 'milestone1-delivery-test@digisciencetechsol.invalid',
  company: 'DigiScience Internal Test — Do Not Treat as Customer',
  businessProblem: 'CONTROLLED INTERNAL TEST: verify that the lead endpoint only confirms success after a durable delivery channel accepts the record.',
  aiInterestArea: 'DigiScience Solution Assessment',
  timeline: 'Exploring',
  consent: true,
  internalTest: true
};

const makeRequest = (method, payload, origin = productionOrigin) => new Request(
  'https://digisciencetechsol.com/api/lead',
  {
    method,
    headers: {
      origin,
      'content-type': 'application/json'
    },
    body: payload ? JSON.stringify(payload) : undefined
  }
);

const readJson = async (response) => ({
  status: response.status,
  body: await response.json()
});

{
  const response = await onRequest({
    request: makeRequest('OPTIONS', null, previewOrigin),
    env: {}
  });
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('access-control-allow-origin'), previewOrigin);
}

{
  const response = await onRequest({
    request: makeRequest('POST', validPayload, 'https://untrusted.example'),
    env: {}
  });
  assert.equal(response.status, 403);
}

{
  const { status, body } = await readJson(await onRequest({
    request: makeRequest('POST', validPayload),
    env: {}
  }));
  assert.equal(status, 503);
  assert.equal(body.ok, false);
  assert.equal(body.delivery.accepted, false);
  assert.deepEqual(body.delivery.channels, {
    storage: false,
    webhook: false,
    email: false
  });
}

{
  const writes = [];
  const env = {
    LEADS_KV: {
      put: async (key, value, options) => {
        writes.push({ key, value: JSON.parse(value), options });
      }
    }
  };
  const { status, body } = await readJson(await onRequest({
    request: makeRequest('POST', validPayload),
    env
  }));

  assert.equal(status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.testSubmission, true);
  assert.equal(body.delivery.accepted, true);
  assert.deepEqual(body.delivery.channels, {
    storage: true,
    webhook: false,
    email: false
  });
  assert.equal(writes.length, 1);
  assert.equal(writes[0].value.status, 'Internal Test');
  assert.equal(writes[0].value.lead.isInternalTest, true);
  assert.match(writes[0].value.lead.businessProblem, /^CONTROLLED INTERNAL TEST:/);
}

{
  const originalFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url: String(url), options });
    return new Response(null, { status: 202 });
  };

  try {
    const env = {
      LEADS_KV: {
        put: async () => {
          throw new Error('KV unavailable in test');
        }
      },
      RESEND_API_KEY: 'test-key',
      LEAD_NOTIFICATION_FROM: 'Website <website@example.test>',
      LEAD_NOTIFICATION_TO: 'lead-operations@example.test'
    };
    const { status, body } = await readJson(await onRequest({
      request: makeRequest('POST', validPayload),
      env
    }));

    assert.equal(status, 200);
    assert.equal(body.delivery.accepted, true);
    assert.deepEqual(body.delivery.channels, {
      storage: false,
      webhook: false,
      email: true
    });
    assert.equal(requests.length, 1);
    const emailPayload = JSON.parse(requests[0].options.body);
    assert.match(emailPayload.subject, /^\[INTERNAL TEST — DO NOT TREAT AS CUSTOMER\]/);
    assert.match(emailPayload.text, /^INTERNAL TEST — DO NOT TREAT AS A CUSTOMER ENQUIRY/);
  } finally {
    globalThis.fetch = originalFetch;
  }
}

console.log('Validated lead delivery acknowledgement, preview CORS, internal-test labeling, and channel fallback behavior.');
