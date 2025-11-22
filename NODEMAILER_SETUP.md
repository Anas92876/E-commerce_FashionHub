# Nodemailer Setup Guide for Railway

## Required Environment Variables

Add these to your **Railway** backend service:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password-here
```

---

## How to Get Gmail App Password (CRITICAL!)

**⚠️ IMPORTANT:** You CANNOT use your regular Gmail password. You MUST use a Gmail App Password.

### Step 1: Enable 2-Step Verification
1. Go to https://myaccount.google.com/security
2. Click **2-Step Verification**
3. Follow the steps to enable it (if not already enabled)

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
   - OR: Google Account → Security → 2-Step Verification → App passwords
2. Select **Mail** as the app
3. Select **Other (Custom name)** as the device
4. Enter a name like "E-commerce Railway Backend"
5. Click **Generate**
6. Copy the **16-character password** (format: xxxx xxxx xxxx xxxx)

### Step 3: Add to Railway
1. Open your Railway project
2. Go to your **backend** service
3. Click **Variables** tab
4. Add the 16-character password to `EMAIL_PASSWORD` (remove spaces!)
   - Example: `abcdabcdabcdabcd` NOT `abcd abcd abcd abcd`

---

## How to Check if Email is Working

### Method 1: Check Railway Logs
1. Go to Railway → Your backend service → **Deployments**
2. Click on the latest deployment
3. Look for these messages in logs:

**✅ SUCCESS:**
```
✅ Email server is ready to send messages
```

**❌ ERROR:**
```
❌ Email transporter error: Invalid login: 535-5.7.8 Username and Password not accepted
```

### Method 2: Test Order Creation
1. Place a test order on your website
2. Check Railway logs for:
```
✅ Email sent: <message-id> - Order Confirmation #<order-id> to user@email.com
```

---

## Common Errors and Solutions

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"
**Cause:** Using regular Gmail password instead of App Password
**Solution:** Generate and use Gmail App Password (see above)

### Error: "Missing credentials for 'PLAIN'"
**Cause:** EMAIL_USER or EMAIL_PASSWORD environment variables not set
**Solution:** Double-check Railway variables are set correctly

### Error: "self signed certificate in certificate chain"
**Cause:** SSL/TLS certificate issue
**Solution:** Add to Railway variables:
```
NODE_TLS_REJECT_UNAUTHORIZED=0
```
(Not recommended for production, but works for testing)

### Error: Email not sending but no error
**Cause:** Variables not set, so email sending is skipped
**Check logs for:**
```
⚠️  Email not configured. Skipping email send.
📧 Would have sent: Order Confirmation #xxx to user@email.com
```
**Solution:** Set EMAIL_USER and EMAIL_PASSWORD in Railway

---

## Current Railway Variables Checklist

Open Railway → Backend Service → Variables tab and verify:

- [ ] `EMAIL_HOST` = `smtp.gmail.com`
- [ ] `EMAIL_PORT` = `587`
- [ ] `EMAIL_USER` = Your Gmail address (e.g., `yourname@gmail.com`)
- [ ] `EMAIL_PASSWORD` = 16-character App Password (NO SPACES!)
- [ ] `CLIENT_URL` = Your Vercel frontend URL
- [ ] `CLOUDINARY_CLOUD_NAME` = Your Cloudinary cloud name
- [ ] `CLOUDINARY_API_KEY` = Your Cloudinary API key
- [ ] `CLOUDINARY_API_SECRET` = Your Cloudinary API secret
- [ ] `MONGODB_URI` = Your MongoDB Atlas connection string
- [ ] `JWT_SECRET` = Random secure string

---

## Testing Email Functionality

After setting up the variables:

1. **Redeploy** your Railway backend (it should auto-deploy after variable changes)
2. **Wait 2-3 minutes** for deployment to complete
3. **Check logs** for "✅ Email server is ready to send messages"
4. **Place a test order** on your website
5. **Check your email inbox** (and spam folder!)

---

## Alternative: Use a Different Email Service

If Gmail App Password doesn't work, you can use:

### Sendinblue (Brevo) - FREE Tier
```
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_USER=your-brevo-email@example.com
EMAIL_PASSWORD=your-sendinblue-smtp-key
```

### SendGrid - FREE Tier
```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

### Mailgun - FREE Tier
```
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=your-mailgun-smtp-username
EMAIL_PASSWORD=your-mailgun-smtp-password
```

---

## Need Help?

Check Railway logs and share the error message for specific troubleshooting.
