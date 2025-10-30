# E-commerce_FashionHub

A full-stack e-commerce platform for selling clothing online, built with the MERN stack.

## Features

- User authentication (register, login, password reset)
- Product browsing and search
- Shopping cart functionality
- Checkout with Cash on Delivery (COD)
- Order management
- Admin panel for product and order management
- Email notifications
- Responsive design

## Tech Stack

**Frontend:**
- React.js
- React Router
- Context API (State Management)
- Axios
- React Icons
- Tailwind CSS / Bootstrap

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt (Password hashing)
- Nodemailer (Email)
- Multer (File upload)

## Project Structure

```
ecommerce-clothing-app/
├── backend/
│   ├── config/          # Database configuration
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Utility functions
│   ├── uploads/         # Uploaded files
│   ├── .env             # Environment variables
│   └── server.js        # Entry point
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # Context API
│   │   └── utils/       # Utility functions
│   └── .env             # Environment variables
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ecommerce-clothing-app
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

4. Configure environment variables:

**Backend (.env):**
```
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
CLIENT_URL=http://localhost:3000
```

**Frontend (.env):**
```
REACT_APP_API_URL=http://localhost:5000/api
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend (in a new terminal):
```bash
cd frontend
npm start
```

3. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- POST `/api/auth/forgot-password` - Request password reset
- POST `/api/auth/reset-password/:token` - Reset password

### Products
- GET `/api/products` - Get all products (with filters)
- GET `/api/products/:id` - Get single product
- POST `/api/admin/products` - Create product (admin)
- PUT `/api/admin/products/:id` - Update product (admin)
- DELETE `/api/admin/products/:id` - Delete product (admin)

### Orders
- POST `/api/orders` - Create new order
- GET `/api/orders/:id` - Get order details
- GET `/api/orders/my-orders` - Get user's orders
- GET `/api/admin/orders` - Get all orders (admin)
- PUT `/api/admin/orders/:id/status` - Update order status (admin)

## Development Timeline

- **Phase 1:** Project Setup (Week 1)
- **Phase 2:** Authentication System (Week 1-2)
- **Phase 3-4:** Product Management & Admin Panel (Week 2-4)
- **Phase 5-6:** Customer Shopping & Cart (Week 4-6)
- **Phase 7-8:** Checkout & Orders (Week 6-8)
- **Phase 9-10:** Email & Additional Features (Week 8)
- **Phase 11-12:** Testing & Optimization (Week 9)
- **Phase 13-14:** Deployment & Launch (Week 10)

## Contributing

This is a learning project. Feel free to fork and experiment!

## License

MIT

## Contact

For questions or support, use the contact form on the website.
