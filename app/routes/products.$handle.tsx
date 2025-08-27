import {useLoaderData, useSearchParams, Link} from 'react-router';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {CartForm} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {useState} from 'react';

export async function loader({params, context, request}: LoaderFunctionArgs) {
  const {handle} = params;
  const {storefront} = context;
  const url = new URL(request.url);

  if (!handle) {
    throw new Response('Product handle is required', {status: 400});
  }

  // Enhanced logging for debugging
  console.log('Loading product with handle:', handle);

  try {
    const {product} = await storefront.query(PRODUCT_QUERY, {
      variables: {
        handle,
      },
    });

    console.log('Product loaded successfully:', !!product);
    console.log('Product title:', product?.title);

    if (!product?.id) {
      throw new Response('Product not found', {status: 404});
    }

    return {product};
  } catch (error) {
    console.error('Error loading product:', error);
    
    // Re-throw redirects and 404s
    if (error instanceof Response) {
      throw error;
    }
    
    throw new Response('Failed to load product', {status: 500});
  }
}

export default function Product() {
  const {product} = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Get selected variant based on URL parameters
  const selectedVariant = getSelectedVariant(product, searchParams);
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

            {/* Product Details */}
            <div className="space-y-6">
              {/* Product Title */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
                <p className="text-lg text-gray-600">{product.description}</p>
              </div>

              {/* Product Price */}
              <div className="flex items-center gap-4">
                <ProductPrice price={selectedVariant.price} />
                {selectedVariant.compareAtPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    <ProductPrice price={selectedVariant.compareAtPrice} />
                  </span>
                )}
              </div>

              {/* Product Options */}
              {product.options.map((option: any) => (
                <div key={option.name} className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900">{option.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((value: string) => (
                      <button
                        key={value}
                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
                          selectedVariant.selectedOptions.some(
                            (selectedOption: any) => 
                              selectedOption.name === option.name && 
                              selectedOption.value === value
                          )
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600 hover:text-blue-600'
                        }`}
                        onClick={() => {
                          const newSearchParams = new URLSearchParams(searchParams);
                          newSearchParams.set(option.name, value);
                          setSearchParams(newSearchParams);
                        }}
                      >
                        {value}
                      </button>
                    ))}
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
                    disabled={!selectedVariant?.availableForSale}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    {selectedVariant?.availableForSale ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                        </svg>
                        Thêm vào giỏ hàng
                      </span>
                    ) : (
                      'Hết hàng'
                    )}
                  </button>
                </div>
                </CartForm>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-lg p-4 text-center">
                    <p className="text-gray-600">Demo product - Add to cart not available</p>
                  </div>
                </div>
              )}

              {/* Product Description */}
              <div className="prose prose-gray max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Mô tả sản phẩm</h3>
                <div 
                  className="text-gray-600 leading-relaxed"
                  dangerouslySetInnerHTML={{__html: product.descriptionHtml}}
                />
              </div>

              {/* Product Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get selected variant based on URL parameters
function getSelectedVariant(product: any, searchParams: URLSearchParams) {
  const selectedOptions: Array<{name: string; value: string}> = [];
  
  // Parse selected options from URL parameters
  searchParams.forEach((value, name) => {
    if (!name.startsWith('_') && name !== '_routes') {
      selectedOptions.push({name, value});
    }
  });

  // If no options selected, return first variant
  if (selectedOptions.length === 0) {
    return product.variants.nodes[0];
  }

  // Find variant that matches selected options
  const selectedVariant = product.variants.nodes.find((variant: any) => {
    return selectedOptions.every((option) => {
      return variant.selectedOptions.some((variantOption: any) => 
        variantOption.name === option.name && variantOption.value === option.value
      );
    });
  });

  return selectedVariant || product.variants.nodes[0];
}

const PRODUCT_QUERY = `#graphql
  query Product($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      options {
        name
        values
      }
      images(first: 20) {
        nodes {
          id
          url
          altText
          width
          height
        }
      }
      variants(first: 250) {
        nodes {
          id
          title
          availableForSale
          selectedOptions {
            name
            value
          }
          image {
            id
            url
            altText
            width
            height
          }
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          sku
          unitPrice {
            amount
            currencyCode
          }
        }
      }
      seo {
        title
        description
      }
      tags
    }
  }
`;
