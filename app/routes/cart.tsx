import {useLoaderData, Link, redirect} from 'react-router';
import type {
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from '@shopify/remix-oxygen';
import {CartLines} from '~/components/cart/CartLines';
import {CartSummary} from '~/components/cart/CartSummary';
import {CartForm} from '@shopify/hydrogen';

export async function loader({context}: LoaderFunctionArgs) {
  const {cart} = context;
  
  console.log('Cart loader called at:', new Date().toISOString());
  console.log('Cart loader - current cart session ID:', await cart.getCartId());
  
  const cartData = await cart.get();

  console.log('Cart loader - retrieved cart data:', {
    id: cartData?.id,
    totalQuantity: cartData?.totalQuantity,
    linesCount: cartData?.lines?.nodes?.length,
    hasItems: (cartData?.totalQuantity || 0) > 0,
    timestamp: new Date().toISOString(),
  });

  return {cart: cartData};
}

export async function action({request, context}: ActionFunctionArgs) {
  const {cart} = context;
  const formData = await request.formData();

  console.log('Form data keys:', Array.from(formData.keys()));
  console.log('All form data:', Object.fromEntries(formData.entries()));

  // Get action and inputs from CartForm format
  const cartFormInput = formData.get('cartFormInput');
  let action: string | null = null;
  let inputs: any = {};

  if (cartFormInput) {
    const parsed = JSON.parse(cartFormInput as string) as any;
    action = parsed.action;
    inputs = parsed.inputs || {};
  }

  console.log('Cart action received:', action);
  console.log('Cart inputs received:', inputs);

  try {
    const currentCartId = await cart.getCartId();
    console.log('Cart action - cartId at start:', currentCartId);

    let result;

    switch (action) {
      case CartForm.ACTIONS.LinesAdd: {
        const lines = inputs.lines || [];
        console.log('Adding lines to cart:', lines);

        if (!lines || lines.length === 0) {
          throw new Response('Lines data is required', {status: 400});
        }

        result = await cart.addLines(lines);
        console.log('Add lines result:', result);
        break;
      }
      case CartForm.ACTIONS.LinesUpdate: {
        const lines = inputs.lines || [];
        console.log('Updating lines in cart:', lines);

        if (!lines || lines.length === 0) {
          throw new Response('Lines data is required', {status: 400});
        }

        result = await cart.updateLines(lines);
        console.log('Update lines result:', result);
        break;
      }
      case CartForm.ACTIONS.LinesRemove: {
        const lineIds = inputs.lineIds || [];
        console.log('Removing lines from cart:', lineIds);

        if (!lineIds || lineIds.length === 0) {
          throw new Response('Line IDs are required', {status: 400});
        }

        const currentCart = await cart.get();
        if (!currentCartId || !currentCart || currentCart.totalQuantity === 0) {
          console.log('Skipping removeLines: no cartId or cart is empty.');
          // Create a fake result to proceed to the session clearing logic
          result = {cart: currentCart || {totalQuantity: 0, id: ''}, errors: []};
        } else {
          result = await cart.removeLines(lineIds);
          console.log('Remove lines result:', result);
        }
        
        // Check for errors in the result
        if (result.errors && result.errors.length > 0) {
          console.error('Cart remove lines errors:', result.errors);
          throw new Response('Failed to remove items from cart', {status: 400});
        }
        
        break;
      }
      case CartForm.ACTIONS.DiscountCodesUpdate: {
        const discountCodes = inputs.discountCodes || [];
        console.log('Updating discount codes:', discountCodes);

        result = await cart.updateDiscountCodes(discountCodes);
        console.log('Update discount codes result:', result);
        break;
      }
      default: {
        throw new Response(`Unknown cart action: ${action}`, {status: 400});
      }
    }

    console.log('Cart action completed');
    console.log('Cart action - cartId after mutation:', await cart.getCartId());
    
    // Check if cart operation was successful
    if (!result.cart) {
      console.error('Cart operation failed - no cart in result:', result);
      throw new Response('Cart operation failed', {status: 400});
    }
    
    console.log('Result cart state:', {
      id: result.cart.id,
      totalQuantity: result.cart.totalQuantity,
      linesCount: result.cart.lines?.nodes?.length || 0,
    });

    // Only store cart ID if cart has items, otherwise clear session
    let headers;
    if (result.cart.totalQuantity > 0) {
      headers = cart.setCartId(result.cart.id);
      console.log('Cart has items, storing cart ID in session');
    } else {
      // Clear the cart session when empty to prevent restoration
      headers = cart.setCartId('');
      console.log('Cart is empty, clearing cart ID from session');
    }
    
    console.log('Cart action result:', {
      cartId: result.cart.id,
      totalQuantity: result.cart.totalQuantity,
      isEmpty: result.cart.totalQuantity === 0,
    });

    // For fetcher submissions, avoid redirecting to keep the UI smooth.
    // Return a JSON response with the Set-Cookie headers so the session persists.
    const responseHeaders = new Headers(headers);
    responseHeaders.set('Content-Type', 'application/json');
    const body = JSON.stringify({
      ok: true,
      cart: {
        id: result.cart.id,
        totalQuantity: result.cart.totalQuantity,
      },
    });
    return new Response(body, {status: 200, headers: responseHeaders});
  } catch (error) {
    console.error('Cart action error:', error);

    if (error instanceof Response) {
      throw error;
    }

    throw new Response('Cart action failed', {status: 500});
  }
}

export default function Cart() {
  const {cart} = useLoaderData<typeof loader>();

  console.log('Cart component render - cart data:', {
    id: cart?.id,
    totalQuantity: cart?.totalQuantity,
    linesCount: cart?.lines?.nodes?.length,
    hasItems: (cart?.totalQuantity || 0) > 0,
    timestamp: new Date().toISOString(),
  });



  if (!cart || cart.totalQuantity === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-32">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-medium text-gray-900 mb-8">
              Your cart is empty
            </h1>

            <Link
              to="/collections"
              className="inline-block px-6 py-3 bg-black text-white font-medium text-sm hover:bg-gray-800 transition-colors"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold">Your cart</h1>
          <Link
            to="/collections"
            className="text-sm font-medium text-white underline hover:text-gray-200"
          >
            Continue shopping
          </Link>
        </div>

        {/* Cart Content */}
        <div>
          <CartLines lines={cart.lines.nodes} layout="page" />
          <CartSummary cart={cart} />
        </div>
      </div>
    </div>
  );
}
