# Railway Configuration Explained

## Important: Root Directory Setting

**CRITICAL:** In Railway Dashboard, you MUST set the **Root Directory** to `backend` in the service settings.

### Why?

If Root Directory is set to `backend`:
- Railway will automatically change to that directory before running commands
- Commands in `railway.json` should NOT include `cd backend`
- Use: `npm install` and `npm start`

If Root Directory is NOT set (stays at project root):
- You need `cd backend && npm install` and `cd backend && npm start`
- This is less ideal and can cause issues

## Recommended Configuration

### Step 1: Railway Dashboard Settings
1. Go to your service → **Settings**
2. Under **"Build & Deploy"**
3. Set **Root Directory** to: `backend`
4. Save

### Step 2: railway.json
Use the updated `railway.json` I provided (without `cd backend`).

## Configuration Breakdown

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",           // Uses Nixpacks (auto-detects Node.js)
    "buildCommand": "npm install"     // Installs dependencies
  },
  "deploy": {
    "runtime": "V2",                  // Latest Railway runtime
    "numReplicas": 1,                 // Number of instances
    "startCommand": "npm start",      // Starts your app
    "sleepApplication": false,        // Keeps app awake
    "useLegacyStacker": false,        // Uses new stack
    "multiRegionConfig": {            // Multi-region setup
      "us-east4-eqdc4a": {
        "numReplicas": 1
      }
    },
    "restartPolicyType": "ON_FAILURE", // Restart on failure
    "restartPolicyMaxRetries": 10     // Max restart attempts
  }
}
```

## If You Must Use `cd backend`

If for some reason you can't set Root Directory to `backend`, use this version:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd backend && npm install"
  },
  "deploy": {
    "runtime": "V2",
    "numReplicas": 1,
    "startCommand": "cd backend && npm start",
    "sleepApplication": false,
    "useLegacyStacker": false,
    "multiRegionConfig": {
      "us-east4-eqdc4a": {
        "numReplicas": 1
      }
    },
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**But this is NOT recommended** - always set Root Directory to `backend` in Railway settings!

## Verification

After updating:
1. Push changes to GitHub
2. Railway will auto-deploy
3. Check logs - should see:
   - ✅ "Detected Node.js"
   - ✅ "Running npm install"
   - ✅ "Starting application"
   - ❌ No "npm: command not found" errors

---

**Remember: Set Root Directory to `backend` in Railway Dashboard Settings!**

