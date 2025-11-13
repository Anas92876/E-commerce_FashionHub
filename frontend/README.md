# Frontend - E-Commerce Clothing Application

React-based frontend for a modern e-commerce clothing store with variant management system.

## Tech Stack

- **React** 18.2.0 - UI Framework
- **React Router DOM** 6.18.0 - Client-side routing
- **Tailwind CSS** 3.3.5 - Utility-first CSS framework
- **Framer Motion** 10.16.5 - Animation library
- **Axios** 1.6.2 - HTTP client
- **Heroicons** 2.0.18 - Icon library
- **React Hot Toast** 2.4.1 - Toast notifications

## Project Structure

```
frontend/src/
├── components/          # Reusable components
│   ├── AdminLayout.js   # Admin panel layout wrapper
│   ├── AdminRoute.js    # Protected route for admin
│   ├── Badge.js         # Badge component
│   ├── Button.js        # Button component
│   ├── EmptyState.js    # Empty state component
│   ├── Footer.js        # Footer component
│   ├── LazyImage.js     # Lazy loading image component
│   ├── LoadingSpinner.js # Loading spinner
│   ├── Navbar.js        # Navigation bar
│   ├── skeletons/       # Loading skeleton components
│   │   ├── index.js
│   │   ├── DashboardSkeleton.js
│   │   ├── OrderCardSkeleton.js
│   │   ├── ProductCardSkeleton.js
│   │   ├── ProductDetailsSkeleton.js
│   │   └── ProfileSkeleton.js
│   └── VariantSelector/ # Product variant selection
│       ├── index.js
│       ├── ColorSelector.js
│       ├── SizeSelector.js
│       ├── VariantSelector.js
│       └── VariantSelector.css
│
├── context/             # React Context providers
│   ├── AuthContext.js   # Authentication context
│   └── CartContext.js   # Shopping cart context
│
├── pages/               # Page components
│   ├── auth/            # Authentication pages
│   │   ├── Login.js
│   │   └── Register.js
│   │
│   ├── customer/        # Customer-facing pages
│   │   ├── Cart.js
│   │   ├── Checkout.js
│   │   ├── MyOrders.js
│   │   ├── ProductDetails.js
│   │   ├── Products.js
│   │   └── Profile.js
│   │
│   ├── admin/           # Admin panel pages
│   │   ├── AddProduct.js
│   │   ├── Categories.js
│   │   ├── Dashboard.js
│   │   ├── EditProduct.js
│   │   ├── Messages.js
│   │   ├── Orders.js
│   │   ├── ProductsList.js
│   │   ├── Settings.js
│   │   ├── Users.js
│   │   └── ProductForm.css
│   │
│   ├── Contact.js       # Contact page
│   ├── Contact.css
│   ├── Home.js          # Homepage
│   ├── Home.css
│   ├── NotFound.js      # 404 page
│   └── NotFound.css
│
├── utils/               # Utility functions
│   └── unsplash.js      # Unsplash image utilities
│
├── App.js               # Main app component with routes
├── index.js             # Entry point
├── index.css            # Global styles
└── reportWebVitals.js   # Performance monitoring

```

## Features

### Customer Features
- **Product Browsing**: Browse products with filtering and search
- **Product Variants**: Select color and size variants
- **Shopping Cart**: Add/remove items, update quantities
- **Checkout**: Complete orders with shipping information
- **Order History**: View past orders and their status
- **User Profile**: Manage account information
- **Authentication**: Login and registration

### Admin Features
- **Dashboard**: Overview statistics and analytics
- **Product Management**:
  - Add products (Simple or Variant-based)
  - Edit existing products
  - Manage product variants (colors, sizes, pricing)
  - Upload product images
- **Category Management**: Create and manage product categories
- **Order Management**: View and update order statuses
- **User Management**: Manage users and roles
- **Messages**: View contact form submissions
- **Settings**: Configure application settings

## Product System

### Simple Products (Legacy)
- Single price point
- Single stock quantity
- No size selection
- One image

### Variant Products (Modern)
- Multiple color variants
- Each color has:
  - Individual price
  - Individual stock
  - Multiple images
  - Size availability
- Size types: Clothing, Jeans, Shoes, Kids

## Setup & Installation

### Prerequisites
- Node.js 14+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (optional):
```env
REACT_APP_API_URL=http://localhost:5000
```

3. Start development server:
```bash
npm start
```

The app will run on `http://localhost:3000`

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (irreversible)

## API Integration

All API calls use Axios and connect to the backend at `http://localhost:5000/api`

### API Endpoints Used

**Authentication:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

**Products:**
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

**Categories:**
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

**Orders:**
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `GET /api/orders/all` - Get all orders (admin)
- `PUT /api/orders/:id` - Update order status (admin)

**Users:**
- `GET /api/users` - Get all users (admin)
- `PUT /api/users/:id/role` - Update user role (admin)
- `DELETE /api/users/:id` - Delete user (admin)

**Contact:**
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get messages (admin)

**Reviews:**
- `GET /api/reviews/product/:productId` - Get product reviews
- `POST /api/reviews` - Create review

## State Management

### AuthContext
Manages user authentication state:
- Current user data
- Login/logout functions
- Token management (localStorage)
- Admin role checking

### CartContext
Manages shopping cart state:
- Cart items (localStorage)
- Add/remove/update item functions
- Cart total calculation
- Clear cart function

## Styling

- **Tailwind CSS** for utility-based styling
- **Custom CSS** for specific components (Home, Contact, NotFound, ProductForm, VariantSelector)
- **Framer Motion** for animations
- **Responsive design** for mobile, tablet, and desktop

## Image Handling

- **LazyImage component** with loading states
- **Unsplash integration** for placeholder images
- **Multi-image support** for product variants
- Images served from backend `/uploads` directory

## Authentication Flow

1. User registers or logs in
2. JWT token received from backend
3. Token stored in localStorage
4. Token sent in Authorization header for protected routes
5. AuthContext provides user data across app
6. AdminRoute component protects admin pages

## Build & Deployment

Build for production:
```bash
npm run build
```

This creates optimized production files in `build/` directory.

Deploy the `build/` folder to any static hosting service:
- Vercel (Recommended)
- GitHub Pages
- AWS S3 + CloudFront

## Environment Variables

Optional environment variables:
- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:5000)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimization

- Lazy loading images
- Code splitting with React.lazy (can be added)
- Skeleton loaders for better UX
- Debounced search (can be added)
- Memoization for expensive calculations (can be added)

## Known Issues & Warnings

ESLint warnings for unused variables (non-breaking):
- `AddProduct.js`: Unused size-related variables
- `EditProduct.js`: Unused size-related variables
- `Register.js`: Unused UserCircleIcon
- `Navbar.js`: Unused icons

These warnings don't affect functionality and can be cleaned up.

## Contributing

1. Follow React best practices
2. Use Tailwind CSS for styling
3. Keep components small and focused
4. Use functional components with hooks
5. Add PropTypes or TypeScript (future)
6. Test on multiple browsers

## License

MIT License
