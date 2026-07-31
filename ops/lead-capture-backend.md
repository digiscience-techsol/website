# Lead Capture Backend

## Current Website Path

All website lead forms submit JSON to the same-origin Cloudflare Pages Function:

- client configuration: `window.DIGISCIENCE_CONFIG.leadEndpointUrl`
- endpoint: `POST /api/lead`
- implementation: `functions/api/lead.js`

The browser must treat an enquiry as accepted only when the endpoint returns:

```json
{
  "ok": true,
  "delivery": {
    "accepted": true
  }
}
```

The function returns an error instead of a success receipt when no durable delivery channel accepts the record.

## Durable Delivery Channels

The function attempts all configured channels independently:

1. Cloudflare KV through the `LEADS_KV` binding.
2. An optional downstream webhook through `LEAD_WEBHOOK_URL`.
3. An optional Resend notification through `RESEND_API_KEY`, `LEAD_NOTIFICATION_FROM`, and `LEAD_NOTIFICATION_TO`.

A lead receipt is truthful when at least one channel succeeds. Partial delivery is logged for follow-up. Channel failures do not prevent another configured channel from accepting the lead.

Production secret values and lead records must remain in Cloudflare, Resend, the downstream system, or the approved lead inbox. Do not store them in Git.

## Measurement

`config.js` provides the GA4 measurement ID and `script.js` initializes the shared measurement layer on every rendered public page. The funnel records:

- assessment, pricing, contact, intake, and thank-you views
- CTA clicks
- form start
- validation error
- submission attempt
- durable delivery success
- submission or delivery error
- GA4 `generate_lead` only after durable acceptance

Analytics events must not contain names, email addresses, free-text problems, lead IDs, or internal lead scores.

## Controlled Internal Test

An authorized delivery test must be unmistakably internal:

- set `internalTest: true`
- use the reserved `@digisciencetechsol.invalid` email domain
- begin the company name with `DigiScience Internal Test`
- begin the problem statement with `CONTROLLED INTERNAL TEST:`

The stored record is marked `Internal Test`, and any notification subject and body explicitly say not to treat it as a customer enquiry.

Do not run repeated tests merely to probe configuration. One controlled test is enough unless a separate retry is explicitly authorized after a diagnosed failure.
