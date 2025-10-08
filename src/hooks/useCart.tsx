import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './useAuth';
import {supabase} from '@/integrations/supabase/client';

export interface CartItem {
  id: string;
  title: string;
  author: string;
  image: string;
  tokenValue: number;
  price?: number;
  condition: string;
  paymentMethod: 'tokens' | 'money';
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'id' | 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalTokens: () => number;
  getTotalMoney: () => number;
  userTokens: number;
  setUserTokens: (tokens: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
    const [userTokens, setUserTokens] = useState(0);
  const { user } = useAuth();

  // Fetch user token balance from database
  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (!user) {
        setUserTokens(0);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_tokens')
          .select('token_balance')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching token balance:', error);
          return;
        }

        if (data) {
          setUserTokens(data.token_balance);
        }
      } catch (error) {
        console.error('Error fetching token balance:', error);
      }
    };

    fetchTokenBalance();
  }, [user]);
  const addToCart = (newItem: Omit<CartItem, 'id' | 'quantity'>) => {
    const id = `${newItem.title}-${newItem.paymentMethod}-${Date.now()}`;
    const cartItem: CartItem = { ...newItem, id, quantity: 1 };
    
    setItems(prev => {
      const existingItem = prev.find(item => 
        item.title === newItem.title && 
        item.paymentMethod === newItem.paymentMethod
      );
      
      if (existingItem) {
        return prev.map(item =>
          item.id === existingItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...prev, cartItem];
    });
  };

  const removeFromCart = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalTokens = () => {
    return items
      .filter(item => item.paymentMethod === 'tokens')
      .reduce((total, item) => total + (item.tokenValue * item.quantity), 0);
  };

  const getTotalMoney = () => {
    return items
      .filter(item => item.paymentMethod === 'money')
      .reduce((total, item) => total + ((item.price || 0) * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalTokens,
      getTotalMoney,
      userTokens,
      setUserTokens
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};