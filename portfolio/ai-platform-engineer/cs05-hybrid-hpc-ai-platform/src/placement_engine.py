from __future__ import annotations

import argparse
import json
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Literal


Location = Literal["onprem", "cloud"]
Platform = Literal["hpc", "kubernetes", "cloud-burst"]


@dataclass(frozen=True, slots=True)
class Target:
    name: str
    platform: Platform
    location: Location
    allowed_classifications: tuple[str, ...]
    accelerators: tuple[str, ...]
    high_bandwidth_network: bool
    queue_wait_minutes: float
    node_hour_rate: float
    data_transfer_rate_per_gb: float
    transfer_bandwidth_gbps: float
    reliability_score: float

    def __post_init__(self) -> None:
        if not self.name.strip():
            raise ValueError("target name is required")
        if self.queue_wait_minutes < 0:
            raise ValueError("queue_wait_minutes cannot be negative")
        if self.node_hour_rate < 0 or self.data_transfer_rate_per_gb < 0:
            raise ValueError("cost rates cannot be negative")
        if self.transfer_bandwidth_gbps <= 0:
            raise ValueError("transfer_bandwidth_gbps must be greater than zero")
        if not 0 <= self.reliability_score <= 100:
            raise ValueError("reliability_score must be between 0 and 100")


@dataclass(frozen=True, slots=True)
class Workload:
    workload_id: str
    owner: str
    cost_center: str
    data_classification: str
    export_allowed: bool
    required_accelerator: str
    nodes: int
    runtime_hours: float
    deadline_minutes: float
    input_size_gb: float
    output_size_gb: float
    max_estimated_cost: float
    requires_high_bandwidth_network: bool
    prefer_owned_capacity: bool
    priority: str

    def __post_init__(self) -> None:
        for field_name, value in (
            ("workload_id", self.workload_id),
            ("owner", self.owner),
            ("cost_center", self.cost_center),
            ("data_classification", self.data_classification),
            ("required_accelerator", self.required_accelerator),
            ("priority", self.priority),
        ):
            if not value.strip():
                raise ValueError(f"{field_name} is required")
        if self.nodes <= 0:
            raise ValueError("nodes must be greater than zero")
        if self.runtime_hours <= 0 or self.deadline_minutes <= 0:
            raise ValueError("runtime and deadline must be greater than zero")
        if self.input_size_gb < 0 or self.output_size_gb < 0:
            raise ValueError("data sizes cannot be negative")
        if self.max_estimated_cost < 0:
            raise ValueError("max_estimated_cost cannot be negative")


@dataclass(frozen=True, slots=True)
class PlacementEvaluation:
    target: str
    eligible: bool
    score: float | None
    estimated_cost: float
    estimated_start_minutes: float
    estimated_completion_minutes: float
    transfer_minutes: float
    reasons: tuple[str, ...]
    evidence_label: str = "simulated"

    def to_dict(self) -> dict[str, Any]:
        payload = asdict(self)
        payload["reasons"] = list(self.reasons)
        return payload


def transfer_minutes(workload: Workload, target: Target) -> float:
    if target.location == "onprem":
        # The synthetic scenario treats the authoritative data as on-premises.
        return 0.0
    total_gigabits = (workload.input_size_gb + workload.output_size_gb) * 8
    seconds = total_gigabits / target.transfer_bandwidth_gbps
    return seconds / 60


def estimated_cost(workload: Workload, target: Target) -> float:
    compute = workload.nodes * workload.runtime_hours * target.node_hour_rate
    transfer = 0.0
    if target.location == "cloud":
        transfer = (
            workload.input_size_gb + workload.output_size_gb
        ) * target.data_transfer_rate_per_gb
    return round(compute + transfer, 2)


