# Hydrogen React Router E-commerce Setup Guide

This is a modern Shopify Hydrogen e-commerce store built with **React Router v7** (not Remix). Follow this guide to get your store up and running.

## ✅ What's Already Implemented

Your codebase now includes:

### 🛍️ Core E-commerce Features

- **Homepage** with hero section, featured collections, and products
- **Product catalog** with collection browsing and individual product pages
- **Shopping cart** with add/remove/update functionality using Hydrogen's optimistic updates
- **Search functionality** with both regular and predictive search
- **Responsive design** with Tailwind CSS

### 🎯 Routes Created

- `/` - Homepage with featured content
- `/collections` - All collections overview
- `/collections/[handle]` - Individual collection pages
- `/products/[handle]` - Product detail pages with variant selection
- `/search` - Search results with pagination
- `/cart` - Shopping cart page

### 🧩 Components

- Modern product cards with pricing
- Cart functionality with optimistic updates
- Search forms with predictive search
- Responsive navigation and layout

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Required: Your Shopify store domain (without https://)
PUBLIC_STORE_DOMAIN=your-shop-name.myshopify.com

# Required: Storefront API access token
PUBLIC_STOREFRONT_API_TOKEN=your_storefront_access_token

# Required: Your checkout domain (usually same as store domain)
PUBLIC_CHECKOUT_DOMAIN=your-shop-name.myshopify.com

# Required: Storefront ID for analytics
PUBLIC_STOREFRONT_ID=your_storefront_id

# Required: Session secret for cart functionality
SESSION_SECRET=your_random_session_secret_here

# Development settings
NODE_ENV=development
```

### 3. Get Your Shopify Credentials

#### A. Store Domain

Your store domain is your Shopify store URL: `your-shop-name.myshopify.com`

#### B. Storefront API Token

1. Go to your Shopify Admin
2. Navigate to Apps > Manage private apps (or App development)
3. Create a private app or use an existing one
4. Enable Storefront API access
5. Copy the Storefront access token

#### C. Storefront ID

You can find this in your Shopify admin or use the Shopify CLI:

```bash
shopify app info
```

### 4. Start Development Server

```bash
npm run dev
```

Your store should now be running at `http://localhost:3000`

## 🔧 Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Type checking
npm run typecheck

# Generate GraphQL types
npm run codegen
```

## 📁 Project Structure

```
app/
├── components/          # Reusable UI components
│   ├── CartMain.tsx    # Main cart component
│   ├── Header.tsx      # Site header with navigation
│   ├── ProductPrice.tsx # Product pricing component
│   └── ...
├── routes/             # File-based routing
│   ├── _index.tsx      # Homepage
│   ├── collections.*  # Collection pages
│   ├── products.*      # Product pages
│   ├── search.tsx      # Search functionality
│   └── cart.tsx        # Shopping cart
├── lib/                # Utility functions and GraphQL
│   ├── fragments.ts    # GraphQL fragments
│   ├── search.ts       # Search utilities
│   └── ...
└── styles/             # CSS styles
    ├── app.css         # Main styles
    ├── tailwind.css    # Tailwind imports
    └── reset.css       # CSS reset
```

## 🎨 Customization

### Styling

- The project uses **Tailwind CSS 4** for styling
- Main styles are in `app/styles/app.css`
- Components use Tailwind utility classes
- Colors, fonts, and spacing can be customized in the Tailwind config

### GraphQL Queries

- All GraphQL queries are in the route files
- Common fragments are in `app/lib/fragments.ts`
- Use the Shopify Storefront API documentation for reference

### Components

- All components are in `app/components/`
- They're built with TypeScript and React
- Use Hydrogen components where possible for better performance

## 🔍 Features Deep Dive

### Cart Functionality

- Uses Hydrogen's `useOptimisticCart` for immediate UI updates
- Supports add/remove/update operations
- Persistent across sessions using Shopify's cart API

### Search

- **Regular search**: Full-text search with pagination
- **Predictive search**: Real-time suggestions as you type
- Searches products, collections, pages, and articles

### Product Pages

- Dynamic variant selection
- Image galleries
- Add to cart functionality
- SEO-optimized with meta tags

## 🚀 Deployment

### Using Shopify Oxygen (Recommended)

```bash
npm run build
shopify app deploy
```

### Using Other Platforms

The app is built with Vite and can be deployed to:

- Vercel
- Netlify
- Cloudflare Pages
- Any Node.js hosting platform

## 🛠️ Troubleshooting

### Common Issues

1. **"Cart not found" errors**: Make sure your `SESSION_SECRET` is set
2. **GraphQL errors**: Check your Storefront API token permissions
3. **Images not loading**: Verify your store domain is correct
4. **Build errors**: Run `npm run typecheck` to check for TypeScript issues

### Getting Help

- Check the [Hydrogen documentation](https://shopify.dev/docs/custom-storefronts/hydrogen)
- Review [React Router v7 docs](https://reactrouter.com)
- Use the Shopify Community forums

## 📈 Next Steps

Your store is now ready for development! Consider adding:

- **User authentication** with customer accounts
- **Blog/CMS integration** for content marketing
- **Advanced filtering** for product collections
- **Wishlist functionality**
- **Multi-language support**
- **Analytics and tracking**
- **SEO optimization**
- **Performance monitoring**

Happy building! 🎉
