# Deployment Workflow - Bio-Geo-Grafie

## Quick Reference

### 🏠 Working Locally (Development)
```bash
node switch-to-local.js
# Test your changes locally
# .bin files load from local directory
# Videos load from R2 (requires internet)
```

### 🚀 Deploying to Cloudflare Pages
```bash
node switch-to-r2.js
git add .
git commit -m "Your commit message"
git push origin main
# Cloudflare Pages auto-deploys
# Both .bin files and videos load from R2
```

### ⚠️ Important
- **ALWAYS run `switch-to-r2.js` before pushing to GitHub**
- **ALWAYS run `switch-to-local.js` after pulling/before local testing**

---

## Detailed Workflow

### Making Changes in Wonderland Editor

1. **Ensure LOCAL mode**:
   ```bash
   node switch-to-local.js
   ```

2. **Make changes in Wonderland Editor**

3. **Build/Package** (F5 in editor)

4. **Test locally**:
   - Your tunnel: https://ray-choices-dale-challenges.trycloudflare.com
   - Or run: `npx http-server -p 8080`

### Deploying Updates

5. **Switch to R2 mode**:
   ```bash
   node switch-to-r2.js
   ```

6. **Commit and push**:
   ```bash
   git add .
   git commit -m "Describe your changes"
   git push origin main
   ```

7. **Wait for deployment** (~1-2 minutes)
   - Cloudflare Pages auto-deploys
   - Check: https://bio-geo-grafie.pages.dev

8. **Switch back to LOCAL** (for next development):
   ```bash
   node switch-to-local.js
   ```

---

## What the Scripts Do

### switch-to-r2.js
- Modifies `MyWonderland-app.js`
- Changes: `${Constants.ProjectName}.bin`
- To: `https://pub-c6ac418601d24ff1b2b716ad48afc9ce.r2.dev/${Constants.ProjectName}.bin`
- Result: .bin files load from R2 CDN

### switch-to-local.js
- Modifies `MyWonderland-app.js`
- Changes: `https://pub-...r2.dev/${Constants.ProjectName}.bin`
- To: `${Constants.ProjectName}.bin`
- Result: .bin files load locally

---

## File Locations

### On R2 (Cloudflare CDN):
- ✅ `ForgottenPlaces_panoramic.mp4` (580MB)
- ✅ `In_Memory_of_Me_clip.mp4` (286MB)
- ✅ `jezdziec_clip.mp4` (146MB)
- ✅ `Powitanie_1klip.mp4` (133MB)
- ✅ `The_Last_Parade_clip.mp4` (161MB)
- ✅ `ulan_klip.mp4` (340MB)
- ✅ `Bio-Geo-Grafie_project.bin` (90MB)
- ✅ `Bio-Geo-Grafie_project-textures.bin` (25MB)

### In GitHub Repo:
- ✅ All code files
- ✅ Small assets (<25MB)
- ❌ Videos (excluded via .gitignore)
- ❌ Large .bin files (excluded via .gitignore)

### Locally:
- ✅ Everything (including .bin files for development)

---

## Troubleshooting

### "Failed to load .bin" error locally
→ Run: `node switch-to-local.js`

### "Failed to load .bin" error on Pages
→ Ensure you ran `node switch-to-r2.js` before pushing

### Videos not loading
→ Check CORS is enabled on R2 bucket

### Deployment fails with "file too large"
→ Check .gitignore excludes .bin files and videos

---

## URLs

- **Local dev**: http://localhost:8080 or Cloudflare Tunnel
- **Production**: https://bio-geo-grafie.pages.dev
- **R2 CDN**: https://pub-c6ac418601d24ff1b2b716ad48afc9ce.r2.dev/
- **GitHub**: https://github.com/xWolgan/Bio-Geo-Grafie

---

## Cost: $0/month ✨
- Cloudflare Pages: FREE
- Cloudflare R2: FREE (under 10GB)
- GitHub: FREE
