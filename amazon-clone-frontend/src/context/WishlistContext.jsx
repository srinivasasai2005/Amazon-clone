import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getWishlist, addToWishlist, removeFromWishlist } from '../services/api';
import { useNotification } from './NotificationContext';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([]);
  const toast = useNotification();
  const { user } = useAuth(); // Tie wishlist fetching to auth state

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    try {
      const data = await getWishlist(); // api.js already returns {data} unwrapped
      setItems(data ?? []);
    } catch { /* silent */ }
  }, [user]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const isInWishlist = (productId) =>
    items.some((i) => Number(i.product_id) === Number(productId));

  const toggleWishlist = async (productId) => {
    if (!user) {
      toast.error('Please sign in to manage wishlist');
      return;
    }
    if (isInWishlist(productId)) {
      try {
        await removeFromWishlist(productId);
        setItems((prev) => prev.filter((i) => Number(i.product_id) !== Number(productId)));
        toast.info('Removed from wishlist');
      } catch {
        toast.error('Failed to update wishlist');
      }
    } else {
      try {
        await addToWishlist(productId);
        await fetchWishlist();
        toast.success('Added to wishlist!');
      } catch {
        toast.error('Failed to update wishlist');
      }
    }
  };

  return (
    <WishlistContext.Provider value={{ items, isInWishlist, toggleWishlist, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
