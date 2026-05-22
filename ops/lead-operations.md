# DigiScience Lead Operations

## 1. Current Lead Capture Architecture

Website forms submit to the Cloudflare Pages Function endpoint:

- `/api/lead`

The endpoint validates the lead, blocks honeypot spam, calculates lead score, returns a lead ID, and can deliver the lead to storage/notification services through Cloudflare environment variables. No API keys, passwords, tenant IDs, client secrets, or private credentials should be committed to the repository.

If downstream storage or email is not configured, the frontend keeps the safe mailto fallback to `rajiv.gupta@digisciencetechsol.com`.

## 2. Form Endpoints

- Contact form: `/contact` -> `POST /api/lead`
- AI readiness intake form: `/ai-readiness-intake` -> `POST /api/lead`
- Thank-you page: `/thank-you?type=contact` or `/thank-you?type=intake`

## 3. Data Fields Captured

- Source Page
- Form Type
- Submitted At
- Full Name
- Business Email
- Phone
- Company
- Website / LinkedIn URL
- Role / Designation
- Industry
- Cloud Platform
- AI Interest Area
- Business Problem
- Desired Outcome
- Timeline
- Budget Range
- Consent
- Business Context
- Workflow Pain
- AI Use Case Candidate
- Data Availability
- Current Systems
- Governance Requirements
- Compliance Constraints
- Success Metrics
- Stakeholders
- User Agent
- Referrer

## 4. Validation Rules

- Full name is required.
- Business email is required and must look like a valid email address.
- Company is required for the contact form.
- Consent is required.
- Honeypot field `website` must be empty.
- Submission size is limited.
- Individual text fields are limited to avoid abuse.
- Stack traces are not exposed to the browser.

## Production Activation Status

Current production status as of 2026-05-22:

- `/api/lead` is live and validates submissions.
- Lead ID generation is live.
- Lead scoring and category logic are live.
- Consent validation is live.
- Honeypot rejection is live.
- Cloudflare KV storage is active through the `LEADS_KV` Pages binding.
- Webhook notification is active through the `LEAD_WEBHOOK_URL` Pages secret.
- Resend email notification is not active because `RESEND_API_KEY`, `LEAD_NOTIFICATION_FROM`, and verified sender setup are not configured.
- SharePoint/CRM storage is pending until Microsoft Graph app registration and list IDs are available.

Required Cloudflare Pages project:

- `digisciencetechsol-org-website`

Required KV namespace:

- `DigiScience Leads`

Required binding:

- `LEADS_KV`

Pages configuration file:

- `wrangler.toml`

## 5. Storage Method

Current implementation stores production leads in Cloudflare KV through the `LEADS_KV` binding.

Active KV namespace:

- `DigiScience Leads`

Active binding:

- `LEADS_KV`

Recommended production storage target:

Microsoft 365 / SharePoint list:

List name: `DigiScience AI Leads`

Columns:

- Lead ID
- Submitted At
- Source Page
- Form Type
- Full Name
- Business Email
- Phone
- Company
- Role
- Industry
- Cloud Platform
- AI Interest Area
- Business Problem
- Desired Outcome
- Timeline
- Budget Range
- Lead Score
- Status
- Owner
- Next Follow-up Date
- Notes
- Consent
- Raw Payload Link / Summary

Lead status options:

- New
- Qualified
- Discovery Scheduled
- Proposal Needed
- Proposal Sent
- Won
- Lost
- Nurture

SharePoint insertion is pending until Microsoft Graph app registration and Cloudflare secrets are available.

## How to Export Leads from KV

Leads are stored with keys like:

`DST-YYYYMMDD-XXXXXXXX`

Export options:

1. Cloudflare dashboard: Workers & Pages -> KV -> DigiScience Leads -> browse/download keys.
2. Cloudflare API: list keys from the namespace, then fetch each value.
3. Future admin page: add an authenticated export route only after access control is designed.

Wrangler export command pattern:

