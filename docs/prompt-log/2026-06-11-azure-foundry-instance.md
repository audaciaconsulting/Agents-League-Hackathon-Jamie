# Prompt Log

## Prompt
In this project, I will need to connect to an Azure Foundry IQ instance. I haven't created any semblance of the code that will connect to this instance, however, I will need to create this in Azure. Can you generate me a script to create an Azure Foundry IQ instance? Consider that I would like to keep any secrets or configuration values in a separate file, so that I do not have to commit sensitive information to this repository

## Response
Updated the PowerShell provisioning script at `scripts/create-azure-foundry-instance.ps1` so it reads provisioning values from `.env.local` and writes the generated connection details back into the same file.

Added an Azure setup section to `README.md` documenting the `.env.local` values and what each one is used for.