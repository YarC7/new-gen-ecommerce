import {Await, useRouteLoaderData} from 'react-router';
import {Suspense} from 'react';
import type {RootLoader} from '~/root';
import {Aside} from '~/components/Aside';
import {CartMain} from './CartMain';
import {useCartUI} from './CartUIProvider';

export function CartAside() {
  const {cart} = useRouteLoaderData('root') as RootLoader;
  const {isCartOpen, closeCart} = useCartUI();

  return (
    <Aside heading="CART" isOpen={isCartOpen} onClose={closeCart}>
      <Suspense fallback={<p>Loading cart...</p>}>
        <Await resolve={cart}>
          {(data) => <CartMain cart={data} layout="aside" />}
        </Await>
      </Suspense>
    </Aside>
  );
}
