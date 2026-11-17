from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from .models import ClusterPolicy, Priority, TeamPolicy, WorkloadRequest
from .reporting import build_usage_report
from .scheduler import Scheduler


def _priority(value: str | int) -> Priority:
    if isinstance(value, int):
        return Priority(value)
    return Priority[value.upper()]


def _load(path: Path) -> tuple[ClusterPolicy, list[TeamPolicy], list[WorkloadRequest]]:
    payload: dict[str, Any] = json.loads(path.read_text(encoding="utf-8"))
    cluster = ClusterPolicy(**payload["cluster"])
    teams = [TeamPolicy(**item) for item in payload["teams"]]
    workloads = [
        WorkloadRequest(**{**item, "priority": _priority(item.get("priority", "NORMAL"))})
        for item in payload["workloads"]
    ]
    return cluster, teams, workloads


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Simulate GPU quota, borrowing, queueing and pre-emption decisions."
    )
    parser.add_argument("scenario", type=Path, help="Path to a JSON scenario")
    parser.add_argument("--output", type=Path, help="Optional evidence JSON output path")
    args = parser.parse_args(argv)

    cluster, teams, workloads = _load(args.scenario)
    decisions = Scheduler(cluster, teams).schedule(workloads)
    report = build_usage_report(cluster, workloads, decisions)
    rendered = json.dumps(report, indent=2, sort_keys=True)
    print(rendered)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
