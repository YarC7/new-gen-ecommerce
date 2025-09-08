import React, {useState} from 'react';
import {useLoaderData, Link, redirect, useFetcher} from 'react-router';
import type {LoaderFunctionArgs, ActionFunctionArgs} from '@shopify/remix-oxygen';

export async function loader({context}: LoaderFunctionArgs) {
  const {customerAccount} = context;
  const isLoggedIn = await customerAccount.isLoggedIn();

  if (!isLoggedIn) {
    return redirect('/login');
  }

  try {
    const {data} = await customerAccount.query(`#graphql
      query CustomerSettings {
        customer {
          id
          firstName
          lastName
          emailAddress { emailAddress }
          phoneNumber { phoneNumber }
          acceptsMarketing
          addresses(first: 5) {
            nodes {
              id
              firstName
              lastName
              address1
              city
              province
              country
            }
          }
        }
      }
    `);

    return {customer: data?.customer ?? null};
  } catch (error) {
    console.error('Error loading customer settings:', error);
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
    if (intent === 'updateNotifications') {
      const acceptsMarketing = formData.get('emailNotifications') === 'on';
      
      const {data} = await customerAccount.mutate(`#graphql
        mutation CustomerUpdate($customer: CustomerUpdateInput!) {
          customerUpdate(customer: $customer) {
            customer {
              id
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

      return {success: true, message: 'Notification preferences updated successfully!'};
    }

    if (intent === 'updatePrivacy') {
      // For demo purposes - in a real app, you'd handle privacy settings
      return {success: true, message: 'Privacy settings updated successfully!'};
    }
  } catch (error) {
    console.error('Error updating settings:', error);
    return {
      success: false,
      errors: [{field: 'general', message: 'Failed to update settings. Please try again.'}],
    };
  }

  return {success: false, errors: [{field: 'general', message: 'Invalid action'}]};
}

export default function AccountSettings() {
  const {customer} = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const [activeSection, setActiveSection] = useState('general');

  const isSubmitting = fetcher.state === 'submitting';

  const settingSections = [
    {
      id: 'general',
      name: 'General',
      description: 'Basic account information',
      gradient: 'from-blue-500 to-indigo-600',
      iconBg: 'from-blue-100 to-indigo-100',
      iconColor: 'text-blue-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: 'notifications',
      name: 'Notifications',
      description: 'Email and alert preferences',
      gradient: 'from-amber-500 to-orange-600',
      iconBg: 'from-amber-100 to-orange-100',
      iconColor: 'text-amber-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5M4 7h16l-7 7H4V7z" />
        </svg>
      ),
    },
    {
      id: 'privacy',
      name: 'Privacy',
      description: 'Data control and visibility',
      gradient: 'from-emerald-500 to-teal-600',
      iconBg: 'from-emerald-100 to-teal-100',
      iconColor: 'text-emerald-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      id: 'security',
      name: 'Security',
      description: 'Account protection',
      gradient: 'from-red-500 to-rose-600',
      iconBg: 'from-red-100 to-rose-100',
      iconColor: 'text-red-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="relative mb-8">
            {/* Floating Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-10 animate-pulse"></div>
              <div className="absolute top-1/2 -left-8 w-24 h-24 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full opacity-10 animate-bounce"></div>
            </div>
            
            <div className="relative bg-white backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-500/5 via-blue-500/5 to-purple-500/5 rounded-3xl"></div>
              
              <div className="relative z-10">
                {/* Breadcrumb */}
                <div className="flex items-center gap-3 mb-8">
                  <Link
                    to="/account"
                    className="group inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 font-medium rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <svg
                      className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300"
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
                  <span className="text-slate-400">/</span>
                  <span className="text-slate-600 font-medium">Settings</span>
                </div>
                
                {/* Main Header */}
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-slate-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-slate-800 via-blue-700 to-purple-700 bg-clip-text text-transparent">
                          Account Settings
                        </h1>
                        <p className="text-lg text-slate-600 mt-2">
                          Manage your account preferences and security
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {fetcher.data?.success && (
            <div className="mb-8 p-5 bg-white rounded-2xl shadow-lg border-l-4 border-emerald-500">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-emerald-800 font-semibold">Success!</p>
                  <p className="text-emerald-700">{fetcher.data.message}</p>
                </div>
              </div>
            </div>
          )}

          {fetcher.data?.errors && (
            <div className="mb-8 p-5 bg-white rounded-2xl shadow-lg border-l-4 border-red-500">
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

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Enhanced Settings Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 sticky top-6">
                <div className="p-6 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Categories</h2>
                  </div>
                </div>
                <nav className="p-4 space-y-3">
                  {settingSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`group w-full p-4 rounded-2xl transition-all duration-300 text-left overflow-hidden relative ${
                        activeSection === section.id
                          ? `bg-gradient-to-r ${section.gradient} text-white shadow-lg scale-105 transform`
                          : 'hover:bg-gray-50 hover:scale-102 transform'
                      }`}
                    >
                      <div className="flex items-center relative z-10">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 transition-all duration-300 ${
                          activeSection === section.id
                            ? 'bg-white bg-opacity-20'
                            : `bg-gradient-to-br ${section.iconBg}`
                        }`}>
                          <span className={activeSection === section.id ? 'text-white' : section.iconColor}>
                            {section.icon}
                          </span>
                        </div>
                        <div className="flex-1">
                          <span className={`font-semibold block ${
                            activeSection === section.id ? 'text-white' : 'text-slate-900'
                          }`}>
                            {section.name}
                          </span>
                          <span className={`text-sm ${
                            activeSection === section.id ? 'text-blue-100' : 'text-slate-500'
                          }`}>
                            {section.description}
                          </span>
                        </div>
                        {activeSection === section.id && (
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </div>
                      {activeSection !== section.id && (
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Enhanced Settings Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                {/* Enhanced General Settings */}
                {activeSection === 'general' && (
                  <div className="p-8">
                    <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-100">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-10 transform translate-x-16 -translate-y-16"></div>
                      <div className="relative z-10 flex items-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mr-6 shadow-lg">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent mb-2">
                            General Settings
                          </h3>
                          <p className="text-lg text-gray-600 font-medium">
                            Manage your basic account information and preferences
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      {/* Beautiful Account Information Card */}
                      <div className="relative overflow-hidden bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-lg border border-blue-100 p-8">
                        <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-10"></div>
                        <div className="relative z-10">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="text-2xl font-bold text-gray-900">Account Information</h4>
                              <p className="text-gray-600">Your personal details and contact information</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                </div>
                                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Full Name</span>
                              </div>
                              <p className="text-xl font-bold text-gray-900">
                                {customer?.firstName} {customer?.lastName}
                              </p>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Email Address</span>
                              </div>
                              <p className="text-xl font-bold text-gray-900">
                                {customer?.emailAddress?.emailAddress}
                              </p>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                </div>
                                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Phone Number</span>
                              </div>
                              <p className="text-xl font-bold text-gray-900">
                                {customer?.phoneNumber?.phoneNumber || 'Not provided'}
                              </p>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                  </svg>
                                </div>
                                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Account Status</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-xl font-bold text-emerald-600">Verified & Active</span>
                              </div>
                            </div>
                          </div>
                          
                          <Link
                            to="/account/profile"
                            className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
                          >
                            <svg className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Profile Information
                          </Link>
                        </div>
                      </div>

                      {/* Enhanced Address Book Card */}
                      <div className="relative overflow-hidden bg-gradient-to-br from-white to-emerald-50 rounded-3xl shadow-lg border border-emerald-100 p-8">
                        <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full opacity-10"></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z" />
                                </svg>
                              </div>
                              <div>
                                <h4 className="text-2xl font-bold text-gray-900">Address Book</h4>
                                <p className="text-gray-600">Manage your saved shipping addresses</p>
                              </div>
                            </div>
                            <div className="bg-white rounded-2xl px-4 py-2 shadow-sm border border-emerald-100">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                  <span className="text-sm font-bold text-emerald-600">{customer?.addresses?.nodes?.length || 0}</span>
                                </div>
                                <span className="text-sm font-semibold text-gray-600">
                                  {customer?.addresses?.nodes?.length === 1 ? 'Address' : 'Addresses'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <Link
                            to="/account/addresses"
                            className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
                          >
                            <svg className="w-5 h-5 mr-3 group-hover:bounce transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z" />
                            </svg>
                            Manage Address Book
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Enhanced Notifications Settings */}
                {activeSection === 'notifications' && (
                  <div className="p-8">
                    <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 mb-8 border border-amber-100">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full opacity-10 transform translate-x-16 -translate-y-16"></div>
                      <div className="relative z-10 flex items-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mr-6 shadow-lg">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5M4 7h16l-7 7H4V7z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-amber-800 bg-clip-text text-transparent mb-2">
                            Notification Preferences
                          </h3>
                          <p className="text-lg text-gray-600 font-medium">
                            Control how and when you receive notifications
                          </p>
                        </div>
                      </div>
                    </div>

                    <fetcher.Form method="post" className="space-y-8">
                      <input type="hidden" name="intent" value="updateNotifications" />
                      
                      <div className="relative overflow-hidden bg-gradient-to-br from-white to-amber-50 rounded-3xl shadow-lg border border-amber-100 p-8">
                        <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full opacity-10"></div>
                        <div className="relative z-10">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="text-2xl font-bold text-gray-900">Email Notifications</h4>
                              <p className="text-gray-600">Manage your email communication preferences</p>
                            </div>
                          </div>
                          
                          <div className="space-y-6">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                              <div className="flex items-center justify-between">
                                <div className="flex items-start gap-4">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mt-1">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                  </div>
                                  <div className="flex-1">
                                    <label className="text-lg font-bold text-gray-900 block mb-1">Marketing Emails</label>
                                    <p className="text-sm text-gray-600 leading-relaxed">Receive promotional emails, special offers, and product updates to stay informed about new deals and exclusive discounts.</p>
                                  </div>
                                </div>
                                <div className="flex-shrink-0 ml-6">
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      name="emailNotifications"
                                      defaultChecked={customer?.acceptsMarketing || false}
                                      className="sr-only peer"
                                    />
                                    <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-amber-500 peer-checked:to-orange-500 shadow-lg"></div>
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-8 pt-6 border-t border-gray-200">
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isSubmitting ? (
                                <>
                                  <svg className="w-5 h-5 mr-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Saving Preferences...
                                </>
                              ) : (
                                <>
                                  <svg className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Save Notification Preferences
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </fetcher.Form>
                  </div>
                )}

                {/* Enhanced Privacy Settings */}
                {activeSection === 'privacy' && (
                  <div className="p-8">
                    <div className="relative overflow-hidden bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 mb-8 border border-emerald-100">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full opacity-10 transform translate-x-16 -translate-y-16"></div>
                      <div className="relative z-10 flex items-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mr-6 shadow-lg">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-emerald-800 bg-clip-text text-transparent mb-2">
                            Privacy Settings
                          </h3>
                          <p className="text-lg text-gray-600 font-medium">
                            Control your data and privacy preferences
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="relative overflow-hidden bg-gradient-to-br from-white to-emerald-50 rounded-3xl shadow-lg border border-emerald-100 p-8">
                        <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full opacity-10"></div>
                        <div className="relative z-10">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="text-2xl font-bold text-gray-900">Data Control</h4>
                              <p className="text-gray-600">Manage your personal information and account data</p>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                              <div className="flex items-center justify-between">
                                <div className="flex items-start gap-4">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mt-1">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="text-lg font-bold text-gray-900 mb-1">Download My Data</h5>
                                    <p className="text-sm text-gray-600 leading-relaxed">Request a complete copy of your account data, including order history, addresses, and personal information.</p>
                                  </div>
                                </div>
                                <button className="px-6 py-3 bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 text-blue-700 font-semibold rounded-xl transition-all duration-300 hover:scale-105 transform shadow-sm hover:shadow-md">
                                  Request Data
                                </button>
                              </div>
                            </div>
                            
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                              <div className="flex items-center justify-between">
                                <div className="flex items-start gap-4">
                                  <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-rose-100 rounded-xl flex items-center justify-center mt-1">
                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="text-lg font-bold text-gray-900 mb-1">Account Deletion</h5>
                                    <p className="text-sm text-gray-600 leading-relaxed">Permanently delete your account and all associated data. This action cannot be undone.</p>
                                  </div>
                                </div>
                                <button className="px-6 py-3 bg-gradient-to-r from-red-100 to-rose-100 hover:from-red-200 hover:to-rose-200 text-red-700 font-semibold rounded-xl transition-all duration-300 hover:scale-105 transform shadow-sm hover:shadow-md">
                                  Delete Account
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Enhanced Security Settings */}
                {activeSection === 'security' && (
                  <div className="p-8">
                    <div className="relative overflow-hidden bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl p-6 mb-8 border border-red-100">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400 to-rose-500 rounded-full opacity-10 transform translate-x-16 -translate-y-16"></div>
                      <div className="relative z-10 flex items-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center mr-6 shadow-lg">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-red-800 bg-clip-text text-transparent mb-2">
                            Security Settings
                          </h3>
                          <p className="text-lg text-gray-600 font-medium">
                            Manage your account security and authentication
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      {/* Authentication Section */}
                      <div className="relative overflow-hidden bg-gradient-to-br from-white to-red-50 rounded-3xl shadow-lg border border-red-100 p-8">
                        <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-red-400 to-rose-500 rounded-full opacity-10"></div>
                        <div className="relative z-10">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-md">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="text-2xl font-bold text-gray-900">Authentication</h4>
                              <p className="text-gray-600">Password and login security settings</p>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                              <div className="flex items-center justify-between">
                                <div className="flex items-start gap-4">
                                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mt-1">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="text-lg font-bold text-gray-900 mb-1">Password Security</h5>
                                    <p className="text-sm text-gray-600 leading-relaxed">Your password is securely managed through Shopify's authentication system with industry-standard encryption.</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                  <span className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-xl text-sm font-bold">
                                    Secure
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                              <div className="flex items-center justify-between">
                                <div className="flex items-start gap-4">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mt-1">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="text-lg font-bold text-gray-900 mb-1">Two-Factor Authentication</h5>
                                    <p className="text-sm text-gray-600 leading-relaxed">Add an extra layer of security to your account through Shopify's two-factor authentication system.</p>
                                  </div>
                                </div>
                                <a 
                                  href="#" 
                                  className="px-6 py-3 bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 text-blue-700 font-semibold rounded-xl transition-all duration-300 hover:scale-105 transform shadow-sm hover:shadow-md"
                                >
                                  Configure
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Account Access Section */}
                      <div className="relative overflow-hidden bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-lg border border-purple-100 p-8">
                        <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full opacity-10"></div>
                        <div className="relative z-10">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="text-2xl font-bold text-gray-900">Account Access</h4>
                              <p className="text-gray-600">Monitor and manage your account sessions</p>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                              <div className="flex items-center justify-between">
                                <div className="flex items-start gap-4">
                                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center mt-1">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="text-lg font-bold text-gray-900 mb-1">Active Sessions</h5>
                                    <p className="text-sm text-gray-600 leading-relaxed">View and manage devices that are currently signed in to your account for enhanced security monitoring.</p>
                                  </div>
                                </div>
                                <button className="px-6 py-3 bg-gradient-to-r from-purple-100 to-indigo-100 hover:from-purple-200 hover:to-indigo-200 text-purple-700 font-semibold rounded-xl transition-all duration-300 hover:scale-105 transform shadow-sm hover:shadow-md">
                                  View Sessions
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}