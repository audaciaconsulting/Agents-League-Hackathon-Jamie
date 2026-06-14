variable "name" {
  type        = string
  description = "Azure AI Services account name."
}

variable "location" {
  type        = string
  description = "Azure region for the Azure AI Services account."
}

variable "resource_group_name" {
  type        = string
  description = "Resource group that contains the Azure AI Services account."
}

variable "sku_name" {
  type        = string
  description = "SKU for the Azure AI Services account."
}

variable "kind" {
  type        = string
  description = "Account kind for the Azure AI Services resource."
}

variable "tags" {
  type        = map(string)
  description = "Optional tags applied to the Azure AI Services account."
  default     = {}
}