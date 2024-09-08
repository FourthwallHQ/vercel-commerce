import { Cart, Menu, Product } from "lib/shopify/types";
import { reshapeCart, reshapeProduct, reshapeProducts } from "./reshape";
import { FourthwallCart, FourthwallProduct } from "./types";

/**
 * Helpers
 */
async function fourthwallGet<T>(url: string, options: RequestInit = {}): Promise<{ status: number; body: T }> {
  try {
    const result = await fetch(
      url,
      {
        method: 'GET',
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      }
    );

    const body = await result.json();

    return {
      status: result.status,
      body
    };
  } catch (e) {
    throw {
      error: e,
      url
    };
  }
}

async function fourthwallPost<T>(url: string, data: any, options: RequestInit = {}): Promise<{ status: number; body: T }> {
  try {
    const result = await fetch(url, {
      method: 'POST',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(data)
    });

    const body = await result.json();

    return {
      status: result.status,
      body
    };
  } catch (e) {
    throw {
      error: e,
      url,
      data
    };
  }
}

/**
 * Collection operations
 */
export async function getCollectionProducts({
  collection,
  currency,
  reverse,
  sortKey
}: {
  collection: string;
  currency: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  const res = await fourthwallGet<{results: FourthwallProduct[]}>(`${process.env.FW_URL}/api/public/v1.0/collections/${collection}/products?secret=${process.env.FW_SECRET}&currency=${currency}`, {
    headers: {
      'X-ShopId': process.env.FW_SHOPID || ''
    }
  });

  console.warn(JSON.stringify(res.body.results, null, 2));

  if (!res.body.results) {
    console.log(`No collection found for \`${collection}\``);
    return [];
  }


  return reshapeProducts(res.body.results);
}

/**
 * Product operations
 */
export async function getProduct({ handle, currency } : { handle: string, currency: string }): Promise<Product | undefined> {
  // TODO: replace with real URL
  const res = await fourthwallGet<{results: FourthwallProduct[]}>(`${process.env.FW_URL}/api/public/v1.0/collections/${process.env.FW_COLLECTION}/products?secret=${process.env.FW_SECRET}&currency=${currency}`, {
    headers: {
      'X-ShopId': process.env.FW_SHOPID || ''
    }
  });

  return res.body.results.filter((product) => {
    return product.slug === handle
  }).map((p: any) => reshapeProduct(p))[0];
}

export async function getProductRecommendations(productId: string): Promise<Product[]> {
  // TODO: replace with real URL
  return [];
}

/**
 * Cart operations
 */
export async function getCart(cartId: string | undefined, currency: string): Promise<Cart | undefined> {
  if (!cartId) {
    return undefined;
  }

  const res = await fourthwallGet<FourthwallCart>(`${process.env.FW_URL}/api/public/v1.0/carts/${cartId}?secret=${process.env.FW_SECRET}`, {
    cache: 'no-store'
  });

  return reshapeCart(res.body);
}

export async function createCart(): Promise<Cart> {
  const res = await fourthwallPost<FourthwallCart>(`https://api.staging.fourthwall.com/api/public/v1.0/carts?secret=${process.env.FW_SECRET}`, {
    items: []
  }, {
    headers: {
      'X-ShopId': process.env.FW_SHOPID || ''
    }
  });

  return reshapeCart(res.body);
}

export async function addToCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<Cart> {

  const items = lines.map((line) => ({
    variantId: line.merchandiseId,
    quantity: line.quantity
  }));

  const res = await fourthwallPost<FourthwallCart>(`${process.env.FW_URL}/api/public/v1.0/carts/${cartId}/add?secret=${process.env.FW_SECRET}`, {
    items,
  }, {
    headers: {
      'X-ShopId': process.env.FW_SHOPID || ''
    },
    cache: 'no-store'    
  });

  return reshapeCart(res.body);
}

export async function removeFromCart(cartId: string, lineIds: string[]): Promise<Cart> {
  const items = lineIds.map((id) => ({
    variantId: id
  }));

  const res = await fourthwallPost<FourthwallCart>(`${process.env.FW_URL}/api/public/v1.0/carts/${cartId}/remove?secret=${process.env.FW_SECRET}`, {
    items,
  }, {
    headers: {
      'X-ShopId': process.env.FW_SHOPID || ''
    },
    cache: 'no-store'
  });

  return reshapeCart(res.body);
}

export async function updateCart(
  cartId: string,
  lines: { id: string; merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const items = lines.map((line) => ({
    variantId: line.merchandiseId,
    quantity: line.quantity
  }));

  const res = await fourthwallPost<FourthwallCart>(`${process.env.FW_URL}/api/public/v1.0/carts/${cartId}/change?secret=${process.env.FW_SECRET}`, {
    items,
  }, {
    headers: {
      'X-ShopId': process.env.FW_SHOPID || ''
    },
    cache: 'no-store'
  });

  return reshapeCart(res.body);
}


/**
 * TODO: Stubbed out
 */
export async function getMenu(handle: string): Promise<Menu[]> {
  return [];
}