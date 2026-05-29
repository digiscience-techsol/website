# Founder Commercial Decisions Locked

Status: Founder-approved commercial defaults for first-customer use. Sensitive billing, tax, and payment values remain placeholders only.

## 1. Current Commercial Defaults

| Field | Founder-approved default |
| --- | --- |
| Pricing option | Option A low-friction first customer |
| Approved price | INR 1,00,000 + applicable taxes |
| Scope | 1 workflow, 1-2 stakeholder calls, readiness scorecard, pilot go/no-go recommendation |
| Optional credit | Up to 50% credited toward 45-day pilot if signed within 30 days, founder discretion |
| Proposal owner | DigiBot drafts, founder approves |
| Billing owner | Founder handles billing |
| Invoice method | Manual invoice |
| Payment method | Company bank transfer |
| Signature method | Email acceptance for assessment; signed PDF/SOW for pilot |

## 2. Sensitive Details Still Needed

The following sensitive or operational fields are still needed before issuing a real invoice or customer-facing document. Do not store actual values in Git:

- Exact legal entity name
- Invoice billing address
- GST/tax handling if applicable
- Company bank payment instructions
- Invoice contact email
- Invoice numbering format
- Payment due date
- Acceptance wording
- Authorized signatory

## 3. Security Rule

- Do not store bank details in Git.
- Do not store GST/tax IDs in Git.
- Do not store account number, IFSC, SWIFT, UPI, or sensitive payment details in Git.
- Collect sensitive details only through secure private path or temporary noVNC session.
- Close public noVNC tunnel after use.

## 4. Roadmap Alignment

This file supports the DigiScience 45-Day Revenue Reset by locking the founder-approved first-revenue commercial path. It narrows the current quote/propose/invoice/start gate to one practical path: Option A pricing, DigiBot-drafted founder-approved proposal, founder-owned billing, manual invoice, company bank transfer, and lightweight acceptance for the assessment.

This reduces proposal delay if a qualified prospect replies, while keeping all sensitive company, tax, and bank details outside Git until the founder provides them through an approved secure path.
