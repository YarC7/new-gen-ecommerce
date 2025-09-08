import React from 'react';
import {Money} from '@shopify/hydrogen-react';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

export default function OrderDetailModal({
  isOpen,
  onClose,
  order,
}: OrderDetailModalProps) {
  if (!isOpen || !order) return null;

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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 transition-opacity backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl transform transition-all max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-indigo-600/90"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mr-6">
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
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Order {order?.name || '#' + (order?.id?.split('/').pop() || 'Unknown')}
                  </h2>
                  <p className="text-blue-100 font-medium">
                    Placed on{' '}
                    {new Date(order.processedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span
                  className={`inline-flex items-center px-6 py-3 rounded-xl text-sm font-semibold border bg-white ${fulfillmentStatus.color}`}
                >
                  <span>{fulfillmentStatus.text}</span>
                </span>
                <button
                  onClick={onClose}
                  className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-white hover:bg-opacity-30 transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Order Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Order Items */}
                  <div className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-100">
                    <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-100 to-blue-50">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">Order Items</h3>
                          <p className="text-slate-600">Your purchased products</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {order.lineItems?.nodes?.map((item: any) => (
                          <div key={item.id} className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-100">
                            {item.image && (
                              <div className="flex-shrink-0">
                                <img
                                  src={item.image.url}
                                  alt={item.image.altText || item.title}
                                  className="w-20 h-20 object-cover rounded-xl shadow-sm"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-lg font-bold text-slate-900 mb-1">
                                {item.title}
                              </h4>
                              {item.variantTitle && (
                                <p className="text-sm text-slate-600 mb-2 bg-slate-100 px-2 py-1 rounded-lg inline-block">
                                  Variant: {item.variantTitle}
                                </p>
                              )}
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                                  Qty: {item.quantity}
                                </span>
                                <p className="text-xl font-bold text-blue-600">
                                  <Money data={item.price} />
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Order Tracking */}
                  {order.fulfillments?.nodes && order.fulfillments.nodes.length > 0 && (
                    <div className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-100">
                      <div className="p-6 border-b border-slate-200">
                        <h3 className="text-xl font-bold text-slate-900">Order Tracking</h3>
                      </div>
                      <div className="p-6">
                        <div className="space-y-4">
                          {order.fulfillments.nodes.map((fulfillment: any, index: number) => (
                            <div key={index} className="border-l-4 border-indigo-500 pl-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-slate-900">
                                  Fulfillment #{index + 1}
                                </h4>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    fulfillment.status === 'SUCCESS'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}
                                >
                                  {fulfillment.status === 'SUCCESS' ? 'Delivered' : 'Processing'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Summary Sidebar */}
                <div className="lg:col-span-1">
                  <div className="bg-slate-50 rounded-3xl p-6 sticky top-4 border border-slate-100">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h3>

                    {/* Order Status */}
                    <div className="mb-6 p-4 bg-white rounded-2xl border border-slate-100">
                      <h4 className="font-medium text-slate-900 mb-2">Order Status</h4>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${fulfillmentStatus.color}`}>
                          {fulfillmentStatus.text}
                        </span>
                      </div>
                    </div>

                    {/* Order Totals */}
                    <div className="space-y-4 mb-6 p-4 bg-white rounded-2xl border border-slate-100">
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal</span>
                        <span className="font-semibold">
                          <Money data={order.subtotal} />
                        </span>
                      </div>

                      {order.totalTax?.amount && (
                        <div className="flex justify-between text-slate-600">
                          <span>Tax</span>
                          <span className="font-semibold">
                            <Money data={order.totalTax} />
                          </span>
                        </div>
                      )}

                      <div className="border-t border-slate-200 pt-4">
                        <div className="flex justify-between text-lg font-bold text-slate-900">
                          <span>Total</span>
                          <span className="text-2xl text-indigo-600">
                            <Money data={order.totalPrice} />
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                      <div className="mb-6 p-4 bg-white rounded-2xl border border-slate-100">
                        <h4 className="font-medium text-slate-900 mb-2">Shipping Address</h4>
                        <div className="text-sm text-slate-600">
                          <p className="font-semibold">{order.shippingAddress.name}</p>
                          {order.shippingAddress.formatted?.map((line: string, idx: number) => (
                            <p key={idx}>{line}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Billing Address */}
                    {order.billingAddress && (
                      <div className="mb-6 p-4 bg-white rounded-2xl border border-slate-100">
                        <h4 className="font-medium text-slate-900 mb-2">Billing Address</h4>
                        <div className="text-sm text-slate-600">
                          <p className="font-semibold">{order.billingAddress.name}</p>
                          {order.billingAddress.formatted?.map((line: string, idx: number) => (
                            <p key={idx}>{line}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-3">
                      <a
                        href="/collections"
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Shop Again
                      </a>

                      <button
                        onClick={onClose}
                        className="w-full bg-white text-slate-700 font-semibold py-3 px-6 rounded-2xl border-2 border-slate-200 hover:border-indigo-500 hover:text-indigo-600 transition-all duration-300 flex items-center justify-center"
                      >
                        Close Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}