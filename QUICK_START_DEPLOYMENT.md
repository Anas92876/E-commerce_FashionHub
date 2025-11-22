# ⚡ Quick Start - Deploy in 20 Minutes

Deploy your e-commerce app to **Vercel** (Frontend) + **Railway** (Backend)

---

## Prerequisites (5 mins)

✅ MongoDB Atlas database ready (connection string)
✅ GitHub repo pushed
✅ Gmail App Password generated

---

## Step 1: Backend → Railway (10 mins)

1. **Go to [Railway.app](https://railway.app)** → Login with GitHub
2. **New Project** → Deploy from GitHub → Select `ecommerce-clothing-app`
3. **Settings** → Root Directory: `backend`
4. **Variables** → Add these:

```env
NODE_ENV=production
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_EXPIRE=30d
CLIENT_URL=https://your-app.vercel.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
```

5. **Deploy** → Copy backend URL: `https://________.railway.app`

---

## Step 2: Frontend → Vercel (10 mins)

1. **Go to [Vercel.com](https://vercel.com)** → Login with GitHub
2. **Add New** → Project → Import `ecommerce-clothing-app`
3. **Configure:**
   - Framework: **Create React App**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`

4. **Environment Variables:**

```env
REACT_APP_API_URL=https://your-backend.railway.app/api
```

5. **Deploy** → Copy frontend URL: `https://________.vercel.app`

---

## Step 3: Update CORS (2 mins)

1. **Go back to Railway** → Variables
2. **Update** `CLIENT_URL` to your Vercel URL:
   ```
   CLIENT_URL=https://your-app.vercel.app
   ```
3. Wait for auto-redeploy

---

## Step 4: Test (3 mins)

Visit your Vercel URL and test:
- [ ] Site loads
- [ ] Products display
- [ ] Images work
- [ ] Register/Login works
- [ ] No errors in console (F12)

---

## 🎉 Done!

**Your URLs:**
- Frontend: `https://________.vercel.app`
- Backend: `https://________.railway.app`

---

## Need More Help?

📖 **Detailed Guide:** [VERCEL_RAILWAY_DEPLOYMENT.md](./VERCEL_RAILWAY_DEPLOYMENT.md)
✅ **Checklist:** [DEPLOYMENT_CHECKLIST_VERCEL_RAILWAY.md](./DEPLOYMENT_CHECKLIST_VERCEL_RAILWAY.md)
📝 **Summary:** [DEPLOYMENT_SETUP_SUMMARY.md](./DEPLOYMENT_SETUP_SUMMARY.md)

---

## Troubleshooting

**CORS Error?** → Update `CLIENT_URL` in Railway to match Vercel URL exactly
**API 404?** → Check `REACT_APP_API_URL` includes `/api` at end
**Images broken?** → Add `REACT_APP_IMAGE_BASE_URL` in Vercel
**Build fails?** → Check deployment logs for specific errors
