import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {cn} from '~/lib/utils';

interface HeroSlideProps {
  product?: any;
  title?: string;
  subtitle?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  backgroundImage?: string;
  className?: string;
}

export function HeroSlide({
  product,
  title,
  subtitle,
  description,
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
  backgroundImage,
  className,
}: HeroSlideProps) {
  // Use product data if provided, otherwise use custom props
  const slideTitle = title || (product ? 'Discover Amazing' : 'Welcome');
  const slideSubtitle = subtitle || (product ? 'Products' : 'To Our Store');
  const slideDescription = description || (product 
    ? 'Explore our curated collection of premium products designed to enhance your lifestyle.'
    : 'Find the perfect products for your needs.');
  const primaryText = primaryButtonText || (product ? 'Shop Featured Product' : 'Shop Now');
  const primaryLink = primaryButtonLink || (product ? `/products/${product.handle}` : '/products');
  const secondaryText = secondaryButtonText || 'Browse All Products';
  const secondaryLink = secondaryButtonLink || '/products';

  return (
    <section className={cn('relative overflow-hidden min-h-screen', className)}>
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-white">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply opacity-25 animate-blob" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply opacity-25 animate-blob animation-delay-2000" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent" />
        
        {/* Background Image Overlay */}
        {backgroundImage && (
          <div className="absolute inset-0 opacity-10">
            <img 
              src={backgroundImage} 
              alt="" 
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-blue-600 mr-2" />
                  {product ? 'Featured Product' : 'New Collection'}
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
                  <span className="block text-gray-900 leading-tight mb-2">
                    {slideTitle}
                  </span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                    {slideSubtitle}
                  </span>
                </h1>

                <p className="text-lg sm:text-xl text-gray-600 max-w-xl">
                  {slideDescription}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to={primaryLink}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                  {primaryText}
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
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
                <Link
                  to={secondaryLink}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:border-blue-600 hover:text-blue-600 transition-colors duration-200"
                >
                  {secondaryText}
                </Link>
              </div>

              {/* Feature Icons */}
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Secure Payment</p>
                    <p className="text-sm text-gray-500">100% Protected</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Free Shipping</p>
                    <p className="text-sm text-gray-500">Orders over $50</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Image Gallery */}
            <div className="relative lg:ml-auto">
              <div className="relative w-full max-w-xl mx-auto">
                {/* Main Featured Image */}
                <div className="relative aspect-[4/3] mb-4">
                  <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-white shadow-lg">
                    {product?.featuredImage?.url ? (
                      <Image
                        src={product.featuredImage.url}
                        alt={product.title}
                        className="w-full h-full object-cover object-center"
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        loading="eager"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <svg
                          className="w-12 h-12 text-gray-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}

                    {/* Product Info Overlay */}
                    {product && (
                      <div className="absolute left-0 bottom-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                        <div className="text-white">
                          <h3 className="text-xl font-semibold mb-2">
                            {product.title}
                          </h3>
                          <p className="text-sm text-white/80">
                            Featured Product
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Thumbnail Gallery */}
                {product && (
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      product.featuredImage,
                      ...(product.images?.nodes || []),
                    ]
                      .slice(0, 4)
                      .map((image: any, index: number) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                        >
                          {image?.url ? (
                            <Image
                              src={image.url}
                              alt={`Product view ${index + 1}`}
                              className="w-full h-full object-cover"
                              sizes="(min-width: 1024px) 12vw, 25vw"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg
                                className="w-6 h-6 text-gray-300"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}

                {/* Product Info Cards */}
                {product && (
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-yellow-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-sm">Top Rated</p>
                          <p className="text-xs text-gray-500">4.9/5 Stars</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-sm">Verified</p>
                          <p className="text-xs text-gray-500">Quality</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-sm">1000+</p>
                          <p className="text-xs text-gray-500">Customers</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
