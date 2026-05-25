# BFSI / Insurance AI Demo Storyboard

Date: 2026-05-25
Status: Internal demo storyboard. Do not publish.

This storyboard uses privacy-safe sample data only. Do not use customer data, fake customer logos, or real customer case study claims.

## Demo Goal

Show how DigiScience can support BFSI / insurance teams with governed AI decision support, human approval, source citation, auditability, and model-risk controls.

The demo must not imply that AI makes final regulated decisions.

## Demo Setup

Demo persona:

- Claims Operations Head reviewing a sample claim.
- Compliance Head reviewing auditability and governance.

Demo data:

- Synthetic claims or policy document.
- Synthetic policy wording.
- Synthetic customer service note.
- Synthetic fraud/compliance signal list.

Demo outputs:

- Classification / triage suggestion.
- Document intelligence extraction.
- Fraud/compliance signal review.
- Source citation.
- Human approval decision.
- Audit trail.
- Final decision-support report.

## Flow 1: Sample Claims / Policy Document

Narrative:

The demo starts with a synthetic claims or policy document uploaded into a controlled workflow.

Show:

- Document ID.
- Document type.
- Product line.
- Submission channel.
- Completeness status.
- Demo data label.

Controls:

- Sample data only.
- No real customer, policy, claim, financial, or health data.
- No automatic decision.

## Flow 2: Classification / Triage

Narrative:

The system suggests an operational classification for human review.

Show:

- Suggested queue.
- Claim/application type.
- Completeness flag.
- Review priority.
- Escalation flag.
- Confidence or review-needed status.

Controls:

- Classification is decision support.
- Human reviewer confirms routing.
- High-risk or uncertain items are escalated.

## Flow 3: Document Intelligence Extraction

Narrative:

The system extracts key fields and policy references from the sample document.

Show:

- Policy or claim ID: sample only.
- Date.
- Coverage/benefit type.
- Amount or limit: synthetic.
- Exclusion or condition reference.
- Missing document flag.
- Extracted source location.

Controls:

- Every extracted field links to source evidence.
- Low-confidence fields are flagged.
- Reviewer can edit or reject extraction.

## Flow 4: Fraud / Compliance Signal Review

Narrative:

The system surfaces sample signals that may require analyst review.

Show:

- Duplicate pattern signal.
- Inconsistent information signal.
- Missing evidence signal.
- Policy condition signal.
- Compliance checklist flag.

Controls:

- Signals are not accusations or final findings.
- Analyst review is mandatory.
- False positives and false negatives are tracked.

## Flow 5: Source Citation

Narrative:

The reviewer checks the source behind each summary or signal.

Show:

- Source document.
- Section/page/field.
- Exact source excerpt.
- Generated summary.
- Reviewer note.

Controls:

- Unsupported answers are marked not found.
- Conflicting sources are flagged.
- Source evidence is required for decision-support output.

## Flow 6: Human Approval

Narrative:

The reviewer decides what to do with the AI-assisted output.

Reviewer actions:

- Approve.
- Edit.
- Reject.
- Escalate.
- Override.
- Add reason.

Controls:

- Final regulated decision remains human-owned.
- Override reason is captured.
- Reviewer identity and timestamp are logged.

## Flow 7: Audit Trail

Narrative:

The system records all decision-support activity for audit and compliance review.

Show audit fields:

- Record/document ID.
- Processing timestamp.
- Workflow/model version.
- Generated output.
- Source citation.
- Reviewer action.
- Override/escalation reason.
- Final status.

Controls:

- Sensitive values are minimized in logs.
- Audit trail supports compliance review.
- Retention/deletion policy is visible.

## Flow 8: Governance Checkpoint

Narrative:

The demo shows the governance controls before any scale-up decision.

Show:

- Allowed use case.
- Prohibited use case.
- Human approval requirement.
- Explainability requirement.
- Model risk classification.
- Data handling rule.
- Monitoring requirement.

Controls:

- No autonomous regulated decisioning.
- No model training on customer data unless separately approved.
- No production write-back in demo.

## Flow 9: Final Decision-Support Report

Narrative:

The final report summarizes the sample workflow and evidence.

Report sections:

- Classification summary.
- Extracted key fields.
- Completeness issues.
- Fraud/compliance signals for review.
- Source citation appendix.
- Reviewer action log.
- Governance notes.
- Scale / revise / stop recommendation.

Controls:

- Report is decision support.
- No real customer metric is claimed.
- Demo uses sample data and governed workflow language.

## Demo Close

Suggested close:

This privacy-safe demo shows governed decision support: sample document in, classification and extraction, signal review, source citation, human approval, audit trail, governance checkpoint, and final decision-support report. A real pilot should start with one workflow, approved sample or redacted data, and one measurable operational or control metric.
