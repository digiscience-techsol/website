# AI Platform Engineering Evidence Portfolio

> **Purpose:** hands-on, recruiter-reviewable proof for senior AI Platform Engineer, GPU Platform Engineer, MLOps Platform Engineer, AI Infrastructure Architect and hybrid HPC/AI roles.
>
> **Evidence policy:** every project uses synthetic scenarios and data. Capabilities are labelled **implemented**, **locally tested**, **structurally validated**, **simulated**, or **planned**. No project is presented as a real customer deployment unless independently supportable.

## Why this portfolio exists

Enterprise AI programs frequently fail between notebook experimentation and reliable production operation. The difficult work is not only model selection; it is creating a secure, multi-tenant, observable and cost-governed platform for GPU scheduling, distributed training, reproducible pipelines, optimized inference and hybrid capacity management.

This portfolio demonstrates that full platform lifecycle through five complementary case studies:

1. **Multi-Tenant Kubernetes GPU Platform** — fair-share scheduling, queues, quotas, GPU sharing, isolation, utilization and cost controls.
2. **Distributed Training Factory** — PyTorch and TensorFlow jobs, checkpointing, topology, scaling efficiency and failure recovery.
3. **Jupyter-to-Production MLOps Platform** — notebooks, MLflow, Kubeflow pipelines, model governance, promotion gates and monitoring.
4. **NVIDIA-Optimized Inference Platform** — Triton, TensorRT workflow, dynamic batching, KServe, autoscaling and benchmark evidence.
5. **Hybrid HPC and AI Cloud-Burst Platform** — Slurm/Kubernetes interoperability, workload placement, data staging, cloud elasticity and FinOps.

## Evidence map

| Capability | CS01 | CS02 | CS03 | CS04 | CS05 |
|---|:---:|:---:|:---:|:---:|:---:|
| Kubernetes for AI/ML | Primary | Used | Used | Used | Integrated |
| GPU scheduling and orchestration | Primary | Used | Quota-aware | Serving capacity | Cross-platform |
| Python automation | Submitter + reports | Training harness | SDK + pipeline components | Benchmark client | Placement engine |
| PyTorch | Workload example | Primary | Registered model | Model export | Batch workload |
| TensorFlow | Workload example | Primary | Registered model | Model export | Batch workload |
| Jupyter | Optional workspace | Experiment notebooks | Primary | Benchmark notebook | Research workspace |
| CUDA and GPU drivers | Platform prerequisite | Runtime | Environment contract | Primary | HPC prerequisite |
| NVIDIA NeMo | Planned integration path | Fine-tuning pattern | Lifecycle pattern | Service path | Burst workload |
| NVIDIA Triton | Optional endpoint | Evaluation endpoint | Deployment target | Primary | Shared service |
| TensorRT | Planned | Model optimization | Promotion artifact | Primary | Optimized inference |
| MLflow | Metrics bridge | Experiment tracking | Primary | Benchmark registry | Cross-site metadata |
| Kubeflow | Training jobs | Primary | Primary | KServe integration | Kubernetes batch path |
| Distributed training | Scheduler-aware | Primary | Pipeline orchestration | Multi-GPU serving | Hybrid execution |
| HPC / Slurm | Context | MPI concepts | Integration point | Capacity source | Primary |
| Terraform / Ansible | Cluster modules | Environment modules | Platform modules | Serving modules | Primary |
| SRE / FinOps | GPU SLO + unit cost | Throughput economics | Pipeline SLO | Latency economics | Chargeback + placement |

## Project navigation

### [CS01 — Multi-Tenant Kubernetes GPU Platform](./cs01-multi-tenant-gpu-platform/)

Builds a secure self-service GPU platform for multiple AI teams. The design covers GPU Operator prerequisites, MIG/time-slicing options, quota hierarchy, priority and pre-emption, gang scheduling, workload submission, DCGM metrics, utilization reporting, policy controls and cost attribution.

