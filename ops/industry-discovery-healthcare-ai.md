# Industry Discovery: Healthcare AI

Date: 2026-05-25
Status: Internal industry discovery material. Do not publish.

## Target Buyers

- Hospital COO
- Healthcare Operations Head
- CIO / CTO
- Digital Health Head
- Patient Experience Head
- Clinical Operations Head
- Compliance / Privacy Head

Secondary stakeholders:

- Department administrator
- Nursing operations owner
- Revenue cycle / claims owner
- Medical records owner
- Quality and safety owner
- EHR/HIS owner
- IT security owner

## Business Problems

### Patient Intake Delays

- Patients wait because intake, eligibility, document collection, routing, and pre-visit questions are manually handled.
- Intake requests may arrive through phone, forms, email, portals, or walk-in workflows.
- Missing information creates repeated follow-up and appointment delay.

### Appointment Triage

- Operational teams need to route requests to the right department, urgency level, or next action.
- Triage must support staff decisions and should not replace clinical judgment.
- Poor routing increases patient frustration and staff workload.

### Documentation Workload

- Clinical and administrative teams spend time summarizing, formatting, and updating notes, letters, discharge instructions, insurance documents, and operational reports.
- Documentation workload can reduce patient-facing time and increase delays.

### Knowledge Access

- Staff need fast access to approved SOPs, policies, care pathway documents, patient instructions, forms, and operational guidance.
- Search must return source-cited answers from approved content only.

### Discharge Coordination

- Discharge tasks may involve instructions, follow-up appointments, medication guidance, insurance steps, transport, caregiver coordination, and documentation.
- Missing coordination creates delays, readmission risk, and poor patient experience.

### Claims / Admin Support

- Claims, pre-authorization, coding support, eligibility checks, and document completeness review can create administrative bottlenecks.
- AI can assist with classification, completeness checks, and staff workflow support with human review.

### Operational Bottlenecks

- Bottlenecks may appear in front desk, outpatient scheduling, diagnostics, discharge, claims, medical records, or patient communications.
- Data often sits across EHR, HIS, LIS, PACS, CRM, call center tools, spreadsheets, and manual logs.

## Discovery Call Questions

- Which healthcare workflow causes the most operational delay or staff workload today?
- Is the priority intake, triage, documentation, knowledge search, discharge coordination, claims/admin support, or operational reporting?
- Which department or service line should be assessed first?
- What is the current baseline: wait time, turnaround time, backlog, no-show rate, documentation time, claim rework, call volume, or patient satisfaction?
- Who owns the workflow and metric?
- Which staff roles are affected?
- What decisions must remain with clinicians or authorized staff?
- What should AI never decide?
- What would a safe 45-day pilot prove?
- What patient, privacy, clinical safety, or compliance constraints must be respected?

## Patient Workflow Questions

- How does the patient request enter the workflow?
- What information is collected?
- Which steps are manual?
- Where do delays or repeated follow-ups happen?
- Which requests require clinical review?
- Which requests are administrative only?
- How are urgent or high-risk cases escalated today?
- How are patients informed of next steps?
- What handoffs occur between front desk, clinical teams, operations, billing, and records?
- What workflow changes would be acceptable during a pilot?

## Clinical / Admin Documentation Questions

- Which documents or notes create the most workload?
- Are templates or approved formats already available?
- Which documents are clinical, administrative, billing, patient-facing, or internal-only?
- Who reviews and approves documentation?
- What information sources are used to prepare the document?
- Is source citation or reference back to record/document required?
- What quality issues occur today: missing fields, inconsistent language, late completion, or rework?
- What documentation tasks can be assisted without implying clinical replacement?

## Data Readiness Questions

- What data is needed for the selected workflow?
- Where does it live today?
- Can sample, de-identified, synthetic, or test data be used first?
- Does the data include PHI/PII or regulated health information?
- Are data dictionaries, sample forms, SOPs, or process maps available?
- How complete and structured is the data?
- Can records be exported safely for assessment?
- Who approves data access?
- What retention and deletion rules apply?
- Are audit logs required for every access and generated output?

