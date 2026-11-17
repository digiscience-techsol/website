from __future__ import annotations

import argparse
import json
import os
import time
from pathlib import Path
from typing import Any

from .config import TrainingConfig


def run(config: TrainingConfig, *, resume: bool = False) -> dict[str, Any]:
    """Run a small synthetic PyTorch classifier locally or under torchrun.

    The module supports single-process CPU/GPU execution and Distributed Data
    Parallel when WORLD_SIZE is greater than one. Actual evidence must record
    the detected backend and device; source code presence is not a GPU result.
    """
    if config.framework != "pytorch":
        raise ValueError("PyTorch runner requires framework='pytorch'")
    try:
        import torch
        import torch.distributed as dist
        from torch import nn
        from torch.nn.parallel import DistributedDataParallel
        from torch.utils.data import DataLoader, DistributedSampler, TensorDataset
    except ImportError as exc:  # pragma: no cover - depends on optional runtime
        raise RuntimeError(
            "PyTorch is not installed. Install the project with the 'pytorch' extra."
        ) from exc

    world_size = int(os.getenv("WORLD_SIZE", "1"))
    rank = int(os.getenv("RANK", "0"))
    local_rank = int(os.getenv("LOCAL_RANK", "0"))
    distributed = world_size > 1
    use_cuda = torch.cuda.is_available()
    backend = "nccl" if use_cuda else "gloo"

    if distributed and not dist.is_initialized():
        dist.init_process_group(backend=backend)

    if use_cuda:
        torch.cuda.set_device(local_rank)
        device = torch.device(f"cuda:{local_rank}")
    else:
        device = torch.device("cpu")

    generator = torch.Generator().manual_seed(config.seed)
    features = torch.randn(config.samples, config.features, generator=generator)
    true_weights = torch.randn(
        config.features,
        config.classes,
        generator=generator,
    )
    labels = (features @ true_weights).argmax(dim=1)
    dataset = TensorDataset(features, labels)
    sampler = (
        DistributedSampler(
            dataset,
            num_replicas=world_size,
            rank=rank,
            shuffle=True,
            seed=config.seed,
        )
        if distributed
        else None
    )
    loader = DataLoader(
        dataset,
        batch_size=config.batch_size,
        shuffle=sampler is None,
        sampler=sampler,
    )

    torch.manual_seed(config.seed)
    model = nn.Sequential(
        nn.Linear(config.features, 16),
        nn.ReLU(),
        nn.Linear(16, config.classes),
    ).to(device)
    if distributed:
        model = DistributedDataParallel(
            model,
            device_ids=[local_rank] if use_cuda else None,
        )

    optimizer = torch.optim.Adam(model.parameters(), lr=config.learning_rate)
    loss_fn = nn.CrossEntropyLoss()

    checkpoint_dir = Path(config.checkpoint_dir)
    output_dir = Path(config.output_dir)
    checkpoint_path = checkpoint_dir / f"{config.experiment}-pytorch.pt"
    start_epoch = 0

    if resume and checkpoint_path.exists():
        checkpoint = torch.load(checkpoint_path, map_location=device, weights_only=False)
        target_model = model.module if distributed else model
        target_model.load_state_dict(checkpoint["model_state"])
        optimizer.load_state_dict(checkpoint["optimizer_state"])
        start_epoch = int(checkpoint["epoch"]) + 1

    started = time.perf_counter()
    final_loss = 0.0
    try:
        for epoch in range(start_epoch, config.epochs):
            if sampler is not None:
                sampler.set_epoch(epoch)
            total_loss = torch.tensor(0.0, device=device)
            sample_count = torch.tensor(0.0, device=device)

            model.train()
            for batch_features, batch_labels in loader:
                batch_features = batch_features.to(device)
                batch_labels = batch_labels.to(device)
                optimizer.zero_grad(set_to_none=True)
                logits = model(batch_features)
                loss = loss_fn(logits, batch_labels)
                loss.backward()
                optimizer.step()
                total_loss += loss.detach() * batch_features.shape[0]
                sample_count += batch_features.shape[0]

            if distributed:
                dist.all_reduce(total_loss, op=dist.ReduceOp.SUM)
                dist.all_reduce(sample_count, op=dist.ReduceOp.SUM)
            final_loss = float((total_loss / sample_count).item())

            if rank == 0:
                checkpoint_dir.mkdir(parents=True, exist_ok=True)
                target_model = model.module if distributed else model
                torch.save(
                    {
                        "epoch": epoch,
                        "model_state": target_model.state_dict(),
                        "optimizer_state": optimizer.state_dict(),
                        "config": config.to_dict(),
                        "final_loss": final_loss,
                    },
                    checkpoint_path,
                )

        if distributed:
            dist.barrier()
    finally:
        if distributed and dist.is_initialized():
            dist.destroy_process_group()

    evidence_label = (
        "gpu-nccl-measured"
        if use_cuda and distributed
        else "single-gpu-measured"
        if use_cuda
        else "distributed-cpu-gloo-measured"
        if distributed
        else "local-cpu-measured"
    )
    metrics = {
        "experiment": config.experiment,
        "framework": "pytorch",
        "backend": backend if distributed else "single-process",
        "world_size": world_size,
        "rank": rank,
        "device": str(device),
        "epochs_completed": config.epochs,
        "final_loss": round(final_loss, 6),
        "duration_seconds": round(time.perf_counter() - started, 6),
        "checkpoint": str(checkpoint_path),
        "evidence_label": evidence_label,
        "hardware_claim": (
            "Device/backend fields are detected at runtime; do not infer GPU or multi-node "
            "execution from source code alone."
        ),
    }
    if rank == 0:
        output_dir.mkdir(parents=True, exist_ok=True)
        metrics_path = output_dir / f"{config.experiment}-pytorch.json"
        metrics_path.write_text(json.dumps(metrics, indent=2) + "\n", encoding="utf-8")
    return metrics


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Run synthetic PyTorch/DDP training evidence.")
    parser.add_argument("config", type=Path)
    parser.add_argument("--resume", action="store_true")
    args = parser.parse_args(argv)
    metrics = run(TrainingConfig.from_path(args.config), resume=args.resume)
    if metrics["rank"] == 0:
        print(json.dumps(metrics, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
