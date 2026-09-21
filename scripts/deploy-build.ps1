[CmdletBinding(SupportsShouldProcess = $true)]
param(
  [string]$TargetPath = 'C:\xampp\htdocs\WebSitesDesigns\live\f1'
)

$ErrorActionPreference = 'Stop'

$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$distPath = Join-Path $projectRoot 'dist'
$expectedTarget = [IO.Path]::GetFullPath('C:\xampp\htdocs\WebSitesDesigns\live\f1').TrimEnd('\')

if (-not (Test-Path -LiteralPath $TargetPath -PathType Container)) {
  throw "Deployment target does not exist: $TargetPath"
}

$resolvedTarget = (Resolve-Path -LiteralPath $TargetPath).Path.TrimEnd('\')
if ($resolvedTarget -ne $expectedTarget) {
  throw "Refusing to deploy to an unexpected target. Expected $expectedTarget but received $resolvedTarget."
}

Write-Host "Building the client in production mode using .env.production ..."
Push-Location $projectRoot
try {
  npm run build -- --mode production
  if ($LASTEXITCODE -ne 0) {
    throw "The production build failed with exit code $LASTEXITCODE. The deployment target was not changed."
  }
}
finally {
  Pop-Location
}

if (-not (Test-Path -LiteralPath $distPath -PathType Container)) {
  throw "The production build did not create the expected dist folder: $distPath"
}

$distEntries = @(Get-ChildItem -LiteralPath $distPath -Force)
if ($distEntries.Count -eq 0) {
  throw "The production dist folder is empty. The deployment target was not changed."
}

Write-Host "Replacing deployment files in $resolvedTarget ..."
Get-ChildItem -LiteralPath $resolvedTarget -Force |
  Where-Object { $_.Name -ne '.git' } |
  ForEach-Object {
    if ($PSCmdlet.ShouldProcess($_.FullName, 'Remove existing deployment artifact')) {
      Remove-Item -LiteralPath $_.FullName -Recurse -Force
    }
  }

foreach ($entry in $distEntries) {
  $destination = Join-Path $resolvedTarget $entry.Name
  if ($PSCmdlet.ShouldProcess($destination, 'Copy production build artifact')) {
    Copy-Item -LiteralPath $entry.FullName -Destination $destination -Recurse -Force
  }
}

$missing = @(
  $distEntries |
    Where-Object { -not (Test-Path -LiteralPath (Join-Path $resolvedTarget $_.Name)) }
)
if ($missing.Count -gt 0 -and -not $WhatIfPreference) {
  throw "Deployment verification failed. Missing copied artifacts: $($missing.Name -join ', ')"
}

if ($WhatIfPreference) {
  Write-Host "Dry run complete. The target was not changed."
} else {
  Write-Host "Deployment build copied successfully to $resolvedTarget."
}
