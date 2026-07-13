#!/usr/bin/env python3
"""Explainable synthetic 6R and migration-wave planner for CS02."""
from __future__ import annotations

import argparse
import json
from dataclasses import asdict, dataclass
from typing import Iterable


@dataclass(frozen=True)
class Workload:
    workload_id: str
    application: str
    criticality: int
    os_family: str
    database: str
    utilization_pct: int
    dependencies: int
    end_of_support: bool
    cloud_native_fit: bool
    business_keep: bool = True


@dataclass(frozen=True)
class Decision:
    workload_id: str
    strategy: str
    target: str
    wave: int
    risk_score: int
    reasons: tuple[str, ...]


def risk_score(w: Workload) -> int:
    score = w.criticality * 2
    score += min(w.dependencies, 10)
    score += 3 if w.database.lower() in {"oracle", "db2"} else 0
    score += 2 if w.end_of_support else 0
    score += 1 if w.utilization_pct > 75 else 0
    return score


def disposition(w: Workload) -> tuple[str, str, list[str]]:
    reasons: list[str] = []
    if not w.business_keep:
        return "retire", "decommission", ["business owner marked workload unnecessary"]
    if w.cloud_native_fit and w.criticality <= 3:
        reasons.append("good cloud-native fit")
        return "refactor", "gke-or-cloud-run", reasons
    if w.database.lower() in {"postgresql", "mysql"} and not w.end_of_support:
        reasons.append("managed database compatibility")
        return "replatform", "cloud-sql", reasons
    if w.os_family.lower() == "vmware" or w.dependencies >= 8:
        reasons.append("tight dependency or virtualization transition requirement")
        return "rehost", "google-cloud-vmware-engine", reasons
    if w.end_of_support:
        reasons.append("end-of-support remediation required")
        return "replatform", "compute-engine-hardened-image", reasons
    reasons.append("low-change migration protects exit timeline")
    return "rehost", "compute-engine", reasons


def assign_wave(w: Workload, score: int) -> int:
    # Wave 1 is low-risk pilot, 2/3 scale, 4 is high-risk/late.
    if score <= 7 and w.criticality <= 2:
        return 1
    if score <= 12:
        return 2
    if score <= 18:
        return 3
    return 4


def plan(workloads: Iterable[Workload]) -> list[Decision]:
    decisions: list[Decision] = []
    for workload in workloads:
        score = risk_score(workload)
        strategy, target, reasons = disposition(workload)
        if score >= 15:
            reasons.append("architecture-board review required")
        if workload.dependencies >= 8:
            reasons.append("dependency mapping/rehearsal gate")
        decisions.append(
            Decision(
                workload_id=workload.workload_id,
                strategy=strategy,
                target=target,
                wave=assign_wave(workload, score),
                risk_score=score,
                reasons=tuple(reasons),
            )
        )
    return sorted(decisions, key=lambda d: (d.wave, d.risk_score, d.workload_id))


def summary(decisions: Iterable[Decision]) -> dict[str, object]:
    items = list(decisions)
    return {
        "workloads": len(items),
        "by_strategy": {
            strategy: sum(1 for d in items if d.strategy == strategy)
            for strategy in sorted({d.strategy for d in items})
        },
        "by_wave": {
            str(wave): sum(1 for d in items if d.wave == wave)
            for wave in sorted({d.wave for d in items})
        },
        "high_risk": [d.workload_id for d in items if d.risk_score >= 15],
        "decisions": [asdict(d) for d in items],
    }


def sample() -> list[Workload]:
    return [
        Workload("WL-001", "catalog", 1, "linux", "postgresql", 35, 2, False, True),
        Workload("WL-002", "finance-core", 5, "vmware", "oracle", 82, 10, False, False),
        Workload("WL-003", "legacy-report", 2, "windows", "sqlserver", 15, 1, True, False, False),
        Workload("WL-004", "api-edge", 2, "linux", "none", 55, 3, False, True),
    ]


def self_test() -> None:
    decisions = plan(sample())
    lookup = {d.workload_id: d for d in decisions}
    assert lookup["WL-001"].strategy == "refactor"
    assert lookup["WL-002"].wave == 4
    assert lookup["WL-003"].strategy == "retire"
    assert lookup["WL-004"].target == "gke-or-cloud-run"
    assert summary(decisions)["workloads"] == 4
    print("CS02 self-test passed")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
        return 0
    print(json.dumps(summary(plan(sample())), indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
