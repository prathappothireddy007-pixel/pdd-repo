@echo off
echo ===================================================
echo Starting BidSphere Python FastAPI Backend Server...
echo ===================================================

cd /d "%~dp0"

if not exist venv (
    echo Creating virtual environment venv...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing/Updating dependencies from requirements.txt...
pip install -r requirements.txt

echo Starting server on 0.0.0.0:8000 (accessible on local network)...
uvicorn main:app --reload --host 0.0.0.0 --port 8000

pause
