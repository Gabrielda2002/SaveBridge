@echo off
title Install SaveBridge autostart

powershell -NoProfile -Command "$dir = if ($env:SAVEBRIDGE_STARTUP_DIR) { $env:SAVEBRIDGE_STARTUP_DIR } else { [Environment]::GetFolderPath('Startup') }; $lnk = Join-Path $dir 'SaveBridge Agent.lnk'; $ws = New-Object -ComObject WScript.Shell; $sc = $ws.CreateShortcut($lnk); $sc.TargetPath = '%~dp0start-savebridge.bat'; $sc.WorkingDirectory = '%~dp0'; $sc.WindowStyle = 7; $sc.Description = 'Start the SaveBridge agent minimized at sign-in'; $sc.Save(); Write-Host Installed $lnk"

echo.
echo [SaveBridge] The agent will now start minimized every time you sign in to Windows.
echo [SaveBridge] The window lives in the taskbar if you need to see the QR or the logs.
pause