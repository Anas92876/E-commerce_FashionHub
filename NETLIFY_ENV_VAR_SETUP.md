# Netlify Environment Variable Setup Guide

## Critical: Setting REACT_APP_API_URL in Netlify

The API URL error you're seeing is because the `REACT_APP_API_URL` environment variable is not set correctly in Netlify.

### Steps to Fix:

1. **Go to Netlify Dashboard**
   - Navigate to your site: https://app.netlify.com
   - Click on your site (fashionhubclient)

2. **Go to Site Settings**
   - Click "Site settings" in the top menu
   - Click "Environment variables" in the left sidebar

3. **Add/Edit REACT_APP_API_URL**
   - Click "Add a variable" or edit the existing one
   - **Key:** `REACT_APP_API_URL`
   - **Value:** `https://web-production-2d7c0.up.railway.app/api`
   
   ⚠️ **IMPORTANT:** 
   - Must start with `https://`
   - Must end with `/api`
   - Use your actual Railway backend URL

4. **Redeploy**
   - After setting the variable, go to "Deploys" tab
   - Click "Trigger deploy" → "Clear cache and deploy site"
   - OR push a new commit to trigger automatic deployment

### Verify the Variable is Set:

After deployment, open your browser console on the deployed site. You should see:
```
[API Config] REACT_APP_API_URL: https://web-production-2d7c0.up.railway.app/api
[API Config] Final API_URL: https://web-production-2d7c0.up.railway.app/api
```

### Common Mistakes:

❌ **Wrong:** `web-production-2d7c0.up.railway.app` (missing https://)
❌ **Wrong:** `https://web-production-2d7c0.up.railway.app` (missing /api)
❌ **Wrong:** `https://web-production-2d7c0.up.railway.app/api/` (trailing slash)
✅ **Correct:** `https://web-production-2d7c0.up.railway.app/api`

### If It Still Doesn't Work:

1. Check Railway backend is running and accessible
2. Test the backend directly: `https://web-production-2d7c0.up.railway.app/health`
3. Check CORS settings in Railway backend
4. Verify the environment variable is set for "Production" environment in Netlify

