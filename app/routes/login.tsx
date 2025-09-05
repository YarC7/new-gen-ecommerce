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

  // Use classic Shopify login instead of Customer Account API OAuth
  const url = new URL(request.url);
  const returnTo = url.searchParams.get('returnTo') || '/account';

  // Store returnTo in session for after login
  const session = context.session;
  session.set('returnTo', returnTo);

  // Redirect to classic Shopify login
  const shopifyLoginUrl = `https://${context.env.PUBLIC_STORE_DOMAIN}/account/login`;

  console.log('🔗 Redirecting to classic Shopify login:', shopifyLoginUrl);
  console.log('🏠 Return To:', returnTo);

  return redirect(shopifyLoginUrl, {
    headers: {
      'Set-Cookie': await session.commit(),
    },
  });
}

export default function Login() {
  // This component should never render since we always redirect to OAuth

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  );
}
