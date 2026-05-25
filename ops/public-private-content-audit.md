# DigiScience Public / Private Content Audit

Date: 2026-05-25

Purpose: keep the production website buyer-facing only and prevent internal GTM, outreach, monitoring, prospect, and execution material from being indexed or promoted publicly.

## A. Public Buyer-Facing Pages

These pages are approved for public sitemap inclusion and normal indexing:

- `/`
- `/services`
- `/industries`
- `/pricing`
- `/proof-assets`
- `/ai-readiness-assessment`
- `/ai-readiness-intake`
- `/45-day-ai-pilot`
- `/customer-onboarding`
- `/contact`
- `/thank-you`
- `/privacy`
- `/solutions/secure-ai-cloud-platform`
- `/solutions/responsible-ai-governance`
- `/solutions/ai-ready-devops`
- `/industries/manufacturing-ai`
- `/industries/healthcare-ai`
- `/industries/legal-document-intelligence`
- `/industries/bfsi-compliance-intelligence`
- `/proof-assets/ai-readiness-scorecard`
- `/proof-assets/secure-ai-landing-zone-blueprint`
- `/proof-assets/responsible-ai-governance-checklist`
- `/proof-assets/45-day-ai-pilot-framework`
- `/proof-assets/legal-document-intelligence-blueprint`
- `/proof-assets/predictive-maintenance-blueprint`
- `/proof-assets/cxo-ai-transformation-brief`

`/proposal-templates` is not currently approved for public indexing because the existing page was an operating asset rather than a sanitized buyer-facing proposal overview. `/portfolio` and `/trust-assets` are not currently sitemap-approved because they were not included in the approved buyer-facing page set for this cleanup batch.

## B. Internal / Private Operations

These assets must not be included in `sitemap.xml`, public navigation, public footer links, or downloadable public CSV paths:

- Daily execution logs: `day-*`
- Monitoring logs: `day-*monitoring-log`, `week-*post-engagement-log`
- LinkedIn send queues, handoff pages, post drafts, and execution logs
- Outreach batches and outbound message banks
- Prospect trackers and first-50 prospect files
- Metrics CSVs and sales status CSVs
- Execution plans, approval packs, fallback packs, and internal operating packs
- Sales execution pages that reveal internal process
- GTM assets that reveal outbound scripts or internal playbooks
- Proposal-to-pilot conversion pack in its current internal form
- Customer onboarding operating pack in its current internal form
- Internal Markdown folders such as `ops/` and `gtm/`

The prior public HTML and CSV exports were removed from the deploy root in commit `9413119`. The current deploy root scan found no `day-*`, `week-*`, outreach, LinkedIn operations, prospect tracker, metrics CSV, `assets/templates`, `gtm/`, or send-queue files remaining as deployable public files. Buyer-facing `45-day-ai-pilot` assets are intentionally retained.

## C. Keep But Noindex

These paths are not sitemap-approved. If any still exist from cache, rollback, or future temporary use, they must carry noindex protection and stay out of navigation:

- `/day-*`
- `/week-*`
- `/outreach-*`
- `/linkedin-*`
- `/manual-linkedin-*`
- `/manual-linkedin-post-handoff*`
- `/parthanil-*`
- `/parthanil-follow-up-readiness*`
- `/30-day-gtm-plan*`
- `/daily-sales-checklist*`
- `/discovery-call-kit*`
- `/first-offers*`
- `/follow-up-cadence*`
- `/gtm-assets*`
- `/ideal-customer-profile*`
- `/outbound-message-bank*`
- `/proposal-templates*`
- `/prospect-tracker*`
- `/sales-execution*`
- `/target-account-selection*`
- `/assets/templates/*`
- `/ops/*`
- `/gtm/*`

Controls now expected:

- `sitemap.xml` contains buyer-facing URLs only.
- `robots.txt` disallows internal GTM and operations paths.
- `_headers` applies `X-Robots-Tag: noindex, nofollow, noarchive` to internal patterns.
- Internal files should be kept outside the public deploy root where possible.
