<#
.SYNOPSIS
  Deployment-Freigabe für GitHub Actions per OIDC (ohne gespeichertes Passwort).

.DESCRIPTION
  Legt eine App-Registrierung mit Federated Credential für den main-Branch an
  und gibt ihr die Rolle "Website Contributor" nur auf diese eine Web App.
  Danach die drei ausgegebenen Werte als GitHub-Secrets hinterlegen
  (oder automatisch mit -SetGitHubSecrets, benötigt die GitHub CLI "gh").
#>
param(
  [string]$Repo          = "Schwaiger-BUSINESS-IT-GmbH/LernQuest",
  [string]$Branch        = "main",
  [string]$ResourceGroup = "rg-lernquest",
  [string]$AppName       = "lernquest-schwaiger",
  [switch]$SetGitHubSecrets
)
$ErrorActionPreference = "Stop"

$sub    = az account show --query id -o tsv
$tenant = az account show --query tenantId -o tsv
$webId  = az webapp show -g $ResourceGroup -n $AppName --query id -o tsv

Write-Host "==> App-Registrierung gh-deploy-lernquest" -ForegroundColor Cyan
$appId = az ad app create --display-name "gh-deploy-lernquest" --query appId -o tsv
az ad sp create --id $appId -o none 2>$null

$cred = @{
  name      = "github-$($Branch)"
  issuer    = "https://token.actions.githubusercontent.com"
  subject   = "repo:$($Repo):ref:refs/heads/$($Branch)"
  audiences = @("api://AzureADTokenExchange")
} | ConvertTo-Json -Compress
$tmp = New-TemporaryFile; Set-Content $tmp $cred
az ad app federated-credential create --id $appId --parameters "@$tmp" -o none
Remove-Item $tmp

Write-Host "==> Rolle Website Contributor nur auf $AppName" -ForegroundColor Cyan
az role assignment create --assignee $appId --role "Website Contributor" --scope $webId -o none

Write-Host ""
Write-Host "GitHub-Secrets (Repo > Settings > Secrets and variables > Actions):" -ForegroundColor Green
Write-Host "  AZURE_CLIENT_ID       = $appId"
Write-Host "  AZURE_TENANT_ID       = $tenant"
Write-Host "  AZURE_SUBSCRIPTION_ID = $sub"

if ($SetGitHubSecrets) {
  gh secret set AZURE_CLIENT_ID --repo $Repo --body $appId
  gh secret set AZURE_TENANT_ID --repo $Repo --body $tenant
  gh secret set AZURE_SUBSCRIPTION_ID --repo $Repo --body $sub
  Write-Host "Secrets gesetzt." -ForegroundColor Green
}
