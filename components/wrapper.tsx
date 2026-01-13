import { ReactNode } from "react";
import { Toaster } from "sonner";
import { CartProvider } from "./cart/cart-context";
import { Navbar } from "./layout/navbar";
import { WelcomeToast } from "./welcome-toast";

export function Wrapper({ children, currency }: { children: ReactNode, currency: string }) {
  return <CartProvider currency={currency}>
    <Navbar currency={currency} />
    <main>
      {children}
      <Toaster closeButton />
      <WelcomeToast />
    </main>
  </CartProvider>
}