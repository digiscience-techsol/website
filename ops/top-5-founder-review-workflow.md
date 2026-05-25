# Top 5 Founder Review Workflow

Date: 2026-05-25
Status: Internal approval workflow. Do not publish.

Purpose: define how Rajiv reviews each top-5 account before any outreach is allowed. This workflow keeps every account in NO-SEND state until explicit founder approval is recorded.

## Scope

Accounts covered:

- Cyril Amarchand Mangaldas
- Tata Steel
- Shardul Amarchand Mangaldas & Co
- HDFC ERGO General Insurance
- Khaitan & Co

LinkedIn status: AUTH PENDING. LinkedIn cannot be used for outreach, login, connection requests, DMs, or contact validation until Rajiv clears authentication and approves the action.

## Review Steps Before Approval

1. Confirm the account is still a priority target.
2. Review the buyer-role verification record.
3. Confirm the official/public route is appropriate for business outreach.
4. Confirm whether the target is role-level only or person-level verified.
5. Review the no-send outreach draft and message variant.
6. Confirm the linked DigiScience public page is buyer-facing and relevant.
7. Assign risk level: Low, Medium, High, or Blocked.
8. Record approval decision in `ops/templates/founder-approval-decision-log.csv`.
9. Keep account as NO-SEND unless the founder approval status is explicitly APPROVED.

## Required Validation Evidence

Each account must have evidence for:

- Official website.
- Official contact page, enquiry form, generic business route, or referral/manual route.
- Target role/function fit.
- Message variant and public page link.
- No invented buyer names, emails, phone numbers, designations, or LinkedIn URLs.
- Notes on any gaps, uncertainty, or manual validation required.

## Route Approval Rules

- Official contact form: allowed for approval only if the route is clearly suitable for business enquiry.
- Generic office email: allowed only after Rajiv confirms the account, message, and route.
- Customer support/grievance route: blocked for vendor outreach unless Rajiv explicitly approves.
- Referral/manual network: preferred where direct official business route is unclear.
- LinkedIn: blocked while AUTH PENDING.
- Any unverified route: NO-SEND.

## Buyer/Person Approval Rules

- Role-level targeting is preferred until buyer identity and route are verified.
- Person-level buyer name can be used only if publicly verified and approved by Rajiv.
- Do not infer email IDs from naming patterns.
- Do not infer LinkedIn URLs.
- Do not use a public role/name as permission to send.
- If buyer person is uncertain, leave buyer name blank and mark role-route only.

## Message Approval Rules

Every message must:

- Use the correct account and industry context.
- State business pain without claiming private knowledge.
- Offer AI Readiness Assessment or a scoped 45-day pilot as a low-risk next step.
- Use a soft CTA.
- Link only to public DigiScience buyer-facing pages.
- Avoid fake customer claims, fake metrics, fake case studies, and guaranteed ROI.
- Avoid implying AI replaces professional, operational, clinical, legal, or regulated human judgment.

## Send / No-Send Decision Rules

Default decision: NO-SEND.

Approve only when:

- Account priority is confirmed.
- Route is verified and approved.
- Buyer role or person is approved.
- Message variant is approved.
- Risk is acceptable.
- Audit log has been updated.
- Rajiv explicitly approves sending.

Keep NO-SEND when:

- Route is unclear.
- Buyer role/person is not validated.
- LinkedIn is required but AUTH PENDING.
- Only customer support/grievance route is available.
- Message requires further review.
- Any data is uncertain.

## LinkedIn AUTH PENDING Handling

- Do not attempt login.
- Do not search behind LinkedIn auth.
- Do not send connection requests.
- Do not send DMs.
- Do not use LinkedIn as a verified route until Rajiv completes auth and approves account-level action.
- Keep LinkedIn-related route fields as pending or blocked.

## Manual / Referral-First Handling

Use manual/referral-first when:

- The account is high value.
- Official business route is not clearly available.
- The only visible route is customer support.
- A named buyer is known publicly but direct route is not verified.
- Warm introduction could reduce compliance or spam risk.

Manual/referral-first next steps:

- Identify whether Rajiv has a trusted network route.
- Confirm target function, not personal contact details.
- Prepare approved message only after route validation.
- Record route source and approval status.

## Risk Categories

- Low: official business contact route and role-level target are verified; no person-level outreach needed.
- Medium: official route exists but buyer/person route needs founder review.
- High: contact route is indirect, customer-service oriented, or needs manual validation.
- Blocked: LinkedIn-only route, unverified contact route, invented data risk, or founder approval missing.

## Audit Trail Requirements

Every approval decision must record:

- Date.
- Account name.
- Route reviewed.
- Target role/function.
- Buyer name if approved, otherwise blank.
- Message variant.
- Decision: APPROVED, NO-SEND, NEEDS VALIDATION, or BLOCKED.
- Founder approval status.
- Evidence reviewed.
- Notes and next action.

## Explicit No-Outreach Rule

No outreach can be sent through email, contact form, LinkedIn, phone, or referral channel unless Rajiv explicitly approves the account, route, buyer role/person, message variant, and timing.

