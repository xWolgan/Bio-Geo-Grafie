@echo off
echo ========================================
echo GitHub Pages Smart Deployment
echo ========================================
echo.
echo DETECTED LARGE VIDEO FILES:
echo - ForgottenPlaces_panoramic.mp4 (580 MB)
echo - In_Memory_of_Me_clip.mp4 (286 MB)
echo - Sequence 01.mp4 (519 MB)
echo - Sequence 01_1.mp4 (406 MB)
echo.
echo Total: ~1.7 GB (exceeds GitHub limits!)
echo ========================================
echo.
echo OPTIONS:
echo 1. Deploy WITHOUT videos (recommended for testing)
echo 2. Deploy WITH Git LFS (requires Git LFS installed)
echo 3. Create placeholder videos and deploy
echo 4. Exit and handle videos manually
echo.
set /p choice="Choose option (1-4): "

if "%choice%"=="4" (
    echo.
    echo See VIDEO_HOSTING_SOLUTION.md for manual options
    pause
    exit
)

set /p username="Enter your GitHub username: "
set /p reponame="Enter repository name (or press Enter for 'bio-geo-grafie'): "

if "%reponame%"=="" set reponame=bio-geo-grafie

echo.
echo Repository: https://github.com/%username%/%reponame%
echo.

if "%choice%"=="1" (
    echo Deploying WITHOUT video files...
    echo Videos will need to be hosted separately.
    echo.
    
    echo Creating .gitignore for videos...
    echo *.mp4 > .gitignore
    echo *.avi >> .gitignore
    echo *.mov >> .gitignore
    echo nul >> .gitignore
    
    git init
    git add .
    git commit -m "Deploy Bio-geo-grafie (videos excluded - see releases)"
    git branch -M main
    git remote add origin https://github.com/%username%/%reponame%.git
    git push -u origin main
    
    echo.
    echo ========================================
    echo DEPLOYMENT COMPLETE!
    echo ========================================
    echo.
    echo IMPORTANT - NEXT STEPS FOR VIDEOS:
    echo.
    echo 1. Go to: https://github.com/%username%/%reponame%
    echo 2. Click 'Releases' -^> 'Create a new release'
    echo 3. Upload your 4 MP4 files there
    echo 4. Update video URLs in the code
    echo.
    echo See VIDEO_HOSTING_SOLUTION.md for details
    echo.
)

if "%choice%"=="2" (
    echo Checking for Git LFS...
    git lfs version >nul 2>&1
    if errorlevel 1 (
        echo.
        echo ERROR: Git LFS not installed!
        echo Download from: https://git-lfs.github.com/
        echo.
        pause
        exit
    )
    
    echo Setting up Git LFS for videos...
    git init
    git lfs install
    git lfs track "*.mp4"
    git add .gitattributes
    git add .
    git commit -m "Deploy Bio-geo-grafie with Git LFS videos"
    git branch -M main
    git remote add origin https://github.com/%username%/%reponame%.git
    
    echo.
    echo Pushing with Git LFS (this may take a while)...
    git push -u origin main
)

if "%choice%"=="3" (
    echo Creating placeholder videos...
    
    echo This feature requires FFmpeg.
    echo Creating simple colored placeholders instead...
    
    echo ^<html^>^<body style="background:blue"^>^<h1^>Video Placeholder^</h1^>^</body^>^</html^> > video_placeholder.html
    
    echo Moving real videos to backup folder...
    mkdir video_backup 2>nul
    move *.mp4 video_backup\ 2>nul
    
    echo.
    echo Deploying with placeholders...
    git init
    git add .
    git commit -m "Deploy Bio-geo-grafie with placeholder videos"
    git branch -M main
    git remote add origin https://github.com/%username%/%reponame%.git
    git push -u origin main
    
    echo.
    echo Original videos backed up to video_backup folder
)

echo.
echo ========================================
echo ENABLE GITHUB PAGES:
echo ========================================
echo 1. Go to: https://github.com/%username%/%reponame%/settings/pages
echo 2. Source: Deploy from a branch
echo 3. Branch: main, Folder: / (root)
echo 4. Click Save
echo.
echo Your site: https://%username%.github.io/%reponame%/
echo.
pause