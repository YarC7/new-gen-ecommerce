import {Link} from 'react-router-dom';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {Image, Money} from '@shopify/hydrogen';

export function CartPopover({cart}: {cart: CartApiQueryFragment | null}) {
  if (!cart || !cart.lines || cart.lines.nodes.length === 0) {
    return (
<div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Your cart is empty</h3>
    </div>
    );
  }

  return (
    <div className="w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-semibold mb-4">My Cart</h3>
      <ul className="space-y-4 max-h-64 overflow-y-auto">
        {cart.lines.nodes.map((line) => (
          <li key={line.id} className="flex items-center space-x-4">
            {line.merchandise.image && (
              <Image
                data={line.merchandise.image}
                width={64}
                height={64}
                className="rounded-md"
              />
            )}
            <div className="flex-1">
              <p className="font-semibold text-sm">{line.merchandise.product.title}</p>
              <p className="text-xs text-gray-500">Qty: {line.quantity}</p>
            </div>
            <div>
              <Money data={line.cost.totalAmount} className="text-sm" />
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center font-semibold">
          <span>Subtotal</span>
          <Money data={cart.cost.subtotalAmount} />
        </div>
        <Link
          to="/cart"
          className="mt-4 block w-full text-center bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors"
          style={{color: 'white'}}
        >
          View Cart
        </Link>
      </div>
    </div>
  );
}
