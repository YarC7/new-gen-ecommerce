// Script to check Customer Account API configuration
import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 Checking Customer Account API Configuration...\n');

const requiredEnvVars = [
  'PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID',
  'PUBLIC_CUSTOMER_ACCOUNT_API_URL',
  'PUBLIC_STORE_DOMAIN',
  'SHOP_ID',
];

let hasErrors = false;

console.log('📋 Environment Variables:');
requiredEnvVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value}`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
    hasErrors = true;
  }
});

console.log('\n🔗 Expected URLs:');
const shopId = process.env.SHOP_ID;
const storeDomain = process.env.PUBLIC_STORE_DOMAIN;

if (shopId && storeDomain) {
  console.log(`✅ Login URL: https://${storeDomain}/account/login`);
  console.log(`✅ Register URL: https://${storeDomain}/account/register`);
  console.log(`✅ Callback URL: http://localhost:3000/account/authorize`);
  console.log(
    `✅ Customer Account API URL: https://shopify.com/${shopId}/account/customer/api/2024-10`,
  );
} else {
  console.log(
    '❌ Cannot generate URLs - missing SHOP_ID or PUBLIC_STORE_DOMAIN',
  );
  hasErrors = true;
}

console.log('\n📝 Shopify Admin Configuration Checklist:');
console.log('1. Go to Shopify Admin > Apps > Hydrogen/Headless');
console.log(
  '2. Click your storefront > Storefront settings > Customer Account API',
);
console.log('3. Under "Application setup" > "Callback URI(s)", add:');
console.log('   - http://localhost:3000/account/authorize');
console.log('4. Under "JavaScript origin(s)", add:');
console.log('   - http://localhost:3000');
console.log('5. Under "Logout URI", add:');
console.log('   - http://localhost:3000');

if (hasErrors) {
  console.log('\n❌ Configuration has errors. Please fix them before testing.');
  process.exit(1);
} else {
  console.log('\n✅ Configuration looks good!');
  console.log('\n🚀 Next steps:');
  console.log('1. Make sure Shopify Admin is configured as shown above');
  console.log('2. Run: npm run dev');
  console.log('3. Visit: http://localhost:3000/login');
  console.log(
    '4. You should be redirected to Shopify login, then back to localhost',
  );
}
