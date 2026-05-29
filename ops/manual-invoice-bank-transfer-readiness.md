# Manual Invoice Bank Transfer Readiness

Purpose: prepare the manual invoice + bank transfer workflow without storing sensitive data.

## 1. Invoice Draft Structure

| Field | Placeholder |
| --- | --- |
| Customer name | [Customer name placeholder] |
| Customer billing address | [Customer billing address placeholder] |
| Service | AI Readiness Assessment |
| Amount | [Amount placeholder] |
| Taxes | [Taxes placeholder] |
| Payment due date | [Payment due date placeholder] |
| Bank transfer instruction | [Bank transfer instruction placeholder] |
| Authorized contact | [Authorized contact placeholder] |

## 2. Founder-Only Sensitive Details Checklist

Do NOT store actual values in Git:

- Legal entity name
- GSTIN/tax ID if applicable
- Registered address
- Bank name
- Account number
- IFSC/SWIFT if applicable
- UPI only if founder approves
- Invoice email
- Authorized signatory

## 3. noVNC / Founder Help Path

If the founder wants DigiBot to retrieve details from a bank, GST, or accounting portal:

1. Start temporary noVNC.
2. Share noVNC URL only through the approved private path.
3. State exact portal/site to open.
4. Founder logs in manually.
5. DigiBot records only non-secret workflow status.
6. Close public tunnel after use.

Do not record passwords, OTPs, account numbers, IFSC/SWIFT values, UPI IDs, GSTIN/tax IDs, bank statements, portal session data, or other sensitive payment details in Git.

## 4. Payment Workflow

1. Proposal accepted.
2. Invoice issued manually.
3. Payment received by company bank transfer.
4. Payment confirmed.
5. Kickoff scheduled.

## 5. Deferred Payment Options

- Razorpay: DEFERRED.
- Stripe: DEFERRED.
- No setup now.
- Not required for first revenue.

## 6. Roadmap Alignment

This file closes the billing-readiness gap in the DigiScience 45-Day Revenue Reset by defining the first-revenue payment workflow without requiring Razorpay, Stripe, or any payment gateway setup. It gives DigiScience a practical path to issue a manual invoice, receive payment by company bank transfer, confirm payment, and schedule kickoff once a prospect accepts the AI Readiness Assessment proposal.

It also keeps sensitive company, tax, and bank details out of Git, so the quote/propose/invoice/start gate can move forward without weakening security.
