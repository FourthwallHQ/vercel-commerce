import { FourthwallShop } from "lib/fourthwall/types";
import { ReactNode } from "react";
import { Toaster } from "sonner";
import { CartProvider } from "./cart/cart-context";
import { Navbar } from "./layout/navbar";
import { ShopProvider } from "./shop/shop-context";
import { WelcomeToast } from "./welcome-toast";

export function Wrapper({ children, currency, shop }: { children: ReactNode, currency: string, shop: FourthwallShop }) {
  return <ShopProvider shop={shop}>
    <CartProvider currency={currency}>
      <Navbar currency={currency} />
      <main>
        {children}
        <Toaster closeButton />
        <WelcomeToast />
      </main>
    </CartProvider>
  </ShopProvider>
}