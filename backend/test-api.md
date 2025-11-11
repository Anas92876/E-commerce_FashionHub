# Phase 3 API Testing Guide

## Prerequisites
- Server running on http://localhost:5000
- You need an admin user token for protected endpoints

---

## Category Endpoints

### 1. Get All Categories (Public)
```bash
curl http://localhost:5000/api/categories
```

### 2. Create Category (Admin Only)
```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "T-Shirts"
  }'
```

More categories to create:
- "Jeans"
- "Dresses"
- "Jackets"
- "Shoes"
- "Accessories"

### 3. Update Category (Admin Only)
```bash
curl -X PUT http://localhost:5000/api/categories/CATEGORY_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Updated Category Name"
  }'
```

### 4. Delete Category (Admin Only)
```bash
curl -X DELETE http://localhost:5000/api/categories/CATEGORY_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Product Endpoints

### 1. Get All Products (Public)
```bash
# Get all products
curl http://localhost:5000/api/products

# With pagination
curl "http://localhost:5000/api/products?page=1&limit=12"

# Filter by category
curl "http://localhost:5000/api/products?category=T-Shirts"

# Search by name
curl "http://localhost:5000/api/products?search=cotton"

# Sort by price (ascending)
curl "http://localhost:5000/api/products?sort=price-asc"

# Sort by price (descending)
curl "http://localhost:5000/api/products?sort=price-desc"

# Sort by newest
curl "http://localhost:5000/api/products?sort=newest"

# Combined filters
curl "http://localhost:5000/api/products?category=T-Shirts&sort=price-asc&page=1&limit=10"
```

### 2. Get Single Product (Public)
```bash
curl http://localhost:5000/api/products/PRODUCT_ID
```

### 3. Create Product (Admin Only)

#### Without Image:
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Classic Cotton T-Shirt",
    "description": "Comfortable cotton t-shirt perfect for everyday wear",
    "price": 29.99,
    "category": "T-Shirts",
    "sizes": ["S", "M", "L", "XL"],
    "stock": 100,
    "isActive": true
  }'
```

#### With Image (using form-data):
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "name=Classic Cotton T-Shirt" \
  -F "description=Comfortable cotton t-shirt perfect for everyday wear" \
  -F "price=29.99" \
  -F "category=T-Shirts" \
  -F "sizes=[\"S\",\"M\",\"L\",\"XL\"]" \
  -F "stock=100" \
  -F "isActive=true" \
  -F "image=@/path/to/your/image.jpg"
```

### 4. Update Product (Admin Only)

#### Without Image:
```bash
curl -X PUT http://localhost:5000/api/products/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Updated Product Name",
    "price": 34.99,
    "stock": 50
  }'
```

#### With Image:
```bash
curl -X PUT http://localhost:5000/api/products/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "name=Updated Product Name" \
  -F "price=34.99" \
  -F "stock=50" \
  -F "image=@/path/to/new/image.jpg"
```

### 5. Delete Product (Admin Only)
```bash
curl -X DELETE http://localhost:5000/api/products/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Sample Products to Create

### Product 1: Classic White T-Shirt
```json
{
  "name": "Classic White T-Shirt",
  "description": "Premium quality cotton t-shirt in classic white. Perfect for any occasion.",
  "price": 24.99,
  "category": "T-Shirts",
  "sizes": ["S", "M", "L", "XL", "XXL"],
  "stock": 150,
  "isActive": true
}
```

### Product 2: Slim Fit Jeans
```json
{
  "name": "Slim Fit Blue Jeans",
  "description": "Modern slim fit jeans with stretch comfort. Made from premium denim.",
  "price": 79.99,
  "category": "Jeans",
  "sizes": ["28", "30", "32", "34", "36"],
  "stock": 75,
  "isActive": true
}
```

### Product 3: Summer Dress
```json
{
  "name": "Floral Summer Dress",
  "description": "Light and breezy summer dress with beautiful floral pattern.",
  "price": 59.99,
  "category": "Dresses",
  "sizes": ["XS", "S", "M", "L", "XL"],
  "stock": 50,
  "isActive": true
}
```

### Product 4: Leather Jacket
```json
{
  "name": "Classic Leather Jacket",
  "description": "Genuine leather jacket with premium finish. Timeless style.",
  "price": 199.99,
  "category": "Jackets",
  "sizes": ["S", "M", "L", "XL"],
  "stock": 25,
  "isActive": true
}
```

---

## Testing Workflow

### Step 1: Register an Admin User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@fashionhub.com",
    "password": "Admin123!",
    "role": "admin"
  }'
```

### Step 2: Login to Get Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@fashionhub.com",
    "password": "Admin123!"
  }'
```

Save the token from the response!

### Step 3: Create Categories
Create all categories listed above using the token.

### Step 4: Create Products
Create products using the token.

### Step 5: Test Public Endpoints
Test all GET endpoints without token to verify public access.

### Step 6: Test Filters and Pagination
Test various query parameters for product listing.

---

## Expected Responses

### Success Response (Get Products):
```json
{
  "success": true,
  "count": 12,
  "total": 50,
  "page": 1,
  "pages": 5,
  "data": [...]
}
```

### Success Response (Get Categories):
```json
{
  "success": true,
  "count": 6,
  "data": [...]
}
```

### Error Response (Unauthorized):
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### Error Response (Not Found):
```json
{
  "success": false,
  "message": "Product not found"
}
```

---

## Notes

1. Replace `YOUR_ADMIN_TOKEN` with actual JWT token from login
2. Replace `PRODUCT_ID` and `CATEGORY_ID` with actual MongoDB ObjectIds
3. For image uploads, use actual file paths
4. Test in Postman for easier file uploads and token management
5. Images are served at: `http://localhost:5000/uploads/filename.jpg`

---

## Postman Collection

You can also import these as a Postman collection for easier testing.
