import {useLoaderData, useActionData, Link, useSearchParams} from 'react-router';
import type {
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from '@shopify/remix-oxygen';
import {ProductPrice} from '~/components/ProductPrice';
import {CartForm} from '@shopify/hydrogen';
import {useState} from 'react';

import {PRODUCT_BY_HANDLE_QUERY} from '~/graphql';

export async function loader({params, context, request}: LoaderFunctionArgs) {
  const {handle} = params;
  const {storefront} = context;
  const url = new URL(request.url);

  if (!handle) {
    throw new Response('Product handle is required', {status: 400});
  }

  // Parse selected options from URL
  const selectedOptions: Array<{name: string; value: string}> = [];
  url.searchParams.forEach((value, name) => {
    // Skip internal parameters
    if (!name.startsWith('_') && name !== '_routes') {
      selectedOptions.push({name, value});
    }
  });

  try {
    console.log('Loading product with handle:', handle);
    console.log('Selected options:', selectedOptions);
    
    const {product} = await storefront.query(PRODUCT_BY_HANDLE_QUERY, {
      variables: {
        handle,
        selectedOptions,
      },
    });

    console.log('Product loaded successfully:', product?.id ? 'Yes' : 'No');
    console.log('Product title:', product?.title);

    if (!product?.id) {
      throw new Response('Product not found', {status: 404});
    }

    // Only redirect if no options are selected and product has variants
    if (selectedOptions.length === 0 && product.variants.nodes.length > 0) {
      const firstVariant = product.variants.nodes[0];
      if (firstVariant && firstVariant.selectedOptions.length > 0) {
        const searchParams = new URLSearchParams();
        firstVariant.selectedOptions.forEach(
          (option: {name: string; value: string}) => {
            searchParams.set(option.name, option.value);
          },
        );
        throw new Response(null, {
          status: 302,
          headers: {
            Location: `/products/${handle}?${searchParams.toString()}`,
          },
        });
      }
    }

    return {product};
  } catch (error) {
    console.error('Error loading product:', error);
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error?.constructor?.name);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Check if it's a 404 error (product not found)
    if (error instanceof Response && error.status === 404) {
      throw error;
    }
    
    // Check if it's a redirect response
    if (error instanceof Response && error.status === 302) {
      throw error;
    }
    
    // For now, re-throw all errors to see what's actually happening
    console.error('Re-throwing error to see actual issue:', error);
    throw error;
  }
}

export async function action({request, context}: ActionFunctionArgs) {
  const {cart} = context;
  const formData = await request.formData();
  const action = formData.get('cartAction');

  if (action === 'LinesAdd') {
    const lines = JSON.parse(formData.get('lines') as string) as Array<{
      merchandiseId: string;
      quantity: number;
    }>;
    return await cart.addLines(lines);
  }

  throw new Response('Invalid action', {status: 400});
}

