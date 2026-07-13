from __future__ import annotations

import json
import threading
import unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import ClassVar

from inference_evidence import TritonHttpClient, benchmark, percentile


class MockTritonHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    requests_seen: ClassVar[int] = 0

    def log_message(self, format: str, *args: object) -> None:
        return

    def do_GET(self) -> None:  # noqa: N802 - standard library handler contract
        if self.path in {
            "/v2/health/live",
            "/v2/health/ready",
            "/v2/models/synthetic_classifier/ready",
        }:
            self._write(200, {})
        else:
            self._write(404, {"error": "not found"})

    def do_POST(self) -> None:  # noqa: N802 - standard library handler contract
        if self.path != "/v2/models/synthetic_classifier/infer":
            self._write(404, {"error": "not found"})
            return
        length = int(self.headers.get("Content-Length", "0"))
        payload = json.loads(self.rfile.read(length).decode("utf-8"))
        type(self).requests_seen += 1
        response = {
            "model_name": "synthetic_classifier",
            "model_version": "1",
            "parameters": payload.get("parameters", {}),
            "outputs": [
                {
                    "name": "PROBABILITIES",
                    "shape": [1, 2],
                    "datatype": "FP32",
                    "data": [0.25, 0.75],
                }
            ],
        }
        self._write(200, response)

    def _write(self, status: int, payload: dict[str, object]) -> None:
        encoded = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)


class InferenceEvidenceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), MockTritonHandler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        host, port = cls.server.server_address
        cls.base_url = f"http://{host}:{port}"

    @classmethod
    def tearDownClass(cls) -> None:
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join(timeout=2)

    def setUp(self) -> None:
        MockTritonHandler.requests_seen = 0
        self.client = TritonHttpClient(self.base_url, timeout_seconds=2)

    def test_health_and_model_readiness(self) -> None:
        self.assertTrue(self.client.live())
        self.assertTrue(self.client.ready())
        self.assertTrue(self.client.model_ready("synthetic_classifier"))
        self.assertFalse(self.client.model_ready("missing"))

    def test_inference_response_is_parsed(self) -> None:
        result = self.client.infer(
            "synthetic_classifier",
            {
                "inputs": [
                    {
                        "name": "FEATURES",
                        "shape": [1, 4],
                        "datatype": "FP32",
                        "data": [0.1, 0.2, 0.3, 0.4],
                    }
                ]
            },
        )
        self.assertEqual(result["model_name"], "synthetic_classifier")
        self.assertEqual(result["outputs"][0]["shape"], [1, 2])

    def test_load_report_uses_actual_mock_http_calls(self) -> None:
        report = benchmark(
            self.client,
            "synthetic_classifier",
            lambda index: {
                "parameters": {"request_id": str(index)},
                "inputs": [
                    {
                        "name": "FEATURES",
                        "shape": [1, 4],
                        "datatype": "FP32",
                        "data": [0.1, 0.2, 0.3, 0.4],
                    }
                ],
            },
            request_count=12,
            concurrency=3,
            evidence_label="mock-http",
            hardware_claim="Local mock HTTP server; no Triton or GPU execution.",
        )
        self.assertEqual(report.succeeded, 12)
        self.assertEqual(report.failed, 0)
        self.assertEqual(report.evidence_label, "mock-http")
        self.assertEqual(MockTritonHandler.requests_seen, 12)
        self.assertIsNotNone(report.p95_latency_ms)
        self.assertGreater(report.throughput_requests_per_second, 0)
        self.assertIn("no Triton", report.hardware_claim)

    def test_invalid_benchmark_size_is_rejected(self) -> None:
        with self.assertRaises(ValueError):
            benchmark(
                self.client,
                "synthetic_classifier",
                lambda _: {},
                request_count=0,
                concurrency=1,
            )

    def test_nearest_rank_percentile(self) -> None:
        values = [1.0, 2.0, 3.0, 4.0, 100.0]
        self.assertEqual(percentile(values, 50), 3.0)
        self.assertEqual(percentile(values, 95), 100.0)
        self.assertIsNone(percentile([], 95))


if __name__ == "__main__":
    unittest.main()
