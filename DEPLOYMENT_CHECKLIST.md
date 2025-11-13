# ✅ Deployment Checklist

Use this checklist to ensure everything is configured correctly before and after deployment.

## Pre-Deployment

### MongoDB Atlas
- [ ] Created MongoDB Atlas account
- [ ] Created cluster (M0 FREE tier)
- [ ] Created database user with password
- [ ] Whitelisted IP addresses (0.0.0.0/0 for production)
- [ ] Copied connection string
- [ ] Tested connection string locally

### Backend Preparation
- [ ] Backend code is pushed to GitHub
- [ ] All environment variables documented
- [ ] JWT_SECRET generated (32+ characters)
- [ ] Gmail app password generated (if using email)
- [ ] Tested backend locally with production environment variables

### Frontend Preparation
- [ ] Frontend code is pushed to GitHub
- [ ] Build tested locally (`npm run build`)
- [ ] All hardcoded localhost URLs identified
- [ ] Environment variables documented

---

## Backend Deployment

### Railway/Render Setup
- [ ] Created account on Railway/Render
- [ ] Connected GitHub repository
- [ ] Created new project/service
- [ ] Set root directory to `backend`
- [ ] Set start command to `npm start`

### Environment Variables (Backend)
- [ ] `NODE_ENV=production`
- [ ] `MONGO_URI` - MongoDB Atlas connection string
- [ ] `JWT_SECRET` - Strong random secret (32+ chars)
- [ ] `JWT_EXPIRE=30d`
- [ ] `CLIENT_URL` - Frontend URL (update after frontend deploy)
- [ ] `EMAIL_HOST=smtp.gmail.com`
- [ ] `EMAIL_PORT=587`
- [ ] `EMAIL_USER` - Your Gmail address
- [ ] `EMAIL_PASSWORD` - Gmail app password

### Backend Verification
- [ ] Backend deployed successfully
- [ ] Backend URL accessible (shows API message)
- [ ] Test endpoint: `GET /api/products` works
- [ ] Test endpoint: `GET /api/categories` works
- [ ] Database connection successful (check logs)
- [ ] No errors in deployment logs

---

## Frontend Deployment

### Vercel Setup
- [ ] Created account on Vercel
- [ ] Connected GitHub repository
- [ ] Created new project
- [ ] Set root directory to `frontend`
- [ ] Set build command to `npm run build`
- [ ] Set output directory to `build`

### Environment Variables (Frontend)
- [ ] `REACT_APP_API_URL` - Backend API URL (e.g., `https://your-backend.railway.app/api`)
- [ ] `REACT_APP_IMAGE_BASE_URL` - Backend URL for images (optional, defaults to API_URL base)

### Frontend Verification
- [ ] Frontend deployed successfully
- [ ] Frontend URL accessible
- [ ] No build errors
- [ ] Frontend loads correctly

---

## Post-Deployment Configuration

### Update Backend CORS
- [ ] Updated `CLIENT_URL` in backend to frontend URL
- [ ] Backend redeployed (or auto-redeployed)
- [ ] CORS errors resolved

### Image URLs
- [ ] Updated all `http://localhost:5000` references
- [ ] Images loading correctly
- [ ] Product images display properly
- [ ] Category images display properly

### Testing
- [ ] Home page loads
- [ ] Products page loads
- [ ] Product details page loads
- [ ] User registration works
- [ ] User login works
- [ ] Add to cart works
- [ ] Checkout process works
- [ ] Admin panel accessible
- [ ] Image uploads work (if applicable)

### Database
- [ ] Database connection stable
- [ ] Data persists after redeploy
- [ ] Test data created (optional)
- [ ] Database backups configured (optional)

---

## Security

- [ ] Strong JWT_SECRET used
- [ ] HTTPS enabled (automatic on most platforms)
- [ ] CORS configured correctly
- [ ] MongoDB Atlas IP whitelist set
- [ ] Environment variables not in Git
- [ ] `.env` files in `.gitignore`

---

## Monitoring

- [ ] Logs accessible
- [ ] Error monitoring set up (optional)
- [ ] Performance monitoring (optional)
- [ ] Database monitoring (MongoDB Atlas)

---

## Optional Enhancements

- [ ] Custom domain configured
- [ ] SSL certificate (automatic on most platforms)
- [ ] CDN for images (Cloudinary, AWS S3)
- [ ] Email notifications working
- [ ] Analytics set up
- [ ] Error tracking (Sentry, etc.)

---

## Final Verification

- [ ] All pages load correctly
- [ ] All features work
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Dark mode works
- [ ] Performance acceptable
- [ ] SEO meta tags (if applicable)

---

## 🎉 Deployment Complete!

Once all items are checked, your e-commerce site is live and ready for customers!

**Frontend URL:** `https://your-app.vercel.app`  
**Backend URL:** `https://your-backend.railway.app`  
**Database:** MongoDB Atlas

---

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| CORS errors | Update CLIENT_URL in backend |
| Images not loading | Update image URLs to use backend URL |
| Database connection failed | Check MongoDB Atlas IP whitelist |
| Build fails | Check Node.js version and dependencies |
| API 404 errors | Verify REACT_APP_API_URL is correct |

---

**Last Updated:** Check all items before going live! 🚀

