@echo off
echo ========================================
echo GitHub Pages Deployment Setup
echo ========================================
echo.
echo This will deploy your gallery to GitHub Pages
echo.

set /p username="Enter your GitHub username: "
set /p reponame="Enter repository name (or press Enter for 'bio-geo-grafie'): "

if "%reponame%"=="" set reponame=bio-geo-grafie

echo.
echo Repository URL will be: https://github.com/%username%/%reponame%
echo.
set /p confirm="Is this correct? (y/n): "

if /i not "%confirm%"=="y" (
    echo Cancelled.
    pause
    exit
)

echo.
echo Initializing Git repository...
git init

echo.
echo Adding files...
git add .

echo.
echo Creating commit...
git commit -m "Deploy Bio-geo-grafie VR Gallery to GitHub Pages"

echo.
echo Setting up main branch...
git branch -M main

echo.
echo Adding GitHub remote...
git remote add origin https://github.com/%username%/%reponame%.git

echo.
echo Pushing to GitHub...
echo You may be prompted for your GitHub credentials.
echo If using 2FA, use a Personal Access Token as password.
echo.
git push -u origin main

echo.
echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Go to: https://github.com/%username%/%reponame%/settings/pages
echo 2. Under 'Source', select 'Deploy from a branch'
echo 3. Select 'main' branch and '/ (root)' folder
echo 4. Click Save
echo.
echo Your site will be available at:
echo https://%username%.github.io/%reponame%/
echo.
echo (It may take 5-10 minutes to become available)
echo.
pause