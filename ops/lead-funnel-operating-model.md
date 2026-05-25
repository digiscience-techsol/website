# Lead Funnel Operating Model

Date: 2026-05-25
Status: Internal operations model. Do not publish.

## Source Systems Reviewed

- `ops/lead-operations.md`
- `ops/sharepoint-crm-integration-plan.md`
- `functions/api/lead.js`

Current production lead endpoint:

- `POST https://digisciencetechsol.com/api/lead`

Current source of truth until CRM integration:

- Cloudflare KV namespace: `DigiScience Leads`
- Cloudflare Pages binding: `LEADS_KV`
- Webhook notification secret: `LEAD_WEBHOOK_URL`

## 1. Lead Sources

### Contact Form

- Source page: `/contact`
- Target: `POST /api/lead`
- Best use: direct enquiries, proposal requests, founder/network referrals, vendor/customer conversations.

### AI Readiness Intake

- Source page: `/ai-readiness-intake`
- Target: `POST /api/lead`
- Best use: structured assessment requests where workflow pain, data readiness, governance, and success metrics are known.

### Proof Assets

- Current buyer-facing proof asset path includes the 45-Day AI Pilot Framework.
- Best use: move visitors from proof content to `/ai-readiness-assessment`, `/ai-readiness-intake`, or `/contact`.
- Do not gate proof assets with fake metrics, invented logos, or unsupported claims.

### Future LinkedIn

- Status: `AUTH PENDING`.
- Use only after founder restores Rakesh Pandey authentication.
- Do not send new requests, DMs, posts, or follow-ups without explicit approval.

### Direct Outreach

- Status: paused unless explicitly approved.
- Use only verified buyer names and current role fit.
- Track every send internally.
- Do not invent buyer data, email addresses, replies, or interest.

## 2. Lead Lifecycle

Use these statuses consistently:

1. New
2. Qualified
3. Discovery Scheduled
4. Proposal Needed
5. Proposal Sent
6. Won
7. Lost
8. Nurture

Recommended transitions:

- New -> Qualified: lead has valid company, business problem, and service fit.
- Qualified -> Discovery Scheduled: buyer agrees to a call or asks for next-step discussion.
- Discovery Scheduled -> Proposal Needed: workflow, owner, data path, risk, and success criteria are clear enough.
- Proposal Needed -> Proposal Sent: proposal delivered.
- Proposal Sent -> Won: commercial and kickoff approval received.
- Proposal Sent -> Lost: buyer declines, no fit, no budget, or timing mismatch.
- Any stage -> Nurture: fit exists but timing, urgency, authority, or readiness is weak.

## 3. Hot / Warm / Nurture Scoring Rules

The current API scores based on business email, company, buyer role, target industry, AI interest area, problem detail, desired outcome, timeline, budget range, and governance/compliance language.

### Hot

Indicators:

- Valid business email and company.
- Buyer/sponsor role such as founder, CEO, CIO, CTO, COO, CISO, head, director, partner, owner, lead, manager, or sponsor.
- Target industry fit.
- Specific AI interest area.
- Detailed business problem and desired outcome.
- Immediate or 30-day timeline.
- Budget signal.
- Governance, security, compliance, audit, privacy, or model-risk language.

Action:

- Schedule founder-led discovery or 45-day pilot scoping.
- Owner response SLA: 1 business day.

### Warm

Indicators:

- Clear company and problem, but missing urgency, budget, authority, data readiness, or success metric.
- Good industry fit but early exploration.
- Buyer is useful but may not be final decision owner.

Action:

- Send AI readiness intake follow-up.
- Clarify workflow, owner, timeline, data availability, and business metric.
- Owner response SLA: 2 business days.

### Nurture

Indicators:

- Weak or generic business problem.
- No timeline.
- No budget signal.
- Unclear role authority.
- Low detail on workflow or data.

Action:

- Add to campaign/nurture list.
- Share educational AI readiness content only when approved.
- Do not push a pilot.

## 4. Response SLA

