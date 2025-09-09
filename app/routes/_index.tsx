import {useLoaderData, Link} from 'react-router';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {
  ALL_COLLECTIONS_QUERY,
  FEATURED_PRODUCTS_QUERY,
  ALL_PRODUCTS_QUERY,
} from '~/graphql';
import {Image} from '@shopify/hydrogen';
import {useRef, useState, useEffect} from 'react';
import {ProductCard} from '~/components/ui/ProductCard';

export async function loader({context}: LoaderFunctionArgs) {
  const {storefront} = context;

  try {
    const [allCollections, featuredProducts, allProducts] = await Promise.all([
      storefront.query(ALL_COLLECTIONS_QUERY),
      storefront.query(FEATURED_PRODUCTS_QUERY),
      storefront.query(ALL_PRODUCTS_QUERY),
    ]);

    return {
      allCollections,
      featuredProducts,
      allProducts,
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
      allProducts: {
        products: {
          nodes: [],
        },
      },
    };
  }
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  const {allCollections, featuredProducts, allProducts} = data;
  const heroProducts = featuredProducts?.products?.nodes || [];
  const collectionsScrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const scrollStartLeftRef = useRef(0);

  useEffect(() => {
    const el = collectionsScrollRef.current;
    if (!el) return;
    const update = () => {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };
    update();
    el.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  function onDragStart(e: React.MouseEvent | React.TouchEvent) {
    const el = collectionsScrollRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    if ('touches' in e) {
      dragStartXRef.current = e.touches[0].clientX;
    } else {
      dragStartXRef.current = e.clientX;
    }
    scrollStartLeftRef.current = el.scrollLeft;
  }

  function onDragMove(e: React.MouseEvent | React.TouchEvent) {
    const el = collectionsScrollRef.current;
    if (!el || !isDraggingRef.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const delta = dragStartXRef.current - clientX;
    el.scrollLeft = scrollStartLeftRef.current + delta;
  }

  function onDragEnd() {
    isDraggingRef.current = false;
  }

  const collections = allCollections?.collections?.nodes ?? [];
  const topCollections = collections.slice(0, 4);
  const moreCollections = collections.slice(4);

  const products = allProducts?.products?.nodes ?? [];
  const featuredProductsList = featuredProducts?.products?.nodes ?? [];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8 z-10">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200">
                <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-sm font-medium text-blue-700">New Platform Release</span>
              </div>

              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                    Build Your
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Dream Store
                  </span>
                </h1>
                
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              </div>

              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                Transform your business with our cutting-edge e-commerce platform. 
                <span className="font-semibold text-gray-800">Fast, secure, and beautiful</span> - 
                everything you need to create exceptional shopping experiences.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  to="/products"
                  className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-blue-500/25"
                >
                  <span className="relative z-10 text-white">Get Started Free</span>
                  <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
                </Link>
                
                <Link
                  to="/collections"
                  className="group inline-flex items-center justify-center px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 font-bold rounded-2xl border-2 border-gray-200 hover:border-blue-300 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <svg className="mr-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Demo
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-8 pt-8">
                {[
                  { icon: "🚀", text: "Lightning Fast" },
                  { icon: "🔒", text: "Bank-level Security" },
                  { icon: "📱", text: "Mobile Optimized" },
                  { icon: "⚡", text: "99.9% Uptime" }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 group">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Visual Element */}
            <div className="relative lg:ml-auto">
              <div className="relative">
                {/* Main Card */}
                <div className="relative bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/50">
                  <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 flex flex-col justify-center items-center space-y-6">
                    {/* Dashboard Preview */}
                    <div className="w-full space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full w-32"></div>
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="h-8 bg-white/80 rounded-xl flex items-center px-4">
                          <div className="w-6 h-6 bg-blue-200 rounded-full mr-3"></div>
                          <div className="h-2 bg-gray-200 rounded w-24"></div>
                        </div>
                        <div className="h-8 bg-white/80 rounded-xl flex items-center px-4">
                          <div className="w-6 h-6 bg-purple-200 rounded-full mr-3"></div>
                          <div className="h-2 bg-gray-200 rounded w-32"></div>
                        </div>
                        <div className="h-8 bg-white/80 rounded-xl flex items-center px-4">
                          <div className="w-6 h-6 bg-pink-200 rounded-full mr-3"></div>
                          <div className="h-2 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mt-6">
                        <div className="h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                          <div className="text-blue-600 font-bold">$24.5k</div>
                        </div>
                        <div className="h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                          <div className="text-purple-600 font-bold">1.2k</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl shadow-lg transform rotate-12 flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-400 rounded-xl shadow-lg transform -rotate-12 flex items-center justify-center">
                  <span className="text-xl">📈</span>
                </div>
                
                <div className="absolute top-1/2 -left-8 w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full shadow-lg animate-bounce flex items-center justify-center">
                  <span className="text-sm">💎</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Collections Section */}
      {collections.length > 0 && (
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
              <div className="max-w-xl">
                <span className="text-blue-600 text-sm font-semibold tracking-wide uppercase">
                  Curated Collections
                </span>
                <h2 className="mt-2 text-3xl lg:text-4xl font-bold text-gray-900">
                  Shop by Collection
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                  Discover our thoughtfully curated collections designed to
                  match your style and preferences.
                </p>
              </div>
              <div className="mt-6 md:mt-0 flex items-center gap-4">
                <button
                  onClick={() => {
                    const el = collectionsScrollRef.current;
                    if (el) el.scrollLeft -= el.clientWidth;
                  }}
                  disabled={!canScrollLeft}
                  className={`p-2 rounded-full border ${
                    canScrollLeft
                      ? 'border-blue-600 text-blue-600 hover:bg-blue-50'
                      : 'border-gray-200 text-gray-300'
                  } transition-colors duration-200`}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    const el = collectionsScrollRef.current;
                    if (el) el.scrollLeft += el.clientWidth;
                  }}
                  disabled={!canScrollRight}
                  className={`p-2 rounded-full border ${
                    canScrollRight
                      ? 'border-blue-600 text-blue-600 hover:bg-blue-50'
                      : 'border-gray-200 text-gray-300'
                  } transition-colors duration-200`}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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
            </div>

            <div
              ref={collectionsScrollRef}
              className="relative -mx-4 px-4 flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
              onMouseDown={onDragStart}
              onMouseMove={onDragMove}
              onMouseUp={onDragEnd}
              onMouseLeave={onDragEnd}
              onTouchStart={onDragStart}
              onTouchMove={onDragMove}
              onTouchEnd={onDragEnd}
            >
              {collections.map((collection: any) => (
                <div
                  key={collection.id}
                  className="flex-shrink-0 w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] snap-start"
                >
                  <Link
                    to={`/collections/${collection.handle}`}
                    className="block group"
                  >
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100">
                      {collection.image && (
                        <Image
                          data={collection.image}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60" />
                      <div className="absolute inset-0 flex flex-col justify-end p-6">
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                          {collection.title}
                        </h3>
                        <p className="text-sm text-white/80 mb-4">
                          {collection.description?.slice(0, 100)}
                        </p>
                        <span className="inline-flex items-center text-sm font-medium text-white">
                          Shop Collection
                          <svg
                            className="w-5 h-5 ml-2 transform transition-transform group-hover:translate-x-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center gap-2">
              {collections.map((collection: any, index: number) => (
                <button
                  key={collection.id}
                  onClick={() => {
                    const el = collectionsScrollRef.current;
                    if (el) {
                      el.scrollLeft =
                        (el.scrollWidth / collections.length) * index;
                    }
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 ${
                    index === 0
                      ? 'bg-blue-600'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to ${collection.title}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Grid Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['New Arrivals', 'Best Sellers', 'Sale', 'Trending'].map(
              (category) => (
                <div
                  key={category}
                  className="relative group overflow-hidden rounded-2xl"
                >
                  <div className="aspect-square bg-gradient-to-br from-white to-gray-100 p-6 transition-all duration-300 group-hover:scale-105">
                    <div className="h-full w-full flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                        {/* Add appropriate icon for each category */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {category}
                      </h3>
                      <span className="text-sm text-blue-600">Shop Now →</span>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      {featuredProductsList.length > 0 && (
        <section className="py-20 px-4 bg-white/50">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
              <div className="max-w-2xl">
                <span className="text-blue-600 text-sm font-semibold tracking-wide uppercase">
                  Curated Selection
                </span>
                <h2 className="mt-2 text-3xl lg:text-4xl font-bold text-gray-900">
                  Featured Products
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                  Discover our handpicked selection of premium products that
                  define quality and style.
                </p>
              </div>
              <Link
                to="/products"
                className="mt-6 md:mt-0 inline-flex items-center justify-center px-6 py-3 border border-transparent font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                View All Products
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
              {featuredProductsList.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {featuredProductsList.length > 8 && (
              <div className="mt-12 text-center">
                <Link
                  to="/products"
                  className="inline-flex items-center px-6 py-3 border border-blue-600 text-base font-medium rounded-md text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                >
                  View More Products
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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
            )}
          </div>
        </section>
      )}

      {/* Special Offer Banner */}
      <section className="py-12 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left mb-8 md:mb-0 mx-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white ">
                Special Offer: Get 20% Off
              </h2>
              <p className="text-blue-100">Use code WELCOME20 at checkout</p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 border-2 border-white text-base mx-8 font-medium rounded-md text-white hover:bg-white hover:text-blue-600 transition-colors duration-200"
            >
              Shop Now
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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

      {/* All Products Section with Enhanced UI */}
      {products.length > 0 && (
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-blue-600 text-sm font-semibold tracking-wide uppercase">
                Complete Collection
              </span>
              <h2 className="mt-2 text-3xl lg:text-4xl font-bold text-gray-900">
                All Products
              </h2>
              <h3 className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Explore our complete collection of carefully selected products
                designed to enhance your lifestyle.
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-x-6 gap-y-8">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {products.length > 12 && (
              <div className="mt-12 text-center">
                <button className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200">
                  Load More Products
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: 'Free Shipping',
                description: 'Free shipping on all orders over $50',
                icon: (
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse" />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent rounded-full blur-sm" />
                    <div className="relative flex items-center justify-center w-full h-full">
                      <svg
                        className="w-10 h-10 text-blue-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M13 21H3C2.4 21 2 20.6 2 20V4C2 3.4 2.4 3 3 3H13"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M17 16L22 11L17 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M8 11H22"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                ),
              },
              {
                title: 'Secure Payment',
                description: '100% secure payment processing',
                icon: (
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse delay-100" />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent rounded-full blur-sm" />
                    <div className="relative flex items-center justify-center w-full h-full">
                      <svg
                        className="w-10 h-10 text-blue-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M9 12L11 14L15 10"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                ),
              },
              {
                title: '24/7 Support',
                description: 'Dedicated support team available',
                icon: (
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ),
              },
            ].map((feature) => (
              <div key={feature.title} className="text-center p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="relative py-16 overflow-hidden mx-auto max-w-7xl px-4">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white">
          <div className="absolute inset-0 bg-white/50 backdrop-blur-3xl" />
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply opacity-50 animate-blob" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply opacity-50 animate-blob animation-delay-2000" />
        </div>

        <div className="relative w-full max-w-md mx-auto text-center">
          <div className="mb-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-lg text-gray-600">
              Stay up to date with our latest products, deals, and updates.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xl">
            <form className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                >
                  Subscribe
                </button>
              </div>
              <p className="text-sm text-gray-500">
                By subscribing, you agree to our Privacy Policy and consent to
                receive updates from our company.
              </p>
            </form>
          </div>

          {/* Trust Indicators */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-sm text-gray-600">
            {[
              'No Spam',
              'Unsubscribe Anytime',
              'Weekly Updates',
              'Exclusive Offers',
            ].map((text) => (
              <div
                key={text}
                className="flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4 text-blue-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* No Data Fallback */}
      {products.length === 0 &&
        featuredProductsList.length === 0 &&
        collections.length === 0 && (
          <section className="py-24 px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-xl border shadow-sm p-8">
                <div className="mb-6">
                  <svg
                    className="w-16 h-16 text-blue-600 mx-auto mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Welcome to Your Store
                  </h2>
                </div>
                <div>
                  <p className="text-lg text-gray-600 mb-8">
                    Your Shopify store is not connected yet. Connect your store
                    to display products and collections.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-8">
                    <p className="text-gray-600">
                      Once connected, this page will showcase your products and
                      collections beautifully.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
    </div>
  );
}
