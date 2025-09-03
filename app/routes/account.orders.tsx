import {useLoaderData, Link, redirect} from 'react-router';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Money} from '@shopify/hydrogen-react';

export async function loader({context}: LoaderFunctionArgs) {
  const {customerAccount} = context;
  const isLoggedIn = await customerAccount.isLoggedIn();

  if (!isLoggedIn) {
    return redirect('/login');
  }

  try {
    const customer = await customerAccount.get();
    const orders = await customerAccount.getOrders();

    return {
      customer,
      orders: orders?.nodes || [],
    };
  } catch (error) {
    console.error('Error loading orders:', error);
    return {
      customer: null,
      orders: [],
    };
  }
}

export default function AccountOrders() {
  const {customer, orders} = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link
                to="/account"
                className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Account
              </Link>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Order History</h1>
            <p className="text-gray-600">Track your orders and view order details</p>
          </div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Yet</h3>
              <p className="text-gray-600 mb-6">You haven't placed any orders yet. Start shopping to see your order history here.</p>
              <Link
                to="/collections"
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order: any) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OrderCard({order}: {order: any}) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'fulfilled':
        return 'bg-green-100 text-green-800';
      case 'partially_fulfilled':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'fulfilled':
        return 'Delivered';
      case 'partially_fulfilled':
        return 'Partially Delivered';
      case 'cancelled':
        return 'Cancelled';
      case 'pending':
        return 'Processing';
      default:
        return status || 'Unknown';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Order Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Order #{order.name}
            </h3>
            <p className="text-sm text-gray-600">
              Placed on {new Date(order.processedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.fulfillmentStatus)}`}>
              {getStatusText(order.fulfillmentStatus)}
            </span>
            <Link
              to={`/account/orders/${order.id}`}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>

      {/* Order Items Preview */}
      <div className="p-6">
        <div className="space-y-4">
          {order.lineItems?.nodes?.slice(0, 3).map((item: any) => (
            <div key={item.id} className="flex items-center gap-4">
              {item.variant?.image && (
                <img
                  src={item.variant.image.url}
                  alt={item.variant.image.altText || item.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{item.title}</h4>
                <p className="text-sm text-gray-600">
                  Quantity: {item.quantity}
                </p>
                {item.variant?.title && (
                  <p className="text-sm text-gray-500">
                    Variant: {item.variant.title}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">
                  <Money data={item.originalTotal} />
                </p>
              </div>
            </div>
          ))}
          
          {order.lineItems?.nodes?.length > 3 && (
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                +{order.lineItems.nodes.length - 3} more items
              </p>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Items: {order.lineItems?.nodes?.length || 0}</p>
              <p className="text-sm text-gray-600">
                Total: <span className="font-semibold text-gray-900">
                  <Money data={order.totalPriceSet?.shopMoney} />
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Order Status</p>
              <p className="font-semibold text-gray-900">
                {getStatusText(order.fulfillmentStatus)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
