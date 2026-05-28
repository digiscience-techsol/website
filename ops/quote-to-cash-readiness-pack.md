# Quote-To-Cash Readiness Pack

Status: Internal readiness pack. Do not publish.
Created: 2026-05-28

## Current Answer

Can DigiScience quote, propose, invoice, and start tomorrow?

No.

DigiScience can discuss the Legal Document Intelligence AI Readiness Assessment and draft a proposal, but it cannot safely quote, invoice, collect payment, sign, and start until the commercial and billing decisions below are closed.

## Required Readiness Areas

### 1. Final Pricing

- Current status: not approved.
- Required decision: founder must approve one pricing option and exact INR/USD price or range for the Legal Document Intelligence AI Readiness Assessment.
- Self-resolvable by DigiBot: no.
- Founder action needed: yes.
- Exact noVNC/browser path or document/details required: noVNC not required; founder can approve pricing in Telegram or provide a private commercial decision note.
- Next path:
  - Founder selects Option A, B, or C from `ops/ai-readiness-assessment-pricing-decision.md`.
  - Founder approves exact price/range.
  - DigiBot updates proposal-ready pricing language internally.
- Impact on 45-day revenue plan: high; without approved pricing, DigiScience cannot issue a quote or proposal quickly.

### 2. Proposal Owner

- Current status: partially defined; DigiBot drafts and founder approves, but final owner workflow is not locked.
- Required decision: assign proposal drafter, final approver, and 24-hour turnaround owner.
- Self-resolvable by DigiBot: partially.
- Founder action needed: yes.
- Exact noVNC/browser path or document/details required: noVNC not required; founder can confirm owner/approver in Telegram.
- Next path:
  - DigiBot drafts proposal/SOW pack.
  - Founder confirms whether DigiBot owns first draft and founder owns final approval.
  - Proposal SLA becomes active after first qualified discovery.
- Impact on 45-day revenue plan: high; unclear ownership can delay proposal issuance after a qualified reply.

### 3. Billing Owner

- Current status: not assigned.
- Required decision: identify who owns invoice creation, payment tracking, and billing confirmation.
- Self-resolvable by DigiBot: no.
- Founder action needed: yes.
- Exact noVNC/browser path or document/details required: noVNC may be required if billing owner must access accounting, banking, GST, or payment portal; otherwise founder can provide owner name/role privately.
- Next path:
  - Founder assigns billing owner.
  - Billing owner confirms invoice process and payment confirmation process.
  - DigiBot records only non-secret operating steps in `ops/`.
- Impact on 45-day revenue plan: high; without billing owner, accepted proposal may not convert into billing start.

### 4. Invoice Method

- Current status: not configured in execution docs.
- Required decision: choose manual invoice, accounting software, payment gateway invoice, bank invoice, or other method.
- Self-resolvable by DigiBot: partially.
- Founder action needed: yes.
- Exact noVNC/browser path or document/details required:
  - If using accounting software: founder opens the accounting portal through noVNC/browser and completes login/2FA manually.
  - If using payment gateway invoice: founder opens Razorpay/Stripe/payment provider through noVNC/browser and completes login/2FA manually.
  - If using manual invoice: founder provides an approved invoice template or required invoice fields in a secure private channel.
- Next path:
  - Founder selects invoice method.
  - DigiBot prepares invoice information checklist or template text without storing secrets.
  - Founder/billing owner issues invoice after accepted proposal.
- Impact on 45-day revenue plan: high; no invoice method means payment cannot be requested cleanly.

### 5. Payment Method

- Current status: not approved.
- Required decision: choose accepted payment route such as bank transfer, UPI, Razorpay, Stripe, or another method.
- Self-resolvable by DigiBot: no.
- Founder action needed: yes.
- Exact noVNC/browser path or document/details required:
  - Bank transfer: founder provides approved payment instructions privately.
  - UPI: founder provides approved business UPI details privately.
  - Razorpay/Stripe/payment gateway: founder opens provider through noVNC/browser and completes login/2FA manually.
- Next path:
  - Founder chooses payment method.
  - Founder provides or verifies payment instructions privately.
  - DigiBot prepares non-secret payment instruction placeholder for proposal/invoice workflow.
- Impact on 45-day revenue plan: high; without payment method, accepted work cannot become collected revenue.

### 6. Company / Tax / GST Details

- Current status: not verified in this readiness pack.
- Required decision: confirm legal billing entity, registered address, tax/GST identifiers if applicable, invoice contact, and payment terms.
- Self-resolvable by DigiBot: no.
- Founder action needed: yes.
- Exact noVNC/browser path or document/details required:
  - Founder provides company legal name, registered billing address, GSTIN/tax identifiers if applicable, invoice email/contact, and payment terms in a secure private channel.
  - If details are stored in GST/accounting/company portal, founder opens portal through noVNC/browser and completes login/2FA manually.
- Next path:
  - Founder provides verified details.
  - DigiBot creates a sanitized internal billing-readiness checklist without exposing sensitive details.
  - Billing owner uses exact details only in invoice/proposal documents as approved.
- Impact on 45-day revenue plan: high; incorrect or missing company/tax details can delay procurement, invoice acceptance, and payment.

### 7. Contract / Signature Method

- Current status: not approved.
- Required decision: choose acceptance method: email approval, signed PDF, e-sign tool, purchase order, or signed SOW.
- Self-resolvable by DigiBot: partially.
- Founder action needed: yes.
- Exact noVNC/browser path or document/details required:
  - Email acceptance: founder approves acceptance wording.
  - Signed PDF: founder provides signature process and authorized signer.
  - E-sign: founder opens e-sign tool through noVNC/browser and completes login/2FA manually if needed.
  - Purchase order: founder confirms whether PO is required before kickoff.
- Next path:
  - Founder selects signature/acceptance route.
  - DigiBot drafts acceptance language or SOW signature block for review.
  - Founder approves before any proposal is sent.
- Impact on 45-day revenue plan: medium-high; unclear acceptance route can delay close even after buyer agrees.

### 8. Kickoff Checklist

- Current status: partially ready from first-offer and discovery-to-proposal files.
- Required decision: approve the first AI Readiness Assessment kickoff checklist and customer input request.
- Self-resolvable by DigiBot: yes for draft; no for final approval.
- Founder action needed: yes.
- Exact noVNC/browser path or document/details required: noVNC not required unless kickoff materials must be edited in a browser-only system; founder can approve checklist in Telegram or internal review.
- Next path:
  - DigiBot prepares a short kickoff checklist.
  - Founder approves customer input request.
  - Checklist is used only after proposal acceptance/payment path is confirmed.
- Impact on 45-day revenue plan: medium; it affects start speed after commercial acceptance.

## Readiness Summary

- Quote readiness: not ready until pricing is approved.
- Proposal readiness: partial; needs final proposal owner and template/SOW approval.
- Invoice readiness: not ready until invoice method, payment method, billing owner, and company/tax details are confirmed.
- Start readiness: partial; kickoff checklist can be drafted but needs founder approval.

## Next Milestone

Close founder decisions for pricing, proposal owner, billing owner, invoice method, payment method, company/tax/GST details, and signature method before approving any new outreach batch.

## No-Hallucination Confirmation

No outreach was sent. No email was sent. No form was submitted. LinkedIn was not used. No account was contacted. No proposal, invoice, payment, customer acceptance, billing start, or company/tax detail is claimed as verified.
