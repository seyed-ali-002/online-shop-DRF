import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from './api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  const fetchCart = useCallback(async () => {
    if (!user) { setCart(null); setCartCount(0); return; }
    try {
      const { data } = await cartAPI.get();
      const items = Array.isArray(data) ? data : (data.results || []);
      setCart(items);
      setCartCount(items.reduce((s, i) => s + (i.quantity || 1), 0));
    } catch {
      setCart([]);
      setCartCount(0);
    }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId, quantity = 1, price = 0) => {
    await cartAPI.addItem({ product: productId, quantity, price });
    await fetchCart();
  };

  const removeFromCart = async (itemId) => {
    await cartAPI.removeItem(itemId);
    await fetchCart();
  };

  const updateQuantity = async (itemId, quantity) => {
    await cartAPI.updateItem(itemId, { quantity });
    await fetchCart();
  };

  return (
    <CartContext.Provider value={{ cart, cartCount, addToCart, removeFromCart, updateQuantity, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
