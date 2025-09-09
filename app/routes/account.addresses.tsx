import {useLoaderData, Link, redirect, useFetcher} from 'react-router';
import type {
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from '@shopify/remix-oxygen';
import {useState} from 'react';
import AddressModal from '~/components/AddressModal';

interface Address {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone?: string;
}

export async function loader({context}: LoaderFunctionArgs) {
  const {customerAccount} = context;
  const isLoggedIn = await customerAccount.isLoggedIn();

  if (!isLoggedIn) {
    return redirect('/login');
  }

  try {
    const {data} = await customerAccount.query(`#graphql
      query CustomerAddresses {
        customer {
          id
          firstName
          lastName
          addresses(first: 20) {
            nodes {
              id
              firstName
              lastName
              company
              address1
              address2
              city
              zoneCode
              territoryCode
              zip
              phoneNumber
            }
          }
        }
      }
    `);

    // Transform the data to match our interface
    const transformedAddresses =
      data?.customer?.addresses?.nodes?.map((address: any) => ({
        ...address,
        province: address.zoneCode,
        country: address.territoryCode,
        phone: address.phoneNumber,
      })) || [];

    return {
      customer: data?.customer ?? null,
      addresses: transformedAddresses,
    };
  } catch (error) {
    console.error('Error loading addresses:', error);
    return {customer: null, addresses: []};
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
    if (intent === 'createAddress') {
      const addressInput = {
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        company: (formData.get('company') as string) || undefined,
        address1: formData.get('address1') as string,
        address2: (formData.get('address2') as string) || undefined,
        city: formData.get('city') as string,
        zoneCode: formData.get('province') as string,
        territoryCode: formData.get('country') as string,
        zip: formData.get('zip') as string,
        phoneNumber: (formData.get('phone') as string) || undefined,
      };

      const {data} = await customerAccount.mutate(
        `#graphql
        mutation CustomerAddressCreate($address: CustomerAddressInput!) {
          customerAddressCreate(address: $address) {
            customerAddress {
              id
              firstName
              lastName
              company
              address1
              address2
              city
              zoneCode
              territoryCode
              zip
              phoneNumber
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
        {
          variables: {address: addressInput},
        },
      );

      if (data?.customerAddressCreate?.userErrors?.length > 0) {
        return {
          success: false,
          errors: data.customerAddressCreate.userErrors,
        };
      }

      // Transform response to match our interface
      const transformedAddress = data?.customerAddressCreate?.customerAddress
        ? {
            ...data.customerAddressCreate.customerAddress,
            province: data.customerAddressCreate.customerAddress.zoneCode,
            country: data.customerAddressCreate.customerAddress.territoryCode,
            phone: data.customerAddressCreate.customerAddress.phoneNumber,
          }
        : null;

      return {
        success: true,
        message: 'Address created successfully!',
        address: transformedAddress,
      };
    }

    if (intent === 'updateAddress') {
      const addressId = formData.get('addressId') as string;
      const addressInput = {
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        company: (formData.get('company') as string) || undefined,
        address1: formData.get('address1') as string,
        address2: (formData.get('address2') as string) || undefined,
        city: formData.get('city') as string,
        zoneCode: formData.get('province') as string,
        territoryCode: formData.get('country') as string,
        zip: formData.get('zip') as string,
        phoneNumber: (formData.get('phone') as string) || undefined,
      };

      const {data} = await customerAccount.mutate(
        `#graphql
        mutation CustomerAddressUpdate($addressId: ID!, $address: CustomerAddressInput!) {
          customerAddressUpdate(addressId: $addressId, address: $address) {
            customerAddress {
              id
              firstName
              lastName
              company
              address1
              address2
              city
              zoneCode
              territoryCode
              zip
              phoneNumber
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
        {
          variables: {addressId, address: addressInput},
        },
      );

      if (data?.customerAddressUpdate?.userErrors?.length > 0) {
        return {
          success: false,
          errors: data.customerAddressUpdate.userErrors,
        };
      }

      // Transform response to match our interface
      const transformedAddress = data?.customerAddressUpdate?.customerAddress
        ? {
            ...data.customerAddressUpdate.customerAddress,
            province: data.customerAddressUpdate.customerAddress.zoneCode,
            country: data.customerAddressUpdate.customerAddress.territoryCode,
            phone: data.customerAddressUpdate.customerAddress.phoneNumber,
          }
        : null;

      return {
        success: true,
        message: 'Address updated successfully!',
        address: transformedAddress,
      };
    }

    if (intent === 'deleteAddress') {
      const addressId = formData.get('addressId') as string;

      const {data} = await customerAccount.mutate(
        `#graphql
        mutation CustomerAddressDelete($addressId: ID!) {
          customerAddressDelete(addressId: $addressId) {
            deletedAddressId
            userErrors {
              field
              message
            }
          }
        }
      `,
        {
          variables: {addressId},
        },
      );

      if (data?.customerAddressDelete?.userErrors?.length > 0) {
        return {
          success: false,
          errors: data.customerAddressDelete.userErrors,
        };
      }

      return {
        success: true,
        message: 'Address deleted successfully!',
        deletedId: data?.customerAddressDelete?.deletedAddressId,
      };
    }
  } catch (error) {
    console.error('Error with address operation:', error);
    return {
      success: false,
      errors: [
        {field: 'general', message: 'Operation failed. Please try again.'},
      ],
    };
  }

  return {
    success: false,
    errors: [{field: 'general', message: 'Invalid action'}],
  };
}

export default function AccountAddresses() {
  const {addresses} = useLoaderData<typeof loader>();
  const deleteFetcher = useFetcher<typeof action>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleDelete = (addressId: string) => {
    const formData = new FormData();
    formData.append('intent', 'deleteAddress');
    formData.append('addressId', addressId);

    deleteFetcher.submit(formData, {method: 'post'});
    setConfirmDelete(null);
  };

  const formatAddress = (address: Address) => {
    const parts = [
      address.address1,
      address.address2,
      `${address.city}, ${address.province} ${address.zip}`,
      address.country,
    ].filter(Boolean);

    return parts.join('\n');
  };

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

            <div className="relative bg-white backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-4">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-purple-500/5 rounded-3xl"></div>

              <div className="relative z-10">
                {/* Breadcrumb */}
                <div className="flex items-center gap-3">
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
                  <span className="text-slate-600 font-medium">
                    Address Book
                  </span>
                </div>

                {/* Main Header */}
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                  <div className="flex-shrink-0">
                    <button
                      onClick={handleAdd}
                      className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 font-bold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform"
                    >
                      <svg
                        className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add New Address
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {deleteFetcher.data?.success && (
            <div className="mb-8 p-5 bg-white rounded-2xl shadow-lg border-l-4 border-emerald-500">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                  <svg
                    className="w-5 h-5 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-emerald-800 font-semibold">Success!</p>
                  <p className="text-emerald-700">
                    {deleteFetcher.data.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Addresses List */}
          {addresses.length === 0 ? (
            <div className="relative bg-white rounded-3xl shadow-2xl p-16 text-center overflow-hidden">
              {/* Background Decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 opacity-50"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-10 transform translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full opacity-10 transform -translate-x-12 translate-y-12"></div>

              <div className="relative z-10">
                <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                  <svg
                    className="w-16 h-16 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 11a3 3 0 11-6 0 3 3 0 616 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-4">
                  No addresses yet
                </h3>
                <h4 className="text-lg text-slate-600 mb-10 max-w-lg mx-auto leading-relaxed">
                  Add your first address to make checkout faster and easier. You
                  can save multiple addresses for different locations.
                </h4>
                <button
                  onClick={handleAdd}
                  className="group inline-flex items-center px-10 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 font-bold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform"
                >
                  <svg
                    className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Your First Address
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {addresses.map((address: Address) => (
                <div
                  key={address.id}
                  className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100 hover:border-slate-200 hover:-translate-y-2"
                >
                  {/* Card Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50 opacity-60"></div>

                  {/* Floating Elements */}
                  <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-500"></div>

                  <div className="relative z-10 p-8">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <svg
                          className="w-7 h-7"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 616 0z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors duration-300">
                          {address.firstName} {address.lastName}
                        </h3>
                        {address.company && (
                          <p className="text-sm text-slate-600 mt-1 font-medium">
                            {address.company}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Address Details */}
                    <div className="space-y-3 mb-8">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-slate-700 whitespace-pre-line leading-relaxed font-medium">
                          {formatAddress(address)}
                        </p>
                      </div>
                      {address.phone && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                          </div>
                          <span className="font-medium">{address.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(address)}
                        className="flex-1 group/btn bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 font-semibold py-3 px-4 rounded-2xl transition-all duration-300 border border-blue-200 hover:border-blue-300 hover:shadow-md"
                      >
                        <svg
                          className="w-4 h-4 mr-2 inline group-hover/btn:scale-110 transition-transform duration-200"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete(address.id)}
                        className="flex-1 group/btn bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 text-red-700 font-semibold py-3 px-4 rounded-2xl transition-all duration-300 border border-red-200 hover:border-red-300 hover:shadow-md"
                      >
                        <svg
                          className="w-4 h-4 mr-2 inline group-hover/btn:scale-110 transition-transform duration-200"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Address Modal */}
      <AddressModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAddress(null);
        }}
        address={editingAddress}
      />

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-60 transition-opacity backdrop-blur-sm" />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all">
              {/* Header Gradient */}
              <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Delete Address
                  </h3>
                  <p className="text-red-100">This action cannot be undone</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-slate-700 text-center mb-8 leading-relaxed">
                  Are you sure you want to delete this address? All associated
                  information will be permanently removed from your account.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-2xl hover:border-slate-300 hover:bg-slate-50 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(confirmDelete)}
                    disabled={deleteFetcher.state === 'submitting'}
                    className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold py-3 px-4 rounded-2xl hover:from-red-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {deleteFetcher.state === 'submitting' ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="w-4 h-4 mr-2 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Deleting...
                      </div>
                    ) : (
                      'Delete Address'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
