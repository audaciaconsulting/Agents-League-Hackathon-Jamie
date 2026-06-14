output "name" {
  value       = azurerm_cognitive_account.this.name
  description = "Azure AI Services account name."
}

output "resource_id" {
  value       = azurerm_cognitive_account.this.id
  description = "Azure resource ID for the Azure AI Services account."
}

output "endpoint" {
  value       = azurerm_cognitive_account.this.endpoint
  description = "Service endpoint for the Azure AI Services account."
}

output "primary_access_key" {
  value       = azurerm_cognitive_account.this.primary_access_key
  description = "Primary access key for the Azure AI Services account."
  sensitive   = true
}