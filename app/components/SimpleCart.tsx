import {useState, useEffect} from 'react';
import {Link} from 'react-router';
import {Image, Money, useOptimisticCart} from '@shopify/hydrogen';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

interface SimpleCartProps {
  cart: CartApiQueryFragment | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SimpleCart({cart, isOpen, onClose}: SimpleCartProps) {
  const optimisticCart = useOptimisticCart(cart);
  const lines = optimisticCart?.lines?.nodes ?? [];
  const cartHasItems = Boolean(optimisticCart?.totalQuantity && optimisticCart.totalQuantity > 0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with glassmorphism */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Modern Modal */}
      <div className={`relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-w-md max-h-[90vh] overflow-hidden transform transition-all duration-300 ease-out ${
        isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
      }`}>
        
        {/* Gradient Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Shopping Cart</h2>
              <p className="text-blue-100 text-sm mt-1">
                {cartHasItems ? `${optimisticCart?.totalQuantity} items` : 'Empty cart'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 group"
              aria-label="Close cart"
            >
              <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {!cartHasItems ? (
            <div className="text-center py-12 px-6">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Your cart is empty</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">Discover amazing products and add them to your cart to get started!</p>
              <Link
                to="/collections"
                onClick={onClose}
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                Start Shopping
              </Link>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="p-6 space-y-4">
                {lines.map((line) => (
                  <CartLineItem key={line.id} line={line} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Cart Footer with Summary */}
        {cartHasItems && (
          <div className="border-t border-gray-100 bg-gray-50/50 backdrop-blur-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {optimisticCart?.cost?.totalAmount && (
                  <Money data={optimisticCart.cost.totalAmount} />
                )}
              </span>
            </div>
            
            <div className="space-y-3">
              <Link
                to="/cart"
                onClick={onClose}
                className="w-full block text-center px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl hover:border-gray-300 hover:bg-white transition-all duration-200"
              >
                View Full Cart
              </Link>
              
              {optimisticCart?.checkoutUrl && (
                <a
                  href={optimisticCart.checkoutUrl}
                  className="w-full block text-center px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Secure Checkout →
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CartLineItem({line}: {line: any}) {
  const {merchandise, quantity} = line;
  const {product, selectedOptions, price} = merchandise;

  return (
    <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-200">
      <div className="flex items-center space-x-4">
        {/* Product Image */}
        {merchandise.image && (
          <div className="flex-shrink-0 w-18 h-18 rounded-xl overflow-hidden bg-gray-100">
            <Image
              data={merchandise.image}
              alt={merchandise.image.altText || product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              width={72}
              height={72}
            />
          </div>
        )}

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <Link
            to={`/products/${product.handle}`}
            className="block text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-1 truncate"
          >
            {product.title}
          </Link>
          
          {selectedOptions.map((option: any) => (
            <p key={option.name} className="text-xs text-gray-500 mb-1">
              <span className="font-medium">{option.name}:</span> {option.value}
            </p>
          ))}
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Qty:</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-lg">
                {quantity}
              </span>
            </div>
            <span className="text-sm font-bold text-gray-900">
              <Money data={price} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
