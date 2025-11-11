# Frontend Routes Explanation 🛣️

This document explains all the routes (URLs) in the FashionHub application and how they work.

---

## 📍 What are Routes?

Routes are the different URLs/pages in your application. For example:
- `http://localhost:3000/` → Home page
- `http://localhost:3000/login` → Login page
- `http://localhost:3000/admin/dashboard` → Admin dashboard

---

## 🏗️ Route Structure

### Public Routes (Anyone can access)
```
/                    → Home page
/login               → Login page
/register            → Register page
/products            → Products listing (Phase 5)
/products/:id        → Single product page (Phase 5)
/cart                → Shopping cart (Phase 6)
```

### Protected Routes (Must be logged in)
```
/profile             → User profile (Phase 8)
/orders              → User's orders (Phase 8)
/checkout            → Checkout page (Phase 8)
```

### Admin Routes (Must be logged in as admin)
```
/admin/dashboard              → Admin dashboard with statistics
/admin/products               → List all products (with search/filter)
/admin/products/add           → Add new product form
/admin/products/edit/:id      → Edit existing product
/admin/categories             → Manage categories
/admin/orders                 → View all orders (Phase 8)
```

---

## 🔐 How Route Protection Works

### 1. Public Routes
- **No protection needed**
- Anyone can access
- Example: Home, Login, Register

### 2. Admin Routes
- **Protected by AdminRoute component**
- Checks: Is user logged in? Is user an admin?
- If NO → Redirect to login or home page
- If YES → Show the admin page

**How AdminRoute works:**
```javascript
// In App.js
<Route path="/admin/dashboard" element={
  <AdminRoute>           // ← This checks if user is admin
    <Dashboard />        // ← Only shows if user is admin
  </AdminRoute>
} />
```

---

## 📱 Current Routes in App.js

### Existing Routes (Phase 2):
✅ `/` - Home page
✅ `/register` - Registration page
✅ `/login` - Login page

### Routes I Created (Phase 4) - Need to be added:
⚠️ `/admin/dashboard` - Admin dashboard
⚠️ `/admin/products` - Products list
⚠️ `/admin/products/add` - Add product
⚠️ `/admin/products/edit/:id` - Edit product
⚠️ `/admin/categories` - Manage categories

**Problem:** These routes exist as components but are **NOT added to App.js yet**!
**Solution:** I will update App.js now to add all these routes.

---

## 🎯 How to Access Admin Pages

### Step 1: Start the Frontend
```bash
cd frontend
npm start
```
Server will run on: `http://localhost:3000`

### Step 2: Login as Admin
1. Go to `http://localhost:3000/login`
2. Use admin credentials:
   - Email: `admin@fashionhub.com`
   - Password: `Admin123!`

### Step 3: Navigate to Admin Dashboard
After login, you can access:
- **Dashboard:** `http://localhost:3000/admin/dashboard`
- **Products:** `http://localhost:3000/admin/products`
- **Add Product:** `http://localhost:3000/admin/products/add`
- **Categories:** `http://localhost:3000/admin/categories`

---

## 📂 Route Configuration in App.js

Here's what App.js should look like (I'm updating it now):

```javascript
import { Routes, Route } from 'react-router-dom';
import AdminRoute from './components/AdminRoute';

// Public pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin pages
import Dashboard from './pages/admin/Dashboard';
import ProductsList from './pages/admin/ProductsList';
import AddProduct from './pages/admin/AddProduct';
import EditProduct from './pages/admin/EditProduct';
import Categories from './pages/admin/Categories';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin Routes - Protected */}
      <Route path="/admin/dashboard" element={
        <AdminRoute><Dashboard /></AdminRoute>
      } />

      <Route path="/admin/products" element={
        <AdminRoute><ProductsList /></AdminRoute>
      } />

      <Route path="/admin/products/add" element={
        <AdminRoute><AddProduct /></AdminRoute>
      } />

      <Route path="/admin/products/edit/:id" element={
        <AdminRoute><EditProduct /></AdminRoute>
      } />

      <Route path="/admin/categories" element={
        <AdminRoute><Categories /></AdminRoute>
      } />
    </Routes>
  );
}
```

