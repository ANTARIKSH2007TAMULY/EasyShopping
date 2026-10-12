import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/cart');
      setCartItems(response.data.cart || []);
    } catch (err) {
      if (err.response?.status === 401) {
        setCartItems([]);
        setError('');
        return;
      }

      setCartItems([]);
      setError('Unable to load your cart.');
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = useCallback(async (productId) => {
    try {
      setError('');
      const response = await api.post(`/cart/${productId}`);
      await fetchCart();
      return response;
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to add product to cart.';
      setError(message);
      throw err;
    }
  }, [fetchCart]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    try {
      setError('');
      const response = await api.patch(`/cart/${productId}`, { quantity });
      await fetchCart();
      return response;
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to update cart quantity.';
      setError(message);
      throw err;
    }
  }, [fetchCart]);

  const removeFromCart = useCallback(async (productId) => {
    try {
      setError('');
      const response = await api.delete(`/cart/${productId}`);
      await fetchCart();
      return response;
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to remove product from cart.';
      setError(message);
      throw err;
    }
  }, [fetchCart]);

  const moveToWishlist = useCallback(async (productId) => {
    try {
      setError('');
      const response = await api.post(`/wishlist/${productId}`);
      await api.delete(`/cart/${productId}`);
      await fetchCart();
      return response;
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to move product to wishlist.';
      setError(message);
      throw err;
    }
  }, [fetchCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setError('');
  }, []);

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + Number(item.quantity || 0), 0),
    [cartItems]
  );

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const value = useMemo(
    () => ({
      cartItems,
      loading,
      error,
      cartCount,
      fetchCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      moveToWishlist,
      clearCart,
    }),
    [cartItems, loading, error, cartCount, fetchCart, addToCart, updateQuantity, removeFromCart, moveToWishlist, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export default CartContext;
