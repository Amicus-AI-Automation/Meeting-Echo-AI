@echo off
title MeetingRAG - React Frontend
echo.
echo =========================================
echo  Starting MeetingRAG Frontend (3000)
echo =========================================
echo.
cd /d "%~dp0frontend"
echo [*] Installing dependencies (if needed)...
call npm install
echo.
echo [*] Starting React app on http://localhost:3000
echo     Press Ctrl+C to stop
echo.
npm start
pause
