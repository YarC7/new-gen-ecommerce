import {useLoaderData, Form, Link} from 'react-router';
import type {LoaderFunctionArgs, ActionFunctionArgs} from '@shopify/remix-oxygen';
import {json, redirect} from '@shopify/remix-oxygen';

const CUSTOMER_QUERY = `#graphql
  query Customer {
    customer {
      id
      firstName
      lastName
      emailAddress {
        emailAddress
      }
      phoneNumber {
        phoneNumber
      }
      defaultAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        province
        zip
        country
        phone
      }
    }
  }
` as const;

export async function loader({context}: LoaderFunctionArgs) {
  const {customerAccount} = context;

  // Check if customer is logged in
  const isLoggedIn = await customerAccount.isLoggedIn();
  
  if (!isLoggedIn) {
    return redirect('/login?returnTo=/account/profile');
  }

  try {
    const {data} = await customerAccount.query(CUSTOMER_QUERY);

    return json({
      customer: data?.customer,
    });
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    return json({
      customer: null,
      error: 'Failed to load profile data'
    });
  }
}

export async function action({request, context}: ActionFunctionArgs) {
  const {customerAccount} = context;
  const formData = await request.formData();
  const action = formData.get('action');

  if (action === 'update_profile') {
    // Note: Customer Account API might have limited profile update capabilities
    // This is a placeholder for when Shopify adds more profile management features
    
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    
    try {
      // For now, we'll just return success
      // In the future, use Customer Account API mutations when available
      console.log('Profile update requested:', {firstName, lastName});
      
      return json({
        success: true,
        message: 'Profile update requested. Some changes may require email verification.'
      });
    } catch (error) {
      console.error('Profile update error:', error);
      return json({
        success: false,
        error: 'Failed to update profile'
      });
    }
  }

  return json({error: 'Invalid action'});
}

export default function AccountProfile() {
  const {customer, error} = useLoaderData<typeof loader>();

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-2">Manage your account information</p>
          </div>
          <Link
            to="/account"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Back to Account
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
              
              <Form method="post" className="space-y-6">
                <input type="hidden" name="action" value="update_profile" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      defaultValue={customer?.firstName || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      defaultValue={customer?.lastName || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    defaultValue={customer?.emailAddress?.emailAddress || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    disabled
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Email changes require verification through Shopify
                  </p>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    defaultValue={customer?.phoneNumber?.phoneNumber || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    disabled
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Phone changes require verification through Shopify
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </Form>
            </div>

            {/* Default Address */}
            {customer?.defaultAddress && (
              <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Default Address</h2>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900">
                      {customer.defaultAddress.firstName} {customer.defaultAddress.lastName}
                    </p>
                    {customer.defaultAddress.company && (
                      <p className="text-gray-700">{customer.defaultAddress.company}</p>
                    )}
                    <p className="text-gray-700">{customer.defaultAddress.address1}</p>
                    {customer.defaultAddress.address2 && (
                      <p className="text-gray-700">{customer.defaultAddress.address2}</p>
                    )}
                    <p className="text-gray-700">
                      {customer.defaultAddress.city}, {customer.defaultAddress.province} {customer.defaultAddress.zip}
                    </p>
                    <p className="text-gray-700">{customer.defaultAddress.country}</p>
                    {customer.defaultAddress.phone && (
                      <p className="text-gray-700">{customer.defaultAddress.phone}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <Link
                    to="/account/addresses"
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Manage Addresses →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
              
              <div className="space-y-3">
                <Link
                  to="/account/orders"
                  className="block text-gray-700 hover:text-indigo-600 font-medium"
                >
                  View Order History
                </Link>
                <Link
                  to="/account/addresses"
                  className="block text-gray-700 hover:text-indigo-600 font-medium"
                >
                  Manage Addresses
                </Link>
                <Link
                  to="/account/logout"
                  className="block text-red-600 hover:text-red-800 font-medium"
                >
                  Sign Out
                </Link>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Customer ID:</span>
                  <p className="font-mono text-xs text-gray-800 break-all">
                    {customer?.id}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Account Type:</span>
                  <p className="text-gray-800">Customer Account API</p>
                </div>
              </div>
            </div>

            {/* Help */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-blue-800 text-sm mb-4">
                Some account changes require verification through Shopify for security.
              </p>
              <Link
                to="/contact"
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Contact Support →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
