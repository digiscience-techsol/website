from __future__ import annotations

import hashlib
import json
import math
import random
from dataclasses import asdict, dataclass
from typing import Any, Iterable


@dataclass(frozen=True, slots=True)
class Dataset:
    features: tuple[tuple[float, ...], ...]
    labels: tuple[int, ...]
    feature_names: tuple[str, ...]
    version: str
    checksum: str
    evidence_label: str = "synthetic"

    def __post_init__(self) -> None:
        if not self.features or len(self.features) != len(self.labels):
            raise ValueError("features and labels must be non-empty and aligned")
        width = len(self.features[0])
        if width == 0 or any(len(row) != width for row in self.features):
            raise ValueError("feature rows must have one consistent non-zero width")
        if width != len(self.feature_names):
            raise ValueError("feature_names must match feature width")
        if any(label not in {0, 1} for label in self.labels):
            raise ValueError("this synthetic example supports binary labels only")

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(frozen=True, slots=True)
class LogisticModel:
    weights: tuple[float, ...]
    bias: float
    feature_names: tuple[str, ...]
    training_seed: int
    epochs: int
    learning_rate: float
    dataset_checksum: str
    code_version: str
    evidence_label: str = "locally-trained-synthetic-model"

    def predict_probability(self, row: Iterable[float]) -> float:
        values = tuple(float(value) for value in row)
        if len(values) != len(self.weights):
            raise ValueError("input width does not match model")
        score = sum(weight * value for weight, value in zip(self.weights, values)) + self.bias
        if score >= 0:
            return 1 / (1 + math.exp(-score))
        exponent = math.exp(score)
        return exponent / (1 + exponent)

    def predict(self, row: Iterable[float], threshold: float = 0.5) -> int:
        return int(self.predict_probability(row) >= threshold)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def _dataset_checksum(
    features: tuple[tuple[float, ...], ...], labels: tuple[int, ...]
) -> str:
    canonical = json.dumps(
        {"features": features, "labels": labels},
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")
    return hashlib.sha256(canonical).hexdigest()


def generate_dataset(
    *,
    samples: int = 400,
    feature_count: int = 6,
    seed: int = 42,
    version: str = "synthetic-claims-v1",
) -> Dataset:
    if samples < 20:
        raise ValueError("samples must be at least 20")
    if feature_count < 2:
        raise ValueError("feature_count must be at least two")
    if not version.strip():
        raise ValueError("version is required")

    rng = random.Random(seed)
    true_weights = [rng.uniform(-1.5, 1.5) for _ in range(feature_count)]
    rows: list[tuple[float, ...]] = []
    labels: list[int] = []
    for _ in range(samples):
        row = tuple(round(rng.uniform(-2.0, 2.0), 6) for _ in range(feature_count))
        noise = rng.gauss(0, 0.35)
        score = sum(weight * value for weight, value in zip(true_weights, row)) + noise
        rows.append(row)
        labels.append(int(score >= 0))

    features = tuple(rows)
    label_tuple = tuple(labels)
    feature_names = tuple(f"feature_{index + 1}" for index in range(feature_count))
    return Dataset(
        features=features,
        labels=label_tuple,
        feature_names=feature_names,
        version=version,
        checksum=_dataset_checksum(features, label_tuple),
    )


def split_dataset(dataset: Dataset, train_fraction: float = 0.8) -> tuple[Dataset, Dataset]:
    if not 0.5 <= train_fraction < 1:
        raise ValueError("train_fraction must be between 0.5 and 1")
    split_index = int(len(dataset.features) * train_fraction)

    def subset(start: int, end: int, suffix: str) -> Dataset:
        features = dataset.features[start:end]
        labels = dataset.labels[start:end]
        return Dataset(
            features=features,
            labels=labels,
            feature_names=dataset.feature_names,
            version=f"{dataset.version}-{suffix}",
            checksum=_dataset_checksum(features, labels),
        )

    return subset(0, split_index, "train"), subset(split_index, len(dataset.features), "test")


def train(
    dataset: Dataset,
    *,
    epochs: int = 120,
    learning_rate: float = 0.08,
    seed: int = 42,
    code_version: str = "portfolio-local-v1",
) -> LogisticModel:
    if epochs <= 0 or learning_rate <= 0:
        raise ValueError("epochs and learning_rate must be greater than zero")
    rng = random.Random(seed)
    weights = [rng.uniform(-0.01, 0.01) for _ in dataset.feature_names]
    bias = 0.0
    sample_count = len(dataset.features)

    for _ in range(epochs):
        gradient_weights = [0.0 for _ in weights]
        gradient_bias = 0.0
        for row, label in zip(dataset.features, dataset.labels):
            score = sum(weight * value for weight, value in zip(weights, row)) + bias
            probability = _sigmoid(score)
            error = probability - label
            for index, value in enumerate(row):
                gradient_weights[index] += error * value
            gradient_bias += error

        for index in range(len(weights)):
            weights[index] -= learning_rate * (gradient_weights[index] / sample_count)
        bias -= learning_rate * (gradient_bias / sample_count)

    return LogisticModel(
        weights=tuple(round(value, 10) for value in weights),
        bias=round(bias, 10),
        feature_names=dataset.feature_names,
        training_seed=seed,
        epochs=epochs,
        learning_rate=learning_rate,
        dataset_checksum=dataset.checksum,
        code_version=code_version,
    )


def evaluate(model: LogisticModel, dataset: Dataset) -> dict[str, Any]:
    if model.feature_names != dataset.feature_names:
        raise ValueError("model and dataset feature schemas do not match")
    probabilities = [model.predict_probability(row) for row in dataset.features]
    predictions = [int(value >= 0.5) for value in probabilities]
    accuracy = sum(
        int(prediction == label)
        for prediction, label in zip(predictions, dataset.labels)
    ) / len(dataset.labels)
    epsilon = 1e-12
    log_loss = -sum(
        label * math.log(max(probability, epsilon))
        + (1 - label) * math.log(max(1 - probability, epsilon))
        for probability, label in zip(probabilities, dataset.labels)
    ) / len(dataset.labels)
    positive_rate = sum(predictions) / len(predictions)
    return {
        "accuracy": round(accuracy, 6),
        "log_loss": round(log_loss, 6),
        "predicted_positive_rate": round(positive_rate, 6),
        "rows_evaluated": len(dataset.labels),
        "dataset_version": dataset.version,
        "dataset_checksum": dataset.checksum,
        "model_dataset_checksum": model.dataset_checksum,
        "evidence_label": "locally-evaluated-synthetic-data",
    }


def _sigmoid(score: float) -> float:
    if score >= 0:
        return 1 / (1 + math.exp(-score))
    exponent = math.exp(score)
    return exponent / (1 + exponent)