### [CS02 — Distributed PyTorch/TensorFlow Training Factory](./cs02-distributed-training-factory/)

Provides repeatable single-node and multi-node training patterns using PyTorch DDP and TensorFlow MultiWorkerMirroredStrategy, with Kubeflow training jobs, checkpoint recovery, dataset staging, scaling-efficiency measurement and pre-emptible capacity controls.

### [CS03 — Jupyter-to-Production MLOps Platform](./cs03-jupyter-mlops-platform/)

Creates a governed path from notebook exploration to versioned, tested and monitored production models. It covers Jupyter workspaces, MLflow tracking and registry, Kubeflow Pipelines, lineage, approval gates, security scanning, canary deployment and rollback.

### [CS04 — NVIDIA-Optimized Inference Platform](./cs04-nvidia-inference-platform/)

Optimizes multi-framework model serving with NVIDIA Triton and a TensorRT conversion path. It includes model-repository governance, dynamic batching, concurrency, KServe, autoscaling, canary rollout, GPU observability and latency/throughput/cost benchmarking.

### [CS05 — Hybrid HPC and AI Cloud-Burst Platform](./cs05-hybrid-hpc-ai-platform/)

Designs a regulated research platform spanning on-premises Slurm/HPC and Kubernetes/cloud capacity. It covers workload-placement policy, high-speed storage and networking, data staging, identity, security, quotas, cloud bursting, chargeback, DR and operating runbooks.

## Common enterprise lifecycle used by every project

Each case study follows the same delivery chain so a reviewer can inspect business, architecture and implementation thinking—not isolated code fragments.

```text
Business problem and RFP
        ↓
Discovery, assumptions and acceptance criteria
        ↓
Proposal, value case and implementation options
        ↓
HLD, LLD, ADRs and threat model
        ↓
Terraform / Ansible / Kubernetes / Python implementation
        ↓
CI validation, tests and synthetic evidence
        ↓
SRE, FinOps, security and handover model
        ↓
Executive demo and interview story
```

## Common definition of done

A case study is recruiter-ready only when all applicable items are present:

- Executive summary and synthetic customer scenario
- Detailed requirements/RFP and discovery questions
- Proposal, scope, exclusions, dependencies and value case
- HLD, LLD, Mermaid/SVG architecture diagrams and ADRs
- IAM/RBAC, network security, data protection and threat model
- SLO/SLI, observability, capacity, DR and operational model
- TCO, unit-cost model, chargeback/showback and optimization levers
- Terraform/Ansible/Kubernetes/Helm/Kustomize implementation
- Typed Python automation with tests
- CI/CD validation and secret-safety controls
- Synthetic test evidence and reproducible demo runbook
- Honest implementation-status matrix
- Resume, LinkedIn, Naukri and interview proof statements

## Public communication rule

Use language such as:

> Designed and implemented a synthetic enterprise reference platform demonstrating multi-tenant GPU scheduling, MLOps governance and production AI operations. Repository includes architecture decisions, IaC, Python automation, tests and reproducible evidence.

Do **not** say:

> Delivered this production platform for a named client.

unless that statement is factually supportable and non-confidential.

## Current status

| Case study | Architecture pack | Implementation | Automated tests | Live GPU validation | Public profile copy |
|---|---|---|---|---|---|
| CS01 GPU platform | In progress | In progress | In progress | Not yet performed | Drafting |
| CS02 training factory | Foundation created | Planned | Planned | Not yet performed | Drafting |
| CS03 MLOps platform | Foundation created | Planned | Planned | Not yet performed | Drafting |
| CS04 inference platform | Foundation created | Planned | Planned | Not yet performed | Drafting |
| CS05 hybrid HPC | Foundation created | Planned | Planned | Not yet performed | Drafting |

The status table is intentionally conservative. A CPU-only or configuration validation will never be described as a real multi-GPU benchmark.