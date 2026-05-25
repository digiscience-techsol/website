# Customer Onboarding Delivery Dashboard

Date: 2026-05-25
Status: Internal operations dashboard. Do not publish.

## 1. Current Website / Lead System Status

- Production website: `https://digisciencetechsol.com/`
- Homepage: healthy, latest check returned `HTTP/2 200`.
- Contact page: healthy, latest check returned `HTTP/2 200`.
- AI readiness assessment page: healthy, latest check returned `HTTP/2 200`.
- `www` redirect: healthy, redirects to `https://digisciencetechsol.com/`.
- Sitemap: healthy, latest check returned `HTTP/2 200`.
- Robots: healthy, latest check returned `HTTP/2 200`.
- Public/private cleanup: fixed. Internal CSV/log/outreach URLs are not in sitemap, and old internal CSV URLs return `410` with noindex headers.

## 2. Lead Capture Status

- Lead endpoint: `https://digisciencetechsol.com/api/lead`
- GET/HEAD health check returns `405`, expected for a non-POST check.
- Contact form target: `POST /api/lead`.
- AI readiness intake target: `POST /api/lead`.
- Lead ID generation, scoring, validation, consent check, and honeypot protection are documented as live.
- Safe fallback remains manual founder follow-up if downstream notification or CRM integration fails.

## 3. KV / Webhook Status

- Lead storage: Cloudflare KV namespace `DigiScience Leads`.
- Binding: `LEADS_KV`.
- Webhook notification: configured through `LEAD_WEBHOOK_URL`.
- Resend email notification: not active unless sender/API variables are configured later.
- Do not expose webhook URLs, KV IDs beyond approved names, API keys, tokens, or Cloudflare secrets in docs or chat.

## 4. AI Readiness Funnel Status

- Primary funnel route: buyer lands on website, proof asset, or referral path, then moves to `/ai-readiness-assessment` or `/contact`.
- Qualification lens: one workflow, business outcome, data readiness, cloud readiness, security/governance constraints, and 45-day success metric.
- Internal scorecard draft: `gtm/internal/one-workflow-ai-readiness-scorecard.md`.
- LinkedIn funnel: paused as `AUTH PENDING`; do not use until founder restores Rakesh Pandey authentication.

## 5. Customer Onboarding Pack Status

- Existing pack archived internally: `internal-digiscience-gtm-archive/repo-markdown/gtm/customer-onboarding-operating-pack.md`.
- Current operating stance: least-privilege access only, no passwords/secrets/private keys, approved sample data path, named approver, weekly cadence, and go/no-go decision.
- New operational checklist: `ops/customer-delivery-checklist.md`.

## 6. Proposal-To-Pilot Pack Status

- Existing pack archived internally: `internal-digiscience-gtm-archive/repo-markdown/gtm/proposal-to-pilot-conversion-pack.md`.
- Decision routes:
  - unclear workflow: AI Readiness Assessment
  - clear workflow and data: 45-Day Industry AI Pilot
  - risk/governance blocker: Responsible AI Governance Review
  - platform foundation blocker: Secure AI Cloud Platform
- Next improvement: convert the one-workflow scorecard into a buyer-facing proof asset only after review.

## 7. Proof Assets Status

- Public buyer-facing proof asset retained: 45-Day AI Pilot Framework.
- Internal proof library exists in archive: `internal-digiscience-gtm-archive/repo-markdown/ops/proof-assets-library.md`.
- Recommended next proof asset: One-Workflow AI Readiness Scorecard.
- Do not invent customers, logos, testimonials, case studies, or metrics.

## 8. SharePoint CRM Pending Status

- SharePoint CRM integration remains pending.
- Planned list: `DigiScience AI Leads`.
- Required Microsoft Graph and SharePoint identifiers/secrets are not configured for production activation.
- Current source of truth until CRM integration is active: Cloudflare KV plus webhook notification.
- Do not implement production SharePoint write until Microsoft Graph app registration, least-privilege permissions, Cloudflare secrets, site ID, list ID, preview test, and founder approval are complete.

## 9. LinkedIn Auth Pending Status

- LinkedIn status: `AUTH PENDING`.
- Reason: new VPS/OpenClaw browser requires fresh authentication for Rakesh Pandey profile.
- Founder will handle login later through noVNC.
- Previous verified state:
  - Parthanil Ghosh connected.
  - Initial DM sent.
  - No reply observed as of latest verified monitoring.
  - Six connection requests pending: Komal Gupta, Yogesh Zope, Kapil Bharati, Mahesh Calavai, Jagadeesh Ramasamy, Girish Nayak.
  - Parthanil follow-up not before 2026-05-27 and only if no reply.
- Do not attempt LinkedIn login, requests, DMs, posts, or follow-ups until auth is restored and explicit approval is given.

## 10. Current Blockers

- LinkedIn live monitoring blocked by authentication pending.
- SharePoint CRM integration blocked by Microsoft Graph app registration, SharePoint site/list IDs, secure Cloudflare secrets, and founder approval.
- No active customer discovery call is currently recorded for conversion into a proposal or pilot.
- Email notification via Resend is not active unless sender/API configuration is completed.

## 11. Next 7-Day Operating Plan

Day 1:
- Keep public website health monitored.
- Finalize internal discovery call script and pilot qualification checklist.

Day 2:
- Convert the one-workflow scorecard into a reusable internal discovery worksheet.
- Prepare buyer-facing version for review, but do not publish.

Day 3:
- Prepare industry-specific discovery prompts for Legal, Manufacturing, BFSI/Insurance, Healthcare, Logistics, HR/Recruitment, and Retail.

Day 4:
- Prepare a proposal review agenda and assumptions checklist for the 45-Day Industry AI Pilot.

Day 5:
- Prepare SharePoint CRM activation checklist without implementing production writes.

Day 6:
- Review proof assets for buyer clarity, CTA consistency, and no unsupported claims.

Day 7:
- Summarize readiness status, blockers, and next approval requests for Rajiv.

## Guardrails

- Internal operations files stay under `ops/`, `gtm/`, or private VPS folders.
- Do not add internal files to sitemap.
- Do not publish internal HTML pages.
- Do not expose internal CSVs under `/assets/templates`.
- Do not send outreach without explicit approval.
