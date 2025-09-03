import {redirect, type LoaderFunctionArgs} from '@shopify/remix-oxygen';

export async function loader({context}: LoaderFunctionArgs) {
  // Redirect to Shopify's password recovery page
  const shopifyRecoverUrl = `https://${context.env.PUBLIC_STORE_DOMAIN}/account/recover`;
  return redirect(shopifyRecoverUrl);
}

export default function Recover() {
  // This component should never render since we always redirect
  return null;
}
