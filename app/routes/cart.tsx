import {useLoaderData, Link, redirect} from 'react-router';
import type {
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from '@shopify/remix-oxygen';
import {CartMain} from '~/components/CartMain';
import {CartForm} from '@shopify/hydrogen';
import {CartPersistence} from '~/lib/cart-persistence';
import {useEffect} from 'react';

export async function loader({context}: LoaderFunctionArgs) {
  const {cart} = context;
  const cartData = await cart.get();

  console.log('Cart loader - cart data:', {
    id: cartData?.id,
    totalQuantity: cartData?.totalQuantity,
    linesCount: cartData?.lines?.nodes?.length,
    hasItems: (cartData?.totalQuantity || 0) > 0
  });

  return {cart: cartData};
}

export async function action({request, context}: ActionFunctionArgs) {
  const {cart} = context;
  const formData = await request.formData();
  
  console.log('Form data keys:', Array.from(formData.keys()));
  console.log('All form data:', Object.fromEntries(formData.entries()));

  // Try to get action from different possible field names
  let action = formData.get('cartAction');
  
  // If cartAction is null, try to get it from cartFormInput
  if (!action) {
    const cartFormInput = formData.get('cartFormInput');
    if (cartFormInput) {
      try {
        const parsedInput = JSON.parse(cartFormInput as string) as any;
        action = parsedInput.action;
        console.log('Parsed cartFormInput:', parsedInput);
      } catch (error) {
        console.error('Error parsing cartFormInput:', error);
      }
    }
  }

  console.log('Cart action received:', action);

  try {
    let result;
    
    switch (action) {
      case 'LinesAdd': {
        let linesData = formData.get('lines');
        
        // If lines is not directly available, try to get it from cartFormInput
        if (!linesData) {
          const cartFormInput = formData.get('cartFormInput');
          if (cartFormInput) {
            try {
              const parsedInput = JSON.parse(cartFormInput as string) as any;
              linesData = JSON.stringify(parsedInput.inputs?.lines || []);
              console.log('Lines from cartFormInput:', parsedInput.inputs?.lines);
            } catch (error) {
              console.error('Error parsing lines from cartFormInput:', error);
            }
          }
        }
        
        console.log('Lines data:', linesData);
        
        if (!linesData) {
          throw new Response('Lines data is required', {status: 400});
        }

        const lines = JSON.parse(linesData as string) as any[];
        console.log('Parsed lines:', lines);
        
        result = await cart.addLines(lines);
        console.log('Add lines result:', result);
        break;
      }
      case 'LinesUpdate': {
        let linesData = formData.get('lines');
        
        // If lines is not directly available, try to get it from cartFormInput
        if (!linesData) {
          const cartFormInput = formData.get('cartFormInput');
          if (cartFormInput) {
            try {
              const parsedInput = JSON.parse(cartFormInput as string) as any;
              linesData = JSON.stringify(parsedInput.inputs?.lines || []);
            } catch (error) {
              console.error('Error parsing lines from cartFormInput:', error);
            }
          }
        }
        
        console.log('Update lines data:', linesData);
        
        if (!linesData) {
          throw new Response('Lines data is required', {status: 400});
        }

        const lines = JSON.parse(linesData as string) as any[];
        console.log('Parsed update lines:', lines);
        
        result = await cart.updateLines(lines);
        console.log('Update lines result:', result);
        break;
      }
      case 'LinesRemove': {
        let lineIdsData = formData.get('lineIds');
        
        // If lineIds is not directly available, try to get it from cartFormInput
        if (!lineIdsData) {
          const cartFormInput = formData.get('cartFormInput');
          if (cartFormInput) {
            try {
              const parsedInput = JSON.parse(cartFormInput as string) as any;
              lineIdsData = JSON.stringify(parsedInput.inputs?.lineIds || []);
            } catch (error) {
              console.error('Error parsing lineIds from cartFormInput:', error);
            }
          }
        }
        
        console.log('Remove lineIds data:', lineIdsData);
        
        if (!lineIdsData) {
          throw new Response('Line IDs are required', {status: 400});
        }

        const lineIds = JSON.parse(lineIdsData as string) as string[];
        console.log('Parsed lineIds:', lineIds);
        
        result = await cart.removeLines(lineIds);
        console.log('Remove lines result:', result);
        break;
      }
      case 'DiscountCodesUpdate': {
        let discountCodesData = formData.get('discountCodes');
        
        // If discountCodes is not directly available, try to get it from cartFormInput
        if (!discountCodesData) {
          const cartFormInput = formData.get('cartFormInput');
          if (cartFormInput) {
            try {
              const parsedInput = JSON.parse(cartFormInput as string) as any;
              discountCodesData = JSON.stringify(parsedInput.inputs?.discountCodes || []);
            } catch (error) {
              console.error('Error parsing discountCodes from cartFormInput:', error);
            }
          }
        }
        
        console.log('Discount codes data:', discountCodesData);
        
        if (!discountCodesData) {
          throw new Response('Discount codes are required', {status: 400});
        }

        const discountCodes = JSON.parse(discountCodesData as string) as string[];
        console.log('Parsed discount codes:', discountCodes);
        
        result = await cart.updateDiscountCodes(discountCodes);
        console.log('Update discount codes result:', result);
        break;
      }
      default:
        console.error('Invalid cart action:', action);
        throw new Response(`Invalid cart action: ${action}`, {status: 400});
    }

    // Save cart data for persistence after successful action
    if (result?.cart?.id) {
      // Note: We can't directly call CartPersistence here since this is server-side
      // The cart data will be saved client-side when the component re-renders
      console.log('Cart action completed successfully, cart ID:', result.cart.id);
    }
    
    // Return proper response
    return redirect('/cart');
  } catch (error) {
    console.error('Cart action error:', error);
    
    if (error instanceof Response) {
      throw error;
    }
    
    throw new Response(`Cart action failed: ${error instanceof Error ? error.message : 'Unknown error'}`, {status: 500});
  }
}

export default function Cart() {
  const {cart} = useLoaderData<typeof loader>();

  console.log('Cart component - cart data:', {
    id: cart?.id,
    totalQuantity: cart?.totalQuantity,
    linesCount: cart?.lines?.nodes?.length,
    hasItems: (cart?.totalQuantity || 0) > 0
  });

  // Save cart data for persistence when cart changes
  useEffect(() => {
    if (cart?.id && typeof window !== 'undefined') {
      CartPersistence.updateCartData(cart.id, cart.totalQuantity || 0);
      console.log('Cart data saved for persistence:', {
        cartId: cart.id,
        totalQuantity: cart.totalQuantity
      });
    }
  }, [cart?.id, cart?.totalQuantity]);

  if (!cart || cart.totalQuantity === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            {/* Empty Cart Icon */}
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                  />
                </svg>
              </div>
            </div>

            {/* Empty Cart Content */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added anything to your cart yet. Let's find something amazing for you!
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/collections"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                Start Shopping
              </Link>
              
              <Link
                to="/products"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-300 hover:border-indigo-500 hover:text-indigo-600 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Browse Products
              </Link>
            </div>

            {/* Additional Features */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Fast Delivery</h3>
                <p className="text-sm text-gray-600">Get your orders delivered within 2-3 business days</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Quality Guarantee</h3>
                <p className="text-sm text-gray-600">30-day return policy on all products</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">24/7 Support</h3>
                <p className="text-sm text-gray-600">Get help anytime with our customer service</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Shopping Cart</h1>
          <p className="text-gray-600">
            You have <span className="font-semibold text-indigo-600">{cart.totalQuantity}</span> item{cart.totalQuantity !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        {/* Cart Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Cart Items</h2>
              </div>
              <CartMain layout="page" cart={cart} />
            </div>
          </div>

          {/* Cart Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
              
              {/* Cart Totals */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">
                    {cart.cost?.subtotalAmount?.amount ? (
                      <span className="text-lg font-bold text-indigo-600">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: cart.cost.subtotalAmount.currencyCode,
                        }).format(parseFloat(cart.cost.subtotalAmount.amount))}
                      </span>
                    ) : (
                      '-'
                    )}
                  </span>
                </div>
                
                {cart.cost?.totalTaxAmount?.amount && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: cart.cost.totalTaxAmount.currencyCode,
                      }).format(parseFloat(cart.cost.totalTaxAmount.amount))}
                    </span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-2xl text-indigo-600">
                      {cart.cost?.totalAmount?.amount ? (
                        new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: cart.cost.totalAmount.currencyCode,
                        }).format(parseFloat(cart.cost.totalAmount.amount))
                      ) : (
                        '-'
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              {cart.checkoutUrl && (
                <a
                  href={cart.checkoutUrl}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  Proceed to Checkout
                </a>
              )}

              {/* Continue Shopping */}
              <div className="mt-4">
                <Link
                  to="/collections"
                  className="w-full bg-white text-gray-700 font-semibold py-3 px-6 rounded-lg border-2 border-gray-300 hover:border-indigo-500 hover:text-indigo-600 transition-all duration-300 flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  Continue Shopping
                </Link>
              </div>

              {/* Security Badge */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span className="text-sm text-green-800 font-medium">
                    Secure Checkout
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
