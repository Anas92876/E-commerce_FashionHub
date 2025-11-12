# 🚀 Complete Deployment Guide - E-commerce Website

This guide will walk you through deploying your full-stack e-commerce application to production.

## 📋 Table of Contents
1. [MongoDB Atlas Setup](#mongodb-atlas-setup)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Post-Deployment Configuration](#post-deployment-configuration)
5. [Troubleshooting](#troubleshooting)

---

## 1. MongoDB Atlas Setup

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Choose the **FREE** tier (M0 Sandbox)

### Step 2: Create a Cluster
1. Click **"Build a Database"**
2. Choose **"M0 FREE"** tier
3. Select a cloud provider and region (choose closest to you)
4. Click **"Create"** (takes 3-5 minutes)

### Step 3: Create Database User
1. Go to **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter username and generate a strong password (SAVE THIS!)
5. Set privileges to **"Atlas admin"** or **"Read and write to any database"**
6. Click **"Add User"**

### Step 4: Whitelist IP Addresses
1. Go to **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. For production, click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
4. Click **"Confirm"**

### Step 5: Get Connection String
1. Go to **"Database"** → Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<username>` with your database username
5. Replace `<password>` with your database password
6. Add database name at the end: `?retryWrites=true&w=majority&appName=Cluster0` → `?retryWrites=true&w=majority&appName=Cluster0/ecommerce`

**Final connection string format:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ecommerce?retryWrites=true&w=majority
```

---

## 2. Backend Deployment

### Option A: Railway (Recommended - Easiest)

#### Step 1: Sign Up
1. Go to [Railway](https://railway.app)
2. Sign up with GitHub

#### Step 2: Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Authorize Railway to access your GitHub
4. Select your repository: `ecommerce-clothing-app`

#### Step 3: Configure Backend Service
1. Railway will auto-detect your project
2. Click on the service → Go to **"Settings"**
3. Set **Root Directory** to: `backend`
4. Set **Start Command** to: `npm start`
5. Railway automatically uses `PORT` environment variable

#### Step 4: Add Environment Variables
1. Go to **"Variables"** tab
2. Add the following variables:

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ecommerce?retryWrites=true&w=majority
JWT_SECRET=your_very_strong_secret_key_at_least_32_characters_long_random_string
JWT_EXPIRE=30d
CLIENT_URL=https://your-frontend-url.vercel.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
```

**To generate JWT_SECRET:**
```bash
# Run this in terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**To get Gmail App Password:**
1. Go to [Google Account](https://myaccount.google.com)
2. Security → Enable **2-Step Verification** (if not enabled)
3. App Passwords → Generate new app password
4. Copy the 16-character password

#### Step 5: Deploy
1. Railway will automatically deploy
2. Wait for deployment to complete
3. Copy your backend URL (e.g., `https://your-app.railway.app`)
4. **Note:** Update `CLIENT_URL` after frontend deployment

---

### Option B: Render (Alternative)

#### Step 1: Sign Up
1. Go to [Render](https://render.com)
2. Sign up with GitHub

#### Step 2: Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select repository: `ecommerce-clothing-app`

#### Step 3: Configure Service
- **Name**: `ecommerce-backend`
- **Environment**: `Node`
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

#### Step 4: Add Environment Variables
Same as Railway (see above)

#### Step 5: Deploy
1. Click **"Create Web Service"**
2. Wait for deployment
3. Copy your backend URL (e.g., `https://your-app.onrender.com`)

---

## 3. Frontend Deployment

### Option A: Vercel (Recommended - Best for React)

#### Step 1: Sign Up
1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub

#### Step 2: Import Project
1. Click **"Add New"** → **"Project"**
2. Import from GitHub
3. Select your repository: `ecommerce-clothing-app`

#### Step 3: Configure Project
- **Framework Preset**: Create React App
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

#### Step 4: Add Environment Variables
Go to **"Environment Variables"** and add:

```env
REACT_APP_API_URL=https://your-backend.railway.app/api
```

**Important:** Replace `your-backend.railway.app` with your actual backend URL

#### Step 5: Deploy
1. Click **"Deploy"**
2. Wait for build to complete (2-3 minutes)
3. Copy your frontend URL (e.g., `https://your-app.vercel.app`)

#### Step 6: Update Backend CORS
1. Go back to Railway/Render
2. Update `CLIENT_URL` environment variable to your Vercel URL:
   ```
   CLIENT_URL=https://your-app.vercel.app
   ```
3. Redeploy backend (or it will auto-redeploy)

---

### Option B: Netlify (Alternative)

#### Step 1: Sign Up
1. Go to [Netlify](https://netlify.com)
2. Sign up with GitHub

#### Step 2: Add New Site
1. Click **"Add new site"** → **"Import an existing project"**
2. Connect to GitHub
3. Select your repository

#### Step 3: Configure Build
- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/build`

#### Step 4: Add Environment Variables
Go to **"Site settings"** → **"Environment variables"**:
```
REACT_APP_API_URL=https://your-backend.railway.app/api
```

#### Step 5: Deploy
1. Click **"Deploy site"**
2. Wait for deployment
3. Copy your site URL

---

## 4. Post-Deployment Configuration

### Step 1: Verify Backend is Running
1. Visit your backend URL: `https://your-backend.railway.app`
2. You should see: `{"message":"Welcome to Cobra API"}`

### Step 2: Test API Endpoints
Test these endpoints:
- `GET https://your-backend.railway.app/api/products` - Should return products
- `GET https://your-backend.railway.app/api/categories` - Should return categories

### Step 3: Verify Frontend
1. Visit your frontend URL
2. Check browser console for errors
3. Try to:
   - View products
   - Register a new user
   - Login
   - Add items to cart

### Step 4: Update Image URLs (Important!)
Your product images are currently using `http://localhost:5000`. You need to update the frontend to use your backend URL.

**Files to update:**
- `frontend/src/pages/Home.js` - Replace `http://localhost:5000` with your backend URL
- `frontend/src/pages/customer/Products.js` - Same
- `frontend/src/pages/customer/ProductDetails.js` - Same
- `frontend/src/pages/customer/Cart.js` - Same
- `frontend/src/pages/customer/MyOrders.js` - Same
- Any other files using `http://localhost:5000`

**Or better:** Create an environment variable for the image base URL.

---

## 5. Troubleshooting

### Backend Issues

**❌ Port Error:**
- Railway/Render automatically sets `PORT` - don't hardcode it
- Your code already uses `process.env.PORT || 5000` ✅

**❌ CORS Errors:**
- Check `CLIENT_URL` matches frontend URL exactly
- Include protocol (`https://`)
- No trailing slash
- Example: `https://your-app.vercel.app` (not `https://your-app.vercel.app/`)

**❌ Database Connection Failed:**
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check connection string format
- Verify username and password are correct
- Make sure database name is in connection string

**❌ Images Not Loading:**
- Railway/Render use ephemeral storage (files reset on redeploy)
- **Solution:** Use cloud storage (AWS S3, Cloudinary) for production
- Or: Update frontend to use backend URL for images

### Frontend Issues

**❌ API Not Found (404):**
- Check `REACT_APP_API_URL` is set correctly
- Rebuild after changing environment variables
- Check browser console for CORS errors

**❌ Build Failures:**
- Check Node.js version (Vercel uses Node 18 by default)
- Review build logs for specific errors
- Ensure all dependencies are in `package.json`

**❌ Images Not Displaying:**
- Update all `http://localhost:5000` references to your backend URL
- Check image paths in database

---

## 🔒 Security Checklist

- [ ] Use strong JWT_SECRET (at least 32 characters)
- [ ] HTTPS enabled (automatic on Railway/Vercel)
- [ ] CORS configured correctly
- [ ] MongoDB Atlas IP whitelist set
- [ ] Environment variables not committed to Git
- [ ] Database user has appropriate permissions

---

## 📊 Monitoring

### Railway:
- View logs in dashboard
- Set up alerts for errors
- Monitor resource usage

### Vercel:
- Analytics in dashboard
- Function logs
- Performance metrics

### MongoDB Atlas:
- Monitor database performance
- Set up alerts for high usage
- View connection metrics

---

## 🎉 Success!

Once deployed, your e-commerce site will be live:
- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://your-backend.railway.app`
- **Database**: MongoDB Atlas (cloud)

**Next Steps:**
1. Test all functionality
2. Seed your database with products (optional)
3. Set up custom domain (optional)
4. Configure email notifications
5. Set up monitoring and alerts

---

## 📝 Quick Reference

### Environment Variables Summary

**Backend:**
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
JWT_EXPIRE=30d
CLIENT_URL=https://your-frontend.vercel.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=...
EMAIL_PASSWORD=...
```

**Frontend:**
```env
REACT_APP_API_URL=https://your-backend.railway.app/api
```

---

## 🆘 Need Help?

- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)
- [Render Docs](https://render.com/docs)

---

**Good luck with your deployment! 🚀**

