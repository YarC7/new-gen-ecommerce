import {useLoaderData, Link} from 'react-router';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {ProductPrice} from '~/components/ProductPrice';
import {COLLECTION_BY_HANDLE_QUERY} from '~/graphql';

export async function loader({params, context, request}: LoaderFunctionArgs) {
  const {handle} = params;
  const {storefront} = context;
  const url = new URL(request.url);
  const cursor = url.searchParams.get('cursor');

  if (!handle) {
    throw new Response('Collection handle is required', {status: 400});
  }

  try {
    const {collection} = await storefront.query(COLLECTION_BY_HANDLE_QUERY, {
      variables: {
        handle,
        first: cursor ? undefined : 20,
        last: cursor ? 20 : undefined,
        startCursor: cursor || undefined,
      },
    });

    if (!collection) {
      throw new Response('Collection not found', {status: 404});
    }

    return {collection};
  } catch (error) {
    console.error('Error fetching collection:', error);
    // Return mock data when Shopify store is not connected
    return {
      collection: {
        id: 'mock-collection',
        title: handle.charAt(0).toUpperCase() + handle.slice(1).replace(/-/g, ' '),
        description: 'This collection will show products when connected to a Shopify store.',
        handle,
        image: null,
        products: {
          nodes: [],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
            endCursor: null,
          },
        },
      },
    };
  }
}

export default function Collection() {
  const {collection} = useLoaderData<typeof loader>();

  // Safe check for products data
  const products = collection?.products?.nodes || [];
  const hasProducts = products.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/collections" className="hover:text-blue-600">Danh mục</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{collection?.title || 'Collection'}</span>
          </nav>
        </div>
      </div>

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Collection Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            {collection?.image && (
              <div className="mb-6">
                <img
                  src={collection.image.url}
                  alt={collection.image.altText || collection.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{collection?.title || 'Collection'}</h1>
            {collection?.description && (
              <p className="text-gray-600 text-lg max-w-3xl">
                {collection.description}
              </p>
            )}
          </div>

          {/* Products Grid */}
          {!hasProducts ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="max-w-md mx-auto">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7" />
                </svg>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Không có sản phẩm nào</h2>
                <p className="text-gray-600 mb-6">
                  Danh mục này chưa có sản phẩm nào.
                </p>
                <Link
                  to="/collections"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Xem tất cả danh mục
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product: any) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300"
                  >
                    <div className="relative overflow-hidden">
                      <div className="h-48">
                        {product.images?.nodes?.[0] ? (
                          <Link to={`/products/${product.handle}`}>
                            <img
                              src={product.images.nodes[0].url}
                              alt={product.images.nodes[0].altText || product.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </Link>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      {!product.variants?.nodes?.[0]?.availableForSale && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                          Hết hàng
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                        <Link
                          to={`/products/${product.handle}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {product.title}
                        </Link>
                      </h3>
                      
                      <div className="flex items-center gap-2 mb-2">
                        {product.vendor && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {product.vendor}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg font-bold text-blue-600">
                          <ProductPrice price={product.priceRange?.minVariantPrice} />
                        </span>
                        {product.compareAtPriceRange?.minVariantPrice && (
                          <span className="text-gray-500 line-through text-sm">
                            <ProductPrice price={product.compareAtPriceRange.minVariantPrice} />
                          </span>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Link
                          to={`/products/${product.handle}`}
                          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-sm text-center transition-colors"
                        >
                          Xem chi tiết
                        </Link>
                        {product.variants?.nodes?.[0]?.availableForSale && (
                          <button className="px-3 py-2 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold rounded text-sm transition-colors">
                            Thêm vào giỏ
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {collection?.products?.pageInfo && (
                <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {collection.products.pageInfo.hasPreviousPage && (
                      <Link
                        to={`/collections/${collection.handle}?cursor=${collection.products.pageInfo.startCursor}`}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Trước
                      </Link>
                    )}
                    
                    <div className="text-center text-gray-600">
                      Hiển thị {products.length} sản phẩm
                    </div>
                    
                    {collection.products.pageInfo.hasNextPage && (
                      <Link
                        to={`/collections/${collection.handle}?cursor=${collection.products.pageInfo.endCursor}`}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                      >
                        Tiếp
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
