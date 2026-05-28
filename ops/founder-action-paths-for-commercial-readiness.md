# Founder Action Paths For Commercial Readiness

Status: Internal action-path file. Do not publish.
Created: 2026-05-28

## Purpose

Define the exact next path for every commercial-readiness blocker that prevents DigiScience from quoting, proposing, invoicing, and starting quickly.

## Action Path Table

| Blocker | Can DigiBot solve alone | If yes, exact action | If no, founder action required | Exact noVNC/browser path if login/auth needed | Exact data required if document/input needed | Secret/sensitive data | Do not store in Git warning | Deadline | Revenue impact |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Pricing not approved | no | DigiBot can draft pricing language after founder selects option. | Founder selects Option A, B, or C and approves exact INR/USD price or range. | No login required; founder can approve in Telegram or private decision note. | Selected option; exact price/range; credit percentage/expiry if Option C. | commercial-sensitive | Do not store private discount logic or negotiation limits in Git unless founder approves. | Before any proposal is sent. | high |
| Proposal owner not assigned | partial | DigiBot can draft SOW/proposal from template once owner workflow is approved. | Founder confirms owner model: DigiBot drafts/founder approves, founder drafts/DigiBot formats, or shared workflow. | No login required unless proposal must be edited in private browser-only tool. | Proposal owner; final approver; turnaround SLA. | not secret, but internal | Do not store private prospect-specific negotiation notes in Git. | Before first qualified discovery response. | high |
| Billing owner not assigned | no | DigiBot can prepare invoice checklist after owner is assigned. | Founder assigns billing owner and confirms who issues invoices and tracks payment. | noVNC/browser needed only if billing owner must access accounting/bank/payment portal. | Billing owner name/role; invoice issuer; payment tracking owner. | internal-sensitive | Do not store private billing access details or credentials in Git. | Before proposal is sent. | high |
| Invoice method not configured | partial | DigiBot can prepare invoice field checklist and draft invoice structure. | Founder selects manual invoice, accounting tool, payment gateway invoice, bank invoice, or other method. | If portal is used: founder opens accounting/payment portal through noVNC/browser and completes login/2FA manually. | Invoice method; invoice template or required fields; invoice numbering format; due date. | may be sensitive | Do not store portal credentials, private invoice templates, or payment credentials in Git. | Before customer acceptance is requested. | high |
| Payment method not confirmed | no | DigiBot can prepare non-secret payment instruction placeholders. | Founder selects bank transfer, UPI, Razorpay, Stripe, or other payment method. | Bank/payment gateway path: founder opens bank/Razorpay/Stripe/payment provider through noVNC/browser and completes login/2FA manually if details or link must be created. | Payment method; payment instructions; payment account confirmation; payment link if applicable. | secret/sensitive | Do not store bank details, UPI IDs, payment links, API keys, credentials, or tokens in Git unless founder explicitly approves a safe public instruction. | Before invoice is issued. | high |
| GST/tax/company details not captured | no | DigiBot can prepare required-field checklist only. | Founder provides legal entity name, billing address, GSTIN/tax identifiers if applicable, tax treatment, invoice contact, and payment terms. | If details are in GST/accounting/company portal: founder opens portal through noVNC/browser and completes login/2FA manually. | Legal name; billing address; GSTIN/tax ID if applicable; tax treatment; invoice contact; payment terms. | sensitive | Do not store tax IDs, private addresses, or sensitive company documents in Git unless founder explicitly approves exact usage. | Before invoice/proposal is finalized. | high |
| Signature method not approved | partial | DigiBot can draft acceptance wording, signature block, or SOW signature section. | Founder selects email acceptance, signed PDF, e-sign, or purchase order route. | If e-sign tool is used: founder opens e-sign portal through noVNC/browser and completes login/2FA manually. | Signature method; authorized signer; acceptance wording; PO requirement if any. | internal-sensitive | Do not store signer private data, signatures, or e-sign credentials in Git. | Before proposal is sent. | medium-high |
| Subscription mailbox connector access denied | no | DigiBot can continue accessible-route monitoring and document limitation. | Founder grants/approves shared mailbox access or confirms accessible-route monitoring is sufficient. | Founder opens Microsoft admin/mailbox or Outlook web through noVNC/browser and completes login/2FA/manual delegation if access is to be restored. | Access decision; mailbox delegation if approved; monitoring route preference. | sensitive | Do not store mailbox credentials, cookies, tokens, or private email contents in Git. | Before relying on subscription mailbox as primary response route. | medium-high |
| LinkedIn auth pending | no | DigiBot can keep LinkedIn marked AUTH PENDING and avoid use. | Founder restores LinkedIn auth only if LinkedIn is later approved as a route. | Founder opens LinkedIn through noVNC/browser and completes login/2FA manually if approved. | LinkedIn route approval; login completion; profile/session availability. | sensitive | Do not store LinkedIn credentials, cookies, session data, or private messages in Git. | Deferred until LinkedIn route is approved. | low now, medium later |

## Recommended Immediate Founder Actions

1. Approve pricing option and exact price/range.
2. Confirm proposal owner and final approver.
3. Assign billing owner.
4. Select invoice and payment method.
5. Provide company/tax/GST details through secure private channel or noVNC portal access.
6. Approve signature method.

## No-Hallucination Confirmation

No blocker is marked solved unless the required founder decision or access exists. No credentials, bank details, tax IDs, mailbox credentials, LinkedIn credentials, payment links, customer data, proposal, invoice, payment, or billing start are stored or claimed in this file.
