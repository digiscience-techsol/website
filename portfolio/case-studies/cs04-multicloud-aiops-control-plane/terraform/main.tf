# Public portfolio scaffold only: no live apply.

terraform {
  required_version = ">= 1.6.0"
}

variable "enabled_providers" {
  description = "Provider adapters represented in the synthetic control plane."
  type        = set(string)
  default     = ["aws", "azure", "gcp", "kubernetes"]

  validation {
    condition = alltrue([
      for provider in var.enabled_providers : contains(["aws", "azure", "gcp", "kubernetes"], provider)
    ])
    error_message = "Only documented synthetic provider adapters are allowed."
  }
}

locals {
  runbook_levels = {
    L1 = [
      "health-checks",
      "ticket-enrichment",
      "backup-status",
      "certificate-expiry",
    ]
    L2 = [
      "scoped-restart",
      "controlled-scale",
      "node-isolation",
      "credential-rotation-workflow",
    ]
    L3 = [
      "root-cause-analysis",
      "regional-failover",
      "disaster-recovery-drill",
      "security-forensics",
    ]
  }

  mandatory_controls = {
    prompt_to_shell_allowed       = false
    higher_risk_approval_required = true
    immutable_audit_required      = true
    idempotency_required          = true
    post_action_verification      = true
    production_credentials        = false
  }
}

output "aiops_control_plane_contract" {
  description = "Inspectable, non-deploying AIOps platform contract."
  value = {
    providers = sort(tolist(var.enabled_providers))
    runbooks  = local.runbook_levels
    controls  = local.mandatory_controls
    mode      = "simulation-only"
  }
}
