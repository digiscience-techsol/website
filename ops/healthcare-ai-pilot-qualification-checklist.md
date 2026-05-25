# Healthcare AI Pilot Qualification Checklist

Date: 2026-05-25
Status: Internal qualification checklist. Do not publish.

## When To Recommend AI Readiness Assessment

Recommend AI Readiness Assessment when the healthcare organization sees AI potential but needs to choose a safe first workflow.

Signals:

- Multiple candidate workflows exist: intake, appointment triage, documentation, knowledge search, discharge coordination, claims/admin support, or operational reporting.
- Data availability, system access, or privacy handling is unclear.
- Human review and clinical safety rules are not yet defined.
- Integration readiness is uncertain.
- Buyer needs a practical roadmap before approving a pilot.

Minimum output:

- Workflow readiness score.
- Data and document readiness view.
- Privacy/security constraint summary.
- Human-review requirement map.
- Recommended first pilot candidate.
- Go/no-go recommendation.

## When To Recommend 45-Day Healthcare AI Workflow Pilot

Recommend this when one non-autonomous, human-reviewed workflow can be safely tested.

Signals:

- One workflow and department are selected.
- Sample, de-identified, synthetic, or test data is available.
- Human reviewer is identified.
- Privacy/security handling is approved.
- Integration can be avoided or handled through a safe export for first pilot.
- A measurable operational metric exists.

Example pilot scopes:

- Intake request classification and completeness support.
- Appointment routing support with human review.
- Admin documentation assistant using sample data.
- Approved-policy knowledge retrieval with source citations.
- Discharge coordination checklist support.
- Claims/admin completeness review.

## When To Recommend Responsible AI Governance Review

Recommend this when privacy, clinical safety, policy, or audit control is the main blocker.

Signals:

- Staff may already be using AI tools informally.
- Clinical, privacy, legal, compliance, or audit concerns are active.
- Human approval rules are unclear.
- The organization needs allowed/prohibited AI use cases.
- Patient data handling, retention, and source control need governance.

Minimum output:

- Healthcare AI use-case control matrix.
- Human review and escalation rules.
- Privacy and data handling rules.
- Audit and source-citation requirements.
- Allowed/prohibited workflow guidance.

## When To Recommend Secure AI Cloud Platform

Recommend this when the customer needs a governed technical foundation before healthcare AI workflows can run.

Signals:

- PHI/PII handling requires strict isolation, logging, and access control.
- Identity, secrets, monitoring, audit, and retention controls must be established.
- Multiple workflows will need shared AI capabilities.
- Integration with EHR/HIS/LIS/PACS/CRM requires controlled architecture.
- Customer wants a reusable secure AI environment.

## Minimum Data / Document Requirements

For AI Readiness Assessment:

- Workflow description.
- Process map or operating notes.
- Sample forms, templates, SOPs, or de-identified examples where possible.
- System list.
- Privacy and compliance constraints.

For Healthcare AI Workflow Pilot:

- Approved sample, de-identified, synthetic, or test data.
- Clear data dictionary or field descriptions where possible.
- Workflow rules or SOPs.
- Review criteria.
- Output format: classification, checklist, draft note, summary, source-cited answer, or dashboard.
- Retention/deletion rule.

Do not request passwords, unrestricted system access, private keys, production data dumps, or unnecessary patient data.

## Privacy / Compliance Assumptions

- Use privacy-safe demo/sample data first.
- PHI/PII is processed only with explicit approval and controls.
- Model training on patient data is prohibited unless separately approved in writing.
- Data minimization is required.
- Encryption, access control, audit logging, and retention rules are required.
- Patient-facing or clinical output requires human review.
- Compliance/privacy owner approval is required before real patient data use.

## Human Approval Requirements

Pilot requires:

- Named workflow owner.
- Named human reviewer.
- Escalation owner for urgent or clinical-risk cases.
- Clear rule that AI supports workflow and does not replace clinicians.
- Reviewer action path: approve, edit, reject, escalate.
- Audit trail for generated output and reviewer decision.

If human review is unavailable, do not recommend a pilot.

## Stakeholder Availability

Required stakeholders:

- Operations owner.
- Clinical or admin workflow reviewer depending on use case.
- IT/system owner.
- Privacy/compliance owner.
- Security owner where patient data or integrations are involved.

Weekly review cadence should be agreed before pilot kickoff.

## Integration Readiness

Assess:

- EHR/HIS/LIS/PACS/CRM ownership.
- API, FHIR, HL7, database, or export availability.
- Sandbox/test environment availability.
- Read-only access path.
- Audit requirements.
- Vendor restrictions.
- Whether integration is needed for pilot or can be deferred.

First pilot should prefer secure export/sample workflow unless integration is low-risk and approved.

## Success Criteria

Potential criteria:

- Intake processing time reduced.
- Missing-information follow-up reduced.
- Routing support accepted by reviewers above an agreed threshold.
- Documentation preparation time reduced.
- Knowledge retrieval returns approved source-cited answers.
- Discharge or admin checklist completion improves.
- No unauthorized patient data exposure.
- Human review and audit trail are complete.

## Go / No-Go Decision Rules

Go when:

- One workflow is selected.
- Safe sample/test/de-identified data is available.
- Human reviewer is available.
- Privacy/security handling is approved.
- Output is assistive and reviewed.
- Success metric is measurable.

No-go when:

- Customer expects AI to replace clinicians or make autonomous clinical decisions.
- PHI/PII is required without approved controls.
- No privacy/compliance owner is involved.
- No reviewer is available.
- Integration is required but no safe access path exists.
- Success cannot be measured.

Revise scope when:

- Clinical workflow is too sensitive but admin workflow can start.
- Integration is blocked but sample/export pilot can prove value.
- Real data is not approved but synthetic data demo can validate workflow.
- Governance must be defined before pilot processing.
