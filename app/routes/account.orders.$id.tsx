// DEPRECATED: This route has been replaced with a modal in account.orders.tsx
// The order detail functionality is now handled via OrderDetailModal component
// This file can be removed once all references are updated

import {redirect} from 'react-router';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';

export async function loader({}: LoaderFunctionArgs) {
  // Redirect to orders list since details are now shown in modal
  return redirect('/account/orders');
}

export default function OrderDetailDeprecated() {
  // This component should never render due to the redirect
  return null;
}
