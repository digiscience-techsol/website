from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from mlops_evidence.core import evaluate, generate_dataset, split_dataset, train
from mlops_evidence.gates import apply_quality_gate
from mlops_evidence.local_pipeline import run_local_lifecycle


class LocalLifecycleTests(unittest.TestCase):
    def test_synthetic_dataset_is_deterministic(self) -> None:
        first = generate_dataset(samples=100, feature_count=4, seed=7)
        second = generate_dataset(samples=100, feature_count=4, seed=7)
        self.assertEqual(first.checksum, second.checksum)
        self.assertEqual(first.features, second.features)
        self.assertEqual(first.evidence_label, "synthetic")

    def test_local_model_reaches_synthetic_quality_threshold(self) -> None:
        dataset = generate_dataset(samples=400, feature_count=6, seed=42)
        training, testing = split_dataset(dataset)
        model = train(training, epochs=120, learning_rate=0.08, seed=42)
        metrics = evaluate(model, testing)
        self.assertGreaterEqual(metrics["accuracy"], 0.75)
        decision = apply_quality_gate(metrics)
        self.assertTrue(decision.approved)
        self.assertEqual(decision.status, "candidate-approved")

    def test_gate_rejects_weak_candidate(self) -> None:
        decision = apply_quality_gate(
            {
                "accuracy": 0.5,
                "log_loss": 0.9,
                "predicted_positive_rate": 0.99,
            }
        )
        self.assertFalse(decision.approved)
        self.assertEqual(decision.status, "candidate-rejected")
        self.assertGreaterEqual(len(decision.reasons), 3)

    def test_local_lifecycle_writes_traceable_artifacts(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            output_dir = Path(temporary_directory) / "evidence"
            summary = run_local_lifecycle(output_dir=output_dir)
            self.assertTrue(summary["gate_approved"])
            self.assertEqual(
                summary["evidence_label"],
                "locally-tested-synthetic-lifecycle",
            )
            required = {
                "dataset-metadata.json",
                "model.json",
                "metrics.json",
                "quality-gate.json",
                "registry-candidate.json",
                "summary.json",
            }
            self.assertEqual(required, {path.name for path in output_dir.iterdir()})

            registry = json.loads(
                (output_dir / "registry-candidate.json").read_text(encoding="utf-8")
            )
            self.assertEqual(registry["production_approval"], "not-requested")
            self.assertIn("not proof of an MLflow registry", registry["warning"])

    def test_model_rejects_wrong_feature_width(self) -> None:
        dataset = generate_dataset(samples=100, feature_count=4, seed=5)
        training, _ = split_dataset(dataset)
        model = train(training, epochs=10, learning_rate=0.05, seed=5)
        with self.assertRaises(ValueError):
            model.predict_probability([1.0, 2.0])


if __name__ == "__main__":
    unittest.main()
