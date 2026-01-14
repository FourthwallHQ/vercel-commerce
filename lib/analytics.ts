// GA4 E-commerce Item type following Google's standard format
export interface GA4Item {
  item_id: string;
  item_name: string;
  item_variant?: string;
  item_brand?: string;
  price: number;
  quantity: number;
  currency: string;
}

// GA4 E-commerce event parameters
export interface GA4EcommerceEvent {
  currency: string;
  value: number;
  items: GA4Item[];
}

// Declare dataLayer on window object for TypeScript
declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

// Get GTM Container ID from environment variable with fallback
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-PV2BBNN';

/**
 * Push event to dataLayer for GTM
 */
function pushToDataLayer(event: Record<string, unknown>): void {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(event);
  }
}

/**
 * Track add_to_cart event
 * @see https://developers.google.com/analytics/devguides/collection/ga4/reference/events#add_to_cart
 */
export function trackAddToCart(params: GA4EcommerceEvent): void {
  pushToDataLayer({
    event: 'add_to_cart',
    ecommerce: {
      currency: params.currency,
      value: params.value,
      items: params.items
    }
  });
}

/**
 * Track remove_from_cart event
 * @see https://developers.google.com/analytics/devguides/collection/ga4/reference/events#remove_from_cart
 */
export function trackRemoveFromCart(params: GA4EcommerceEvent): void {
  pushToDataLayer({
    event: 'remove_from_cart',
    ecommerce: {
      currency: params.currency,
      value: params.value,
      items: params.items
    }
  });
}

/**
 * Track view_item event
 * @see https://developers.google.com/analytics/devguides/collection/ga4/reference/events#view_item
 */
export function trackViewItem(params: GA4EcommerceEvent): void {
  pushToDataLayer({
    event: 'view_item',
    ecommerce: {
      currency: params.currency,
      value: params.value,
      items: params.items
    }
  });
}
