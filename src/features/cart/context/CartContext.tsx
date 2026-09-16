'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product } from '@/features/products/data/productsData';

export interface CartItem extends Product {
  selectedOption: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, selectedOption: string) => void;
  updateQuantity: (id: string, selectedOption: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'eternal_memory_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Cargar carrito guardado desde localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error('Error cargando el carrito desde localStorage', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Guardar en localStorage cuando el carrito cambie
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addToCart = (newItem: CartItem) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.id === newItem.id && item.selectedOption === newItem.selectedOption
      );

      if (existingIndex > -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingIndex].quantity += newItem.quantity;
        return updatedCart;
      }

      return [...prevCart, newItem];
    });
    openCart();
  };

  const removeFromCart = (id: string, selectedOption: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => !(item.id === id && item.selectedOption === selectedOption))
    );
  };

  const updateQuantity = (id: string, selectedOption: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id, selectedOption);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id && item.selectedOption === selectedOption
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
}