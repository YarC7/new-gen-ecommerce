import {redirect} from 'react-router';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';

export async function loader({context, request}: LoaderFunctionArgs) {
  const {customerAccount} = context;
  const isLoggedIn = await customerAccount.isLoggedIn();

  if (isLoggedIn) {
    // Check if there's a returnTo parameter
    const url = new URL(request.url);
    const returnTo = url.searchParams.get('returnTo');

    if (returnTo) {
      return redirect(returnTo);
    }

    return redirect('/account');
  }

  // Redirect to Shopify's customer registration page
  const url = new URL(request.url);
  const returnTo = url.searchParams.get('returnTo');

  let shopifyRegisterUrl = `https://${context.env.PUBLIC_STORE_DOMAIN}/account/register`;

  // If there's a returnTo parameter, preserve it through the registration flow
  if (returnTo) {
    const returnUrl =
      url.origin +
      '/account/authorize?returnTo=' +
      encodeURIComponent(returnTo);
    shopifyRegisterUrl += '?return_url=' + encodeURIComponent(returnUrl);
  } else {
    const returnUrl = url.origin + '/account/authorize';
    shopifyRegisterUrl += '?return_url=' + encodeURIComponent(returnUrl);
  }

  return redirect(shopifyRegisterUrl);
}

export default function Register() {
  // This component should never render since we always redirect

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to registration...</p>
      </div>
    </div>
  );
}
