from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from .core import LogisticModel


def log_and_register_candidate(
    *,
    model_path: Path,
    metrics_path: Path,
    dataset_metadata_path: Path,
    gate_path: Path,
    tracking_uri: str,
    experiment_name: str,
    registered_model_name: str,
    alias: str | None = None,
) -> dict[str, Any]:
    """Log locally generated evidence and register a pyfunc model in MLflow.

    This function performs real MLflow operations only when invoked with an
    installed MLflow runtime and a reachable tracking/registry backend. Source
    code presence is not treated as proof that registration has occurred.
    """
    try:
        import mlflow
        import mlflow.pyfunc
        from mlflow import MlflowClient
    except ImportError as exc:  # pragma: no cover - optional runtime
        raise RuntimeError(
            "MLflow is not installed. Install the project with the 'mlflow' extra."
        ) from exc

    model_payload = json.loads(model_path.read_text(encoding="utf-8"))
    metrics = json.loads(metrics_path.read_text(encoding="utf-8"))
    dataset_metadata = json.loads(dataset_metadata_path.read_text(encoding="utf-8"))
    gate = json.loads(gate_path.read_text(encoding="utf-8"))
    if not gate.get("approved"):
        raise ValueError("quality gate did not approve this candidate")

    portfolio_model = LogisticModel(
        weights=tuple(float(value) for value in model_payload["weights"]),
        bias=float(model_payload["bias"]),
        feature_names=tuple(model_payload["feature_names"]),
        training_seed=int(model_payload["training_seed"]),
        epochs=int(model_payload["epochs"]),
        learning_rate=float(model_payload["learning_rate"]),
        dataset_checksum=str(model_payload["dataset_checksum"]),
        code_version=str(model_payload["code_version"]),
        evidence_label=str(model_payload["evidence_label"]),
    )

    class PortfolioLogisticPyFunc(mlflow.pyfunc.PythonModel):
        def __init__(self, inner_model: LogisticModel) -> None:
            self.inner_model = inner_model

        def predict(self, context: Any, model_input: Any, params: Any = None) -> Any:
            del context, params
            rows = (
                model_input.to_numpy().tolist()
                if hasattr(model_input, "to_numpy")
                else list(model_input)
            )
            return [self.inner_model.predict_probability(row) for row in rows]

    mlflow.set_tracking_uri(tracking_uri)
    mlflow.set_experiment(experiment_name)
    with mlflow.start_run() as run:
        mlflow.log_params(
            {
                "model_type": "portfolio_logistic_regression",
                "epochs": portfolio_model.epochs,
                "learning_rate": portfolio_model.learning_rate,
                "training_seed": portfolio_model.training_seed,
                "dataset_version": dataset_metadata["version"],
                "dataset_checksum": dataset_metadata["checksum"],
                "code_version": portfolio_model.code_version,
            }
        )
        mlflow.log_metrics(
            {
                "accuracy": float(metrics["accuracy"]),
                "log_loss": float(metrics["log_loss"]),
                "predicted_positive_rate": float(
                    metrics["predicted_positive_rate"]
                ),
            }
        )
        mlflow.set_tags(
            {
                "portfolio": "ai-platform-engineer",
                "evidence_label": "mlflow-runtime-executed",
                "validation_status": "approved",
                "data_kind": "synthetic",
                "owner": "team-ai-platform",
            }
        )
        mlflow.log_artifacts(str(model_path.parent), artifact_path="lifecycle-evidence")
        model_info = mlflow.pyfunc.log_model(
            artifact_path="model",
            python_model=PortfolioLogisticPyFunc(portfolio_model),
            registered_model_name=registered_model_name,
        )
        run_id = run.info.run_id

    client = MlflowClient(tracking_uri=tracking_uri, registry_uri=tracking_uri)
    versions = client.search_model_versions(f"run_id='{run_id}'")
    if not versions:
        raise RuntimeError("MLflow run completed but no registered model version was found")
    version = max(versions, key=lambda item: int(item.version))
    client.set_model_version_tag(
        name=registered_model_name,
        version=version.version,
        key="validation_status",
        value="approved",
    )
    client.set_model_version_tag(
        name=registered_model_name,
        version=version.version,
        key="dataset_checksum",
        value=str(dataset_metadata["checksum"]),
    )
    if alias:
        client.set_registered_model_alias(
            name=registered_model_name,
            alias=alias,
            version=version.version,
        )

    return {
        "tracking_uri": tracking_uri,
        "experiment_name": experiment_name,
        "run_id": run_id,
        "registered_model_name": registered_model_name,
        "model_version": str(version.version),
        "model_uri": f"models:/{registered_model_name}/{version.version}",
        "alias": alias,
        "logged_model_uri": getattr(model_info, "model_uri", None),
        "evidence_label": "mlflow-runtime-executed",
        "warning": (
            "This result is valid only when returned by an actual MLflow backend; "
            "do not infer execution from source code."
        ),
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Log approved synthetic lifecycle artifacts and register a candidate in MLflow."
    )
    parser.add_argument("--artifact-dir", type=Path, required=True)
    parser.add_argument("--tracking-uri", required=True)
    parser.add_argument("--experiment", default="portfolio-jupyter-mlops")
    parser.add_argument("--registered-model", default="synthetic-claims-risk")
    parser.add_argument("--alias")
    parser.add_argument("--output", type=Path)
    args = parser.parse_args(argv)

    result = log_and_register_candidate(
        model_path=args.artifact_dir / "model.json",
        metrics_path=args.artifact_dir / "metrics.json",
        dataset_metadata_path=args.artifact_dir / "dataset-metadata.json",
        gate_path=args.artifact_dir / "quality-gate.json",
        tracking_uri=args.tracking_uri,
        experiment_name=args.experiment,
        registered_model_name=args.registered_model,
        alias=args.alias,
    )
    rendered = json.dumps(result, indent=2, sort_keys=True)
    print(rendered)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
