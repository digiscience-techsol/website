# Proposal Billing Readiness Checklist

Status: Internal execution readiness checklist. Do not publish.
Created: 2026-05-28

## Purpose

Check whether DigiScience can propose, invoice, collect payment, sign, and start work if a qualified prospect replies.

Current answer: not fully ready.

## Readiness Checklist

| Item | Ready | Evidence | Action needed | Owner | Founder help needed |
| --- | --- | --- | --- | --- | --- |
| Proposal owner | partial | `ops/ai-readiness-assessment-pricing-decision.md` says DigiBot drafts and founder approves final proposal. | Founder must confirm proposal owner and final approver. | Founder / DigiBot | yes |
| Proposal template status | partial | First-offer and proposal skeleton materials exist, but no locked first-customer proposal pack is approved for this offer. | Create/approve final Legal Document Intelligence AI Readiness Assessment proposal template. | DigiBot draft / Founder approve | yes |
| Commercial terms status | no | Price ranges and payment terms are proposed only; no founder-approved final price. | Founder must approve option, exact price/range, payment terms, and credit logic if applicable. | Founder | yes |
| Invoice method | no | No approved invoice method is recorded in current execution docs. | Confirm whether invoice will be generated manually, through accounting software, payment gateway, bank invoice, or another method. | Founder / finance owner | yes |
| Payment method | no | No approved payment method is recorded in current execution docs. | Confirm bank transfer, UPI, payment gateway, Stripe/Razorpay, or other method. | Founder / finance owner | yes |
| Payment account readiness | no | No payment account readiness evidence is recorded. | Confirm receiving account, payment instructions, and whether account can receive business payments. | Founder / finance owner | yes |
| Tax/GST/company details readiness | no | No verified billing entity, GST/tax details, invoice address, or legal entity details are recorded in this readiness file. | Provide exact company billing details and tax/GST information if applicable. | Founder / finance owner | yes |
| Statement of work readiness | partial | Offer scope, deliverables, timeline, and success criteria exist in `ops/legal-ai-first-offer-final.md`. | Convert offer details into a short SOW / proposal appendix and approve. | DigiBot draft / Founder approve | yes |
| Kickoff criteria | partial | Kickoff criteria exist in `ops/45-day-discovery-to-proposal-sla.md`. | Lock first assessment kickoff checklist and customer input request. | DigiBot draft / Founder approve | yes |
| Contract/signature method | no | No approved signature method is recorded. | Confirm whether acceptance is by email approval, signed PDF, e-sign, purchase order, or SOW signature. | Founder | yes |
| Customer onboarding handoff | partial | Customer input requirements exist in `ops/legal-ai-first-offer-final.md`; onboarding pack exists elsewhere in ops. | Prepare one first-assessment handoff checklist tied to the offer. | DigiBot draft / Founder approve | yes |
| Missing items | no | Execution-gate and pricing files identify unresolved commercial and billing items. | Close pricing, invoice, payment, tax/company details, signature, and kickoff handoff gaps. | Founder / DigiBot | yes |

## Billing Method Check

### What Was Checked

- Existing execution gate: `ops/45-day-revenue-execution-gate.md`.
- Pricing decision file: `ops/ai-readiness-assessment-pricing-decision.md`.
- First offer file: `ops/legal-ai-first-offer-final.md`.
- Discovery-to-proposal SLA: `ops/45-day-discovery-to-proposal-sla.md`.

### What Is Missing

- Approved invoice method.
- Approved payment method.
- Payment receiving account.
- Billing entity / company details.
- GST/tax details if applicable.
- Invoice recipient data process.
- Payment terms approved for first assessment.
- Contract or signature method.

### Can DigiBot Configure It?

Partial.

DigiBot can prepare:

- Invoice information checklist.
- Payment instruction template.
- Proposal/SOW draft.
- Customer onboarding handoff checklist.
- Founder approval checklist.

DigiBot cannot configure without founder action:

- Bank/payment account.
- Payment gateway.
- Tax/GST data.
- Accounting/invoicing portal.
- Authorized signature method.
- Final commercial approval.

### Founder Action Required

Founder action required: yes.

Exact noVNC/browser path or document needed:

- If invoice/payment setup is in an accounting portal: founder must open the portal through noVNC/browser and complete login/2FA manually.
- If payment gateway is used: founder must open Razorpay/Stripe/bank/payment provider through noVNC/browser and complete login/2FA manually.
- If bank transfer is used: founder must provide an approved payment instruction document or exact bank details in a secure private channel, not in public Git files.
- If GST/tax details are required: founder must provide company legal name, registered address, GSTIN/tax identifiers if applicable, invoice contact, and payment terms in a secure private channel.
- If signature is required: founder must approve email acceptance, signed PDF, e-sign tool, or purchase order route.

## Missing Items Summary

Must close before sending a proposal:

- Founder-approved price.
- Founder-approved proposal owner and approver.
- Invoice method.
- Payment method.
- Billing entity and tax/company details.
- Contract/signature method.

Can close immediately after a qualified response:

- Final proposal/SOW draft.
- Customer onboarding handoff.
- Kickoff checklist for selected workflow.

## Validation

1. What you did: Created the internal proposal and billing readiness checklist.
2. Evidence: This file exists at `ops/proposal-billing-readiness-checklist.md`.
3. What you checked: Existing execution gate, pricing decision, first-offer, and discovery-to-proposal SLA files.
4. What is still unverified: Invoice method, payment method, payment account, tax/GST/company details, signature method, and final proposal template are not verified.
5. Why this supports the 45-day revenue goal: It identifies the quote-to-cash blockers that must be closed before a qualified prospect can become paid revenue.
6. No-hallucination confirmation: No proposal, invoice, payment, tax detail, customer acceptance, signature, or billing start is claimed.
