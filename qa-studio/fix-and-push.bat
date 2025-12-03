@echo off
echo ========================================
echo Fixing Repository Structure
echo ========================================
echo.
echo This will push the qa-studio contents to root level
echo.

cd /d "%~dp0"

echo [1/6] Removing old git...
if exist .git rmdir /s /q .git
echo.

echo [2/6] Initializing Git...
git init
echo.

echo [3/6] Adding all files...
git add .
echo.

echo [4/6] Creating commit...
git commit -m "Initial commit: QA Studio - AI-powered testing platform"
echo.

echo [5/6] Adding remote...
git remote add origin https://github.com/Khushal05220/QA-Studio-Kiro.git
echo.

echo [6/6] Force pushing to GitHub...
git push -f origin main
echo.

echo ========================================
echo SUCCESS! Repository structure fixed!
echo ========================================
echo.
echo Visit: https://github.com/Khushal05220/QA-Studio-Kiro
echo.
echo Verify that:
echo - .kiro/ is at root level
echo - src/ is at root level
echo - No qa-studio/ subfolder
echo.
pause
