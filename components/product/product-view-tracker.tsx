'use client';

import { useShop } from 'components/shop/shop-context';
import { trackViewItem } from 'lib/analytics';
import { Product } from 'lib/types';
import { useEffect } from 'react';

export function ProductViewTracker({ product }: { product: Product }) {
  const { shop } = useShop();

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
          item_brand: shop.name,
          price,
          quantity: 1,
          currency
        }
      ]
    });
  }, [product, shop]);

  return null;
}