export default function Product() {
  const {product} = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = product.selectedVariant || product.variants.nodes[0];
  const images = product.images.nodes || [];
  const isFallbackProduct = product.id === 'fallback-product';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/products" className="hover:text-blue-600">Sản phẩm</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Fallback Product Notice */}
          {isFallbackProduct && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Demo Mode</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    This is a demo product. Connect to a Shopify store to see real product data.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {images[selectedImage] ? (
                  <img
                    src={images[selectedImage].url}
                    alt={images[selectedImage].altText || product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((image: any, index: number) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square bg-white rounded-lg border-2 overflow-hidden transition-all ${
                        selectedImage === index
                          ? 'border-blue-600 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.altText || `${product.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Product Header */}
              <div className="space-y-3">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.title}</h1>
                {product.vendor && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Thương hiệu:</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                      {product.vendor}
                    </span>
                  </div>
                )}
                {product.productType && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Loại:</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                      {product.productType}
                    </span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-blue-600">
                    <ProductPrice price={selectedVariant.price} />
                  </span>
                  {selectedVariant.compareAtPrice && (
                    <span className="text-xl text-gray-500 line-through">
                      <ProductPrice price={selectedVariant.compareAtPrice} />
                    </span>
                  )}
                </div>
                {selectedVariant.compareAtPrice && (
                  <div className="text-sm text-green-600 font-medium">
                    Tiết kiệm {Math.round(
                      ((parseFloat(selectedVariant.compareAtPrice.amount) - parseFloat(selectedVariant.price.amount)) / parseFloat(selectedVariant.compareAtPrice.amount)) * 100
                    )}%
                  </div>
                )}
              </div>

              {/* Availability */}
              <div className="flex items-center gap-2">
                {selectedVariant.availableForSale ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Còn hàng</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium">Hết hàng</span>
                  </div>
                )}
              </div>

              {/* Variant Selector */}
              {!isFallbackProduct && product.options
                .filter((option: any) => option.values.length > 1)
                .map((option: any) => (
                  <div key={option.name} className="space-y-3">
                    <label className="text-sm font-semibold text-gray-900">
                      {option.name}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value: any) => {
                        const isSelected = selectedVariant.selectedOptions.find(
                          (selectedOption: any) =>
                            selectedOption.name === option.name &&
                            selectedOption.value === value,
                        );

                        const handleVariantSelect = () => {
                          const newSearchParams = new URLSearchParams(searchParams);
                          newSearchParams.set(option.name, value);
                          setSearchParams(newSearchParams);
                        };

                        return (
                          <button
                            key={value}
                            onClick={handleVariantSelect}
                            className={`px-4 py-2 border-2 rounded-lg text-sm font-medium transition-all ${
                              isSelected
                                ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                                : 'border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                            }`}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

              {/* Add to Cart Form */}
              {!isFallbackProduct ? (
                <CartForm
                  route="/cart"
                  action={CartForm.ACTIONS.LinesAdd}
                  inputs={{
                    lines: [
                      {
                        merchandiseId: selectedVariant.id,
                        quantity,
                      },
                    ],
                  }}
                >
                <div className="space-y-4">
                  {/* Quantity Selector */}
                  <div className="flex items-center gap-4">
                    <label htmlFor="quantity" className="text-sm font-semibold text-gray-900">
                      Số lượng:
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="px-4 py-2 text-gray-900 font-medium min-w-[3rem] text-center">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    type="submit"
                    disabled={!selectedVariant.availableForSale}
                    className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
                      selectedVariant.availableForSale
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {selectedVariant.availableForSale
                      ? 'Thêm vào giỏ hàng'
                      : 'Hết hàng'}
                  </button>

                  {/* Buy Now Button */}
                  {selectedVariant.availableForSale && (
                    <button
                      type="button"
                      className="w-full py-4 px-6 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold text-lg rounded-lg transition-all"
                    >
                      Mua ngay
                    </button>
                  )}
                </div>
              </CartForm>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-lg p-6 text-center">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Demo Product</h3>
                    <p className="text-gray-600 mb-4">
                      This is a demo product. Connect to a Shopify store to enable shopping features.
                    </p>
                    <button
                      disabled
                      className="w-full py-4 px-6 bg-gray-300 text-gray-500 font-semibold text-lg rounded-lg cursor-not-allowed"
                    >
                      Demo Mode - Add to Cart Disabled
                    </button>
                  </div>
                </div>
              )}

              {/* Product Description */}
              {product.descriptionHtml && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Mô tả sản phẩm</h3>
                  <div
                    className="prose prose-sm max-w-none text-gray-600"
                    dangerouslySetInnerHTML={{__html: product.descriptionHtml}}
                  />
                </div>
              )}

              {/* Additional Info */}
              <div className="border-t border-gray-200 pt-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Thông tin bổ sung</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-600">Giao hàng miễn phí</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-600">Đổi trả trong 30 ngày</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-600">Bảo hành chính hãng</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-600">Hỗ trợ 24/7</span>
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
