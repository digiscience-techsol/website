# Manufacturing AI Demo Storyboard

Date: 2026-05-25
Status: Internal demo storyboard. Do not publish.

This storyboard uses blueprint/sample/demo data only. Do not use customer data, customer logos, or real customer case study claims.

## Demo Goal

Show how DigiScience can help manufacturing teams identify maintenance risk, quality issues, and operational improvement signals using AI while preserving human review, safety, auditability, and governance controls.

The demo is assistive and does not control equipment.

## Demo Setup

Demo persona:

- Plant Maintenance Head reviewing risk signals for one sample production line.
- Quality Head reviewing optional sample inspection output.

Demo data:

- Synthetic equipment list.
- Synthetic sensor readings.
- Synthetic maintenance event history.
- Synthetic downtime records.
- Optional synthetic good/bad inspection images or tabular quality samples.

Demo outputs:

- Failure-risk score.
- Anomaly timeline.
- Maintenance event summary.
- Optional quality inspection result.
- Reviewer decision.
- Alert/dashboard.
- Final pilot report.

## Flow 1: Sample Machine / Equipment Data

Narrative:

The demo begins with a synthetic asset list for one production line.

Show:

- Machine ID.
- Equipment type.
- Line/station.
- Criticality.
- Operating hours.
- Recent alarms.
- Maintenance history count.

Controls:

- Data is sample/demo only.
- No production system connection.
- Read-only analytics pattern.

## Flow 2: Maintenance Event History

Narrative:

The system reviews synthetic maintenance work orders and downtime history.

Show:

- Event date.
- Failure mode.
- Symptom.
- Maintenance action.
- Parts used.
- Downtime duration.
- Technician notes.

Controls:

- Free-text notes are treated as unverified until reviewed.
- Event labels can be corrected by maintenance reviewer.
- No sensitive employee data included.

## Flow 3: Anomaly Detection

Narrative:

The system highlights unusual patterns in sample sensor or operating data.

Show signals:

- Temperature trend.
- Vibration trend.
- Current draw.
- Cycle time.
- Alarm frequency.
- Throughput variation.

Output:

- Normal range.
- Anomaly window.
- Related maintenance event.
- Confidence or review-needed status.

Controls:

- Anomalies are not automatic failure predictions.
- Maintenance reviewer validates usefulness.

## Flow 4: Failure-Risk Scoring

Narrative:

The system ranks assets by possible maintenance risk based on sample data.

Show:

- Asset ID.
- Risk score.
- Top contributing signals.
- Last maintenance event.
- Suggested review action.
- Source data links.

Controls:

- Risk score is advisory.
- No work order is created automatically.
- Human reviewer approves next action.

## Flow 5: Quality Image / Sample Inspection Option

Narrative:

The demo optionally shows assistive inspection using synthetic sample images or tabular quality records.

Show:

- Sample image or inspection record.
- Defect class.
- AI suggested result.
- Confidence or review-needed flag.
- Reviewer approval/rejection.

Controls:

- Synthetic images only.
- No fake customer logo or real product claim.
- False positives and false negatives are reviewed.
- AI does not automatically reject product in demo.

## Flow 6: Human Review

Narrative:

Maintenance or quality reviewer validates the AI output.

Reviewer actions:

- Approve.
- Reject.
- Edit.
- Escalate.
- Add note.
- Mark as useful / not useful.

Controls:

- Human action is required before operational use.
- High-risk recommendations require escalation.
- Reviewer identity and timestamp are recorded.

## Flow 7: Alert / Dashboard

Narrative:

The dashboard summarizes the highest-priority issues for the selected line.

Show:

- Top risky assets.
- Recent anomalies.
- Downtime trend.
- Maintenance events.
- Optional quality defect trend.
- Review status.
- Recommended follow-up.

Controls:

- Dashboard is for review and planning.
- No direct write-back to plant control systems.
- Alerts include source data references.

## Flow 8: Audit Trail

Narrative:

The system records what data was used, what output was generated, and what the reviewer decided.

Show audit fields:

- Data file/source.
- Processing timestamp.
- Model/workflow version.
- Output generated.
- Reviewer action.
- Reviewer timestamp.
- Final status.

Controls:

- Sensitive values are not exposed in logs.
- Retention/deletion policy is visible.
- Audit trail supports governance review.

## Flow 9: Final Pilot Report

Narrative:

The final report explains whether the pilot is worth scaling.

Report sections:

- Selected workflow.
- Data sources used.
- Baseline metric.
- Pilot output summary.
- Reviewer feedback.
- Accuracy/usefulness notes.
- Operational risks.
- Security/governance notes.
- Scale / revise / stop recommendation.

## Flow 10: Governance Controls

Narrative:

The demo closes with the controls that make manufacturing AI safe to pilot.

Show:

- Sample/demo data only.
- Read-only source access.
- No direct equipment control.
- Human review required.
- OT/IT approval path.
- Audit trail.
- Retention/deletion rule.
- Role-based access.
- Stop conditions.

## Demo Close

Suggested close:

This demo shows a safe first pattern: use approved sample data, identify maintenance or quality signals, let the plant team validate outputs, and produce a scale/revise/stop decision. A real pilot should start with one plant, one line, one asset group, or one inspection workflow.
