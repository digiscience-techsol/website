# AI Platform Engineer — Hands-On Evidence Portfolio

> Five additional technical case studies built to demonstrate hands-on AI-platform engineering across Kubernetes, GPU orchestration, Python, PyTorch/TensorFlow, Jupyter, NVIDIA tooling, MLOps, distributed training and hybrid HPC.

## Portfolio purpose

This portfolio is a **synthetic, evidence-led engineering portfolio**. It does not claim that the fictional organizations or workloads described here are real customers. It is designed to show how a senior cloud/platform architect can translate enterprise requirements into an implementable AI/ML platform with code, infrastructure automation, security controls, operational practices, cost governance and measurable validation.

**Target role family:** AI Platform Engineer · GPU Platform Engineer · MLOps Platform Engineer · AI Infrastructure Architect · HPC/AI Platform Architect

**Role source used for the evidence map:** AHEAD — AI Platform Engineer

## What this portfolio proves

A reviewer should be able to verify that the candidate can:

1. Design and implement Kubernetes foundations for AI/ML workloads.
2. Explain and configure GPU discovery, partitioning, sharing, scheduling, quotas, priority and pre-emption.
3. Build typed Python automation rather than relying only on diagrams.
4. Package and run PyTorch and TensorFlow workloads.
5. Create reproducible Jupyter-based experimentation paths.
6. Implement MLflow and Kubeflow lifecycle controls.
7. Explain CUDA, NVIDIA GPU Operator, NeMo-oriented workflows, Triton and TensorRT integration boundaries.
8. Design distributed training around MPI/NCCL, topology, checkpointing and data locality.
9. Operate AI workloads across cloud, Kubernetes and traditional HPC environments.
10. Apply Terraform, Ansible, CI/CD, security, SRE and FinOps disciplines to the AI platform.

## Case-study map

| ID | Case study | Primary proof | Status |
|---|---|---|---|
| L2-CS01 | [Multi-Tenant Kubernetes GPU Platform](./cs01-kubernetes-gpu-platform/) | GPU Operator, MIG/time-slicing, queues, quotas, fair-share, Python submission automation | Foundation created |
| L2-CS02 | [Distributed Training Factory](./cs02-distributed-training-factory/) | PyTorch DDP, TensorFlow multi-worker, Kubeflow Trainer, MPI/NCCL, checkpoint recovery | Foundation created |
| L2-CS03 | [Jupyter-to-Production MLOps Platform](./cs03-jupyter-mlops-platform/) | Jupyter, MLflow, Kubeflow Pipelines, registry, promotion controls, monitoring | Foundation created |
| L2-CS04 | [NVIDIA Optimized Inference Platform](./cs04-nvidia-inference-platform/) | Triton, TensorRT, KServe, dynamic batching, load tests, GPU telemetry | Foundation created |
| L2-CS05 | [Hybrid HPC and AI Cloud-Burst Platform](./cs05-hybrid-hpc-ai-platform/) | Slurm/Kubernetes, hybrid placement, high-speed data, distributed workloads, chargeback | Foundation created |

## Job-description evidence matrix

| Requirement | L2-CS01 | L2-CS02 | L2-CS03 | L2-CS04 | L2-CS05 |
|---|:---:|:---:|:---:|:---:|:---:|
| Kubernetes for AI/ML | ● | ● | ● | ● | ● |
| Run:ai or equivalent GPU scheduling | ● | ● |  | ● | ● |
| Python automation | ● | ● | ● | ● | ● |
| TensorFlow / PyTorch | workload sample | ● | ● | benchmark client | ● |
| Jupyter Notebooks | workspace integration | notebook | ● | benchmark notebook | research workspace |
| CUDA / GPU drivers | ● | ● |  | ● | ● |
| NeMo-oriented workflow |  | fine-tuning option | pipeline option | service option |  |
| Triton / TensorRT |  |  | deployment stage | ● | burst-inference option |
| MLflow / Kubeflow | integration | ● | ● | registry/deployment integration | job metadata integration |
| Distributed training | scheduling foundation | ● | pipeline trigger |  | ● |
| HPC | scheduler concepts | ● |  | performance engineering | ● |
| Terraform / Ansible | ● | ● | ● | ● | ● |
| CI/CD and monitoring | ● | ● | ● | ● | ● |

