'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { removeItem } from 'components/cart/actions';
import { useShop } from 'components/shop/shop-context';
import { trackRemoveFromCart } from 'lib/analytics';
import type { CartItem } from 'lib/types';
import { useActionState } from 'react';
import { useCart } from './cart-context';

export function DeleteItemButton({
  item,
  optimisticUpdate
}: {
  item: CartItem;
  optimisticUpdate: any;
}) {
  const { refreshCart } = useCart();
  const { shop } = useShop();
  const [message, formAction] = useActionState(removeItem, null);
  const merchandiseId = item.merchandise.id;
  const actionWithVariant = formAction.bind(null, merchandiseId);

  return (
    <form
      action={async () => {
        optimisticUpdate(merchandiseId, 'delete');
        trackRemoveFromCart({
          currency: item.cost.totalAmount.currencyCode,
          value: parseFloat(item.cost.totalAmount.amount),
          items: [
            {
              item_id: item.merchandise.product.id,
              item_name: item.merchandise.product.title,
              item_variant: item.merchandise.title,
              item_brand: shop.name,
              price: parseFloat(item.cost.totalAmount.amount) / item.quantity,
              quantity: item.quantity,
              currency: item.cost.totalAmount.currencyCode
            }
          ],
          shopId: shop.id
        });
        await actionWithVariant();
        refreshCart();
      }}
    >
      <button
        type="submit"
        aria-label="Remove cart item"
        className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-neutral-500"
      >
        <XMarkIcon className="mx-[1px] h-4 w-4 text-white dark:text-black" />
      </button>
      <p aria-live="polite" className="sr-only" role="status">
        {message}
      </p>
    </form>
  );
}
