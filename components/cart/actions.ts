'use server';

import { TAGS } from 'lib/constants';
import { addToCart, createCart, getCart, getCheckoutUrl, removeFromCart, updateCart } from 'lib/fourthwall';
import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function getCartId(): Promise<string | undefined> {
  const tokenHash = (process.env.NEXT_PUBLIC_FW_STOREFRONT_TOKEN || '').trim();
  const cookieStore = await cookies();
  return cookieStore.get(`${tokenHash}/cartId`)?.value;
}

async function setCartId(cartId: string) {
  const tokenHash = (process.env.NEXT_PUBLIC_FW_STOREFRONT_TOKEN || '').trim();
  const cookieStore = await cookies();
  cookieStore.set(`${tokenHash}/cartId`, cartId);
}

export async function addItem(prevState: any, selectedVariantId: string | undefined) {
  try {
    const cart = await getCart(await getCartId(), 'USD') || (await createCartAndSetCookie());
    const cartId = cart.id!!;

    if (!cart || !selectedVariantId) {
      return 'Error adding item to cart';
    }

    await addToCart(cartId, [{ merchandiseId: selectedVariantId, quantity: 1 }]);
    revalidateTag(TAGS.cart, { expire: 60 });
  } catch (e) {
    return 'Error adding item to cart';
  }
}

export async function removeItem(prevState: any, merchandiseId: string) {
  try {
    const cart = await getCart(await getCartId(), 'USD') || (await createCartAndSetCookie());
    const cartId = cart.id!!;

    if (!cart) {
      return 'Error fetching cart';
    }

    const lineItem = cart.lines.find((line) => line.merchandise.id === merchandiseId);

    if (lineItem && lineItem.id) {
      await removeFromCart(cartId, [lineItem.id]);
      revalidateTag(TAGS.cart, {});
    } else {
      return 'Item not found in cart';
    }
  } catch (e) {
    return 'Error removing item from cart';
  }
}

export async function updateItemQuantity(
  prevState: any,
  payload: {
    merchandiseId: string;
    quantity: number;
  }
) {
  const { merchandiseId, quantity } = payload;

  try {
    const cart = await getCart(await getCartId(), 'USD') || (await createCartAndSetCookie());
    const cartId = cart.id!!;

    if (!cart) {
      return 'Error fetching cart';
    }

    const lineItem = cart.lines.find((line) => line.merchandise.id === merchandiseId);

    if (lineItem && lineItem.id) {
      if (quantity === 0) {
        await removeFromCart(cartId, [lineItem.id]);
      } else {
        await updateCart(cartId, [
          {
            id: lineItem.id,
            merchandiseId,
            quantity
          }
        ]);
      }
    } else if (quantity > 0) {
      // If the item doesn't exist in the cart and quantity > 0, add it
      await addToCart(cartId, [{ merchandiseId, quantity }]);
    }

    revalidateTag(TAGS.cart, { });
  } catch (e) {
    console.error(e);
    return 'Error updating item quantity';
  }
}

export async function redirectToCheckout(currency: string) {
  let cartId = await getCartId();

  if (!cartId) {
    return 'Missing cart ID';
  }

  let cart = await getCart(cartId, currency);

  if (!cart) {
    return 'Error fetching cart';
  }

  const checkoutUrl = await getCheckoutUrl();
  redirect(`${checkoutUrl}/checkout/?cartId=${cartId}&cartCurrency=${currency}`);
}

export async function createCartAndSetCookie() {
  let cart = await createCart();
  setCartId(cart.id!!);
  return cart;
}

export async function fetchCart(currency: string = 'USD') {
  const cartId = await getCartId();
  if (!cartId) {
    return undefined;
  }
  return getCart(cartId, currency);
}
