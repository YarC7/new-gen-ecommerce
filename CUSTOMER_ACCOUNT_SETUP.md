# Customer Account API Setup Guide

## Overview
This guide helps you set up Shopify's Customer Account API for OAuth-based authentication in your Hydrogen app.

## Prerequisites
- Shopify store with Customer Account API enabled
- Development environment (Node.js, npm/yarn)

## Step 1: Shopify Admin Configuration

### Enable Customer Account API
1. Go to **Shopify Admin** → **Settings** → **Customer accounts**
2. Select **"New customer accounts"** 
3. Enable **Customer Account API**
4. Copy the following values:
   - **Client ID** (starts with `shp_`)
   - **API URL** (e.g., `https://shopify.com/70430687423`)

### Set Callback URL
Add your callback URL in Shopify Admin:
- **Development**: `http://localhost:3000/account/authorize`
- **Production**: `https://yourdomain.com/account/authorize`

## Step 2: Environment Variables

Create/update your `.env` file:

```env
# Required for Customer Account API
PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID=shp_your_client_id_here
PUBLIC_CUSTOMER_ACCOUNT_API_URL=https://shopify.com/your_shop_id_here

# Standard Shopify variables
PUBLIC_STORE_DOMAIN=your-store.myshopify.com
PUBLIC_STOREFRONT_ID=gid://shopify/Shop/your_shop_id
PUBLIC_STOREFRONT_API_TOKEN=your_storefront_token
PRIVATE_STOREFRONT_API_TOKEN=your_private_token
SESSION_SECRET=your_session_secret
```

## Step 3: Authentication Flow

The implementation includes:

### Routes Created/Updated:
- `app/routes/account.authorize.tsx` - OAuth callback handler
- `app/routes/account.login.tsx` - Login route with Customer Account API
- `app/routes/login.tsx` - Alternative login route
- `app/routes/account.tsx` - Protected account dashboard
- `app/routes/account.logout.tsx` - Logout handler

### Flow Diagram:
```
User clicks "Login" 
    ↓
customerAccount.login() 
    ↓
Redirect to Shopify OAuth 
    ↓
User authenticates on Shopify 
    ↓
Callback to /account/authorize 
    ↓
customerAccount.authorize() 
    ↓
Redirect to /account (logged in)
```

## Step 4: Development Testing

### Start Development Server:
```bash
npm run dev
# or
npx shopify hydrogen dev
```

### Test Authentication:
1. Visit `http://localhost:3000/login`
2. Click login button
3. Should redirect to Shopify OAuth
4. After authentication, should return to your app

## Step 5: Production Deployment

### Shopify Oxygen (Recommended):
```bash
npx shopify hydrogen deploy
```

### Custom Domain:
1. Update callback URL in Shopify Admin
2. Set production environment variables
3. Deploy to your hosting provider

## Troubleshooting

### Common Issues:

**Error: "Invalid client_id"**
- Check `PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID` is correct
- Ensure Customer Account API is enabled in Shopify Admin

**Error: "Invalid redirect_uri"**
- Verify callback URL matches exactly in Shopify Admin
- Check for trailing slashes or protocol mismatches

**Error: "Authorization failed"**
- Check network connectivity
- Verify environment variables are loaded
- Check browser console for detailed errors

### Debug Mode:
Enable detailed logging by adding to your loader:
```typescript
console.log('Customer Account API URL:', context.env.PUBLIC_CUSTOMER_ACCOUNT_API_URL);
console.log('Client ID:', context.env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID);
```

## Benefits of Customer Account API

✅ **Better UX**: Users stay within your app  
✅ **Brand Consistency**: Full control over login experience  
✅ **Modern Architecture**: OAuth 2.0 standard  
✅ **Rich Data Access**: Full customer profile via GraphQL  
✅ **Mobile Optimized**: Better mobile experience  
✅ **Performance**: Faster than redirect-based flows  

## Fallback Strategy

The implementation includes automatic fallback to classic Shopify login if Customer Account API fails, ensuring reliability.

## Support

- [Shopify Customer Account API Documentation](https://shopify.dev/docs/api/customer)
- [Hydrogen Authentication Guide](https://shopify.dev/docs/custom-storefronts/hydrogen/authentication)
