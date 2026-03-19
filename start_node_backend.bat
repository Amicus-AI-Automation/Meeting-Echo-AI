@echo off
title MeetingRAG - Node.js Backend
echo.
echo =========================================
echo  Starting MeetingRAG Node.js Server (5000)
echo =========================================
echo.
cd /d "%~dp0backend"
echo [*] Installing dependencies (if needed)...
call npm install
echo.
echo [*] Starting Node.js server on http://localhost:5000
echo     Press Ctrl+C to stop
echo.
npm run dev
pause
