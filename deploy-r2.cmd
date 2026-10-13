@echo off
setlocal
cd /d "%~dp0"
set "POWERSHELL=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe"

echo Starting Cloudflare deployment...
if not exist "%POWERSHELL%" (
  echo Windows PowerShell could not be found at:
  echo %POWERSHELL%
  goto failed
)
if not exist "%~dp0scripts\deploy-cloudflare.ps1" (
  echo The deployment file is missing:
  echo %~dp0scripts\deploy-cloudflare.ps1
  goto failed
)

"%POWERSHELL%" -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\deploy-cloudflare.ps1"
if errorlevel 1 goto failed

echo.
echo Website deployment finished. See the address above.
pause
exit /b 0

:failed
  echo.
  echo The deployment did not finish. Please keep this window open.
  pause
  exit /b 1
