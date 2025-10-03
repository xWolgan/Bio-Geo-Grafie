@echo off
color 0B
title Bio-geo-grafie VR Gallery
cd /d "%~dp0"

:: Create ASCII art banner
echo.
echo     ====================================================
echo      ____  _____ ____        _____ ______ ____  
echo     ^|  _ \^|_   _/ __ \      / ____^|  ____/ __ \ 
echo     ^| ^|_) ^| ^| ^|^| ^|  ^| ^|____^| ^|  __^| ^|__  ^| ^|  ^| ^|
echo     ^|  _ ^<  ^| ^|^| ^|  ^| ^|____^| ^| ^|_ ^|  __^| ^| ^|  ^| ^|
echo     ^| ^|_) ^|_^| ^|^| ^|__^| ^|    ^| ^|__^| ^| ^|____^| ^|__^| ^|
echo     ^|____/^|_____\____/      \____/^|______\____/ 
echo.
echo                    VR GALLERY EXPERIENCE
echo     ====================================================
echo.

:: Quick system check
echo     [*] Checking system...
ping -n 2 localhost >nul

:: Try different server methods in order of preference
:: Method 1: Check for bundled server executable
if exist "server.exe" (
    echo     [OK] Found bundled server
    echo.
    echo     ====================================================
    echo                    STARTING GALLERY
    echo     ====================================================
    echo.
    echo     Gallery URL: http://localhost:8080
    echo     Opening browser automatically...
    echo.
    echo     Controls:
    echo     - WASD to move
    echo     - Mouse to look around
    echo     - Approach objects to interact
    echo.
    echo     Press Ctrl+C to stop the server
    echo     ====================================================
    echo.
    timeout /t 2 /nobreak >nul
    start http://localhost:8080
    server.exe
    goto END
)

:: Method 2: Try Python
where python >nul 2>&1
if %errorlevel%==0 (
    echo     [OK] Python found
    echo.
    echo     ====================================================
    echo                    STARTING GALLERY
    echo     ====================================================
    echo.
    echo     Gallery URL: http://localhost:8080
    echo     Opening browser automatically...
    echo.
    echo     Press Ctrl+C to stop the server
    echo     ====================================================
    echo.
    timeout /t 2 /nobreak >nul
    start http://localhost:8080
    python -m http.server 8080 --bind 127.0.0.1
    goto END
)

:: Method 3: Try Python launcher
where py >nul 2>&1
if %errorlevel%==0 (
    echo     [OK] Python launcher found
    echo.
    echo     ====================================================
    echo                    STARTING GALLERY
    echo     ====================================================
    echo.
    timeout /t 2 /nobreak >nul
    start http://localhost:8080
    py -m http.server 8080 --bind 127.0.0.1
    goto END
)

:: Method 4: PowerShell server (always available on Windows)
echo     [*] Using Windows PowerShell server...
echo.
echo     ====================================================
echo                 PREPARING GALLERY SERVER
echo     ====================================================
echo.

:: Create inline PowerShell server
powershell -Command "& { $listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add('http://localhost:8080/'); $listener.Start(); Write-Host ''; Write-Host '     Gallery running at: http://localhost:8080' -ForegroundColor Green; Write-Host '     Opening browser...' -ForegroundColor Yellow; Write-Host '     Press Ctrl+C to stop' -ForegroundColor Yellow; Write-Host ''; Start-Process 'http://localhost:8080'; $root = Get-Location; while ($listener.IsListening) { try { $context = $listener.GetContext(); $request = $context.Request; $response = $context.Response; $path = $request.Url.LocalPath; if ($path -eq '/') { $path = '/index.html' }; $filepath = Join-Path $root $path.TrimStart('/'); if (Test-Path $filepath -PathType Leaf) { $bytes = [System.IO.File]::ReadAllBytes($filepath); $response.ContentLength64 = $bytes.Length; $ext = [System.IO.Path]::GetExtension($filepath); $mime = @{'.html'='text/html';'.js'='application/javascript';'.css'='text/css';'.json'='application/json';'.png'='image/png';'.jpg'='image/jpeg';'.mp4'='video/mp4';'.wasm'='application/wasm';'.bin'='application/octet-stream'}[$ext]; if ($mime) { $response.ContentType = $mime }; $response.Headers.Add('Cross-Origin-Embedder-Policy', 'require-corp'); $response.Headers.Add('Cross-Origin-Opener-Policy', 'same-origin'); $response.OutputStream.Write($bytes, 0, $bytes.Length) } else { $response.StatusCode = 404 }; $response.Close() } catch {} } }"

:END
echo.
echo     ====================================================
echo                   GALLERY STOPPED
echo     ====================================================
echo.
echo     Thank you for experiencing Bio-geo-grafie!
echo.
pause
exit