from __future__ import annotations

import argparse
import json
import os
import time
from pathlib import Path
from typing import Any

from .config import TrainingConfig


def _task_identity() -> tuple[str, int]:
    raw = os.getenv("TF_CONFIG")
    if not raw:
        return "local", 0
    payload = json.loads(raw)
    task = payload.get("task", {})
    return str(task.get("type", "worker")), int(task.get("index", 0))


def _is_writer(task_type: str, task_index: int) -> bool:
    return task_type in {"local", "chief"} or (
        task_type == "worker" and task_index == 0
    )


def run(config: TrainingConfig, *, resume: bool = False) -> dict[str, Any]:
    """Run a synthetic TensorFlow model locally or with TF_CONFIG multi-worker setup."""
    if config.framework != "tensorflow":
        raise ValueError("TensorFlow runner requires framework='tensorflow'")
    try:
        import tensorflow as tf
    except ImportError as exc:  # pragma: no cover - optional runtime
        raise RuntimeError(
            "TensorFlow is not installed. Install the project with the 'tensorflow' extra."
        ) from exc

    task_type, task_index = _task_identity()
    multi_worker = bool(os.getenv("TF_CONFIG"))
    strategy = (
        tf.distribute.MultiWorkerMirroredStrategy()
        if multi_worker
        else tf.distribute.OneDeviceStrategy(
            "/GPU:0" if tf.config.list_physical_devices("GPU") else "/CPU:0"
        )
    )

    tf.keras.utils.set_random_seed(config.seed)
    features = tf.random.normal(
        shape=(config.samples, config.features),
        seed=config.seed,
    )
    true_weights = tf.random.normal(
        shape=(config.features, config.classes),
        seed=config.seed + 1,
    )
    labels = tf.argmax(features @ true_weights, axis=1, output_type=tf.int32)
    dataset = (
        tf.data.Dataset.from_tensor_slices((features, labels))
        .shuffle(config.samples, seed=config.seed, reshuffle_each_iteration=True)
        .batch(config.batch_size)
        .prefetch(tf.data.AUTOTUNE)
    )

    with strategy.scope():
        model = tf.keras.Sequential(
            [
                tf.keras.layers.Input(shape=(config.features,)),
                tf.keras.layers.Dense(16, activation="relu"),
                tf.keras.layers.Dense(config.classes),
            ]
        )
        optimizer = tf.keras.optimizers.Adam(learning_rate=config.learning_rate)
        model.compile(
            optimizer=optimizer,
            loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True),
            metrics=["accuracy"],
        )
        checkpoint = tf.train.Checkpoint(model=model, optimizer=optimizer)

    checkpoint_dir = Path(config.checkpoint_dir) / f"{config.experiment}-tensorflow"
    output_dir = Path(config.output_dir)
    checkpoint_dir.mkdir(parents=True, exist_ok=True)
    manager = tf.train.CheckpointManager(
        checkpoint,
        directory=str(checkpoint_dir),
        max_to_keep=3,
    )
    if resume and manager.latest_checkpoint:
        checkpoint.restore(manager.latest_checkpoint).expect_partial()

    started = time.perf_counter()
    history = model.fit(dataset, epochs=config.epochs, verbose=2)
    checkpoint_path = manager.save(checkpoint_number=config.epochs)

    device_kind = "gpu" if tf.config.list_physical_devices("GPU") else "cpu"
    final_loss = float(history.history["loss"][-1])
    final_accuracy = float(history.history["accuracy"][-1])
    evidence_label = (
        f"tensorflow-multiworker-{device_kind}-measured"
        if multi_worker
        else f"tensorflow-local-{device_kind}-measured"
    )
    metrics = {
        "experiment": config.experiment,
        "framework": "tensorflow",
        "strategy": type(strategy).__name__,
        "task_type": task_type,
        "task_index": task_index,
        "device_kind": device_kind,
        "epochs_completed": config.epochs,
        "final_loss": round(final_loss, 6),
        "final_accuracy": round(final_accuracy, 6),
        "duration_seconds": round(time.perf_counter() - started, 6),
        "checkpoint": checkpoint_path,
        "evidence_label": evidence_label,
        "hardware_claim": (
            "Strategy and device fields are detected at runtime; source code alone does not "
            "prove multi-worker or GPU execution."
        ),
    }

    if _is_writer(task_type, task_index):
        output_dir.mkdir(parents=True, exist_ok=True)
        metrics_path = output_dir / f"{config.experiment}-tensorflow.json"
        metrics_path.write_text(json.dumps(metrics, indent=2) + "\n", encoding="utf-8")
        print(json.dumps(metrics, indent=2))
    return metrics


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Run synthetic TensorFlow local or multi-worker training evidence."
    )
    parser.add_argument("config", type=Path)
    parser.add_argument("--resume", action="store_true")
    args = parser.parse_args(argv)
    run(TrainingConfig.from_path(args.config), resume=args.resume)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
