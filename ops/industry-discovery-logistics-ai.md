# Industry Discovery: Logistics AI

Date: 2026-05-25
Status: Internal industry discovery material. Do not publish.

## Target Buyers

- COO
- Logistics Operations Head
- Supply Chain Head
- Control Tower Head
- Warehouse Head
- CTO / CIO
- Customer Experience Head

## Business Problems

- Delivery exceptions create customer escalations and manual firefighting.
- Route delays and missed ETAs reduce SLA confidence.
- SLA breaches are often detected late.
- Shipment risk signals are spread across TMS, WMS, ERP, GPS, telematics, carrier portals, and spreadsheets.
- Warehouse bottlenecks slow dispatch, picking, packing, and dock operations.
- Customer service teams spend time explaining delays manually.
- Control tower teams spend high effort monitoring, triaging, and escalating issues.

## Discovery Questions

- Which logistics workflow creates the highest delay, cost, or escalation volume?
- Is the priority delivery exceptions, route delays, SLA risk, warehouse bottlenecks, shipment visibility, or customer escalation support?
- Which lanes, regions, warehouses, carriers, or customer segments should be assessed first?
- What is the current baseline: on-time delivery, SLA breach rate, exception count, escalation volume, manual control tower effort, or warehouse cycle time?
- Who owns the workflow and metric?
- What operational action would a risk alert trigger?
- What would a safe 45-day pilot prove?

## Data Readiness Questions

- What shipment, order, route, scan, GPS, telematics, carrier, and warehouse data is available?
- Are timestamps consistent across systems?
- Are delay reasons and exception codes captured consistently?
- Can historical shipment and exception data be exported safely?
- Are customer escalation notes available in a controlled way?
- Are service commitments and SLA rules available?
- Who approves data access?
- What retention and deletion rules apply?

## TMS / WMS / ERP / API / GPS / Telematics Questions

- Which systems are used: TMS, WMS, ERP, OMS, CRM, carrier portals, GPS, telematics, ELD, route planning, or visibility platforms?
- Are APIs, batch exports, database views, event streams, or files available?
- Is there a sandbox or read-only access path?
- Can GPS/telematics data be linked to shipment IDs?
- Can warehouse events be linked to orders and dispatches?
- Which systems must not be touched in phase one?

## Operational Workflow Questions

- How are exceptions detected today?
- Who triages exceptions and escalations?
- Which issues require human approval?
- How are customers notified?
- What actions are available: reroute, expedite, contact carrier, notify customer, adjust ETA, prioritize warehouse task, or escalate internally?
- What should AI never decide automatically?
- How should reviewers approve, reject, or edit recommendations?

## Security / Governance Questions

- Does the data include customer personal data, location data, pricing, supplier data, or confidential shipment details?
- Can data be processed in cloud?
- Is masking or minimization required?
- Are role-based access, audit logs, and retention controls required?
- Who approves customer-facing notification logic?
- What operational actions require human approval?

## Success Metrics

- Reduce exception triage time.
- Improve early detection of SLA risk.
- Reduce manual control tower monitoring effort.
- Improve on-time delivery visibility.
- Reduce customer escalation response time.
- Improve warehouse bottleneck visibility.
- Produce source-backed exception summaries accepted by operations reviewers.

## Red Flags

- No shipment or exception data owner is available.
- Timestamps and IDs cannot be mapped.
- No operational reviewer is available.
- Customer expects fully automated rerouting or customer messaging without approval.
- GPS/telematics data is unavailable for route-risk use cases.
- SLA definitions are unclear.
- Scope spans too many lanes, warehouses, carriers, or customers.

## Recommended First Offer Logic

Recommend AI Readiness Assessment when data readiness, system mapping, workflow owner, or first pilot priority is unclear.

Recommend 45-Day Logistics Pilot when one lane, warehouse, shipment segment, or exception workflow is selected, data can be exported, reviewers are available, and a measurable SLA/effort metric exists.

Recommend Secure AI Cloud Platform when multiple logistics workflows require a governed data ingestion, control tower, alerting, and dashboard foundation.

Recommend defer when no data path, reviewer, measurable workflow, or safe governance model exists.
