# How to Access Admin Dashboard 🚀

## ✅ Step-by-Step Guide

### Step 1: Make Sure Backend is Running
The backend should already be running from before:
```bash
# If not running, start it:
cd backend
npm run dev
```
✅ Should show: "Server running in development mode on port 5000"

---

### Step 2: Start the Frontend
Open a **NEW terminal** (keep backend running) and run:
```bash
cd frontend
npm start
```

Wait for it to compile and open browser automatically at:
```
http://localhost:3000
```

---

### Step 3: Login as Admin

1. **Go to Login Page:**
   - Click "Login" link or go to: `http://localhost:3000/login`

2. **Use Admin Credentials:**
   ```
   Email: admin@fashionhub.com
   Password: Admin123!
   ```

3. **Click Login Button**

---

### Step 4: Access Admin Dashboard

After login, you can access the admin panel in two ways:

**Method 1: Type URL Directly**
```
http://localhost:3000/admin/dashboard
```

**Method 2: Modify Home.js to add a link** (optional)
You can add a button on the home page that links to admin dashboard.

---

## 📍 Available Admin Routes

After logging in as admin, these URLs will work:

| URL | Page | Status |
|-----|------|--------|
| `/admin/dashboard` | Admin Dashboard | ✅ Working |
| `/admin/products` | Products List | ✅ Working |
| `/admin/products/add` | Add Product | ⏳ Next |
| `/admin/products/edit/:id` | Edit Product | ⏳ Next |
| `/admin/categories` | Manage Categories | ⏳ Next |

---

## 🎯 What You Should See

### 1. Admin Dashboard (`/admin/dashboard`)
- **Top Bar:** FashionHub Admin, your name, Logout button
- **Sidebar:** Navigation menu with icons
  - 📊 Dashboard
  - 📦 All Products
  - ➕ Add Product
  - 🏷️ Manage Categories
- **Main Content:**
  - 4 statistics cards (Products, Categories, Orders, Revenue)
  - Quick actions buttons
  - Welcome message

### 2. Products List (`/admin/products`)
- **Search bar** to search products
- **Category filter** dropdown
- **Products table** showing:
  - Product image
  - Name
  - Category
  - Price
  - Stock
  - Status (Active/Inactive)
  - Actions (Edit/Delete buttons)
- **Pagination** at bottom

---

## 🐛 Troubleshooting

### Problem: Frontend won't start
**Error:** "Cannot find module './pages/admin/Dashboard'"
**Solution:** Make sure these files exist:
- `src/components/AdminRoute.js`
- `src/components/AdminLayout.js`
- `src/pages/admin/Dashboard.js`
- `src/pages/admin/ProductsList.js`

### Problem: "Cannot GET /admin/dashboard"
**Reason:** React app is not running
**Solution:** Run `npm start` in frontend folder

### Problem: Redirects to login when accessing admin page
**Reason:** Not logged in or not an admin
**Solution:** Login with admin credentials first

### Problem: Blank page or loading forever
**Reason:** Backend is not running
**Solution:** Start backend server

### Problem: "Network Error" or API errors
**Check:**
1. Backend running on port 5000? ✅
2. Frontend running on port 3000? ✅
3. `.env` file in frontend has correct API URL? ✅
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

---

## 🎨 Testing the Features

Once you're in the admin dashboard, try these:

### Test 1: View Statistics
- Dashboard should show:
  - Total Products: 13
  - Categories: 7
  - Orders: 0 (placeholder)
  - Revenue: $0 (placeholder)

### Test 2: Navigate Using Sidebar
- Click "📦 All Products" in sidebar
- Should navigate to `/admin/products`
- Should see table with all products

### Test 3: Search Products
- On Products page, type "leather" in search box
- Should filter to show only leather products (3 items)

### Test 4: Filter by Category
- Select "T-Shirts" from category dropdown
- Should show only t-shirt products (2 items)

### Test 5: Delete Product
- Click 🗑️ (delete) button on any product
- Should ask for confirmation
- After confirming, product should be deleted
- Table should refresh automatically

### Test 6: Logout
- Click "Logout" button in top right
- Should redirect to login page
- Try accessing `/admin/dashboard` again
- Should redirect back to login (route protection working!)

---

## 📱 Mobile Responsive

The admin panel is mobile-friendly!

**To test:**
1. Press F12 to open browser DevTools
2. Click "Toggle device toolbar" icon (or Ctrl+Shift+M)
3. Select a mobile device (e.g., iPhone 12)

**What to look for:**
- Sidebar hidden by default
- "☰" menu button visible
- Click menu button → sidebar slides in
- All cards stack vertically
- Table scrolls horizontally if needed

---

## 🎉 Success Checklist

After following the steps, you should have:

- ✅ Backend running on port 5000
- ✅ Frontend running on port 3000
- ✅ Logged in as admin
- ✅ Can access `/admin/dashboard`
- ✅ See beautiful dashboard with statistics
- ✅ Can navigate to `/admin/products`
- ✅ See products table with data
- ✅ Can search and filter products
- ✅ Can delete products
- ✅ Sidebar navigation works
- ✅ Logout works

---

## 📸 What It Should Look Like

### Dashboard:
- Modern, clean interface
- Purple/blue gradient cards
- Sidebar with dark background (#34495e)
- Top bar with user name and logout

### Products Page:
- Search and filter controls at top
- Nice table with alternating row colors
- Product images displayed
- Color-coded badges for stock levels
- Edit and delete buttons with icons

---

## 🚀 Next Steps

Once everything works:
1. ✅ Test all features
2. ⏳ I'll create Add Product page
3. ⏳ I'll create Edit Product page
4. ⏳ I'll create Categories management page
5. ✅ Phase 4 will be complete!

---

## 💡 Quick Tips

### Adding a Dashboard Link to Home Page

If you want to easily access the dashboard from the home page, you can add this to `src/pages/Home.js`:

```javascript
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function Home() {
  const { user, isAdmin } = useAuth();

  return (
    <div>
      <h1>Welcome to FashionHub</h1>

      {/* Show admin link only if user is admin */}
      {isAdmin() && (
        <Link to="/admin/dashboard" className="admin-link">
          Go to Admin Dashboard
        </Link>
      )}
    </div>
  );
}
```

This way, admins will see a link to the dashboard on the home page!

---

**Ready to test? Start the frontend and login!** 🎉
