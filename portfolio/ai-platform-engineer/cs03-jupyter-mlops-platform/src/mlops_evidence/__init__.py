"""Synthetic Jupyter-to-production MLOps evidence package."""

from .core import Dataset, LogisticModel, evaluate, generate_dataset, train
from .gates import GateDecision, apply_quality_gate

__all__ = [
    "Dataset",
    "LogisticModel",
    "GateDecision",
    "generate_dataset",
    "train",
    "evaluate",
    "apply_quality_gate",
]
