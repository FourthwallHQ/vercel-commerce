'use client';

import { trackViewItem } from 'lib/analytics';
import { Product } from 'lib/types';
import { useEffect } from 'react';

const SHOP_NAME = process.env.NEXT_PUBLIC_SITE_NAME || '';

export function ProductViewTracker({ product }: { product: Product }) {
  useEffect(() => {
    const price = parseFloat(product.priceRange.minVariantPrice.amount);
    const currency = product.priceRange.minVariantPrice.currencyCode;

    trackViewItem({
      currency,
      value: price,
      items: [
        {
          item_id: product.id,
          item_name: product.title,
          item_brand: SHOP_NAME,
          price,
          quantity: 1,
          currency
        }
      ]
    });
  }, [product]);

  return null;
}
