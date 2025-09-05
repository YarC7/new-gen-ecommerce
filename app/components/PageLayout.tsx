import {Await, Link} from 'react-router';
import {Suspense, useId} from 'react';
import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
} from 'storefrontapi.generated';
import {Footer} from '~/components/Footer';
import {CartAside} from '~/components/cart/CartAside';
import {Header, HeaderMenu} from '~/components/Header';
import {useLocation} from 'react-router';

interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  children?: React.ReactNode;
}

export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
  publicStoreDomain,
}: PageLayoutProps) {
  const location = useLocation();
  const pathname = location?.pathname || '';
  const isAuthRoute = (() => {
    const authPaths = [
      '/login',
      '/account/login',
      '/account/authorize',
      '/account/logout',
      '/register',
      '/account/recover',
    ];
    return authPaths.some(
      (p) => pathname === p || pathname.startsWith(p + '/')
    );
  })();
  return (
    <>
      {header && !isAuthRoute && (
        <Header
          header={header}
          cart={cart}
          isLoggedIn={isLoggedIn}
          publicStoreDomain={publicStoreDomain}
        />
      )}
            <CartAside />
      <main>{children}</main>
      {/* <Footer
        footer={footer}
        header={header}
        publicStoreDomain={publicStoreDomain}
      /> */}
    </>
  );
}

