# Deployment Guide - E-commerce FashionHub

This guide will help you deploy your full-stack e-commerce application to production.

## 🚀 Deployment Options

### Option 1: Railway (Recommended - Easy & Free Tier Available)

Railway is a modern platform that makes deployment simple.

#### Backend Deployment on Railway:

1. **Sign up/Login** to [Railway](https://railway.app)

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account
   - Select your repository: `E-commerce_FashionHub`

3. **Configure Backend Service**
   - Railway will auto-detect Node.js
   - Set **Root Directory** to: `backend`
   - Set **Start Command** to: `npm start`
   - Railway will automatically use `PORT` environment variable

4. **Add Environment Variables**
   Click on your service → Variables tab → Add:
   ```
   NODE_ENV=production
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_strong_secret_key_here
   JWT_EXPIRE=30d
   CLIENT_URL=https://your-frontend-url.vercel.app
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_gmail_app_password
   ```

5. **Deploy**
   - Railway will automatically deploy on every push to main branch
   - Copy your backend URL (e.g., `https://your-app.railway.app`)

#### Frontend Deployment on Vercel:

1. **Sign up/Login** to [Vercel](https://vercel.com)

2. **Import Project**
   - Click "Add New" → "Project"
   - Import from GitHub
   - Select your repository

3. **Configure Frontend**
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

4. **Add Environment Variables**
   ```
   REACT_APP_API_URL=https://your-backend.railway.app/api
   ```

5. **Deploy**
   - Click "Deploy"
   - Vercel will give you a URL like `https://your-app.vercel.app`

6. **Update Backend CORS**
   - Go back to Railway
   - Update `CLIENT_URL` to your Vercel URL

---

### Option 2: Render (Alternative - Free Tier Available)

#### Backend on Render:

1. **Sign up** at [Render](https://render.com)

2. **Create New Web Service**
   - Connect your GitHub repository
   - Select repository: `E-commerce_FashionHub`

3. **Configure Service**
   - **Name**: `ecommerce-backend`
   - **Environment**: Node
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Add Environment Variables** (same as Railway)

5. **Deploy**
   - Render will provide a URL like `https://your-app.onrender.com`

#### Frontend on Render:

1. **Create New Static Site**
   - Connect GitHub repo
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

2. **Add Environment Variable**
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com/api
   ```

---

## 📋 Pre-Deployment Checklist

### 1. MongoDB Atlas Setup

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (Free tier available)
3. Create database user
4. Whitelist IP addresses (use `0.0.0.0/0` for all IPs in production)
5. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
   ```

### 2. Environment Variables

#### Backend (.env):
```env
NODE_ENV=production
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=generate_a_strong_random_secret_here
JWT_EXPIRE=30d
CLIENT_URL=https://your-frontend-url.vercel.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
```

#### Frontend (.env):
```env
REACT_APP_API_URL=https://your-backend.railway.app/api
```

### 3. Gmail App Password Setup

For email functionality:
1. Go to [Google Account](https://myaccount.google.com)
2. Security → 2-Step Verification (enable if not enabled)
3. App Passwords → Generate new app password
4. Use this password in `EMAIL_PASSWORD`

### 4. Update CORS

Make sure your backend `CLIENT_URL` matches your frontend URL exactly.

---

## 🔧 Post-Deployment Steps

### 1. Test Your Deployment

- ✅ Frontend loads correctly
- ✅ API endpoints respond
- ✅ User registration works
- ✅ Login works
- ✅ Products load
- ✅ Images display correctly

### 2. Database Seeding (Optional)

If you want to seed your production database:
```bash
# SSH into your backend or use Railway CLI
cd backend
node seeder.js
```

### 3. Set Up Custom Domain (Optional)

- **Vercel**: Add domain in project settings
- **Railway**: Add custom domain in service settings
- Update `CLIENT_URL` and `REACT_APP_API_URL` accordingly

---

## 🐛 Troubleshooting

### Backend Issues:

**Port Error:**
- Railway/Render automatically sets `PORT` - don't hardcode it
- Use `process.env.PORT || 5000` in your code ✅

**CORS Errors:**
- Check `CLIENT_URL` matches frontend URL exactly
- Include protocol (`https://`)
- No trailing slash

**Database Connection:**
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check connection string format
- Verify database user credentials

**Image Upload Issues:**
- Railway/Render use ephemeral storage (files reset on redeploy)
- Consider using cloud storage (AWS S3, Cloudinary) for production

### Frontend Issues:

**API Not Found:**
- Check `REACT_APP_API_URL` is set correctly
- Rebuild after changing environment variables
- Check browser console for CORS errors

**Build Failures:**
- Check Node.js version compatibility
- Review build logs for specific errors
- Ensure all dependencies are in `package.json`

---

## 📦 Alternative: Deploy Both on Railway

You can deploy both frontend and backend on Railway:

1. **Backend Service** (as described above)
2. **Frontend Service**:
   - Create new service in same project
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npx serve -s build -l 3000`
   - Add environment variable: `REACT_APP_API_URL`

---

## 🔒 Security Recommendations

1. **Use strong JWT_SECRET** (at least 32 characters, random)
2. **Enable HTTPS** (automatic on Railway/Vercel/Render)
3. **Set secure CORS origins** (only your frontend URL)
4. **Use MongoDB Atlas** (not local database)
5. **Keep environment variables secret** (never commit .env files)
6. **Regular backups** of MongoDB database
7. **Monitor logs** for errors and suspicious activity

---

## 📊 Monitoring

### Railway:
- View logs in Railway dashboard
- Set up alerts for errors

### Vercel:
- Analytics available in dashboard
- Function logs for API routes

### MongoDB Atlas:
- Monitor database performance
- Set up alerts for high usage

---

## 🎉 Success!

Once deployed, your e-commerce site will be live at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://your-backend.railway.app`

Share your URLs and start selling! 🛍️

---

## Need Help?

- Check platform documentation:
  - [Railway Docs](https://docs.railway.app)
  - [Vercel Docs](https://vercel.com/docs)
  - [Render Docs](https://render.com/docs)

