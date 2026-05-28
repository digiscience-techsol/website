# AI Readiness Assessment Invoice Info Checklist

Status: Internal billing checklist. Do not publish. Do not store secrets in Git.
Created: 2026-05-28

## Purpose

Capture the fields needed to issue an invoice for the Legal Document Intelligence AI Readiness Assessment after founder approval.

## Required Invoice Fields

### Legal Entity Name

- Field needed: DigiScience billing legal entity name.
- Current status: not provided in this checklist.
- Founder-provided field: pending.
- Secret handling: company name may be used in invoice, but verify before storing anywhere public.

### Billing Address

- Field needed: registered or approved billing address.
- Current status: not provided in this checklist.
- Founder-provided field: pending.
- Secret handling: do not publish internal billing address on public pages.

### GST / Tax ID If Applicable

- Field needed: GSTIN or applicable tax identifier, if required.
- Current status: not provided in this checklist.
- Founder-provided field: pending.
- Secret handling: store only where founder approves; do not expose publicly.

### Bank / UPI / Payment Link Details

- Field needed: approved payment method and payment instructions.
- Current status: not provided in this checklist.
- Founder-provided field: pending.
- Secret handling: do not store bank account details, UPI IDs, payment links, tokens, or portal credentials in Git unless founder explicitly approves a non-secret public-safe payment instruction.

### Invoice Number Format

- Field needed: invoice numbering convention.
- Current status: not approved.
- Suggested placeholder: `DST-YYYY-###`
- Founder-provided field: pending.

### Due Date

- Field needed: payment due date / terms.
- Current status: not approved.
- Suggested placeholder: due within 7 calendar days of invoice date.
- Founder-provided field: pending.

### Service Description

- Field needed: invoice line-item description.
- Suggested description: `Legal Document Intelligence AI Readiness Assessment`
- Founder-provided field: pending approval.

### Tax Handling

- Field needed: tax rate, GST treatment, place of supply, currency, and invoice tax language if applicable.
- Current status: not provided.
- Founder-provided field: pending.
- Secret handling: do not invent tax treatment.

## Founder-Provided Fields Needed

- Billing legal entity.
- Billing address.
- GST/tax identifiers if applicable.
- Invoice numbering format.
- Payment method.
- Payment instructions.
- Due date/payment terms.
- Tax handling.
- Authorized billing owner.
- Invoice recipient process.

## What DigiBot Can Prepare

- Invoice field checklist.
- Non-secret invoice draft structure.
- Service description.
- Payment instruction placeholder.
- Founder approval checklist.

## What Requires Founder Action

- Provide or approve company/tax details.
- Provide payment method and instructions securely.
- Confirm invoice numbering and due date.
- Confirm tax handling.
- Confirm billing owner.

## noVNC / Browser Path If Needed

- Accounting portal: founder opens portal through noVNC/browser and completes login/2FA manually.
- Bank portal: founder opens bank portal through noVNC/browser and completes login/2FA manually.
- Payment gateway: founder opens Razorpay/Stripe/payment provider through noVNC/browser and completes login/2FA manually.
- GST/tax portal: founder opens portal through noVNC/browser and completes login/2FA manually if details must be retrieved.

## Validation

1. What you did: Created the internal invoice information checklist.
2. Evidence: This file exists at `ops/ai-readiness-assessment-invoice-info-checklist.md`.
3. What you checked: Quote-to-cash readiness gaps and founder-required invoice checklist sections.
4. What is still unverified: Legal entity, billing address, GST/tax ID, payment method, payment account, tax handling, due date, and invoice numbering are not verified.
5. Why this supports the 45-day revenue goal: It identifies exact billing fields needed before a qualified prospect can be invoiced.
6. No-hallucination confirmation: No bank details, UPI details, payment link, tax ID, invoice, payment, or billing start is invented or stored.
