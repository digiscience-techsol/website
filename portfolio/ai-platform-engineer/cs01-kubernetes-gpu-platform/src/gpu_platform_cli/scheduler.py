from __future__ import annotations

from dataclasses import replace
from math import isclose
from typing import Iterable

from .models import AdmissionDecision, ClusterPolicy, TeamPolicy, WorkloadRequest


PROFILE_GPU_UNITS: dict[str, float] = {
    "full-gpu": 1.0,
    "mig-1g": 0.125,
    "mig-2g": 0.25,
    "mig-3g": 0.5,
    "time-slice-1of2": 0.5,
    "time-slice-1of4": 0.25,
}


class Scheduler:
    """Deterministic, CPU-safe simulation of queue admission and pre-emption.

    This is not a replacement for Run:ai, Kueue, Volcano or the Kubernetes
    scheduler. It is evidence that the portfolio can express and test the
    underlying quota, borrowing, priority and pre-emption decisions.
    """

    def __init__(
        self,
        cluster: ClusterPolicy,
        team_policies: Iterable[TeamPolicy],
    ) -> None:
        self.cluster = cluster
        self.team_policies = {policy.team: policy for policy in team_policies}
        if not self.team_policies:
            raise ValueError("at least one team policy is required")

    def schedule(self, workloads: Iterable[WorkloadRequest]) -> list[AdmissionDecision]:
        ordered = sorted(workloads, key=lambda item: (item.submitted_order, item.workload_id))
        workload_by_id = {workload.workload_id: workload for workload in ordered}
        if len(workload_by_id) != len(ordered):
            raise ValueError("workload_id values must be unique")

        decisions: dict[str, AdmissionDecision] = {}
        admitted_ids: list[str] = []
        team_allocated = {team: 0.0 for team in self.team_policies}
        cluster_allocated = 0.0

        for workload in ordered:
            invalid_reason = self._validate_request(workload)
            if invalid_reason:
                decisions[workload.workload_id] = AdmissionDecision(
                    workload_id=workload.workload_id,
                    status="rejected",
                    reason=invalid_reason,
                )
                continue

            policy = self.team_policies[workload.team]
            projected_team = team_allocated[workload.team] + workload.gpu_units
            if projected_team > policy.hard_cap_gpu_units and not isclose(
                projected_team, policy.hard_cap_gpu_units
            ):
                decisions[workload.workload_id] = AdmissionDecision(
                    workload_id=workload.workload_id,
                    status="rejected",
                    reason=(
                        f"team hard cap exceeded: requested total {projected_team:.3f}, "
                        f"cap {policy.hard_cap_gpu_units:.3f} GPU units"
                    ),
                )
                continue

            required = workload.gpu_units
            available = self.cluster.total_gpu_units - cluster_allocated

            if required > available and not isclose(required, available):
                candidates = sorted(
                    (
                        workload_by_id[item_id]
                        for item_id in admitted_ids
                        if workload_by_id[item_id].preemptible
                        and workload_by_id[item_id].priority < workload.priority
                    ),
                    key=lambda item: (item.priority, -item.gpu_units, item.submitted_order),
                )

                freed = 0.0
                to_preempt: list[WorkloadRequest] = []
                for candidate in candidates:
                    to_preempt.append(candidate)
                    freed += candidate.gpu_units
                    if required <= available + freed or isclose(required, available + freed):
                        break

                if required <= available + freed or isclose(required, available + freed):
                    for candidate in to_preempt:
                        admitted_ids.remove(candidate.workload_id)
                        team_allocated[candidate.team] -= candidate.gpu_units
                        cluster_allocated -= candidate.gpu_units
                        decisions[candidate.workload_id] = replace(
                            decisions[candidate.workload_id],
                            status="preempted",
                            reason=(
                                f"preempted for higher-priority workload "
                                f"{workload.workload_id}"
                            ),
                            preempted_by=workload.workload_id,
                        )
                else:
                    decisions[workload.workload_id] = AdmissionDecision(
                        workload_id=workload.workload_id,
                        status="queued",
                        reason=(
                            f"insufficient cluster capacity: requested {required:.3f}, "
                            f"available {available:.3f} GPU units"
                        ),
                    )
                    continue

            team_before = team_allocated[workload.team]
            guaranteed_remaining = max(policy.guaranteed_gpu_units - team_before, 0.0)
            borrowed = max(workload.gpu_units - guaranteed_remaining, 0.0)
            team_allocated[workload.team] += workload.gpu_units
            cluster_allocated += workload.gpu_units
            admitted_ids.append(workload.workload_id)
            decisions[workload.workload_id] = AdmissionDecision(
                workload_id=workload.workload_id,
                status="admitted",
                reason=(
                    "admitted within guaranteed quota"
                    if borrowed == 0
                    else f"admitted with {borrowed:.3f} borrowed GPU units"
                ),
                allocated_gpu_units=workload.gpu_units,
                borrowed_gpu_units=borrowed,
            )

        return [decisions[item.workload_id] for item in ordered]

    def _validate_request(self, workload: WorkloadRequest) -> str | None:
        if workload.team not in self.team_policies:
            return f"unknown team: {workload.team}"
        if workload.profile not in PROFILE_GPU_UNITS:
            return f"undefined GPU profile: {workload.profile}"

        expected_units = PROFILE_GPU_UNITS[workload.profile]
        if not isclose(workload.gpu_units, expected_units, rel_tol=1e-9, abs_tol=1e-9):
            return (
                f"profile {workload.profile} requires {expected_units:.3f} GPU units; "
                f"request declared {workload.gpu_units:.3f}"
            )

        policy = self.team_policies[workload.team]
        if workload.gpu_units > policy.max_workload_gpu_units and not isclose(
            workload.gpu_units, policy.max_workload_gpu_units
        ):
            return (
                f"workload request {workload.gpu_units:.3f} exceeds team maximum "
                f"{policy.max_workload_gpu_units:.3f} GPU units"
            )
        return None
