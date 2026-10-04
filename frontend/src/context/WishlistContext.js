import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { API_URL } from '../utils/api';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

// Keeps the ids of the user's saved products so every heart button can show
// its state without its own request. The full product list is loaded by the
// Wishlist page itself.
export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [ids, setIds] = useState(() => new Set());
  const pending = useRef(new Set()); // products with a request in flight

  useEffect(() => {
    if (!user) {
      setIds(new Set());
      return;
    }

    let cancelled = false;
    axios
      .get(`${API_URL}/wishlist`)
      .then(({ data }) => {
        if (!cancelled) setIds(new Set(data.ids || []));
      })
      .catch((error) => console.error('Error loading wishlist:', error));

    return () => {
      cancelled = true;
    };
  }, [user]);

  const isSaved = useCallback((productId) => ids.has(productId), [ids]);

  // Optimistic toggle: the heart and the message change right away; the
  // request runs in the background and is undone if it fails. Clicks on the
  // same product are ignored until its request finishes (no racing requests).
  const toggle = useCallback(
    async (productId) => {
      if (!user) {
        toast.error('Please log in to save products');
        return false;
      }
      if (pending.current.has(productId)) return false;
      pending.current.add(productId);

      const wasSaved = ids.has(productId);
      const update = (save) =>
        setIds((prev) => {
          const next = new Set(prev);
          if (save) next.add(productId);
          else next.delete(productId);
          return next;
        });

      update(!wasSaved);
      const toastId = `wishlist-${productId}`;
      toast.success(wasSaved ? 'Removed from wishlist' : 'Saved to wishlist', { id: toastId });
      try {
        if (wasSaved) await axios.delete(`${API_URL}/wishlist/${productId}`);
        else await axios.post(`${API_URL}/wishlist/${productId}`);
        return true;
      } catch (error) {
        update(wasSaved);
        // replaces the success message
        toast.error(error.response?.data?.message || 'Could not update wishlist', { id: toastId });
        return false;
      } finally {
        pending.current.delete(productId);
      }
    },
    [ids, user]
  );

  return (
    <WishlistContext.Provider value={{ isSaved, toggle, count: ids.size }}>
      {children}
    </WishlistContext.Provider>
  );
};
