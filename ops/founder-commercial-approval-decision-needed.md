# Founder Commercial Approval Decision Needed

Status: Internal founder approval gate for dry run only. No commercial decision is approved until the founder marks approve, revise, or reject.

## 1. Recommended Defaults

| Field | Recommended default for dry run |
| --- | --- |
| Offer | AI Readiness Assessment |
| Price | INR 1,00,000 + applicable taxes |
| Payment path | Manual invoice + company bank transfer |
| Proposal owner | DigiBot drafts, founder approves |
| Billing owner | Founder handles billing |
| Signature method | Email acceptance for assessment; signed PDF/SOW for pilot |
| Razorpay/Stripe | Deferred |

## 2. Founder Approval Fields

Founder decision:

- Approve: [Pending]
- Revise: [Pending]
- Reject: [Pending]

Revision notes, if any:

- [Founder to provide revisions]

## 3. Sensitive Details Still Needed

Do not enter actual sensitive values in this file.

- Legal entity name
- Billing address
- GST/tax handling
- Company bank payment instructions
- Invoice contact email
- Invoice numbering
- Payment due date
- Authorized signatory

## 4. Security Rule

- Do not store bank details, GST/tax IDs, account numbers, IFSC, SWIFT, UPI, passwords, tokens, or payment credentials in Git.
- Collect sensitive values only through a secure private path or founder-led temporary noVNC session if needed.
- Record only non-secret workflow status in Git.

## 5. Exact Founder Action

Founder action required: approve the recommended defaults for dry run, or provide exact revisions.
