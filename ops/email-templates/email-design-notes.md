# Email Design Notes

Date: 2026-05-26
Status: Internal design notes. Do not publish.

## Purpose

Create two clearly separated email experiences:

- Founder Review Email: internal approval pack for Rajiv.
- CAM Prospect Email Preview: production-facing message preview for Cyril Amarchand Mangaldas.

## Design Rules Applied

- Inline CSS only.
- 640px max-width email container.
- No external CSS.
- No JavaScript.
- No tracking pixel.
- No fake logo.
- No fake customer claim.
- Professional header using DigiScience Techsol name only.
- Section cards, status badges, spacing, and mobile-friendly table/card layout.

## Separation Rules

Founder Review Email may include:

- Founder Review Only label.
- No external outreach sent notice.
- CAM internal status.
- Khaitan backup status.
- Top 5 account summary.
- Founder decision options.
- Next action checklist.

CAM Prospect Email Preview must not include:

- Internal notes.
- Top 5 or top 20 account lists.
- No-send status.
- Approval language.
- Blockers.
- Similar-client claims.

## Screenshot Outputs

- ops/email-templates/founder-review-email-v2-preview.png
- ops/email-templates/cam-prospect-email-preview-v1-preview.png