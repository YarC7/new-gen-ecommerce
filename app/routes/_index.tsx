import {useLoaderData, Link} from 'react-router';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {ALL_COLLECTIONS_QUERY, FEATURED_PRODUCTS_QUERY} from '~/graphql';
import {Image} from '@shopify/hydrogen';
import {useRef, useState, useEffect} from 'react';

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
	const heroProduct = featuredProducts?.products?.nodes?.[0];
	const heroVariantImage = heroProduct?.images?.nodes?.[0];
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

	return (
		<div className="home">
			{/* Hero Section - Responsive two-column with optimized image */}
			<section aria-label="Hero" className="relative min-h-[70vh]">
				<div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
					<div className="absolute inset-0 bg-black/20" />
				</div>

				<div className="container mx-auto px-4 py-20 md:py-28">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						<div>
							{/* Badge */}
							<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 ring-1 ring-white/15 text-cyan-200 mb-5 backdrop-blur-sm">
								<span className="h-2 w-2 rounded-full bg-cyan-300" />
								<span className="text-xs tracking-wide uppercase">New arrivals just dropped</span>
							</div>

							<h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-white leading-tight">
								Discover Your
								<span className="block bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-purple-300">Perfect Style</span>
							</h1>
							<p className="text-base md:text-lg text-white/80 mb-6 max-w-xl">
								Experience premium quality products with modern design and exceptional craftsmanship.
							</p>
							<ul className="mb-10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-white/80 text-sm">
								<li className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300" /> Free shipping over $50</li>
								<li className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-purple-300" /> 30‑day easy returns</li>
								<li className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-pink-300" /> Secure checkout</li>
								<li className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-indigo-300" /> Quality guarantee</li>
							</ul>
							<div className="relative">
								{/* subtle glow under buttons */}
								<div className="absolute -inset-4 rounded-full bg-cyan-500/20 blur-2xl opacity-60 pointer-events-none" />
								<div className="relative flex flex-col sm:flex-row gap-4">
									<Link
										to="/collections"
										aria-label="Shop collections"
										className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-full hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400/40"
									>
										<span className="relative z-10">Shop Collection</span>
										<div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full blur opacity-60 group-hover:opacity-90 transition-opacity" />
									</Link>
									<Link
										to="/search"
										aria-label="Explore products"
										className="px-8 py-4 rounded-full text-white/90 ring-1 ring-white/30 hover:bg-white/10 backdrop-blur-sm transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
									>
										Explore Products
									</Link>
								</div>
							</div>
						</div>

						<div className="relative">
							<div className="absolute -inset-6 bg-white/10 rounded-3xl blur-xl" />
							<div className="relative rounded-3xl overflow-hidden ring-1 ring-white/10 shadow-2xl">
								{heroVariantImage ? (
									<Image
										data={{
											altText: heroVariantImage.altText ?? heroProduct.title,
											url: heroVariantImage.url,
											width: heroVariantImage.width ?? 1600,
											height: heroVariantImage.height ?? 900,
										}}
										loading="eager"
										fetchPriority="high"
										sizes="(max-width: 1024px) 100vw, 50vw"
										className="w-full h-[320px] md:h-[480px] object-cover"
									/>
								) : (
									<div className="relative w-full h-[320px] md:h-[480px] overflow-hidden rounded-3xl">
										<div className="absolute inset-0 bg-gradient-to-br from-purple-300/30 via-pink-300/20 to-cyan-300/20" />
										<div className="absolute inset-0 opacity-30" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)', backgroundSize: '24px 24px'}} />
										<div className="absolute inset-0 flex items-center justify-center">
											<svg
												className="w-20 h-20 text-white/70"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={1.5}
													d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
												/>
											</svg>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
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
							</h2>
							<p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
								Discover our complete range of curated collections
							</p>
							<div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-purple-600 mx-auto rounded-full"></div>
						</div>

						{/* All Collections - Single horizontal scroller with arrows */}
						<div className="relative">
							<button
								aria-label="Scroll collections left"
								onClick={() => {
									const el = collectionsScrollRef.current;
									if (!el) return;
									const amount = Math.max(240, Math.floor(el.clientWidth * 0.9));
									el.scrollBy({left: -amount, behavior: 'smooth'});
								}}
								className={`flex absolute left-2 top-1/2 -translate-y-1/2 z-10 h-11 w-11 items-center justify-center rounded-full shadow focus:outline-none focus-visible:ring-4 ${canScrollLeft ? 'bg-white/95 text-gray-800 hover:bg-white' : 'bg-white/40 text-gray-500 cursor-not-allowed'}`}
								disabled={!canScrollLeft}
							>
								<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
							</button>
							<button
								aria-label="Scroll collections right"
								onClick={() => {
									const el = collectionsScrollRef.current;
									if (!el) return;
									const amount = Math.max(240, Math.floor(el.clientWidth * 0.9));
									el.scrollBy({left: amount, behavior: 'smooth'});
								}}
								className={`flex absolute right-2 top-1/2 -translate-y-1/2 z-10 h-11 w-11 items-center justify-center rounded-full shadow focus:outline-none focus-visible:ring-4 ${canScrollRight ? 'bg-white/95 text-gray-800 hover:bg-white' : 'bg-white/40 text-gray-500 cursor-not-allowed'}`}
								disabled={!canScrollRight}
							>
								<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
							</button>

							<div className="rounded-2xl bg-gray-900 text-white ring-1 ring-white/10 p-4 [scrollbar-color:theme(colors.purple.500)_transparent] [scrollbar-width:thin]">
								<div
									ref={collectionsScrollRef}
									className="flex items-stretch gap-6 overflow-x-auto pb-3 cursor-grab active:cursor-grabbing"
									onMouseDown={onDragStart}
									onMouseMove={onDragMove}
									onMouseUp={onDragEnd}
									onMouseLeave={onDragEnd}
									onTouchStart={onDragStart}
									onTouchMove={onDragMove}
									onTouchEnd={onDragEnd}
								>
									{(allCollections.collections.nodes ?? []).map((collection: any) => (
										<Link
											key={collection.id}
											to={`/collections/${collection.handle}`}
											className="min-w-[220px] md:min-w-[260px] lg:min-w-[300px] snap-start group rounded-2xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400/30"
										>
											<div className="relative h-36 md:h-40 lg:h-48 overflow-hidden">
												{collection.image ? (
													<img
														src={collection.image.url}
														alt={collection.image.altText || collection.title}
														className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
														loading="lazy"
														decoding="async"
													/>
												) : (
													<div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500" />
												)}
											</div>
											<div className="p-4">
												<div className="font-semibold text-white line-clamp-1">{collection.title}</div>
												{collection.description && (
													<div className="text-sm text-white/80 line-clamp-2">{collection.description}</div>
												)}
											</div>
										</Link>
									))}
								</div>
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
										className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-purple-200 focus-within:ring-2 focus-within:ring-purple-300"
										style={{animationDelay: `${index * 100}ms`}}
									>
										<div className="relative overflow-hidden">
											{product.images.nodes[0] && (
												<img
													src={product.images.nodes[0].url}
													alt={product.images.nodes[0].altText || product.title}
													className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
													loading="lazy"
													decoding="async"
												/>
											)}
											<div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

											{/* Quick View Button */}
											<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
												<Link
													to={`/products/${product.handle}`}
													className="bg-white/90 backdrop-blur-sm text-gray-900 px-6 py-2 rounded-full font-semibold hover:bg-white transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-300"
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
												<span className="text-2xl font-bold text-purple-600">${product.priceRange.minVariantPrice.amount}</span>
												<span className="text-sm text-gray-500">{product.priceRange.minVariantPrice.currencyCode}</span>
											</div>
											<Link
												to={`/products/${product.handle}`}
												className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-3 px-4 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg text-center block focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-300"
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
