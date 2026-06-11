#!/usr/bin/env pwsh
[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [string]$OutputPath = (Join-Path $PSScriptRoot '..\.env.local')
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Read-EnvironmentFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    if (-not (Test-Path -LiteralPath $Path)) {
        throw "Environment file not found: $Path"
    }

    $values = @{}
    foreach ($line in Get-Content -LiteralPath $Path) {
        $trimmedLine = $line.Trim()
        if ([string]::IsNullOrWhiteSpace($trimmedLine) -or $trimmedLine.StartsWith('#')) {
            continue
        }

        $separatorIndex = $trimmedLine.IndexOf('=')
        if ($separatorIndex -lt 1) {
            continue
        }

        $name = $trimmedLine.Substring(0, $separatorIndex).Trim()
        $value = $trimmedLine.Substring($separatorIndex + 1).Trim()
        if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
            $value = $value.Substring(1, $value.Length - 2)
        }

        if (-not [string]::IsNullOrWhiteSpace($name)) {
            $values[$name] = $value
        }
    }

    return $values
}

function Get-RequiredValue {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Values,
        [Parameter(Mandatory = $true)]
        [string]$PropertyName
    )

    $value = $Values[$PropertyName]
    if ([string]::IsNullOrWhiteSpace([string]$value)) {
        throw "Missing required config value: $PropertyName"
    }

    return [string]$value
}

function Assert-AzureCli {
    if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
        throw 'Azure CLI is required. Install it and run az login before invoking this script.'
    }
}

function Write-ConnectionFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,
        [Parameter(Mandatory = $true)]
        [string]$Endpoint,
        [Parameter(Mandatory = $true)]
        [string]$Key,
        [Parameter(Mandatory = $true)]
        [string]$ResourceId,
        [Parameter(Mandatory = $true)]
        [string]$ResourceGroup,
        [Parameter(Mandatory = $true)]
        [string]$Location,
        [Parameter(Mandatory = $true)]
        [string]$AccountName
    )

    $values = @{}
    if (Test-Path -LiteralPath $Path) {
        $values = Read-EnvironmentFile -Path $Path
    }

    $values['AZURE_AI_ENDPOINT'] = $Endpoint
    $values['AZURE_AI_KEY'] = $Key
    $values['AZURE_AI_RESOURCE_ID'] = $ResourceId
    $values['AZURE_AI_RESOURCE_GROUP'] = $ResourceGroup
    $values['AZURE_AI_LOCATION'] = $Location
    $values['AZURE_AI_ACCOUNT_NAME'] = $AccountName

    $directory = Split-Path -Parent $Path
    if ($directory -and -not (Test-Path -LiteralPath $directory)) {
        New-Item -ItemType Directory -Path $directory | Out-Null
    }

    $lines = foreach ($entry in $values.GetEnumerator() | Sort-Object Key) {
        "$($entry.Key)=$($entry.Value)"
    }

    $lines -join [Environment]::NewLine | Set-Content -LiteralPath $Path
}

Assert-AzureCli

$config = Read-EnvironmentFile -Path $OutputPath
$subscriptionId = $config['AZURE_SUBSCRIPTION_ID']
$resourceGroupName = Get-RequiredValue -Values $config -PropertyName 'AZURE_RESOURCE_GROUP_NAME'
$location = Get-RequiredValue -Values $config -PropertyName 'AZURE_LOCATION'
$accountName = Get-RequiredValue -Values $config -PropertyName 'AZURE_ACCOUNT_NAME'
$sku = if ([string]::IsNullOrWhiteSpace([string]$config['AZURE_SKU'])) { 'S0' } else { [string]$config['AZURE_SKU'] }
$kind = if ([string]::IsNullOrWhiteSpace([string]$config['AZURE_KIND'])) { 'AIServices' } else { [string]$config['AZURE_KIND'] }

if ($subscriptionId) {
    az account set --subscription $subscriptionId | Out-Null
}

az group create --name $resourceGroupName --location $location | Out-Null

$existingAccount = az cognitiveservices account list --resource-group $resourceGroupName --query "[?name=='$accountName'] | [0]" -o json | ConvertFrom-Json
if (-not $existingAccount) {
    if ($PSCmdlet.ShouldProcess($accountName, 'Create Azure AI services account')) {
        az cognitiveservices account create `
            --name $accountName `
            --resource-group $resourceGroupName `
            --location $location `
            --kind $kind `
            --sku $sku | Out-Null
    }
}

$endpoint = az cognitiveservices account show --name $accountName --resource-group $resourceGroupName --query 'properties.endpoint' -o tsv
$resourceId = az cognitiveservices account show --name $accountName --resource-group $resourceGroupName --query 'id' -o tsv
$keys = az cognitiveservices account keys list --name $accountName --resource-group $resourceGroupName | ConvertFrom-Json
$primaryKey = $keys.key1

if ([string]::IsNullOrWhiteSpace($OutputPath) -eq $false) {
    Write-ConnectionFile `
        -Path $OutputPath `
        -Endpoint $endpoint `
        -Key $primaryKey `
        -ResourceId $resourceId `
        -ResourceGroup $resourceGroupName `
        -Location $location `
        -AccountName $accountName
}

Write-Host "Azure AI services account is ready: $accountName"
Write-Host "Endpoint: $endpoint"
if ($OutputPath) {
    Write-Host "Connection details written to: $OutputPath"
}