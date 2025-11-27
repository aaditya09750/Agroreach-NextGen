@echo off
echo ============================================
echo INSTALLING PYTHON DEPENDENCIES
echo ============================================
cd /d "%~dp0"
pip install -r requirements_ai.txt

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ============================================
echo STARTING AI MODEL API SERVER
echo ============================================
echo Server will run on: http://localhost:5001
echo Press Ctrl+C to stop the server
echo ============================================
echo.

python backend_api.py

pause
