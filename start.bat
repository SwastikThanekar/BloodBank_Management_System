@echo off
echo Starting Blood Bank Management System...
echo.

echo Starting Backend Server...
start cmd /k "cd backend && npm start"

echo Waiting for backend to initialize...
timeout /t 3 /nobreak > nul

echo Starting Frontend Development Server...
start cmd /k "npm run dev"

echo.
echo Blood Bank Management System is starting...
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Default Login Credentials:
echo Admin: admin@bloodbank.com / admin123
echo Hospital: hospital@bloodbank.com / hospital123
echo Staff: staff@bloodbank.com / staff123
echo.
pause