---

## 🔍 Route Parameters

Some routes have **dynamic parameters** (variables in the URL):

### Example: Edit Product Route
```
/admin/products/edit/:id
                      ↑
                This is a parameter
```

**Real URL examples:**
- `/admin/products/edit/6904a2389812ac1379f3a397` ← Editing product with ID ending in 397
- `/admin/products/edit/6904a2389812ac1379f3a398` ← Editing product with ID ending in 398

**How to use in component:**
```javascript
import { useParams } from 'react-router-dom';

function EditProduct() {
  const { id } = useParams();  // ← Gets the ID from URL
  // Now you can fetch product data using this ID
}
```

---

## 🚀 Navigation Methods

### Method 1: Using Links (Recommended)
```javascript
import { Link } from 'react-router-dom';

<Link to="/admin/dashboard">Go to Dashboard</Link>
```

### Method 2: Programmatic Navigation
```javascript
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();

  const goToDashboard = () => {
    navigate('/admin/dashboard');
  };

  return <button onClick={goToDashboard}>Dashboard</button>;
}
```

### Method 3: Direct URL (In browser)
Just type in the browser: `http://localhost:3000/admin/dashboard`

---

## 🎨 Sidebar Navigation (AdminLayout)

The AdminLayout component has a sidebar with navigation links:

```javascript
<Link to="/admin/dashboard">
  <span className="nav-icon">📊</span>
  <span className="nav-text">Dashboard</span>
</Link>

<Link to="/admin/products">
  <span className="nav-icon">📦</span>
  <span className="nav-text">All Products</span>
</Link>

<Link to="/admin/products/add">
  <span className="nav-icon">➕</span>
  <span className="nav-text">Add Product</span>
</Link>

<Link to="/admin/categories">
  <span className="nav-icon">🏷️</span>
  <span className="nav-text">Manage Categories</span>
</Link>
```

When you click these links, React Router changes the URL and shows the corresponding page **without refreshing** the browser!

---

## 🐛 Troubleshooting

### Problem: "Cannot GET /admin/dashboard"
**Reason:** React Router needs to be running (npm start)
**Solution:** Make sure React app is running on port 3000

### Problem: "Page redirects to login"
**Reason:** Not logged in as admin
**Solution:** Login with admin credentials first

### Problem: "Page shows 404 or blank"
**Reason:** Route not added to App.js
**Solution:** Check App.js has the route configured

### Problem: "AdminRoute is not defined"
**Reason:** Import missing in App.js
**Solution:** Add `import AdminRoute from './components/AdminRoute';`

---

## 📊 Route Flow Diagram

```
User visits URL
      ↓
React Router matches URL to Route
      ↓
Is route protected? (AdminRoute?)
      ↓
   YES → Check if user is admin
   ↓               ↓
   YES            NO
   ↓               ↓
Show page      Redirect to /login
```

---

## ✅ Next Steps

1. ✅ I will update App.js to add all admin routes
2. ✅ I will create temporary placeholder pages for missing components
3. ✅ You will be able to access `/admin/dashboard` immediately
4. ✅ All navigation links in sidebar will work

---

## 🎯 Summary

**What I created:**
- ✅ Dashboard component
- ✅ ProductsList component
- ✅ AdminLayout component
- ✅ AdminRoute component

**What's missing:**
- ⚠️ Routes in App.js (I'm fixing this NOW!)

**After I update App.js, you can:**
1. Login as admin
2. Visit `http://localhost:3000/admin/dashboard`
3. See beautiful admin dashboard
4. Click sidebar links to navigate between pages

---

Let me update App.js now! 🚀
