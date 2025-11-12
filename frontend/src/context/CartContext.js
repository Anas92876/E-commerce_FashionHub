import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get cart storage key based on user
  const getCartKey = () => {
    return user ? `cart_${user._id}` : 'cart_guest';
  };

  // Load cart from localStorage on mount and when user changes
  useEffect(() => {
    // Wait for auth to finish loading before initializing cart
    if (authLoading) return;
    
    setIsInitialized(false); // Reset initialization when user changes
    
    const cartKey = user ? `cart_${user._id}` : 'cart_guest';
    const savedCart = localStorage.getItem(cartKey);
    
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
        } else {
          setCartItems([]);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        localStorage.removeItem(cartKey);
        setCartItems([]);
      }
    } else {
      // If no saved cart, ensure cart is empty
      setCartItems([]);
    }
    
    setIsInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, authLoading]); // Reload when user ID changes or auth finishes loading

  // Save cart to localStorage whenever it changes (only after initialization)
  useEffect(() => {
    if (!isInitialized) return; // Don't save before initial load
    
    const cartKey = getCartKey();
    if (cartItems.length > 0) {
      localStorage.setItem(cartKey, JSON.stringify(cartItems));
    } else {
      // Remove empty cart from storage
      localStorage.removeItem(cartKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems, user?._id, isInitialized]);

  // Handle user login - merge guest cart with user cart if needed
  useEffect(() => {
    if (!user || !isInitialized) return;

    const guestCartKey = 'cart_guest';
    const userCartKey = `cart_${user._id}`;
    
    const guestCart = localStorage.getItem(guestCartKey);
    const userCart = localStorage.getItem(userCartKey);

    if (guestCart && !userCart) {
      // User logged in for first time, move guest cart to user cart
      try {
        const parsedGuestCart = JSON.parse(guestCart);
        if (Array.isArray(parsedGuestCart) && parsedGuestCart.length > 0) {
          setCartItems(parsedGuestCart);
          localStorage.setItem(userCartKey, guestCart);
          localStorage.removeItem(guestCartKey);
        }
      } catch (error) {
        console.error('Error merging guest cart:', error);
      }
    } else if (guestCart && userCart) {
      // Both exist - merge them (user cart takes priority for duplicates)
      try {
        const parsedGuestCart = JSON.parse(guestCart);
        const parsedUserCart = JSON.parse(userCart);
        
        if (Array.isArray(parsedGuestCart) && parsedGuestCart.length > 0) {
          // Merge carts, avoiding duplicates
          const mergedCart = [...parsedUserCart];
          parsedGuestCart.forEach(guestItem => {
            const exists = mergedCart.some(userItem => 
              userItem._id === guestItem._id && 
              userItem.selectedSize === guestItem.selectedSize &&
              (userItem.variant?.color?.code || userItem.variant?.color) === 
              (guestItem.variant?.color?.code || guestItem.variant?.color)
            );
            if (!exists) {
              mergedCart.push(guestItem);
            }
          });
          setCartItems(mergedCart);
          localStorage.setItem(userCartKey, JSON.stringify(mergedCart));
          localStorage.removeItem(guestCartKey);
        }
      } catch (error) {
        console.error('Error merging carts:', error);
      }
    } else if (userCart) {
      // User has existing cart, load it
      try {
        const parsedUserCart = JSON.parse(userCart);
        if (Array.isArray(parsedUserCart)) {
          setCartItems(parsedUserCart);
        }
      } catch (error) {
        console.error('Error loading user cart:', error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, isInitialized]);

  // Listen for cart clear events (e.g., on logout)
  useEffect(() => {
    const handleClearCart = () => {
      setCartItems([]);
      const cartKey = getCartKey();
      localStorage.removeItem(cartKey);
    };

    window.addEventListener('clearCart', handleClearCart);
    return () => window.removeEventListener('clearCart', handleClearCart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  // Add item to cart
  const addToCart = (cartItemOrProduct, selectedSize = null, quantity = 1) => {
    try {
      // Handle new format (direct cart item object) or legacy format (product + size)
      let cartItem;

      if (cartItemOrProduct.variant) {
        // New format: variant-based product (already formatted from ProductDetails)
        cartItem = {
          ...cartItemOrProduct,
          selectedSize: cartItemOrProduct.variant.size,
          selectedColor: cartItemOrProduct.variant.color,
        };
      } else if (selectedSize) {
        // Legacy format: simple product with size parameter
        cartItem = {
          _id: cartItemOrProduct._id,
          name: cartItemOrProduct.name,
          price: cartItemOrProduct.price,
          image: cartItemOrProduct.image,
          category: cartItemOrProduct.category,
          selectedSize,
          quantity,
          stock: cartItemOrProduct.stock || 0,
        };
      } else {
        // Direct cart item (already complete)
        cartItem = cartItemOrProduct;
      }

      // Check if item with same product, color, and size already exists
      const existingItemIndex = cartItems.findIndex((item) => {
        if (item.variant && cartItem.variant) {
          // Both have variants - match by color and size
          const itemColorCode = item.variant.color?.code || item.variant.color;
          const cartColorCode = cartItem.variant.color?.code || cartItem.variant.color;
          return item._id === cartItem._id &&
                 itemColorCode === cartColorCode &&
                 item.selectedSize === cartItem.selectedSize;
        } else {
          // Legacy matching - just by ID and size
          return item._id === cartItem._id && item.selectedSize === cartItem.selectedSize;
        }
      });

      if (existingItemIndex > -1) {
        // Update quantity of existing item
        const updatedCart = [...cartItems];
        updatedCart[existingItemIndex].quantity += (cartItem.quantity || 1);
        setCartItems(updatedCart);
        toast.success('Cart updated!');
      } else {
        // Add new item to cart
        setCartItems([...cartItems, cartItem]);
        toast.success('Added to cart!');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  // Remove item from cart
  const removeFromCart = (productId, selectedSize, colorCode = null) => {
    const updatedCart = cartItems.filter((item) => {
      if (colorCode && item.variant) {
        // Match by product, color, and size for variant products
        const itemColorCode = item.variant.color?.code || item.variant.color;
        return !(item._id === productId && item.selectedSize === selectedSize && itemColorCode === colorCode);
      } else {
        // Legacy matching by product and size
        return !(item._id === productId && item.selectedSize === selectedSize);
      }
    });
    setCartItems(updatedCart);
    toast('Removed from cart');
  };

  // Update quantity of item in cart
  const updateQuantity = (productId, selectedSize, newQuantity, colorCode = null) => {
    if (newQuantity < 1) {
      removeFromCart(productId, selectedSize, colorCode);
      return;
    }

    const updatedCart = cartItems.map((item) => {
      if (colorCode && item.variant) {
        // Match by product, color, and size for variant products
        const itemColorCode = item.variant.color?.code || item.variant.color;
        if (item._id === productId && item.selectedSize === selectedSize && itemColorCode === colorCode) {
          return { ...item, quantity: newQuantity };
        }
      } else {
        // Legacy matching by product and size
        if (item._id === productId && item.selectedSize === selectedSize) {
          return { ...item, quantity: newQuantity };
        }
      }
      return item;
    });
    setCartItems(updatedCart);
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
    toast('Cart cleared');
  };

  // Get total number of items
  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Get total price
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Check if product is in cart
  const isInCart = (productId, selectedSize) => {
    return cartItems.some(
      (item) => item._id === productId && item.selectedSize === selectedSize
    );
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    getCartTotal,
    isInCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
