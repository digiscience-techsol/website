from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


def compile_pipeline(output_path: Path) -> dict[str, Any]:
    """Compile a synthetic KFP v2 lifecycle into IR YAML.

    The pipeline uses self-contained lightweight Python components. Compilation
    is proof of a valid KFP graph; it is not proof that a Kubeflow cluster run
    has completed.
    """
    try:
        from kfp import compiler, dsl
        from kfp.dsl import Dataset, Input, Metrics, Model, Output
    except ImportError as exc:  # pragma: no cover - optional runtime
        raise RuntimeError(
            "KFP is not installed. Install the project with the 'kubeflow' extra."
        ) from exc

    @dsl.component(base_image="python:3.11-slim")
    def generate_synthetic_data(
        dataset: Output[Dataset],
        rows: int = 400,
        features: int = 6,
        seed: int = 42,
    ) -> str:
        import hashlib
        import json
        import random

        rng = random.Random(seed)
        true_weights = [rng.uniform(-1.5, 1.5) for _ in range(features)]
        records = []
        for _ in range(rows):
            values = [round(rng.uniform(-2.0, 2.0), 6) for _ in range(features)]
            score = sum(weight * value for weight, value in zip(true_weights, values))
            score += rng.gauss(0, 0.35)
            records.append({"features": values, "label": int(score >= 0)})
        canonical = json.dumps(records, sort_keys=True, separators=(",", ":"))
        checksum = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
        with open(dataset.path, "w", encoding="utf-8") as handle:
            json.dump(
                {
                    "records": records,
                    "feature_names": [f"feature_{index + 1}" for index in range(features)],
                    "checksum": checksum,
                    "version": "synthetic-claims-v1",
                    "evidence_label": "synthetic",
                },
                handle,
            )
        dataset.metadata["checksum"] = checksum
        dataset.metadata["rows"] = rows
        dataset.metadata["evidence_label"] = "synthetic"
        return checksum

    @dsl.component(base_image="python:3.11-slim")
    def train_candidate(
        dataset: Input[Dataset],
        model: Output[Model],
        epochs: int = 120,
        learning_rate: float = 0.08,
        seed: int = 42,
    ) -> str:
        import json
        import math
        import random

        payload = json.load(open(dataset.path, encoding="utf-8"))
        records = payload["records"]
        feature_names = payload["feature_names"]
        split = int(len(records) * 0.8)
        training = records[:split]
        rng = random.Random(seed)
        weights = [rng.uniform(-0.01, 0.01) for _ in feature_names]
        bias = 0.0

        def sigmoid(score: float) -> float:
            if score >= 0:
                return 1 / (1 + math.exp(-score))
            exponent = math.exp(score)
            return exponent / (1 + exponent)

        for _ in range(epochs):
            grad_weights = [0.0 for _ in weights]
            grad_bias = 0.0
            for record in training:
                values = record["features"]
                label = record["label"]
                probability = sigmoid(
                    sum(weight * value for weight, value in zip(weights, values)) + bias
                )
                error = probability - label
                for index, value in enumerate(values):
                    grad_weights[index] += error * value
                grad_bias += error
            for index in range(len(weights)):
                weights[index] -= learning_rate * grad_weights[index] / len(training)
            bias -= learning_rate * grad_bias / len(training)

        model_payload = {
            "weights": weights,
            "bias": bias,
            "feature_names": feature_names,
            "training_seed": seed,
            "epochs": epochs,
            "learning_rate": learning_rate,
            "dataset_checksum": payload["checksum"],
            "evidence_label": "kfp-candidate-model-artifact",
        }
        with open(model.path, "w", encoding="utf-8") as handle:
            json.dump(model_payload, handle)
        model.metadata["dataset_checksum"] = payload["checksum"]
        model.metadata["evidence_label"] = "kfp-candidate-model-artifact"
        return payload["checksum"]

    @dsl.component(base_image="python:3.11-slim")
    def evaluate_candidate(
        dataset: Input[Dataset],
        model: Input[Model],
        metrics: Output[Metrics],
    ) -> float:
        import json
        import math

        data_payload = json.load(open(dataset.path, encoding="utf-8"))
        model_payload = json.load(open(model.path, encoding="utf-8"))
        records = data_payload["records"]
        testing = records[int(len(records) * 0.8) :]

        def sigmoid(score: float) -> float:
            if score >= 0:
                return 1 / (1 + math.exp(-score))
            exponent = math.exp(score)
            return exponent / (1 + exponent)

        correct = 0
        probabilities = []
        for record in testing:
            probability = sigmoid(
                sum(
                    weight * value
                    for weight, value in zip(
                        model_payload["weights"], record["features"]
                    )
                )
                + model_payload["bias"]
            )
            probabilities.append(probability)
            correct += int(int(probability >= 0.5) == record["label"])
        accuracy = correct / len(testing)
        positive_rate = sum(int(value >= 0.5) for value in probabilities) / len(testing)
        metrics.log_metric("accuracy", accuracy)
        metrics.log_metric("predicted_positive_rate", positive_rate)
        metrics.metadata["dataset_checksum"] = data_payload["checksum"]
        metrics.metadata["evidence_label"] = "kfp-synthetic-evaluation"
        return accuracy

    @dsl.component(base_image="python:3.11-slim")
    def quality_gate(
        accuracy: float,
        minimum_accuracy: float = 0.75,
    ) -> str:
        if accuracy < minimum_accuracy:
            raise ValueError(
                f"candidate rejected: accuracy {accuracy:.4f} is below "
                f"{minimum_accuracy:.4f}"
            )
        return "candidate-approved-for-human-review"

    @dsl.component(base_image="python:3.11-slim")
    def create_registry_request(
        model: Input[Model],
        gate_status: str,
        registry_request: Output[Dataset],
        registered_model_name: str = "synthetic-claims-risk",
    ) -> str:
        import json

        payload = {
            "registered_model_name": registered_model_name,
            "gate_status": gate_status,
            "model_uri": model.uri,
            "production_approval": "not-requested",
            "evidence_label": "kfp-registry-request-only",
            "warning": (
                "This artifact requests registration and human review; it does not prove "
                "that MLflow registration or production deployment occurred."
            ),
        }
        with open(registry_request.path, "w", encoding="utf-8") as handle:
            json.dump(payload, handle)
        registry_request.metadata["evidence_label"] = "kfp-registry-request-only"
        return gate_status

    @dsl.pipeline(
        name="synthetic-jupyter-to-production-evidence",
        description=(
            "Synthetic data, deterministic training, evaluation and governed registry request."
        ),
    )
    def portfolio_pipeline(
        rows: int = 400,
        features: int = 6,
        epochs: int = 120,
        learning_rate: float = 0.08,
        minimum_accuracy: float = 0.75,
    ) -> None:
        data_task = generate_synthetic_data(rows=rows, features=features)
        train_task = train_candidate(
            dataset=data_task.outputs["dataset"],
            epochs=epochs,
            learning_rate=learning_rate,
        )
        evaluation_task = evaluate_candidate(
            dataset=data_task.outputs["dataset"],
            model=train_task.outputs["model"],
        )
        gate_task = quality_gate(
            accuracy=evaluation_task.output,
            minimum_accuracy=minimum_accuracy,
        )
        create_registry_request(
            model=train_task.outputs["model"],
            gate_status=gate_task.output,
        )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    compiler.Compiler().compile(
        pipeline_func=portfolio_pipeline,
        package_path=str(output_path),
    )
    return {
        "pipeline_name": "synthetic-jupyter-to-production-evidence",
        "compiled_path": str(output_path),
        "evidence_label": "kfp-ir-compiled",
        "warning": (
            "Compilation validates the pipeline graph; it does not prove a Kubeflow "
            "Pipeline run or MLflow registration."
        ),
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Compile the portfolio KFP v2 pipeline.")
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("pipelines/compiled/synthetic-mlops-pipeline.yaml"),
    )
    parser.add_argument("--evidence-output", type=Path)
    args = parser.parse_args(argv)
    result = compile_pipeline(args.output)
    rendered = json.dumps(result, indent=2, sort_keys=True)
    print(rendered)
    if args.evidence_output:
        args.evidence_output.parent.mkdir(parents=True, exist_ok=True)
        args.evidence_output.write_text(rendered + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
