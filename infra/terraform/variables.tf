variable "resource_group_name" {
  type        = string
  description = "Resource group that will contain the Azure AI Services account."
}

variable "location" {
  type        = string
  description = "Azure region for the resource group and account."
}

variable "account_name" {
  type        = string
  description = "Azure AI Services account name."
}

variable "sku_name" {
  type        = string
  description = "SKU name for the Azure AI Services account."
  default     = "S0"
}

variable "kind" {
  type        = string
  description = "Account kind for the Azure AI Services resource."
  default     = "AIServices"
}

variable "tags" {
  type        = map(string)
  description = "Optional tags applied to the provisioned resources."
  default     = {}
}