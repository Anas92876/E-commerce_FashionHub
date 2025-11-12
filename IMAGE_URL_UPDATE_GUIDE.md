# Image URL Update Guide

## Problem
Your frontend currently uses hardcoded `http://localhost:5000` for image URLs, which won't work in production.

## Solution
I've created a helper function `getImageUrl()` in `frontend/src/utils/api.js` that automatically handles image URLs based on environment variables.

## Files That Need Updating

The following files currently use `http://localhost:5000` and should be updated:

1. `frontend/src/pages/Home.js`
2. `frontend/src/pages/customer/Products.js`
3. `frontend/src/pages/customer/ProductDetails.js`
4. `frontend/src/pages/customer/Cart.js`
5. `frontend/src/pages/customer/MyOrders.js`
6. `frontend/src/pages/customer/Checkout.js`
7. `frontend/src/pages/admin/Categories.js`
8. `frontend/src/pages/admin/EditProduct.js`
9. `frontend/src/components/VariantSelector/ColorSelector.js`

## How to Update

### Step 1: Import the helper function

Add this import at the top of each file:
```javascript
import { getImageUrl } from '../../utils/api';
// or for components:
import { getImageUrl } from '../utils/api';
```

### Step 2: Replace hardcoded URLs

**Before:**
```javascript
src={`http://localhost:5000${product.image}`}
```

**After:**
```javascript
src={getImageUrl(product.image)}
```

**Or for images that might be null:**
```javascript
src={product.image ? getImageUrl(product.image) : '/placeholder.jpg'}
```

## Quick Update Script

You can use find-and-replace in your editor:

**Find:** `http://localhost:5000${`
**Replace:** `getImageUrl(`

**Find:** `http://localhost:5000/`
**Replace:** `getImageUrl('/`

**Find:** `http://localhost:5000`
**Replace:** `getImageUrl('`

Then add the import statement to each file.

## Environment Variables

After updating the code, set these environment variables in your deployment platform:

**Vercel/Netlify:**
```env
REACT_APP_API_URL=https://your-backend.railway.app/api
REACT_APP_IMAGE_BASE_URL=https://your-backend.railway.app
```

**Note:** If `REACT_APP_IMAGE_BASE_URL` is not set, it will automatically use the base URL from `REACT_APP_API_URL`.

## Verification

After deployment:
1. Check that product images load correctly
2. Check that category images load correctly
3. Check that variant color images load correctly
4. Check browser console for any 404 errors on images

## Alternative: Manual Update

If you prefer to keep the current structure, you can manually update each file to use:

```javascript
const IMAGE_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL || 'http://localhost:5000';
src={`${IMAGE_BASE_URL}${product.image}`}
```

But the `getImageUrl()` helper is recommended as it handles edge cases better.

