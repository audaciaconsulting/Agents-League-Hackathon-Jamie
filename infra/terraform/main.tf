provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "foundry" {
  name     = var.resource_group_name
  location = var.location
  tags     = var.tags
}

module "foundry_account" {
  source = "./modules/foundry-account"

  name                = var.account_name
  location            = azurerm_resource_group.foundry.location
  resource_group_name  = azurerm_resource_group.foundry.name
  sku_name            = var.sku_name
  kind                = var.kind
  tags                = var.tags
}