```bash
wrangler kv key list --namespace-id <namespace-id> --prefix DST- --remote
wrangler kv key get <lead-id> --namespace-id <namespace-id> --remote
```

## 6. Email Notification Method

The endpoint supports notification through Resend when these Cloudflare environment variables are configured:

- `RESEND_API_KEY`
- `LEAD_NOTIFICATION_FROM`
- `LEAD_NOTIFICATION_TO`

Recipient should be `rajiv.gupta@digisciencetechsol.com`.

Subject format:

`New DigiScience AI Lead - <Company> - <AI Interest Area>`

Current production notification uses the secure webhook configured as `LEAD_WEBHOOK_URL`.

If Resend and webhook are not configured, the website falls back to the mailto enquiry path.

## 7. Environment Variables Required

Current endpoint variables:

- `LEADS_KV`
- `LEAD_WEBHOOK_URL`

Optional email variables:

- `RESEND_API_KEY`
- `LEAD_NOTIFICATION_FROM`
- `LEAD_NOTIFICATION_TO`

Recommended initial production configuration:

- `LEADS_KV`: KV namespace binding, not a text variable.
- `LEAD_WEBHOOK_URL`: existing secure workflow endpoint configured as a Cloudflare Pages secret.
- `RESEND_API_KEY`: Resend API key stored as a Cloudflare secret.
- `LEAD_NOTIFICATION_FROM`: verified Resend sender.
- `LEAD_NOTIFICATION_TO`: `rajiv.gupta@digisciencetechsol.com`.

Future Microsoft 365 / SharePoint variables:

- `MS_GRAPH_TENANT_ID`
- `MS_GRAPH_CLIENT_ID`
- `MS_GRAPH_CLIENT_SECRET`
- `SHAREPOINT_SITE_ID`
- `SHAREPOINT_LIST_ID`

Do not store these values in GitHub source files.

## 8. How to Test Forms

HTTP status:

```bash
curl -I https://digisciencetechsol.com/api/lead
```

Expected for GET:

```text
HTTP 405
```

Safe POST test:

```bash
curl -sS -X POST https://digisciencetechsol.com/api/lead \
  -H 'Content-Type: application/json' \
  -d '{
    "formType":"contact",
    "sourcePage":"/contact",
    "fullName":"DigiScience Test Lead",
    "businessEmail":"test@example.com",
    "company":"Test Company - DigiScience Verification",
    "aiInterestArea":"AI Readiness Assessment",
    "businessProblem":"Testing lead capture workflow for DigiScience AI readiness enquiry.",
    "desiredOutcome":"Verify that lead form submission, validation, redirect, storage, and notification path are working.",
    "consent":true
  }'
```

## 9. Known Limitations

- SharePoint lead storage is not active until Microsoft Graph credentials and list IDs are configured.
- Resend direct email notification is not active until an approved email provider key and verified sender are configured.
- The current production path is Cloudflare KV storage plus secure webhook notification.

## 10. How to Add SharePoint / CRM Integration Later

1. Create Microsoft Entra app registration.
2. Grant the minimum Graph permission required to write list items.
3. Create the SharePoint list `DigiScience AI Leads`.
4. Add Graph credentials and site/list IDs as Cloudflare secrets.
5. Extend `/functions/api/lead.js` with a Graph write function.
6. Submit one safe test lead.
7. Verify the item appears in SharePoint.
8. Only then mark SharePoint storage as operational.

## Secret Rotation

1. Rotate provider secret in the provider dashboard first.
2. Update the corresponding Cloudflare Pages environment variable or secret.
3. Redeploy the Pages project or trigger a new deployment if required.
4. Submit one safe test lead.
5. Confirm `/api/lead` response shows the expected delivery path.
6. Revoke the old provider secret.

## 11. Security Rules

- No secrets in the repo.
- No passwords, API keys, tokens, private keys, or production credentials in chat, email, or website forms.
- Do not ask prospects to submit sensitive production data through public forms.
- Use secure channels and approved access flows after discovery and scope agreement.
- Keep consent mandatory for contact and intake submissions.
