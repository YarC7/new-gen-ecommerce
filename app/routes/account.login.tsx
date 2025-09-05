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

  // Use Customer Account API login method
  try {
    const loginUrl = await customerAccount.login();
    return loginUrl;
  } catch (error) {
    console.error('Customer Account API login error:', error);
    return redirect('/account?error=login_failed');
  }
}
