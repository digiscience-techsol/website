from __future__ import annotations

import argparse
import json
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Literal


Framework = Literal["pytorch", "tensorflow"]


@dataclass(frozen=True, slots=True)
class TrainingConfig:
    experiment: str
    framework: Framework
    epochs: int = 2
    batch_size: int = 32
    learning_rate: float = 0.01
    samples: int = 512
    features: int = 8
    classes: int = 2
    seed: int = 42
    checkpoint_dir: str = "artifacts/checkpoints"
    output_dir: str = "artifacts/metrics"
    owner: str = "team-ai-platform"
    cost_center: str = "CC-SYNTHETIC"
    evidence_label: str = "requires-framework-runtime"

    def __post_init__(self) -> None:
        required = {
            "experiment": self.experiment,
            "owner": self.owner,
            "cost_center": self.cost_center,
            "checkpoint_dir": self.checkpoint_dir,
            "output_dir": self.output_dir,
            "evidence_label": self.evidence_label,
        }
        missing = [name for name, value in required.items() if not value.strip()]
        if missing:
            raise ValueError(f"missing required values: {', '.join(missing)}")
        if self.framework not in {"pytorch", "tensorflow"}:
            raise ValueError("framework must be pytorch or tensorflow")
        if self.epochs <= 0 or self.batch_size <= 0:
            raise ValueError("epochs and batch_size must be greater than zero")
        if self.learning_rate <= 0:
            raise ValueError("learning_rate must be greater than zero")
        if self.samples <= 0 or self.features <= 0 or self.classes < 2:
            raise ValueError("samples/features must be positive and classes must be at least two")
        if self.batch_size > self.samples:
            raise ValueError("batch_size cannot exceed samples")
        if self.seed < 0:
            raise ValueError("seed cannot be negative")

    @classmethod
    def from_dict(cls, payload: dict[str, Any]) -> "TrainingConfig":
        return cls(**payload)

    @classmethod
    def from_path(cls, path: Path) -> "TrainingConfig":
        return cls.from_dict(json.loads(path.read_text(encoding="utf-8")))

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Validate a distributed-training configuration.")
    parser.add_argument("config", type=Path)
    args = parser.parse_args(argv)
    config = TrainingConfig.from_path(args.config)
    print(json.dumps(config.to_dict(), indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
