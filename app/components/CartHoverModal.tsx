import {Link} from 'react-router';
import {Image, Money, useOptimisticCart} from '@shopify/hydrogen';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

interface CartHoverModalProps {
  cart: CartApiQueryFragment | null;
  isVisible: boolean;
}

export function CartHoverModal({cart, isVisible}: CartHoverModalProps) {
  const optimisticCart = useOptimisticCart(cart);
  const lines = optimisticCart?.lines?.nodes ?? [];
  const cartHasItems = Boolean(optimisticCart?.totalQuantity && optimisticCart.totalQuantity > 0);

  if (!isVisible) return null;

  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Cart Preview</h3>
            <p className="text-blue-100 text-sm">
              {cartHasItems ? `${optimisticCart?.totalQuantity} items` : 'Empty cart'}
            </p>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-64 overflow-y-auto">
        {!cartHasItems ? (
          <div className="text-center py-8 px-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Your cart is empty</h4>
            <p className="text-sm text-gray-600 mb-4">Add some products to get started!</p>
            <Link
              to="/collections"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="p-4 space-y-3">
              {lines.slice(0, 3).map((line) => (
                <CartHoverItem key={line.id} line={line} />
              ))}
              
              {lines.length > 3 && (
                <div className="text-center py-2">
                  <p className="text-sm text-gray-500">
                    +{lines.length - 3} more items
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 bg-gray-50/50 p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {optimisticCart?.cost?.totalAmount && (
                    <Money data={optimisticCart.cost.totalAmount} />
                  )}
                </span>
              </div>
              
              <Link
                to="/cart"
                className="w-full block text-center px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                View Full Cart →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CartHoverItem({line}: {line: any}) {
  const {merchandise, quantity} = line;
  const {product, selectedOptions, price} = merchandise;

  return (
    <div className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
      {/* Product Image */}
      {merchandise.image && (
        <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
          <Image
            data={merchandise.image}
            alt={merchandise.image.altText || product.title}
            className="w-full h-full object-cover"
            width={48}
            height={48}
          />
        </div>
      )}

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <Link
          to={`/products/${product.handle}`}
          className="block text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors truncate"
        >
          {product.title}
        </Link>
        
        {selectedOptions.map((option: any) => (
          <p key={option.name} className="text-xs text-gray-500">
            {option.name}: {option.value}
          </p>
        ))}
        
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500">Qty: {quantity}</span>
          <span className="text-sm font-semibold text-gray-900">
            <Money data={price} />
          </span>
        </div>
      </div>
    </div>
  );
}