- Hot: respond within 1 business day.
- Warm: respond within 2 business days.
- Nurture: add to campaign list and review during weekly lead review.

If a Hot lead arrives outside business hours, prepare the response draft immediately but send only through the approved channel and owner process.

## 5. Manual Process Until SharePoint CRM Is Implemented

1. Review the webhook notification.
2. Confirm lead ID, company, lead category, score, recommended action, and source page.
3. If detail is needed, fetch the matching KV lead record.
4. Add or update the lead in the internal manual review tracker.
5. Assign owner, default Rajiv unless delegated.
6. Set status to `New`.
7. Set next follow-up date based on lead category.
8. Draft response aligned to one of:
   - AI Readiness Assessment
   - 45-Day Industry AI Pilot
   - Responsible AI Governance Review
   - Secure AI Cloud Platform
9. After discovery, update status to `Proposal Needed`, `Nurture`, `Lost`, or other appropriate lifecycle state.
10. Do not store secrets, passwords, private keys, or unrestricted access details in the tracker.

## 6. Weekly Lead Review Process

Run once per week or whenever new leads arrive.

Review:

- New leads received.
- Hot leads and SLA status.
- Warm leads needing qualification.
- Nurture leads to keep or remove.
- Discovery calls scheduled.
- Proposals needed.
- Proposals sent.
- Lost/won reasons.
- Lead source performance.
- Website or form issues.
- CRM migration readiness.

Output:

- Updated manual lead review tracker.
- Next follow-up list.
- Proposal/action list.
- Any website or funnel fixes needed.

## 7. Webhook Notification Handling

Webhook notifications should be treated as operational alerts, not as the full CRM.

On receipt:

1. Confirm the lead ID.
2. Confirm lead category: Hot, Warm, or Nurture.
3. Confirm recommended action.
4. Check company, role, industry, AI interest area, timeline, and problem statement.
5. Add the lead to the internal manual tracker.
6. If the webhook lacks enough detail, retrieve the full record from KV.

Security rules:

- Do not paste webhook URLs into chat or docs.
- Do not expose raw secrets or private payloads publicly.
- Do not forward lead data to unapproved tools.

## 8. KV Lead Export

KV lead keys follow this pattern:

`DST-YYYYMMDD-XXXXXXXX`

Export options:

1. Cloudflare dashboard: browse the `DigiScience Leads` KV namespace.
2. Cloudflare API: list keys and fetch values when an authenticated API path is available.
3. Wrangler: only after authenticated securely.

Wrangler command pattern:

```bash
wrangler kv key list --namespace-id <namespace-id> --prefix DST- --remote
wrangler kv key get <lead-id> --namespace-id <namespace-id> --remote
```

Do not store Cloudflare tokens or namespace secrets in this file.

## 9. SharePoint Migration Next Steps

Target list:

- `DigiScience AI Leads`

Next steps:

1. Create or confirm the SharePoint list schema.
2. Create or reuse a DigiScience-only Microsoft Entra app registration.
3. Grant minimum required Microsoft Graph permissions for the SharePoint list write path.
4. Store Graph client secret only as a Cloudflare Pages secret.
5. Resolve `SHAREPOINT_SITE_ID` and `SHAREPOINT_LIST_ID`.
6. Configure preview environment variables first.
7. Add Graph token helper and SharePoint write mapper to the Pages Function.
8. Test preview with a test lead.
9. Confirm KV write still succeeds if SharePoint write fails.
10. Confirm webhook notification includes safe CRM write status.
11. Promote to production only after preview verification and founder approval.

Required variable names:

- `MS_GRAPH_TENANT_ID`
- `MS_GRAPH_CLIENT_ID`
- `MS_GRAPH_CLIENT_SECRET`
- `SHAREPOINT_SITE_ID`
- `SHAREPOINT_LIST_ID`

## 10. Operating Guardrails

- Keep this model internal under `ops/`.
- Do not publish this as a public page.
- Do not add it to sitemap.
- Do not expose manual trackers under public `/assets/templates`.
- Do not store secrets in CSV, Markdown, Telegram, GitHub public files, or website assets.
