from __future__ import annotations

from dataclasses import dataclass
from enum import IntEnum
from typing import Literal


class Priority(IntEnum):
    """Comparable workload priority used by the synthetic scheduler."""

    LOW = 10
    NORMAL = 50
    HIGH = 80
    CRITICAL = 100


DecisionStatus = Literal["admitted", "queued", "rejected", "preempted"]


@dataclass(frozen=True, slots=True)
class ClusterPolicy:
    """Synthetic cluster capacity expressed in full-GPU equivalents."""

    total_gpu_units: float
    hourly_rate_per_gpu_unit: float

    def __post_init__(self) -> None:
        if self.total_gpu_units <= 0:
            raise ValueError("total_gpu_units must be greater than zero")
        if self.hourly_rate_per_gpu_unit < 0:
            raise ValueError("hourly_rate_per_gpu_unit cannot be negative")


@dataclass(frozen=True, slots=True)
class TeamPolicy:
    """Guaranteed capacity and borrowing guardrails for one tenant."""

    team: str
    guaranteed_gpu_units: float
    borrow_limit_gpu_units: float
    max_workload_gpu_units: float

    def __post_init__(self) -> None:
        if not self.team.strip():
            raise ValueError("team is required")
        for field_name, value in (
            ("guaranteed_gpu_units", self.guaranteed_gpu_units),
            ("borrow_limit_gpu_units", self.borrow_limit_gpu_units),
            ("max_workload_gpu_units", self.max_workload_gpu_units),
        ):
            if value < 0:
                raise ValueError(f"{field_name} cannot be negative")
        if self.max_workload_gpu_units <= 0:
            raise ValueError("max_workload_gpu_units must be greater than zero")

    @property
    def hard_cap_gpu_units(self) -> float:
        return self.guaranteed_gpu_units + self.borrow_limit_gpu_units


@dataclass(frozen=True, slots=True)
class WorkloadRequest:
    """A synthetic GPU workload submitted to the platform."""

    workload_id: str
    team: str
    owner: str
    cost_center: str
    profile: str
    gpu_units: float
    duration_hours: float
    priority: Priority = Priority.NORMAL
    preemptible: bool = True
    submitted_order: int = 0

    def __post_init__(self) -> None:
        required_text = {
            "workload_id": self.workload_id,
            "team": self.team,
            "owner": self.owner,
            "cost_center": self.cost_center,
            "profile": self.profile,
        }
        missing = [name for name, value in required_text.items() if not value.strip()]
        if missing:
            raise ValueError(f"missing required metadata: {', '.join(missing)}")
        if self.gpu_units <= 0:
            raise ValueError("gpu_units must be greater than zero")
        if self.duration_hours <= 0:
            raise ValueError("duration_hours must be greater than zero")
        if self.submitted_order < 0:
            raise ValueError("submitted_order cannot be negative")


@dataclass(frozen=True, slots=True)
class AdmissionDecision:
    workload_id: str
    status: DecisionStatus
    reason: str
    allocated_gpu_units: float = 0.0
    borrowed_gpu_units: float = 0.0
    preempted_by: str | None = None
