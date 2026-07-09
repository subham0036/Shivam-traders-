import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services';
import { getSessionId } from '../utils/helpers';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await cartAPI.get(getSessionId());
      setCart(data.data.cart);
      setPrices(data.data.prices);
    } catch {
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCart(); }, [user, fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    const { data } = await cartAPI.add({ productId, quantity, sessionId: getSessionId() });
    setCart(data.data);
    await fetchCart();
    return data;
  };

  const updateQuantity = async (productId, quantity) => {
    await cartAPI.update(productId, { quantity, sessionId: getSessionId() });
    await fetchCart();
  };

  const removeItem = async (productId) => {
    await cartAPI.remove(productId, getSessionId());
    await fetchCart();
  };

  const applyCoupon = async (code) => {
    const { data } = await cartAPI.applyCoupon({ code, sessionId: getSessionId() });
    await fetchCart();
    return data;
  };

  const updateGift = async (giftWrapping, giftMessage) => {
    await cartAPI.updateGift({ giftWrapping, giftMessage, sessionId: getSessionId() });
    await fetchCart();
  };

  const cartCount = cart.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{
      cart, prices, loading, cartCount, fetchCart,
      addToCart, updateQuantity, removeItem, applyCoupon, updateGift,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
