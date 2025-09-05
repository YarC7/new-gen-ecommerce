import {redirect, type LoaderFunctionArgs} from '@shopify/remix-oxygen';

export async function loader({context, request}: LoaderFunctionArgs) {
  const {customerAccount, cart} = context;

  // Check if user is logged in
  const isLoggedIn = await customerAccount.isLoggedIn();

  if (!isLoggedIn) {
    // Store the current URL to redirect back after login
    const url = new URL(request.url);
    const returnTo = url.searchParams.get('returnTo') || '/checkout';

    // Redirect to login page with return URL
    return redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  }

  // Get the cart to access checkout URL
  const cartData = await cart.get();

  if (!cartData || !cartData.checkoutUrl) {
    // If no cart or checkout URL, redirect to cart page
    return redirect('/cart');
  }

  // If user is logged in and cart has checkout URL, redirect to Shopify checkout
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
