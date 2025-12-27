@echo off
title Learn & Grow - Development Environment

echo.
echo ========================================
echo Learn & Grow - Full Stack Platform
echo ========================================
echo.
echo Installing dependencies...
echo.

REM Check if node_modules exists in root
if not exist "node_modules" (
    call npm install
    if errorlevel 1 (
        echo Error installing root dependencies
        pause
        exit /b 1
    )
)

REM Install backend dependencies
echo Installing backend dependencies...
cd grow-backend
if not exist "node_modules" (
    call npm install
    if errorlevel 1 (
        echo Error installing backend dependencies
        pause
        exit /b 1
    )
)
cd ..

REM Install frontend dependencies
echo Installing frontend dependencies...
cd learn-grow
if not exist "node_modules" (
    call npm install
    if errorlevel 1 (
        echo Error installing frontend dependencies
        pause
        exit /b 1
    )
)
cd ..

echo.
echo ========================================
echo All dependencies installed successfully!
echo ========================================
echo.
echo Starting development servers...
echo.
echo Backend will run on: http://localhost:5000
echo Frontend will run on: http://localhost:3000
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start both servers
call npm run dev

pause
