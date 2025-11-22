# ✅ Deployment Checklist - Vercel + Railway

Quick reference checklist for deploying your e-commerce app.

---

## 📋 Pre-Deployment Requirements

- [ ] MongoDB Atlas database is set up and running
- [ ] MongoDB connection string ready
- [ ] GitHub repository pushed with latest code
- [ ] Gmail account with App Password generated (for email features)

---

## 🎯 Backend Deployment (Railway)

### Setup
- [ ] Signed up/logged in to [Railway](https://railway.app)
- [ ] Connected GitHub account to Railway
- [ ] Created new project from GitHub repository
- [ ] Set Root Directory to `backend`
- [ ] Verified Start Command is `npm start`

### Environment Variables
Add these in Railway Variables tab:

- [ ] `NODE_ENV=production`
- [ ] `MONGO_URI=<your-mongodb-connection-string>`
- [ ] `JWT_SECRET=<generated-random-secret>`
- [ ] `JWT_EXPIRE=30d`
- [ ] `CLIENT_URL=https://your-app.vercel.app` *(update after frontend deploy)*
- [ ] `EMAIL_HOST=smtp.gmail.com`
- [ ] `EMAIL_PORT=587`
- [ ] `EMAIL_USER=<your-email@gmail.com>`
- [ ] `EMAIL_PASSWORD=<gmail-app-password>`

### Deployment
- [ ] Triggered deployment
- [ ] Deployment successful (check logs)
- [ ] Backend URL copied: `https://______________.railway.app`
- [ ] Tested backend: visited URL, saw API welcome message
- [ ] Tested endpoint: `/api/products` returns data

---

## 🌐 Frontend Deployment (Vercel)

### Setup
- [ ] Signed up/logged in to [Vercel](https://vercel.com)
- [ ] Connected GitHub account to Vercel
- [ ] Imported project from GitHub
- [ ] Set Framework Preset to **Create React App**
- [ ] Set Root Directory to `frontend`
- [ ] Verified Build Command: `npm run build`
- [ ] Verified Output Directory: `build`

### Environment Variables
Add these in Vercel Environment Variables:

- [ ] `REACT_APP_API_URL=https://your-backend.railway.app/api`
- [ ] `REACT_APP_IMAGE_BASE_URL=https://your-backend.railway.app` *(optional)*

### Deployment
- [ ] Clicked Deploy
- [ ] Build successful (check build logs)
- [ ] Frontend URL copied: `https://______________.vercel.app`
- [ ] Visited frontend, site loads correctly
- [ ] Checked browser console (F12) for errors

---

## 🔄 Post-Deployment Configuration

### Update Backend CORS
- [ ] Went back to Railway dashboard
- [ ] Updated `CLIENT_URL` to actual Vercel URL
- [ ] Format: `https://your-app.vercel.app` (no trailing slash)
- [ ] Saved and waited for auto-redeploy
- [ ] Verified redeploy successful

---

## ✅ Testing & Verification

### Backend Tests
- [ ] Backend URL accessible
- [ ] API welcome message displays
- [ ] `/api/products` returns product data
- [ ] `/api/categories` returns categories
- [ ] No errors in Railway logs

### Frontend Tests
- [ ] Homepage loads without errors
- [ ] Products display correctly
- [ ] Images load properly
- [ ] User registration works
- [ ] Login functionality works
- [ ] Cart operations work
- [ ] Checkout process works
- [ ] No CORS errors in browser console
- [ ] No 404 errors for API calls

### Cross-Platform Tests
- [ ] Frontend can communicate with backend
- [ ] Database operations work (create user, fetch products)
- [ ] Authentication flow works end-to-end
- [ ] Image uploads work (if applicable)

---

## 🔒 Security Verification

- [ ] JWT_SECRET is strong (32+ characters)
- [ ] Environment variables not in Git repository
- [ ] HTTPS enabled on both platforms (automatic)
- [ ] CORS restricted to frontend domain only
- [ ] MongoDB Atlas IP whitelist configured
- [ ] .env files in .gitignore

---

## 📝 Important URLs & Information

**Backend (Railway):**
- URL: `https://_____________________________.railway.app`
- Dashboard: https://railway.app/dashboard

**Frontend (Vercel):**
- URL: `https://_____________________________.vercel.app`
- Dashboard: https://vercel.com/dashboard

**Database:**
- Provider: MongoDB Atlas
- Dashboard: https://cloud.mongodb.com

**Generated Secrets:**
- JWT_SECRET: `___________________________________________`
- Gmail App Password: `________________`

---

## 🐛 Common Issues Checklist

If something doesn't work, check:

**CORS Errors:**
- [ ] CLIENT_URL matches Vercel URL exactly (no trailing slash)
- [ ] Backend redeployed after updating CLIENT_URL

**API 404 Errors:**
- [ ] REACT_APP_API_URL includes `/api` at the end
- [ ] Frontend redeployed after adding environment variables

**Images Not Loading:**
- [ ] REACT_APP_IMAGE_BASE_URL set correctly
- [ ] Image paths in code updated to use environment variable

**Database Connection Failed:**
- [ ] MongoDB Atlas network access allows `0.0.0.0/0`
- [ ] MONGO_URI format is correct
- [ ] Database user credentials are correct

**Build Failures:**
- [ ] All dependencies in package.json
- [ ] Node version compatible (check logs)
- [ ] No TypeScript/ESLint errors blocking build

---

## 🎉 Deployment Complete!

Once all items are checked:

✅ **Your e-commerce site is live and ready!**

**Share your site:**
- Frontend: https://______________________________
- Share with users, team, and stakeholders

**Next Steps:**
1. Set up custom domain (optional)
2. Configure monitoring and alerts
3. Add more content and products
4. Set up analytics
5. Enable email notifications

---

## 📚 Reference Documentation

**Detailed Guide:** See `VERCEL_RAILWAY_DEPLOYMENT.md`

**Platform Docs:**
- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)

---

**Last Updated:** *(Fill in deployment date)*
**Deployed By:** *(Your name)*
