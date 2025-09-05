import {Outlet, redirect} from 'react-router';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';

export async function loader({context}: LoaderFunctionArgs) {
  const {customerAccount} = context;
  const isLoggedIn = await customerAccount.isLoggedIn();

  if (!isLoggedIn) {
    return redirect('/login');
  }

  return {};
}

export default function AccountLayout() {
  return <Outlet />;
}
