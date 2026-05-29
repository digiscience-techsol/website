# Quote-To-Cash Readiness Pack

Status: Internal readiness pack. Do not publish.
Created: 2026-05-28

## Current Answer

Can DigiScience quote, propose, invoice, and start tomorrow?

Partially.

DigiScience now has founder-approved first-customer commercial defaults for quote/proposal dry run and first-customer use. Real invoice issuance and kickoff still require sensitive billing, tax, payment, and signatory details through a secure private path or founder-led temporary noVNC session if needed.

## Required Readiness Areas

### 1. Final Pricing

- Current status: approved for first-customer use.
- Approved decision: Option A, AI Readiness Assessment at INR 1,00,000 + applicable taxes.
- Self-resolvable by DigiBot: yes for proposal wording using approved defaults.
- Founder action needed: no for commercial default; yes for any exception or discount.
- Exact noVNC/browser path or document/details required: noVNC not required; founder can approve pricing in Telegram or provide a private commercial decision note.
- Next path:
  - DigiBot uses approved Option A price in placeholder proposal/invoice dry-run files.
  - Founder approves any customer-facing final proposal before sending.
- Impact on 45-day revenue plan: high; without approved pricing, DigiScience cannot issue a quote or proposal quickly.

### 2. Proposal Owner

- Current status: approved for first-customer use.
- Approved decision: DigiBot drafts, founder approves.
- Self-resolvable by DigiBot: partially.
- Founder action needed: only final approval before customer-facing use.
- Exact noVNC/browser path or document/details required: noVNC not required; founder can confirm owner/approver in Telegram.
- Next path:
  - DigiBot drafts proposal/SOW pack.
  - Founder confirms whether DigiBot owns first draft and founder owns final approval.
  - Proposal SLA becomes active after first qualified discovery.
- Impact on 45-day revenue plan: high; unclear ownership can delay proposal issuance after a qualified reply.

### 3. Billing Owner

- Current status: approved for first-customer use.
- Approved decision: founder handles billing.
- Self-resolvable by DigiBot: no.
- Founder action needed: yes, for actual invoice issuance, payment tracking, and confirmation.
- Exact noVNC/browser path or document/details required: noVNC may be required if billing owner must access accounting, banking, GST, or payment portal; otherwise founder can provide owner name/role privately.
- Next path:
  - Founder assigns billing owner.
  - Billing owner confirms invoice process and payment confirmation process.
  - DigiBot records only non-secret operating steps in `ops/`.
- Impact on 45-day revenue plan: high; without billing owner, accepted proposal may not convert into billing start.

### 4. Invoice Method

- Current status: approved for first-customer use.
- Approved decision: manual invoice.
- Self-resolvable by DigiBot: partially.
- Founder action needed: yes.
- Exact noVNC/browser path or document/details required:
  - Founder provides approved invoice fields in a secure private channel.
  - If using an accounting portal, founder opens the portal through noVNC/browser and completes login/2FA manually.
- Next path:
  - DigiBot prepares invoice draft with placeholders only.
  - Founder/billing owner issues invoice after accepted proposal.
- Impact on 45-day revenue plan: high; no invoice method means payment cannot be requested cleanly.

### 5. Payment Method

- Current status: approved for first-customer use.
- Approved decision: company bank transfer via manual invoice. Razorpay/Stripe deferred.
- Self-resolvable by DigiBot: no.
- Founder action needed: yes.
- Exact noVNC/browser path or document/details required:
  - Founder provides approved company bank transfer instructions privately.
  - Razorpay/Stripe are deferred and not required for first revenue.
- Next path:
  - Founder provides or verifies company bank transfer instructions privately.
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

- Current status: approved for first-customer use.
- Approved decision: email acceptance for assessment; signed PDF/SOW for pilot.
- Self-resolvable by DigiBot: partially.
- Founder action needed: yes.
- Exact noVNC/browser path or document/details required:
  - Email acceptance: founder approves acceptance wording.
  - Signed PDF: founder provides signature process and authorized signer.
  - E-sign: founder opens e-sign tool through noVNC/browser and completes login/2FA manually if needed.
  - Purchase order: founder confirms whether PO is required before kickoff.
- Next path:
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

- Quote readiness: commercially ready with approved first-customer defaults.
- Proposal readiness: commercially ready for DigiBot draft and founder approval.
- Invoice readiness: partial; method/payment/billing owner approved, but sensitive company/tax/bank details remain needed outside Git.
- Start readiness: partial; kickoff checklist can be drafted but needs founder approval.

## Next Milestone

Collect remaining sensitive company/tax/billing/payment fields through a secure private path or founder-led temporary noVNC session, then prepare the first customer-facing proposal/invoice only after founder review.

## No-Hallucination Confirmation

No outreach was sent. No email was sent. No form was submitted. LinkedIn was not used. No account was contacted. No proposal, invoice, payment, customer acceptance, billing start, or company/tax detail is claimed as verified.
