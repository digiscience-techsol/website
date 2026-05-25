# Legal AI Pilot Qualification Checklist

Date: 2026-05-25
Status: Internal qualification checklist. Do not publish.

## When To Recommend AI Readiness Assessment

Recommend AI Readiness Assessment when the legal team sees value but is not yet ready for a build.

Signals:

- Multiple possible workflows exist: contract review, clause comparison, obligation extraction, knowledge search, or compliance evidence.
- Document repositories and document quality are unclear.
- Security, privilege, confidentiality, or retention constraints need discovery.
- Standard clauses, review playbooks, or fallback positions are not documented.
- Legal reviewers are interested but pilot scope is not yet narrow.
- The buyer needs a prioritized roadmap and risk view before approving a pilot.

Minimum output:

- Workflow readiness score.
- Document/data readiness view.
- Security and confidentiality risk notes.
- Recommended first pilot candidate.
- Go/no-go recommendation.

## When To Recommend 45-Day Legal Document Intelligence Pilot

Recommend a 45-Day Legal Document Intelligence Pilot when one narrow legal document workflow can be safely tested.

Signals:

- One document type or workflow is selected.
- Business owner and legal reviewer are identified.
- Sample, redacted, or synthetic documents are available.
- Human review workflow is agreed.
- Source traceability is mandatory and accepted.
- Baseline and target metric are defined.
- Security and confidentiality handling are approved for pilot use.

Example pilot scopes:

- NDA clause extraction and deviation summary.
- MSA clause comparison against standard positions.
- Obligation extraction from a defined contract set.
- Legal policy or knowledge search with source citations.
- Compliance evidence summary from approved documents.

## When To Recommend Responsible AI Governance Review

Recommend Responsible AI Governance Review when legal risk control is the primary blocker.

Signals:

- Legal, compliance, privacy, or audit teams are concerned about uncontrolled AI use.
- Attorney-client privilege or confidentiality concerns are prominent.
- The organization needs policy, approval, review, and audit controls before using legal AI.
- Business teams are already using public AI tools for legal or contract content.
- Model output review and accountability are unclear.

Minimum output:

- Legal AI use-case control matrix.
- Human review and approval model.
- Confidentiality and data handling rules.
- Source citation and audit trail requirements.
- Allowed / prohibited use cases.

## Minimum Document / Data Requirements

For assessment:

- Representative document categories.
- Description of current review workflow.
- Repository/source system list.
- Sample document metadata if documents cannot be shared.
- Security and confidentiality constraints.

For pilot:

- 10-30 approved sample, redacted, or synthetic documents, or another agreed pilot-size set.
- Standard template or expected clause positions where relevant.
- Review playbook or reviewer guidance where available.
- Known output format: summary, clause table, obligation tracker, evidence report, or search response.
- Approved storage and processing location.
- Data retention and deletion rule.

Do not request passwords, unrestricted repository access, private keys, or production data dumps.

## Reviewer Availability

Pilot requires:

- Named legal reviewer.
- Named business/workflow owner.
- Weekly review slot.
- Review acceptance criteria.
- Escalation path for uncertain or high-risk outputs.
- Agreement that AI outputs are assistive and not final legal advice.

If reviewers are unavailable, recommend readiness assessment or defer the pilot.

## Access / Security Assumptions

- Least-privilege access only.
- Prefer sample, redacted, or synthetic documents first.
- No model training on customer documents unless explicitly approved in writing.
- Sensitive documents remain in approved storage.
- Outputs include source citations.
- Audit trail records document used, output generated, reviewer action, and final status.
- Retention/deletion policy is agreed before processing.
- Customer security/privacy owner approves the pilot handling model.

## Success Criteria

Define success before kickoff.

Possible criteria:

- First-pass review time reduced by an agreed percentage.
- Clause extraction accepted by reviewer above an agreed threshold.
- Obligation summary accepted by reviewer above an agreed threshold.
- Source citations are accurate enough for reviewer validation.
- Reviewer can approve/reject/edit outputs in the agreed workflow.
- Audit trail is complete for the pilot sample set.
- No unauthorized data exposure.
- Customer can decide whether to scale, revise, or stop after pilot.

## Go / No-Go Rules

Go when:

- One legal workflow is scoped.
- Sample documents are approved.
- Legal reviewer is available.
- Source traceability is required.
- Security/confidentiality handling is approved.
- Success metric is measurable.
- Pilot can remain assistive with human review.

No-go when:

- Customer wants final legal advice without legal review.
- No document access path exists.
- Documents are too sensitive for current controls.
- Privileged material cannot be safely segregated.
- No reviewer is available.
- Success cannot be measured.
- Buyer expects guaranteed accuracy without validation.

Revise scope when:

- The workflow is too broad.
- Documents are too sensitive but synthetic samples can work.
- Governance controls must be defined before processing.
- Repository integration is blocked but upload-based pilot is possible.
