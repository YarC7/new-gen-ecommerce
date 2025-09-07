# Shopify Hydrogen Storefront Implementation Guide

This comprehensive guide details how to build a modern e-commerce storefront using Shopify Hydrogen, React, and the Storefront API.

---

## 0) Executive Summary

- **Goal:** Build a high-performance headless storefront using Hydrogen and React that leverages Shopify's Storefront API and Checkout
- **Scope:** Complete web application with Customer Accounts, Cart/Checkout, Product pages, Collections, Search, and Analytics
- **Tech Stack:**
  - Hydrogen (React-based framework with Remix)
  - TypeScript for type safety
  - Tailwind CSS for styling
  - Shopify Storefront API for data
  - GraphQL with auto-generated types

- **Key Features:**
  - Server-side rendering (SSR) for optimal performance
  - Streaming for enhanced user experience
  - Built-in SEO optimization and performance monitoring
  - Modern customer account management with OAuth
  - **Checkout**: Shopify hosted checkout via `cart.checkoutUrl` with customer login persistence
  - **Customer Accounts**: New Customer Account API (OAuth) vs Classic (Storefront API) vs Multipass (Plus)
  - **Inventory & Product Data**: Storefront API (read) + optional Admin API via private app for operations
  - **Performance**: Built-in caching, image optimization, and code splitting
  - **Security**: Content Security Policy and privacy compliance
  - **Developer Experience**: GraphQL Codegen, TypeScript types, and modern tooling

---

## 1) Architecture Overview

### 1.1 Project Structure

```
app/
├── entry.client.tsx       # Client-side entry point
├── entry.server.tsx      # Server-side entry point
├── root.tsx             # Root layout component
├── routes/              # Application routes
│   ├── _index.tsx       # Homepage
│   ├── products/        # Product-related routes
│   ├── collections/     # Collection routes
│   └── account/         # Customer account routes
├── components/          # Reusable components
│   ├── cart/           # Cart-related components
│   ├── product/        # Product components
│   └── layout/         # Layout components
├── lib/                # Utility functions and hooks
├── styles/            # Global styles and Tailwind config
└── graphql/           # GraphQL queries and mutations
```

### 1.2 Data Flow Architecture

```
[Client Browser]
       ↑
       | HTTP/GraphQL
       ↓
[Hydrogen Server (SSR)]
       ↑
       | GraphQL
       ↓
[Shopify Storefront API]
       |
       ├── Products & Collections
       ├── Cart Operations
       ├── Customer Accounts
       └── Checkout Flow
```

### 1.3 Key Operations Flow

1. **Product & Collection Data**

   ```typescript
   // Example product query
   const PRODUCT_QUERY = `#graphql
     query Product($handle: String!) {
       product(handle: $handle) {
         id
         title
         description
         ...
       }
     }
   `;
   ```

2. **Cart Operations**

   ```typescript
   // Example cart creation
   const cartCreate = async () => {
     const {cart} = await storefront.mutate(CREATE_CART_MUTATION);
     return cart;
   };
   ```

3. **Customer Authentication**
   ```typescript
   // Example login mutation
   const LOGIN_MUTATION = `#graphql
     mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
       customerAccessTokenCreate(input: $input) {
         customerAccessToken {
           accessToken
           expiresAt
         }
         ...
       }
     }
   `;
   ```

### 1.4 Environments

- **Dev**, **Staging**, **Production** with distinct Shopify shops or development storefront tokens.

---

## 2) Getting Started

### 2.1 Prerequisites

1. **Development Environment**
   - Node.js 16.14.0 or higher
   - npm or yarn package manager
   - Git for version control
   - VS Code (recommended) with extensions:
     - ESLint
     - Prettier
     - GraphQL
     - Tailwind CSS IntelliSense

2. **Shopify Setup**
   - A Shopify store (development or production)
   - Storefront API access with public token
   - Customer Accounts enabled (if using account features)
   - Products and collections configured

