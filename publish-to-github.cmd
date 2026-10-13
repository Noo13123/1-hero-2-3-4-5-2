@echo off
setlocal
cd /d "%~dp0"
set "PATH=%LOCALAPPDATA%\GitHubDesktop\app-3.6.7\resources\app\git\cmd;%LOCALAPPDATA%\GitHubDesktop\app-3.6.7\resources\app\git\mingw64\bin;%PATH%"
set "GCM_CREDENTIAL_STORE=dpapi"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\publish-github.ps1"
set "RESULT=%ERRORLEVEL%"
echo.
if "%RESULT%"=="0" (
  echo Publishing finished. The site may take a few minutes to appear.
) else (
  echo Publishing stopped. Send a screenshot of this window to Codex.
)
pause
exit /b %RESULT%
