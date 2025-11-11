import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';



const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
        localStorage.removeItem('cart');
      }
    }

    // Listen for cart clear events (e.g., on logout)
    const handleClearCart = () => {
      setCartItems([]);
    };

    window.addEventListener('clearCart', handleClearCart);
    return () => window.removeEventListener('clearCart', handleClearCart);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

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
