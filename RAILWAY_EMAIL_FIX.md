# Railway Email Fix - Connection Timeout Solution

## The Problem

Railway (and many cloud platforms) **block outbound SMTP connections** on ports 587 and 465 for security reasons. This causes the error:

```
❌ Email transporter error: Error: Connection timeout
```

## Solutions (Choose One)

### ✅ SOLUTION 1: Use Resend (RECOMMENDED - FREE & EASY)

Resend is a modern email API that works perfectly with Railway and has a generous free tier.

#### Step 1: Sign Up for Resend
1. Go to https://resend.com/signup
2. Sign up (free account - 3,000 emails/month, 100/day)
3. Verify your email address

#### Step 2: Get API Key
1. Go to https://resend.com/api-keys
2. Click **Create API Key**
3. Name it "Railway E-commerce Backend"
4. Copy the API key (starts with `re_...`)

#### Step 3: Verify Domain (Optional but recommended)
1. Go to https://resend.com/domains
2. Add your domain (or use `onboarding.resend.dev` for testing)
3. Follow DNS verification steps

#### Step 4: Install Resend Package
**I'll do this for you in the next step**

#### Step 5: Update Railway Variables
In Railway, update these variables:
```
EMAIL_SERVICE=resend
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=onboarding@resend.dev
```

---

### ✅ SOLUTION 2: Use SendGrid (FREE Tier - 100 emails/day)

#### Step 1: Sign Up
1. Go to https://signup.sendgrid.com/
2. Sign up (free account)
3. Verify email and complete setup

#### Step 2: Create API Key
1. Go to Settings → API Keys
2. Click **Create API Key**
3. Choose **Restricted Access**
4. Enable only **Mail Send** permission
5. Copy the API key

#### Step 3: Update Railway Variables
```
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.your_api_key_here
EMAIL_FROM=your-verified-email@yourdomain.com
```

---

### ✅ SOLUTION 3: Try Gmail with Port 465 (May Still Timeout)

Update Railway variables:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

**Note:** This might still timeout due to Railway firewall restrictions.

---

## Which Solution to Choose?

| Service | Free Tier | Ease of Setup | Railway Compatible |
|---------|-----------|---------------|-------------------|
| **Resend** | 3,000/month | ⭐⭐⭐⭐⭐ Easiest | ✅ Yes |
| **SendGrid** | 100/day | ⭐⭐⭐⭐ Easy | ✅ Yes |
| **Gmail SMTP** | Unlimited | ⭐⭐ Medium | ⚠️ Usually blocked |

**Recommendation:** Use **Resend** - it's the easiest and most reliable for Railway.

---

## After Choosing a Solution

1. I'll update the code to support your chosen service
2. You'll add the API keys to Railway variables
3. Railway will auto-redeploy
4. Test by placing an order

Let me know which solution you want to use, and I'll update the code accordingly!
