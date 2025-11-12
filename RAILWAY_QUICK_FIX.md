# 🚨 Railway Quick Fix - npm: command not found

## The Problem
Railway is trying to use Docker but Node.js isn't installed, causing the error.

## ✅ Quick Solution (2 minutes)

### Step 1: Update Railway Settings

1. Go to your Railway project dashboard
2. Click on your **backend service**
3. Go to **Settings** tab
4. Scroll to **"Build & Deploy"** section

### Step 2: Configure Build Settings

Set these values:

- **Root Directory:** `backend`
- **Build Command:** (leave empty or `npm install`)
- **Start Command:** `npm start`

### Step 3: Change Builder to Nixpacks

1. Still in Settings, look for **"Build"** section
2. Find **"Builder"** dropdown
3. Change from **"Docker"** to **"Nixpacks"**
4. Save changes

### Step 4: Redeploy

1. Go to **Deployments** tab
2. Click **"Redeploy"** or push a new commit
3. Wait for build to complete

---

## ✅ Alternative: If Railway Still Uses Docker

I've created a `backend/Dockerfile` for you. Railway should automatically use it if Docker is selected.

**Just make sure:**
- Root Directory is set to `backend`
- Railway will find the Dockerfile in that directory

---

## 🔍 Verify It's Working

After redeploy, check the logs. You should see:
- ✅ "Detected Node.js"
- ✅ "Running npm install"
- ✅ "Starting application"
- ❌ No more "npm: command not found" errors

---

## 📝 What I've Created

1. **`backend/Dockerfile`** - Proper Dockerfile with Node.js
2. **`backend/.dockerignore`** - Excludes unnecessary files
3. **`backend/nixpacks.toml`** - Nixpacks configuration
4. **Updated `railway.json`** - Simplified configuration

---

## 🆘 Still Not Working?

**Option 1: Delete and Recreate Service**
1. Delete the current service in Railway
2. Create new service
3. Set Root Directory to `backend` immediately
4. Railway should auto-detect Node.js

**Option 2: Use Render Instead**
- Render has better auto-detection
- See `DEPLOYMENT_GUIDE.md` for Render instructions

---

**The main fix is changing the Builder from Docker to Nixpacks in Railway settings!**

