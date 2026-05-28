# Founder Commercial Decision Sheet

Status: Internal founder decision sheet. No option is approved yet.
Created: 2026-05-28

## Purpose

Capture founder decisions required to make DigiScience ready to quote, propose, invoice, and start the Legal Document Intelligence AI Readiness Assessment.

Do not use any option externally until founder approval is recorded.

## 1. Pricing

### Option A: Low-Friction First Customer

- Price range: INR 75,000-1,25,000 / USD 900-1,500.
- Scope: smallest assessment; 1 workflow, 1-2 stakeholder calls, lightweight readiness scorecard, pilot go/no-go recommendation.
- When to use: first paid customer, fast close, low procurement friction.
- Risk: may underprice effort and leave limited room for deeper governance/security review.
- Recommendation: use if buyer is interested but budget/procurement friction is high.
- Founder decision field: Pending.
- Self-resolve path: DigiBot can draft proposal language and SOW scope for this option.
- noVNC/founder path if login/auth is needed: no login required for decision; founder can approve in Telegram. Payment/invoice setup may later require noVNC if portal access is needed.

### Option B: Standard Paid Assessment

- Price range: INR 2,00,000-3,50,000 / USD 2,400-4,200.
- Scope: normal assessment; 1 priority workflow, 2-4 stakeholder calls, workflow/data/risk/governance review, readiness scorecard, pilot scope, final readout.
- When to use: serious buyer with stakeholder access, urgency, and procurement path.
- Risk: higher approval friction and slower first close.
- Recommendation: use when buyer has clear budget signal and wants serious assessment scope.
- Founder decision field: Pending.
- Self-resolve path: DigiBot can draft standard proposal and deliverables section.
- noVNC/founder path if login/auth is needed: no login required for pricing decision; founder can approve in Telegram.

### Option C: Assessment Credited Toward 45-Day Pilot

- Price range: INR 1,50,000-2,50,000 / USD 1,800-3,000.
- Scope: paid assessment with pilot conversion logic; readiness scorecard, pilot scope, success criteria, governance guardrails, and recommendation.
- When to use: buyer shows pilot intent but wants risk reduction before committing.
- Risk: credit can reduce near-term margin and needs a clear expiry window.
- Recommendation: recommended default for the first serious buyer, subject to founder-approved credit percentage.
- Founder decision field: Pending.
- Self-resolve path: DigiBot can draft credit logic and pilot-conversion language.
- noVNC/founder path if login/auth is needed: no login required for decision; founder can approve in Telegram. Payment/invoice setup may later require noVNC if portal access is needed.

## 2. Proposal Owner

### Option A: DigiBot Drafts, Founder Approves

- Recommendation: recommended choice.
- Founder decision field: Pending.
- Self-resolve path: DigiBot prepares proposal/SOW draft within the 24-hour SLA after qualified discovery.
- noVNC/founder path if login/auth is needed: no login required unless proposal must be edited in a browser-only tool; founder can approve in Telegram or internal review.

### Option B: Founder Drafts, DigiBot Formats

- Recommendation: use only if founder wants direct control over commercial wording.
- Founder decision field: Pending.
- Self-resolve path: DigiBot formats founder-provided draft and checks no-hallucination/no-send rules.
- noVNC/founder path if login/auth is needed: no login required unless founder drafts inside a private tool requiring noVNC/browser login.

### Option C: Shared Workflow

- Recommendation: viable backup; founder gives bullets, DigiBot drafts, founder edits/approves.
- Founder decision field: Pending.
- Self-resolve path: DigiBot turns founder inputs into proposal/SOW draft.
- noVNC/founder path if login/auth is needed: no login required unless a private editor or e-sign platform must be accessed.

## 3. Billing Owner

### Option A: Founder Handles Billing Manually

- Recommendation: recommended for first customer if no billing tool is configured.
- Founder decision field: Pending.
- Self-resolve path: DigiBot prepares invoice field checklist and payment-instruction placeholder.
- noVNC/founder path if login/auth is needed: founder may need noVNC/browser for bank, GST, accounting, or payment portal login/2FA.

### Option B: DigiBot Prepares Invoice Draft

- Recommendation: useful only after founder provides non-secret invoice details and approved payment terms.
- Founder decision field: Pending.
- Self-resolve path: DigiBot prepares a draft invoice text/checklist for founder review, without storing bank secrets in Git.
- noVNC/founder path if login/auth is needed: founder must provide private billing details or open relevant portal through noVNC/browser if details are not available.

