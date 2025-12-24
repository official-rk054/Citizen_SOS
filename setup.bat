@echo off
REM DNA Healthcare App - Quick Setup Script for Windows

echo.
echo ================================
echo DNA Healthcare App - Setup Script
echo ================================
echo.

REM Check if Node is installed
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Node.js is installed
node -v

REM Check if npm is installed
npm -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed.
    pause
    exit /b 1
)

echo [OK] npm is installed
npm -v
echo.

REM Setup Backend
echo ================================
echo Setting up Backend...
echo ================================
cd backend

echo [*] Cleaning dependencies...
if exist node_modules (
    rmdir /s /q node_modules
)
if exist package-lock.json (
    del package-lock.json
)

echo [*] Installing backend dependencies...
call npm install

if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)

echo [OK] Backend dependencies installed
echo.

REM Setup Frontend
echo ================================
echo Setting up Frontend...
echo ================================
cd ..\frontend

echo [*] Cleaning dependencies...
if exist node_modules (
    rmdir /s /q node_modules
)
if exist package-lock.json (
    del package-lock.json
)

echo [*] Installing frontend dependencies...
call npm install

if %errorlevel% neq 0 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)

echo [OK] Frontend dependencies installed
echo.

REM Create .env file if it doesn't exist
cd ..\backend
if not exist .env (
    echo [*] Creating .env file...
    (
        echo MONGODB_URI=mongodb://localhost:27017/smart-healthcare
        echo NODE_ENV=development
        echo JWT_SECRET=dna-healthcare-app-secret-key-change-in-production
        echo PORT=5000
    ) > .env
    echo [OK] .env file created
)
echo.

echo ================================
echo Setup Complete!
echo ================================
echo.
echo Next Steps:
echo.
echo 1. Start MongoDB:
echo    mongod
echo.
echo 2. Seed test data (in another terminal):
echo    cd backend
echo    mongosh
echo    ^> load('./seed.js')
echo.
echo 3. Start Backend (in another terminal):
echo    cd backend
echo    npm start
echo.
echo 4. Start Frontend (in another terminal):
echo    cd frontend
echo    npm start
echo.
echo 5. Test APIs:
echo    Open browser and visit: http://localhost:5000/api/users/nearby/professionals/doctor?latitude=28.6139^&longitude=77.2090^&radius=10
echo.
echo For Web: npm run web
echo For iOS: npm run ios
echo For Android: npm run android
echo.
pause
