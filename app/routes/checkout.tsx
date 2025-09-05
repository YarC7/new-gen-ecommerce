import {redirect, type LoaderFunctionArgs} from '@shopify/remix-oxygen';

export async function loader({context}: LoaderFunctionArgs) {
  const {cart} = context;

  // Get the cart to access checkout URL
  const cartData = await cart.get();

  if (!cartData || !cartData.checkoutUrl) {
    // If no cart or checkout URL, redirect to cart page
    return redirect('/cart');
  }

  // Allow guest checkout - redirect directly to Shopify checkout without login requirement
  return redirect(cartData.checkoutUrl);
}

export default function Checkout() {
  // This component should never render since we always redirect
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to checkout...</p>
      </div>
    </div>
  );
}
