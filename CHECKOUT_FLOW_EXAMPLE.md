# Customer Account API + Shopify Checkout Flow

## Overview

Sử dụng Customer Account API cho authentication và Shopify Checkout cho payment processing.

## Flow Diagram

```
1. User Authentication (Customer Account API)
   ├── User clicks "Login"
   ├── Redirect to Shopify OAuth login
   ├── User enters email → receives 6-digit code
   ├── User enters code on Shopify page
   ├── Shopify redirects back with authorization code
   ├── App exchanges code for access_token
   └── User authenticated in Hydrogen app

2. Shopping Experience (Storefront API)
   ├── Browse products on Hydrogen app
   ├── Add to cart (stored in Hydrogen)
   ├── View cart with customer info
   └── Ready for checkout

3. Checkout Process (Shopify Checkout)
   ├── Create checkout with Storefront API
   ├── Redirect to Shopify checkout with ?logged_in=true
   ├── Customer info pre-filled (from Customer Account API)
   ├── Payment processing on Shopify
   └── Order confirmation & redirect back to Hydrogen
```

## Implementation

### 1. Authentication (Already implemented)
- Customer Account API OAuth flow
- Store access_token in session
- Use token for customer data

### 2. Cart Management (Hydrogen)
```typescript
// app/routes/cart.tsx
export async function action({request, context}: ActionFunctionArgs) {
  const {storefront} = context;
  
  // Add to cart using Storefront API
  const cart = await storefront.mutate(CART_CREATE, {
    variables: {
      input: {
        lines: [{
          merchandiseId: productVariantId,
          quantity: 1
        }]
      }
    }
  });
  
  return json({cart});
}
```

### 3. Checkout Creation & Redirect
```typescript
// app/routes/checkout.tsx
export async function loader({context, request}: LoaderFunctionArgs) {
  const {storefront, customerAccount, session} = context;
  
  // Get customer info if logged in
  let customer = null;
  const isLoggedIn = await customerAccount.isLoggedIn();
  if (isLoggedIn) {
    customer = await customerAccount.get();
  }
  
  // Create checkout with Storefront API
  const checkout = await storefront.mutate(CHECKOUT_CREATE, {
    variables: {
      input: {
        lineItems: cartItems,
        email: customer?.emailAddress?.emailAddress,
        shippingAddress: customer?.defaultAddress,
      }
    }
  });
  
  // Redirect to Shopify checkout
  const checkoutUrl = checkout.checkoutCreate.checkout.webUrl;
  const finalUrl = isLoggedIn 
    ? `${checkoutUrl}?logged_in=true`
    : checkoutUrl;
    
  return redirect(finalUrl);
}
```

### 4. Post-Checkout Handling
```typescript
// app/routes/checkout.success.tsx
export async function loader({context, request}: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get('order_id');
  
  // Optionally fetch order details using Customer Account API
  if (orderId) {
    const order = await customerAccount.query(ORDER_QUERY, {
      variables: { id: orderId }
    });
  }
  
  return json({
    success: true,
    orderId,
    message: 'Thank you for your order!'
  });
}
```

## Benefits of This Approach

### ✅ Customer Account API (Authentication)
- Secure OAuth flow
- 6-digit email verification
- Customer data access (profile, orders, addresses)
- Seamless login experience

### ✅ Shopify Checkout (Payment)
- PCI compliance handled by Shopify
- All payment methods supported
- Tax calculation
- Shipping calculation
- Order management
- Customer stays logged in with ?logged_in=true

### ✅ Hydrogen App (Shopping Experience)
- Custom UI/UX for product browsing
- Custom cart experience
- Brand consistency
- Performance optimization

## Configuration Required

### 1. Shopify Admin - Customer Account API
- Callback URI: `http://localhost:3000/account/authorize`
- JavaScript origins: `http://localhost:3000`
- Logout URI: `http://localhost:3000`

### 2. Shopify Admin - Checkout Settings
- Enable "Customer accounts" 
- Set checkout URL redirects if needed

### 3. Environment Variables
```bash
PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID=your_client_id
PUBLIC_CUSTOMER_ACCOUNT_API_URL=https://shopify.com/70430687423/account/customer/api/2024-10
PUBLIC_STORE_DOMAIN=mxcbvg-0i.myshopify.com
SHOP_ID=70430687423
```

## User Experience

1. **Browse products** on your beautiful Hydrogen app
2. **Login with email** → receive 6-digit code → authenticate
3. **Add to cart** with custom cart UI
4. **Click checkout** → redirect to Shopify checkout
5. **Customer info pre-filled** (because logged in)
6. **Complete payment** on Shopify (secure, compliant)
7. **Redirect back** to your app with order confirmation

This gives you the best of both worlds:
- Custom shopping experience on Hydrogen
- Secure, compliant checkout on Shopify
- Seamless customer authentication flow
