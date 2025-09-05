// Debug script for Customer Account API OAuth flow
import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 Customer Account API OAuth Debug\n');

const shopId = process.env.SHOP_ID;
const clientId = process.env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID;
const storeDomain = process.env.PUBLIC_STORE_DOMAIN;

console.log('📋 Configuration:');
console.log(`Shop ID: ${shopId}`);
console.log(`Client ID: ${clientId}`);
console.log(`Store Domain: ${storeDomain}\n`);

// Generate sample OAuth URL
const authUrl = new URL(`https://shopify.com/authentication/${shopId}/oauth/authorize`);
authUrl.searchParams.append('scope', 'openid email customer-account-api:full');
authUrl.searchParams.append('client_id', clientId);
authUrl.searchParams.append('response_type', 'code');
authUrl.searchParams.append('redirect_uri', 'http://localhost:3000/account/authorize');
authUrl.searchParams.append('state', 'sample_state_123');

console.log('🔗 Sample OAuth URL:');
console.log(authUrl.toString());
console.log('');

console.log('📝 Shopify Admin Checklist:');
console.log('1. Go to Shopify Admin > Apps > Hydrogen/Headless');
console.log('2. Click your storefront > Storefront settings > Customer Account API');
console.log('3. Under "Application setup" > "Callback URI(s)", add:');
console.log('   ✅ http://localhost:3000/account/authorize');
console.log('4. Under "JavaScript origin(s)", add:');
console.log('   ✅ http://localhost:3000');
console.log('5. Under "Logout URI", add:');
console.log('   ✅ http://localhost:3000');
console.log('');

console.log('🚀 Test Flow:');
console.log('1. Run: npm run dev');
console.log('2. Visit: http://localhost:3000/login');
console.log('3. Should redirect to OAuth URL above');
console.log('4. Enter email → receive 6-digit code → enter code');
console.log('5. Should redirect back to localhost:3000/account/authorize');
console.log('6. Should redirect to localhost:3000/account');
console.log('');

console.log('🛒 Shopping & Checkout Flow:');
console.log('1. Browse products on Hydrogen app');
console.log('2. Add items to cart');
console.log('3. Click "Checkout" → redirects to /checkout');
console.log('4. Redirects to Shopify checkout with ?logged_in=true');
console.log('5. Complete payment on Shopify');
console.log('6. Optionally redirect back to /checkout/success');
console.log('');

console.log('❌ If redirect_uri error:');
console.log('- Check Shopify Admin callback URI matches exactly');
console.log('- Ensure using http://localhost:3000 (not 127.0.0.1)');
console.log('- Make sure no trailing slashes');
console.log('- Verify Client ID is correct');
