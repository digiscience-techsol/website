#!/usr/bin/env python3
"""Validate the public 12-case-study portfolio without external dependencies.

The validator checks that every case study has the minimum recruiter evidence,
that honest-use language is present, that no obvious credentials are committed,
and that each demo module passes its own deterministic self-test.
"""
from __future__ import annotations

import re
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

CASES = {
    "cs01-healthcare-clinical-document-intelligence": "demo_pipeline.py",
    "cs02-gcp-data-center-exit-migration-factory": "migration_planner.py",
    "cs03-secure-enterprise-rag-platform": "rag_demo.py",
    "cs04-multicloud-aiops-control-plane": "control_plane.py",
    "cs05-ai-ready-multicloud-landing-zone": "landing_zone_policy.py",
    "cs06-gpu-kubernetes-inference-platform": "capacity_model.py",
    "cs07-enterprise-ai-gateway-governance": "gateway.py",
    "cs08-internal-developer-platform": "platform_template.py",
    "cs09-cloud-ai-finops-control-tower": "finops_control_tower.py",
    "cs10-zero-trust-devsecops-supply-chain": "verify_supply_chain.py",
    "cs11-multiregion-resilience-dr-chaos": "resilience_simulator.py",
    "cs12-enterprise-cloud-ai-bid-factory": "validate_bid.py",
}

REQUIRED_README_PHRASES = (
    "Executive summary",
    "Architecture decisions",
    "Implementation status",
    "Resume / profile proof line",
    "Honest-use statement",
)

SUSPICIOUS_PATTERNS = {
    "AWS access key": re.compile(r"AKIA[0-9A-Z]{16}"),
    "private key": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    "GitHub token": re.compile(r"gh[pousr]_[A-Za-z0-9_]{20,}"),
    "generic secret assignment": re.compile(
        r"(?i)(?:password|secret|api[_-]?key)\s*[:=]\s*['\"][^'\"]{8,}['\"]"
    ),
}


@dataclass
class Failure:
    case: str
    message: str


def scan_text(case: str, path: Path, text: str) -> list[Failure]:
    failures: list[Failure] = []
    for label, pattern in SUSPICIOUS_PATTERNS.items():
        if pattern.search(text):
            failures.append(Failure(case, f"{label} pattern detected in {path}"))
    return failures


def run_self_test(case: str, script: Path) -> list[Failure]:
    proc = subprocess.run(
        [sys.executable, str(script), "--self-test"],
        cwd=script.parent,
        text=True,
        capture_output=True,
        timeout=30,
        check=False,
    )
    if proc.returncode != 0:
        detail = (proc.stdout + "\n" + proc.stderr).strip()
        return [Failure(case, f"self-test failed for {script.name}: {detail}")]
    return []


def validate_case(case: str, script_name: str) -> list[Failure]:
    failures: list[Failure] = []
    base = ROOT / "case-studies" / case
    readme = base / "README.md"
    script = base / "src" / script_name
    terraform = base / "terraform" / "main.tf"

    for required in (readme, script, terraform):
        if not required.exists():
            failures.append(Failure(case, f"missing required file: {required.relative_to(ROOT)}"))

    if readme.exists():
        text = readme.read_text(encoding="utf-8")
        if len(text.split()) < 1200:
            failures.append(Failure(case, "README is below the detailed-evidence threshold of 1,200 words"))
        for phrase in REQUIRED_README_PHRASES:
            if phrase.lower() not in text.lower():
                failures.append(Failure(case, f"README missing section/phrase: {phrase}"))
        if "synthetic" not in text.lower() and "fictional" not in text.lower():
            failures.append(Failure(case, "README must explicitly label the scenario synthetic or fictional"))
        failures.extend(scan_text(case, readme, text))

    if script.exists():
        text = script.read_text(encoding="utf-8")
        failures.extend(scan_text(case, script, text))
        failures.extend(run_self_test(case, script))

    if terraform.exists():
        text = terraform.read_text(encoding="utf-8")
        failures.extend(scan_text(case, terraform, text))
        if "required_version" not in text:
            failures.append(Failure(case, "Terraform scaffold must declare required_version"))
        if "apply" in text.lower() and "no live apply" not in text.lower():
            # Informational guard: public scaffolds should make non-deployment intent explicit.
            failures.append(Failure(case, "Terraform text mentioning apply must include 'no live apply' guardrail"))

    return failures


def main() -> int:
    failures: list[Failure] = []
    for case, script_name in CASES.items():
        failures.extend(validate_case(case, script_name))

    index = ROOT / "README.md"
    profile_kit = ROOT / "PROFILE-PUBLISHING-KIT.md"
    for path in (index, profile_kit):
        if not path.exists():
            failures.append(Failure("portfolio", f"missing {path.name}"))
        else:
            failures.extend(scan_text("portfolio", path, path.read_text(encoding="utf-8")))

    if failures:
        print(f"PORTFOLIO VALIDATION FAILED: {len(failures)} issue(s)")
        for failure in failures:
            print(f"- [{failure.case}] {failure.message}")
        return 1

    print("PORTFOLIO VALIDATION PASSED")
    print(f"Validated {len(CASES)} detailed case studies and all executable self-tests.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