### Option C: Accounting Tool / Portal To Be Configured

- Recommendation: defer unless founder already has a tool ready; setup may slow first close.
- Founder decision field: Pending.
- Self-resolve path: DigiBot can document setup checklist after founder identifies the tool.
- noVNC/founder path if login/auth is needed: founder opens accounting portal through noVNC/browser and completes login/2FA manually.

## 4. Payment Method

### Option A: Bank Transfer

- Recommendation: recommended first method if business bank details are ready.
- Founder decision field: Pending.
- Self-resolve path: DigiBot prepares non-secret payment instruction wording.
- noVNC/founder path if login/auth is needed: founder provides approved bank-transfer instructions privately or opens bank portal through noVNC/browser if details must be confirmed.

### Option B: UPI

- Recommendation: use only if suitable for business payments and founder approves.
- Founder decision field: Pending.
- Self-resolve path: DigiBot prepares placeholder payment wording.
- noVNC/founder path if login/auth is needed: founder provides approved business UPI details privately; noVNC may be needed if verification requires banking/app access.

### Option C: Razorpay Payment Link

- Recommendation: good for quick payment if Razorpay account is ready.
- Founder decision field: Pending.
- Self-resolve path: DigiBot can draft payment-link instructions after founder creates/approves link.
- noVNC/founder path if login/auth is needed: founder opens Razorpay through noVNC/browser and completes login/2FA manually.

### Option D: Stripe / Payment Link If Available

- Recommendation: use only if Stripe/payment-link account is already available and appropriate.
- Founder decision field: Pending.
- Self-resolve path: DigiBot can draft payment-link instructions after founder creates/approves link.
- noVNC/founder path if login/auth is needed: founder opens Stripe/payment provider through noVNC/browser and completes login/2FA manually.

### Option E: Other

- Recommendation: use only if founder specifies method and confirms it is acceptable for business collection.
- Founder decision field: Pending.
- Self-resolve path: DigiBot documents the chosen method after founder approval.
- noVNC/founder path if login/auth is needed: depends on provider; founder must complete any login/2FA manually through noVNC/browser.

## 5. Contract / Signature Method

### Option A: Email Acceptance

- Recommendation: recommended for lowest friction if buyer accepts it.
- Founder decision field: Pending.
- Self-resolve path: DigiBot drafts email acceptance wording and acceptance criteria.
- noVNC/founder path if login/auth is needed: no login required unless final email is sent through a mailbox session; sending still requires founder approval.

### Option B: Signed PDF

- Recommendation: use if buyer requires formal signature but e-sign is unavailable.
- Founder decision field: Pending.
- Self-resolve path: DigiBot drafts signature block and SOW PDF content.
- noVNC/founder path if login/auth is needed: founder may need noVNC/browser if signing tool or PDF workflow requires login.

### Option C: E-Sign Tool

- Recommendation: use if founder already has an e-sign tool available.
- Founder decision field: Pending.
- Self-resolve path: DigiBot can prepare signature packet checklist.
- noVNC/founder path if login/auth is needed: founder opens e-sign tool through noVNC/browser and completes login/2FA manually.

### Option D: Purchase Order

- Recommendation: use if buyer procurement requires PO before kickoff.
- Founder decision field: Pending.
- Self-resolve path: DigiBot can draft PO acceptance checklist and proposal language.
- noVNC/founder path if login/auth is needed: no DigiBot login required; buyer procurement handles PO, founder confirms acceptance path.

## Recommended Decision Set For First Customer

- Pricing: Option C for serious buyer; Option A for low-friction first customer.
- Proposal owner: DigiBot drafts, founder approves.
- Billing owner: founder handles billing manually for first customer.
- Payment method: bank transfer if business payment details are ready.
- Contract/signature method: email acceptance first; signed PDF if buyer requires formal signature.

All recommendations are pending founder approval.

## Validation

1. What you did: Created the founder commercial decision sheet.
2. Evidence: This file exists at `ops/founder-commercial-decision-sheet.md`.
3. What you checked: Quote-to-cash readiness pack, pricing decision file, and proposal/billing readiness checklist.
4. What is still unverified: Founder-approved pricing, proposal owner, billing owner, payment method, contract/signature method, and invoice/tax details are not verified.
5. Why this supports the 45-day revenue goal: It converts commercial blockers into specific founder decisions so DigiScience can quote and invoice faster after a qualified response.
6. No-hallucination confirmation: No option is marked approved, and no customer, quote, proposal, invoice, payment, or billing start is claimed.
