# Agents-League-Hackathon-Jamie

Lightweight web app for public gaming profile analysis and Azure AI Foundry
insights, with the UI implemented in the Angular client.

## App

The current implementation is a dependency-free web app scaffold with a small
Node server, a gamertag input flow, and a Foundry connector layer that can be
wired to a real endpoint later.

### Run locally

1. Copy `.env.example` to `.env.local` and fill in the Azure provisioning
	values.
2. Start the app with `npm run dev`.
3. Open `http://localhost:3000` for the server or `http://localhost:4200` for
	the Angular client.

For the server-only path, `npm start` now builds the Angular client first and
serves the generated app shell from `client/dist/client/browser`.

### Current behavior

- Accepts a gamertag from the UI.
- Calls a server endpoint that gathers public-data-only source data.
- Streams Azure OpenAI-style Foundry responses through a dedicated analysis
  layer.
- Performs a real public Steam profile lookup by vanity URL and surfaces the
	returned metadata and avatar thumbnail in the UI.
- Focuses the live source flow on Steam public profile data.

## Azure Foundry / Azure AI Services setup

Use [scripts/create-azure-foundry-instance.ps1](scripts/create-azure-foundry-instance.ps1)
to provision the Azure resource and store the connection details in your local
`.env.local` file.

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

- `AZURE_SUBSCRIPTION_ID`: selects the subscription that will own the
	resource.
- `AZURE_RESOURCE_GROUP_NAME`: names the resource group the script creates or
	reuses.
- `AZURE_LOCATION`: sets the Azure region for the resource.
- `AZURE_ACCOUNT_NAME`: names the Azure AI Services account.
- `AZURE_SKU`: selects the account SKU, with `S0` as the default if omitted.
- `AZURE_KIND`: selects the account kind, with `AIServices` as the default if
	omitted.

After provisioning, the script writes these values back into `.env.local`:

- `AZURE_AI_ENDPOINT`: the service endpoint URL.
- `AZURE_AI_KEY`: the primary access key.
- `AZURE_AI_RESOURCE_ID`: the Azure resource ID.
- `AZURE_AI_RESOURCE_GROUP`: the resource group used by the account.
- `AZURE_AI_LOCATION`: the region used by the account.
- `AZURE_AI_ACCOUNT_NAME`: the provisioned account name.

The Foundry connector also reads these optional overrides if you want to set
them manually:

- `FOUNDRY_IQ_ENDPOINT`: preferred Foundry endpoint, if different from the
	Azure provisioning output.
- `FOUNDRY_IQ_API_KEY`: preferred API key, if different from the Azure
	provisioning output.
- `FOUNDRY_IQ_DEPLOYMENT_NAME`: the deployed model name to query.

By default, the connector uses the `gpt-5.4-nano` deployment and can run with
either the Azure key or the local Azure credential flow shown in
[example-foundry.js](example-foundry.js).

## Public Data Policy

The app is designed to use only public information. If a platform does not
expose the needed data without authentication, the app reports that gap rather
than attempting to bypass access controls.

## Current Adapter Scope

- Steam public profile XML is the first live adapter.
- The gamertag input is currently treated as a Steam vanity name for that
	lookup path.

