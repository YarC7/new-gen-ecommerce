import {redirect} from 'react-router';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';

export async function loader({request}: LoaderFunctionArgs) {
  return redirect('/collections');
}

export default function CollectionsAll() {
  return null;
}
