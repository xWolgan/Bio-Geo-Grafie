@echo off
echo ========================================
echo Bio-geo-grafie VR Gallery Server
echo ========================================
echo.
echo Starting local web server...
echo Once started, open your browser to:
echo.
echo   http://localhost:8080
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

where python >nul 2>&1
if %errorlevel% == 0 (
    echo Using Python to start server...
    python -m http.server 8080
) else (
    where py >nul 2>&1
    if %errorlevel% == 0 (
        echo Using Python to start server...
        py -m http.server 8080
    ) else (
        echo Python not found. Trying Node.js...
        where node >nul 2>&1
        if %errorlevel% == 0 (
            npx serve -p 8080
        ) else (
            echo.
            echo ERROR: No web server found!
            echo.
            echo Please install Python from https://python.org
            echo or Node.js from https://nodejs.org
            echo.
            echo Alternatively, you can upload this folder to a web host.
            pause
        )
    )
)