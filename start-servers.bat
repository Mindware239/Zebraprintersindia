@echo off
echo Starting Zebra Redesign Application...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "npm run server"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit this window...
pause >nul

