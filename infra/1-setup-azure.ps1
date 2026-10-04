<#
.SYNOPSIS
  LernQuest – Azure-Grundeinrichtung (App Service Linux, Node 22).

.DESCRIPTION
  Legt Ressourcengruppe und Web App an, setzt alle App-Einstellungen und den Health-Check.
  Standard: Die App läuft im BESTEHENDEN App Service Plan der SIT-Time-App mit (keine Zusatzkosten).
  Mit -NewPlan wird stattdessen ein eigener B1-Plan angelegt.

.EXAMPLE
  ./1-setup-azure.ps1 -PlanName <Plan-Name-von-SIT-Time> -PlanResourceGroup rg-sit-time
.EXAMPLE
  ./1-setup-azure.ps1 -NewPlan
#>
param(
  [string]$Subscription      = "MCPP Subscription",
  [string]$ResourceGroup     = "rg-lernquest",
  [string]$Location          = "westeurope",
  [string]$AppName           = "lernquest-schwaiger",
  [string]$PlanName          = "",
  [string]$PlanResourceGroup = "rg-sit-time",
  [switch]$NewPlan,
  [int]$AiDailyLimit         = 15,
  [string]$AnthropicModel    = "claude-sonnet-5-5"
)
$ErrorActionPreference = "Stop"

function Read-Secret([string]$Prompt) {
  $s = Read-Host -Prompt $Prompt -AsSecureString
  [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($s))
}

Write-Host "==> Abo auswählen: $Subscription" -ForegroundColor Cyan
az account set --subscription $Subscription | Out-Null

Write-Host "==> Ressourcengruppe $ResourceGroup ($Location)" -ForegroundColor Cyan
az group create -n $ResourceGroup -l $Location -o none

if ($NewPlan) {
  $PlanName = "asp-lernquest"
  Write-Host "==> Neuer App Service Plan $PlanName (Linux, B1)" -ForegroundColor Cyan
  az appservice plan create -g $ResourceGroup -n $PlanName --is-linux --sku B1 -l $Location -o none
  $planId = az appservice plan show -g $ResourceGroup -n $PlanName --query id -o tsv
} else {
  if (-not $PlanName) {
    Write-Host "Vorhandene Linux-Pläne in ${PlanResourceGroup}:" -ForegroundColor Yellow
    az appservice plan list -g $PlanResourceGroup --query "[?reserved].{Name:name, Sku:sku.name, Region:location}" -o table
    $PlanName = Read-Host "Name des Plans, in dem LernQuest mitlaufen soll"
  }
  $planId = az appservice plan show -g $PlanResourceGroup -n $PlanName --query id -o tsv
  if (-not $planId) { throw "Plan $PlanName in $PlanResourceGroup nicht gefunden." }
  Write-Host "==> Nutze bestehenden Plan $PlanName (keine Zusatzkosten)" -ForegroundColor Cyan
}

Write-Host "==> Web App $AppName (Node 22 LTS)" -ForegroundColor Cyan
az webapp create -g $ResourceGroup -n $AppName --plan $planId --runtime "NODE:22-lts" -o none

$familyPw = Read-Secret "Familien-Passwort (für die Geräte-Anmeldung der Kinder, mind. 10 Zeichen)"
if ($familyPw.Length -lt 10) { throw "Familien-Passwort zu kurz." }
$parentPin = Read-Host "Start-PIN für den Eltern-Bereich (4 Ziffern, später in der App änderbar)"
if ($parentPin -notmatch '^\d{4}$') { throw "PIN muss 4 Ziffern haben." }
$apiKey = Read-Secret "Anthropic API-Key (leer lassen = KI vorerst aus)"
$bytes = New-Object byte[] 48; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$sessionSecret = [Convert]::ToBase64String($bytes)

Write-Host "==> App-Einstellungen" -ForegroundColor Cyan
$settings = @(
  "SESSION_SECRET=$sessionSecret",
  "FAMILY_PASSWORD=$familyPw",
  "PARENT_PIN=$parentPin",
  "DATA_DIR=/home/data/lernquest",
  "AI_DAILY_LIMIT=$AiDailyLimit",
  "ANTHROPIC_MODEL=$AnthropicModel",
  "SCM_DO_BUILD_DURING_DEPLOYMENT=false",
  "WEBSITES_ENABLE_APP_SERVICE_STORAGE=true"
)
if ($apiKey) { $settings += "ANTHROPIC_API_KEY=$apiKey" }
az webapp config appsettings set -g $ResourceGroup -n $AppName --settings $settings -o none

Write-Host "==> Konfiguration: HTTPS only, TLS 1.2, FTP aus, Always On, Health-Check" -ForegroundColor Cyan
az webapp update -g $ResourceGroup -n $AppName --https-only true -o none
az webapp config set -g $ResourceGroup -n $AppName --min-tls-version 1.2 --ftps-state Disabled --always-on true `
  --startup-file "node server/index.js" --generic-configurations '{\"healthCheckPath\":\"/healthz\"}' -o none

$url = "https://$AppName.azurewebsites.net"
Write-Host ""
Write-Host "Fertig. App-Adresse: $url" -ForegroundColor Green
Write-Host "Nächster Schritt: 4-github-oidc.ps1 (automatisches Deployment) oder 3-deploy-manual.ps1"
