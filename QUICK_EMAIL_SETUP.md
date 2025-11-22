# 🚀 Quick Email Setup (2 Minutes)

Railway blocks Gmail SMTP, so we're using **Resend** instead (it's free and works perfectly with Railway).

## Step 1: Get Resend API Key (1 minute)

1. Go to **https://resend.com/signup**
2. Sign up with your email (free account)
3. Go to **https://resend.com/api-keys**
4. Click **"Create API Key"**
5. Name it: `Railway Backend`
6. **Copy the API key** (starts with `re_...`)

## Step 2: Add to Railway (30 seconds)

1. Open your **Railway backend service**
2. Go to **Variables** tab
3. Click **"New Variable"**
4. Add these two variables:

```
EMAIL_SERVICE = resend
RESEND_API_KEY = re_your_key_here
EMAIL_FROM = onboarding@resend.dev
```

## Step 3: Done! ✅

Railway will auto-redeploy (wait 2 minutes), then:
- Check Railway logs for: `✅ Email sent via Resend`
- Place a test order to verify emails work

---

## Free Tier Limits

- **3,000 emails per month**
- **100 emails per day**
- Perfect for testing and small businesses!

---

## Troubleshooting

### Error: "API key is required"
- Make sure `RESEND_API_KEY` is set in Railway variables
- Check there are no extra spaces in the key

### No emails received?
- Check spam folder
- Verify your Resend account is activated
- Check Railway logs for email sending confirmation

### Want to use your own domain?
- Go to https://resend.com/domains
- Add your domain and verify DNS records
- Update `EMAIL_FROM` to `noreply@yourdomain.com`

---

## Alternative: Use Gmail (May Still Timeout)

If you prefer Gmail:
```
EMAIL_SERVICE = smtp
EMAIL_HOST = smtp.gmail.com
EMAIL_PORT = 465
EMAIL_USER = your-gmail@gmail.com
EMAIL_PASSWORD = your-16-char-app-password
```

**Note:** Railway often blocks SMTP, so Resend is recommended.
