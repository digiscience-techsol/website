#!/usr/bin/env python3
"""Deterministic, synthetic clinical document-intelligence demonstration.

This module deliberately avoids external model and cloud calls. It demonstrates
canonical extraction, source evidence, conflict/low-confidence escalation and
an auditable human-review state. It is not a medical device and must not be used
with real patient data.
"""
from __future__ import annotations

import argparse
import json
import re
from dataclasses import asdict, dataclass, field
from hashlib import sha256
from typing import Iterable

DATE_RE = re.compile(r"\b(20\d{2}-\d{2}-\d{2})\b")


@dataclass(frozen=True)
class Evidence:
    field: str
    value: str
    page: int
    excerpt: str
    confidence: float


@dataclass
class ClinicalPacket:
    document_id: str
    document_type: str
    admission_date: str | None = None
    discharge_date: str | None = None
    diagnoses: list[str] = field(default_factory=list)
    medications: list[str] = field(default_factory=list)
    follow_up: list[str] = field(default_factory=list)
    evidence: list[Evidence] = field(default_factory=list)
    conflicts: list[str] = field(default_factory=list)
    review_status: str = "pending"
    risk_level: str = "medium"
    audit: list[dict[str, str]] = field(default_factory=list)

    def record(self, event: str, detail: str) -> None:
        self.audit.append({"event": event, "detail": detail})


def _lines(pages: Iterable[str]) -> Iterable[tuple[int, str]]:
    for page_no, page in enumerate(pages, start=1):
        for raw in page.splitlines():
            line = raw.strip()
            if line:
                yield page_no, line


def _value_after(label: str, line: str) -> str | None:
    if line.lower().startswith(label.lower() + ":"):
        value = line.split(":", 1)[1].strip()
        return value or None
    return None


def build_packet(document_id: str, pages: list[str]) -> ClinicalPacket:
    if not document_id or not pages:
        raise ValueError("document_id and at least one page are required")

    packet = ClinicalPacket(document_id=document_id, document_type="unknown")
    packet.record("ingest", f"accepted {len(pages)} synthetic page(s)")

    joined = "\n".join(pages).lower()
    if "discharge summary" in joined:
        packet.document_type = "discharge_summary"
    elif "referral" in joined:
        packet.document_type = "referral_note"
    elif "laboratory" in joined or "lab result" in joined:
        packet.document_type = "laboratory_report"
    packet.record("classify", packet.document_type)

    seen_admission: set[str] = set()
    seen_discharge: set[str] = set()

    for page_no, line in _lines(pages):
        for field_name, label, destination, confidence in (
            ("diagnosis", "Diagnosis", packet.diagnoses, 0.98),
            ("medication", "Medication", packet.medications, 0.96),
            ("follow_up", "Follow-up", packet.follow_up, 0.95),
        ):
            value = _value_after(label, line)
            if value:
                destination.append(value)
                packet.evidence.append(Evidence(field_name, value, page_no, line, confidence))

        admission = _value_after("Admission Date", line)
        if admission:
            match = DATE_RE.search(admission)
            if match:
                seen_admission.add(match.group(1))
                packet.evidence.append(Evidence("admission_date", match.group(1), page_no, line, 0.99))

        discharge = _value_after("Discharge Date", line)
        if discharge:
            match = DATE_RE.search(discharge)
            if match:
                seen_discharge.add(match.group(1))
                packet.evidence.append(Evidence("discharge_date", match.group(1), page_no, line, 0.99))

    if len(seen_admission) == 1:
        packet.admission_date = next(iter(seen_admission))
    elif len(seen_admission) > 1:
        packet.conflicts.append(f"conflicting admission dates: {sorted(seen_admission)}")

    if len(seen_discharge) == 1:
        packet.discharge_date = next(iter(seen_discharge))
    elif len(seen_discharge) > 1:
        packet.conflicts.append(f"conflicting discharge dates: {sorted(seen_discharge)}")

    required_missing = not packet.diagnoses or not packet.discharge_date
    if packet.conflicts or required_missing:
        packet.risk_level = "high"
        packet.review_status = "escalated_review"
    else:
        packet.risk_level = "medium"
        packet.review_status = "pending_human_review"

    packet.record("extract", f"{len(packet.evidence)} evidence item(s)")
    packet.record("risk", packet.risk_level)
    packet.record("route", packet.review_status)
    return packet


def summary_with_citations(packet: ClinicalPacket) -> str:
    if not packet.evidence:
        return "Insufficient evidence: no supported clinical fields were extracted."

    parts: list[str] = []
    if packet.admission_date and packet.discharge_date:
        parts.append(f"Admission {packet.admission_date} to discharge {packet.discharge_date}.")
    if packet.diagnoses:
        cited = [e for e in packet.evidence if e.field == "diagnosis"]
        refs = ", ".join(f"p{e.page}" for e in cited)
        parts.append(f"Documented diagnosis: {', '.join(packet.diagnoses)} [{refs}].")
    if packet.medications:
        cited = [e for e in packet.evidence if e.field == "medication"]
        refs = ", ".join(f"p{e.page}" for e in cited)
        parts.append(f"Documented medication: {', '.join(packet.medications)} [{refs}].")
    if packet.follow_up:
        cited = [e for e in packet.evidence if e.field == "follow_up"]
        refs = ", ".join(f"p{e.page}" for e in cited)
        parts.append(f"Documented follow-up: {', '.join(packet.follow_up)} [{refs}].")
    if packet.conflicts:
        parts.append("Conflicts require human review: " + "; ".join(packet.conflicts) + ".")
    parts.append("Decision support only; human clinical review is mandatory.")
    return " ".join(parts)


def packet_to_json(packet: ClinicalPacket) -> str:
    payload = asdict(packet)
    payload["source_hash"] = sha256(
        json.dumps(payload["evidence"], sort_keys=True).encode("utf-8")
    ).hexdigest()
    payload["summary"] = summary_with_citations(packet)
    return json.dumps(payload, indent=2, sort_keys=True)


def self_test() -> None:
    pages = [
        "DISCHARGE SUMMARY\nAdmission Date: 2026-01-10\nDiagnosis: Synthetic pneumonia",
        "Discharge Date: 2026-01-14\nMedication: Synthetic antibiotic\nFollow-up: Review in 7 days",
    ]
    packet = build_packet("SYN-001", pages)
    assert packet.document_type == "discharge_summary"
    assert packet.admission_date == "2026-01-10"
    assert packet.discharge_date == "2026-01-14"
    assert packet.review_status == "pending_human_review"
    assert "[p1]" in summary_with_citations(packet)
    assert len(packet.audit) >= 4

    conflict = build_packet(
        "SYN-002",
        ["DISCHARGE SUMMARY\nDischarge Date: 2026-01-14", "Discharge Date: 2026-01-15"],
    )
    assert conflict.review_status == "escalated_review"
    assert conflict.conflicts
    print("CS01 self-test passed")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
        return 0

    demo_pages = [
        "DISCHARGE SUMMARY\nAdmission Date: 2026-01-10\nDiagnosis: Synthetic respiratory condition",
        "Discharge Date: 2026-01-14\nMedication: Synthetic medication\nFollow-up: Review in 7 days",
    ]
    print(packet_to_json(build_packet("SYN-DEMO-001", demo_pages)))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
