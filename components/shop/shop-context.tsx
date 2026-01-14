'use client';

import { FourthwallShop } from 'lib/fourthwall/types';
import { createContext, ReactNode, useContext } from 'react';

type ShopContextType = {
  shop: FourthwallShop;
};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children, shop }: { children: ReactNode; shop: FourthwallShop }) {
  return <ShopContext.Provider value={{ shop }}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
