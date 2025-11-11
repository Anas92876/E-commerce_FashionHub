# Backend - E-Commerce Clothing Application

Node.js/Express REST API for e-commerce clothing store with MongoDB database.

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** 4.18.2 - Web framework
- **MongoDB** with Mongoose 8.0.0 - Database
- **JWT** (jsonwebtoken 9.0.2) - Authentication
- **Bcrypt.js** 2.4.3 - Password hashing
- **Multer** 1.4.5-lts.1 - File upload handling
- **Nodemailer** 6.9.7 - Email functionality
- **Nodemon** 3.0.1 - Development auto-restart
- **Dotenv** 16.3.1 - Environment variables
- **CORS** 2.8.5 - Cross-origin resource sharing

## Project Structure

```
backend/
├── config/
│   └── db.js              # MongoDB connection
│
├── controllers/           # Request handlers
│   ├── authController.js  # Authentication logic
│   ├── categoryController.js
│   ├── contactController.js
│   ├── orderController.js
│   ├── productController.js
│   ├── reviewController.js
│   ├── userController.js
│   └── variantController.js
│
├── middleware/            # Custom middleware
│   ├── auth.js            # JWT verification & admin check
│   └── upload.js          # Multer file upload config
│
├── models/                # Mongoose schemas
│   ├── Category.js        # Product categories
│   ├── Contact.js         # Contact form messages
│   ├── Order.js           # Customer orders
│   ├── Product.js         # Products with variants
│   ├── Review.js          # Product reviews
│   └── User.js            # User accounts
│
├── routes/                # API routes
│   ├── auth.js            # /api/auth
│   ├── categories.js      # /api/categories
│   ├── contact.js         # /api/contact
│   ├── orders.js          # /api/orders
│   ├── products.js        # /api/products
│   ├── reviews.js         # /api/reviews
│   └── users.js           # /api/users
│
├── scripts/               # Utility scripts
│   ├── createTestProductWithVariants.js
│   ├── migrateProductsToVariants.js
│   └── testProductCreation.js
│
├── uploads/               # Uploaded product images
│
├── utils/                 # Utility functions
│   └── email.js           # Email sending functionality
│
├── .env                   # Environment variables
├── server.js              # Main server file
└── seeder.js              # Database seeding
```

## Database Models

### User
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  role: String (customer/admin),
  shippingAddress: {
    street, city, state, zipCode, country
  },
  timestamps: true
}
```

### Product (with Variants)
```javascript
{
  name: String,
  description: String,
  category: ObjectId,
  variants: [{
    sku: String,
    color: { name, code },
    images: [String],
    sizes: [{
      size: String,
      stock: Number,
      sku: String
    }],
    priceOverride: Number
  }],
  tags: [String],
  isActive: Boolean,
  timestamps: true
}
```

### Category
```javascript
{
  name: String (unique),
  description: String,
  image: String,
  isActive: Boolean,
  timestamps: true
}
```

### Order
```javascript
{
  user: ObjectId,
  items: [{
    product: ObjectId,
    variantId: String,
    selectedSize: String,
    quantity: Number,
    price: Number
  }],
  shippingAddress: Object,
  totalAmount: Number,
  status: String (pending/processing/shipped/delivered/cancelled),
  timestamps: true
}
```

### Review
```javascript
{
  product: ObjectId,
  user: ObjectId,
  rating: Number (1-5),
  comment: String,
  order: ObjectId,
  timestamps: true
}
```

### Contact
```javascript
{
  name: String,
  email: String,
  message: String,
  status: String (new/read/replied),
  timestamps: true
}
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token

### Products (`/api/products`)
- `GET /` - Get all products (public)
- `GET /:id` - Get product by ID (public)
- `POST /` - Create product (admin only)
- `PUT /:id` - Update product (admin only)
- `DELETE /:id` - Delete product (admin only)
- `GET /:id/variants` - Get product variants
- `PUT /:id/variants/:variantId` - Update variant (admin only)

### Categories (`/api/categories`)
- `GET /` - Get all categories (public)
- `GET /:id` - Get category by ID (public)
- `POST /` - Create category (admin only)
- `PUT /:id` - Update category (admin only)
- `DELETE /:id` - Delete category (admin only)

### Orders (`/api/orders`)
- `GET /` - Get user's orders (authenticated)
- `GET /all` - Get all orders (admin only)
- `GET /:id` - Get order by ID (authenticated)
- `POST /` - Create order (authenticated)
- `PUT /:id` - Update order status (admin only)

### Users (`/api/users`)
- `GET /` - Get all users (admin only)
- `PUT /:id/role` - Update user role (admin only)
- `DELETE /:id` - Delete user (admin only)

### Reviews (`/api/reviews`)
- `GET /product/:productId` - Get product reviews (public)
- `POST /` - Create review (authenticated)
- `DELETE /:id` - Delete review (admin only)

### Contact (`/api/contact`)
- `POST /` - Submit contact form (public)
- `GET /` - Get all messages (admin only)
- `PUT /:id` - Update message status (admin only)

## Middleware

### Authentication (`protect`)
- Verifies JWT token from Authorization header
- Adds `req.user` with authenticated user data
- Returns 401 if token invalid/missing

