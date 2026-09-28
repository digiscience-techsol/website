from __future__ import annotations

import argparse
import json
from typing import Any


def train_pytorch() -> None:
    """Self-contained function serialized by Kubeflow Trainer.

    This mirrors the distributed-environment pattern documented by Kubeflow:
    use NCCL when CUDA is available, Gloo for CPU evidence, initialize the
    process group, use DistributedSampler and wrap the model with DDP.
    """
    import os

    import torch
    import torch.distributed as dist
    from torch import nn
    from torch.nn.parallel import DistributedDataParallel
    from torch.utils.data import DataLoader, DistributedSampler, TensorDataset

    device_kind, backend = ("cuda", "nccl") if torch.cuda.is_available() else (
        "cpu",
        "gloo",
    )
    dist.init_process_group(backend=backend)
    rank = dist.get_rank()
    world_size = dist.get_world_size()
    local_rank = int(os.getenv("LOCAL_RANK", "0"))
    device = torch.device(
        f"cuda:{local_rank}" if device_kind == "cuda" else "cpu"
    )
    if device_kind == "cuda":
        torch.cuda.set_device(local_rank)

    generator = torch.Generator().manual_seed(42)
    features = torch.randn(512, 8, generator=generator)
    weights = torch.randn(8, 2, generator=generator)
    labels = (features @ weights).argmax(dim=1)
    dataset = TensorDataset(features, labels)
    sampler = DistributedSampler(
        dataset,
        num_replicas=world_size,
        rank=rank,
        shuffle=True,
        seed=42,
    )
    loader = DataLoader(dataset, batch_size=32, sampler=sampler)

    model = nn.Sequential(nn.Linear(8, 16), nn.ReLU(), nn.Linear(16, 2)).to(device)
    model = DistributedDataParallel(
        model,
        device_ids=[local_rank] if device_kind == "cuda" else None,
    )
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
    loss_fn = nn.CrossEntropyLoss()

    for epoch in range(2):
        sampler.set_epoch(epoch)
        for batch_features, batch_labels in loader:
            optimizer.zero_grad(set_to_none=True)
            loss = loss_fn(model(batch_features.to(device)), batch_labels.to(device))
            loss.backward()
            optimizer.step()
        if rank == 0:
            print(
                json.dumps(
                    {
                        "epoch": epoch,
                        "loss": float(loss.detach().cpu().item()),
                        "world_size": world_size,
                        "backend": backend,
                        "evidence_boundary": (
                            "This output exists only when the submitted TrainJob actually runs."
                        ),
                    }
                )
            )

    dist.barrier()
    dist.destroy_process_group()


def submit(
    *,
    num_nodes: int,
    gpu_per_node: int,
    cpu_per_node: int,
    memory_per_node: str,
) -> str:
    if num_nodes <= 0 or gpu_per_node < 0 or cpu_per_node <= 0:
        raise ValueError("invalid node/GPU/CPU request")
    try:
        from kubeflow.trainer import CustomTrainer, TrainerClient
    except ImportError as exc:  # pragma: no cover - optional runtime
        raise RuntimeError(
            "Kubeflow SDK is not installed. Install the project with the 'kubeflow' extra."
        ) from exc

    resources: dict[str, Any] = {
        "cpu": cpu_per_node,
        "memory": memory_per_node,
    }
    if gpu_per_node:
        resources["gpu"] = gpu_per_node

    client = TrainerClient()
    available = {runtime.name for runtime in client.list_runtimes()}
    if "torch-distributed" not in available:
        raise RuntimeError(
            "Required Kubeflow runtime 'torch-distributed' is not available; "
            f"found {sorted(available)}"
        )
    job_id = client.train(
        trainer=CustomTrainer(
            func=train_pytorch,
            num_nodes=num_nodes,
            resources_per_node=resources,
        )
    )
    return str(job_id)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Submit the synthetic distributed PyTorch function with Kubeflow Trainer."
    )
    parser.add_argument("--nodes", type=int, default=2)
    parser.add_argument("--gpus-per-node", type=int, default=1)
    parser.add_argument("--cpus-per-node", type=int, default=3)
    parser.add_argument("--memory-per-node", default="16Gi")
    args = parser.parse_args(argv)
    job_id = submit(
        num_nodes=args.nodes,
        gpu_per_node=args.gpus_per_node,
        cpu_per_node=args.cpus_per_node,
        memory_per_node=args.memory_per_node,
    )
    print(json.dumps({"job_id": job_id, "status": "submitted"}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
