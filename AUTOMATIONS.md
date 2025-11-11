# Cobra Market - Automation Guide

This document outlines various automations that can be implemented to streamline development, testing, deployment, and maintenance of the Cobra Market e-commerce platform.

---

## Table of Contents
1. [Development Automations](#development-automations)
2. [Database Automations](#database-automations)
3. [Testing Automations](#testing-automations)
4. [Deployment Automations](#deployment-automations)
5. [Monitoring & Maintenance](#monitoring--maintenance)
6. [Security Automations](#security-automations)
7. [Marketing Automations](#marketing-automations)

---

## Development Automations

### 1. Git Hooks with Husky
**Purpose**: Automate code quality checks before commits

**Setup**:
```bash
npm install --save-dev husky lint-staged

# Initialize Husky
npx husky-init
```

**Configuration** (`.husky/pre-commit`):
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run linting
npm run lint

# Run tests
npm test

# Format code
npm run format
```

**Benefits**:
- ✅ Prevents bad code from being committed
- ✅ Ensures consistent code formatting
- ✅ Catches errors early

---

### 2. Auto Code Formatting
**Purpose**: Automatically format code on save

**Setup** (Prettier):
```bash
npm install --save-dev prettier eslint-config-prettier

# Create .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

**VSCode Settings** (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

---

### 3. Hot Module Replacement (HMR)
**Status**: ✅ Already Implemented
**Location**: Frontend uses React Fast Refresh

**Benefits**:
- Updates code without full page reload
- Preserves application state during development

---

## Database Automations

### 1. Automated Database Seeding
**Status**: ✅ Partially Implemented
**Location**: `backend/scripts/seedReviews.js`

**Additional Seeds to Create**:

#### Products Seeder
```javascript
// backend/scripts/seedProducts.js
const seedProducts = async () => {
  const products = [
    { name: 'Product 1', price: 99.99, category: 'clothing' },
    // Add more products
  ];
  await Product.insertMany(products);
};
```

#### Users Seeder
```javascript
// backend/scripts/seedUsers.js
const seedUsers = async () => {
  const users = [
    { email: 'admin@cobra.com', role: 'admin' },
    { email: 'customer@cobra.com', role: 'customer' },
  ];
  await User.insertMany(users);
};
```

**Run All Seeds**:
```bash
npm run seed:all
```

---

### 2. Database Backup Automation
**Purpose**: Automated daily backups

**Setup** (Windows Task Scheduler):
```bash
# Create backup script: backup-db.bat
@echo off
mongodump --uri="mongodb://localhost:27017/ecommerce" --out="backups/%date:~-4,4%%date:~-10,2%%date:~-7,2%"
```

**Schedule**: Daily at 2:00 AM

---

### 3. Database Migration Scripts
**Purpose**: Version control for database schema

**Setup**:
```bash
npm install --save-dev migrate-mongo

# Create migration
npx migrate-mongo create add-product-rating-field
```

---

## Testing Automations

### 1. Automated Unit Tests
**Purpose**: Test individual components and functions

**Setup**:
```bash
# Frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom

# Backend
npm install --save-dev jest supertest
```

**Example Test** (`backend/tests/product.test.js`):
```javascript
describe('Product API', () => {
  test('GET /api/products returns products', async () => {
    const response = await request(app).get('/api/products');
    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();
  });
});
```

**Run Tests**:
```bash
npm test
npm run test:watch  # Watch mode
npm run test:coverage  # Coverage report
```

---

### 2. Automated Integration Tests
**Purpose**: Test API endpoints end-to-end

**Setup**:
```bash
npm install --save-dev cypress
```

**Example Test** (`cypress/e2e/login.cy.js`):
```javascript
describe('Login Flow', () => {
  it('should login successfully', () => {
    cy.visit('/login');
    cy.get('#email').type('test@example.com');
    cy.get('#password').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/');
  });
});
```

---

### 3. Continuous Testing with GitHub Actions
**Purpose**: Run tests on every push/PR

**Setup** (`.github/workflows/test.yml`):
```yaml
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
```

---

## Deployment Automations

### 1. CI/CD Pipeline
**Purpose**: Automated deployment on successful tests

**Setup** (`.github/workflows/deploy.yml`):
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build Frontend
        run: |
          cd frontend
          npm install
          npm run build
      - name: Deploy to Server
        run: |
          # SSH to server and deploy
          scp -r build/ user@server:/var/www/cobra-market
```

---

### 2. Docker Automation
**Purpose**: Containerize application for easy deployment

**Setup** (`Dockerfile`):
```dockerfile
# Frontend Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

**Docker Compose** (`docker-compose.yml`):
```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGO_URI=mongodb://mongo:27017/ecommerce
  mongo:
    image: mongo:5
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

---

### 3. Automated Environment Configuration
**Purpose**: Auto-load environment variables

**Setup** (`backend/scripts/setup-env.js`):
```javascript
const fs = require('fs');

const envTemplate = `
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=${generateRandomSecret()}
`;

fs.writeFileSync('.env', envTemplate);
console.log('✅ Environment file created!');
```

---

## Monitoring & Maintenance

### 1. Error Tracking with Sentry
**Purpose**: Automatically track and report errors

**Setup**:
```bash
npm install @sentry/react @sentry/node
```

**Frontend Integration** (`src/index.js`):
```javascript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: process.env.NODE_ENV,
});
```

---

### 2. Performance Monitoring
**Purpose**: Track application performance metrics

**Tools**:
- Google Analytics
- New Relic
- Datadog

**Setup** (Google Analytics):
```javascript
// Add to frontend/public/index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
```

---

### 3. Automated Health Checks
**Purpose**: Monitor server uptime

**Setup** (`backend/routes/health.js`):
```javascript
router.get('/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    uptime: process.uptime(),
  });
});
```

**Cron Job** (Check every 5 minutes):
```bash
*/5 * * * * curl https://your-api.com/api/health
```

---

### 4. Log Rotation
**Purpose**: Automatically rotate and compress logs

**Setup** (Winston + Winston-Daily-Rotate-File):
```javascript
const winston = require('winston');
require('winston-daily-rotate-file');

const logger = winston.createLogger({
  transports: [
    new winston.transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});
```

---

## Security Automations

### 1. Dependency Vulnerability Scanning
**Purpose**: Scan for security vulnerabilities

**Setup**:
```bash
# Run npm audit
npm audit

# Fix automatically
npm audit fix

# Use Snyk for advanced scanning
npm install -g snyk
snyk test
```

**GitHub Integration**:
Enable Dependabot in repository settings to get automated PRs for dependency updates.

---

### 2. SSL Certificate Auto-Renewal
**Purpose**: Auto-renew SSL certificates with Let's Encrypt

**Setup** (Certbot):
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Auto-renewal cron job
0 0 * * * certbot renew --quiet
```

---

### 3. Rate Limiting
**Status**: Should be implemented
**Purpose**: Prevent API abuse

**Setup** (`backend/middleware/rateLimiter.js`):
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
});

app.use('/api/', limiter);
```

---

## Marketing Automations

### 1. Customer Email Notifications System
**Purpose**: Automated email notifications to keep customers informed throughout their shopping journey

#### Email Notification Types:

##### A. Order-Related Notifications
**1. Order Confirmation Email**
- **Trigger**: Immediately after order is placed
- **Content**: Order details, items, total, estimated delivery
- **Priority**: High

**2. Order Processing Email**
- **Trigger**: When order status changes to "Processing"
- **Content**: Order is being prepared, tracking will be provided soon

**3. Order Shipped Email**
- **Trigger**: When order is shipped
- **Content**: Tracking number, carrier info, estimated delivery date
- **Action**: Link to track package

**4. Out for Delivery Email**
- **Trigger**: When package is out for delivery
- **Content**: Expected delivery today notification

**5. Order Delivered Email**
- **Trigger**: When order is marked as delivered
- **Content**: Delivery confirmation, request for review
- **Action**: "Review Your Purchase" button

**6. Order Cancelled Email**
- **Trigger**: When order is cancelled
- **Content**: Cancellation details, refund information

##### B. Account-Related Notifications
**1. Welcome Email**
- **Trigger**: New user registration
- **Content**: Welcome message, account benefits, first purchase discount code
- **Action**: "Start Shopping" CTA

**2. Email Verification**
- **Trigger**: Account creation or email change
- **Content**: Verification link
- **Expiry**: 24 hours

**3. Password Reset Email**
- **Trigger**: User requests password reset
- **Content**: Secure reset link
- **Expiry**: 1 hour
- **Security**: Include warning about not sharing link

**4. Password Changed Confirmation**
- **Trigger**: After successful password change
- **Content**: Confirmation + security notice
- **Action**: "Report if you didn't make this change"

**5. Account Login from New Device**
- **Trigger**: Login from unrecognized device/location
- **Content**: Security alert, device details, location

##### C. Cart & Wishlist Notifications
**1. Abandoned Cart Reminder (1 hour)**
- **Trigger**: 1 hour after items left in cart
- **Content**: "You left something behind" + cart items

**2. Abandoned Cart Follow-up (24 hours)**
- **Trigger**: 24 hours after cart abandonment
- **Content**: Cart items + 10% discount code
- **Urgency**: "Limited time offer"

**3. Abandoned Cart Final Reminder (72 hours)**
- **Trigger**: 3 days after cart abandonment
- **Content**: Last chance notification
- **Incentive**: Free shipping code

**4. Wishlist Item Price Drop**
- **Trigger**: When wishlist item price decreases
- **Content**: Original price vs new price
- **Action**: "Buy Now at Lower Price"

**5. Wishlist Item Back in Stock**
- **Trigger**: When out-of-stock wishlist item is restocked
- **Content**: "Your favorite item is back!"
- **Urgency**: "Limited quantity available"

##### D. Product & Promotional Notifications
**1. New Arrival Notification**
- **Trigger**: Weekly (if customer opted in)
- **Content**: Latest products matching customer preferences

**2. Sale/Discount Alerts**
- **Trigger**: Special sales or promotions
- **Content**: Sale details, discount codes
- **Segment**: Based on customer category/history

**3. Personalized Recommendations**
- **Trigger**: Weekly (based on browsing/purchase history)
- **Content**: "You might also like" products

**4. Birthday Special Offer**
- **Trigger**: Customer's birthday
- **Content**: Birthday wishes + special discount code
- **Incentive**: 20% off birthday discount

**5. Anniversary Email**
- **Trigger**: Customer account anniversary
- **Content**: Thank you message + loyalty reward

##### E. Review & Feedback Notifications
**1. Product Review Request**
- **Trigger**: 3 days after delivery
- **Content**: Request for product review
- **Incentive**: 5% off next purchase for leaving review

**2. Review Response Notification**
- **Trigger**: When admin responds to customer review
- **Content**: Admin response to their review

##### F. Customer Service Notifications
**1. Support Ticket Created**
- **Trigger**: When customer creates support ticket
- **Content**: Ticket number, expected response time

**2. Support Ticket Update**
- **Trigger**: When support agent responds
- **Content**: Response message, ticket status

**3. Support Ticket Resolved**
- **Trigger**: When ticket is marked as resolved
- **Content**: Resolution summary, satisfaction survey

**4. Refund Initiated**
- **Trigger**: When refund is processed
- **Content**: Refund amount, processing time

**5. Refund Completed**
- **Trigger**: When refund hits customer account
- **Content**: Confirmation of refund completion

##### G. Inventory & Restock Notifications
**1. Low Stock Alert**
- **Trigger**: When viewed/carted item has low stock (< 5 items)
- **Content**: "Only X left in stock"
- **Urgency**: Encourages quick purchase

**2. Restock Notification**
- **Trigger**: When customer signs up for restock alerts
- **Content**: Item is back in stock
- **Action**: Direct purchase link

##### H. Loyalty & Rewards Notifications
**1. Points Earned**
- **Trigger**: After each purchase
- **Content**: Points earned, total points balance

**2. Reward Unlocked**
- **Trigger**: When customer reaches reward threshold
- **Content**: Reward details, how to redeem

**3. Points Expiring Soon**
- **Trigger**: 30 days before points expire
- **Content**: Expiring points amount, redemption suggestions

#### Implementation with Nodemailer

**Setup** (`backend/config/email.js`):
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Email Templates
const emailTemplates = {
  orderConfirmation: (order, user) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .order-items { margin: 20px 0; }
        .item { border-bottom: 1px solid #eee; padding: 10px 0; }
        .total { font-size: 20px; font-weight: bold; margin-top: 20px; }
        .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmation</h1>
          <p>Thank you for your purchase!</p>
        </div>
        <div class="content">
          <p>Hi ${user.firstName},</p>
          <p>Your order #${order._id} has been confirmed and is being processed.</p>

          <div class="order-items">
            <h3>Order Details:</h3>
            ${order.items.map(item => `
              <div class="item">
                <strong>${item.name}</strong><br>
                Quantity: ${item.quantity} × $${item.price} = $${item.quantity * item.price}
              </div>
            `).join('')}
          </div>

          <div class="total">
            Total: $${order.totalAmount}
          </div>

          <p><strong>Shipping Address:</strong><br>
          ${order.shippingAddress.street}<br>
          ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}</p>

          <p><strong>Estimated Delivery:</strong> ${order.estimatedDelivery}</p>

          <a href="${process.env.FRONTEND_URL}/orders/${order._id}" class="button">Track Your Order</a>

          <p>If you have any questions, please contact our support team.</p>

          <p>Best regards,<br>Cobra Market Team</p>
        </div>
      </div>
    </body>
    </html>
  `,

  orderShipped: (order, user, tracking) => `...`,
  welcomeEmail: (user) => `...`,
  passwordReset: (user, resetLink) => `...`,
  abandonedCart: (cart, user, discountCode) => `...`,
  // Add more templates
};

// Send Email Function
const sendEmail = async (to, subject, template, data) => {
  try {
    const info = await transporter.sendMail({
      from: '"Cobra Market" <noreply@cobramarket.com>',
      to: to,
      subject: subject,
      html: template(data),
    });

    console.log(`✅ Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail, emailTemplates };
```

**Usage in Controllers** (`backend/controllers/orderController.js`):
```javascript
const { sendEmail, emailTemplates } = require('../config/email');

// After order creation
exports.createOrder = async (req, res) => {
  try {
    const order = await Order.create(orderData);

    // Send order confirmation email
    await sendEmail(
      req.user.email,
      `Order Confirmation #${order._id}`,
      emailTemplates.orderConfirmation,
      { order, user: req.user }
    );

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// When order status changes
exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id).populate('user');

  order.status = status;
  await order.save();

  // Send appropriate email based on status
  if (status === 'Shipped') {
    await sendEmail(
      order.user.email,
      'Your Order Has Been Shipped!',
      emailTemplates.orderShipped,
      { order, user: order.user, tracking: order.trackingNumber }
    );
  }

  res.json({ success: true, data: order });
};
```

#### Email Notification Preferences
Allow customers to control which emails they receive:

**Database Schema** (`User` model):
```javascript
emailPreferences: {
  orderUpdates: { type: Boolean, default: true },
  promotional: { type: Boolean, default: true },
  newArrivals: { type: Boolean, default: false },
  priceDrops: { type: Boolean, default: true },
  backInStock: { type: Boolean, default: true },
  reviewRequests: { type: Boolean, default: true },
  newsletter: { type: Boolean, default: false },
}
```

**User Can Update Preferences** via Account Settings page.

---

### 2. Abandoned Cart Recovery
**Purpose**: Send reminder emails for abandoned carts

**Setup**:
```javascript
// Cron job runs every hour
cron.schedule('0 * * * *', async () => {
  const abandonedCarts = await Cart.find({
    updatedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    items: { $exists: true, $ne: [] },
  });

  abandonedCarts.forEach(cart => {
    sendAbandonedCartEmail(cart);
  });
});
```

---

### 3. Product Recommendation Engine
**Purpose**: Automated personalized recommendations

**Logic**:
- Based on browsing history
- Based on purchase history
- Similar products
- Trending products

---

### 4. Inventory Alerts
**Purpose**: Alert when stock is low

**Setup**:
```javascript
cron.schedule('0 9 * * *', async () => {
  const lowStockProducts = await Product.find({ stock: { $lt: 10 } });

  if (lowStockProducts.length > 0) {
    sendAdminAlert('Low Stock Alert', lowStockProducts);
  }
});
```

---

## Quick Start Automation Scripts

### Master Setup Script
Create `setup.sh` in root:
```bash
#!/bin/bash
echo "🚀 Setting up Cobra Market..."

# Install backend dependencies
cd backend
npm install
cp .env.example .env
echo "✅ Backend setup complete"

# Install frontend dependencies
cd ../frontend
npm install
echo "✅ Frontend setup complete"

# Seed database
cd ../backend
npm run seed:all
echo "✅ Database seeded"

echo "🎉 Setup complete! Run 'npm run dev' in both folders to start."
```

### Development Start Script
Create `dev.sh` in root:
```bash
#!/bin/bash
# Start backend and frontend concurrently
concurrently "cd backend && npm run dev" "cd frontend && npm start"
```

---

## Recommended Implementation Priority

### Phase 1 (Immediate)
1. ✅ Git Hooks (Husky)
2. ✅ Code Formatting (Prettier)
3. ✅ Environment Configuration
4. ✅ Database Seeding Scripts

### Phase 2 (Short-term)
1. ⏳ Unit & Integration Tests
2. ⏳ Error Tracking (Sentry)
3. ⏳ Rate Limiting
4. ⏳ Automated Backups

### Phase 3 (Medium-term)
1. ⏳ CI/CD Pipeline
2. ⏳ Docker Containerization
3. ⏳ Email Automations
4. ⏳ Performance Monitoring

### Phase 4 (Long-term)
1. ⏳ Abandoned Cart Recovery
2. ⏳ Product Recommendations
3. ⏳ Advanced Analytics
4. ⏳ A/B Testing Automation

---

## Conclusion

Implementing these automations will:
- 🚀 **Improve Development Speed**: Less manual work, more coding
- 🛡️ **Enhance Security**: Automated vulnerability scanning and updates
- 📊 **Better Monitoring**: Know what's happening in your application
- 💰 **Increase Revenue**: Automated marketing and cart recovery
- 🐛 **Fewer Bugs**: Automated testing catches issues early
- 😊 **Happier Users**: Faster response times and better experience

Start with Phase 1 automations and gradually implement others as your application grows!

---

**Last Updated**: 2025-11-09
**Maintainer**: Cobra Market Development Team
