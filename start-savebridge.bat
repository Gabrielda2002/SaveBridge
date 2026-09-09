@echo off
title SaveBridge Agent
cd /d "%~dp0"

where pnpm >nul 2>nul
if errorlevel 1 (
  echo [SaveBridge] pnpm was not found. Install Node.js from https://nodejs.org
  echo [SaveBridge] then run: npm install -g pnpm
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo [SaveBridge] Installing dependencies for the first time, please wait...
  call pnpm install
  if errorlevel 1 (
    echo [SaveBridge] Dependency install failed.
    pause
    exit /b 1
  )
)

echo [SaveBridge] Starting the agent. Keep this window open while you sync saves.
echo [SaveBridge] If this is your first run, scan the QR code below from the app.
echo.
call pnpm --filter @savebridge/windows-agent start
echo.
echo [SaveBridge] Agent stopped.
pause