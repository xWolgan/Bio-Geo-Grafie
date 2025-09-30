# Large Video Files - Hosting Solutions

## Problem
Your project has 4 large video files (total ~1.7 GB) that exceed GitHub's limits:
- `ForgottenPlaces_panoramic.mp4` - 580 MB
- `In_Memory_of_Me_clip.mp4` - 286 MB  
- `Sequence 01.mp4` - 519 MB
- `Sequence 01_1.mp4` - 406 MB

GitHub has a 100 MB file size limit and 1 GB repository limit.

## Solutions

### Option 1: GitHub Releases (RECOMMENDED)

1. **Deploy the app without videos first:**
   ```bash
   cd WL_project/deploy
   git init
   git add .
   git commit -m "Initial deployment (videos excluded)"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/bio-geo-grafie.git
   git push -u origin main
   ```

2. **Create a GitHub Release with videos:**
   - Go to your repository on GitHub
   - Click "Releases" → "Create a new release"
   - Tag version: `v1.0`
   - Release title: "Bio-geo-grafie Videos"
   - Drag and drop your 4 MP4 files into the release
   - Publish release

3. **Update video paths in code:**
   - Get the download URLs from the release
   - Update `video-wall-tiled.js` to use these URLs

### Option 2: Git LFS (Large File Storage)

1. **Install Git LFS:**
   ```bash
   # Download from https://git-lfs.github.com/
   git lfs install
   ```

2. **Track video files:**
   ```bash
   cd WL_project/deploy
   git lfs track "*.mp4"
   git add .gitattributes
   ```

3. **Commit and push:**
   ```bash
   git add .
   git commit -m "Add videos with Git LFS"
   git push
   ```

**Note:** Git LFS gives 1 GB free storage and 1 GB bandwidth/month

### Option 3: External Video Hosting

**Free Options:**

1. **YouTube (Private/Unlisted)**
   - Upload as unlisted
   - Embed using YouTube IFrame API
   - Modify code to use YouTube player

2. **Cloudinary (Free Tier)**
   - 25 GB storage, 25 GB bandwidth/month
   - Direct MP4 URLs
   - Good for web delivery

3. **Backblaze B2 + Cloudflare**
   - 10 GB free storage
   - Free bandwidth via Cloudflare
   - Professional solution

4. **Archive.org**
   - Free, unlimited
   - Direct MP4 URLs
   - Good for artistic/cultural content

### Option 4: Video Optimization

**Reduce file sizes first:**

```bash
# Using FFmpeg (install from https://ffmpeg.org/)

# For web delivery (smaller size, good quality)
ffmpeg -i "Sequence 01.mp4" -c:v libx264 -crf 23 -preset slow -c:a aac -b:a 128k "Sequence_01_web.mp4"

# For even smaller (reduced resolution)
ffmpeg -i "ForgottenPlaces_panoramic.mp4" -vf scale=3600:360 -c:v libx264 -crf 25 -c:a aac -b:a 96k "ForgottenPlaces_web.mp4"
```

**Target sizes:**
- Keep each video under 50 MB if possible
- Use H.264 codec for compatibility
- Consider reducing resolution (7200x720 → 3600x360)

### Option 5: Deploy Without Videos (Testing)

1. **Create placeholder videos:**
   ```bash
   # Create small test videos
   ffmpeg -f lavfi -i color=c=blue:s=720x72:d=5 placeholder_1.mp4
   ```

2. **Update code to use placeholders**

3. **Deploy to GitHub Pages for structure testing**

## Recommended Approach

1. **For immediate testing:** Deploy without videos, use Option 1 (GitHub Releases)
2. **For production:** Optimize videos with FFmpeg, then use Cloudinary or Backblaze
3. **For development:** Use placeholder videos

## Quick Implementation

To deploy immediately without videos:

```bash
# Clean up
cd WL_project/deploy
rm -rf .git
rm nul

# Initialize with .gitignore
git init
git add .
git commit -m "Deploy Bio-geo-grafie (videos hosted separately)"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bio-geo-grafie.git
git push -u origin main

# Then add videos via GitHub Releases or external hosting
```