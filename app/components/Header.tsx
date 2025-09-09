import {Suspense, useState, useRef, useEffect} from 'react';
import {Await, NavLink, Link} from 'react-router';

import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {InlineSearch} from '~/components/InlineSearch';
import {CartPopover} from '~/components/cart/CartPopover';
import {
  Search,
  Menu,
  X,
  ShoppingCart,
  User,
  ChevronDown,
  Package,
  MapPin,
  Settings,
  LogOut,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) inputRef.current?.focus();
  }, [isSearchOpen]);

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
          <div className="flex-1" />
          {/* Navigation Menu */}
          <HeaderMenu
            menu={menu}
            viewport="desktop"
            primaryDomainUrl={shop.primaryDomain.url}
            publicStoreDomain={publicStoreDomain}
          />

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search and Header Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="flex items-center">
                <div
                  className={[
                    'relative overflow-hidden transition-all duration-500 ease-in-out',
                    isSearchOpen ? 'w-80 opacity-100' : 'w-0 opacity-0',
                  ].join(' ')}
                >
                  <input
                    ref={inputRef}
                    type="search"
                    placeholder="Search for services..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    onBlur={() => {
                      if (!searchTerm.trim()) {
                        setTimeout(() => {
                          setIsSearchOpen(false);
                          setShouldShowResults(false);
                        }, 150);
                      }
                    }}
                    className={[
                      'w-full px-4 py-2 pl-10 pr-4 text-sm',
                      'bg-white/80 dark:bg-gray-900/70 backdrop-blur',
                      'border border-gray-200 dark:border-gray-700 rounded-full',
                      'placeholder-gray-400 dark:placeholder-gray-500',
                      'focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:shadow-lg',
                      'transition-all duration-300 ease-in-out',
                      isSearchOpen
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-95',
                    ].join(' ')}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (isSearchOpen && !searchTerm.trim()) {
                      setIsSearchOpen(false);
                      setShouldShowResults(false);
                    } else {
                      setIsSearchOpen((v) => !v);
                    }
                  }}
                  aria-label="Toggle search"
                  className={[
                    'p-2 text-muted-foreground hover:text-foreground rounded-md',
                    'transition-all duration-300 ease-in-out transform hover:scale-110',
                    isSearchOpen ? 'ml-2' : 'ml-0',
                  ].join(' ')}
                >
                  <Search
                    className={[
                      'h-5 w-5 transition-all duration-300 ease-in-out',
                      isSearchOpen
                        ? 'rotate-90 scale-90'
                        : 'rotate-0 scale-100',
                    ].join(' ')}
                  />
                </button>
              </div>

              {/* Desktop Search Dropdown - positioned relative to search bar */}
              {isSearchOpen && shouldShowResults && (
                <div className="absolute top-full right-0 mt-2 w-80 z-50 animate-in slide-in-from-top-2 duration-300">
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
              className={[
                'p-2 text-muted-foreground hover:text-foreground rounded-md',
                'transition-all duration-300 ease-in-out transform hover:scale-110',
                isSearchOpen ? 'text-foreground' : '',
              ].join(' ')}
            >
              <Search
                className={[
                  'h-5 w-5 transition-all duration-300 ease-in-out',
                  isSearchOpen ? 'rotate-90 scale-90' : 'rotate-0 scale-100',
                ].join(' ')}
              />
            </button>
            <HeaderActions isLoggedIn={isLoggedIn} cart={cart} />
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div
          className={[
            'lg:hidden overflow-hidden transition-all duration-500 ease-in-out',
            isSearchOpen ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0',
          ].join(' ')}
        >
          <div className="px-4 pb-4 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
                className={[
                  'w-full px-4 py-3 pl-12 pr-4 text-sm bg-muted border border-input rounded-lg',
                  'focus:ring-2 focus:ring-ring focus:border-input outline-none',
                  'transition-all duration-300 ease-in-out transform',
                  isSearchOpen
                    ? 'translate-y-0 scale-100'
                    : 'translate-y-2 scale-95',
                ].join(' ')}
              />
            </div>

            {/* Mobile Search Dropdown */}
            {shouldShowResults && (
              <div className="absolute top-full left-4 right-4 mt-1 z-50 animate-in slide-in-from-top-2 duration-300">
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
        </div>

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
            className="text-muted-foreground font-medium text-sm py-2"
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

function HeaderActions({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
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
          <button
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
          </button>
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
            className="relative p-2 text-muted-foreground transition-colors rounded-md"
            title="Sign in to your account"
          >
            <User className="h-5 w-5" />
          </NavLink>
        }
      >
        {(isLoggedIn) => {
          if (isLoggedIn) {
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md flex items-center space-x-1">
                    <User className="h-5 w-5" />
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/account/orders" className="flex items-center">
                      <Package className="mr-2 h-4 w-4" />
                      <span>Orders</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/account/addresses" className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4" />
                      <span>Addresses</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/account/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <form
                      action="/account/logout"
                      method="post"
                      className="w-full"
                    >
                      <button
                        type="submit"
                        className="flex items-center text-red-600 w-full text-left px-2 py-1.5 text-sm"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign out</span>
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            );
          } else {
            return (
              <NavLink
                prefetch="intent"
                to="/login"
                className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md"
                title="Sign in to your account"
              >
                <User className="h-5 w-5" />
              </NavLink>
            );
          }
        }}
      </Await>
    </Suspense>
  );
}

function CartBadge({count}: {count: number}) {
  return (
    <Link
      to="/cart"
      className="relative px-2 text-muted-foreground hover:text-foreground transition-colors rounded-md"
    >
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
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
      id: 'gid://shopify/MenuItem/461609599035',
      resourceId: null,
      tags: [],
      title: 'Contact',
      type: 'HTTP',
      url: '/contact',
      items: [],
    },
  ],
};
