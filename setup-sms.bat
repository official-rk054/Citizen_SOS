@echo off
REM Install expo-sms package for emergency SMS notifications
echo Installing expo-sms package...

cd frontend

REM Check if yarn is available
where yarn >nul 2>nul
if %ERRORLEVEL% == 0 (
    echo Using yarn...
    call yarn add expo-sms
) else (
    REM Check if npm is available
    where npm >nul 2>nul
    if %ERRORLEVEL% == 0 (
        echo Using npm...
        call npm install expo-sms
    ) else (
        echo Error: Neither npm nor yarn found. Please install Node.js and npm/yarn.
        pause
        exit /b 1
    )
)

echo.
echo Installation complete!
echo.
echo Next steps:
echo 1. Update app.json with SMS permissions (see SOS_FEATURES_GUIDE.md)
echo 2. Run: npm start (or yarn start)
echo 3. Navigate to home screen and tap 'View SOS Demo & Features'
echo.
pause
