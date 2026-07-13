# Public portfolio scaffold only: no live apply.

terraform {
  required_version = ">= 1.6.0"
}

variable "primary_cloud" {
  type    = string
  default = "cloud-neutral"

  validation {
    condition     = contains(["cloud-neutral", "aws", "azure", "gcp"], var.primary_cloud)
    error_message = "Use cloud-neutral, aws, azure or gcp."
  }
}

locals {
  platform_services = [
    "approved-source-connectors",
    "quarantine-and-parsing",
    "versioned-chunking-and-embeddings",
    "hybrid-authorized-retrieval",
    "re-ranking",
    "ai-gateway",
    "citation-validator",
    "evaluation-and-observability",
  ]

  controls = {
    authorization_before_retrieval = true
    direct_model_calls_allowed     = false
    evidence_required              = true
    prompt_content_logged_default  = false
    synthetic_data_only            = true
    provider_fallback_preapproved  = true
  }
}

output "rag_platform_contract" {
  value = {
    primary_cloud = var.primary_cloud
    services      = local.platform_services
    controls      = local.controls
    deployment    = "reference-only"
  }
}
