from __future__ import annotations

from dataclasses import asdict
from typing import Iterable

from .models import AdmissionDecision, ClusterPolicy, WorkloadRequest


def build_usage_report(
    cluster: ClusterPolicy,
    workloads: Iterable[WorkloadRequest],
    decisions: Iterable[AdmissionDecision],
) -> dict[str, object]:
    workload_by_id = {item.workload_id: item for item in workloads}
    rows: list[dict[str, object]] = []
    total_gpu_hours = 0.0
    total_estimated_cost = 0.0

    for decision in decisions:
        workload = workload_by_id[decision.workload_id]
        gpu_hours = 0.0
        estimated_cost = 0.0
        if decision.status == "admitted":
            gpu_hours = decision.allocated_gpu_units * workload.duration_hours
            estimated_cost = gpu_hours * cluster.hourly_rate_per_gpu_unit
            total_gpu_hours += gpu_hours
            total_estimated_cost += estimated_cost

        rows.append(
            {
                **asdict(decision),
                "team": workload.team,
                "owner": workload.owner,
                "cost_center": workload.cost_center,
                "profile": workload.profile,
                "duration_hours": workload.duration_hours,
                "gpu_hours": round(gpu_hours, 4),
                "estimated_cost": round(estimated_cost, 2),
                "evidence_label": "simulated",
            }
        )

    return {
        "evidence_label": "simulated",
        "assumption": "Cost uses a synthetic GPU-equivalent hourly rate.",
        "total_gpu_hours": round(total_gpu_hours, 4),
        "total_estimated_cost": round(total_estimated_cost, 2),
        "workloads": rows,
    }
