# Customer Account API Setup

This project has been configured to use Shopify's Customer Account API for authentication instead of custom login forms. This provides a more secure and integrated authentication experience.

## What Changed

### Authentication Flow

- **Before**: Custom login/register forms that collected email/password
- **After**: Direct redirect to Shopify's hosted login/register pages
- **Benefits**:
  - More secure (credentials never touch your app)
  - Consistent with Shopify's UI/UX
  - Automatic handling of password reset, 2FA, etc.
  - Better compliance with security standards

### Updated Routes

1. **`/login`** - Now redirects to Shopify's login page
2. **`/account/login`** - Also redirects to Shopify's login page
3. **`/register`** - Redirects to Shopify's registration page
4. **`/account/authorize`** - OAuth callback route (handles return from Shopify)

### Files Modified

- `app/routes/login.tsx` - Simplified to redirect to Shopify
- `app/routes/account.login.tsx` - Simplified to redirect to Shopify
- `app/routes/register.tsx` - Simplified to redirect to Shopify
- `app/routes/account.authorize.tsx` - New OAuth callback route

## Required Environment Variables

Make sure these are set in your `.env` file:

```bash
# Customer Account API
PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID=your_client_id
PUBLIC_CUSTOMER_ACCOUNT_API_URL=your_api_url

# Store domain
PUBLIC_STORE_DOMAIN=your-store.myshopify.com
```

## Setup Instructions

### 1. Configure Customer Account API in Shopify Admin

1. Go to your Shopify Admin
2. Navigate to Apps > Hydrogen (or Headless) sales channel
3. Click on your storefront
4. Go to "Storefront settings" > "Customer Account API"
5. Under "Application setup", add these callback URIs:
   - `https://your-domain.com/account/authorize` (production)
   - `https://your-ngrok-domain.app/account/authorize` (development)

### 2. For Local Development

Since Customer Account API doesn't support localhost, you need to use a tunneling service:

1. Install ngrok: `npm install -g ngrok`
2. Get a free ngrok account and static domain
3. Run: `ngrok http --domain=your-static-domain.app 3000`
4. Update your Customer Account API settings with the ngrok domain
5. Update your `.env` file if needed

### 3. Test the Flow

1. Visit `/login` or `/register`
2. You should be redirected to Shopify's login page
3. After successful login, you'll be redirected back to your app
4. The `/account` page should show customer information

## How It Works

### Authentication Flow (Customer Account API)

1. User clicks login/register
2. App creates OAuth URL: `https://shopify.com/authentication/{shop_id}/oauth/authorize`
3. Customer enters email → receives 6-digit code → enters code
4. Shopify redirects back to `/account/authorize` with authorization code
5. App exchanges code for access_token via Customer Account API
6. Customer is now logged in and redirected to their account

### Shopping & Checkout Flow

1. Customer browses products on Hydrogen app (custom UI/UX)
2. Customer adds items to cart (managed by Hydrogen)
3. Customer clicks "Checkout" → redirects to `/checkout`
4. App redirects to Shopify checkout with `?logged_in=true` (if authenticated)
5. Customer completes payment on Shopify (secure, compliant)
6. Shopify redirects back to `/checkout/success` (optional)
7. Customer can view orders in `/account/orders` (Customer Account API)

## Benefits of This Approach

- **Security**: No password handling in your app
- **Maintenance**: No need to build/maintain auth UI
- **Features**: Automatic support for password reset, 2FA, etc.
- **Compliance**: Shopify handles security compliance
- **Consistency**: Same login experience across all Shopify touchpoints

## Troubleshooting

### "redirect_uri mismatch" Error

- Check that your callback URI in Shopify Admin matches exactly
- Make sure you're using HTTPS (required for Customer Account API)
- Verify your ngrok domain is correctly configured

### Customer Not Logged In After Redirect

- Check that `PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID` is set correctly
- Verify your store domain in `PUBLIC_STORE_DOMAIN`
- Check browser console for any errors

### Local Development Issues

- Customer Account API requires HTTPS - use ngrok or similar
- Make sure your ngrok domain is added to Shopify Admin settings
- Check that your `.env` file has the correct ngrok domain

## Next Steps

- Customize the loading/redirect pages in the route files
- Add error handling for failed authentication
- Implement logout functionality (already working via `/account/logout`)
- Add customer profile editing features using Customer Account API queries
