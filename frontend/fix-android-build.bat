@echo off
REM Fix for Android TurboModule PlatformConstants error

echo.
echo =========================================
echo Android Build Fix - Clearing Cache
echo =========================================
echo.

REM Kill any running processes
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak

REM Clear Expo cache
echo Clearing Expo cache...
call expo cache clean 2>nul

REM Clear npm cache
echo Clearing npm cache...
call npm cache clean --force 2>nul

REM Remove node_modules
echo Removing node_modules...
rmdir /s /q node_modules 2>nul

REM Remove package-lock.json
echo Removing package-lock.json...
del package-lock.json 2>nul

REM Clear Android build cache
echo Clearing Android build cache...
if exist android rmdir /s /q android\.gradle 2>nul
if exist android rmdir /s /q android\build 2>nul
if exist android rmdir /s /q android\app\build 2>nul

REM Clear Expo build cache for Android
rmdir /s /q .expo 2>nul
rmdir /s /q .expo-shared 2>nul

REM Reinstall dependencies
echo.
echo Installing dependencies...
call npm install

echo.
echo =========================================
echo ✅ Cache cleared successfully!
echo =========================================
echo.
echo Next steps:
echo 1. Run: npm start
echo 2. Press 'a' to build for Android
echo 3. Or run: npm run android
echo.
pause
