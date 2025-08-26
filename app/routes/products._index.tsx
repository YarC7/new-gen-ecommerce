import {useLoaderData, Link} from 'react-router';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {ProductPrice} from '~/components/ProductPrice';
import {PRODUCTS_QUERY} from '~/graphql';

export async function loader({context}: LoaderFunctionArgs) {
  const {storefront} = context;
  let products;
  try {
    products = await storefront.query(PRODUCTS_QUERY);
  } catch (error) {
    console.error('Error fetching products:', error);
    products = {
      products: {
        nodes: [],
      },
      shop: {
        name: 'My Store',
        description: 'Premium quality products',
      },
    };
  }
  return {products};
}

export default function ProductsIndex() {
  const {products} = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Sản phẩm</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Tất cả sản phẩm
            </h1>
            <p className="text-lg text-gray-600">
              Khám phá bộ sưu tập đa dạng của chúng tôi
            </p>
          </div>
        </div>
      </section>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filters Sidebar */}
            <aside className="lg:w-80 bg-white rounded-lg shadow-sm border border-gray-200 h-fit lg:sticky lg:top-8">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Bộ lọc sản phẩm</h3>
                </div>

                {/* Categories Filter */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Danh mục</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value="all"
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Tất cả sản phẩm</span>
                    </label>
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Khoảng giá</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Từ"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="number"
                        placeholder="Đến"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Status Filter */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Tình trạng</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                      />
                      <span className="text-sm text-gray-700">Chỉ hiển thị sản phẩm còn hàng</span>
                    </label>
                  </div>
                </div>

                {/* Apply Filters Button */}
                <button className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                  Áp dụng bộ lọc
                </button>
              </div>
            </aside>

            {/* Products Section */}
            <main className="flex-1">
              {/* Results Header */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-gray-900">Sản phẩm</h2>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Sort Dropdown */}
                    <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                      <option>Sắp xếp theo</option>
                      <option>Tên A-Z</option>
                      <option>Tên Z-A</option>
                      <option>Giá thấp đến cao</option>
                      <option>Giá cao đến thấp</option>
                      <option>Mới nhất</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              {products?.products?.nodes?.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <div className="max-w-md mx-auto">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Không có sản phẩm nào</h3>
                    <p className="text-gray-600 mb-6">
                      Hiện tại không có sản phẩm nào trong danh mục này.
                    </p>
                    <Link
                      to="/"
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      Về trang chủ
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products?.products?.nodes?.map((product: any) => (
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
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
