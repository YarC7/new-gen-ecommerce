import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {Money, type OptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
};

export function CartSummary({cart}: CartSummaryProps) {
  return (
    <div aria-labelledby="cart-summary" className="mt-8">
      <div className="space-y-4 text-right">
        <div className="flex justify-end items-center space-x-4 font-semibold text-lg">
          <span>Estimated total</span>
          <span>
            {cart?.cost?.totalAmount?.amount ? (
              <Money data={cart.cost.totalAmount} />
            ) : (
              '-'
            )}
          </span>
        </div>
        <p className="text-sm text-gray-500">
          Taxes, discounts and shipping calculated at checkout.
        </p>
        <CartCheckoutActions checkoutUrl={cart?.checkoutUrl} />
      </div>
    </div>
  );
}

function CartCheckoutActions({checkoutUrl}: {checkoutUrl?: string}) {
  if (!checkoutUrl) return null;

  return (
    <div className="pt-4">
      <Link
        to="/checkout"
        className="inline-block bg-black text-white text-center py-3 px-12 rounded-md font-semibold hover:bg-gray-800 transition-colors"
        style={{color: 'white'}}
      >
        Check out
      </Link>
    </div>
  );
}
