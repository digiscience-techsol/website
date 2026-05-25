# Industry Discovery: Manufacturing AI

Date: 2026-05-25
Status: Internal industry discovery material. Do not publish.

## Target Buyers

- COO
- Plant Head
- Manufacturing Operations Head
- Maintenance Head
- Quality Head
- CIO / CTO
- Digital Transformation Head

Secondary stakeholders:

- Production manager
- Reliability engineer
- Quality engineer
- OT / automation owner
- MES / ERP owner
- EHS / compliance owner
- IT security owner

## Business Problems

### Downtime

- Production lines lose capacity due to machine stoppages, changeover delays, bottlenecks, and unresolved recurring issues.
- Downtime data may be captured inconsistently across shifts, equipment, and plants.
- Leadership may not have clear visibility into the highest-impact downtime drivers.

### Unplanned Maintenance

- Maintenance teams react after equipment failure instead of acting on early warning signals.
- Preventive maintenance may be calendar-based rather than risk-based.
- Root causes may be documented in technician notes but not converted into predictive insight.

### Quality Defects

- Defects may be detected late, after rework, scrap, or customer complaints.
- Inspection quality may vary by operator, line, shift, camera setup, lighting, or product variant.
- Quality teams may lack fast correlation between defects, machine state, batch, operator, and process parameters.

### Production Bottlenecks

- OEE losses may be spread across availability, performance, and quality.
- Bottleneck causes may change by product, shift, line, and maintenance condition.
- Manual analysis may be too slow to support daily production action.

### Spare-Parts Planning

- Spare parts may be overstocked for some equipment and unavailable for critical failures.
- Lead time, usage history, equipment criticality, and failure risk may not be connected.
- Maintenance teams may lack risk-based reorder signals.

### Inspection Effort

- Manual visual inspection can be slow, inconsistent, tiring, and hard to scale.
- High-volume inspection may need assistive computer vision with human review.
- False positives and false negatives must be tracked carefully.

### OEE Visibility

- Plant leaders may lack a single trusted view of availability, performance, quality, downtime reasons, and improvement actions.
- Data may sit across SCADA, MES, ERP, historians, maintenance systems, spreadsheets, and operator logs.

## Discovery Call Questions

- Which plant, line, asset, product, or process should be assessed first?
- What is the most expensive problem today: downtime, defects, throughput, maintenance cost, spare parts, energy, safety, or compliance?
- How is the problem measured now?
- What is the current baseline: downtime hours, MTBF, MTTR, scrap rate, rework rate, first-pass yield, OEE, inspection time, or maintenance cost?
- Which team owns the metric?
- Which failures or defects happen often enough to learn from?
- What action would the team take if an early warning or inspection signal were available?
- What would make a 45-day pilot valuable enough to continue?
- What must not be disrupted during a pilot?

## Asset / Equipment Readiness Questions

- Which assets or equipment are critical to production?
- Is an asset register available?
- Are asset IDs consistent across maintenance, production, and sensor systems?
- Are equipment hierarchy, line, cell, station, and component relationships documented?
- Which assets have the highest downtime, cost, or quality impact?
- Are operating modes, changeovers, shifts, products, and recipes captured?
- Are maintenance and failure histories linked to asset IDs?
- Are spare parts linked to equipment or failure modes?

## Maintenance Data Questions

- Where are maintenance records stored: CMMS, ERP, Excel, paper logs, technician notes, or another system?
- Are work orders, failure codes, symptoms, causes, actions, parts used, and downtime captured?
- Are preventive maintenance schedules documented?
- Are breakdown events timestamped?
- Are MTBF and MTTR tracked?
- Are technician notes structured enough to analyze?
- Are failure modes consistent or free text?
- Can historical maintenance records be exported safely?
- Are planned and unplanned maintenance events separated?

## Sensor / IoT / SCADA / MES / ERP Questions

- What systems capture machine or production data today?
- Are SCADA, PLC, historian, MES, ERP, CMMS, QMS, or IoT platforms in use?
- What sensor signals are available: vibration, temperature, pressure, current, speed, cycle time, throughput, alarms, torque, energy, or quality measurements?
- What is the data frequency and retention period?
- Are timestamps synchronized across systems?
- Can sensor data be linked to production batches, product variants, shifts, and maintenance events?
- Is data accessible through API, export, database, OPC UA, MQTT, historian connector, or files?
- Are network zones and OT/IT boundaries documented?
- Is cloud ingestion allowed, or must processing stay at edge/on-premise?

