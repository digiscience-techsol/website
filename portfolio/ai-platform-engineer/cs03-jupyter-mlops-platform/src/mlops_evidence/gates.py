from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any


@dataclass(frozen=True, slots=True)
class GateDecision:
    approved: bool
    status: str
    reasons: tuple[str, ...]
    thresholds: dict[str, float]
    observed: dict[str, float]
    evidence_label: str = "local-synthetic-quality-gate"

    def to_dict(self) -> dict[str, Any]:
        payload = asdict(self)
        payload["reasons"] = list(self.reasons)
        return payload


def apply_quality_gate(
    metrics: dict[str, Any],
    *,
    min_accuracy: float = 0.75,
    max_log_loss: float = 0.65,
    min_positive_rate: float = 0.05,
    max_positive_rate: float = 0.95,
) -> GateDecision:
    if not 0 <= min_accuracy <= 1:
        raise ValueError("min_accuracy must be between zero and one")
    if max_log_loss <= 0:
        raise ValueError("max_log_loss must be greater than zero")
    if not 0 <= min_positive_rate < max_positive_rate <= 1:
        raise ValueError("positive-rate bounds are invalid")

    observed = {
        "accuracy": float(metrics["accuracy"]),
        "log_loss": float(metrics["log_loss"]),
        "predicted_positive_rate": float(metrics["predicted_positive_rate"]),
    }
    reasons: list[str] = []
    if observed["accuracy"] < min_accuracy:
        reasons.append(
            f"accuracy {observed['accuracy']:.4f} is below {min_accuracy:.4f}"
        )
    if observed["log_loss"] > max_log_loss:
        reasons.append(
            f"log loss {observed['log_loss']:.4f} exceeds {max_log_loss:.4f}"
        )
    if not min_positive_rate <= observed["predicted_positive_rate"] <= max_positive_rate:
        reasons.append(
            "predicted positive rate is outside the synthetic review bounds"
        )

    approved = not reasons
    if approved:
        reasons.append("all automated synthetic quality thresholds passed")
    return GateDecision(
        approved=approved,
        status="candidate-approved" if approved else "candidate-rejected",
        reasons=tuple(reasons),
        thresholds={
            "min_accuracy": min_accuracy,
            "max_log_loss": max_log_loss,
            "min_positive_rate": min_positive_rate,
            "max_positive_rate": max_positive_rate,
        },
        observed=observed,
    )
