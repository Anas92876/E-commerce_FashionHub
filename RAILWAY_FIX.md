# Railway Deployment Fix

## Problem
Railway is trying to use Docker but Node.js is not installed in the Docker image, causing `npm: command not found` error.

## Solution

You have two options:

### Option 1: Use Nixpacks (Recommended - Easier)

1. **In Railway Dashboard:**
   - Go to your service → Settings
   - Under "Build & Deploy"
   - Set **Root Directory** to: `backend`
   - Set **Build Command** to: (leave empty or `npm install`)
   - Set **Start Command** to: `npm start`
   - **Important:** Make sure "Docker" is NOT selected as the build method
   - Railway should auto-detect Node.js with Nixpacks

2. **If Railway still uses Docker:**
   - Go to Settings → Build
   - Change "Builder" from "Docker" to "Nixpacks"
   - Or delete any Dockerfile in the root directory

### Option 2: Use Dockerfile (Alternative)

I've created a `backend/Dockerfile` for you. If Railway insists on using Docker:

1. **In Railway Dashboard:**
   - Go to Settings → Build
   - Set **Root Directory** to: `backend`
   - Railway will automatically use the Dockerfile in the backend folder

2. **The Dockerfile will:**
   - Use Node.js 18 Alpine (lightweight)
   - Install dependencies
   - Start the application

## Quick Fix Steps

1. **Go to Railway Dashboard**
2. **Select your service**
3. **Go to Settings tab**
4. **Under "Build & Deploy":**
   - **Root Directory:** `backend`
   - **Build Command:** (leave empty or `npm install`)
   - **Start Command:** `npm start`
5. **Under "Build":**
   - Make sure **Builder** is set to **"Nixpacks"** (not Docker)
6. **Save and Redeploy**

## Verify Configuration

After updating:
- Railway should detect Node.js automatically
- Build should complete successfully
- No more "npm: command not found" errors

## If Still Having Issues

1. **Delete the service and recreate it:**
   - This ensures clean configuration
   - Make sure to set Root Directory to `backend` from the start

2. **Check Railway logs:**
   - Look for "Detected Node.js" message
   - Should see "npm install" running successfully

3. **Alternative: Use Render instead:**
   - Render has better auto-detection
   - See DEPLOYMENT_GUIDE.md for Render instructions

---

**The Dockerfile I created is a backup option. Railway should work with Nixpacks once configured correctly.**

