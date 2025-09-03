import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {CartLines} from './CartLines';
import {CartSummary} from './CartSummary';
import {useMemo} from 'react';
import {useCartUI} from './CartUIProvider';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 */
export function CartMain({layout, cart: originalCart}: CartMainProps) {
  const cart = useOptimisticCart(originalCart);
  const {closeCart} = useCartUI();

  const lines = cart?.lines?.nodes ?? [];
  const linesCount = Boolean(lines.length || 0);

  const withDiscount = Boolean(
    cart?.discountCodes?.some((code) => code.applicable),
  );

  const className = useMemo(
    () => `cart-main ${withDiscount ? 'with-discount' : ''}`,
    [withDiscount],
  );

  const cartHasItems = useMemo(
    () => Boolean(cart?.totalQuantity ? cart.totalQuantity > 0 : false),
    [cart?.totalQuantity],
  );

  return (
    <div className={className}>
      <CartEmpty hidden={linesCount} layout={layout} onClose={closeCart} />
      <div className="cart-details">
        <CartLines lines={lines} layout={layout} />
        {cartHasItems && layout === 'aside' && (
          <CartSummary cart={cart} layout={layout} />
        )}
      </div>
    </div>
  );
}

function CartEmpty({
  hidden = false,
  layout,
  onClose,
}: {
  hidden: boolean;
  layout?: CartMainProps['layout'];
  onClose: () => void;
}) {
  const close = layout === 'aside' ? onClose : () => {};

  return (
    <div hidden={hidden}>
      <br />
      <p>
        Looks like you haven&rsquo;t added anything yet, let&rsquo;s get you
        started!
      </p>
      <br />
      <Link to="/collections" onClick={close} prefetch="viewport">
        Continue shopping →
      </Link>
    </div>
  );
}
