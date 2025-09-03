import {Suspense, useState} from 'react';
import {Await, NavLink, Link} from 'react-router';
import {type CartViewPayload, useAnalytics} from '@shopify/hydrogen';

import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {InlineSearch} from '~/components/InlineSearch';
import {useCartUI} from './cart/CartUIProvider';
import {CartPopover} from '~/components/cart/CartPopover';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const {shop, menu} = header;
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [shouldShowResults, setShouldShowResults] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim().length >= 2) {
      setShouldShowResults(true);
      setIsSearchOpen(true);
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
      setShouldShowResults(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value.trim().length >= 3) {
      setShouldShowResults(true);
      setIsSearchOpen(true);
    } else {
      setShouldShowResults(false);
      if (value.trim().length === 0) {
        setIsSearchOpen(false);
      }
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink
            prefetch="intent"
            to="/"
            className="text-inherit no-underline flex items-center"
            end
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                {shop.name}
              </span>
            </div>
          </NavLink>

          {/* Navigation Menu */}
          <HeaderMenu
            menu={menu}
            viewport="desktop"
            primaryDomainUrl={header.shop.primaryDomain.url}
            publicStoreDomain={publicStoreDomain}
          />

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8 relative">
            <div className="relative">
              <input
                type="search"
                placeholder=" Search for some services..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => {
                  if (searchTerm.trim().length >= 3) {
                    setIsSearchOpen(true);
                    setShouldShowResults(true);
                  } else {
                    setIsSearchOpen(true);
                    setShouldShowResults(false);
                  }
                }}
                className="w-full px-4 py-2 pl-4 pr-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50"
              />
            </div>

            {/* Desktop Search Dropdown - positioned relative to search bar */}
            {isSearchOpen && shouldShowResults && (
              <div className="absolute top-full left-0 right-0 mt-1 z-50">
                <InlineSearch
                  isOpen={isSearchOpen && shouldShowResults}
                  onClose={() => {
                    setIsSearchOpen(false);
                    setShouldShowResults(false);
                  }}
                  searchTerm={searchTerm}
                />
              </div>
            )}
          </div>

          {/* Header Actions */}
          <HeaderActions isLoggedIn={isLoggedIn} cart={cart} />
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between h-16">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Mobile Logo */}
          <NavLink
            prefetch="intent"
            to="/"
            className="text-inherit no-underline flex items-center"
            end
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {shop.name}
              </span>
            </div>
          </NavLink>

          {/* Mobile Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
            <HeaderActions isLoggedIn={isLoggedIn} cart={cart} />
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="lg:hidden px-4 pb-4 relative">
            <div className="relative">
              <input
                type="search"
                placeholder="Tìm kiếm các service..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => {
                  if (searchTerm.trim().length >= 3) {
                    setIsSearchOpen(true);
                    setShouldShowResults(true);
                  } else {
                    setIsSearchOpen(true);
                    setShouldShowResults(false);
                  }
                }}
                className="w-full px-4 py-3 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Mobile Search Dropdown */}
            {shouldShowResults && (
              <div className="absolute top-full left-4 right-4 mt-1 z-50">
                <InlineSearch
                  isOpen={isSearchOpen && shouldShowResults}
                  onClose={() => {
                    setIsSearchOpen(false);
                    setShouldShowResults(false);
                  }}
                  searchTerm={searchTerm}
                />
              </div>
            )}
          </div>
        )}

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <HeaderMenu
              menu={menu}
              viewport="mobile"
              primaryDomainUrl={header.shop.primaryDomain.url}
              publicStoreDomain={publicStoreDomain}
            />
          </div>
        )}
      </div>
    </header>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: {
  menu: HeaderQuery['header']['menu'];
  primaryDomainUrl: HeaderQuery['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: string;
}) {
  if (viewport === 'mobile') return null;

  const activeLinkStyle = {
    fontWeight: 'bold',
    textDecoration: 'underline',
  };

  return (
    <nav className="hidden lg:flex items-center space-x-8" role="navigation">
      {(menu || FALLBACK_HEADER_MENU).items.map((item: any) => {
        if (!item.url) return null;

        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        return (
          <NavLink
            className="text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors duration-200 py-2"
            end
            key={item.id}
            prefetch="intent"
            style={activeLinkStyle}
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

function HeaderActions({isLoggedIn, cart}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  return (
    <div className="flex items-center space-x-4">

      {/* Cart */}
      <CartToggle cart={cart} />

      {/* Account */}
      <AccountToggle isLoggedIn={isLoggedIn} />
    </div>
  );
}

function CartToggle({cart}: {cart: Promise<CartApiQueryFragment | null>}) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        {(resolvedCart) => (
          <div
            className="relative"
            onMouseEnter={() => setIsPopoverOpen(true)}
            onMouseLeave={() => setIsPopoverOpen(false)}
          >
            <CartBadge count={resolvedCart?.totalQuantity || 0} />
            {isPopoverOpen && (
              <div className="absolute top-full right-0 mt-2 z-50">
                <CartPopover cart={resolvedCart} />
              </div>
            )}
          </div>
        )}
      </Await>
    </Suspense>
  );
}

function AccountToggle({isLoggedIn}: {isLoggedIn: Promise<boolean>}) {
  return (
    <Suspense
      fallback={
        <div className="relative flex items-center justify-center w-10 h-10 border-none bg-transparent text-gray-400 rounded-xl">
          <svg
            className="w-5 h-5 animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
      }
    >
      <Await
        resolve={isLoggedIn}
        errorElement={
          <NavLink
            prefetch="intent"
            to="/login"
            className="relative flex items-center justify-center w-10 h-10 border-none bg-transparent text-gray-600 rounded-xl transition-all duration-300 hover:bg-gray-100 hover:text-blue-600 active:scale-95"
            title="Sign in to your account"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </NavLink>
        }
      >
        {(isLoggedIn) => (
          <NavLink
            prefetch="intent"
            to={isLoggedIn ? '/account' : '/login'}
            className="relative flex items-center justify-center w-10 h-10 border-none bg-transparent text-gray-600 rounded-xl transition-all duration-300 hover:bg-gray-100 hover:text-blue-600 active:scale-95"
            title={isLoggedIn ? 'My Account' : 'Sign in to your account'}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </NavLink>
        )}
      </Await>
    </Suspense>
  );
}

function CartBadge({count}: {count: number}) {
  return (
    <Link
      to="/cart"
      className="relative flex items-center justify-center w-10 h-10 border-none bg-transparent text-gray-600 rounded-xl transition-all duration-300 hover:bg-gray-100 hover:text-blue-600 active:scale-95"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
        />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'iPhone',
      type: 'HTTP',
      url: '/collections/iphone',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609435192',
      resourceId: null,
      tags: [],
      title: 'MacBook',
      type: 'HTTP',
      url: '/collections/macbook',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609402424',
      resourceId: null,
      tags: [],
      title: 'iPad',
      type: 'HTTP',
      url: '/collections/ipad',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: null,
      tags: [],
      title: 'Apple Watch',
      type: 'HTTP',
      url: '/collections/apple-watch',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599033',
      resourceId: null,
      tags: [],
      title: 'AirPods',
      type: 'HTTP',
      url: '/collections/airpods',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599034',
      resourceId: null,
      tags: [],
      title: 'Phụ kiện',
      type: 'HTTP',
      url: '/collections/accessories',
      items: [],
    },
  ],
};