### Admin Check (`admin`)
- Checks if authenticated user has admin role
- Returns 403 if not admin
- Must be used after `protect` middleware

### File Upload (`upload`)
- Handles multipart/form-data
- Stores files in `/uploads` directory
- Supports single and multiple file uploads
- File naming: `{timestamp}-{randomString}-{originalName}`

## Setup & Installation

### Prerequisites
- Node.js 14+ and npm
- MongoDB (local or MongoDB Atlas)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB
MONGO_URI=mongodb://localhost:27017/ecommerce-clothing

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d

# Email (Optional - for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@store.com
```

3. Start MongoDB (if running locally):
```bash
mongod
```

4. Seed database (optional):
```bash
node seeder.js
```

5. Start server:
```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5000`

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `node seeder.js` - Seed database with sample data
- `node scripts/createTestProductWithVariants.js` - Create test product
- `node scripts/migrateProductsToVariants.js` - Migrate old products

## Authentication & Security

### JWT Authentication
1. User logs in with email/password
2. Password verified with bcrypt
3. JWT token generated with user ID
4. Token sent to client
5. Client sends token in `Authorization: Bearer <token>` header
6. Server verifies token on protected routes

### Password Security
- Passwords hashed with bcrypt (10 salt rounds)
- Password never stored in plain text
- Password field excluded from query results by default
- Password reset tokens generated and hashed

### CORS
- Configured to allow requests from frontend
- Handles preflight requests
- Supports credentials

## File Upload

### Product Images
- Uploaded via `POST /api/products` with multipart/form-data
- Stored in `/uploads` directory
- Served as static files via `/uploads` route
- Supports multiple images per variant
- File types: jpg, jpeg, png, gif, webp

### Category Images
- Uploaded via `POST /api/categories`
- Single image per category

### Upload Configuration
- Max file size: 5MB (configurable)
- Allowed extensions: jpg, jpeg, png, gif, webp
- Files renamed on upload to prevent conflicts

## Database Seeding

The `seeder.js` script populates the database with sample data:

```bash
node seeder.js
```

Creates:
- 1 admin user (email: admin@example.com, password: admin123)
- 2 customer users
- 4 product categories
- 8 sample products with variants

## Environment Variables

Required:
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens

Optional:
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)
- `JWT_EXPIRE` - Token expiration (default: 30d)
- `EMAIL_*` - Email service configuration

## Error Handling

### Centralized Error Handling
- Custom error middleware in `server.js`
- Catches all errors and returns consistent format:
```json
{
  "success": false,
  "message": "Error message"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Product Variant System

### Variant Structure
Each product can have multiple color variants:
- Each variant has unique SKU
- Each variant has its own images
- Each variant has size/stock matrix
- Variant pricing can override base price

### Size Types
- **Clothing**: XS, S, M, L, XL, XXL
- **Jeans**: 26, 28, 30, 32, 34, 36, 38, 40, 42
- **Shoes**: 6, 7, 8, 9, 10, 11, 12, 13
- **Kids**: 2T, 3T, 4T, 5T, 6, 7, 8, 10, 12, 14

### Legacy Simple Products
Still supported for backward compatibility:
- Single price
- Single stock
- No variants
- Automatic conversion possible via migration script

## Testing

### Manual Testing
Use Postman or Thunder Client to test endpoints:

1. Register user: `POST /api/auth/register`
2. Login: `POST /api/auth/login` (get token)
3. Use token in Authorization header for protected routes

### Test Scripts
- `scripts/testProductCreation.js` - Test product creation
- `scripts/createTestProductWithVariants.js` - Create sample variant product

## Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use MongoDB Atlas for database
3. Set secure `JWT_SECRET`
4. Configure email service

### Hosting Options
- **Heroku**: Easy deployment with MongoDB Atlas
- **AWS EC2**: Full control
- **DigitalOcean**: Simple droplets
- **Railway**: Modern deployment platform

### Production Checklist
- [ ] Use environment variables
- [ ] Enable HTTPS
- [ ] Set secure CORS origins
- [ ] Use production MongoDB instance
- [ ] Enable compression
- [ ] Set up logging (Winston, Morgan)
- [ ] Configure rate limiting
- [ ] Set up monitoring (PM2, New Relic)
- [ ] Regular database backups

## Performance Optimization

- Database indexing on frequently queried fields
- Populate only necessary fields
- Pagination for large datasets (can be added)
- Caching with Redis (can be added)
- Image optimization (can be added)
- Connection pooling for MongoDB

## Security Best Practices

- JWT tokens for authentication
- Bcrypt for password hashing
- Input validation and sanitization
- Protection against NoSQL injection
- CORS configuration
- Helmet for HTTP headers (can be added)
- Rate limiting (can be added)
- XSS protection (can be added)

## Monitoring & Logging

Current:
- Console logging for errors
- MongoDB connection status
- Server startup confirmation

Can be added:
- Winston for structured logging
- Morgan for HTTP request logging
- Error tracking (Sentry)
- Performance monitoring (New Relic)

## Contributing

1. Follow Node.js best practices
2. Use async/await for asynchronous operations
3. Implement proper error handling
4. Add input validation
5. Document new endpoints
6. Test before committing

## License

MIT License
