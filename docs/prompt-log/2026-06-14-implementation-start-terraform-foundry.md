# Prompt Log

## Prompt

Start implementation

## Response

Started the Terraform-based provisioning implementation for the Azure AI
Services / Foundry setup.

Added a root Terraform configuration under `infra/terraform` plus a reusable
module for the Azure AI Services account. The root config creates the resource
group and the account, and exposes outputs for the resource group name,
location, account name, resource ID, and endpoint.

Updated `scripts/create-azure-foundry-instance.ps1` so it now validates that
Terraform and Azure CLI are available, runs `terraform init` and
`terraform apply`, and then writes the generated Azure connection details back
into `.env.local`.

Follow-up update: added a `-DryRun` switch to the provisioning script,
introduced an npm command for plan-only previews, and documented that the dry
run performs `terraform plan` without writing `.env.local`.

Documented the new Terraform-backed provisioning flow in `README.md`, added a
`provision:azure` npm script, and ignored Terraform state files in
`.gitignore`.