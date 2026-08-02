from __future__ import annotations

import unittest

from placement_engine import Target, Workload, evaluate, recommend


class PlacementEngineTests(unittest.TestCase):
    def target(self, **overrides: object) -> Target:
        values: dict[str, object] = {
            "name": "onprem-hpc",
            "platform": "hpc",
            "location": "onprem",
            "allowed_classifications": ("public", "internal", "restricted"),
            "accelerators": ("cpu", "nvidia-a100"),
            "high_bandwidth_network": True,
            "queue_wait_minutes": 120.0,
            "node_hour_rate": 8.0,
            "data_transfer_rate_per_gb": 0.0,
            "transfer_bandwidth_gbps": 100.0,
            "reliability_score": 95.0,
        }
        values.update(overrides)
        return Target(**values)  # type: ignore[arg-type]

    def workload(self, **overrides: object) -> Workload:
        values: dict[str, object] = {
            "workload_id": "training-001",
            "owner": "researcher-a",
            "cost_center": "CC-4100",
            "data_classification": "internal",
            "export_allowed": True,
            "required_accelerator": "nvidia-a100",
            "nodes": 2,
            "runtime_hours": 2.0,
            "deadline_minutes": 600.0,
            "input_size_gb": 100.0,
            "output_size_gb": 10.0,
            "max_estimated_cost": 500.0,
            "requires_high_bandwidth_network": True,
            "prefer_owned_capacity": True,
            "priority": "standard",
        }
        values.update(overrides)
        return Workload(**values)  # type: ignore[arg-type]

    def test_cloud_is_rejected_when_export_is_prohibited(self) -> None:
        cloud = self.target(
            name="cloud-burst",
            platform="cloud-burst",
            location="cloud",
            queue_wait_minutes=5.0,
            node_hour_rate=15.0,
            data_transfer_rate_per_gb=0.05,
            transfer_bandwidth_gbps=20.0,
        )
        result = evaluate(self.workload(export_allowed=False), cloud)
        self.assertFalse(result.eligible)
        self.assertIn("data export to cloud is prohibited", result.reasons)

    def test_high_bandwidth_requirement_is_enforced(self) -> None:
        target = self.target(
            name="general-kubernetes",
            platform="kubernetes",
            high_bandwidth_network=False,
        )
        result = evaluate(self.workload(), target)
        self.assertFalse(result.eligible)
        self.assertTrue(any("high-bandwidth" in reason for reason in result.reasons))

    def test_owned_hpc_is_preferred_when_both_targets_fit(self) -> None:
        cloud = self.target(
            name="cloud-burst",
            platform="cloud-burst",
            location="cloud",
            queue_wait_minutes=5.0,
            node_hour_rate=15.0,
            data_transfer_rate_per_gb=0.05,
            transfer_bandwidth_gbps=20.0,
            reliability_score=96.0,
        )
        result = recommend(self.workload(), [self.target(), cloud])
        self.assertEqual(result["recommended_target"], "onprem-hpc")
        self.assertEqual(result["evidence_label"], "simulated")

    def test_urgent_deadline_can_select_cloud_burst(self) -> None:
        slow_hpc = self.target(queue_wait_minutes=300.0)
        cloud = self.target(
            name="cloud-burst",
            platform="cloud-burst",
            location="cloud",
            queue_wait_minutes=2.0,
            node_hour_rate=15.0,
            data_transfer_rate_per_gb=0.01,
            transfer_bandwidth_gbps=100.0,
            reliability_score=98.0,
        )
        result = recommend(
            self.workload(
                deadline_minutes=250.0,
                prefer_owned_capacity=False,
                input_size_gb=10.0,
                output_size_gb=1.0,
            ),
            [slow_hpc, cloud],
        )
        self.assertEqual(result["recommended_target"], "cloud-burst")

    def test_budget_can_remove_all_targets(self) -> None:
        result = recommend(
            self.workload(max_estimated_cost=1.0),
            [self.target()],
        )
        self.assertIsNone(result["recommended_target"])
        self.assertEqual(result["status"], "no-eligible-target")
        reasons = result["evaluations"][0]["reasons"]
        self.assertTrue(any("exceeds budget" in reason for reason in reasons))


if __name__ == "__main__":
    unittest.main()
