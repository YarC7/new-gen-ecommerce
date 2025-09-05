import {redirect, type LoaderFunctionArgs} from '@shopify/remix-oxygen';

export async function loader({context, request}: LoaderFunctionArgs) {
  const {customerAccount, cart} = context;

  // Get the cart to access checkout URL
  const cartData = await cart.get();

  if (!cartData || !cartData.checkoutUrl) {
    // If no cart or checkout URL, redirect to cart page
    return redirect('/cart');
  }

  if (cartData.totalQuantity === 0) {
    // If cart is empty, redirect to cart page
    return redirect('/cart');
  }

  // Check if user is logged in (optional for checkout)
  const isLoggedIn = await customerAccount.isLoggedIn();

  console.log('Checkout redirect:', {
    cartId: cartData.id,
    totalQuantity: cartData.totalQuantity,
    isLoggedIn,
    checkoutUrl: cartData.checkoutUrl,
    flow: isLoggedIn ? 'authenticated_checkout' : 'guest_checkout',
  });

  // Create final checkout URL
  let finalCheckoutUrl = cartData.checkoutUrl;

  // Add logged_in=true parameter if customer is authenticated
  // This pre-fills customer info and enables order tracking
  if (isLoggedIn) {
    const url = new URL(cartData.checkoutUrl);
    url.searchParams.set('logged_in', 'true');
    finalCheckoutUrl = url.toString();

    console.log('✅ Authenticated checkout: Customer info will be pre-filled');
  } else {
    console.log('🛒 Guest checkout: Customer can checkout without account');
  }

  console.log('Redirecting to Shopify checkout:', finalCheckoutUrl);

  // Redirect to Shopify checkout (supports both guest and authenticated users)
  return redirect(finalCheckoutUrl);
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
