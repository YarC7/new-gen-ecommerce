import {useState, useEffect} from 'react';
import {CartPersistence} from '~/lib/cart-persistence';

interface CartRecoveryProps {
  onRecover?: (cartId: string) => void;
}

export function CartRecovery({onRecover}: CartRecoveryProps) {
  const [showRecovery, setShowRecovery] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);

  useEffect(() => {
    // Check for cart data on component mount
    const cartData = CartPersistence.getCartData();
    if (cartData?.cartId && cartData.totalQuantity > 0) {
      setShowRecovery(true);
    }
  }, []);

  const handleRecover = async () => {
    setIsRecovering(true);
    const cartData = CartPersistence.getCartData();
    
    if (cartData?.cartId && onRecover) {
      onRecover(cartData.cartId);
    }
    
    // Hide the recovery notification
    setShowRecovery(false);
    setIsRecovering(false);
  };

  const handleDismiss = () => {
    setShowRecovery(false);
    // Optionally clear the cart data if user dismisses
    // CartPersistence.clearCartData();
  };

  if (!showRecovery) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              Cart Recovery
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              We found items in your cart from a previous session. Would you like to restore them?
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleRecover}
                disabled={isRecovering}
                className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRecovering ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Restoring...
                  </>
                ) : (
                  'Restore Cart'
                )}
              </button>
              
              <button
                onClick={handleDismiss}
                className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Dismiss
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartRecovery;
