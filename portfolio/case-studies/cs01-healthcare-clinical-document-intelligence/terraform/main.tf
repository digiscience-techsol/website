# Public portfolio scaffold only: no live apply.
# This file models the intended persistent/ephemeral contract without creating
# customer, patient or chargeable cloud resources.

terraform {
  required_version = ">= 1.6.0"
}

variable "environment" {
  description = "Synthetic environment name."
  type        = string
  default     = "portfolio"

  validation {
    condition     = contains(["portfolio", "sandbox"], var.environment)
    error_message = "Only portfolio or approved sandbox environments are allowed."
  }
}

variable "data_class" {
  description = "Data classification for the synthetic demonstration."
  type        = string
  default     = "synthetic"

  validation {
    condition     = var.data_class == "synthetic"
    error_message = "The public case study accepts synthetic data only."
  }
}

locals {
  persistent_capabilities = [
    "encrypted-source-store",
    "curated-evidence-store",
    "model-and-prompt-registry",
    "audit-retention",
  ]

  ephemeral_capabilities = [
    "document-processing-workers",
    "review-api",
    "retrieval-index-runtime",
    "demo-observability",
  ]

  mandatory_controls = {
    public_access          = false
    human_review_required  = true
    evidence_required      = true
    workload_identity_only = true
    real_patient_data      = false
  }

  tags = {
    case_study  = "CS01"
    environment = var.environment
    data_class  = var.data_class
    managed_by  = "terraform-reference"
  }
}

output "architecture_contract" {
  description = "Inspectable, non-deploying architecture contract."
  value = {
    persistent = local.persistent_capabilities
    ephemeral  = local.ephemeral_capabilities
    controls   = local.mandatory_controls
    tags       = local.tags
  }
}
