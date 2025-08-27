import {Suspense} from 'react';
import {Await, NavLink} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

export function Footer({
  footer: footerPromise,
  header,
  publicStoreDomain,
}: FooterProps) {
  return (
    <Suspense>
      <Await resolve={footerPromise}>
        {(footer) => (
          <footer className="bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100 mt-auto">
            <div className="max-w-7xl mx-auto px-4">
              {/* Main Footer Content */}
              <div className="grid grid-cols-1 gap-8 py-12 md:grid-cols-2 lg:grid-cols-4">
                {/* Brand Section */}
                <div className="flex flex-col gap-4">
                  <div className="relative inline-block">
                    <span className="text-2xl font-bold bg-gradient-to-br from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                      {header.shop.name}
                    </span>
                    <div className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-sm"></div>
                  </div>
                  <p className="text-gray-300 leading-relaxed max-w-xs">
                    Experience premium quality products with modern design and
                    exceptional craftsmanship.
                  </p>
                  <div className="flex gap-4 mt-4">
                    <button className="flex items-center justify-center w-10 h-10 bg-white/10 text-gray-100 rounded-full transition-all duration-300 hover:bg-gradient-to-br hover:from-indigo-500 hover:to-purple-600 hover:-translate-y-0.5 hover:shadow-lg" aria-label="Facebook">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </button>
                    <button className="flex items-center justify-center w-10 h-10 bg-white/10 text-gray-100 rounded-full transition-all duration-300 hover:bg-gradient-to-br hover:from-indigo-500 hover:to-purple-600 hover:-translate-y-0.5 hover:shadow-lg" aria-label="Twitter">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                    </button>
                    <button className="flex items-center justify-center w-10 h-10 bg-white/10 text-gray-100 rounded-full transition-all duration-300 hover:bg-gradient-to-br hover:from-indigo-500 hover:to-purple-600 hover:-translate-y-0.5 hover:shadow-lg" aria-label="Instagram">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.781c-.49 0-.928-.175-1.297-.49-.369-.315-.49-.753-.49-1.243 0-.49.121-.928.49-1.243.369-.315.807-.49 1.297-.49s.928.175 1.297.49c.369.315.49.753.49 1.243 0 .49-.121.928-.49 1.243-.369.315-.807.49-1.297.49z" />
                      </svg>
                    </button>
                    <button className="flex items-center justify-center w-10 h-10 bg-white/10 text-gray-100 rounded-full transition-all duration-300 hover:bg-gradient-to-br hover:from-indigo-500 hover:to-purple-600 hover:-translate-y-0.5 hover:shadow-lg" aria-label="YouTube">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
                  <FooterMenu
                    menu={footer?.menu}
                    primaryDomainUrl={header.shop.primaryDomain.url}
                    publicStoreDomain={publicStoreDomain}
                  />
                </div>

                {/* Customer Service */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Customer Service</h3>
                  <ul className="flex flex-col gap-2">
                    <li>
                      <a href="/pages/contact" className="text-gray-300 no-underline transition-colors duration-300 hover:text-indigo-400 text-sm">
                        Contact Us
                      </a>
                    </li>
                    <li>
                      <a href="/pages/shipping" className="text-gray-300 no-underline transition-colors duration-300 hover:text-indigo-400 text-sm">
                        Shipping Info
                      </a>
                    </li>
                    <li>
                      <a href="/pages/returns" className="text-gray-300 no-underline transition-colors duration-300 hover:text-indigo-400 text-sm">
                        Returns
                      </a>
                    </li>
                    <li>
                      <a href="/pages/faq" className="text-gray-300 no-underline transition-colors duration-300 hover:text-indigo-400 text-sm">
                        FAQ
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Newsletter */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Stay Updated</h3>
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    Subscribe to our newsletter for exclusive offers and
                    updates.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 px-3 py-3 border border-white/20 bg-white/10 text-gray-100 rounded-lg text-sm transition-all duration-300 focus:outline-none focus:border-indigo-400 focus:bg-white/15 placeholder-gray-400"
                    />
                    <button className="flex items-center justify-center w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none rounded-lg cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer Bottom */}
              <div className="border-t border-white/10 py-6">
                <div className="flex flex-col gap-4 items-center text-center md:flex-row md:justify-between md:text-left">
                  <p className="text-gray-400 text-sm">
                    © {new Date().getFullYear()} {header.shop.name}. All rights
                    reserved.
                  </p>
                  <div className="flex gap-6 flex-wrap justify-center">
                    <a
                      href="/policies/privacy-policy"
                      className="text-gray-400 no-underline text-sm transition-colors duration-300 hover:text-indigo-400"
                    >
                      Privacy Policy
                    </a>
                    <a
                      href="/policies/terms-of-service"
                      className="text-gray-400 no-underline text-sm transition-colors duration-300 hover:text-indigo-400"
                    >
                      Terms of Service
                    </a>
                    <a
                      href="/policies/refund-policy"
                      className="text-gray-400 no-underline text-sm transition-colors duration-300 hover:text-indigo-400"
                    >
                      Refund Policy
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        )}
      </Await>
    </Suspense>
  );
}

function FooterMenu({
  menu,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  menu: FooterQuery['menu'];
  primaryDomainUrl: FooterProps['header']['shop']['primaryDomain']['url'];
  publicStoreDomain: string;
}) {
  return (
    <ul className="flex flex-col gap-2">
      {(menu || FALLBACK_FOOTER_MENU).items.map((item) => {
        if (!item.url) return null;
        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        const isExternal = !url.startsWith('/');
        return isExternal ? (
          <li key={item.id}>
            <a
              href={url}
              className="text-gray-300 no-underline transition-colors duration-300 hover:text-indigo-400 text-sm"
              rel="noopener noreferrer"
              target="_blank"
            >
              {item.title}
            </a>
          </li>
        ) : (
          <li key={item.id}>
            <NavLink end prefetch="intent" className="text-gray-300 no-underline transition-colors duration-300 hover:text-indigo-400 text-sm" to={url}>
              {item.title}
            </NavLink>
          </li>
        );
      })}
    </ul>
  );
}

const FALLBACK_FOOTER_MENU = {
  id: 'gid://shopify/Menu/199655620664',
  items: [
    {
      id: 'gid://shopify/MenuItem/461633060920',
      resourceId: 'gid://shopify/ShopPolicy/23358046264',
      tags: [],
      title: 'Privacy Policy',
      type: 'SHOP_POLICY',
      url: '/policies/privacy-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633093688',
      resourceId: 'gid://shopify/ShopPolicy/23358013496',
      tags: [],
      title: 'Refund Policy',
      type: 'SHOP_POLICY',
      url: '/policies/refund-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633126456',
      resourceId: 'gid://shopify/ShopPolicy/23358111800',
      tags: [],
      title: 'Shipping Policy',
      type: 'SHOP_POLICY',
      url: '/policies/shipping-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633159224',
      resourceId: 'gid://shopify/ShopPolicy/23358079032',
      tags: [],
      title: 'Terms of Service',
      type: 'SHOP_POLICY',
      url: '/policies/terms-of-service',
      items: [],
    },
  ],
};
