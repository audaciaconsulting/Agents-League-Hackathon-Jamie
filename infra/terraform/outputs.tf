output "resource_group_name" {
  value       = azurerm_resource_group.foundry.name
  description = "Name of the resource group created for the deployment."
}

output "location" {
  value       = azurerm_resource_group.foundry.location
  description = "Azure region used by the deployment."
}

output "account_name" {
  value       = module.foundry_account.name
  description = "Provisioned Azure AI Services account name."
}

output "account_resource_id" {
  value       = module.foundry_account.resource_id
  description = "Azure resource ID for the Azure AI Services account."
}

output "account_endpoint" {
  value       = module.foundry_account.endpoint
  description = "Service endpoint for the Azure AI Services account."
}

output "account_primary_access_key" {
  value       = module.foundry_account.primary_access_key
  description = "Primary access key for the Azure AI Services account."
  sensitive   = true
}