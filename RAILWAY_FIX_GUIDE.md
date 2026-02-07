# 🔧 Railway Deployment Fix

## Problem Identified

Your app was connecting to `localhost:5000` instead of your Railway backend because the production detection wasn't working correctly.

## ✅ What Was Fixed

### 1. Updated API Configuration (axiosConfig.js)
- Changed from hostname detection to environment variable-based configuration
- Now uses `VITE_API_URL` environment variable
- Falls back to `/api` in production, `localhost:5000` in development

### 2. Updated API Config (config.js)
- Consistent environment variable usage
- Better production/development detection using Vite's `import.meta.env`

## 🚀 Next Steps - Railway Configuration

### Option A: Separate Frontend and Backend (Recommended)

**Backend Service:**
1. Go to Railway → Your Backend Service → Variables
2. Set these variables:
   ```
   NODE_ENV=production
   PORT=5000
   DB_HOST=<your-railway-mysql-host>
   DB_USER=<your-railway-mysql-user>
   DB_PASSWORD=<your-railway-mysql-password>
   DB_NAME=wmsu_ed
   DB_PORT=3306
   JWT_SECRET=<generate-a-secure-random-string>
   ```
3. Note your backend URL (e.g., `https://backend-xyz.up.railway.app`)

**Frontend Service:**
1. Go to Railway → Your Frontend Service → Variables
2. Set this CRITICAL variable:
   ```
   VITE_API_URL=https://your-backend-url.up.railway.app/api
   ```
   ⚠️ Replace `your-backend-url` with your actual backend Railway URL

3. Deploy frontend

### Option B: Single Service (Frontend + Backend Together)

If both are running on the same Railway service:

1. Go to Railway → Your Service → Variables
2. Set:
   ```
   VITE_API_URL=/api
   NODE_ENV=production
   PORT=8080
   DB_HOST=<your-railway-mysql-host>
   DB_USER=<your-railway-mysql-user>
   DB_PASSWORD=<your-railway-mysql-password>
   DB_NAME=wmsu_ed
   DB_PORT=3306
   JWT_SECRET=<generate-a-secure-random-string>
   ```

## 📝 How to Deploy the Fix

1. **Commit the changes:**
   ```powershell
   git add .
   git commit -m "Fix: Update API configuration for Railway deployment"
   git push
   ```

2. **Trigger Railway Redeploy:**
   - Railway will automatically redeploy when you push
   - OR manually redeploy from Railway dashboard

3. **Verify the fix:**
   - Open your deployed site
   - Open DevTools Console (F12)
   - Look for: `API URL: <your-backend-url> Environment: production`
   - Try logging in with: `adminjossie@wmsu.edu.ph` / `Admin123`

## 🔍 Troubleshooting

### If still seeing localhost errors:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Check Railway Variables are set correctly
4. Check Railway build logs for errors

### If seeing "No response from server":
1. Verify backend is running: Visit `https://your-backend-url.up.railway.app/api/health` (should return success)
2. Check VITE_API_URL matches your backend URL exactly
3. Check backend database connection in Railway logs

### Font errors (minor issue):
- These are warnings, not critical errors
- Fonts will fall back to system fonts
- Can be ignored for now

## 📋 Quick Verification Checklist

- [ ] VITE_API_URL set in Railway frontend variables
- [ ] All backend variables set (DB_HOST, DB_USER, etc.)
- [ ] Code committed and pushed
- [ ] Railway redeployed
- [ ] Browser cache cleared
- [ ] Login works without "localhost" errors

## 🎯 Expected Result

After fixing, you should see:
- ✅ "API URL: https://your-backend.up.railway.app/api Environment: production" in console
- ✅ Login works successfully
- ✅ No "localhost:5000" errors
- ⚠️ Font warnings can be ignored (non-critical)
