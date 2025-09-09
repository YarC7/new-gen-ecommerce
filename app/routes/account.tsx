import {Outlet, redirect} from 'react-router';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';

export async function loader({context}: LoaderFunctionArgs) {
  const {customerAccount} = context;

  console.log('Account layout loader called');
  console.log('Customer account available:', !!customerAccount);

  try {
    const isLoggedIn = await customerAccount.isLoggedIn();
    console.log('User is logged in (account layout):', isLoggedIn);

    if (!isLoggedIn) {
      console.log('User not logged in, redirecting to login');
      return redirect('/login');
    }

    console.log('User is logged in, allowing access to account');
    return {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    };
  } catch (error) {
    console.error('Account layout error:', error);
    return redirect('/login');
  }
}

export default function AccountLayout() {
  return <Outlet />;
}
