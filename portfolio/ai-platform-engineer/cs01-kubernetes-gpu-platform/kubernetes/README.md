# Kubernetes Evidence — L2-CS01

This directory contains declarative evidence for the multi-tenant Kubernetes GPU platform. The files are intentionally split by concern so an interviewer or platform reviewer can trace identity, tenancy, scheduling, GPU sharing, network isolation and workload admission independently.

## Evidence status

| Area | Status | Meaning |
|---|---|---|
| YAML structure | Structurally validated | Parsed in CI; API-server admission still requires a compatible cluster and installed CRDs |
| Kubernetes core resources | Design/manifest evidence | Namespace, RBAC, quotas, limits, PriorityClass, NetworkPolicy and Job resources are present |
| Kueue resources | Structurally validated | Uses current `kueue.x-k8s.io/v1beta2`; runtime requires Kueue installation |
| NVIDIA time-slicing | Structurally validated | Configuration follows GPU Operator format; runtime requires compatible NVIDIA hardware/operator |
| GPU smoke test | Requires GPU hardware | No successful GPU execution is claimed by this repository yet |
| Run:ai | Capability mapping only | No paid Run:ai environment or execution is claimed |

## File map

```text
kubernetes/
├── tenants/tenant-foundation.yaml
├── scheduling/priority-classes.yaml
├── scheduling/kueue-gpu-queues.yaml
├── gpu-operator/time-slicing-config.yaml
├── policies/network-policies.yaml
└── workloads/sample-gpu-job.yaml
```

## Prerequisites

- A Kubernetes version supported by the selected Kueue and NVIDIA GPU Operator releases.
- Kueue installed before applying the Kueue custom resources.
- NVIDIA GPU Operator installed in namespace `gpu-operator` before applying the time-slicing configuration.
- GPU nodes labelled for the intended pool, for example:

```bash
kubectl label node <gpu-node> gpu.platform.digiscience.io/pool=shared
```

- A CNI implementation that enforces Kubernetes NetworkPolicy.
- Access to the selected CUDA validation image or an approved internal mirror.

## Suggested application order

```bash
kubectl apply -f tenants/tenant-foundation.yaml
kubectl apply -f scheduling/priority-classes.yaml
kubectl apply -f scheduling/kueue-gpu-queues.yaml
kubectl apply -f policies/network-policies.yaml
kubectl apply -f gpu-operator/time-slicing-config.yaml
kubectl apply -f workloads/sample-gpu-job.yaml
```

The time-slicing ConfigMap alone does not activate sharing. The GPU Operator ClusterPolicy must reference the ConfigMap, and the device-plugin pods must apply/reload it. For a cluster-wide configuration, the target operation is equivalent to:

```bash
kubectl patch clusterpolicies.nvidia.com/cluster-policy \
  -n gpu-operator --type merge \
  -p '{"spec":{"devicePlugin":{"config":{"name":"time-slicing-config","default":"any"}}}}'
```

Perform operator/device-plugin changes in an approved maintenance window and verify node labels and allocatable resources before admitting user workloads.

## Validation commands

### Core inventory

```bash
kubectl get namespaces risk-ai retail-ai --show-labels
kubectl get serviceaccounts,roles,rolebindings,resourcequotas,limitranges -n risk-ai
kubectl get priorityclasses | grep gpu-
```

### Kueue

```bash
kubectl get resourceflavors.kueue.x-k8s.io
kubectl get clusterqueues.kueue.x-k8s.io
kubectl get localqueues.kueue.x-k8s.io -A
kubectl describe clusterqueue risk-ai-gpu-cq
```

### GPU sharing

```bash
kubectl get configmap time-slicing-config -n gpu-operator -o yaml
kubectl get nodes -L nvidia.com/gpu.count,nvidia.com/gpu.replicas,nvidia.com/gpu.product
kubectl describe node <gpu-node> | sed -n '/Capacity:/,/System Info:/p'
```

### Workload admission

```bash
kubectl get job risk-ai-gpu-smoke-test -n risk-ai -o yaml
kubectl get workloads.kueue.x-k8s.io -n risk-ai
kubectl get pods -n risk-ai
```

## Security notes

- The namespace uses the restricted Pod Security profile.
- The sample workload uses a non-root UID, default seccomp profile, read-only root filesystem and drops Linux capabilities.
- Tenant namespaces are default-deny and permit only DNS egress in this initial evidence set.
- Production platforms need explicit policies for artifact registries, object stores, MLflow, telemetry and approved package sources.
- Service accounts are namespace-scoped; cloud/object-store access should use workload identity rather than static keys.

## GPU-sharing risk note

Time-slicing increases schedulable replicas but does not provide MIG-like memory or fault isolation. It is therefore assigned to approved development classes, while sensitive or predictable workloads should use full GPUs or appropriate MIG profiles. DCGM container attribution also has limitations when time-slicing is enabled, so showback must not overstate per-container precision without verified telemetry.

## Teardown

```bash
kubectl delete -f workloads/sample-gpu-job.yaml --ignore-not-found
kubectl delete -f policies/network-policies.yaml --ignore-not-found
kubectl delete -f scheduling/kueue-gpu-queues.yaml --ignore-not-found
kubectl delete -f scheduling/priority-classes.yaml --ignore-not-found
kubectl delete -f tenants/tenant-foundation.yaml --ignore-not-found
```

Do not delete or modify the production GPU Operator ClusterPolicy using a portfolio runbook. Revert time-slicing through the platform's approved change procedure.
