#!/usr/bin/env pwsh
<#
.SYNOPSIS
Creates or updates the Azure AI Services resources used by the app.

.DESCRIPTION
This script reads the local provisioning settings from .env.local, applies the
Terraform configuration under infra/terraform, and writes the resulting Azure
connection values back into the same local file. Use -DryRun to preview the
Terraform plan without making any changes.

.EXAMPLE
pwsh scripts/create-azure-foundry-instance.ps1

.EXAMPLE
pwsh scripts/create-azure-foundry-instance.ps1 -DryRun
#>
[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [string]$OutputPath = (Join-Path $PSScriptRoot '..\.env.local'),
    [string]$TerraformWorkingDirectory = (Join-Path $PSScriptRoot '..\infra\terraform'),
    [switch]$DryRun
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

function Assert-CommandAvailable {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name,
        [Parameter(Mandatory = $true)]
        [string]$Message
    )

    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw $Message
    }
}

function ConvertTo-TerraformArgument {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name,
        [Parameter(Mandatory = $true)]
        [string]$Value
    )

    return @('-var', "$Name=$Value")
}

Assert-CommandAvailable -Name 'terraform' -Message 'Terraform is required. Install it before invoking this script.'
Assert-CommandAvailable -Name 'az' -Message 'Azure CLI is required. Install it and run az login before invoking this script.'

$config = Read-EnvironmentFile -Path $OutputPath
$subscriptionId = $config['AZURE_SUBSCRIPTION_ID']
$resourceGroupName = Get-RequiredValue -Values $config -PropertyName 'AZURE_RESOURCE_GROUP_NAME'
$location = Get-RequiredValue -Values $config -PropertyName 'AZURE_LOCATION'
$accountName = Get-RequiredValue -Values $config -PropertyName 'AZURE_ACCOUNT_NAME'
$sku = if ([string]::IsNullOrWhiteSpace([string]$config['AZURE_SKU'])) { 'S0' } else { [string]$config['AZURE_SKU'] }
$kind = if ([string]::IsNullOrWhiteSpace([string]$config['AZURE_KIND'])) { 'AIServices' } else { [string]$config['AZURE_KIND'] }

if ($subscriptionId) {
    az account set --subscription $subscriptionId | Out-Null
    $env:ARM_SUBSCRIPTION_ID = $subscriptionId
}

if (-not (Test-Path -LiteralPath $TerraformWorkingDirectory)) {
    throw "Terraform working directory not found: $TerraformWorkingDirectory"
}

if (-not $PSCmdlet.ShouldProcess($resourceGroupName, $(if ($DryRun.IsPresent) { 'Preview Terraform configuration' } else { 'Apply Terraform configuration' }))) {
    return
}

Push-Location $TerraformWorkingDirectory
try {
    terraform init -input=false | Out-Null

    $terraformArguments = @()
    $terraformArguments += ConvertTo-TerraformArgument -Name 'resource_group_name' -Value $resourceGroupName
    $terraformArguments += ConvertTo-TerraformArgument -Name 'location' -Value $location
    $terraformArguments += ConvertTo-TerraformArgument -Name 'account_name' -Value $accountName
    $terraformArguments += ConvertTo-TerraformArgument -Name 'sku_name' -Value $sku
    $terraformArguments += ConvertTo-TerraformArgument -Name 'kind' -Value $kind

    if ($DryRun.IsPresent) {
        terraform plan -input=false @terraformArguments
        $planExitCode = $LASTEXITCODE
        if ($planExitCode -eq 1) {
            throw 'Terraform plan failed.'
        }

        Write-Output 'Terraform dry run completed. No resources were changed.'
        return
    }

    terraform apply -auto-approve -input=false @terraformArguments | Out-Null
    $terraformOutput = terraform output -json | ConvertFrom-Json
}
finally {
    Pop-Location
}

$endpoint = [string]$terraformOutput.account_endpoint.value
$resourceId = [string]$terraformOutput.account_resource_id.value
$outputResourceGroup = [string]$terraformOutput.resource_group_name.value
$outputLocation = [string]$terraformOutput.location.value
$outputAccountName = [string]$terraformOutput.account_name.value
$primaryKey = [string]$terraformOutput.account_primary_access_key.value

if ([string]::IsNullOrWhiteSpace($OutputPath) -eq $false) {
    Write-ConnectionFile `
        -Path $OutputPath `
        -Endpoint $endpoint `
        -Key $primaryKey `
        -ResourceId $resourceId `
        -ResourceGroup $outputResourceGroup `
        -Location $outputLocation `
        -AccountName $outputAccountName
}

Write-Output "Azure AI services account is ready: $outputAccountName"
Write-Output "Endpoint: $endpoint"
if ($OutputPath) {
    Write-Output "Connection details written to: $OutputPath"
}