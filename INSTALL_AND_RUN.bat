@echo off
setlocal EnableDelayedExpansion
color 0A
title Bio-geo-grafie Gallery - Setup

cd /d "%~dp0"

echo ============================================
echo    BIO-GEO-GRAFIE VR GALLERY SETUP
echo ============================================
echo.

:: Check if Python is already available
where python >nul 2>&1
if %errorlevel%==0 (
    echo [OK] Python is already installed!
    echo.
    echo Starting gallery...
    timeout /t 2 /nobreak >nul
    start http://localhost:8080
    python -m http.server 8080
    exit /b
)

where py >nul 2>&1
if %errorlevel%==0 (
    echo [OK] Python launcher found!
    echo.
    echo Starting gallery...
    timeout /t 2 /nobreak >nul
    start http://localhost:8080
    py -m http.server 8080
    exit /b
)

:: Python not found - offer to install portable version
echo Python is not installed on this computer.
echo.
echo This gallery needs a web server to run.
echo I can install a portable Python (no system changes).
echo.
echo OPTIONS:
echo [1] Install portable Python (~25MB) - RECOMMENDED
echo [2] Use PowerShell server (slower but works)
echo [3] Exit (install Python manually from python.org)
echo.
set /p choice="Choose option (1-3): "

if "%choice%"=="3" (
    echo.
    echo Please install Python from: https://python.org
    echo Then run this script again.
    pause
    exit /b
)

if "%choice%"=="2" (
    goto :POWERSHELL_SERVER
)

:: Install portable Python
echo.
echo ============================================
echo    DOWNLOADING PORTABLE PYTHON
echo ============================================
echo.
echo Downloading Python 3.11 (portable)...
echo This will NOT modify your system.
echo.

:: Create portable directory
if not exist "portable-python" mkdir "portable-python"

:: Download using PowerShell (built into Windows)
powershell -Command "& { $ProgressPreference = 'SilentlyContinue'; Write-Host 'Downloading...'; try { Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.11.5/python-3.11.5-embed-amd64.zip' -OutFile 'portable-python.zip' -UseBasicParsing; Write-Host '[OK] Download complete' } catch { Write-Host '[ERROR] Download failed'; exit 1 } }"

if not exist "portable-python.zip" (
    echo.
    echo [ERROR] Download failed. Using PowerShell server instead...
    goto :POWERSHELL_SERVER
)

echo Extracting Python...
powershell -Command "Expand-Archive -Path 'portable-python.zip' -DestinationPath 'portable-python' -Force"

:: Clean up
del portable-python.zip >nul 2>&1

:: Check if extraction was successful
if not exist "portable-python\python.exe" (
    echo [ERROR] Extraction failed. Using PowerShell server...
    goto :POWERSHELL_SERVER
)

:: Prepare Python for http.server module
echo import sys >> portable-python\python311._pth
echo import site >> portable-python\python311._pth

echo.
echo [OK] Portable Python installed successfully!
echo.
echo ============================================
echo    STARTING GALLERY
echo ============================================
echo.
echo Gallery will open at: http://localhost:8080
echo Press Ctrl+C to stop
echo.
timeout /t 2 /nobreak >nul
start http://localhost:8080

:: Run server with portable Python
"portable-python\python.exe" -m http.server 8080
goto :END

:POWERSHELL_SERVER
echo.
echo ============================================
echo    STARTING WITH POWERSHELL SERVER
echo ============================================
echo.
echo Gallery will open at: http://localhost:8080
echo This may be slower than Python.
echo Press Ctrl+C to stop
echo.

:: Create and run PowerShell server
echo $http = [System.Net.HttpListener]::new() > temp_server.ps1
echo $http.Prefixes.Add('http://localhost:8080/') >> temp_server.ps1
echo $http.Start() >> temp_server.ps1
echo Write-Host 'Server started at http://localhost:8080' >> temp_server.ps1
echo Start-Process 'http://localhost:8080' >> temp_server.ps1
echo $root = Get-Location >> temp_server.ps1
echo while ($http.IsListening) { >> temp_server.ps1
echo     try { >> temp_server.ps1
echo         $context = $http.GetContext() >> temp_server.ps1
echo         $request = $context.Request >> temp_server.ps1
echo         $response = $context.Response >> temp_server.ps1
echo         $path = $request.Url.LocalPath >> temp_server.ps1
echo         if ($path -eq '/') { $path = '/index.html' } >> temp_server.ps1
echo         $file = Join-Path $root $path.TrimStart('/') >> temp_server.ps1
echo         if (Test-Path $file -PathType Leaf) { >> temp_server.ps1
echo             $bytes = [System.IO.File]::ReadAllBytes($file) >> temp_server.ps1
echo             $response.ContentLength64 = $bytes.Length >> temp_server.ps1
echo             $ext = [System.IO.Path]::GetExtension($file) >> temp_server.ps1
echo             $mime = switch($ext) { >> temp_server.ps1
echo                 '.html' {'text/html'} >> temp_server.ps1
echo                 '.js' {'application/javascript'} >> temp_server.ps1
echo                 '.css' {'text/css'} >> temp_server.ps1
echo                 '.wasm' {'application/wasm'} >> temp_server.ps1
echo                 '.json' {'application/json'} >> temp_server.ps1
echo                 '.png' {'image/png'} >> temp_server.ps1
echo                 '.jpg' {'image/jpeg'} >> temp_server.ps1
echo                 '.mp4' {'video/mp4'} >> temp_server.ps1
echo                 default {'application/octet-stream'} >> temp_server.ps1
echo             } >> temp_server.ps1
echo             $response.ContentType = $mime >> temp_server.ps1
echo             $response.Headers.Add('Cross-Origin-Embedder-Policy', 'require-corp') >> temp_server.ps1
echo             $response.Headers.Add('Cross-Origin-Opener-Policy', 'same-origin') >> temp_server.ps1
echo             $response.OutputStream.Write($bytes, 0, $bytes.Length) >> temp_server.ps1
echo         } else { >> temp_server.ps1
echo             $response.StatusCode = 404 >> temp_server.ps1
echo         } >> temp_server.ps1
echo         $response.Close() >> temp_server.ps1
echo     } catch {} >> temp_server.ps1
echo } >> temp_server.ps1

powershell -ExecutionPolicy Bypass -File temp_server.ps1

:: Clean up
del temp_server.ps1 >nul 2>&1

:END
echo.
echo ============================================
echo    Thank you for using Bio-geo-grafie!
echo ============================================
echo.
pause