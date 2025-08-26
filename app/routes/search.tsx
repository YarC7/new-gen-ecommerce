import {useLoaderData, Form, useSearchParams, Link} from 'react-router';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {ProductPrice} from '~/components/ProductPrice';
import {useState, useEffect} from 'react';
import {PRODUCTS_SEARCH_QUERY, COLLECTIONS_FOR_SEARCH_QUERY} from '~/graphql';

export async function loader({request, context}: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const searchTerm = url.searchParams.get('q') || '';
  const cursor = url.searchParams.get('cursor');
  const sortKey = url.searchParams.get('sort') || 'RELEVANCE';
  const reverse = url.searchParams.get('reverse') === 'true';
  const minPrice = url.searchParams.get('minPrice');
  const maxPrice = url.searchParams.get('maxPrice');
  const collection = url.searchParams.get('collection');
  const productType = url.searchParams.get('productType');
  const vendor = url.searchParams.get('vendor');
  const availability = url.searchParams.get('availability');
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 24;

  const {storefront} = context;

  // Build search query with filters
  let searchQuery = searchTerm;
  const filters: string[] = [];

  if (collection) {
    filters.push(`collection:${collection}`);
  }
  if (productType) {
    filters.push(`product_type:${productType}`);
  }
  if (vendor) {
    filters.push(`vendor:${vendor}`);
  }
  if (availability === 'in_stock') {
    filters.push('available:true');
  } else if (availability === 'out_of_stock') {
    filters.push('available:false');
  }
  if (minPrice || maxPrice) {
    const priceFilter = [];
    if (minPrice) priceFilter.push(`>=${minPrice}`);
    if (maxPrice) priceFilter.push(`<=${maxPrice}`);
    if (priceFilter.length > 0) {
      filters.push(`price:${priceFilter.join(' AND ')}`);
    }
  }

  if (filters.length > 0) {
    searchQuery = `${searchTerm} ${filters.join(' ')}`.trim();
  }

  // Get products
  let productsData;
  try {
    productsData = await storefront.query(PRODUCTS_SEARCH_QUERY, {
      variables: {
        query: searchQuery,
        first: limit,
        after: cursor,
        sortKey: sortKey as any,
        reverse,
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    productsData = {
      products: {
        nodes: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
      },
    };
  }

  // Get collections for filter
  let collectionsData;
  try {
    collectionsData = await storefront.query(COLLECTIONS_FOR_SEARCH_QUERY);
  } catch (error) {
    console.error('Error fetching collections:', error);
    collectionsData = {
      collections: {
        nodes: [],
      },
    };
  }

  // Extract unique product types and vendors from results
  const productTypes = new Set<string>();
  const vendors = new Set<string>();

  if (productsData?.products?.nodes) {
    productsData.products.nodes.forEach((product: any) => {
      if (product.productType) productTypes.add(product.productType);
      if (product.vendor) vendors.add(product.vendor);
    });
  }

  return {
    products: productsData.products,
    collections: collectionsData.collections,
    filters: {
      productTypes: Array.from(productTypes).sort(),
      vendors: Array.from(vendors).sort(),
    },
    searchParams: {
      searchTerm,
      sortKey,
      reverse,
      minPrice,
      maxPrice,
      collection,
      productType,
      vendor,
      availability,
      page,
    },
  };
}

export default function ProductSearch() {
  const data = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const {products, collections, filters, searchParams: currentParams} = data;

  const totalResults = products.nodes.length;
  const hasResults = totalResults > 0;

  // Update URL when filters change
  const updateSearchParams = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });

    // Reset to first page when filters change
    newParams.delete('cursor');
    newParams.delete('page');

    setSearchParams(newParams);
  };

  const clearFilters = () => {
    const newParams = new URLSearchParams();
    if (currentParams.searchTerm) {
      newParams.set('q', currentParams.searchTerm);
    }
    setSearchParams(newParams);
  };

  const hasActiveFilters = Object.values(currentParams).some(
    (value) =>
      value &&
      value !== currentParams.searchTerm &&
      value !== 'RELEVANCE' &&
      value !== '1',
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/products" className="hover:text-blue-600">Sản phẩm</Link>
            {currentParams.searchTerm && (
              <>
                <span className="mx-2">/</span>
                <span className="text-gray-900">{currentParams.searchTerm}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Search Header */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {currentParams.searchTerm ? `Kết quả tìm kiếm cho "${currentParams.searchTerm}"` : 'Tìm kiếm sản phẩm'}
              </h1>
              {hasResults && (
                <p className="text-lg text-gray-600">
                  {totalResults} sản phẩm được tìm thấy
                </p>
              )}
            </div>
            
            {/* Search Form */}
            <Form method="get" className="flex-shrink-0">
              <div className="flex max-w-md bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                <input
                  type="search"
                  name="q"
                  placeholder="Tìm kiếm sản phẩm..."
                  defaultValue={currentParams.searchTerm}
                  className="flex-1 px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 transition-colors">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </Form>
          </div>
        </div>
      </section>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filters Sidebar */}
            <aside className={`lg:w-80 bg-white rounded-lg shadow-sm border border-gray-200 h-fit lg:sticky lg:top-8 ${
              showFilters ? 'fixed inset-0 z-50 lg:relative lg:inset-auto' : 'hidden lg:block'
            }`}>
              {/* Mobile Overlay */}
              {showFilters && (
                <div 
                  className="fixed inset-0 bg-black bg-opacity-50 lg:hidden" 
                  onClick={() => setShowFilters(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setShowFilters(false);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Close filters overlay"
                />
              )}
              
              <div className="relative bg-white h-full lg:h-auto overflow-y-auto lg:overflow-visible">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Bộ lọc sản phẩm</h3>
                  {hasActiveFilters && (
                    <button 
                      onClick={clearFilters} 
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Xóa tất cả ({Object.keys(currentParams).filter(key => key !== 'searchTerm' && currentParams[key as keyof typeof currentParams]).length})
                    </button>
                  )}
                  <button
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
                    aria-label="Close filters"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Categories Filter */}
                {collections.nodes.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Danh mục</h4>
                    <div className="space-y-2">
                      {collections.nodes.map((collection: any) => (
                        <label key={collection.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            name="collection"
                            value={collection.handle}
                            checked={currentParams.collection === collection.handle}
                            onChange={(e) => updateSearchParams({collection: e.target.checked ? e.target.value : null})}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{collection.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Brand Filter */}
                {filters.vendors.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Thương hiệu</h4>
                    <div className="space-y-2">
                      {filters.vendors.map((vendor) => (
                        <label key={vendor} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            name="vendor"
                            value={vendor}
                            checked={currentParams.vendor === vendor}
                            onChange={(e) => updateSearchParams({vendor: e.target.checked ? e.target.value : null})}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{vendor}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Range Filter */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Khoảng giá</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Từ"
                        value={currentParams.minPrice || ''}
                        onChange={(e) => updateSearchParams({minPrice: e.target.value || null})}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="number"
                        placeholder="Đến"
                        value={currentParams.maxPrice || ''}
                        onChange={(e) => updateSearchParams({maxPrice: e.target.value || null})}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    {/* Price Range Display */}
                    {(currentParams.minPrice || currentParams.maxPrice) && (
                      <div className="text-xs text-gray-600">
                        {currentParams.minPrice && `${parseInt(currentParams.minPrice).toLocaleString()}đ`} 
                        {currentParams.minPrice && currentParams.maxPrice && ' - '}
                        {currentParams.maxPrice && `${parseInt(currentParams.maxPrice).toLocaleString()}đ`}
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Type Filter */}
                {filters.productTypes.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Loại sản phẩm</h4>
                    <div className="space-y-2">
                      {filters.productTypes.map((type) => (
                        <label key={type} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            name="productType"
                            value={type}
                            checked={currentParams.productType === type}
                            onChange={(e) => updateSearchParams({productType: e.target.checked ? e.target.value : null})}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Availability Filter */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Tình trạng</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        name="availability"
                        checked={currentParams.availability === 'in_stock'}
                        onChange={(e) => updateSearchParams({availability: e.target.checked ? 'in_stock' : null})}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                      />
                      <span className="text-sm text-gray-700">Chỉ hiển thị sản phẩm còn hàng</span>
                    </label>
                  </div>
                </div>

                {/* Apply Filters Button */}
                <button 
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Áp dụng bộ lọc
                </button>
              </div>
            </aside>

            {/* Search Results */}
            <main className="flex-1">
              {/* Results Header */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowFilters(true)}
                      className="lg:hidden flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                      </svg>
                      Bộ lọc
                    </button>
                    <h2 className="text-lg font-semibold text-gray-900">Sản phẩm</h2>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Sort Dropdown */}
                    <select
                      value={currentParams.sortKey}
                      onChange={(e) => updateSearchParams({sort: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="RELEVANCE">Sắp xếp theo</option>
                      <option value="TITLE">Tên A-Z</option>
                      <option value="TITLE_DESC">Tên Z-A</option>
                      <option value="PRICE">Giá thấp đến cao</option>
                      <option value="PRICE_DESC">Giá cao đến thấp</option>
                      <option value="CREATED_AT">Mới nhất</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Results Content */}
              {!hasResults ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <div className="max-w-md mx-auto">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy sản phẩm nào.</h3>
                    <p className="text-gray-600 mb-6">
                      Vui lòng thử điều chỉnh bộ lọc của bạn.
                    </p>
                    {hasActiveFilters && (
                      <button 
                        onClick={clearFilters} 
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                      >
                        Xóa bộ lọc
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* Products Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.nodes.map((product: any) => (
                      <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
                        <div className="relative overflow-hidden">
                          <div className="h-48">
                            {product.images.nodes[0] ? (
                              <img
                                src={product.images.nodes[0].url}
                                alt={product.images.nodes[0].altText || product.title}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7" />
                                </svg>
                              </div>
                            )}
                          </div>
                          {!product.variants.nodes[0]?.availableForSale && (
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
                              <ProductPrice price={product.priceRange.minVariantPrice} />
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
                            {product.variants.nodes[0]?.availableForSale && (
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
                  {(products.pageInfo.hasNextPage || products.pageInfo.hasPreviousPage) && (
                    <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        {products.pageInfo.hasPreviousPage && (
                          <Link
                            to={`/search?${new URLSearchParams({
                              ...Object.fromEntries(searchParams),
                              cursor: products.pageInfo.startCursor,
                            })}`}
                            className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Trước
                          </Link>
                        )}
                        
                        <div className="text-center text-gray-600">
                          Hiển thị {Math.min(products.nodes.length, 24)} trong {totalResults} kết quả
                        </div>
                        
                        {products.pageInfo.hasNextPage && (
                          <Link
                            to={`/search?${new URLSearchParams({
                              ...Object.fromEntries(searchParams),
                              cursor: products.pageInfo.endCursor,
                            })}`}
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
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
