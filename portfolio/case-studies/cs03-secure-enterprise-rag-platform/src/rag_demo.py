#!/usr/bin/env python3
"""Identity-aware, deterministic RAG demonstration using synthetic documents.

This is intentionally model-free. It demonstrates authorization before
retrieval, hybrid lexical scoring, evidence thresholds and source citations.
"""
from __future__ import annotations

import argparse
import json
import math
import re
from dataclasses import asdict, dataclass
from typing import Iterable

TOKEN_RE = re.compile(r"[a-zA-Z0-9_-]+")


@dataclass(frozen=True)
class Document:
    document_id: str
    title: str
    text: str
    allowed_groups: frozenset[str]
    version: int
    active: bool = True


@dataclass(frozen=True)
class Hit:
    document_id: str
    title: str
    version: int
    score: float
    excerpt: str


def tokens(text: str) -> set[str]:
    return {token.lower() for token in TOKEN_RE.findall(text)}


def score(query: str, document: Document) -> float:
    q = tokens(query)
    d = tokens(document.title + " " + document.text)
    if not q or not d:
        return 0.0
    overlap = len(q & d)
    lexical = overlap / len(q)
    jaccard = overlap / len(q | d)
    title_bonus = 0.15 if q & tokens(document.title) else 0.0
    return round((0.65 * lexical) + (0.35 * jaccard) + title_bonus, 4)


def retrieve(
    query: str,
    user_groups: set[str],
    documents: Iterable[Document],
    minimum_score: float = 0.25,
    limit: int = 3,
) -> list[Hit]:
    hits: list[Hit] = []
    for document in documents:
        # Authorization is applied before content becomes candidate evidence.
        if not document.active or not (user_groups & set(document.allowed_groups)):
            continue
        value = score(query, document)
        if value < minimum_score:
            continue
        excerpt = document.text[:180].strip()
        hits.append(Hit(document.document_id, document.title, document.version, value, excerpt))
    return sorted(hits, key=lambda h: (-h.score, h.document_id))[:limit]


def answer(query: str, groups: set[str], documents: list[Document]) -> dict[str, object]:
    hits = retrieve(query, groups, documents)
    if not hits:
        return {
            "status": "insufficient_authorized_evidence",
            "answer": "No authorized evidence met the minimum threshold.",
            "citations": [],
        }

    top = hits[0]
    citation = f"[{top.document_id} v{top.version}]"
    return {
        "status": "grounded",
        "answer": f"Evidence indicates: {top.excerpt} {citation}",
        "citations": [asdict(hit) for hit in hits],
        "trace": {
            "query_token_count": len(tokens(query)),
            "authorized_groups": sorted(groups),
            "retrieved": len(hits),
            "policy": "authorization-before-retrieval",
        },
    }


def sample_documents() -> list[Document]:
    return [
        Document(
            "POL-001",
            "Cloud Change Policy",
            "Production cloud changes require an approved pull request, change record, rollback plan and post-deployment verification.",
            frozenset({"engineering", "operations"}),
            3,
        ),
        Document(
            "HR-007",
            "Confidential Compensation Policy",
            "Compensation review data is restricted to authorized human-resources users.",
            frozenset({"hr"}),
            2,
        ),
        Document(
            "POL-OLD",
            "Old Cloud Change Policy",
            "This superseded policy allowed manual production changes.",
            frozenset({"engineering"}),
            1,
            active=False,
        ),
    ]


def self_test() -> None:
    docs = sample_documents()
    result = answer("What is required for production cloud changes?", {"engineering"}, docs)
    assert result["status"] == "grounded"
    assert "POL-001" in result["answer"]
    assert "POL-OLD" not in json.dumps(result)

    forbidden = answer("What does the compensation policy say?", {"engineering"}, docs)
    assert forbidden["status"] == "insufficient_authorized_evidence"

    hr = answer("compensation review", {"hr"}, docs)
    assert hr["status"] == "grounded"
    assert "HR-007" in hr["answer"]
    print("CS03 self-test passed")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
        return 0
    print(
        json.dumps(
            answer("production change rollback", {"engineering"}, sample_documents()),
            indent=2,
            sort_keys=True,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
