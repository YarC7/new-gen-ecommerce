import {useLoaderData, Link} from 'react-router';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {ALL_COLLECTIONS_QUERY, FEATURED_PRODUCTS_QUERY} from '~/graphql';

export async function loader({context}: LoaderFunctionArgs) {
  const {storefront} = context;

  try {
    const [allCollections, featuredProducts] = await Promise.all([
      storefront.query(ALL_COLLECTIONS_QUERY),
      storefront.query(FEATURED_PRODUCTS_QUERY),
    ]);

    return {
      allCollections,
      featuredProducts,
    };
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    // Return mock data when Shopify store is not connected
    return {
      allCollections: {
        collections: {
          nodes: [],
        },
      },
      featuredProducts: {
        products: {
          nodes: [],
        },
      },
    };
  }
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  const {allCollections, featuredProducts} = data;

  return (
    <div className="home">
      {/* Hero Section - Modern Gradient with Animation */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
          <div className="absolute inset-0 bg-black/20"></div>
          {/* Floating Elements */}
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 leading-tight">
              Discover Your
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                Perfect Style
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-gray-200 max-w-2xl mx-auto leading-relaxed">
              Experience premium quality products with modern design and
              exceptional craftsmanship
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/collections"
                className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-full hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
              >
                <span className="relative z-10">Shop Collection</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
              </Link>
              <Link
                to="/search"
                className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-full hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
              >
                Explore Products
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/70 animate-bounce">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-4xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                1000+
              </div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                500+
              </div>
              <div className="text-gray-600">Products</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                50+
              </div>
              <div className="text-gray-600">Categories</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                24/7
              </div>
              <div className="text-gray-600">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* All Collections Ribbon */}
      {allCollections?.collections?.nodes?.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 ">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Explore All Collections
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
                Discover our complete range of curated collections
              </p>
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-purple-600 mx-auto rounded-full"></div>
            </div>

            {/* Collections Ribbon */}
            <div className="relative">
              {/* Scroll Indicators */}
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10">
                <button className="bg-white/80 backdrop-blur-sm text-gray-800 p-3 rounded-full shadow-lg hover:bg-white transition-all duration-300 hover:shadow-xl">
                  <svg
                    className="w-6 h-6"
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
                </button>
              </div>

              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10">
                <button className="bg-white/80 backdrop-blur-sm text-gray-800 p-3 rounded-full shadow-lg hover:bg-white transition-all duration-300 hover:shadow-xl">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              {/* Collections Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4">
                {allCollections.collections.nodes.map(
                  (collection: any, index: number) => (
                    <div
                      key={collection.id}
                      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-purple-200 transform hover:-translate-y-2"
                      style={{animationDelay: `${index * 100}ms`}}
                    >
                      <div className="relative overflow-hidden">
                        {collection.image ? (
                          <img
                            src={collection.image.url}
                            alt={collection.image.altText || collection.title}
                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                            <svg
                              className="w-16 h-16 text-purple-300"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Collection Badge */}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                          Collection
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="font-bold text-xl mb-3 text-gray-900 group-hover:text-purple-600 transition-colors">
                          {collection.title}
                        </h3>
                        {collection.description && (
                          <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                            {collection.description}
                          </p>
                        )}
                        <Link
                          to={`/collections/${collection.handle}`}
                          className="inline-flex items-center w-full justify-center bg-gradient-to-r from-gray-900 to-gray-800 text-white py-3 px-4 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg group"
                        >
                          <span className='text-white'>Explore</span>
                          <svg
                            className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* View All Collections Button */}
            <div className="text-center mt-16">
              <Link
                to="/collections"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group"
              >
                <span>View All Collections</span>
                <svg
                  className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products - Modern Grid */}
      {featuredProducts?.products?.nodes?.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Featured Products
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover our handpicked selection of premium products
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-purple-600 mx-auto rounded-full mt-6"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.products.nodes.map(
                (product: any, index: number) => (
                  <div
                    key={product.id}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-purple-200"
                    style={{animationDelay: `${index * 100}ms`}}
                  >
                    <div className="relative overflow-hidden">
                      {product.images.nodes[0] && (
                        <img
                          src={product.images.nodes[0].url}
                          alt={product.images.nodes[0].altText || product.title}
                          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {/* Quick View Button */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Link
                          to={`/products/${product.handle}`}
                          className="bg-white/90 backdrop-blur-sm text-gray-900 px-6 py-2 rounded-full font-semibold hover:bg-white transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300"
                        >
                          Quick View
                        </Link>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="font-bold text-lg mb-3 text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2">
                        {product.title}
                      </h3>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-purple-600">
                          ${product.priceRange.minVariantPrice.amount}
                        </span>
                        <span className="text-sm text-gray-500">
                          {product.priceRange.minVariantPrice.currencyCode}
                        </span>
                      </div>
                      <Link
                        to={`/products/${product.handle}`}
                        className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-3 px-4 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg text-center block"
                      >
                        <span className='text-white'>
                        View Details
                        </span>
                      </Link>
                    </div>
                  </div>
                ),
              )}
            </div>

            {/* View All Products Button */}
            <div className="text-center mt-16">
              <Link
                to="/collections"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group"
              >
                <span>View All Products</span>
                <svg
                  className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* No Data Fallback - Show when Shopify is not connected */}
      {!allCollections?.collections?.nodes?.length && !featuredProducts?.products?.nodes?.length && (
        <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Connect Your Shopify Store
                </h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  This beautiful e-commerce template is ready to display your products! 
                  Connect your Shopify store to see collections and products here.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">How to Connect:</h3>
                <div className="text-left space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-1 flex-shrink-0">1</div>
                    <div>
                      <p className="font-medium text-gray-900">Create a Shopify store</p>
                      <p className="text-gray-600 text-sm">Set up your store at shopify.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-1 flex-shrink-0">2</div>
                    <div>
                      <p className="font-medium text-gray-900">Get your API credentials</p>
                      <p className="text-gray-600 text-sm">Generate Storefront API access token</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-1 flex-shrink-0">3</div>
                    <div>
                      <p className="font-medium text-gray-900">Configure environment</p>
                      <p className="text-gray-600 text-sm">Add your credentials to .env file</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose Us
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              We&apos;re committed to providing the best shopping experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Free Shipping</h3>
              <p className="text-gray-300 leading-relaxed">
                Enjoy free shipping on all orders over $50. Fast and reliable
                delivery to your doorstep.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Quality Guarantee</h3>
              <p className="text-gray-300 leading-relaxed">
                All our products come with a quality guarantee. If you&apos;re
                not satisfied, we&apos;ll make it right.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">24/7 Support</h3>
              <p className="text-gray-300 leading-relaxed">
                Our customer support team is available 24/7 to help you with any
                questions or concerns.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
