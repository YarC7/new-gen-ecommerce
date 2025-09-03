import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
import {useMemo} from 'react';

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
  // The useOptimisticCart hook applies pending actions to the cart
  // so the user immediately sees feedback when they modify the cart.
  const cart = useOptimisticCart(originalCart);

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

  const renderedLines = useMemo(
    () =>
      lines.map((line) => (
        <CartLineItem key={line.id} line={line} layout={layout} />
      )),
    [lines, layout],
  );

  return (
    <div className={className}>
      <CartEmpty hidden={linesCount} layout={layout} />
      <div className="cart-details">
        <div aria-labelledby="cart-lines">
          <div className="space-y-4">{renderedLines}</div>
        </div>
        {cartHasItems && layout === 'aside' && <CartSummary cart={cart} layout={layout} />}
      </div>
    </div>
  );
}

function CartEmpty({
  hidden = false,
  layout,
}: {
  hidden: boolean;
  layout?: CartMainProps['layout'];
}) {
  // Only use useAside for aside layout, otherwise provide a no-op function
  let close = () => {};
  try {
    if (layout === 'aside') {
      const aside = useAside();
      close = aside.close;
    }
  } catch (error) {
    // useAside not available, use no-op function
    console.warn('useAside not available in CartEmpty, using no-op close function');
  }

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
