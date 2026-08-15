@echo off
title VoiceBridge Desktop Launcher
echo ===================================================
echo   VoiceBridge Desktop Real-Time Audio Engine
echo ===================================================
echo Starting application...

set EXE_PATH=%~dp0src\VoiceBridge.UI\bin\Debug\net8.0-windows\VoiceBridge.UI.exe
set DOTNET_PATH=%USERPROFILE%\.dotnet\dotnet.exe

if exist "%EXE_PATH%" (
    start "" "%EXE_PATH%"
) else if exist "%DOTNET_PATH%" (
    "%DOTNET_PATH%" run --project "%~dp0src\VoiceBridge.UI\VoiceBridge.UI.csproj"
) else (
    dotnet run --project "%~dp0src\VoiceBridge.UI\VoiceBridge.UI.csproj"
)
