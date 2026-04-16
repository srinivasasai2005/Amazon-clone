import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart, addToCart as apiAdd, updateCartItem, removeCartItem, clearCart as apiClear } from '../services/api';
import { useNotification } from './NotificationContext';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items,    setItems]    = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [count,    setCount]    = useState(0);
  const [loading,  setLoading]  = useState(false);
  const toast = useNotification();
  const { user } = useAuth(); // Tie cart fetching to auth state

  const fetchCart = useCallback(async () => {
    if (!user) {
      setItems([]); setSubtotal(0); setCount(0);
      return;
    }
    try {
      const data = await getCart(); // api.js already returns {data} unwrapped
      setItems(data.items   ?? []);
      setSubtotal(data.subtotal ?? 0);
      setCount(data.count   ?? 0);
    } catch (err) {
      console.error('Cart fetch failed:', err);
    }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      return false;
    }
    setLoading(true);
    try {
      await apiAdd(productId, quantity);
      await fetchCart();
      toast.success('Added to cart!');
      return true;
    } catch {
      toast.error('Failed to add to cart');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      await updateCartItem(productId, quantity);
      await fetchCart();
      return true;
    } catch {
      toast.error('Failed to update quantity');
      return false;
    }
  };

  const removeItem = async (productId) => {
    try {
      await removeCartItem(productId);
      await fetchCart();
      toast.info('Item removed from cart');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const clearCartItems = async () => {
    try {
      await apiClear();
      setItems([]); setSubtotal(0); setCount(0);
    } catch {
      toast.error('Failed to clear cart');
    }
  };

  return (
    <CartContext.Provider value={{ items, subtotal, count, loading, fetchCart, addToCart, updateQuantity, removeItem, clearCart: clearCartItems }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
