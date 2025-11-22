# 🚀 Vercel + Railway Deployment Guide

Complete guide to deploy your E-commerce application with:
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: MongoDB Atlas (already set up)

---

## ⚡ Quick Overview

**Deployment Stack:**
- Frontend (React) → Vercel
- Backend (Node.js/Express) → Railway
- Database (MongoDB) → MongoDB Atlas ✓ (already configured)

**Estimated Time:** 15-20 minutes

---

## 📋 Prerequisites

✓ MongoDB Atlas database is ready and configured
✓ GitHub repository with your code
✓ GitHub account for authentication

---

## 🎯 Step 1: Deploy Backend to Railway (10 mins)

### 1.1 Sign Up / Login to Railway

1. Go to [Railway](https://railway.app)
2. Click **"Login"** and sign in with GitHub
3. Authorize Railway to access your repositories

### 1.2 Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository: `ecommerce-clothing-app`
4. Railway will detect your project structure

### 1.3 Configure Backend Service

Railway should auto-detect the backend, but verify:

1. Click on your service/project
2. Go to **"Settings"** tab
3. Set **"Root Directory"**: `backend`
4. Set **"Start Command"**: `npm start` (should be auto-detected)
5. Railway automatically handles the `PORT` environment variable

### 1.4 Add Environment Variables

1. Go to **"Variables"** tab in your Railway project
2. Click **"+ New Variable"** and add each of these:

```env
NODE_ENV=production
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
CLIENT_URL=https://your-app.vercel.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
```

**Important Notes:**
- For `MONGO_URI`: Use your MongoDB Atlas connection string (already configured)
- For `JWT_SECRET`: Generate a secure random string:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- For `CLIENT_URL`: You'll update this after deploying the frontend (Step 2)
- For `EMAIL_PASSWORD`: Use a Gmail App Password (not your regular password)

### 1.5 Deploy Backend

1. Railway will automatically deploy after you add variables
2. Wait for deployment to complete (watch the logs)
3. Once deployed, copy your **Backend URL** from Railway dashboard
   - It will look like: `https://your-app.railway.app`
4. **Save this URL** - you'll need it for the frontend!

### 1.6 Test Backend

Visit your backend URL: `https://your-app.railway.app`
You should see: `{"message":"Welcome to Cobra API"}` or similar

Test an API endpoint:
`https://your-app.railway.app/api/products`

---

## 🌐 Step 2: Deploy Frontend to Vercel (10 mins)

### 2.1 Sign Up / Login to Vercel

1. Go to [Vercel](https://vercel.com)
2. Click **"Sign Up"** or **"Login"**
3. Sign in with GitHub
4. Authorize Vercel to access your repositories

### 2.2 Import Project

1. Click **"Add New..."** → **"Project"**
2. From the list, select your repository: `ecommerce-clothing-app`
3. Click **"Import"**

### 2.3 Configure Project Settings

Vercel will show configuration options:

**Framework Preset:**
- Select: **"Create React App"**

**Root Directory:**
- Click **"Edit"** next to Root Directory
- Set to: `frontend`
- Click **"Continue"**

**Build Settings** (should auto-populate):
- Build Command: `npm run build`
- Output Directory: `build`
- Install Command: `npm install`

### 2.4 Add Environment Variables

Before deploying, add environment variables:

1. Expand **"Environment Variables"** section
2. Add the following variable:

**Variable Name:** `REACT_APP_API_URL`
**Value:** `https://your-backend.railway.app/api`
*(Replace with your actual Railway backend URL from Step 1.5)*

**Optional** (recommended for images):

**Variable Name:** `REACT_APP_IMAGE_BASE_URL`
**Value:** `https://your-backend.railway.app`

3. Click **"Add"** for each variable

### 2.5 Deploy Frontend

1. Click **"Deploy"**
2. Vercel will:
   - Clone your repository
   - Install dependencies
   - Build your React app
   - Deploy it to their CDN
3. Wait 2-4 minutes for the build to complete
4. Once deployed, Vercel will show your **Frontend URL**
   - It will look like: `https://your-app.vercel.app`

### 2.6 Test Frontend

1. Click on the deployment URL to visit your site
2. Your e-commerce site should now be live!
3. Check browser console (F12) for any errors

---

## 🔄 Step 3: Update Backend CORS Settings

Now that your frontend is deployed, you need to update the backend to allow requests from your Vercel URL.

### 3.1 Update CLIENT_URL in Railway

1. Go back to **Railway Dashboard**
2. Click on your backend service
3. Go to **"Variables"** tab
4. Find the **CLIENT_URL** variable
5. Update it to your Vercel URL:
   ```
   CLIENT_URL=https://your-app.vercel.app
   ```
   *(No trailing slash!)*
6. Click **"Save"** or the variable will auto-save
7. Railway will automatically redeploy with the new settings

### 3.2 Wait for Redeploy

- Railway will redeploy your backend automatically
- Wait 1-2 minutes for the redeployment
- Check the logs to ensure it deployed successfully

---

## ✅ Step 4: Verification & Testing

### 4.1 Test Your Live Application

Visit your frontend: `https://your-app.vercel.app`

**Test these features:**
- [ ] Homepage loads correctly
- [ ] Products are displayed
- [ ] Images load properly
- [ ] User registration works
- [ ] Login functionality works
- [ ] Add items to cart
- [ ] Checkout process
- [ ] Admin panel access (if applicable)

### 4.2 Check Browser Console

1. Open Developer Tools (F12)
2. Go to **Console** tab
3. Look for any errors (especially CORS or API errors)
4. If you see CORS errors, verify `CLIENT_URL` in Railway matches your Vercel URL exactly

### 4.3 Test API Endpoints

Open these URLs in your browser:
- `https://your-backend.railway.app/api/products`
- `https://your-backend.railway.app/api/categories`

Both should return JSON data.

---

## 🔧 Configuration Files Created

Your project now includes:

### Frontend (Vercel)
**File:** `frontend/vercel.json`
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "framework": "create-react-app",
  "routes": [...]
}
```

### Backend (Railway)
**File:** `backend/railway.json`
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**File:** `backend/nixpacks.toml` (already existed)
- Configures Node.js version and build steps for Railway

---

## 📝 Environment Variables Summary

### Backend (Railway)
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority
JWT_SECRET=<generated-secret-key>
JWT_EXPIRE=30d
CLIENT_URL=https://your-app.vercel.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=<gmail-app-password>
```

### Frontend (Vercel)
```env
REACT_APP_API_URL=https://your-backend.railway.app/api
REACT_APP_IMAGE_BASE_URL=https://your-backend.railway.app
```

---

## 🐛 Troubleshooting Common Issues

### Issue: CORS Error in Browser Console

**Symptoms:**
- Frontend can't connect to backend
- Error: "Access to fetch has been blocked by CORS policy"

**Solution:**
1. Verify `CLIENT_URL` in Railway matches your Vercel URL **exactly**
2. No trailing slash: ✅ `https://your-app.vercel.app` | ❌ `https://your-app.vercel.app/`
3. Include `https://`: ✅ `https://your-app.vercel.app` | ❌ `your-app.vercel.app`
4. Redeploy backend after changing CLIENT_URL

---

### Issue: Products Not Loading / API 404 Errors

**Symptoms:**
- Products page is empty
- Console shows 404 errors for API calls

**Solution:**
1. Check `REACT_APP_API_URL` in Vercel is set correctly
2. Must include `/api` at the end: `https://your-backend.railway.app/api`
3. Test backend directly: visit `https://your-backend.railway.app/api/products`
4. If you changed environment variables in Vercel, **redeploy** the frontend

---

### Issue: Images Not Displaying

**Symptoms:**
- Products load but images show as broken

**Solution:**
1. Check if `REACT_APP_IMAGE_BASE_URL` is set in Vercel
2. Verify your code uses this environment variable for image URLs
3. Railway uses ephemeral storage - images uploaded in development won't persist
4. For production, consider cloud storage (AWS S3, Cloudinary)

---

### Issue: Database Connection Failed

**Symptoms:**
- Backend logs show MongoDB connection errors
- API returns 500 errors

**Solution:**
1. Verify MongoDB Atlas connection string in `MONGO_URI`
2. Check MongoDB Atlas **Network Access**:
   - Must include `0.0.0.0/0` (allow from anywhere)
3. Verify database user credentials are correct
4. Check connection string format:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
   ```

---

### Issue: Vercel Build Fails

**Symptoms:**
- Deployment fails during build step
- Shows errors in Vercel deployment logs

**Common Solutions:**
1. **Check Node.js version compatibility**
   - Vercel uses Node 18+ by default
   - Add `.nvmrc` or `engines` in package.json if needed

2. **Disable ESLint during build** (if eslint errors)
   - Already configured in `package.json`:
     ```json
     "build": "CI=false DISABLE_ESLINT_PLUGIN=true react-scripts build"
     ```

3. **Check for missing dependencies**
   - All packages must be in `package.json`
   - Run `npm install` locally first to verify

4. **Clear cache and redeploy**
   - In Vercel: Settings → Clear Build Cache → Redeploy

---

### Issue: Railway Deployment Fails

**Symptoms:**
- Deployment crashes or restarts repeatedly
- Error logs in Railway dashboard

**Common Solutions:**
1. **Port configuration**
   - Railway automatically sets `PORT` environment variable
   - Your `server.js` should use: `process.env.PORT || 5000` ✅

2. **Check environment variables**
   - All required variables are set in Railway
   - No typos in variable names

3. **Check logs**
   - Railway Dashboard → Your Service → Deployments → View Logs
   - Look for specific error messages

4. **Node.js version**
   - Check `backend/nixpacks.toml` specifies correct Node version
   - Currently set to `nodejs-18_x`

---

## 🔒 Security Checklist

- [ ] **JWT_SECRET** is strong (32+ random characters)
- [ ] **CLIENT_URL** only includes your Vercel domain
- [ ] **MONGO_URI** is not exposed in frontend code
- [ ] **Email credentials** are stored securely in Railway variables
- [ ] **HTTPS** is enabled (automatic on both platforms)
- [ ] **.env files** are in `.gitignore` (never commit secrets)
- [ ] **MongoDB Atlas** IP whitelist is configured

---

## 🚀 Post-Deployment: Optional Enhancements

### 1. Custom Domain (Optional)

**For Frontend (Vercel):**
1. Go to your project in Vercel
2. Settings → Domains
3. Add your custom domain
4. Update DNS records as instructed
5. Update `CLIENT_URL` in Railway to your custom domain

**For Backend (Railway):**
1. Go to your service in Railway
2. Settings → Domains
3. Add custom domain
4. Update DNS records
5. Update `REACT_APP_API_URL` in Vercel

### 2. Set Up Monitoring

**Vercel:**
- Built-in Analytics available in dashboard
- View deployment logs and performance metrics

**Railway:**
- View real-time logs in dashboard
- Set up alerts for errors or downtime
- Monitor resource usage

**MongoDB Atlas:**
- Set up alerts for high CPU/memory usage
- Enable database backups
- Monitor query performance

### 3. Enable Automated Deployments

**Already Configured:**
- Vercel automatically deploys on push to `main` branch
- Railway automatically deploys on push to `main` branch

**To Deploy Manually:**
- Vercel: Dashboard → Deployments → Redeploy
- Railway: Dashboard → Your Service → Deploy

### 4. Database Seeding (If Needed)

If your production database is empty and you need sample data:

**Option 1: Use Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and link to your project
railway login
railway link

# Run seeder
railway run node backend/seeder.js
```

**Option 2: Temporary Code**
- Add a temporary admin route to run seeder
- Call it once via browser/Postman
- Remove the route after seeding

---

## 📊 Deployment URLs Reference

After successful deployment, your application will be accessible at:

**Production URLs:**
- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://your-backend.railway.app`
- **Database**: MongoDB Atlas (cloud)

**Save these URLs** for future reference and share with your team!

---

## 🎉 Success! Your E-commerce Site is Live!

Congratulations! Your application is now deployed and accessible worldwide.

**What You've Accomplished:**
✅ Backend deployed to Railway with auto-scaling
✅ Frontend deployed to Vercel with global CDN
✅ Secure HTTPS connections
✅ Environment variables configured
✅ CORS properly set up
✅ Connected to MongoDB Atlas

**Next Steps:**
1. Share your site with users
2. Monitor performance and errors
3. Set up custom domain (optional)
4. Configure email notifications
5. Add more products and content
6. Implement analytics

---

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [React Deployment Best Practices](https://create-react-app.dev/docs/deployment)

---

## 💡 Need Help?

If you encounter issues not covered in this guide:

1. Check the **troubleshooting section** above
2. Review deployment logs in Railway/Vercel dashboard
3. Verify all environment variables are set correctly
4. Check MongoDB Atlas connection and network access
5. Review platform-specific documentation

---

**Happy Deploying! 🚀**
