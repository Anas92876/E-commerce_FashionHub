# 🚀 Quick Deployment Guide

## Step-by-Step Deployment

### 1️⃣ MongoDB Atlas (5 minutes)

1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create FREE cluster (M0 Sandbox)
3. Create database user (save password!)
4. Network Access → Add IP → Allow from anywhere (`0.0.0.0/0`)
5. Get connection string:
   - Database → Connect → Connect your application
   - Copy string: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/...`
   - Add database name: `mongodb+srv://...@cluster0.xxxxx.mongodb.net/ecommerce?retryWrites=true&w=majority`

---

### 2️⃣ Deploy Backend (10 minutes)

#### Using Railway (Recommended):

1. Go to [Railway](https://railway.app) → Sign up with GitHub
2. New Project → Deploy from GitHub → Select your repo
3. Settings → Root Directory: `backend`
4. Variables tab → Add:

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ecommerce?retryWrites=true&w=majority
JWT_SECRET=generate_with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_EXPIRE=30d
CLIENT_URL=https://your-frontend.vercel.app (update after frontend deploy)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
```

5. Deploy → Copy backend URL (e.g., `https://your-app.railway.app`)

---

### 3️⃣ Deploy Frontend (10 minutes)

#### Using Vercel:

1. Go to [Vercel](https://vercel.com) → Sign up with GitHub
2. Add New → Project → Import from GitHub
3. Configure:
   - Framework: Create React App
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
4. Environment Variables:
   ```
   REACT_APP_API_URL=https://your-backend.railway.app/api
   ```
5. Deploy → Copy frontend URL

---

### 4️⃣ Update Configuration (2 minutes)

1. **Backend:** Update `CLIENT_URL` to your Vercel URL
2. **Frontend:** Rebuild if needed (Vercel auto-rebuilds)

---

### 5️⃣ Update Image URLs (Important!)

Your code uses `http://localhost:5000` for images. You have two options:

#### Option A: Use Environment Variable (Recommended)

1. In Vercel, add another environment variable:
   ```
   REACT_APP_IMAGE_BASE_URL=https://your-backend.railway.app
   ```

2. Update files to use `getImageUrl()` helper (see `IMAGE_URL_UPDATE_GUIDE.md`)

#### Option B: Quick Fix (Temporary)

Search and replace in all files:
- Find: `http://localhost:5000`
- Replace: `https://your-backend.railway.app`

---

## ✅ Verification Checklist

- [ ] Backend accessible: `https://your-backend.railway.app` shows API message
- [ ] Frontend accessible: `https://your-app.vercel.app` loads
- [ ] Products load on frontend
- [ ] Images display correctly
- [ ] User registration works
- [ ] Login works
- [ ] Add to cart works

---

## 🔧 Troubleshooting

**CORS Error?**
- Update `CLIENT_URL` in backend to match frontend URL exactly

**Images Not Loading?**
- Update all `http://localhost:5000` references
- Check image paths in database

**Database Connection Failed?**
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check connection string format

**Build Fails?**
- Check Node.js version
- Review build logs for specific errors

---

## 📝 Environment Variables Summary

### Backend (Railway):
```
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

### Frontend (Vercel):
```
REACT_APP_API_URL=https://your-backend.railway.app/api
REACT_APP_IMAGE_BASE_URL=https://your-backend.railway.app
```

---

## 🎉 Done!

Your site is now live:
- **Frontend:** `https://your-app.vercel.app`
- **Backend:** `https://your-backend.railway.app`
- **Database:** MongoDB Atlas

---

## 📚 Detailed Guides

- Full deployment guide: `DEPLOYMENT_GUIDE.md`
- Deployment checklist: `DEPLOYMENT_CHECKLIST.md`
- Image URL updates: `IMAGE_URL_UPDATE_GUIDE.md`

---

**Need help?** Check the detailed guides or platform documentation!

