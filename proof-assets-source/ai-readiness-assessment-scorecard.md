# AI Readiness Assessment Scorecard

DigiScience Techsol | Planning worksheet | 20 September 2026
Illustrative assessment method. Synthetic worked example; not customer results, certification or an approval to deploy. Practitioner and buyer review remain necessary before use in a specific engagement.

## Task and evidence sheet
Choose ONE workflow. Record the workflow owner, current monthly volume, median handling time, error/rework rate, affected users, input systems, data classification, and the decision you want a pilot to answer. Record unknowns rather than guessing.
For every score below, write an evidence reference, date, owner and unresolved gap. Suggested references are process logs, a representative sample inventory, access-control test results and an approved evaluation plan. Do not include confidential documents in a sales enquiry.

## Five dimensions: score each from 0 to 4
1. Business value: Is there a named process owner and an observed baseline for time, quality or cost?
2. Data readiness: Are representative, permitted inputs available, including difficult cases and failures?
3. Delivery readiness: Are integration boundaries, a test environment, operational owner and rollback path known?
4. Control readiness: Are access restrictions, human review, privacy requirements and failure escalation defined and tested?
5. Evaluation readiness: Is there a held-out set, current-process comparator, measurable acceptance threshold and stop rule?

## One scale, applied consistently
0 = Unknown: no usable evidence or responsible owner.
1 = Hypothesis: an owner and proposed approach exist, but evidence has not been collected.
2 = Documented: evidence and gaps are recorded; the approach has not yet been tested on representative examples.
3 = Tested: representative tests passed with recorded results and known limitations; remaining gaps have owners.
4 = Operable: the tested process has approved ownership, monitoring, exception handling and a repeatable review cycle.
Use equal weights for this initial planning tool: total = sum of five scores, maximum 20. Equal weighting makes the calculation transparent; it does not mean risks are interchangeable. The mandatory gates below override the total.

## Mandatory gates before any pilot with real data
Data permission: the owner has approved the exact data, purpose, processing boundary and authorized users.
Safety and review: a responsible person can review consequential outputs and handle failures; actions outside scope are blocked.
Evaluation: the baseline, acceptance threshold and stop rule are agreed before testing.
Operational ownership: a named person can halt the pilot, investigate incidents and revert the integration.
Mark each gate Pass / Fail / Unknown and attach evidence. A Fail or Unknown means FIX THE GAP FIRST, regardless of total score. Do not average away an access-control or data-permission failure.

## Decision worksheet
0–7: discovery first. Resolve ownership and evidence gaps before selecting a model or architecture.
8–14: close the recorded gaps, then rescore. A narrowly scoped synthetic-data experiment can inform planning but is not approval for real data.
15–20: candidate for a bounded pilot only if every mandatory gate passes and the owner approves the scope.
These bands are a proposed planning convention, not a statistically validated predictor of ROI. Adjust them with the buyer and record the rationale.

## Synthetic worked example: invoice routing
Problem: route incoming invoices to the correct reviewer; payments remain human-approved.
Illustrative scores: value 3, data 2, delivery 2, controls 2, evaluation 3. Total = 3 + 2 + 2 + 2 + 3 = 12/20.
Evidence assumptions: a synthetic baseline log and test set exist; connector behavior and role restrictions are not yet tested. The data-permission gate is Unknown.
Decision: fix gaps first. Do not deploy with real invoices. Next actions: business owner approves permitted inputs; platform owner tests reviewer permissions; evaluator tests unseen and malformed invoices. Rescore only after recording those results.

## Pilot evaluation record
Record test-set version, cases passed/failed, human corrections, processing time, false routing, unauthorized-access attempts and cost per completed case. Split easy, difficult and unseen-template cases. Compare to the same work performed through the current process. Keep failure examples, not just averages.
Before testing, the owner chooses concrete thresholds and a stop rule. For example: any unauthorized document retrieval stops the trial. A threshold written here is an example, not a universal industry benchmark.

## Next decision
Bring the completed worksheet, unanswered questions and non-confidential summary to https://digisciencetechsol.com/contact?service=ai-strategy-readiness. Do not send raw customer invoices or credentials.
Reference for evaluation planning: https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/rag/rag-solution-design-and-evaluation-guide (checked 20 September 2026). The scoring system and worked example above are illustrative DigiScience planning material, not a Microsoft scoring standard.
