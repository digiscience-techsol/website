# Cloudflare Pages Deployment Incident

Date: 2026-05-22

## Status

Production deployment is not fixed. Do not continue LinkedIn or outbound outreach until the production content checks pass.

## Ready source commits

- Day-1 LinkedIn send queue and post-final source commit: `3d0d2457b36ff20430a0a31a02e752993a328b07`
- GitHub-trigger deployment marker commit: `e8bd7740172e2030a27aefb0389b98d41faa08f6`

The latest required source files are present on GitHub main. GitHub raw content confirms the Day-1 send queue contains:

- `Ready to Send`
- `Buyer Verification Pending`
- `Rakesh Pandey`

## Required production pages

- `https://digisciencetechsol.com/day-01-linkedin-send-queue`
- `https://digisciencetechsol.com/day-01-linkedin-post-final`
- `https://digisciencetechsol.com/day-01-execution-log`

## Required content markers

- `Ready to Send`
- `Buyer Verification Pending`
- `AI readiness before AI spend`
- `Rakesh Pandey`

## Cloudflare project

- Pages project: `digisciencetechsol-org-website`
- Production branch: `main`
- Canonical domain: `https://digisciencetechsol.com/`
- WWW behavior: `https://www.digisciencetechsol.com/*` redirects to apex.

## Failed deployment evidence

Direct deploy failure:

```text
POST /pages/assets/upload -> 500 Internal Server Error
Cloudflare Ray ID: 9ffd00110acb09c8-HKG
```

Reduced direct deploy failure:

```text
POST /accounts/.../pages/projects/digisciencetechsol-org-website/deployments -> 503 Service Unavailable
Cloudflare Ray ID: 9ffd12d5c88df325-HKG
```

Retry failure:

```text
GET /accounts/.../pages/projects/digisciencetechsol-org-website -> 503 Service Unavailable
Cloudflare Ray ID: 9ffd13b1397703d7-HKG
```

## Latest deployment records observed

```text
Deployment ID: ed9f891d-3a50-4ce4-b1a3-9d48a7800dfb
Environment: Production
Branch: main
Source: e8bd774
Status observed later: Failure
Deployment URL: https://ed9f891d.digisciencetechsol-org-website.pages.dev
```

```text
Deployment ID: 2fdeb1ad-8a45-44ff-8c18-2cfe1e219f2f
Environment: Production
Branch: main
Source: 3d0d245
Status: Failure
Deployment URL: https://2fdeb1ad.digisciencetechsol-org-website.pages.dev
```

## Cloudflare health evidence

Cloudflare status API reported:

```text
indicator: minor
description: Minor Service Outage
incident: Cloudflare Dashboard and Cloudflare API service issues
incident status: monitoring
impact: minor
shortlink: https://stspg.io/5hrr9gq25h6j
component: Cloudflare Sites and Services - degraded_performance
```

The Cloudflare dashboard also showed an unknown API error while opening the Pages project.

## Current production behavior

The required new paths return HTTP 200 or 308, but content checks fail because the production response still serves the existing homepage/fallback content instead of the new page files.

Known good:

- `www` redirect to apex is preserved.
- GitHub main contains the required source files.
- No outreach was sent during the deployment outage.

Known bad:

- Production content markers do not appear yet.
- Latest Pages deployment records for `3d0d245` and `e8bd774` show failure.

## Retry steps after Cloudflare recovery

1. Confirm Cloudflare Dashboard/API incident is resolved.
2. Confirm Pages API can list project/deployments without 500/503.
3. Retry GitHub-triggered deployment from `main`.
4. Confirm deployed source commit is at least `e8bd7740172e2030a27aefb0389b98d41faa08f6`.
5. Verify:

```bash
curl -I https://digisciencetechsol.com/day-01-linkedin-send-queue
curl -I https://digisciencetechsol.com/day-01-linkedin-post-final
curl -I https://digisciencetechsol.com/day-01-execution-log
curl -I https://www.digisciencetechsol.com/day-01-linkedin-send-queue
```

6. Verify content markers:

```bash
curl -L https://digisciencetechsol.com/day-01-linkedin-send-queue | grep -i "Ready to Send"
curl -L https://digisciencetechsol.com/day-01-linkedin-send-queue | grep -i "Buyer Verification Pending"
curl -L https://digisciencetechsol.com/day-01-linkedin-post-final | grep -i "AI readiness before AI spend"
curl -L https://digisciencetechsol.com/day-01-execution-log | grep -i "Rakesh Pandey"
```

7. Resume outreach only after all content markers pass in production.
