@echo off
title VoiceBridge Desktop Launcher
echo ===================================================
echo   VoiceBridge Desktop Real-Time Audio Engine
echo ===================================================
echo Starting application...

set DOTNET_PATH=%USERPROFILE%\.dotnet\dotnet.exe

if exist "%DOTNET_PATH%" (
    "%DOTNET_PATH%" run --project "%~dp0src\VoiceBridge.UI\VoiceBridge.UI.csproj"
) else (
    dotnet run --project "%~dp0src\VoiceBridge.UI\VoiceBridge.UI.csproj"
)

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Error starting VoiceBridge. Press any key to exit...
    pause > nul
)
