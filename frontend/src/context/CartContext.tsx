import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, Menu } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (menu: Menu) => void;
  removeFromCart: (menuId: number) => void;
  updateQuantity: (menuId: number, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'kantin_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error loading cart from storage', e);
      return [];
    }
  });

  // Helper untuk menyimpan ke state & localStorage secara sinkron
  const persistItems = useCallback((newItems: CartItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    } catch (e) {
      console.error('Error saving cart to storage', e);
    }
  }, []);

  // Listen to cross-tab storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        try {
          const updated = e.newValue ? JSON.parse(e.newValue) : [];
          setItems(updated);
        } catch {
          // ignore parsing error
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addToCart = useCallback(
    (menu: Menu) => {
      // Baca fresh dari storage jika memungkinkan
      let currentItems = items;
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) currentItems = JSON.parse(saved);
      } catch {
        // fallback to items state
      }

      const existingIndex = currentItems.findIndex((item) => item.menu.id === menu.id);
      let updated: CartItem[];

      if (existingIndex > -1) {
        updated = currentItems.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updated = [...currentItems, { menu, quantity: 1 }];
      }

      persistItems(updated);
    },
    [items, persistItems]
  );

  const removeFromCart = useCallback(
    (menuId: number) => {
      const updated = items.filter((item) => item.menu.id !== menuId);
      persistItems(updated);
    },
    [items, persistItems]
  );

  const updateQuantity = useCallback(
    (menuId: number, delta: number) => {
      const updated = items
        .map((item) => {
          if (item.menu.id === menuId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];

      persistItems(updated);
    },
    [items, persistItems]
  );

  const clearCart = useCallback(() => {
    persistItems([]);
  }, [persistItems]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.menu.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
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
