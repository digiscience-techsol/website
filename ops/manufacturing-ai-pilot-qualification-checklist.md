# Manufacturing AI Pilot Qualification Checklist

Date: 2026-05-25
Status: Internal qualification checklist. Do not publish.

## When To Recommend AI Readiness Assessment

Recommend AI Readiness Assessment when the customer has manufacturing AI interest but the first safe use case is not yet clear.

Signals:

- Multiple candidate workflows exist: predictive maintenance, quality inspection, OEE visibility, spare parts, bottleneck analysis, or reporting.
- Data availability is unknown or fragmented across SCADA, MES, ERP, CMMS, QMS, historians, or spreadsheets.
- Asset IDs, failure codes, defect labels, or timestamps are inconsistent.
- OT security, cloud access, or plant approvals are not yet clear.
- Plant team needs a roadmap before committing to a pilot.

Minimum output:

- Prioritized workflow shortlist.
- Data and system readiness view.
- Security and OT/IT constraint summary.
- Recommended first pilot candidate.
- Go/no-go recommendation.

## When To Recommend 45-Day Predictive Maintenance Pilot

Recommend this when one asset group can be safely analyzed for failure-risk or anomaly signals.

Signals:

- Critical asset or asset class is selected.
- Maintenance history is available.
- Sensor, historian, alarm, operating, or inspection data is available.
- Failure or degradation events occur often enough to analyze.
- Maintenance team can review alerts and validate findings.
- Baseline metric exists: downtime, MTBF, MTTR, work orders, maintenance cost, or failure frequency.

Example pilot scope:

- One plant.
- One line or asset group.
- 6-24 months of maintenance and sensor/history data where available.
- Read-only analytics with maintenance review.

## When To Recommend Computer Vision Quality Inspection Pilot

Recommend this when one visual defect or inspection workflow can be tested using sample images.

Signals:

- One product, part, process, or inspection station is selected.
- Defect types are known.
- Good/bad sample images exist or can be collected.
- Images can be labeled by quality reviewers.
- Camera, lighting, position, and process conditions are reasonably stable.
- False-positive and false-negative tolerances are agreed.

Example pilot scope:

- One defect class or small defect group.
- One inspection station or controlled sample set.
- Assistive detection with human review.
- No direct production rejection unless explicitly approved after validation.

## When To Recommend Secure AI Cloud Platform

Recommend this when the customer needs a secure manufacturing data and AI foundation before use-case delivery.

Signals:

- Plant data needs governed ingestion from SCADA, MES, ERP, CMMS, historians, IoT, or files.
- OT/IT network, identity, logging, secrets, and monitoring controls must be established.
- Multiple plants or AI use cases need a shared platform pattern.
- Edge processing, cloud analytics, and secure dashboards are required.
- The customer needs a reusable AI-ready data layer.

## Minimum Data Requirements

For AI Readiness Assessment:

- Plant/line/process overview.
- List of priority assets or quality workflows.
- Available system list.
- Sample reports or data dictionaries if direct data cannot be shared.
- Security and OT/IT constraints.

For predictive maintenance pilot:

- Asset list and hierarchy.
- Work order or maintenance history.
- Failure events or fault/alarm history.
- Sensor or historian data where available.
- Downtime records.
- Operating context such as product, shift, speed, load, or recipe where available.

For computer vision quality pilot:

- Good and bad image samples.
- Defect definitions.
- Labeling guidance.
- Camera/lighting/context notes.
- Current inspection method and baseline.
- Reviewer validation path.

## Plant / Team Readiness

Required:

- Plant sponsor.
- Maintenance or quality owner.
- Data/system owner.
- IT/OT security owner.
- Operator or reviewer participation.
- Weekly pilot review cadence.
- Clear non-disruption rule for production.

If plant team participation is unavailable, recommend readiness assessment or defer.

## Equipment / Sensor Requirements

Predictive maintenance readiness:

- Critical asset selected.
- Sensor signals or operating history available.
- Events can be tied to asset and time.
- Maintenance work orders can be mapped to equipment.
- Downtime or fault labels exist or can be reconstructed.

Computer vision readiness:

- Image capture is possible.
- Good/bad samples are available or collectible.
- Defects are visually detectable.
- Inspection environment is controlled enough for repeatable testing.
- Quality reviewer can label and validate outputs.

## Reviewer / Operator Availability

Pilot requires:

- Named maintenance reviewer for predictive maintenance outputs.
- Named quality reviewer for inspection outputs.
- Operator feedback path if shop-floor workflow changes are proposed.
- Agreement that AI recommendations are assistive and reviewed by humans.
- Escalation path for unsafe, uncertain, or high-risk recommendations.

## Assumptions / Dependencies

- Pilot is read-only or assistive unless explicitly approved otherwise.
- Production control systems are not modified during first pilot.
- Customer provides safe sample/export data or approved sandbox access.
- OT security approves any connectivity.
- Data timestamps and IDs can be mapped enough for analysis.
- Success criteria are agreed before pilot kickoff.
- Plant operations remain the priority; pilot must not disrupt production.

## Success Criteria

Potential criteria:

- Early warning signal identified for selected failure mode.
- Maintenance reviewer validates risk-ranked asset or event insights.
- Downtime, MTBF, MTTR, or maintenance-cost baseline is established.
- Quality reviewer validates defect detection against an agreed threshold.
- Inspection effort or review time is reduced in a controlled sample.
- OEE or bottleneck visibility improves for one line.
- Pilot produces a scale / revise / stop recommendation.
- No unsafe operational action is taken without approval.

## Go / No-Go Decision Rules

Go when:

- One plant, line, asset group, or inspection workflow is selected.
- Data access path is approved.
- Baseline and success metric are agreed.
- Plant reviewer is available.
- OT/security constraints are understood.
- Pilot remains read-only or assistive.

No-go when:

- No measurable manufacturing problem is selected.
- No owner or reviewer is available.
- Required data cannot be accessed or exported.
- Production safety could be affected.
- Customer expects direct machine control without validation.
- Events or samples are too limited for a useful pilot.

Revise scope when:

- Data exists but IDs/timestamps need readiness cleanup.
- Predictive maintenance is not ready but OEE visibility is feasible.
- Computer vision is not ready but manual inspection analytics can start.
- Cloud ingestion is blocked but offline export analysis can prove value.
