# 🛍️ ZAYRO - Premium E-Commerce Platform

A modern, full-stack e-commerce platform for selling premium fashion online, built with the MERN stack and optimized for performance, SEO, and user experience.

**Live Demo:** [https://e-commerce-fashionhub-one.vercel.app](https://e-commerce-fashionhub-one.vercel.app)

## ✨ Features

### Customer Features
- 🔐 **User Authentication** - Secure registration and login, with brute-force protection
- 🛒 **Shopping Cart** - Persistent cart with size and color variants
- 🔍 **Search & Filters** - Live search suggestions; filter by category, price, size, color and stock (filters live in the URL, so they can be shared)
- ❤️ **Wishlist** - Save products for later
- 🏷️ **Coupons** - Percent or fixed discount codes at checkout
- ⭐ **Product Reviews & Ratings** - Customer feedback with verified-purchase badges
- 📦 **Order Tracking** - Timeline with the date of every status change
- 💳 **Cash on Delivery** - Simple and secure payment
- 🌓 **Theme System** - Light, Dark, and Auto modes with system preference detection
- 📱 **Fully Responsive** - Optimized for all devices

### Admin Features
- 📊 **Admin Dashboard** - Revenue chart, best sellers, low-stock alerts and 7/30/90-day comparisons (calculated in the database over all orders)
- 🎟️ **Coupon Management** - Create, limit, schedule and disable discount codes
- 🏷️ **Product Management** - Add, edit, delete products with variants
- 📂 **Category Management** - Organize products efficiently
- 🎨 **Supabase Storage** - Cloud-based image storage
- 📋 **Order Management** - Process and track orders
- 👥 **User Management** - Manage customers and admins
- 💬 **Contact Form Management** - View and respond to inquiries

### Performance & SEO
- ⚡ **Optimized Performance** - Lighthouse score > 90
- 🔍 **SEO Ready** - Dynamic meta tags, sitemap, structured data
- 💀 **Skeleton Loaders** - Better UX during data loading
- 🖼️ **Lazy Loading Images** - Improved page load times
- 🎨 **Smooth Animations** - Lightweight transitions with Framer Motion
- 📄 **SPA Routing** - No full-page reloads

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI framework
- **React Router** - Client-side routing
- **Context API** - State management
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Helmet Async** - SEO meta tags management
- **React Hot Toast** - Toast notifications
- **Heroicons** - Icon library
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Supabase (PostgreSQL)** - Database (via `@supabase/supabase-js`)
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload
- **Supabase Storage** - Image storage

### Deployment
- **Frontend + API:** Vercel (React static site + Express as a serverless function)
- **Database:** Supabase (PostgreSQL)
- **Image Storage:** Supabase Storage

## 📁 Project Structure

```
fashionhub/
├── api/index.js          # Vercel serverless function -> backend/app.js
├── vercel.json           # Vercel build + routing config
├── backend/
│   ├── config/           # Supabase client configuration
│   ├── supabase/         # schema.sql (tables, triggers, stock functions, storage bucket)
│   ├── scripts/          # Sample reviews + one-time MongoDB -> Supabase migration
│   ├── routes/           # API routes
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Auth, upload (Supabase Storage) middleware
│   ├── utils/            # Row mapping, product & user helpers
│   ├── .env              # Environment variables
│   ├── app.js            # Express app (used by Vercel and server.js)
│   └── server.js         # Local development server
├── frontend/
│   ├── public/
│   │   ├── index.html    # HTML template with SEO meta tags
│   │   ├── manifest.json # PWA manifest
│   │   ├── robots.txt    # Search engine instructions
│   │   └── sitemap.xml   # SEO sitemap
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   │   ├── skeletons/    # Loading skeletons
│   │   │   ├── SEO.js        # SEO component
│   │   │   ├── ThemeToggle.js
│   │   │   ├── Navbar.js
│   │   │   ├── Footer.js
│   │   │   └── ...
│   │   ├── pages/        # Page components
│   │   │   ├── Home.js
│   │   │   ├── customer/ # Customer pages
│   │   │   └── admin/    # Admin pages
│   │   ├── context/      # React Context providers
│   │   │   ├── AuthContext.js
│   │   │   ├── CartContext.js
│   │   │   └── ThemeContext.js
│   │   ├── utils/        # Utility functions
│   │   └── App.js        # Main app component
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v20 or higher)
- Supabase account (free tier works)
- Git

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/fashionhub.git
cd fashionhub
```

2. **Install backend dependencies:**
```bash
cd backend
npm install
```

3. **Install frontend dependencies:**
```bash
cd ../frontend
npm install
```

4. **Create the Supabase database:**
   - Create a project at [supabase.com](https://supabase.com)
   - Open **SQL Editor → New query**, paste the contents of `backend/supabase/schema.sql` and click **Run**.
     This creates the tables, triggers, stock functions and the public `product-images` storage bucket.
   - Copy the **Project URL** and the **service_role** key from **Project Settings → API**

5. **Configure environment variables:**

**Backend (`.env`):**
```env
NODE_ENV=development
PORT=5000

# Supabase (service_role key is server-side only - never expose it to the frontend)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_STORAGE_BUCKET=product-images

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d
```

The frontend needs no `.env`: in development it calls `http://localhost:5000/api`, and in production it calls `/api` on the same domain.

6. **(Optional) Seed sample data** - a realistic store: 6 categories, 20 products with colors, sizes and photos,
   12 customers with ~35 orders over the last 60 days, 65 reviews, wishlists and 3 coupons
   (`WELCOME10`, `SAVE20`, expired `SUMMER25`). Logins: admin `admin@fashionhub.com` / `Admin123!`,
   customers e.g. `sara.ahmed@example.com` / `Customer123!`.
```bash
cd backend
npm run seed:catalog   # SAFE: only adds missing sample categories/products/photos/reviews
npm run seed           # FULL RESET: wipes users, products and categories, then imports everything
npm run seed:reviews   # only (re)create the sample customers, orders, reviews and coupons
npm run seed:photos    # only add photos to sample products that have none
```

7. **Updating an existing database** - `backend/supabase/schema.sql` is safe to re-run. After pulling
   new features, run it again in the Supabase SQL Editor to add new tables and functions.

### Migrating existing data from MongoDB

If you have data in the old MongoDB database, set `MONGO_URI` in `backend/.env` and run:
```bash
cd backend
npm run migrate:mongo                   # copy all data
npm run migrate:mongo -- --copy-images  # also move Cloudinary images into Supabase Storage
```
IDs are converted deterministically, passwords keep working, and the script is safe to re-run.

### Running the Application

1. **Start the backend server:**
```bash
cd backend
npm run dev
```

2. **Start the frontend (in a new terminal):**
```bash
cd frontend
npm start
```

3. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Running the Tests

```bash
npm test                         # everything (from the repository root)
cd backend && npm test           # API + business logic (Node test runner, fake database)
cd frontend && npx react-scripts test --watchAll=false   # React components (Jest + Testing Library)
```

## 📦 Deployment (Vercel only)

The whole app - React frontend **and** Express API - deploys as **one Vercel project**:
- `frontend/build` is served as a static site
- every `/api/*` request runs `api/index.js` (the Express app) as a serverless function
- images are uploaded from the browser straight to Supabase Storage using one-time signed URLs,
  so uploads are not limited by Vercel's 4.5 MB request size

Steps:
1. Push the repository to GitHub
2. In Vercel: **Add New → Project**, import the repository, and keep **Root Directory** as the repository root (`./`).
   Build settings come from `vercel.json` - don't override them.
3. Add **Environment Variables**:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_STORAGE_BUCKET` = `product-images`
   - `JWT_SECRET` (a long random string)
   - `JWT_EXPIRE` = `30d`
   - `NODE_ENV` = `production`
4. Deploy. Check `https://<your-app>.vercel.app/api/health` returns `"healthy"`.

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-profile` - Update user profile
- `PUT /api/auth/update-password` - Change password

### Products
- `GET /api/products` - Get products. Query: `search`, `category`, `minPrice`, `maxPrice`, `size`, `color`, `inStock=true`, `sort`, `page`, `limit`
- `GET /api/products/filters` - Available sizes, colors and price range
- `GET /api/products/suggest?q=` - Search suggestions (max 6)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### Orders
- `POST /api/orders` - Create new order (prices and coupon applied on the server)
- `GET /api/orders/:id` - Get order details
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders` - Get all orders (admin)
- `PUT /api/orders/:id/status` - Update order status (admin)
- `PUT /api/orders/:id/cancel` - Cancel order

### Reviews
- `GET /api/reviews/recent` - Latest reviews across the store
- `GET /api/reviews/product/:productId` - Get product reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all messages (admin)

### Wishlist (logged in)
- `GET /api/wishlist` - Saved products
- `POST /api/wishlist/:productId` - Save a product
- `DELETE /api/wishlist/:productId` - Remove a product

### Coupons
- `POST /api/coupons/validate` - Preview a coupon for the current cart (logged in)
- `GET / POST /api/coupons`, `PUT / DELETE /api/coupons/:id` - Manage coupons (admin)

### Admin
- `GET /api/admin/stats?days=30` - Dashboard statistics (7, 30 or 90 days)
- `POST /api/uploads/sign` - One-time URL for uploading an image to Supabase Storage

## 🎨 Theme System

ZAYRO features a sophisticated theme system with three modes:

- **Light Mode** - Clean, bright interface
- **Dark Mode** - Easy on the eyes
- **Auto Mode** - Follows system preferences

The theme persists across sessions and automatically updates when system preferences change.

## ⚡ Performance Features

- **Lazy Loading** - Images load only when needed
- **Skeleton Loaders** - Instant visual feedback
- **Optimized Images** - WebP format, responsive sizes
- **Code Splitting** - Faster initial load
- **SPA Routing** - No page reloads
- **Lighthouse Score** - 90+ across all categories

## 🔍 SEO Features

- **Dynamic Meta Tags** - Unique title/description per page
- **Open Graph Tags** - Social media previews
- **Structured Data** - JSON-LD for products
- **Sitemap** - Complete site structure
- **Robots.txt** - Search engine guidance
- **Semantic HTML** - Proper heading hierarchy

## 🎯 Admin Access

To access the admin panel:
1. Create an account
2. In Supabase **Table Editor → users**, set `role` to `admin` for your account
3. Navigate to `/admin/dashboard`

## 🤝 Contributing

This is a learning project. Contributions, issues, and feature requests are welcome!

## 📄 License

MIT

## 👤 Author

Created with dedication to modern web development practices.

## 🙏 Acknowledgments

- Built with React, Node.js, and Supabase
- Icons by Heroicons
- Animations by Framer Motion
- Styling with Tailwind CSS
- Hosted on Vercel, data on Supabase

---

⭐ Star this repo if you find it helpful!