### 2.2 Initial Setup

1. **Create New Project**

   ```bash
   npm create @shopify/hydrogen@latest
   ```

2. **Project Configuration**

   ```bash
   cd your-project-name
   npm install
   ```

3. **Environment Setup**
   Create `.env` file:
   ```env
   PUBLIC_STORE_DOMAIN=your-store.myshopify.com
   PUBLIC_STOREFRONT_API_TOKEN=your_storefront_api_token
   ```

---

## 3) Core Implementation

### 3.1 Project Configuration

1. **Server Configuration** (`server.ts` or worker file)

   ```typescript
   import {createRequestHandler} from '@shopify/remix-oxygen';
   import {
     createStorefrontClient,
     createCustomerAccountClient,
     createCartHandler,
   } from '@shopify/hydrogen';
   import {getStorefrontHeaders} from '@shopify/remix-oxygen';

   export default {
     async fetch(
       request: Request,
       env: Env,
       executionContext: ExecutionContext,
     ): Promise<Response> {
       const cache = await caches.open('hydrogen');
       const waitUntil = (p: Promise<any>) => executionContext.waitUntil(p);

       // Create Storefront API client
       const {storefront} = createStorefrontClient({
         cache,
         waitUntil,
         i18n: {language: 'EN', country: 'US'},
         publicStorefrontToken: env.PUBLIC_STOREFRONT_API_TOKEN,
         privateStorefrontToken: env.PRIVATE_STOREFRONT_API_TOKEN,
         storeDomain: `https://${env.PUBLIC_STORE_DOMAIN}`,
         storefrontApiVersion: env.PUBLIC_STOREFRONT_API_VERSION || '2024-01',
         storefrontId: env.PUBLIC_STOREFRONT_ID,
         storefrontHeaders: getStorefrontHeaders(request), // Required for proper headers
       });

       // Create Customer Account API client (for new customer accounts)
       const customerAccount = createCustomerAccountClient({
         storefrontToken: env.PUBLIC_STOREFRONT_API_TOKEN,
         customerAccountApiToken: env.CUSTOMER_ACCOUNT_API_TOKEN,
         customerAccountApiVersion: '2024-01',
         customerAccountApiUrl: env.CUSTOMER_ACCOUNT_API_URL,
         request,
         waitUntil,
       });

       // Create cart handler with customer account integration
       const cart = createCartHandler({
         storefront,
         customerAccount: true, // Enables ?logged_in=true for checkout URLs
         getCartId: cartGetIdDefault(request.headers),
         setCartId: cartSetIdDefault(),
         customMethods: {
           // Custom cart methods (no longer __unstable)
         },
       });

       // ... rest of request handler setup
     },
   };
   ```

2. **TypeScript Config** (`tsconfig.json`)

   ```json
   {
     "include": ["**/*.ts", "**/*.tsx"],
     "compilerOptions": {
       "target": "ES2022",
       "lib": ["DOM", "DOM.Iterable", "ES2022"],
       "module": "ESNext",
       "jsx": "react-jsx",
       "strict": true,
       "moduleResolution": "Bundler",
       "paths": {
         "~/*": ["./app/*"]
       }
     }
   }
   ```

3. **GraphQL Codegen Setup** (`codegen.ts`)

   ```typescript
   import type {CodegenConfig} from '@graphql-codegen/cli';
   import {pluckConfig, preset, getSchema} from '@shopify/hydrogen-codegen';
   import {storefrontApiCustomScalars} from '@shopify/hydrogen-react';

   export default {
     overwrite: true,
     pluckConfig,
     generates: {
       'storefrontapi.generated.d.ts': {
         preset,
         schema: getSchema('storefront'),
         documents: [
           './*.{ts,tsx,js,jsx}',
           './app/**/*.{ts,tsx,js,jsx}',
           '!./app/graphql/customer-account/*.{ts,tsx,js,jsx}',
         ],
         config: {
           scalars: storefrontApiCustomScalars, // Improved scalar types
         },
       },
       'customeraccountapi.generated.d.ts': {
         preset,
         schema: getSchema('customer-account'),
         documents: ['./app/graphql/customer-account/*.{ts,tsx,js,jsx}'],
       },
     },
   } as CodegenConfig;
   ```

4. **Tailwind Setup** (`tailwind.config.js`)

   ```javascript
   /** @type {import('tailwindcss').Config} */
   export default {
     content: ['./app/**/*.{js,ts,jsx,tsx}'],
     theme: {
       extend: {},
     },
     plugins: [],
   };
   ```

5. **Privacy and Consent Configuration**
   ```typescript
   // In your root loader
   return defer({
     // ... other data
     consent: {
       checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
       storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
       withPrivacyBanner: true, // Required if using Shopify's cookie banner
       country: context.storefront.i18n.country,
       language: context.storefront.i18n.language,
     },
   });
   ```

### 3.2 Core Technologies

- **Framework**: Hydrogen (React + Remix + Vite)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Data Fetching**: Built-in Storefront API client with GraphQL
- **Type Safety**: GraphQL Codegen with auto-generated TypeScript types
- **State Management**: React hooks + Context + Remix loaders/actions
- **Routing**: File-based routing (Remix-style)
- **Authentication**: Customer Account API (OAuth) + Classic Storefront API
- **Cart Management**: Built-in cart handler with customer account integration
- **Performance**: Server-side rendering, streaming, caching, image optimization
- **Testing**: Vitest + Playwright + React Testing Library
- **Deployment**: Oxygen (Shopify's hosting platform) + Cloudflare Workers
- **Security**: Content Security Policy, privacy compliance, secure headers

---

## 4) Feature Implementation

### 4.1 Product Listing Pages (PLP)

1. **Collection Route** (`app/routes/collections.$handle.tsx`)

   ```typescript
   export async function loader({params, context}: LoaderArgs) {
     const {handle} = params;
     const {collection} = await context.storefront.query(COLLECTION_QUERY, {
       variables: {handle},
     });
     return json({collection});
   }
   ```

2. **Product Grid Component** (`app/components/ProductGrid.tsx`)
   ```typescript
   export function ProductGrid({products}: {products: Product[]}) {
     return (
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {products.map((product) => (
           <ProductCard key={product.id} product={product} />
         ))}
       </div>
     );
   }
   ```

### 4.2 Product Detail Pages (PDP)

1. **Product Route** (`app/routes/products.$handle.tsx`)

   ```typescript
   export async function loader({params, context}: LoaderArgs) {
     const {handle} = params;
     const {product} = await context.storefront.query(PRODUCT_QUERY, {
       variables: {handle},
     });
     return json({product});
   }
   ```

2. **Product Gallery Component**
   ```typescript
   export function ProductGallery({media}: {media: ProductMedia[]}) {
     return (
       <div className="grid gap-4">
         {media.map((media) => (
           <ProductImage key={media.id} image={media} />
         ))}
       </div>
     );
   }
   ```

### 4.3 Cart Implementation

1. **Modern Cart Handler** (`server.ts`)

   ```typescript
   // In your server configuration
   const cart = createCartHandler({
     storefront,
     customerAccount: true, // Enables customer login persistence to checkout
     getCartId: cartGetIdDefault(request.headers),
     setCartId: cartSetIdDefault({
       httpOnly: true,
       secure: process.env.NODE_ENV === 'production',
       sameSite: 'Strict',
       maxAge: 60 * 60 * 24 * 30, // 30 days
     }),
     customMethods: {
       // Custom cart methods are now stable (no __unstable suffix)
       addLineByOptions: async (productId, selectedOptions, quantity) => {
         // Custom implementation for adding by options
         const variantId = await findVariantByOptions(
           productId,
           selectedOptions,
         );
         return cart.addLines([{merchandiseId: variantId, quantity}]);
       },
     },
   });
   ```

2. **Cart Route Actions** (`app/routes/cart.tsx`)

   ```typescript
   import {json, type ActionFunctionArgs} from '@shopify/remix-oxygen';

   export async function action({request, context}: ActionFunctionArgs) {
     const {cart} = context;
     const formData = await request.formData();
     const cartAction = formData.get('cartAction');

     let result;
     switch (cartAction) {
       case 'ADD_TO_CART':
         const lines = JSON.parse(String(formData.get('lines')));
         result = await cart.addLines(lines);
         break;
       case 'REMOVE_FROM_CART':
         const lineIds = JSON.parse(String(formData.get('lineIds')));
         result = await cart.removeLines(lineIds);
         break;
       case 'UPDATE_CART':
         const updates = JSON.parse(String(formData.get('lines')));
         result = await cart.updateLines(updates);
         break;
       default:
         throw new Error(`Unknown cart action: ${cartAction}`);
     }

     // Improved error handling
     if (result.errors?.length) {
       return json({cart: result.cart, errors: result.errors}, {status: 400});
     }

     return json({cart: result.cart});
   }
   ```

3. **Cart UI Components with React Hooks**

   ```typescript
   import {useCart} from '@shopify/hydrogen-react';

   export function AddToCartButton({variantId, quantity = 1}: {variantId: string; quantity?: number}) {
     const {linesAdd, status} = useCart();

     const handleAddToCart = () => {
       linesAdd([{merchandiseId: variantId, quantity}]);
     };

     return (
       <button
         onClick={handleAddToCart}
         disabled={status === 'updating'}
         className="bg-black text-white px-4 py-2 rounded"
       >
         {status === 'updating' ? 'Adding...' : 'Add to Cart'}
       </button>
     );
   }
   ```

---

## 5) Advanced Features

### 5.1 Search Implementation

1. **Predictive Search** (`app/components/SearchFormPredictive.tsx`)

   ```typescript
   export function SearchFormPredictive() {
     const [searchTerm, setSearchTerm] = useState('');
     const {results} = usePredictiveSearch(searchTerm);

     return (
       <div className="relative">
         <input
           type="search"
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           placeholder="Search..."
         />
         {results && <SearchResults results={results} />}
       </div>
     );
   }
   ```

2. **Search Results Page** (`app/routes/search.tsx`)

   ```typescript
   export async function loader({request, context}: LoaderArgs) {
     const searchParams = new URL(request.url).searchParams;
     const searchTerm = searchParams.get('q') || '';

     const {products} = await context.storefront.query(SEARCH_QUERY, {
       variables: {query: searchTerm},
     });

     return json({products});
   }
   ```

### 5.2 Performance Optimization

1. **Modern Image Optimization with Custom Loaders**

   ```typescript
   import {Image} from '@shopify/hydrogen';

   // Custom loader for external CDNs
   const customLoader = ({src, width, height, crop}: {src: string; width?: number; height?: number; crop?: string}) => {
     return `${src}?w=${width}&h=${height}&gravity=${crop}`;
   };

   export function OptimizedImage({data, sizes, className}: {data: any; sizes?: string; className?: string}) {
     return (
       <Image
         data={data}
         sizes={sizes}
         loader={customLoader} // For non-Shopify CDNs
         loading="lazy"
         decoding="async"
         className={className}
       />
     );
   }
   ```

2. **Caching and Performance**

   ```typescript
   // In your server configuration
   const {storefront} = createStorefrontClient({
     cache, // Built-in caching
     waitUntil,
     // Cache control headers
     cacheControl: {
       default: 'public, max-age=3600', // 1 hour
       long: 'public, max-age=86400', // 1 day
       short: 'public, max-age=300', // 5 minutes
     },
     // ... other config
   });
   ```

3. **Route-based Code Splitting (Built-in with Remix)**

   ```typescript
   // Automatic code splitting with Remix file-based routing
   // Each route file is automatically split

   // For dynamic imports in components
   import {lazy, Suspense} from 'react';

   const HeavyComponent = lazy(() => import('./HeavyComponent'));

   export function MyComponent() {
     return (
       <Suspense fallback={<div>Loading...</div>}>
         <HeavyComponent />
       </Suspense>
     );
   }
   ```

4. **Content Security Policy**

   ```typescript
   import {createContentSecurityPolicy} from '@shopify/hydrogen';

   const csp = createContentSecurityPolicy({
     // Custom rules now extend defaults instead of overriding
     scriptSrc: ['https://trusted-scripts.com'],
     styleSrc: ['https://trusted-styles.com'],
   });
   ```

### 5.3 SEO Implementation

1. **Meta Tags** (`app/components/Seo.tsx`)

   ```typescript
   export function Seo({
     title,
     description,
     url,
     imageUrl,
   }: SeoProps) {
     return (
       <>
         <title>{title}</title>
         <meta name="description" content={description} />
         <meta property="og:title" content={title} />
         <meta property="og:description" content={description} />
         <meta property="og:image" content={imageUrl} />
         <meta property="og:url" content={url} />
       </>
     );
   }
   ```

2. **Structured Data**
   ```typescript
   export function ProductJsonLd({product}: {product: Product}) {
     return (
       <script
         type="application/ld+json"
         dangerouslySetInnerHTML={{
           __html: JSON.stringify({
             '@context': 'https://schema.org',
             '@type': 'Product',
             name: product.title,
             description: product.description,
             // ... more product data
           }),
         }}
       />
     );
   }
   ```

---

## 6) Customer Account Implementation

### 6.1 Modern Customer Account Strategy

**Choose Your Authentication Approach:**

1. **New Customer Account API (Recommended)** - OAuth-based, headless-friendly
2. **Classic Customer Accounts** - Storefront API-based, simpler but limited
3. **Multipass** - For Shopify Plus stores with external authentication

### 6.2 New Customer Account API Implementation

1. **Account Authorization Route** (`app/routes/account.authorize.tsx`)

   ```typescript
   import {redirect, type LoaderFunctionArgs} from '@shopify/remix-oxygen';

   export async function loader({context}: LoaderFunctionArgs) {
     const {customerAccount} = context;

     // Handle the OAuth callback
     return await customerAccount.authorize();
   }
   ```

2. **Custom Login Page** (`app/routes/account.login.tsx`)

   ```typescript
   import {json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs} from '@shopify/remix-oxygen';

   export async function loader({context}: LoaderFunctionArgs) {
     const {customerAccount} = context;

     // Check if already logged in
     const isLoggedIn = await customerAccount.isLoggedIn();
     if (isLoggedIn) {
       return redirect('/account');
     }

     return json({});
   }

   export async function action({request, context}: ActionFunctionArgs) {
     const {customerAccount} = context;
     const formData = await request.formData();
     const email = String(formData.get('email'));

     try {
       // Initiate passwordless login (email code)
       const loginUrl = await customerAccount.login({
         email,
         // Optional: specify return URL
         return_to: '/account',
       });

       return redirect(loginUrl);
     } catch (error) {
       return json({error: 'Login failed'}, {status: 400});
     }
   }

   export default function Login() {
     return (
       <div className="max-w-md mx-auto">
         <h1>Sign In</h1>
         <form method="post">
           <input
             type="email"
             name="email"
             placeholder="Email"
             required
             className="w-full p-2 border rounded"
           />
           <button type="submit" className="w-full bg-black text-white p-2 rounded">
             Send Login Code
           </button>
         </form>
       </div>
     );
   }
   ```

3. **Custom Registration Page** (`app/routes/account.register.tsx`)

   ```typescript
   import {
     json,
     redirect,
     type ActionFunctionArgs,
   } from '@shopify/remix-oxygen';

   export async function action({request, context}: ActionFunctionArgs) {
     const {storefront} = context;
     const formData = await request.formData();

     const input = {
       email: String(formData.get('email')),
       firstName: String(formData.get('firstName')),
       lastName: String(formData.get('lastName')),
       password: String(formData.get('password')),
       acceptsMarketing: Boolean(formData.get('acceptsMarketing')),
     };

     try {
       const {customerCreate} = await storefront.mutate(
         CUSTOMER_CREATE_MUTATION,
         {
           variables: {input},
         },
       );

       if (customerCreate?.customerUserErrors?.length) {
         return json(
           {
             error: customerCreate.customerUserErrors[0].message,
           },
           {status: 400},
         );
       }

       // Redirect to login after successful registration
       return redirect('/account/login?message=account-created');
     } catch (error) {
       return json({error: 'Registration failed'}, {status: 500});
     }
   }

   const CUSTOMER_CREATE_MUTATION = `#graphql
     mutation customerCreate($input: CustomerCreateInput!) {
       customerCreate(input: $input) {
         customer {
           id
           email
         }
         customerUserErrors {
           field
           message
           code
         }
       }
     }
   `;
   ```

### 6.2 Classic Accounts – Core Mutations (GraphQL)

- `customerCreate`
- `customerAccessTokenCreate`
- `customerAccessTokenRenew`
- `customerAccessTokenDelete`
- `customerUpdate`
- `customerRecover` (password reset)

**Token Handling**

- Store `customerAccessToken` in HttpOnly cookie; renew proactively; logout = token delete + cookie clear.

### 6.3 New Customer Accounts – OAuth Flow (High Level)

1. Redirect to Shopify customer authorization URL with your app’s client_id.
2. User authenticates (email code / passkey / password depending on settings).
3. Shopify redirects back with code → exchange for access/refresh tokens.
4. Use Customer Account API to fetch profile, addresses, orders (headless-friendly).

---

## 7) Deployment & Production

### 7.1 Build & Deploy

1. **Production Build**

   ```bash
   npm run build
   ```

2. **Deploy to Oxygen (Shopify's Platform)**

   ```bash
   # Deploy to Oxygen
   npm run deploy

   # Or using Shopify CLI
   shopify hydrogen deploy
   ```

3. **Environment Variables for Production**

   ```env
   # Required for production
   PUBLIC_STORE_DOMAIN=your-store.myshopify.com
   PUBLIC_STOREFRONT_API_TOKEN=your_public_token
   PRIVATE_STOREFRONT_API_TOKEN=your_private_token
   PUBLIC_STOREFRONT_API_VERSION=2024-01
   PUBLIC_STOREFRONT_ID=your_storefront_id

   # Customer Account API (if using new accounts)
   CUSTOMER_ACCOUNT_API_TOKEN=your_customer_account_token
   CUSTOMER_ACCOUNT_API_URL=https://shopify.com/your-store-id

   # Privacy and checkout
   PUBLIC_CHECKOUT_DOMAIN=your-store.myshopify.com
   ```

4. **Performance Optimization for Production**
   ```typescript
   // Enable production optimizations
   const {storefront} = createStorefrontClient({
     // ... other config
     cacheControl: {
       default: 'public, max-age=3600',
       long: 'public, max-age=86400',
       short: 'public, max-age=300',
     },
   });
   ```

### 7.2 Performance Monitoring

1. **Core Web Vitals**

   ```typescript
   // app/root.tsx
   export function reportWebVitals({
     id,
     name,
     value,
   }: {
     id: string;
     name: string;
     value: number;
   }) {
     console.log(`Web Vital: ${name} = ${value}`);
     // Send to your analytics service
   }
   ```

2. **Enhanced Error Boundary with Logging**

   ```typescript
   import {isRouteErrorResponse, useRouteError} from '@remix-run/react';
   import {useEffect} from 'react';

   export function ErrorBoundary() {
     const error = useRouteError();

     // Log error to monitoring service
     useEffect(() => {
       if (error) {
         console.error('Route Error:', error);
         // Send to error tracking service (Sentry, LogRocket, etc.)
       }
     }, [error]);

     if (isRouteErrorResponse(error)) {
       return (
         <div className="error-container">
           <h1>
             {error.status} {error.statusText}
           </h1>
           <p>{error.data}</p>
         </div>
       );
     }

     return (
       <div className="error-container">
         <h1>Something went wrong</h1>
         <p>We're sorry, but something unexpected happened.</p>
       </div>
     );
   }
   ```

3. **Performance Monitoring Setup**

   ```typescript
   // Monitor Storefront API performance
   const performanceObserver = new PerformanceObserver((list) => {
     for (const entry of list.getEntries()) {
       if (entry.name.includes('storefront')) {
         console.log(`Storefront API call: ${entry.duration}ms`);
         // Send to monitoring service
       }
     }
   });

   performanceObserver.observe({entryTypes: ['measure']});
   ```

### 7.3 Analytics Integration

1. **Modern Shopify Analytics**

   ```typescript
   // Enhanced analytics with customer context
   export function reportAddToCart(product: Product, customer?: Customer) {
     if (typeof window !== 'undefined' && window.ShopifyAnalytics) {
       window.ShopifyAnalytics.publish('product_added_to_cart', {
         productId: product.id,
         variantId: product.selectedVariant.id,
         price: product.selectedVariant.price.amount,
         currency: product.selectedVariant.price.currencyCode,
         customerId: customer?.id,
         timestamp: new Date().toISOString(),
       });
     }
   }

   export function reportPurchase(order: Order) {
     if (typeof window !== 'undefined' && window.ShopifyAnalytics) {
       window.ShopifyAnalytics.publish('purchase', {
         orderId: order.id,
         orderNumber: order.orderNumber,
         totalPrice: order.totalPrice.amount,
         currency: order.totalPrice.currencyCode,
         lineItems: order.lineItems.map((item) => ({
           productId: item.variant.product.id,
           variantId: item.variant.id,
           quantity: item.quantity,
           price: item.variant.price.amount,
         })),
       });
     }
   }
   ```

2. **Customer Journey Tracking**

   ```typescript
   // Track customer authentication events
   export function trackCustomerLogin(customerId: string) {
     if (typeof window !== 'undefined' && window.ShopifyAnalytics) {
       window.ShopifyAnalytics.publish('customer_login', {
         customerId,
         timestamp: new Date().toISOString(),
       });
     }
   }

   // Track search events
   export function trackSearch(query: string, results: number) {
     if (typeof window !== 'undefined' && window.ShopifyAnalytics) {
       window.ShopifyAnalytics.publish('search', {
         query,
         resultsCount: results,
         timestamp: new Date().toISOString(),
       });
     }
   }
   ```

3. **Performance Analytics**

   ```typescript
   // Track page load performance
   export function trackPagePerformance(route: string) {
     if (typeof window !== 'undefined' && window.performance) {
       const navigation = window.performance.getEntriesByType(
         'navigation',
       )[0] as PerformanceNavigationTiming;

       const metrics = {
         route,
         loadTime: navigation.loadEventEnd - navigation.loadEventStart,
         domContentLoaded:
           navigation.domContentLoadedEventEnd -
           navigation.domContentLoadedEventStart,
         firstByte: navigation.responseStart - navigation.requestStart,
       };

       // Send to analytics
       console.log('Page Performance:', metrics);
     }
   }
   ```

---

## 8) Testing & Quality Assurance

### 8.1 Unit Testing

1. **Component Tests** (`app/components/__tests__/ProductCard.test.tsx`)

   ```typescript
   import {render, screen} from '@testing-library/react';
   import {ProductCard} from '../ProductCard';

   describe('ProductCard', () => {
     it('renders product information correctly', () => {
       const product = {
         title: 'Test Product',
         price: {amount: '10.00', currencyCode: 'USD'},
         images: [{url: 'test.jpg', altText: 'Test'}],
       };

       render(<ProductCard product={product} />);

       expect(screen.getByText('Test Product')).toBeInTheDocument();
       expect(screen.getByText('$10.00')).toBeInTheDocument();
     });
   });
   ```

### 8.2 E2E Testing

1. **Playwright Tests** (`tests/e2e/checkout.spec.ts`)

   ```typescript
   import {test, expect} from '@playwright/test';

   test('complete checkout flow', async ({page}) => {
     // Visit product page
     await page.goto('/products/test-product');

     // Add to cart
     await page.click('button[data-test="add-to-cart"]');

     // Go to checkout
     await page.click('a[data-test="checkout"]');

     // Verify checkout page
     expect(page.url()).toContain('checkout');
   });
   ```

### 8.3 Performance Testing

```typescript
// app/root.tsx
export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <NotFoundPage />;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
```

### 8.4 Monitoring & Logging

1. **Error Tracking**

   ```typescript
   export function logError(error: Error, context: any = {}) {
     console.error('Error:', {
       message: error.message,
       stack: error.stack,
       ...context,
     });
     // Send to your error tracking service
   }
   ```

2. **Performance Monitoring**
   ```typescript
   export function trackTiming(name: string, duration: number) {
     console.log(`Timing: ${name} took ${duration}ms`);
     // Send to your monitoring service
   }
   ```

---

## 9) Key Updates & Best Practices Summary

### 🚀 Critical Modern Patterns

1. **Server Configuration (REQUIRED)**
   ```typescript
   // Use getStorefrontHeaders instead of deprecated buyerIp/requestGroupId
   import {getStorefrontHeaders} from '@shopify/remix-oxygen';

   const {storefront} = createStorefrontClient({
     storefrontHeaders: getStorefrontHeaders(request), // Required
     // ... other config
   });
   ```

2. **Customer Account API (RECOMMENDED)**
   ```typescript
   // New Customer Account API for modern authentication
   const customerAccount = createCustomerAccountClient({
     customerAccountApiVersion: '2024-01',
     // ... config
   });
   ```

3. **Cart with Customer Integration**
   ```typescript
   const cart = createCartHandler({
     customerAccount: true, // Enables ?logged_in=true for checkout
     customMethods: {}, // No longer __unstable
   });
   ```

### 🔧 Essential Configurations

1. **GraphQL Codegen with Custom Scalars**
   ```typescript
   import {storefrontApiCustomScalars} from '@shopify/hydrogen-react';

   config: {
     scalars: storefrontApiCustomScalars, // Improved type safety
   }
   ```

2. **Privacy Banner (REQUIRED if using Shopify's banner)**
   ```typescript
   consent: {
     withPrivacyBanner: true, // Now required
   }
   ```

3. **Content Security Policy**
   ```typescript
   // Custom rules now extend defaults instead of overriding
   const csp = createContentSecurityPolicy({
     scriptSrc: ['https://trusted-scripts.com'],
   });
   ```

### 📊 Performance & Monitoring

- **Image Optimization**: Use custom loaders for external CDNs
- **Caching**: Configure cache control headers for optimal performance
- **Error Handling**: Implement proper error boundaries with logging
- **Analytics**: Track customer journey and performance metrics
- **B2B Support**: Use stable buyer context APIs

### 🔐 Security & Compliance

- **Headers**: Always use `getStorefrontHeaders` for proper request headers
- **Privacy**: Configure privacy banner and consent management
- **CSP**: Implement Content Security Policy for enhanced security
- **Error Logging**: Set up proper error tracking and monitoring

### 🎯 Next Steps

1. Update your server configuration with modern patterns
2. Implement Customer Account API for better authentication
3. Add GraphQL Codegen for improved type safety
4. Configure privacy and security settings
5. Set up monitoring and analytics
6. Test thoroughly with updated patterns

This guide now reflects the latest Shopify Hydrogen best practices and API changes as of 2024.
