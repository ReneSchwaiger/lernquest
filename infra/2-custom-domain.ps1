<#
.SYNOPSIS
  Eigene Domain inkl. kostenlosem Managed Certificate für LernQuest.

.DESCRIPTION
  Vorher im DNS anlegen:
    CNAME  <sub>         -> <AppName>.azurewebsites.net
    TXT    asuid.<sub>   -> <Verifizierungs-ID, gibt das Skript aus>

.EXAMPLE
  ./2-custom-domain.ps1 -HostName lernen.schwaiger-it.at
#>
param(
  [Parameter(Mandatory)] [string]$HostName,
  [string]$ResourceGroup = "rg-lernquest",
  [string]$AppName       = "lernquest-schwaiger"
)
$ErrorActionPreference = "Stop"

$verId = az webapp show -g $ResourceGroup -n $AppName --query customDomainVerificationId -o tsv
$sub = $HostName.Split('.')[0]
Write-Host "DNS-Einträge (falls noch nicht vorhanden):" -ForegroundColor Yellow
Write-Host "  CNAME  $sub        -> $AppName.azurewebsites.net"
Write-Host "  TXT    asuid.$sub  -> $verId"
Read-Host "Enter drücken, sobald die DNS-Einträge aktiv sind"

Write-Host "==> Hostname hinzufügen" -ForegroundColor Cyan
az webapp config hostname add -g $ResourceGroup --webapp-name $AppName --hostname $HostName -o none

Write-Host "==> Managed Certificate erstellen (kann einige Minuten dauern)" -ForegroundColor Cyan
$thumb = az webapp config ssl create -g $ResourceGroup -n $AppName --hostname $HostName --query thumbprint -o tsv

Write-Host "==> Zertifikat binden (SNI)" -ForegroundColor Cyan
az webapp config ssl bind -g $ResourceGroup -n $AppName --certificate-thumbprint $thumb --ssl-type SNI -o none

Write-Host "Fertig: https://$HostName" -ForegroundColor Green
