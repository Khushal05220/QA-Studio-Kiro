@echo off
echo ========================================
echo Pushing QA Studio to GitHub
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] Initializing Git...
git init
echo.

echo [2/5] Adding all files...
git add .
echo.

echo [3/5] Creating commit...
git commit -m "Initial commit: QA Studio - AI-powered testing platform"
echo.

echo [4/5] Adding remote repository...
git remote add origin https://github.com/Khushal05220/QA-Studio-Kiro.git
echo.

echo [5/5] Pushing to GitHub...
git branch -M main
git push -u origin main
echo.

echo ========================================
echo SUCCESS! Your code is now on GitHub!
echo ========================================
echo.
echo Visit your repository:
echo https://github.com/Khushal05220/QA-Studio-Kiro
echo.
pause
