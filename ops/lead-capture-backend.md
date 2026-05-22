# Lead Capture Backend

## Current Production Path

Website forms submit to the public lead endpoint configured in `config.js`:

- `window.DIGISCIENCE_CONFIG.leadEndpointUrl`

The current endpoint is the DigiScience n8n control-plane webhook. The website sends form data with `no-cors` to avoid exposing credentials in the browser.

## Captured Fields

- name
- email
- company
- service
- message
- page
- source
- submittedAt
- intakeDetails
- transcript when submitted from the AI assistant

## Lead Sources

- Contact page
- AI Readiness Assessment intake
- Website AI assistant lead form

## Required Backend Behavior

The n8n or Apps Script backend should:

1. Validate required fields.
2. Drop honeypot spam submissions where `website` is populated.
3. Store lead in Google Sheet, CRM, or database.
4. Send email notification to `rajiv.gupta@digisciencetechsol.com`.
5. Preserve `page`, `service`, `intakeDetails`, and assistant transcript.
6. Return success if called server-side; browser forms use `no-cors` and redirect to `/success.html`.

## Security Notes

Do not expose private API tokens, SMTP passwords, CRM keys, or Cloudflare credentials in frontend code. Keep automation credentials only in n8n, Google Apps Script, or Cloudflare secret storage.
