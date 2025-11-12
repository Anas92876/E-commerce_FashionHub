# Netlify Build Configuration Fix

## Problem
Netlify is using `npm start` (development server) instead of `npm run build` (production build).

## Solution

### Step 1: Update Netlify Build Settings

1. Go to **Netlify Dashboard** → Your Site → **Site Settings**
2. Go to **Build & Deploy** → **Build settings**
3. Update the following:

**Build command:**
```
npm install && npm run build
```

**Publish directory:**
```
build
```

**Base directory:**
```
frontend
```

### Step 2: Environment Variables

Make sure you have set:
```
REACT_APP_API_URL=https://your-backend.railway.app/api
```

### Step 3: Save and Redeploy

After updating, Netlify will automatically trigger a new build with the correct command.

---

## Why This Matters

- `npm start` runs the development server (not for production)
- `npm run build` creates optimized production files
- Netlify needs the `build` folder to deploy your site

---

## Alternative: Use netlify.toml

Create `netlify.toml` in the **root** of your repository:

```toml
[build]
  base = "frontend"
  command = "npm install && npm run build"
  publish = "build"

[[plugins]]
  package = "@netlify/plugin-lighthouse"
```

This file will automatically configure Netlify builds.

