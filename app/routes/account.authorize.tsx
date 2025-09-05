import {redirect} from 'react-router';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';

export async function loader({context, request}: LoaderFunctionArgs) {
  const {customerAccount, session} = context;

  // Since we're using classic Shopify login, this route just checks login status
  // and redirects accordingly

  try {
    const isLoggedIn = await customerAccount.isLoggedIn();

    if (isLoggedIn) {
      console.log('Customer is logged in via classic Shopify login');

      // Get returnTo URL from session
      const returnTo = session.get('returnTo') || '/account';

      // Clear returnTo from session
      session.unset('returnTo');

      console.log('Redirecting logged in customer to:', returnTo);

      return redirect(returnTo, {
        headers: {
          'Set-Cookie': await session.commit(),
        },
      });
    } else {
      console.log('Customer not logged in, redirecting to login');
      return redirect('/login');
    }
  } catch (error) {
    console.error('Account authorization error:', error);
    return redirect('/login?error=auth_failed');
  }
}

export default function AccountAuthorize() {
  // This component should never render since we always redirect
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}
