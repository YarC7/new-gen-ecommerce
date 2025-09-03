import {redirect, type LoaderFunctionArgs} from '@shopify/remix-oxygen';

export async function loader({context}: LoaderFunctionArgs) {
  const {customerAccount} = context;
  const isLoggedIn = await customerAccount.isLoggedIn();
  
  if (isLoggedIn) {
    return redirect('/account');
  }
  
  // Redirect to Shopify's customer registration page
  const shopifyRegisterUrl = `https://${context.env.PUBLIC_STORE_DOMAIN}/account/register`;
  return redirect(shopifyRegisterUrl);
}

export default function Register() {
  // This component should never render since we always redirect
  return null;
}
