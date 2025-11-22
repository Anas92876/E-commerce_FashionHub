# ⚡ Cloudinary Quick Start - 10 Minutes

Get Cloudinary running in 10 minutes!

---

## Step 1: Get Cloudinary Credentials (5 mins)

1. **Sign up:** [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)

2. **Copy credentials** from dashboard:
   ```
   Cloud Name: ________________
   API Key: ___________________
   API Secret: ________________
   ```

---

## Step 2: Add to Railway (3 mins)

**Go to:** Railway Dashboard → Your Backend → **Variables**

**Add these 3 variables:**

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Save** → Railway will auto-redeploy

---

## Step 3: Test (2 mins)

1. **Go to:** `https://e-commerce-fashionhub-one.vercel.app/admin/login`

2. **Login** with admin credentials

3. **Upload a product image**

4. **Verify:**
   - Image uploads successfully ✅
   - Image displays on your site ✅
   - Image URL starts with `https://res.cloudinary.com/...` ✅

---

## ✅ Done!

Your images are now:
- ✅ Stored permanently on Cloudinary
- ✅ Served via CDN (fast worldwide)
- ✅ Auto-optimized for web
- ✅ Survive Railway redeploys

---

**For detailed instructions, see:** [CLOUDINARY_SETUP_GUIDE.md](./CLOUDINARY_SETUP_GUIDE.md)
