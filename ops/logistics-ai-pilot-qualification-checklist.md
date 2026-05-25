# Logistics AI Pilot Qualification Checklist

Date: 2026-05-25
Status: Internal qualification checklist. Do not publish.

## AI Readiness Assessment Criteria

Recommend readiness assessment when shipment, warehouse, carrier, route, and exception data is fragmented or the first use case is unclear.

Required outputs:

- Workflow shortlist.
- Data/system readiness view.
- Security and governance constraints.
- Recommended first pilot.
- Go/no-go decision.

## 45-Day Logistics Pilot Criteria

Recommend a 45-day pilot when:

- One workflow is selected: exception detection, SLA risk, route delay, warehouse bottleneck, or customer escalation support.
- Historical data can be exported.
- Operations reviewers are available.
- Baseline metric exists.
- Human approval path is agreed.

## Secure AI Platform Criteria

Recommend Secure AI Platform when the customer needs reusable data ingestion, shipment visibility, alerting, dashboard, and governance controls across multiple logistics workflows.

## Minimum Data

- Shipment/order history.
- Route and milestone timestamps.
- Exception codes and notes.
- SLA rules.
- Warehouse events where relevant.
- GPS/telematics where relevant.
- Customer escalation records where approved.

## Operational Readiness

- Named operations owner.
- Named reviewer.
- Clear escalation workflow.
- Weekly pilot review.
- Non-disruption rule for live operations.

## Integrations

Assess TMS, WMS, ERP, GPS/telematics, carrier portals, CRM, APIs, exports, and sandbox availability.

First pilot should prefer read-only export or sandbox access.

## Success Criteria

- Exception triage time reduced.
- SLA risk identified earlier.
- Customer escalation summary accepted by reviewers.
- Warehouse bottleneck insight validated.
- Audit trail complete.

## Go / No-Go Rules

Go when one workflow, data path, reviewer, metric, and human approval route exist.

No-go when the customer expects autonomous route/customer decisions, no data is available, no reviewer exists, or the workflow cannot be measured.
