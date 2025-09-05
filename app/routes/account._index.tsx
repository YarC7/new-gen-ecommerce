import {useLoaderData, Link} from 'react-router';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
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
      addresses(first: 5) {
        nodes {
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
  }
` as const;

const ORDERS_QUERY = `#graphql
  query CustomerOrders($first: Int!) {
    customer {
      orders(first: $first) {
        nodes {
          id
          orderNumber
          processedAt
          financialStatus
          fulfillmentStatus
          totalPrice {
            amount
            currencyCode
          }
          lineItems(first: 5) {
            nodes {
              title
              quantity
              variant {
                image {
                  url
                  altText
                  width
                  height
                }
              }
            }
          }
        }
      }
    }
  }
` as const;

export async function loader({context}: LoaderFunctionArgs) {
  const {customerAccount} = context;

  // Check if customer is logged in
  const isLoggedIn = await customerAccount.isLoggedIn();
  
  if (!isLoggedIn) {
    return redirect('/login?returnTo=/account');
  }

  try {
    // Fetch customer data and recent orders
    const [customerData, ordersData] = await Promise.all([
      customerAccount.query(CUSTOMER_QUERY),
      customerAccount.query(ORDERS_QUERY, {
        variables: {first: 5}
      })
    ]);

    return json({
      customer: customerData.data?.customer,
      orders: ordersData.data?.customer?.orders?.nodes || [],
    });
  } catch (error) {
    console.error('Error fetching customer data:', error);
    return json({
      customer: null,
      orders: [],
      error: 'Failed to load account data'
    });
  }
}

export default function AccountIndex() {
  const {customer, orders, error} = useLoaderData<typeof loader>();

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
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back{customer?.firstName ? `, ${customer.firstName}` : ''}!
          </h1>
          <p className="text-gray-600 mt-2">Manage your account and view your orders</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Overview */}
          <div className="lg:col-span-2">
            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
                <Link
                  to="/account/orders"
                  className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                >
                  View all orders
                </Link>
              </div>

              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Order #{order.orderNumber}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(order.processedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            ${order.totalPrice.amount} {order.totalPrice.currencyCode}
                          </p>
                          <p className="text-sm text-gray-600 capitalize">
                            {order.fulfillmentStatus?.toLowerCase() || 'Processing'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Order Items Preview */}
                      <div className="flex space-x-2">
                        {order.lineItems.nodes.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            {item.variant?.image && (
                              <img
                                src={item.variant.image.url}
                                alt={item.variant.image.altText || item.title}
                                className="w-8 h-8 object-cover rounded"
                              />
                            )}
                            <span className="text-sm text-gray-600">
                              {item.title} (x{item.quantity})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">You haven't placed any orders yet</p>
                  <Link
                    to="/products"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Account Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-gray-900">
                    {customer?.firstName} {customer?.lastName}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">
                    {customer?.emailAddress?.emailAddress}
                  </p>
                </div>
                
                {customer?.phoneNumber?.phoneNumber && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-gray-900">
                      {customer.phoneNumber.phoneNumber}
                    </p>
                  </div>
                )}
              </div>

              <Link
                to="/account/profile"
                className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium text-sm"
              >
                Edit Profile →
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <Link
                  to="/account/orders"
                  className="block text-gray-700 hover:text-indigo-600 font-medium"
                >
                  View All Orders
                </Link>
                <Link
                  to="/account/addresses"
                  className="block text-gray-700 hover:text-indigo-600 font-medium"
                >
                  Manage Addresses
                </Link>
                <Link
                  to="/account/profile"
                  className="block text-gray-700 hover:text-indigo-600 font-medium"
                >
                  Edit Profile
                </Link>
                <Link
                  to="/account/logout"
                  className="block text-red-600 hover:text-red-800 font-medium"
                >
                  Sign Out
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
