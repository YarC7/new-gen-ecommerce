import {useLoaderData, Link, redirect, useFetcher} from 'react-router';
import type {LoaderFunctionArgs, ActionFunctionArgs} from '@shopify/remix-oxygen';
import {useState} from 'react';

export async function loader({context}: LoaderFunctionArgs) {
  const {customerAccount} = context;
  const isLoggedIn = await customerAccount.isLoggedIn();

  if (!isLoggedIn) {
    return redirect('/login');
  }

  try {
    const {data} = await customerAccount.query(`#graphql
      query CustomerProfile {
        customer {
          id
          firstName
          lastName
          emailAddress { emailAddress }
          phoneNumber { phoneNumber }
          dateOfBirth
          acceptsMarketing
          addresses(first: 10) {
            nodes {
              id
              firstName
              lastName
              address1
              address2
              city
              province
              country
              zip
              phone
            }
          }
        }
      }
    `);

    return {customer: data?.customer ?? null};
  } catch (error) {
    console.error('Error loading customer profile:', error);
    return {customer: null};
  }
}

export async function action({request, context}: ActionFunctionArgs) {
  const {customerAccount} = context;
  const isLoggedIn = await customerAccount.isLoggedIn();

  if (!isLoggedIn) {
    return redirect('/login');
  }

  const formData = await request.formData();
  const intent = formData.get('intent');

  try {
    if (intent === 'updateProfile') {
      const firstName = formData.get('firstName') as string;
      const lastName = formData.get('lastName') as string;
      const phoneNumber = formData.get('phoneNumber') as string;
      const acceptsMarketing = formData.get('acceptsMarketing') === 'on';

      const {data} = await customerAccount.mutate(`#graphql
        mutation CustomerUpdate($customer: CustomerUpdateInput!) {
          customerUpdate(customer: $customer) {
            customer {
              id
              firstName
              lastName
              phoneNumber { phoneNumber }
              acceptsMarketing
            }
            userErrors {
              field
              message
            }
          }
        }
      `, {
        variables: {
          customer: {
            firstName,
            lastName,
            phoneNumber,
            acceptsMarketing,
          },
        },
      });

      if (data?.customerUpdate?.userErrors?.length > 0) {
        return {
          success: false,
          errors: data.customerUpdate.userErrors,
        };
      }

      return {success: true, message: 'Profile updated successfully!'};
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    return {
      success: false,
      errors: [{field: 'general', message: 'Failed to update profile. Please try again.'}],
    };
  }

  return {success: false, errors: [{field: 'general', message: 'Invalid action'}]};
}

export default function AccountProfile() {
  const {customer} = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const [isEditing, setIsEditing] = useState(false);

  const isSubmitting = fetcher.state === 'submitting';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl mb-8 p-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-5"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <Link
                  to="/account"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 hover:from-blue-200 hover:to-purple-200 font-semibold rounded-xl transition-all duration-300"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back to Account
                </Link>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-6 md:mb-0">
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
                    Profile Settings
                  </h1>
                  <p className="text-xl text-gray-600">
                    Manage your personal information and preferences
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {fetcher.data?.success && (
            <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-emerald-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-emerald-800 font-medium">{fetcher.data.message}</span>
              </div>
            </div>
          )}

          {fetcher.data?.errors && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl">
              <div className="space-y-2">
                {fetcher.data.errors.map((error: any, index: number) => (
                  <div key={index} className="flex items-center">
                    <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-red-800">{error.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Profile Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                      <p className="text-gray-600">Update your personal details</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 hover:from-blue-200 hover:to-purple-200 font-semibold rounded-xl transition-all duration-300"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>

                <fetcher.Form method="post" className="space-y-6">
                  <input type="hidden" name="intent" value="updateProfile" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        defaultValue={customer?.firstName || ''}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${
                          isEditing 
                            ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white' 
                            : 'border-gray-200 bg-gray-50 text-gray-600'
                        }`}
                        placeholder="Enter your first name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        defaultValue={customer?.lastName || ''}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${
                          isEditing 
                            ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white' 
                            : 'border-gray-200 bg-gray-50 text-gray-600'
                        }`}
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={customer?.emailAddress?.emailAddress || ''}
                      disabled
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600"
                    />
                    <p className="text-sm text-gray-500 mt-1">Email cannot be changed from this page</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      defaultValue={customer?.phoneNumber?.phoneNumber || ''}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 ${
                        isEditing 
                          ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white' 
                          : 'border-gray-200 bg-gray-50 text-gray-600'
                      }`}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="acceptsMarketing"
                      id="acceptsMarketing"
                      defaultChecked={customer?.acceptsMarketing || false}
                      disabled={!isEditing}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="acceptsMarketing" className="ml-3 text-sm text-gray-700">
                      I want to receive marketing emails and updates
                    </label>
                  </div>

                  {isEditing && (
                    <div className="flex gap-4 pt-6">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center">
                            <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating...
                          </div>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 transition-all duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </fetcher.Form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Account Status */}
              <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Account Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700">Email Verified</span>
                    </div>
                    <span className="text-emerald-600 font-semibold">✓</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700">Account Active</span>
                    </div>
                    <span className="text-blue-600 font-semibold">✓</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    to="/account/orders"
                    className="flex items-center p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl hover:from-purple-100 hover:to-indigo-100 transition-all duration-300"
                  >
                    <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span className="text-gray-700 font-medium">View Orders</span>
                  </Link>
                  
                  <Link
                    to="/account/addresses"
                    className="flex items-center p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl hover:from-emerald-100 hover:to-green-100 transition-all duration-300"
                  >
                    <svg className="w-5 h-5 text-emerald-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-700 font-medium">Manage Addresses</span>
                  </Link>
                  
                  <Link
                    to="/account/logout"
                    className="flex items-center p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl hover:from-red-100 hover:to-orange-100 transition-all duration-300"
                  >
                    <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-gray-700 font-medium">Sign Out</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}