## Quality Inspection Questions

- Which defect types matter most?
- Are defect images or inspection records available?
- Are good/bad samples labeled?
- How many samples exist per defect class?
- What camera, lighting, angle, resolution, and inspection station setup exists?
- Are defects visually detectable?
- What false-positive and false-negative tolerance is acceptable?
- Who reviews inspection exceptions?
- How is quality linked to batch, machine, operator, supplier, or process setting?
- Is the goal automated rejection, assistive inspection, triage, or analytics only?

## Cloud / Platform Readiness Questions

- Which cloud or platform is approved: Azure, AWS, GCP, hybrid, edge, or on-premise?
- Is there an approved sandbox for plant data?
- Are OT and IT network boundaries defined?
- Is real-time streaming required or is batch export enough for a pilot?
- Are identity, access, logging, monitoring, secrets, and cost controls available?
- Can data be anonymized or limited for the pilot?
- Are edge devices or gateways already deployed?
- Who owns cloud architecture and security approval?

## Security / Governance Questions

- What production, safety, IP, customer, supplier, or employee data sensitivity exists?
- Can plant data leave the site?
- Are there regulatory, customer, or contractual restrictions?
- What systems are read-only for a pilot?
- What approvals are needed for OT connectivity?
- Are there cybersecurity restrictions on SCADA/MES/PLC access?
- Is audit logging required?
- Who approves model recommendations before operational action?
- What rollback or stop conditions are required?

## Success Metrics

Possible pilot metrics:

- Reduce unplanned downtime risk for selected assets.
- Improve early warning lead time before failure.
- Improve MTBF or reduce MTTR for selected equipment.
- Reduce first-pass inspection effort.
- Improve defect detection support for a selected defect class.
- Reduce scrap or rework in a controlled process area.
- Improve OEE visibility for one line.
- Improve spare-parts planning signal for critical assets.
- Reduce time spent preparing maintenance or quality reports.

Each metric must be tied to one plant, line, asset group, product family, or inspection workflow.

## Red Flags

- No asset, maintenance, quality, or production data owner is available.
- No baseline metric exists and the team cannot estimate one.
- Sensor data cannot be accessed or exported.
- Failure or defect events are too rare for a meaningful pilot.
- Equipment IDs are inconsistent across systems and cannot be mapped.
- Customer expects AI to directly control equipment without validation.
- OT security approval is absent for connected use cases.
- Operators, maintenance engineers, or quality reviewers are unavailable.
- Data quality is too poor for model development and the buyer rejects readiness work.
- Pilot scope spans too many plants, lines, assets, or defect types.

## Recommended First Offer Logic

Recommend AI Readiness Assessment when:

- Multiple manufacturing workflows compete for priority.
- Data availability, asset mapping, or system access is unclear.
- The buyer needs to select the highest-value pilot candidate.
- OT security and cloud readiness need evaluation before build.

Recommend 45-Day Predictive Maintenance Pilot when:

- One critical asset group is selected.
- Maintenance history and sensor or operating data are available.
- Failure modes occur often enough to analyze.
- Maintenance reviewers can validate alerts and recommendations.
- A measurable downtime, MTBF, MTTR, or maintenance-cost metric exists.

Recommend Computer Vision Quality Inspection Pilot when:

- One defect class or inspection point is selected.
- Good/bad sample images are available or can be collected.
- Inspection reviewers can label and validate outputs.
- Lighting, camera, and station conditions are stable enough for a pilot.
- False-positive and false-negative tolerance is agreed.

Recommend Secure AI Cloud Platform when:

- Plant data needs a governed ingestion, storage, analytics, and AI foundation.
- OT/IT controls, logging, identity, and cost visibility must be established first.
- Multiple manufacturing AI workflows will share a platform.

Recommend defer / nurture when:

- No measurable production or quality problem is selected.
- No data access path exists.
- Plant teams cannot participate.
- Required security approvals are unavailable.
- The use case would create unsafe operational impact.
