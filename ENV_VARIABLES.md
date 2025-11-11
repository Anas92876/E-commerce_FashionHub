# Environment Variables Guide

## Backend Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Database
MONGO_URI=your_mongodb_connection_string

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### Getting MongoDB Connection String:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (free tier available)
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password
6. Replace `<dbname>` with your database name

Example:
```
mongodb+srv://username:password@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority
```

### Getting Gmail App Password:

1. Go to [Google Account](https://myaccount.google.com)
2. Security → Enable 2-Step Verification
3. App Passwords → Generate new app password
4. Use this password in `EMAIL_PASSWORD`

---

## Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
# API URL
REACT_APP_API_URL=http://localhost:5000/api
```

### Production:

Replace with your deployed backend URL:
```env
REACT_APP_API_URL=https://your-backend.railway.app/api
```

---

## Important Notes:

1. **Never commit `.env` files** to Git (already in .gitignore)
2. **Use strong JWT_SECRET** in production (at least 32 random characters)
3. **Update CLIENT_URL** to match your frontend URL in production
4. **MongoDB Atlas** requires IP whitelist - use `0.0.0.0/0` for all IPs in production

