<#
.SYNOPSIS
  Manuelles Deployment von LernQuest (Zip-Deploy). Normalerweise übernimmt das GitHub Actions.
#>
param(
  [string]$ResourceGroup = "rg-lernquest",
  [string]$AppName       = "lernquest-schwaiger"
)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Push-Location $root
try {
  Write-Host "==> Abhängigkeiten installieren (nur Produktion)" -ForegroundColor Cyan
  npm ci --omit=dev
  $zip = Join-Path $env:TEMP "lernquest-deploy.zip"
  if (Test-Path $zip) { Remove-Item $zip }
  Write-Host "==> Paket schnüren" -ForegroundColor Cyan
  Compress-Archive -Path server, public, node_modules, package.json, package-lock.json -DestinationPath $zip
  Write-Host "==> Hochladen" -ForegroundColor Cyan
  az webapp deploy -g $ResourceGroup -n $AppName --src-path $zip --type zip -o none
  Start-Sleep -Seconds 10
  $h = Invoke-RestMethod "https://$AppName.azurewebsites.net/healthz"
  Write-Host "Health-Check: $($h.status), Version $($h.version), KI: $($h.ai)" -ForegroundColor Green
} finally { Pop-Location }
