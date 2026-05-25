# Legal AI Demo Storyboard

Date: 2026-05-25
Status: Internal demo storyboard. Do not publish.

This storyboard uses no customer data. Use synthetic or public sample documents only.

## Demo Goal

Show how DigiScience can help a legal team review documents faster while preserving human review, source citation, auditability, and governance controls.

The demo must not imply final legal advice. It demonstrates assistive document intelligence.

## Demo Setup

Demo persona:

- Legal Operations Manager reviewing a sample vendor agreement.

Demo documents:

- Synthetic vendor agreement.
- Synthetic standard clause playbook.
- Synthetic obligation tracking template.

Demo outputs:

- Clause extraction table.
- Obligation summary.
- Source-cited risk notes.
- Reviewer approval log.
- Final report.

## Flow 1: Sample Document Upload

Narrative:

The reviewer uploads a synthetic vendor agreement into the controlled demo workspace.

Show:

- Document name.
- Document type.
- Upload status.
- Confidentiality label: synthetic demo data.
- Processing status.

Controls:

- Only approved document types.
- File retained only for demo period.
- No customer data used.

## Flow 2: Clause Extraction

Narrative:

The system extracts key clauses for first-pass review.

Show extracted fields:

- Parties.
- Effective date.
- Term and renewal.
- Termination.
- Confidentiality.
- Liability cap.
- Indemnity.
- Data protection.
- Audit rights.
- Governing law.

Controls:

- Each extracted field links to a source location.
- Low-confidence fields are flagged for reviewer attention.
- Missing clauses are highlighted.

## Flow 3: Obligation Summary

Narrative:

The system summarizes obligations that need operational tracking.

Show:

- Obligation owner.
- Obligation description.
- Trigger date or event.
- Due date or notice period.
- Source citation.
- Risk level.
- Reviewer status.

Example obligations:

- Notice before termination.
- Confidentiality duties.
- Reporting requirements.
- Audit cooperation.
- Data handling obligations.

## Flow 4: Source Citation

Narrative:

The reviewer clicks each AI-generated summary to inspect the source text.

Show:

- Document name.
- Page or section.
- Clause heading.
- Exact source excerpt.
- AI summary next to source.

Controls:

- Unsupported answers are blocked or marked as not found.
- Conflicting sources are flagged.
- Reviewer can reject the AI summary.

## Flow 5: Reviewer Approval

Narrative:

The legal reviewer validates each extracted item before it becomes part of the final output.

Show reviewer actions:

- Approve.
- Edit.
- Reject.
- Escalate.
- Add note.

Controls:

- AI output is not final until reviewed.
- High-risk clauses require mandatory reviewer approval.
- Reviewer identity and timestamp are captured.

## Flow 6: Audit Trail

Narrative:

The system records what was processed, what was generated, and what the reviewer approved.

Show audit fields:

- Document ID.
- Processing timestamp.
- AI output version.
- Source citations used.
- Reviewer action.
- Reviewer timestamp.
- Final status.

Controls:

- Audit trail is read-only for reviewers.
- Sensitive values are not exposed in logs.
- Retention policy is displayed.

## Flow 7: Final Report

Narrative:

The reviewer exports a final source-cited report for internal use.

Show report sections:

- Executive summary.
- Key clauses.
- Deviations from expected position.
- Obligations tracker.
- Open reviewer questions.
- Risk notes.
- Source citation appendix.
- Approval status.

Controls:

- Report includes a disclaimer that it is reviewer-approved internal analysis, not standalone legal advice.
- Report is stored only in the approved location.

## Flow 8: Governance Controls

Narrative:

The demo closes by showing how the workflow is controlled.

Show controls:

- No customer data in demo.
- Human review required.
- Source citation required.
- Role-based access.
- Audit trail.
- Retention/deletion rule.
- No model training on documents unless separately approved.
- Sensitive or privileged documents require additional approval.

## Demo Close

Suggested close:

This demo shows the controlled workflow pattern: document in, clauses and obligations extracted with citations, reviewer approves or rejects, audit trail records decisions, and the final report is traceable. A real pilot would start with approved sample or redacted documents and one narrow success metric.
