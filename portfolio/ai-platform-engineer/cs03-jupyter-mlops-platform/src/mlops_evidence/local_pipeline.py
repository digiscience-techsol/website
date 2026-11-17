from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from .core import evaluate, generate_dataset, split_dataset, train
from .gates import apply_quality_gate


def run_local_lifecycle(
    *,
    output_dir: Path,
    samples: int = 400,
    feature_count: int = 6,
    seed: int = 42,
    epochs: int = 120,
    learning_rate: float = 0.08,
    min_accuracy: float = 0.75,
    max_log_loss: float = 0.65,
) -> dict[str, Any]:
    dataset = generate_dataset(
        samples=samples,
        feature_count=feature_count,
        seed=seed,
    )
    train_data, test_data = split_dataset(dataset)
    model = train(
        train_data,
        epochs=epochs,
        learning_rate=learning_rate,
        seed=seed,
    )
    metrics = evaluate(model, test_data)
    gate = apply_quality_gate(
        metrics,
        min_accuracy=min_accuracy,
        max_log_loss=max_log_loss,
    )

    output_dir.mkdir(parents=True, exist_ok=True)
    artifacts = {
        "dataset-metadata.json": {
            "version": dataset.version,
            "checksum": dataset.checksum,
            "rows": len(dataset.features),
            "feature_names": list(dataset.feature_names),
            "evidence_label": dataset.evidence_label,
        },
        "model.json": model.to_dict(),
        "metrics.json": metrics,
        "quality-gate.json": gate.to_dict(),
    }
    for filename, payload in artifacts.items():
        (output_dir / filename).write_text(
            json.dumps(payload, indent=2, sort_keys=True) + "\n",
            encoding="utf-8",
        )

    registry_candidate = {
        "model_name": "synthetic-claims-risk",
        "candidate_version": f"local-{model.code_version}-{dataset.checksum[:12]}",
        "status": "candidate" if gate.approved else "rejected",
        "production_approval": "not-requested",
        "model_artifact": str(output_dir / "model.json"),
        "metrics_artifact": str(output_dir / "metrics.json"),
        "gate_artifact": str(output_dir / "quality-gate.json"),
        "dataset_version": dataset.version,
        "dataset_checksum": dataset.checksum,
        "code_version": model.code_version,
        "owner": "team-ai-platform",
        "risk_reviewer": "unassigned-synthetic-demo",
        "evidence_label": "local-registry-candidate-metadata",
        "warning": (
            "This is local portfolio metadata, not proof of an MLflow registry or "
            "production deployment."
        ),
    }
    (output_dir / "registry-candidate.json").write_text(
        json.dumps(registry_candidate, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )

    summary = {
        "status": gate.status,
        "gate_approved": gate.approved,
        "accuracy": metrics["accuracy"],
        "log_loss": metrics["log_loss"],
        "dataset_checksum": dataset.checksum,
        "artifact_directory": str(output_dir),
        "evidence_label": "locally-tested-synthetic-lifecycle",
        "next_stage": (
            "MLflow logging and human review"
            if gate.approved
            else "correct experiment and rerun"
        ),
    }
    (output_dir / "summary.json").write_text(
        json.dumps(summary, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    return summary


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Run a deterministic synthetic experiment, evaluation and quality gate."
    )
    parser.add_argument("--output-dir", type=Path, default=Path("evidence/local-run"))
    parser.add_argument("--samples", type=int, default=400)
    parser.add_argument("--features", type=int, default=6)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--epochs", type=int, default=120)
    parser.add_argument("--learning-rate", type=float, default=0.08)
    parser.add_argument("--min-accuracy", type=float, default=0.75)
    parser.add_argument("--max-log-loss", type=float, default=0.65)
    args = parser.parse_args(argv)

    result = run_local_lifecycle(
        output_dir=args.output_dir,
        samples=args.samples,
        feature_count=args.features,
        seed=args.seed,
        epochs=args.epochs,
        learning_rate=args.learning_rate,
        min_accuracy=args.min_accuracy,
        max_log_loss=args.max_log_loss,
    )
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0 if result["gate_approved"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
