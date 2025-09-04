import {Suspense, useState, useEffect} from 'react';
import {Await, NavLink, Link} from 'react-router';
import {type CartViewPayload, useAnalytics} from '@shopify/hydrogen';

import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {InlineSearch} from '~/components/InlineSearch';
import {useCartUI} from './cart/CartUIProvider';
import {CartPopover} from '~/components/cart/CartPopover';
import {cn} from '~/lib/utils';
import {Search, Menu, X, ShoppingCart, User} from 'lucide-react';

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
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
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
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold text-sm">
                {shop.name.charAt(0)}
              </div>
              <span className="text-xl font-bold text-foreground">
                {shop.name}
              </span>
            </div>
          </NavLink>

          {/* Navigation Menu */}
          <HeaderMenu
            menu={menu}
            viewport="desktop"
            primaryDomainUrl={shop.primaryDomain.url}
            publicStoreDomain={publicStoreDomain}
          />

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search for services..."
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
                className="w-full px-4 py-2 pl-10 pr-4 text-sm bg-muted border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-input outline-none transition-colors"
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
            className="p-2 text-muted-foreground hover:text-foreground rounded-md transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          {/* Mobile Logo */}
          <NavLink
            prefetch="intent"
            to="/"
            className="text-inherit no-underline flex items-center"
            end
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold text-sm">
                {shop.name.charAt(0)}
              </div>
              <span className="text-lg font-bold text-foreground">
                {shop.name}
              </span>
            </div>
          </NavLink>

          {/* Mobile Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-muted-foreground hover:text-foreground rounded-md transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>
            <HeaderActions isLoggedIn={isLoggedIn} cart={cart} />
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="lg:hidden px-4 pb-4 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search for services..."
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
                className="w-full px-4 py-3 pl-10 pr-4 text-sm bg-muted border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-input outline-none transition-colors"
              />
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
          <div className="lg:hidden border-t border-border py-4">
            <HeaderMenu
              menu={menu}
              viewport="mobile"
              primaryDomainUrl={shop.primaryDomain.url}
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
  menu: HeaderQuery['menu'];
  primaryDomainUrl: HeaderQuery['shop']['primaryDomain']['url'];
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
            className="text-muted-foreground hover:text-foreground font-medium text-sm transition-colors duration-200 py-2"
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
        <div className="relative p-2 text-muted-foreground">
          <User className="h-5 w-5 animate-pulse" />
        </div>
      }
    >
      <Await
        resolve={isLoggedIn}
        errorElement={
          <NavLink
            prefetch="intent"
            to="/login"
            className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md"
            title="Sign in to your account"
          >
            <User className="h-5 w-5" />
          </NavLink>
        }
      >
        {(isLoggedIn) => (
          <NavLink
            prefetch="intent"
            to={isLoggedIn ? '/account' : '/login'}
            className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md"
            title={isLoggedIn ? 'My Account' : 'Sign in to your account'}
          >
            <User className="h-5 w-5" />
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
      className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md"
    >
      <ShoppingCart className="h-5 w-5" />
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
