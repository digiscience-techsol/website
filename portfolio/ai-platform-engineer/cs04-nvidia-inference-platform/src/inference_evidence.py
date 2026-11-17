from __future__ import annotations

import argparse
import json
import math
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import asdict, dataclass
from pathlib import Path
from time import perf_counter
from typing import Any, Callable
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


@dataclass(frozen=True, slots=True)
class RequestResult:
    success: bool
    latency_ms: float
    status_code: int | None
    error: str | None = None


@dataclass(frozen=True, slots=True)
class BenchmarkReport:
    model: str
    endpoint: str
    evidence_label: str
    requested: int
    succeeded: int
    failed: int
    concurrency: int
    wall_time_seconds: float
    throughput_requests_per_second: float
    p50_latency_ms: float | None
    p95_latency_ms: float | None
    p99_latency_ms: float | None
    errors: tuple[str, ...]
    hardware_claim: str

    def to_dict(self) -> dict[str, Any]:
        payload = asdict(self)
        payload["errors"] = list(self.errors)
        return payload


def percentile(values: list[float], percentile_value: float) -> float | None:
    """Return the nearest-rank percentile without external dependencies."""
    if not values:
        return None
    if not 0 <= percentile_value <= 100:
        raise ValueError("percentile_value must be between 0 and 100")
    ordered = sorted(values)
    rank = max(1, math.ceil((percentile_value / 100) * len(ordered)))
    return ordered[rank - 1]


class TritonHttpClient:
    """Minimal client for Triton/KServe V2 HTTP endpoints.

    This client intentionally uses only Python's standard library so health and
    load evidence can run in low-cost CI. It does not replace NVIDIA's official
    tritonclient package for production use.
    """

    def __init__(self, base_url: str, timeout_seconds: float = 10.0) -> None:
        normalized = base_url.strip().rstrip("/")
        if not normalized.startswith(("http://", "https://")):
            raise ValueError("base_url must begin with http:// or https://")
        if timeout_seconds <= 0:
            raise ValueError("timeout_seconds must be greater than zero")
        self.base_url = normalized
        self.timeout_seconds = timeout_seconds

    def live(self) -> bool:
        return self._health("/v2/health/live")

    def ready(self) -> bool:
        return self._health("/v2/health/ready")

    def model_ready(self, model: str, version: str | None = None) -> bool:
        path = f"/v2/models/{model}"
        if version:
            path += f"/versions/{version}"
        return self._health(path + "/ready")

    def infer(
        self,
        model: str,
        payload: dict[str, Any],
        version: str | None = None,
    ) -> dict[str, Any]:
        path = f"/v2/models/{model}"
        if version:
            path += f"/versions/{version}"
        path += "/infer"
        response = self._request("POST", path, payload)
        if not isinstance(response, dict):
            raise ValueError("inference endpoint returned a non-object JSON response")
        return response

    def _health(self, path: str) -> bool:
        try:
            self._request("GET", path, None)
            return True
        except (HTTPError, URLError, TimeoutError, ValueError):
            return False

    def _request(
        self,
        method: str,
        path: str,
        payload: dict[str, Any] | None,
    ) -> Any:
        body = None if payload is None else json.dumps(payload).encode("utf-8")
        headers = {"Accept": "application/json"}
        if body is not None:
            headers["Content-Type"] = "application/json"
        request = Request(
            self.base_url + path,
            data=body,
            headers=headers,
            method=method,
        )
        with urlopen(request, timeout=self.timeout_seconds) as response:
            raw = response.read()
            if not raw:
                return {}
            return json.loads(raw.decode("utf-8"))


