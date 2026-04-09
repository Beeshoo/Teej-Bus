@echo off
setlocal enabledelayedexpansion

echo ==================================================
echo [Taj Bus] Professional Auto-Setup & Launcher
echo ==================================================

:: 1. Check Node.js Version
echo [1/4] Checking Node.js version...
for /f "tokens=1,2,3 delims=." %%a in ('node -v') do (
    set node_ver=%%a
    set node_ver=!node_ver:v=!
)

if !node_ver! LSS 20 (
    echo.
    echo ERROR: Your Node.js version is too old (!node_ver!).
    echo Taj Bus requires Node.js 20 or higher.
    echo Please download the latest LTS version from https://nodejs.org/
    echo.
    pause
    exit /b
)
echo OK: Node.js version !node_ver! detected.

:: 2. Clean up old failed attempts
if exist node_modules (
    echo [2/4] Found existing libraries. Verifying...
) else (
    echo [2/4] Installing libraries (this may take a minute)...
    call npm install
)

:: 3. Check if Dexie was installed
if not exist node_modules\dexie (
    echo [!] Dexie missing. Forcing installation...
    call npm install dexie
)

:: 4. Start App
echo.
echo [3/4] Starting the application server...
echo --------------------------------------------------
echo IMPORTANT: Keep this window open while using the site.
echo Opening browser at http://localhost:3000
echo --------------------------------------------------

:: Try to open browser automatically
start http://localhost:3000

call npm run dev

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: The application failed to start.
    echo Please check the error messages above.
    echo.
    pause
)

pause
