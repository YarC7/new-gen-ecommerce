import {useLoaderData, Link, redirect} from 'react-router';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Money} from '@shopify/hydrogen-react';

export async function loader({params, context}: LoaderFunctionArgs) {
  const {id} = params;
  const {customerAccount} = context;

  const isLoggedIn = await customerAccount.isLoggedIn();

  if (!isLoggedIn) {
    return redirect('/login');
  }

  if (!id) {
    throw new Response('Order ID is required', {status: 400});
  }

  // Decode the URL-encoded order ID
  const orderId = decodeURIComponent(id);

  try {
    const [{data: customerData}, {data: orderData}] = await Promise.all([
      customerAccount.query(`#graphql
        query CustomerOrderDetails {
          customer { id firstName lastName }
        }
      `),
      customerAccount.query(
        `#graphql
        query Order($orderId: ID!) {
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
      ),
    ]);

    const order = orderData?.order;

    if (!order) {
      console.error('Order not found for ID:', orderId);
      throw new Response('Order not found', {status: 404});
    }

    return {
      customer: customerData?.customer ?? null,
      order,
    };
  } catch (error) {
    console.error('Error loading order:', error);
    if (error instanceof Response) {
      throw error;
    }
    throw new Response('Failed to load order', {status: 500});
  }
}

export default function OrderDetail() {
  const {order} = useLoaderData<typeof loader>();

  const getFulfillmentStatus = (fulfillments: any[]) => {
    if (!fulfillments || fulfillments.length === 0) {
      return {
        status: 'pending',
        text: 'Processing',
        color: 'bg-blue-100 text-blue-800',
      };
    }

    const fulfilled = fulfillments.filter((f) => f.status === 'SUCCESS');
    const total = fulfillments.length;

    if (fulfilled.length === 0) {
      return {
        status: 'pending',
        text: 'Processing',
        color: 'bg-blue-100 text-blue-800',
      };
    } else if (fulfilled.length === total) {
      return {
        status: 'fulfilled',
        text: 'Delivered',
        color: 'bg-green-100 text-green-800',
      };
    } else {
      return {
        status: 'partial',
        text: 'Partially Delivered',
        color: 'bg-yellow-100 text-yellow-800',
      };
    }
  };

  const fulfillmentStatus = getFulfillmentStatus(order.fulfillments?.nodes);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="relative bg-white rounded-3xl shadow-xl mb-8 p-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-5"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <Link
                  to="/account/orders"
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
                  Back to Orders
                </Link>
              </div>
              <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Order{' '}
                  {order?.name ||
                    '#' + (order?.id?.split('/').pop() || 'Unknown')}
                </h1>
                {/* Debug - remove after testing */}
                <div className="text-sm bg-yellow-100 p-2 rounded mb-2">
                  Debug: order.name = {order?.name} | order.id = {order?.id}
                </div>
                <p className="text-xl text-gray-600 font-medium">
                  Placed on{' '}
                  {new Date(order.processedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <span
                    className={`inline-flex items-center px-6 py-3 rounded-xl text-sm font-semibold border ${fulfillmentStatus.color}`}
                  >
                    <span className="ml-2">{fulfillmentStatus.text}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Order Items
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {order.lineItems?.nodes?.map((item: any) => (
                      <div key={item.id} className="flex items-start gap-4">
                        {item.image && (
                          <img
                            src={item.image.url}
                            alt={item.image.altText || item.title}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">
                            {item.title}
                          </h3>
                          {item.variantTitle && (
                            <p className="text-sm text-gray-600 mb-2">
                              Variant: {item.variantTitle}
                            </p>
                          )}
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                              Quantity: {item.quantity}
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">
                                <Money data={item.price} />
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Tracking */}
              {order.fulfillments?.nodes &&
                order.fulfillments.nodes.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Order Tracking
                      </h2>
                    </div>
                    <div className="p-6">
                      <div className="space-y-6">
                        {order.fulfillments.nodes.map(
                          (fulfillment: any, index: number) => (
                            <div
                              key={index}
                              className="border-l-4 border-indigo-500 pl-4"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-medium text-gray-900">
                                  Fulfillment #{index + 1}
                                </h3>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    fulfillment.status === 'SUCCESS'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}
                                >
                                  {fulfillment.status === 'SUCCESS'
                                    ? 'Delivered'
                                    : 'Processing'}
                                </span>
                              </div>
                              {/* Tracking info not requested in query; add if needed */}
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Order Summary
                </h2>

                {/* Order Status */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Order Status
                  </h3>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${fulfillmentStatus.color}`}
                    >
                      {fulfillmentStatus.text}
                    </span>
                  </div>
                </div>

                {/* Order Totals */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">
                      <Money data={order.subtotal} />
                    </span>
                  </div>

                  {order.totalTax?.amount && (
                    <div className="flex justify-between text-gray-600">
                      <span>Tax</span>
                      <span className="font-semibold">
                        <Money data={order.totalTax} />
                      </span>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span className="text-2xl text-indigo-600">
                        <Money data={order.totalPrice} />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                {order.shippingAddress && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Shipping Address
                    </h3>
                    <div className="text-sm text-gray-600">
                      <p className="font-semibold">
                        {order.shippingAddress.name}
                      </p>
                      {order.shippingAddress.formatted?.map(
                        (line: string, idx: number) => (
                          <p key={idx}>{line}</p>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* Billing Address */}
                {order.billingAddress && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Billing Address
                    </h3>
                    <div className="text-sm text-gray-600">
                      <p className="font-semibold">
                        {order.billingAddress.name}
                      </p>
                      {order.billingAddress.formatted?.map(
                        (line: string, idx: number) => (
                          <p key={idx}>{line}</p>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                  <Link
                    to="/collections"
                    className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center"
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
                    Shop Again
                  </Link>

                  <Link
                    to="/account/orders"
                    className="w-full bg-white text-gray-700 font-semibold py-3 px-6 rounded-lg border-2 border-gray-300 hover:border-indigo-500 hover:text-indigo-600 transition-colors duration-200 flex items-center justify-center"
                  >
                    View All Orders
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
