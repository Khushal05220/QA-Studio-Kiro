@echo off
echo ========================================
echo Fixing Repository Structure - Final
echo ========================================
echo.
echo This will push qa-studio contents to root level
echo with .kiro directory alongside
echo.

cd /d "%~dp0"

echo [1/6] Removing old git...
if exist .git rmdir /s /q .git
echo Done.
echo.

echo [2/6] Initializing Git...
git init
echo Done.
echo.

echo [3/6] Adding all files...
git add .
echo Done.
echo.

echo [4/6] Creating commit...
git commit -m "Initial commit: QA Studio - AI-powered testing platform with Kiro AI integration"
echo Done.
echo.

echo [5/6] Adding remote...
git remote add origin https://github.com/Khushal05220/QA-Studio-Kiro.git
echo Done.
echo.

echo [6/6] Force pushing to GitHub...
echo This will replace the current repository content...
git push -f origin main
echo Done.
echo.

echo ========================================
echo SUCCESS! Repository structure is now correct!
echo ========================================
echo.
echo Visit: https://github.com/Khushal05220/QA-Studio-Kiro
echo.
echo You should now see:
echo - README.md at root (displays on GitHub homepage)
echo - LICENSE at root (shows license badge)
echo - .kiro/ at root (required for submission)
echo - src/ at root
echo - server/ at root
echo - All other files at root
echo.
pause
