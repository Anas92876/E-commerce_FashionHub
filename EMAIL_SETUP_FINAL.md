# ✅ EMAIL SETUP - FINAL SOLUTION (Works on Railway)

## The Problem
Railway blocks Gmail's SMTP ports (587, 465) for security reasons.

## The Solution
Use Mailjet's SMTP with your existing nodemailer setup (NO new packages needed!).

---

## 🚀 Setup (3 Minutes)

### Step 1: Sign Up for Mailjet
1. Go to: https://app.mailjet.com/signup
2. Create account and verify your email

### Step 2: Get SMTP Credentials
1. Go to: https://app.mailjet.com/account/setup
2. Look for **"SMTP Settings"** section
3. You'll see:
   - **SMTP Server:** `in-v3.mailjet.com`
   - **Port:** `587` or `465`
   - **Username:** (looks like an email or long string)
   - **Password:** (long random string)
4. **COPY these 4 values**

### Step 3: Verify Sender Email
1. Go to: https://app.mailjet.com/account/sender
2. Click **"Add a Sender Address"**
3. Enter: `mhab36817@gmail.com`
4. Check your Gmail inbox and click verification link

### Step 4: Update Railway Variables

**Remove these:**
- ❌ Delete: `EMAIL_SERVICE`
- ❌ Delete: Any `BREVO`, `SENDGRID`, `MAILJET_API_KEY` variables

**Add these 4 variables:**
```
EMAIL_HOST = in-v3.mailjet.com
EMAIL_PORT = 587
EMAIL_USER = [your Mailjet username from Step 2]
EMAIL_PASSWORD = [your Mailjet password from Step 2]
```

### Step 5: Done!
Railway will redeploy automatically (2-3 minutes).

---

## ✅ Success Logs (Railway)
```
✅ Email service ready to send emails
✅ Email sent: <message-id> - Order Confirmation #xxx
```

---

## Why This Works
- ✅ Mailjet SMTP uses different infrastructure Railway doesn't block
- ✅ Uses existing nodemailer (no new packages)
- ✅ 200 emails/day, 6000/month FREE
- ✅ Works immediately after sender verification

---

## Links
- Mailjet Signup: https://app.mailjet.com/signup
- SMTP Settings: https://app.mailjet.com/account/setup
- Sender Verification: https://app.mailjet.com/account/sender
