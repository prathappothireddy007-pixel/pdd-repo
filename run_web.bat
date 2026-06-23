@echo off
echo ===================================================
echo Starting BidSphere Web Frontend Server...
echo ===================================================

cd /d "%~dp0"

echo Starting local HTTP server on port 3000...
echo Opening http://localhost:3000 in your browser...

start http://localhost:3000
python -m http.server 3000

pause
