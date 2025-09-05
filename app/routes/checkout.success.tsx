import {useLoaderData, Link} from 'react-router';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {json} from '@shopify/remix-oxygen';

export async function loader({context, request}: LoaderFunctionArgs) {
  const {customerAccount} = context;
  const url = new URL(request.url);
  
  // Get order information from URL parameters (if available)
  const orderId = url.searchParams.get('order_id');
  const orderNumber = url.searchParams.get('order_number');
  
  // Check if customer is logged in
  const isLoggedIn = await customerAccount.isLoggedIn();
  
  let customer = null;
  let recentOrder = null;
  
  if (isLoggedIn) {
    try {
      // Get customer information
      customer = await customerAccount.get();
      
      // If we have an order ID, try to fetch order details
      if (orderId) {
        // Note: You might need to implement order fetching via Customer Account API
        // For now, we'll just store the order ID
        console.log('Order completed:', {orderId, orderNumber});
      }
    } catch (error) {
      console.error('Error fetching customer/order data:', error);
    }
  }

  return json({
    orderId,
    orderNumber,
    customer,
    isLoggedIn,
  });
}

export default function CheckoutSuccess() {
  const {orderId, orderNumber, customer, isLoggedIn} = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Thank you for your order!
          </h1>
          
          {customer && (
            <p className="text-lg text-gray-600 mb-6">
              Hi {customer.firstName || 'there'}, your order has been confirmed.
            </p>
          )}

          {/* Order Details */}
          {(orderId || orderNumber) && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
              
              {orderNumber && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-medium text-gray-900">#{orderNumber}</span>
                </div>
              )}
              
              {orderId && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-medium text-gray-900 text-sm">{orderId}</span>
                </div>
              )}
            </div>
          )}

          {/* Next Steps */}
          <div className="text-left mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What's next?</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                You'll receive an order confirmation email shortly
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                We'll send you shipping updates as your order is processed
              </li>
              {isLoggedIn && (
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Track your order anytime in your account
                </li>
              )}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {isLoggedIn ? (
              <Link
                to="/account/orders"
                className="inline-block w-full bg-indigo-600 text-white py-3 px-6 rounded-md font-medium hover:bg-indigo-700 transition-colors"
              >
                View Your Orders
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-block w-full bg-indigo-600 text-white py-3 px-6 rounded-md font-medium hover:bg-indigo-700 transition-colors"
              >
                Create Account to Track Orders
              </Link>
            )}
            
            <Link
              to="/products"
              className="inline-block w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-md font-medium hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>

          {/* Support */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Need help? Contact our{' '}
              <Link to="/contact" className="text-indigo-600 hover:text-indigo-800 font-medium">
                customer support team
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
