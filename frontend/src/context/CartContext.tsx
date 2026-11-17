import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Menu } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (menu: Menu) => void;
  removeFromCart: (menuId: number) => void;
  updateQuantity: (menuId: number, delta: number) => void;
  updateNotes: (menuId: number, notes: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('kantin_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('kantin_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (menu: Menu) => {
    // Bug Fix Issue #6: Cegah penambahan item yang sedang habis (isAvailable = false)
    if (!menu.isAvailable) {
      alert(`Maaf, menu "${menu.name}" sedang habis.`);
      return;
    }
    setItems((prev) => {
      const existing = prev.find((item) => item.menu.id === menu.id);
      if (existing) {
        if (existing.quantity >= 50) {
          alert('Batas maksimum per item adalah 50 porsi');
          return prev;
        }
        return prev.map((item) =>
          item.menu.id === menu.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { menu, quantity: 1 }];
    });
  };

  const removeFromCart = (menuId: number) => {
    setItems((prev) => prev.filter((item) => item.menu.id !== menuId));
  };

  const updateQuantity = (menuId: number, delta: number) => {
    setItems((prev) => {
      return prev
        .map((item) => {
          if (item.menu.id === menuId) {
            const newQty = item.quantity + delta;
            if (newQty > 50) {
              alert('Batas maksimum per item adalah 50 porsi');
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const updateNotes = (menuId: number, notes: string) => {
    // Bug Fix Issue #5: Batasi panjang catatan khusus maksimal 150 karakter
    const sanitized = (notes || '').slice(0, 150);
    setItems((prev) =>
      prev.map((item) => (item.menu.id === menuId ? { ...item, notes: sanitized } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.menu.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateNotes,
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