def benchmark(
    client: TritonHttpClient,
    model: str,
    payload_factory: Callable[[int], dict[str, Any]],
    request_count: int,
    concurrency: int,
    *,
    version: str | None = None,
    evidence_label: str = "locally-tested-http",
    hardware_claim: str = "No GPU execution is implied by this client report.",
) -> BenchmarkReport:
    if request_count <= 0:
        raise ValueError("request_count must be greater than zero")
    if concurrency <= 0:
        raise ValueError("concurrency must be greater than zero")
    if concurrency > request_count:
        concurrency = request_count
    if not evidence_label.strip():
        raise ValueError("evidence_label is required")

    def execute(index: int) -> RequestResult:
        started = perf_counter()
        try:
            client.infer(model, payload_factory(index), version=version)
            return RequestResult(
                success=True,
                latency_ms=(perf_counter() - started) * 1000,
                status_code=200,
            )
        except HTTPError as exc:
            return RequestResult(
                success=False,
                latency_ms=(perf_counter() - started) * 1000,
                status_code=exc.code,
                error=f"HTTP {exc.code}: {exc.reason}",
            )
        except (URLError, TimeoutError, ValueError, json.JSONDecodeError) as exc:
            return RequestResult(
                success=False,
                latency_ms=(perf_counter() - started) * 1000,
                status_code=None,
                error=f"{type(exc).__name__}: {exc}",
            )

    wall_started = perf_counter()
    results: list[RequestResult] = []
    with ThreadPoolExecutor(max_workers=concurrency) as pool:
        futures = [pool.submit(execute, index) for index in range(request_count)]
        for future in as_completed(futures):
            results.append(future.result())
    wall_seconds = max(perf_counter() - wall_started, 1e-9)

    successful_latencies = [item.latency_ms for item in results if item.success]
    errors = tuple(sorted({item.error for item in results if item.error}))
    succeeded = len(successful_latencies)

    return BenchmarkReport(
        model=model,
        endpoint=client.base_url,
        evidence_label=evidence_label,
        requested=request_count,
        succeeded=succeeded,
        failed=request_count - succeeded,
        concurrency=concurrency,
        wall_time_seconds=round(wall_seconds, 6),
        throughput_requests_per_second=round(succeeded / wall_seconds, 3),
        p50_latency_ms=_rounded(percentile(successful_latencies, 50)),
        p95_latency_ms=_rounded(percentile(successful_latencies, 95)),
        p99_latency_ms=_rounded(percentile(successful_latencies, 99)),
        errors=errors,
        hardware_claim=hardware_claim,
    )


def _rounded(value: float | None) -> float | None:
    return None if value is None else round(value, 3)


def _payload_factory(template: dict[str, Any]) -> Callable[[int], dict[str, Any]]:
    def factory(index: int) -> dict[str, Any]:
        payload = json.loads(json.dumps(template))
        payload.setdefault("parameters", {})["portfolio_request_id"] = str(index)
        return payload

    return factory


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Collect honest health and HTTP inference evidence from a Triton-compatible endpoint."
    )
    parser.add_argument("--base-url", required=True)
    parser.add_argument("--model", required=True)
    parser.add_argument("--version")
    parser.add_argument("--payload", type=Path, required=True)
    parser.add_argument("--requests", type=int, default=10)
    parser.add_argument("--concurrency", type=int, default=2)
    parser.add_argument("--timeout-seconds", type=float, default=10.0)
    parser.add_argument(
        "--evidence-label",
        default="locally-tested-http",
        help="Examples: mock-http, local-cpu-triton, gpu-lab-measured",
    )
    parser.add_argument(
        "--hardware-claim",
        default="No GPU execution is implied by this client report.",
    )
    parser.add_argument("--output", type=Path)
    args = parser.parse_args(argv)

    payload = json.loads(args.payload.read_text(encoding="utf-8"))
    client = TritonHttpClient(args.base_url, timeout_seconds=args.timeout_seconds)

    health = {
        "server_live": client.live(),
        "server_ready": client.ready(),
        "model_ready": client.model_ready(args.model, version=args.version),
    }
    if not all(health.values()):
        print(json.dumps({"health": health, "status": "not-ready"}, indent=2))
        return 2

    report = benchmark(
        client,
        args.model,
        _payload_factory(payload),
        args.requests,
        args.concurrency,
        version=args.version,
        evidence_label=args.evidence_label,
        hardware_claim=args.hardware_claim,
    )
    rendered = json.dumps({"health": health, "benchmark": report.to_dict()}, indent=2)
    print(rendered)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered + "\n", encoding="utf-8")
    return 0 if report.failed == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
