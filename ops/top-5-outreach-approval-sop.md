# Top 5 Outreach Approval SOP

Date: 2026-05-25
Status: Internal SOP. Do not publish.

Purpose: provide a repeatable operating procedure for moving a top-5 account from preparation to founder-approved outreach. This SOP does not authorize outreach.

## Inputs

- `ops/top-5-buyer-role-verification.md`
- `ops/top-5-no-send-outreach-drafts.md`
- `ops/top-5-founder-outreach-approval-sheet.md`
- `ops/templates/founder-approval-decision-log.csv`

## Roles

- Founder / Rajiv: final approval authority.
- DigiBot: prepares internal records, validates public containment, and keeps all accounts NO-SEND until approval is recorded.
- Sender: only Rajiv or an explicitly approved operator after approval is recorded.

## SOP Steps

### 1. Account Review

- Confirm the account is still in the top-5 list.
- Confirm industry fit and recommended first offer.
- Confirm the target function is relevant.
- Confirm the account has not been disqualified.

### 2. Evidence Review

Check that the account record includes:

- Official website.
- Official route or referral/manual route.
- Verification source.
- Risk level.
- No-send reason, if any.
- Route gaps needing validation.

### 3. Route Approval

Approve route only if it is:

- Official contact form suitable for business enquiry.
- Official generic office/business enquiry route approved by Rajiv.
- Referral/manual route approved by Rajiv.
- LinkedIn route only after AUTH PENDING is cleared and Rajiv approves LinkedIn use.

Block route if:

- It is customer support/grievance only.
- It depends on an invented email or phone number.
- It depends on LinkedIn while AUTH PENDING.
- It is unclear whether business/vendor outreach is appropriate.

### 4. Buyer / Person Approval

- Prefer role-level outreach.
- Use buyer name only if officially/publicly verified and approved.
- Leave buyer name blank if not verified.
- Do not use personal contact details unless official/public and approved.
- Do not use LinkedIn URLs unless verified without login and approved.

### 5. Message Approval

Review message for:

- Placeholder cleanup before any approved send.
- No fake customer claims.
- No implied prior relationship.
- No sensitive data.
- No guaranteed outcome.
- Relevant DigiScience public page link.
- Soft CTA only.

### 6. Decision Recording

Record one of:

- NO-SEND: default state.
- NEEDS VALIDATION: route, role, or evidence gap remains.
- APPROVED: founder approved account, route, role/person, message, and timing.
- BLOCKED: route or evidence is unsuitable.

Update `ops/templates/founder-approval-decision-log.csv` after every review.

### 7. Pre-Send Gate

Before any outreach:

- Decision must be APPROVED.
- Founder approval status must be APPROVED.
- Approved route must be documented.
- Approved message variant must be documented.
- LinkedIn must not be used unless AUTH PENDING is cleared.
- Sender must confirm no outreach has already been sent.

## Account-Specific Default Decisions

- Cyril Amarchand Mangaldas: NO-SEND, PENDING founder approval.
- Tata Steel: NO-SEND, PENDING stronger route validation.
- Shardul Amarchand Mangaldas & Co: NO-SEND, PENDING official route confirmation.
- HDFC ERGO General Insurance: NO-SEND, PENDING enterprise/vendor route validation.
- Khaitan & Co: NO-SEND, PENDING founder route approval.

## Audit and Containment

- Keep all workflow, approval, and decision records under `ops/`.
- Do not publish as public HTML.
- Do not add to sitemap.
- Do not move CSVs to `/assets/templates`.
- Confirm public site health after commits.

