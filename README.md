# Agents-League-Hackathon-Jamie

## Azure Foundry / Azure AI Services setup

Use [scripts/create-azure-foundry-instance.ps1](scripts/create-azure-foundry-instance.ps1) to provision the Azure resource and store the connection details in your local `.env.local` file.

Add these values to `.env.local` before running the script:

```env
AZURE_SUBSCRIPTION_ID=00000000-0000-0000-0000-000000000000
AZURE_RESOURCE_GROUP_NAME=rg-foundry-demo
AZURE_LOCATION=eastus
AZURE_ACCOUNT_NAME=foundrydemoai
AZURE_SKU=S0
AZURE_KIND=AIServices
```

These values are used as follows:

- `AZURE_SUBSCRIPTION_ID`: selects the subscription that will own the resource.
- `AZURE_RESOURCE_GROUP_NAME`: names the resource group the script creates or reuses.
- `AZURE_LOCATION`: sets the Azure region for the resource.
- `AZURE_ACCOUNT_NAME`: names the Azure AI Services account.
- `AZURE_SKU`: selects the account SKU, with `S0` as the default if omitted.
- `AZURE_KIND`: selects the account kind, with `AIServices` as the default if omitted.

After provisioning, the script writes these values back into `.env.local`:

- `AZURE_AI_ENDPOINT`: the service endpoint URL.
- `AZURE_AI_KEY`: the primary access key.
- `AZURE_AI_RESOURCE_ID`: the Azure resource ID.
- `AZURE_AI_RESOURCE_GROUP`: the resource group used by the account.
- `AZURE_AI_LOCATION`: the region used by the account.
- `AZURE_AI_ACCOUNT_NAME`: the provisioned account name.