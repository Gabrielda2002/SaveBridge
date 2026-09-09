@echo off
title Uninstall SaveBridge autostart

powershell -NoProfile -Command "$dir = if ($env:SAVEBRIDGE_STARTUP_DIR) { $env:SAVEBRIDGE_STARTUP_DIR } else { [Environment]::GetFolderPath('Startup') }; Remove-Item -LiteralPath (Join-Path $dir 'SaveBridge Agent.lnk') -ErrorAction SilentlyContinue; Write-Host Autostart removed from $dir"

pause