def evaluate(workload: Workload, target: Target) -> PlacementEvaluation:
    hard_failures: list[str] = []
    positives: list[str] = []

    if workload.data_classification not in target.allowed_classifications:
        hard_failures.append(
            f"classification {workload.data_classification!r} is not approved"
        )
    if target.location == "cloud" and not workload.export_allowed:
        hard_failures.append("data export to cloud is prohibited")
    if workload.required_accelerator not in target.accelerators:
        hard_failures.append(
            f"required accelerator {workload.required_accelerator!r} is unavailable"
        )
    if workload.requires_high_bandwidth_network and not target.high_bandwidth_network:
        hard_failures.append("required high-bandwidth network is unavailable")

    transfer = transfer_minutes(workload, target)
    completion = target.queue_wait_minutes + transfer + (workload.runtime_hours * 60)
    cost = estimated_cost(workload, target)

    if completion > workload.deadline_minutes:
        hard_failures.append(
            f"estimated completion {completion:.1f} minutes exceeds deadline "
            f"{workload.deadline_minutes:.1f} minutes"
        )
    if cost > workload.max_estimated_cost:
        hard_failures.append(
            f"estimated cost {cost:.2f} exceeds budget "
            f"{workload.max_estimated_cost:.2f}"
        )

    if hard_failures:
        return PlacementEvaluation(
            target=target.name,
            eligible=False,
            score=None,
            estimated_cost=cost,
            estimated_start_minutes=round(target.queue_wait_minutes + transfer, 2),
            estimated_completion_minutes=round(completion, 2),
            transfer_minutes=round(transfer, 2),
            reasons=tuple(hard_failures),
        )

    deadline_slack = max(workload.deadline_minutes - completion, 0.0)
    deadline_fit = min((deadline_slack / workload.deadline_minutes) * 35, 35)
    reliability_fit = (target.reliability_score / 100) * 20
    data_locality = 20 if target.location == "onprem" else max(0, 20 - transfer / 10)
    owned_preference = (
        10 if workload.prefer_owned_capacity and target.location == "onprem" else 0
    )
    cost_ratio = (
        cost / workload.max_estimated_cost if workload.max_estimated_cost > 0 else 1
    )
    cost_fit = max(0, 15 * (1 - min(cost_ratio, 1)))
    queue_penalty = min(target.queue_wait_minutes / 30, 10)

    score = deadline_fit + reliability_fit + data_locality + owned_preference + cost_fit
    score -= queue_penalty

    positives.append(f"meets deadline with {deadline_slack:.1f} minutes slack")
    positives.append(f"estimated cost {cost:.2f} is within budget")
    if target.location == "onprem":
        positives.append("authoritative synthetic data remains on-premises")
    else:
        positives.append(
            f"cloud transfer estimated at {transfer:.1f} minutes and included in decision"
        )
    if workload.prefer_owned_capacity and target.location == "onprem":
        positives.append("aligns with owned-capacity preference")
    if target.high_bandwidth_network:
        positives.append("high-bandwidth network capability available")

    return PlacementEvaluation(
        target=target.name,
        eligible=True,
        score=round(score, 3),
        estimated_cost=cost,
        estimated_start_minutes=round(target.queue_wait_minutes + transfer, 2),
        estimated_completion_minutes=round(completion, 2),
        transfer_minutes=round(transfer, 2),
        reasons=tuple(positives),
    )


def recommend(workload: Workload, targets: list[Target]) -> dict[str, Any]:
    if not targets:
        raise ValueError("at least one target is required")
    evaluations = [evaluate(workload, target) for target in targets]
    eligible = sorted(
        (item for item in evaluations if item.eligible),
        key=lambda item: (-(item.score or 0), item.estimated_cost, item.target),
    )
    recommendation = eligible[0].target if eligible else None
    return {
        "workload": asdict(workload),
        "recommended_target": recommendation,
        "status": "recommended" if recommendation else "no-eligible-target",
        "evidence_label": "simulated",
        "warning": (
            "This placement decision uses synthetic target, queue, bandwidth and cost data. "
            "It is not evidence of a live HPC or cloud execution."
        ),
        "evaluations": [item.to_dict() for item in evaluations],
    }


def _load(path: Path) -> tuple[Workload, list[Target]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    workload = Workload(**payload["workload"])
    targets = [
        Target(
            **{
                **item,
                "allowed_classifications": tuple(item["allowed_classifications"]),
                "accelerators": tuple(item["accelerators"]),
            }
        )
        for item in payload["targets"]
    ]
    return workload, targets


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Generate an explainable synthetic HPC/Kubernetes/cloud placement decision."
    )
    parser.add_argument("scenario", type=Path)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args(argv)

    workload, targets = _load(args.scenario)
    result = recommend(workload, targets)
    rendered = json.dumps(result, indent=2, sort_keys=True)
    print(rendered)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered + "\n", encoding="utf-8")
    return 0 if result["recommended_target"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
