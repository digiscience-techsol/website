from __future__ import annotations

import unittest

from training_factory.config import TrainingConfig


class TrainingConfigTests(unittest.TestCase):
    def test_valid_pytorch_configuration(self) -> None:
        config = TrainingConfig(experiment="synthetic-ddp", framework="pytorch")
        self.assertEqual(config.framework, "pytorch")
        self.assertEqual(config.to_dict()["evidence_label"], "requires-framework-runtime")

    def test_valid_tensorflow_configuration(self) -> None:
        config = TrainingConfig(experiment="synthetic-multiworker", framework="tensorflow")
        self.assertEqual(config.framework, "tensorflow")

    def test_invalid_framework_is_rejected(self) -> None:
        with self.assertRaises(ValueError):
            TrainingConfig(
                experiment="bad",
                framework="spark",  # type: ignore[arg-type]
            )

    def test_batch_larger_than_dataset_is_rejected(self) -> None:
        with self.assertRaises(ValueError):
            TrainingConfig(
                experiment="bad-batch",
                framework="pytorch",
                samples=8,
                batch_size=16,
            )

    def test_required_evidence_label_cannot_be_empty(self) -> None:
        with self.assertRaises(ValueError):
            TrainingConfig(
                experiment="missing-label",
                framework="tensorflow",
                evidence_label="",
            )


if __name__ == "__main__":
    unittest.main()
