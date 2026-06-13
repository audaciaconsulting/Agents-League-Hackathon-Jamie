# Prompt Log

## Prompt

I want the app to connect to azure foundry and run a query. The file that does this is foundry.js, however, it isn't working. I have found an example library to connect to Azure foundry, and put the example code in example-foundry.js. Can you fix foundry.js using the context of example-foundry.js?

## Response

Updated src/lib/foundry.js to use the Azure OpenAI SDK pattern from example-foundry.js.

The connector now creates an Azure credential-backed OpenAI client, streams a Foundry query with the gpt-5.4-nano deployment by default, and preserves the existing summary/recommendations response shape for the analyzer.

Also installed the required runtime packages: openai and @azure/identity.