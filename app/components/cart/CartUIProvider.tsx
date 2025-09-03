import {createContext, useContext, useState, ReactNode, useMemo} from 'react';

interface CartUIContextValue {
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartUIContext = createContext<CartUIContextValue | null>(null);

export function CartUIProvider({children}: {children: ReactNode}) {
  const [isCartOpen, setCartOpen] = useState(false);

  const openCart = () => setCartOpen(true);
  const closeCart = () => setCartOpen(false);
  const toggleCart = () => setCartOpen((prev) => !prev);

  const value = useMemo(
    () => ({isCartOpen, openCart, closeCart, toggleCart}),
    [isCartOpen],
  );

  return (
    <CartUIContext.Provider value={value}>{children}</CartUIContext.Provider>
  );
}

export function useCartUI() {
  const context = useContext(CartUIContext);
  if (!context) {
    throw new Error('useCartUI must be used within a CartUIProvider');
  }
  return context;
}