## Honest implementation labels

Every evidence item uses one of these labels:

- **Implemented:** source code or declarative configuration is present.
- **Locally tested:** executed in a local or CPU-safe environment with captured output.
- **Structurally validated:** syntax/schema/lint validation completed, but the full target infrastructure was not provisioned.
- **Simulated:** behavior demonstrated with synthetic inputs or a scheduler/cost simulator.
- **Design-only:** architecture or operating decision documented but not executed.
- **Requires GPU/cloud:** implementation is present but final runtime validation requires paid or specialized infrastructure.
- **Planned:** clearly identified backlog item, not represented as complete.

## Common repository/document standard

Each case study is being expanded to include:

```text
README.md
ARCHITECT-GUIDE.md
docs/
  01-requirements/
  02-proposal/
  03-solution-design/
  04-security/
  05-finops-sre/
  06-implementation/
  07-demo/
src/
tests/
notebooks/
kubernetes/
helm/
terraform/
ansible/
pipelines/
observability/
evidence/
.github/workflows/
```

The final evidence chain for each project is:

```text
Business need
  -> RFP / requirements
  -> proposal and value case
  -> HLD / LLD / ADRs
  -> security and operating controls
  -> IaC and application implementation
  -> CI validation
  -> synthetic/local runtime evidence
  -> demo script
  -> interview and profile proof statement
```

## Architecture and implementation principles

1. **Portable first:** use Kubernetes, Terraform, Ansible and open interfaces so the design can run on AWS, Azure, GCP or on-premises.
2. **Commercial honesty:** paid Run:ai capabilities are mapped to equivalent scheduling concepts using openly available components when a licensed environment is unavailable.
3. **GPU-aware, not GPU-dependent for all tests:** CI and local tests must remain runnable without a GPU; GPU-specific validation is isolated and labelled.
4. **Secure multi-tenancy:** namespace isolation, RBAC, quotas, network policy, workload identity, secrets and image controls are included from the start.
5. **Evidence over claims:** every major résumé/interview statement links to code, configuration, an architecture decision or captured validation output.
6. **Operations included:** SLOs, observability, incident response, capacity, upgrades, backup, DR and cost governance are part of the platform—not post-project extras.
7. **Synthetic only:** no real employer, customer, patient, account, credential or proprietary dataset is used.

## Interview demonstration sequence

A 25-minute technical walkthrough should follow this order:

1. Explain the business constraint and why a normal Kubernetes cluster is insufficient.
2. Show GPU platform architecture and scheduling controls in L2-CS01.
3. Submit or simulate a distributed training workload from L2-CS02.
4. Show notebook-to-registry lineage and promotion gates in L2-CS03.
5. Compare baseline and optimized inference configurations in L2-CS04.
6. Explain when a workload remains on HPC, moves to Kubernetes or bursts to cloud in L2-CS05.
7. Close with security, cost, reliability and operational ownership.

## Profile-ready portfolio description

> Built a five-part AI Platform Engineering portfolio demonstrating Kubernetes GPU platforms, fair-share scheduling, Python automation, PyTorch/TensorFlow distributed training, Jupyter/MLflow/Kubeflow MLOps, NVIDIA Triton/TensorRT inference optimization, and hybrid HPC/cloud-burst architecture. Each case study includes enterprise requirements, architecture decisions, IaC, CI/CD, security, SRE/FinOps controls, tests and transparent evidence labels.

## Guardrails

- Run:ai is referenced as a target commercial platform capability; no paid Run:ai execution is claimed without an actual licensed environment.
- No real multi-GPU speedup or TensorRT improvement percentage is published without captured hardware evidence.
- CPU-safe demonstrations are labelled CPU/local simulations.
- NVIDIA and other vendor components remain subject to their respective licenses.
- No cloud deployment is executed without cost and security approval.
