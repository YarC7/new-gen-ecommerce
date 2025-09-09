import {Link} from 'react-router-dom';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {Image, Money} from '@shopify/hydrogen';

export function CartPopover({cart}: {cart: CartApiQueryFragment | null}) {
  if (!cart || !cart.lines || cart.lines.nodes.length === 0) {
    return (
      <div
        className="
          relative bg-white/80 supports-[backdrop-filter]:bg-white/70 backdrop-blur
          border border-gray-200 rounded-xl shadow-2xl ring-1 ring-black/5
          px-6 py-5 w-72 text-center
          transition-all duration-200 ease-out
          animate-[fadeIn_.15s_ease-out]
        "
        role="status"
        aria-live="polite"
      >
        {/* mũi tên popover */}
        <span
          className="
            pointer-events-none absolute -top-2 right-6 h-4 w-4 rotate-45
            bg-white/80 supports-[backdrop-filter]:bg-white/70
            border-l border-t border-gray-200
          "
          aria-hidden="true"
        />

        {/* icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto mb-3 h-14 w-14 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9m-6-9v9"
          />
        </svg>

        {/* text */}
        <h3 className="text-base font-semibold text-gray-800">
          Your cart is empty
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Looks like you haven’t added anything yet.
        </p>

        {/* CTA */}
        <a
          href="/products"
          className="
            mt-4 inline-flex items-center justify-center
            rounded-lg px-4 py-2 text-sm font-medium
            bg-indigo-600 text-white shadow
            hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
            active:translate-y-px transition
          "
        >
          Shop Now
        </a>

        {/* gợi ý – link tiếp tục mua */}
        <a
          href="/"
          className="mt-2 block text-xs text-gray-500 hover:text-gray-700 underline underline-offset-4"
        >
          Continue shopping
        </a>
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
              <p className="font-semibold text-sm">
                {line.merchandise.product.title}
              </p>
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
