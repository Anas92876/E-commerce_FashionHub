# 🛍️ FashionHub - Premium E-Commerce Platform

A modern, full-stack e-commerce platform for selling premium fashion online, built with the MERN stack and optimized for performance, SEO, and user experience.

**Live Demo:** [https://e-commerce-fashionhub-one.vercel.app](https://e-commerce-fashionhub-one.vercel.app)

## ✨ Features

### Customer Features
- 🔐 **User Authentication** - Secure registration, login, and password reset
- 🛒 **Shopping Cart** - Persistent cart with size and color variants
- 🔍 **Advanced Product Search** - Filter by category, price, size, and more
- ⭐ **Product Reviews & Ratings** - Customer feedback system
- 📦 **Order Tracking** - View order status and history
- 💳 **Cash on Delivery** - Simple and secure payment
- 📧 **Email Notifications** - Order confirmations and status updates
- 🌓 **Theme System** - Light, Dark, and Auto modes with system preference detection
- 📱 **Fully Responsive** - Optimized for all devices

### Admin Features
- 📊 **Admin Dashboard** - Comprehensive analytics and statistics
- 🏷️ **Product Management** - Add, edit, delete products with variants
- 📂 **Category Management** - Organize products efficiently
- 🎨 **Cloudinary Integration** - Cloud-based image management
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
- **MongoDB** - NoSQL database
- **Mongoose** - ODM library
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email service
- **Multer** - File upload
- **Cloudinary** - Image storage and optimization

### Deployment
- **Frontend:** Vercel
- **Backend:** Railway
- **Database:** MongoDB Atlas
- **Image Storage:** Cloudinary

## 📁 Project Structure

```
ecommerce-clothing-app/
├── backend/
│   ├── config/           # Database & Cloudinary configuration
│   ├── models/           # Mongoose models (User, Product, Order, Review, etc.)
│   ├── routes/           # API routes
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Auth, upload, error handling middleware
│   ├── utils/            # Utility functions
│   ├── .env              # Environment variables
│   └── server.js         # Entry point
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
│   └── .env              # Environment variables
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- Cloudinary account
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

4. **Configure environment variables:**

**Backend (`.env`):**
```env
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d

# Email (Gmail App Password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL
CLIENT_URL=http://localhost:3000
```

**Frontend (`.env`):**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SITE_URL=http://localhost:3000
```

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

## 📦 Deployment

### Vercel (Frontend)

1. Connect your GitHub repository to Vercel
2. Add environment variables:
   - `REACT_APP_API_URL`
   - `REACT_APP_SITE_URL`
3. Deploy!

### Railway (Backend)

1. Connect your GitHub repository to Railway
2. Add environment variables (all variables from backend `.env`)
3. Deploy!

**Note:** Update `CLIENT_URL` in Railway to your Vercel deployment URL

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password
- `PUT /api/auth/update-profile` - Update user profile
- `PUT /api/auth/update-password` - Change password

### Products
- `GET /api/products` - Get all products (with filters & pagination)
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
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders` - Get all orders (admin)
- `PUT /api/orders/:id/status` - Update order status (admin)
- `PUT /api/orders/:id/cancel` - Cancel order

### Reviews
- `GET /api/reviews/product/:productId` - Get product reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all messages (admin)
- `PUT /api/contact/:id/reply` - Reply to message (admin)

## 🎨 Theme System

FashionHub features a sophisticated theme system with three modes:

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
2. Manually set `role: "admin"` in MongoDB
3. Navigate to `/admin/dashboard`

## 🤝 Contributing

This is a learning project. Contributions, issues, and feature requests are welcome!

## 📄 License

MIT

## 👤 Author

Created with dedication to modern web development practices.

## 🙏 Acknowledgments

- Built with React, Node.js, and MongoDB
- Icons by Heroicons
- Animations by Framer Motion
- Styling with Tailwind CSS
- Hosted on Vercel and Railway

---

⭐ Star this repo if you find it helpful!
