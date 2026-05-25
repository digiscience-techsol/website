# Pilot Qualification Checklist

Date: 2026-05-25
Status: Internal sales and delivery qualification material. Do not publish.

## When To Recommend AI Readiness Assessment

Recommend this when the customer has a visible AI interest but is not yet ready for a build.

Signals:

- Business problem is real but not precisely scoped.
- Multiple workflows compete for priority.
- Data availability or quality is uncertain.
- Cloud/platform readiness is unclear.
- Governance, compliance, or approval path needs assessment.
- Buyer wants a credible roadmap before budget approval.
- Success metrics are not yet agreed.

Expected output:

- Workflow readiness score.
- Recommended first use case.
- Data and platform gap list.
- Security/governance requirements.
- Go/no-go recommendation for a pilot.

## When To Recommend 45-Day AI Pilot

Recommend this when one workflow can be safely tested with measurable value.

Signals:

- One workflow owner is identified.
- Business outcome is specific.
- Baseline metric exists or can be captured quickly.
- Sample or test data can be provided.
- Security constraints are known.
- Human approval path is clear.
- Sponsor can attend weekly reviews.
- Customer accepts a limited pilot scope.

Expected output:

- Working pilot or controlled proof of value.
- Baseline versus pilot metric comparison.
- Delivery and governance notes.
- Recommendation to scale, revise, pause, or stop.

## When To Recommend Responsible AI Governance Review

Recommend this when risk control is the main barrier to AI adoption.

Signals:

- AI tools are already being used without a clear policy.
- Legal, compliance, audit, privacy, or model-risk concerns are active.
- Sensitive data may be involved.
- Human approval and accountability are unclear.
- Customer needs safe operating rules before implementation.
- Buyer wants board, audit, or leadership confidence.

Expected output:

- AI risk and control map.
- Human approval model.
- Audit and monitoring recommendations.
- Use-case approval checklist.
- Responsible AI operating recommendations.

## When To Recommend Secure AI Cloud Platform

Recommend this when the customer needs a governed technical foundation before AI use cases can run safely.

Signals:

- No approved AI sandbox exists.
- Identity, secrets, logging, monitoring, or cost controls are weak.
- Multiple teams need a shared AI platform.
- Data residency, network, or vendor controls are important.
- Production path must be secure from the beginning.
- Existing cloud environment is fragmented or not AI-ready.

Expected output:

- Secure platform design.
- Access and control model.
- Deployment and monitoring path.
- Cost and governance baseline.
- Readiness plan for one or more AI pilots.

## Qualification Scoring

Score each area from 0 to 2.

- 0 = absent or unknown.
- 1 = partial or needs clarification.
- 2 = clear and usable.

Areas:

- Business problem clarity.
- Workflow boundary clarity.
- Business owner identified.
- Decision owner identified.
- Baseline metric available.
- Success metric defined.
- Data availability.
- Data quality.
- Cloud/platform readiness.
- Security/governance clarity.
- Budget signal.
- Timeline urgency.

Interpretation:

- 18-24: likely ready for 45-Day AI Pilot or Secure AI Cloud Platform scoping.
- 12-17: recommend AI Readiness Assessment or Governance Review first.
- 6-11: nurture or short advisory diagnostic only.
- 0-5: disqualify for now unless sponsor creates a clearer business case.

## Disqualification Signals

- No business problem.
- No accountable owner.
- No measurable outcome.
- No access to data, users, or process context.
- Request is only a generic chatbot or automation idea without workflow value.
- Customer expects unrestricted production access or asks DigiScience to handle secrets unsafely.
- Customer wants unsupported claims, fake metrics, or risky shortcuts.
- Timeline is urgent but approvals, data, and owner access are unavailable.
- Budget is absent and no internal sponsor is willing to progress.

## Assumptions / Dependencies

- Customer provides accurate business context.
- Customer assigns a workflow owner and technical/security contact.
- Pilot uses least-privilege access only.
- Pilot avoids production data unless explicitly approved and controlled.
- Success criteria are agreed before delivery begins.
- Weekly review cadence is available.
- Procurement and legal steps may extend timelines.

## Minimum Data / Access Requirements

For AI Readiness Assessment:

- Workflow description.
- Owner interview.
- Sample process artifacts or representative examples.
- List of systems and data sources.
- Security and compliance constraints.

For 45-Day AI Pilot:

- Approved sample/test data.
- Named business owner.
- Named technical owner.
- Sandbox or approved environment.
- Baseline and target metric.
- Human reviewer for pilot output.
- Security approval for data handling.

For Responsible AI Governance Review:

- Current AI usage or planned use cases.
- Security, legal, compliance, and audit stakeholders.
- Existing policies if available.
- Data sensitivity map.
- Approval and accountability expectations.

For Secure AI Cloud Platform:

- Cloud account/subscription/project context.
- Identity and access owner.
- Security baseline requirements.
- Logging and monitoring expectations.
- Deployment constraints.
- Cost management expectations.

## Success Criteria

Good success criteria are:

- Business-owned.
- Measurable.
- Time-bounded.
- Connected to a workflow.
- Safe to test in the selected environment.

Examples:

- Reduce document triage time by 30 percent in a test workflow.
- Cut manual report preparation effort from 5 hours to 2 hours per cycle.
- Improve first-pass classification accuracy to an agreed threshold with human review.
- Produce an AI governance checklist accepted by security and operations owners.
- Establish a secure AI sandbox with logging, access control, and cost visibility.

## Go / No-Go Decision Rules

Go when:

- Business value is clear.
- Workflow scope is narrow.
- Owner and sponsor are identified.
- Data path is available.
- Security constraints are manageable.
- Success metric is agreed.
- Timeline and budget are realistic.

No-go when:

- The request is too broad for a first step.
- Required data or approvals are unavailable.
- Risk cannot be controlled in a pilot setting.
- No one owns the outcome.
- Success cannot be measured.
- Customer expects production impact without proper controls.

Revise scope when:

- Value exists but the workflow is too large.
- Data is sensitive but sample or synthetic data can work.
- Governance is not ready but a review can unblock later work.
- Platform readiness is weak but a sandbox can be created first.
