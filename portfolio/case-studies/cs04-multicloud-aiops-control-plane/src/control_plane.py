#!/usr/bin/env python3
"""Governed multi-cloud AIOps control-plane simulation for CS04."""
from __future__ import annotations

import argparse
import json
import uuid
from dataclasses import asdict, dataclass, field
from typing import Literal

Role = Literal["viewer", "operator", "admin"]
Level = Literal["L1", "L2", "L3"]


@dataclass(frozen=True)
class Runbook:
    name: str
    level: Level
    risk: str
    requires_resource: bool = False


CATALOGUE = {
    "check_instance_status": Runbook("check_instance_status", "L1", "low", True),
    "collect_ticket_context": Runbook("collect_ticket_context", "L1", "low"),
    "restart_instance": Runbook("restart_instance", "L2", "medium", True),
    "scale_service": Runbook("scale_service", "L2", "medium", True),
    "root_cause_analysis": Runbook("root_cause_analysis", "L3", "high"),
    "execute_failover_plan": Runbook("execute_failover_plan", "L3", "critical"),
}


@dataclass
class Approval:
    approval_id: str
    runbook: str
    requester: str
    resource_id: str | None
    status: str = "pending"
    approver: str | None = None


@dataclass
class ControlPlane:
    approvals: dict[str, Approval] = field(default_factory=dict)
    audit: list[dict[str, object]] = field(default_factory=list)
    executed_idempotency_keys: set[str] = field(default_factory=set)

    def _record(self, event: str, **detail: object) -> None:
        self.audit.append({"sequence": len(self.audit) + 1, "event": event, **detail})

    def request(
        self,
        *,
        role: Role,
        actor: str,
        runbook_name: str,
        resource_id: str | None = None,
        idempotency_key: str,
    ) -> dict[str, object]:
        if role == "viewer":
            raise PermissionError("viewer cannot execute runbooks")
        if runbook_name not in CATALOGUE:
            raise KeyError("runbook is not approved")
        runbook = CATALOGUE[runbook_name]
        if runbook.requires_resource and not resource_id:
            raise ValueError("resource_id is required")
        if idempotency_key in self.executed_idempotency_keys:
            return {"status": "duplicate_ignored", "idempotency_key": idempotency_key}

        self._record(
            "request",
            actor=actor,
            role=role,
            runbook=runbook_name,
            resource_id=resource_id,
            level=runbook.level,
        )

        if runbook.level in {"L2", "L3"} and role != "admin":
            approval = Approval(str(uuid.uuid4()), runbook_name, actor, resource_id)
            self.approvals[approval.approval_id] = approval
            self._record("approval_created", approval_id=approval.approval_id)
            return {"status": "pending_approval", "approval_id": approval.approval_id}

        return self._execute(runbook, actor, resource_id, idempotency_key)

    def approve_and_execute(
        self,
        *,
        approval_id: str,
        approver_role: Role,
        approver: str,
        idempotency_key: str,
    ) -> dict[str, object]:
        if approver_role != "admin":
            raise PermissionError("admin role is required to approve")
        approval = self.approvals[approval_id]
        if approval.status != "pending":
            raise ValueError("approval is no longer pending")
        approval.status = "approved"
        approval.approver = approver
        self._record("approval_granted", approval_id=approval_id, approver=approver)
        return self._execute(
            CATALOGUE[approval.runbook], approver, approval.resource_id, idempotency_key
        )

    def _execute(
        self,
        runbook: Runbook,
        actor: str,
        resource_id: str | None,
        idempotency_key: str,
    ) -> dict[str, object]:
        if idempotency_key in self.executed_idempotency_keys:
            return {"status": "duplicate_ignored", "idempotency_key": idempotency_key}
        self.executed_idempotency_keys.add(idempotency_key)
        output = {
            "status": "simulated_success",
            "runbook": runbook.name,
            "level": runbook.level,
            "resource_id": resource_id,
            "verification": "synthetic_customer_signal_green",
            "provider_action": "disabled_public_portfolio",
        }
        self._record("execution", actor=actor, idempotency_key=idempotency_key, **output)
        return output


def self_test() -> None:
    plane = ControlPlane()
    try:
        plane.request(
            role="viewer",
            actor="auditor",
            runbook_name="check_instance_status",
            resource_id="i-synthetic",
            idempotency_key="k0",
        )
        raise AssertionError("viewer request should fail")
    except PermissionError:
        pass

    l1 = plane.request(
        role="operator",
        actor="operator-a",
        runbook_name="check_instance_status",
        resource_id="i-synthetic",
        idempotency_key="k1",
    )
    assert l1["status"] == "simulated_success"

    pending = plane.request(
        role="operator",
        actor="operator-a",
        runbook_name="restart_instance",
        resource_id="i-synthetic",
        idempotency_key="k2-request",
    )
    assert pending["status"] == "pending_approval"
    executed = plane.approve_and_execute(
        approval_id=str(pending["approval_id"]),
        approver_role="admin",
        approver="incident-commander",
        idempotency_key="k2-execute",
    )
    assert executed["status"] == "simulated_success"
    duplicate = plane.approve_and_execute if False else plane.request(
        role="admin",
        actor="admin",
        runbook_name="collect_ticket_context",
        idempotency_key="k1",
    )
    assert duplicate["status"] == "duplicate_ignored"
    assert len(plane.audit) >= 5
    print("CS04 self-test passed")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
        return 0
    plane = ControlPlane()
    result = plane.request(
        role="operator",
        actor="demo-operator",
        runbook_name="restart_instance",
        resource_id="synthetic-vm-01",
        idempotency_key="demo-request-1",
    )
    print(json.dumps({"result": result, "audit": plane.audit}, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
