import {useLoaderData, Link} from 'react-router';
import type {
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from '@shopify/remix-oxygen';
import {CartMain} from '~/components/CartMain';
import {CartForm} from '@shopify/hydrogen';

export async function loader({context}: LoaderFunctionArgs) {
  const {cart} = context;
  const cartData = await cart.get();

  return {cart: cartData};
}

export async function action({request, context}: ActionFunctionArgs) {
  const {cart} = context;
  const formData = await request.formData();
  const action = formData.get('cartAction');

  switch (action) {
    case 'LinesAdd': {
      const lines = JSON.parse(formData.get('lines') as string) as any[];
      return await cart.addLines(lines);
    }
    case 'LinesUpdate': {
      const lines = JSON.parse(formData.get('lines') as string) as any[];
      return await cart.updateLines(lines);
    }
    case 'LinesRemove': {
      const lineIds = JSON.parse(formData.get('lineIds') as string) as string[];
      return await cart.removeLines(lineIds);
    }
    case 'DiscountCodesUpdate': {
      const discountCodes = JSON.parse(formData.get('discountCodes') as string) as string[];
      return await cart.updateDiscountCodes(discountCodes);
    }
    default:
      throw new Response('Invalid cart action', {status: 400});
  }
}

export default function Cart() {
  const {cart} = useLoaderData<typeof loader>();

  if (!cart || cart.totalQuantity === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Your Cart</h1>
          <p className="text-gray-600 mb-8">Your cart is currently empty.</p>
          <a
            href="/collections"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      <CartMain layout="page" cart={cart} />
    </div>
  );
}
