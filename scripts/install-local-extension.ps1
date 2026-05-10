param(
  [string]$InstallRoot = "$env:USERPROFILE\.vscode\extensions",
  [string]$ExtensionId = "local.jeom-vscode-runner-0.1.0"
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$target = Join-Path $InstallRoot $ExtensionId

New-Item -ItemType Directory -Force $target | Out-Null

$files = @(
  "package.json",
  "extension.js",
  "jeom_cli.js",
  "jeom_engine.js",
  "language-configuration.json"
)

$dirs = @(
  "assets",
  "snippets",
  "syntaxes"
)

foreach ($file in $files) {
  Copy-Item -LiteralPath (Join-Path $repoRoot $file) -Destination (Join-Path $target $file) -Force
}

foreach ($dir in $dirs) {
  $sourceDir = Join-Path $repoRoot $dir
  $targetDir = Join-Path $target $dir
  New-Item -ItemType Directory -Force $targetDir | Out-Null
  Copy-Item -LiteralPath (Join-Path $sourceDir "*") -Destination $targetDir -Recurse -Force
}

Write-Host "Installed JEOM VS Code Runner to:"
Write-Host "  $target"
Write-Host ""
Write-Host "Reload VS Code, then open a .jeom file."
Write-Host "You should see JEOM syntax colors, Run JEOM CodeLens, and the editor title Run button."
