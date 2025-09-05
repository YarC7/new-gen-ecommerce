import {useLoaderData, Link, redirect} from 'react-router';
import type {
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from '@shopify/remix-oxygen';

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

  // Immediately redirect to Shopify's classic login page
  const url = new URL(request.url);
  const returnTo = url.searchParams.get('returnTo');
  
  let shopifyLoginUrl = `https://${context.env.PUBLIC_STORE_DOMAIN}/account/login`;
  
  if (returnTo) {
    const returnUrl = url.origin + '/account?returnTo=' + encodeURIComponent(returnTo);
    shopifyLoginUrl += '?return_url=' + encodeURIComponent(returnUrl);
  } else {
    // Default return to account page
    const returnUrl = url.origin + '/account';
    shopifyLoginUrl += '?return_url=' + encodeURIComponent(returnUrl);
  }

  return redirect(shopifyLoginUrl);
}
