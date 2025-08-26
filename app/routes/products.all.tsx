import {redirect} from 'react-router';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';

export async function loader({request}: LoaderFunctionArgs) {
  return redirect('/products');
}

export default function ProductsAll() {
  return null;
}
