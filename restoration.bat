@echo off
echo [ANTIGRAVITY] Starting Nuclear Restoration...
echo [ANTIGRAVITY] Installing dependencies...
call npm install --no-audit
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed!
    exit /b %errorlevel%
)
echo [ANTIGRAVITY] Running Auto-Fix...
call npm run auto-fix
if %errorlevel% neq 0 (
    echo [ERROR] Auto-fix failed!
    exit /b %errorlevel%
)
echo [ANTIGRAVITY] Starting Development Server...
npm run dev
