from __future__ import annotations

import unittest

from gpu_platform_cli.models import ClusterPolicy, Priority, TeamPolicy, WorkloadRequest
from gpu_platform_cli.reporting import build_usage_report
from gpu_platform_cli.scheduler import Scheduler


class SchedulerTests(unittest.TestCase):
    def setUp(self) -> None:
        self.cluster = ClusterPolicy(total_gpu_units=2.0, hourly_rate_per_gpu_unit=4.0)
        self.policies = [
            TeamPolicy("team-a", 1.0, 1.0, 1.0),
            TeamPolicy("team-b", 0.5, 0.5, 1.0),
        ]

    def workload(self, **overrides: object) -> WorkloadRequest:
        values: dict[str, object] = {
            "workload_id": "job-1",
            "team": "team-a",
            "owner": "rajiv",
            "cost_center": "CC-1",
            "profile": "full-gpu",
            "gpu_units": 1.0,
            "duration_hours": 2.0,
            "priority": Priority.NORMAL,
            "preemptible": True,
            "submitted_order": 1,
        }
        values.update(overrides)
        return WorkloadRequest(**values)  # type: ignore[arg-type]

    def test_admits_within_guaranteed_quota(self) -> None:
        decision = Scheduler(self.cluster, self.policies).schedule([self.workload()])[0]
        self.assertEqual(decision.status, "admitted")
        self.assertEqual(decision.borrowed_gpu_units, 0.0)

    def test_rejects_team_hard_cap(self) -> None:
        workloads = [
            self.workload(workload_id="job-1", submitted_order=1),
            self.workload(workload_id="job-2", submitted_order=2),
            self.workload(workload_id="job-3", submitted_order=3),
        ]
        decisions = Scheduler(ClusterPolicy(3.0, 4.0), self.policies).schedule(workloads)
        self.assertEqual([item.status for item in decisions], ["admitted", "admitted", "rejected"])
        self.assertIn("hard cap", decisions[-1].reason)

    def test_higher_priority_workload_preempts_lower_priority(self) -> None:
        workloads = [
            self.workload(workload_id="low-a", priority=Priority.LOW, submitted_order=1),
            self.workload(
                workload_id="low-b",
                team="team-b",
                priority=Priority.LOW,
                submitted_order=2,
            ),
            self.workload(
                workload_id="critical",
                priority=Priority.CRITICAL,
                submitted_order=3,
            ),
        ]
        decisions = Scheduler(self.cluster, self.policies).schedule(workloads)
        status = {item.workload_id: item.status for item in decisions}
        self.assertEqual(status["critical"], "admitted")
        self.assertIn("preempted", {status["low-a"], status["low-b"]})

    def test_rejects_profile_mismatch(self) -> None:
        decision = Scheduler(self.cluster, self.policies).schedule(
            [self.workload(profile="mig-2g", gpu_units=1.0)]
        )[0]
        self.assertEqual(decision.status, "rejected")
        self.assertIn("requires", decision.reason)

    def test_usage_report_is_explicitly_simulated(self) -> None:
        workloads = [self.workload(duration_hours=2.5)]
        decisions = Scheduler(self.cluster, self.policies).schedule(workloads)
        report = build_usage_report(self.cluster, workloads, decisions)
        self.assertEqual(report["evidence_label"], "simulated")
        self.assertEqual(report["total_gpu_hours"], 2.5)
        self.assertEqual(report["total_estimated_cost"], 10.0)


if __name__ == "__main__":
    unittest.main()
