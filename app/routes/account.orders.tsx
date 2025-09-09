import React, {useState} from 'react';
import {useLoaderData, Link, redirect, useFetcher} from 'react-router';
import type {LoaderFunctionArgs, ActionFunctionArgs} from '@shopify/remix-oxygen';
import {Money} from '@shopify/hydrogen-react';
import OrderDetailModal from '~/components/OrderDetailModal';

export async function loader({context}: LoaderFunctionArgs) {
  const {customerAccount} = context;
  const isLoggedIn = await customerAccount.isLoggedIn();

  if (!isLoggedIn) {
    return redirect('/login');
  }

  try {
    const [{data: customerData}, {data: ordersData}] = await Promise.all([
      customerAccount.query(`#graphql
        query CustomerOrdersDetails {
          customer { id firstName lastName }
        }
      `),
      customerAccount.query(
        `#graphql
        query CustomerOrders($first: Int) {
          customer {
            orders(first: $first, sortKey: PROCESSED_AT, reverse: true) {
              nodes {
                id
                name
                processedAt
                totalPrice { amount currencyCode }
                fulfillments(first: 1) { nodes { status } }
                lineItems(first: 10) {
                  nodes {
                    id
                    title
                    quantity
                    image { url altText id width height }
                    price { amount currencyCode }
                    totalDiscount { amount currencyCode }
                  }
                }
                subtotal { amount currencyCode }
                totalTax { amount currencyCode }
                shippingAddress { name formatted formattedArea }
              }
            }
          }
        }
      `,
        {variables: {first: 20}},
      ),
    ]);

    return {
      customer: customerData?.customer ?? null,
      orders: ordersData?.customer?.orders?.nodes || [],
    };
  } catch (error) {
    console.error('Error loading orders:', error);
    return {
      customer: null,
      orders: [],
    };
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
  const orderId = formData.get('orderId') as string;

  if (intent === 'getOrderDetails' && orderId) {
    try {
      const {data} = await customerAccount.query(
        `#graphql
        query OrderDetails($orderId: ID!) {
          order(id: $orderId) {
            ... on Order {
              id
              name
              processedAt
              totalPrice { amount currencyCode }
              subtotal { amount currencyCode }
              totalTax { amount currencyCode }
              fulfillments(first: 10) { nodes { status } }
              lineItems(first: 100) {
                nodes {
                  id
                  title
                  quantity
                  variantTitle
                  image { url altText id width height }
                  price { amount currencyCode }
                }
              }
              shippingAddress { name formatted formattedArea }
              billingAddress { name formatted formattedArea }
            }
          }
        }
      `,
        {variables: {orderId}},
      );

      return {
        success: true,
        order: data?.order,
      };
    } catch (error) {
      console.error('Error loading order details:', error);
      return {
        success: false,
        error: 'Failed to load order details',
      };
    }
  }

  return {success: false, error: 'Invalid action'};
}

export default function AccountOrders() {
  const {orders} = useLoaderData<typeof loader>();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fetcher = useFetcher<typeof action>();

  const handleViewDetails = (orderId: string) => {
    const formData = new FormData();
    formData.append('intent', 'getOrderDetails');
    formData.append('orderId', orderId);
    
    fetcher.submit(formData, {method: 'post'});
  };

  // Handle the fetcher response
  React.useEffect(() => {
    if (fetcher.data?.success && fetcher.data.order) {
      setSelectedOrder(fetcher.data.order);
      setIsModalOpen(true);
    }
  }, [fetcher.data]);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  console.log('Orders list component rendering, orders:', orders);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl mb-8 p-4">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 opacity-5"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2">
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
                  Back to Dashboard
                </Link>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-4xl md:text-2xl font-bold bg-gradient-to-r from-gray-900 via-emerald-800 to-green-800 bg-clip-text mb-2">
                    Order History
                  </h1>
                  <p className="text-md text-gray-600">
                    Track your orders and view order details
                  </p>
                </div>
                <div className="mt-6 md:mt-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                    <svg
                      className="w-10 h-10 "
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No orders yet
              </h3>
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                When you place your first order, it will appear here. Start
                exploring our products!
              </p>
              <Link
                to="/collections"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
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
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order: any) => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  onViewDetails={handleViewDetails}
                  isLoading={fetcher.state === 'submitting'}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={isModalOpen}
        onClose={closeModal}
        order={selectedOrder}
      />
    </div>
  );
}

function OrderCard({
  order,
  onViewDetails,
  isLoading,
}: {
  readonly order: any;
  onViewDetails: (orderId: string) => void;
  isLoading: boolean;
}) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'fulfilled':
        return 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200';
      case 'partially_fulfilled':
        return 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200';
      case 'cancelled':
        return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200';
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

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'fulfilled':
        return (
          <svg
            className="w-4 h-4"
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
        );
      case 'partially_fulfilled':
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case 'cancelled':
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      case 'pending':
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300">
      {/* Order Header */}
      <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-6">
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
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                Order #{order.name}
              </h3>
              <p className="text-gray-600 font-medium">
                Placed on{' '}
                {new Date(order.processedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <span
              className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold border ${getStatusColor(order.fulfillments.nodes[0]?.status || 'pending')}`}
            >
              {getStatusIcon(order.fulfillments.nodes[0]?.status || 'pending')}
              <span className="ml-2">
                {getStatusText(
                  order.fulfillments.nodes[0]?.status || 'pending',
                )}
              </span>
            </span>
            <button
              onClick={() => onViewDetails(order.id)}
              disabled={isLoading}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  View Details
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Order Items Preview */}
      <div className="p-6">
        <div className="space-y-4">
          {order.lineItems.nodes.slice(0, 3).map((item: any) => (
            <div key={item.id} className="flex items-center gap-4">
              {item.image && (
                <img
                  src={item.image.url}
                  alt={item.image.altText || item.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{item.title}</h4>
                <p className="text-sm text-gray-600">
                  Quantity: {item.quantity}
                </p>
                {item.variantTitle && (
                  <p className="text-sm text-gray-500">
                    Variant: {item.variantTitle}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">
                  <Money data={item.price} />
                </p>
              </div>
            </div>
          ))}

          {order.lineItems.nodes.length > 3 && (
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
              <p className="text-sm text-gray-600">
                Total Items: {order.lineItems.nodes.length}
              </p>
              <p className="text-sm text-gray-600">
                Total:{' '}
                <span className="font-semibold text-gray-900">
                  <Money data={order.totalPrice} />
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Order Status</p>
              <p className="font-semibold text-gray-900">
                {getStatusText(
                  order.fulfillments?.nodes?.[0]?.status || 'PENDING',
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
