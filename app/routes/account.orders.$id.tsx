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

  try {
    const customer = await customerAccount.get();
    const order = await customerAccount.getOrder(id);

    if (!order) {
      throw new Response('Order not found', {status: 404});
    }

    return {
      customer,
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
  const {customer, order} = useLoaderData<typeof loader>();

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

  const getFulfillmentStatus = (fulfillments: any[]) => {
    if (!fulfillments || fulfillments.length === 0) {
      return {status: 'pending', text: 'Processing', color: 'bg-blue-100 text-blue-800'};
    }

    const fulfilled = fulfillments.filter(f => f.status === 'SUCCESS');
    const total = fulfillments.length;

    if (fulfilled.length === 0) {
      return {status: 'pending', text: 'Processing', color: 'bg-blue-100 text-blue-800'};
    } else if (fulfilled.length === total) {
      return {status: 'fulfilled', text: 'Delivered', color: 'bg-green-100 text-green-800'};
    } else {
      return {status: 'partial', text: 'Partially Delivered', color: 'bg-yellow-100 text-yellow-800'};
    }
  };

  const fulfillmentStatus = getFulfillmentStatus(order.fulfillments?.nodes);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link
                to="/account/orders"
                className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Orders
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Order #{order.name}</h1>
                <p className="text-gray-600">
                  Placed on {new Date(order.processedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${fulfillmentStatus.color}`}>
                  {fulfillmentStatus.text}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Order Items</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {order.lineItems?.nodes?.map((item: any) => (
                      <div key={item.id} className="flex items-start gap-4">
                        {item.variant?.image && (
                          <img
                            src={item.variant.image.url}
                            alt={item.variant.image.altText || item.title}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">{item.title}</h3>
                          {item.variant?.title && (
                            <p className="text-sm text-gray-600 mb-2">
                              Variant: {item.variant.title}
                            </p>
                          )}
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                              Quantity: {item.quantity}
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">
                                <Money data={item.originalTotal} />
                              </p>
                              {item.originalTotal?.amount !== item.originalUnitTotal?.amount && (
                                <p className="text-sm text-gray-500">
                                  <Money data={item.originalUnitTotal} /> each
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Tracking */}
              {order.fulfillments?.nodes && order.fulfillments.nodes.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Order Tracking</h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      {order.fulfillments.nodes.map((fulfillment: any, index: number) => (
                        <div key={fulfillment.id} className="border-l-4 border-indigo-500 pl-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-gray-900">
                              Fulfillment #{index + 1}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              fulfillment.status === 'SUCCESS' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {fulfillment.status === 'SUCCESS' ? 'Delivered' : 'Processing'}
                            </span>
                          </div>
                          {fulfillment.trackingInfo && fulfillment.trackingInfo.length > 0 && (
                            <div className="space-y-2">
                              {fulfillment.trackingInfo.map((tracking: any, trackIndex: number) => (
                                <div key={trackIndex} className="text-sm text-gray-600">
                                  <p><strong>Carrier:</strong> {tracking.company}</p>
                                  {tracking.number && (
                                    <p><strong>Tracking Number:</strong> {tracking.number}</p>
                                  )}
                                  {tracking.url && (
                                    <a
                                      href={tracking.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-indigo-600 hover:text-indigo-700 underline"
                                    >
                                      Track Package
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
                
                {/* Order Status */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Order Status</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${fulfillmentStatus.color}`}>
                      {fulfillmentStatus.text}
                    </span>
                  </div>
                </div>

                {/* Order Totals */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">
                      <Money data={order.subtotalPriceSet?.shopMoney} />
                    </span>
                  </div>
                  
                  {order.totalTaxAmount?.amount && (
                    <div className="flex justify-between text-gray-600">
                      <span>Tax</span>
                      <span className="font-semibold">
                        <Money data={order.totalTaxAmount} />
                      </span>
                    </div>
                  )}

                  {order.totalShippingPriceSet?.shopMoney?.amount && (
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="font-semibold">
                        <Money data={order.totalShippingPriceSet.shopMoney} />
                      </span>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span className="text-2xl text-indigo-600">
                        <Money data={order.totalPriceSet?.shopMoney} />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                {order.shippingAddress && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Shipping Address</h3>
                    <div className="text-sm text-gray-600">
                      <p>{order.shippingAddress.name}</p>
                      <p>{order.shippingAddress.address1}</p>
                      {order.shippingAddress.address2 && (
                        <p>{order.shippingAddress.address2}</p>
                      )}
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.zip}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  </div>
                )}

                {/* Billing Address */}
                {order.billingAddress && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Billing Address</h3>
                    <div className="text-sm text-gray-600">
                      <p>{order.billingAddress.name}</p>
                      <p>{order.billingAddress.address1}</p>
                      {order.billingAddress.address2 && (
                        <p>{order.billingAddress.address2}</p>
                      )}
                      <p>
                        {order.billingAddress.city}, {order.billingAddress.province} {order.billingAddress.zip}
                      </p>
                      <p>{order.billingAddress.country}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                  <Link
                    to="/collections"
                    className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
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
