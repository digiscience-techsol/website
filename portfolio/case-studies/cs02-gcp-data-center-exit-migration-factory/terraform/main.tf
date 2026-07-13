# Public portfolio scaffold only: no live apply.

terraform {
  required_version = ">= 1.6.0"
}

variable "program_name" {
  type    = string
  default = "synthetic-gcp-dc-exit"
}

variable "approved_regions" {
  type    = list(string)
  default = ["asia-south1", "asia-south2"]
}

locals {
  organization_layers = [
    "bootstrap",
    "common-networking",
    "common-security",
    "common-logging",
    "production-standard",
    "production-regulated",
    "production-data-ai",
    "non-production",
  ]

  migration_stage_gates = [
    "assessed",
    "disposition-approved",
    "wave-assigned",
    "build-ready",
    "rehearsal-passed",
    "business-go-no-go",
    "cutover-complete",
    "hypercare-exit",
    "source-decommissioned",
  ]

  mandatory_controls = {
    public_storage_allowed       = false
    service_account_keys_allowed = false
    central_logging_required     = true
    workload_owner_required      = true
    rollback_plan_required       = true
    real_workloads               = false
  }
}

output "migration_factory_contract" {
  value = {
    program       = var.program_name
    regions       = var.approved_regions
    hierarchy     = local.organization_layers
    stage_gates   = local.migration_stage_gates
    controls      = local.mandatory_controls
    deployment    = "reference-only"
  }
}
