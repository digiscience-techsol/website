# Industry Discovery: HR / Recruitment AI

Date: 2026-05-25
Status: Internal industry discovery material. Do not publish.

## Target Buyers

- CHRO
- Talent Acquisition Head
- HR Operations Head
- Recruitment Operations Head
- HR Tech / Product Head
- Compliance / DEI Head

## Business Problems

- Resume screening volume creates recruiter workload.
- Candidate matching is inconsistent across roles.
- Interview scheduling and coordination create delays.
- Candidate experience suffers from slow follow-up.
- Compliance, fairness, and bias risk require careful governance.
- Recruiters need knowledge support for policies, job requirements, and process guidance.

## Discovery Questions

- Which hiring workflow creates the most delay or workload?
- Is the priority screening, matching, scheduling, candidate communication, interview notes, compliance, or recruiter knowledge support?
- Which role family or hiring process should be assessed first?
- What is the baseline: time-to-screen, time-to-shortlist, recruiter workload, candidate drop-off, interview scheduling delay, or quality-of-shortlist?
- Who owns hiring process quality and fairness?
- What should AI never decide?

## Candidate Data Readiness Questions

- What candidate data is available: resumes, applications, screening questions, assessments, interview notes, job descriptions, recruiter notes, and outcomes?
- Can anonymized or synthetic data be used first?
- Are job descriptions structured and approved?
- Are selection criteria documented?
- Are protected attributes excluded from matching logic?
- Who approves data handling and retention?

## ATS / HRMS Integration Questions

- Which systems are used: ATS, HRMS, job board, assessment platform, calendar, email, CRM, or onboarding system?
- Are APIs, exports, or sandbox data available?
- Is read-only access possible?
- Can candidate IDs, job IDs, and stage history be mapped?
- Which systems must not be touched during phase one?

## Governance / Fairness Questions

- What fairness, DEI, legal, and compliance rules apply?
- Is automated decisioning prohibited?
- How are selection criteria approved?
- How are model outputs audited?
- How are bias concerns reviewed?
- What human approval is required before candidate decisions?

## Human Review Questions

- Who reviews AI-assisted matches or summaries?
- Can recruiters approve, reject, edit, or escalate outputs?
- Are reasons captured for shortlist decisions?
- Are candidates ever rejected automatically?
- How should uncertain cases be handled?

## Success Metrics

- Reduce recruiter screening effort.
- Reduce shortlist preparation time.
- Improve job/resume matching support usefulness.
- Reduce scheduling coordination effort.
- Improve candidate follow-up timeliness.
- Maintain human approval and fairness controls.

## Red Flags

- Customer expects AI to make final hiring decisions.
- Fairness/compliance owner is absent.
- Protected attributes may influence output.
- No human review workflow exists.
- No approved job criteria exist.
- Candidate data handling is not approved.
- Success metric is undefined.

## Recommended First Offer Logic

Recommend AI Readiness Assessment when workflow, data, fairness, or ATS readiness is unclear.

Recommend 45-Day HR Workflow Pilot when one role family/workflow is selected, anonymized/sample data is available, recruiters review outputs, and success metrics are agreed.

Recommend Responsible AI Governance Review when fairness, bias, compliance, auditability, or automated decisioning risk is the main blocker.

Recommend defer when the buyer wants autonomous hiring decisions or cannot provide safe data/reviewer access.
