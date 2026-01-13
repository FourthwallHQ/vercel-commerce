import { Cart, Collection, Product } from "lib/types";
import * as path from 'path';
import { reshapeCart, reshapeProduct, reshapeProducts } from "./reshape";
import { FourthwallCart, FourthwallCollection, FourthwallProduct } from "./types";

const API_URL = process.env.NEXT_PUBLIC_FW_API_URL || 'https://storefront-api.fourthwall.com/v1';
const STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_FW_STOREFRONT_TOKEN || '';

/**
 * Helpers
 */
class FourthwallError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function fourthwallGet<T>(
  url: string,
  query: Record<string, string | number | undefined>,
  options: RequestInit & { next?: NextFetchRequestConfig } = {}
): Promise<{ status: number; body: T }> {
  const constructedUrl = new URL(url);
  // add query parameters
  Object.keys(query).forEach((key) => {
    if (query[key] !== undefined) {
      constructedUrl.searchParams.append(key, query[key].toString());
    }
  });
  constructedUrl.searchParams.append('storefront_token', STOREFRONT_TOKEN);

  const { next, ...fetchOptions } = options;
  const result = await fetch(
    constructedUrl.toString(),
    {
      method: 'GET',
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers
      },
      next,
    }
  );

  const body = await result.json();

  if (result.status !== 200) {
    console.error({
      status: result.status,
      url: constructedUrl.toString(),
      body,
    });

    throw new FourthwallError("Failed to fetch from Fourthwall", result.status);
  }

  return {
    status: result.status,
    body,
  };
}

async function fourthwallPost<T>(url: string, data: any, options: RequestInit = {}): Promise<{ status: number; body: T }> {
  try {
    const result = await fetch(`${url}?storefront_token=${STOREFRONT_TOKEN}`, {
      method: 'POST',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(data)
    });

    const bodyRaw = await result.text();
    const body = JSON.parse(bodyRaw);

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
export async function getCollections(): Promise<Collection[]> {
  const res = await fourthwallGet<{ results: FourthwallCollection[] }>(
    path.join(API_URL, 'collections'),
    {},
    { next: { revalidate: 3600 } }
  );

  return res.body.results.map((collection) => ({
    handle: collection.slug,
    title: collection.name,
    description: collection.description,
  }));
}

export async function getCollectionProducts({
  collection,
  currency,
  limit,
}: {
  collection: string;
  currency: string;
  limit?: number;
}): Promise<Product[]> {
  try {
    const res = await fourthwallGet<{results: FourthwallProduct[]}>(
      path.join(API_URL, 'collections', collection, 'products'),
      { currency, limit },
      { next: { revalidate: 3600, tags: [`collection-${collection}`] } }
    );

    if (!res.body.results) {
      console.warn(`No collection found for \`${collection}\``);
      return [];
    }

    return reshapeProducts(res.body.results);
  } catch (e) {
    console.error(`Error fetching collection products for \`${collection}\`:`, e);
    return [];
  }
}

/**
 * Product operations
 */
export async function getProduct({ handle, currency } : { handle: string, currency: string }): Promise<Product | undefined> {
  try {
    const res = await fourthwallGet<FourthwallProduct>(
      path.join(API_URL, 'products', handle),
      { currency },
      { next: { revalidate: 3600, tags: [`product-${handle}`] } }
    );

    return reshapeProduct(res.body);
  } catch (e) {
    if (e instanceof FourthwallError && e.status === 404) {
      return undefined;
    }
    throw e;
  }
}

/**
 * Cart operations
 */
export async function getCart(cartId: string | undefined, currency: string): Promise<Cart | undefined> {
  if (!cartId) {
    return undefined;
  }

  try {
    const res = await fourthwallGet<FourthwallCart>(path.join(API_URL, 'carts', cartId), {
      currency
    }, {
      cache: 'no-store'
    });

    return reshapeCart(res.body);
  } catch (e) {
    console.error('CART ERROR', e);
    return undefined;
  }
}

export async function createCart(): Promise<Cart> {
  try {
    const res = await fourthwallPost<FourthwallCart>(path.join(API_URL, 'carts'), {
      items: []
    });

    return reshapeCart(res.body);
  } catch (e) {
    console.error('CART CREATE ERROR', e);
    throw e;
  }
}

export async function addToCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<Cart> {

  const items = lines.map((line) => ({
    variantId: line.merchandiseId,
    quantity: line.quantity
  }));

  const res = await fourthwallPost<FourthwallCart>(path.join(API_URL, 'carts', cartId, 'add'), {
    items,
  }, {
    cache: 'no-store'    
  });

  return reshapeCart(res.body);
}

export async function removeFromCart(cartId: string, lineIds: string[]): Promise<Cart> {
  const items = lineIds.map((id) => ({
    variantId: id
  }));

  const res = await fourthwallPost<FourthwallCart>(path.join(API_URL, 'carts', cartId, 'remove'), {
    items,
  }, {
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

  const res = await fourthwallPost<FourthwallCart>(path.join(API_URL, 'carts', cartId, 'change'), {
    items,
  }, {
    cache: 'no-store'
  });

  return reshapeCart(res.body);
}
