# BFSI / Insurance AI Pilot Qualification Checklist

Date: 2026-05-25
Status: Internal qualification checklist. Do not publish.

## When To Recommend AI Readiness Assessment

Recommend AI Readiness Assessment when the buyer sees AI potential but has not selected a safe first regulated workflow.

Signals:

- Multiple candidate workflows exist: claims triage, underwriting review, policy document intelligence, fraud signal review, compliance evidence, audit readiness, customer service, or regulatory reporting.
- Data/document readiness is unclear.
- Core system integration path is uncertain.
- Compliance, privacy, audit, or model risk controls need discovery.
- Human approval rules are not yet defined.

Minimum output:

- Workflow readiness score.
- Data/document readiness view.
- Regulatory and model-risk constraint summary.
- Human approval and audit trail requirement map.
- Recommended first pilot candidate.
- Go/no-go recommendation.

## When To Recommend 45-Day Claims / Underwriting / Compliance AI Pilot

Recommend this when one bounded decision-support workflow can be tested safely.

Signals:

- One workflow and product/process area are selected.
- Sample, synthetic, redacted, or test records are available.
- Human reviewers are identified.
- Compliance/risk owner is involved.
- Source citation and audit trail are required.
- Pilot output is decision support, not final decision automation.
- A measurable operational, risk, or audit metric exists.

Example pilot scopes:

- Claims completeness and triage support.
- Underwriting document summary and exception flagging.
- Policy document intelligence with source citations.
- Compliance evidence summary.
- Fraud signal prioritization for human review.
- Customer service knowledge retrieval from approved policy content.

## When To Recommend Responsible AI Governance Review

Recommend this when model risk, compliance, explainability, or auditability is the main blocker.

Signals:

- Regulated decision workflows are involved.
- Risk/compliance/audit owners need governance before pilot approval.
- AI usage exists but lacks policy, approval, or audit trail.
- Human accountability, override handling, and explainability are unclear.
- The buyer needs a control framework before implementation.

Minimum output:

- AI use-case control matrix.
- Human approval and escalation rules.
- Model risk and explainability requirements.
- Audit trail and source-citation requirements.
- Allowed/prohibited workflow guidance.

## When To Recommend Secure AI Cloud Platform

Recommend this when the organization needs a secure foundation for sensitive BFSI / insurance AI workloads.

Signals:

- Financial, customer, claims, credit, health, or confidential data is involved.
- Identity, access, logging, encryption, retention, and monitoring controls must be established.
- Multiple workflows need shared document intelligence, retrieval, or decision-support capability.
- Integration with core systems requires a governed architecture.
- Model governance and auditability must be built into the platform.

## Minimum Data / Document Requirements

For AI Readiness Assessment:

- Workflow description.
- Sample process documents, forms, policies, or data dictionaries where possible.
- System list.
- Compliance, audit, and model risk constraints.
- Human decision process map.

For 45-Day Pilot:

- Approved sample, synthetic, redacted, or test records.
- Relevant policy/rule/guide documents.
- Known output format: classification, completeness check, source-cited summary, risk signal, evidence summary, or staff response draft.
- Reviewer acceptance criteria.
- Audit trail requirements.
- Retention/deletion rule.

Do not request passwords, unrestricted system access, private keys, production data dumps, or unnecessary sensitive customer records.

## Regulatory / Compliance Assumptions

- Pilot outputs are decision support only.
- Final regulated decisions remain with authorized human reviewers.
- Data minimization is required.
- Sensitive data is processed only with approved controls.
- Model training on customer data is prohibited unless separately approved in writing.
- Explainability and source citation are required for high-risk outputs.
- Audit trail is required for generated outputs and reviewer actions.

## Human Approval Requirements

Pilot requires:

- Named business workflow owner.
- Named human reviewer.
- Named compliance/risk/audit stakeholder.
- Escalation owner for high-risk or uncertain outputs.
- Reviewer action path: approve, edit, reject, escalate, override.
- Rule that AI does not make final regulated decisions.

If human approval is unavailable, do not recommend a pilot.

## Audit Trail Requirements

Audit trail should capture:

- Input record/document ID.
- Data source.
- Processing timestamp.
- AI workflow/model version.
- Generated output.
- Source citations or evidence references.
- Reviewer action.
- Reviewer timestamp.
- Override reason where applicable.
- Final status.

Audit records must avoid exposing secrets or unnecessary sensitive data.

## Integration Readiness

Assess:

- Core system ownership.
- API/export/sandbox availability.
- Read-only access path.
- Data and document ID consistency.
- Audit logging requirements.
- Vendor and regulatory restrictions.
- Whether pilot can use offline sample/export data first.

First pilot should prefer secure sample/export or sandbox workflow unless production integration is low-risk and approved.

## Success Criteria

Potential criteria:

- Claims triage time reduced.
- Completeness review effort reduced.
- Underwriting reviewer accepts source-cited summaries above an agreed threshold.
- Compliance evidence collection time reduced.
- Fraud signal review produces useful prioritization for analysts.
- Customer service research time reduced.
- Audit trail complete for all pilot outputs.
- No unauthorized sensitive data exposure.

## Go / No-Go Decision Rules

Go when:

- One workflow is selected.
- Safe sample/test/redacted/synthetic data is available.
- Human reviewer and risk/compliance stakeholder are available.
- Audit trail requirements are agreed.
- Output is decision support only.
- Success metric is measurable.

No-go when:

- Customer expects autonomous regulated decisions.
- Sensitive data is required without approved controls.
- No compliance/risk/audit owner is involved.
- No human reviewer is available.
- Integration is required but no safe access path exists.
- Model risk requirements are ignored.

Revise scope when:

- Regulated decision workflow is too sensitive but document intelligence can start.
- Integration is blocked but sample/export pilot can prove value.
- Real data is not approved but synthetic demo can validate workflow.
- Governance review must happen before pilot processing.