## EHR / HIS / LIS / PACS / CRM Integration Questions

- Which core systems are used: EHR/EMR, HIS, LIS, PACS, RIS, CRM, call center, billing, claims, document management, or patient portal?
- Are APIs available, such as FHIR, HL7, vendor APIs, database views, or file exports?
- Is integration needed for the pilot, or can a sample/export workflow prove value first?
- Are test/sandbox environments available?
- Who owns each system?
- Are there data residency or vendor restrictions?
- Are read-only integrations acceptable?
- What identity, access, and audit requirements apply?
- What systems must not be touched during the first pilot?

## Privacy / Security Questions

- What privacy regulations and internal policies apply?
- Can de-identified, synthetic, or redacted data be used?
- Is PHI/PII processing allowed in the proposed environment?
- Are patient consent, notice, or data-processing agreements required?
- Is model training on patient data prohibited?
- Where must data be stored and processed?
- What encryption, access control, logging, monitoring, and retention controls are required?
- Who approves privacy and security controls?
- What incident response or rollback process is required?

## Human Review And Clinical Safety Questions

- Which outputs require clinician review?
- Which outputs can be reviewed by operations or admin staff?
- How are uncertain, urgent, or high-risk cases escalated?
- What should AI be allowed to suggest?
- What should AI never decide or communicate directly?
- Should AI output be hidden until reviewed?
- How should staff approve, edit, reject, or escalate output?
- What audit trail is required for reviewer action?
- How will staff be trained on AI limits?

## Success Metrics

Possible first-pilot metrics:

- Reduce intake processing time.
- Reduce missing-information follow-up.
- Improve appointment request routing accuracy with human review.
- Reduce documentation preparation time.
- Improve staff access to approved SOPs or policy knowledge.
- Reduce discharge coordination delays.
- Reduce claims/admin rework in a selected workflow.
- Improve operational visibility for one department.
- Maintain privacy, safety, and human-review compliance.

Each metric must be tied to a specific workflow, department, and reviewer.

## Red Flags

- Customer expects AI to replace clinicians or make clinical decisions.
- No privacy/security owner is involved.
- PHI/PII is required but no approved handling path exists.
- No human review workflow exists for safety-sensitive output.
- No workflow owner or reviewer is available.
- EHR/HIS integration is required immediately but no sandbox or approval exists.
- The use case is too broad across many departments.
- Success metric is undefined.
- Customer wants to use real patient data before privacy controls are approved.
- Source citation is not required for knowledge or documentation support.

## Recommended First Offer Logic

Recommend AI Readiness Assessment when:

- The buyer has multiple healthcare workflow ideas but no prioritized first use case.
- Data, privacy, integration, or review workflow readiness is unclear.
- The customer needs a safe roadmap before committing to a pilot.

Recommend 45-Day Healthcare AI Workflow Pilot when:

- One operational workflow is selected.
- Sample, de-identified, synthetic, or test data is available.
- Human review and escalation path are agreed.
- Privacy/security handling is approved.
- A measurable operational success metric exists.

Recommend Responsible AI Governance Review when:

- Privacy, clinical safety, auditability, consent, or policy control is the main blocker.
- AI tools are already being used informally by staff.
- The organization needs allowed/prohibited use cases, approval workflows, and human-review rules.

Recommend Secure AI Cloud Platform when:

- The customer needs a governed AI environment for healthcare workflows.
- Identity, access, logging, retention, data isolation, and integration controls must be established first.
- Multiple healthcare AI workflows will use a shared platform.

Recommend nurture / defer when:

- No safe data path exists.
- No human reviewer is available.
- The customer wants autonomous clinical decision-making.
- Required privacy/security approvals are unavailable.
- The workflow cannot be measured.
