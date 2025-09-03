import {useLoaderData, Link} from 'react-router';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {ALL_COLLECTIONS_QUERY, FEATURED_PRODUCTS_QUERY, ALL_PRODUCTS_QUERY} from '~/graphql';
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

	const products = allProducts?.products?.nodes ?? [];
	const featuredProductsList = featuredProducts?.products?.nodes ?? [];

	return (
		<div className="home">
			{/* Hero Section */}
			{heroProduct && (
				<section className="hero bg-gradient-to-br from-blue-50 to-indigo-100 py-16 px-4">
					<div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						<div className="space-y-6">
							<h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
								Discover Amazing Products
							</h1>
							<p className="text-xl text-gray-600 leading-relaxed">
								Explore our curated collection of premium products designed to enhance your lifestyle.
							</p>
							<br/>

							<Link
								to={`/products/${heroProduct.handle}`}
								className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors duration-200"
							>
								Shop Featured Product
							</Link>
							<Link
								to={`/products`}
								className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors duration-200"
							>
								Shop All Products
							</Link>
						</div>
						{heroVariantImage && (
							<div className="relative">
								<Image
									data={heroVariantImage}
									className="w-full h-96 lg:h-[500px] object-cover rounded-2xl shadow-2xl"
									loading="eager"
								/>
							</div>
						)}
					</div>
				</section>
			)}

			{/* Collections Section */}
			{collections.length > 0 && (
				<section className="py-16 px-4 bg-white">
					<div className="max-w-7xl mx-auto">
						<div className="text-center mb-12">
							<h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
								Shop by Collection
							</h2>
							<p className="text-lg text-gray-600 max-w-2xl mx-auto">
								Browse our carefully curated collections to find exactly what you're looking for.
							</p>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							{topCollections.map((collection: any) => (
								<Link
									key={collection.id}
									to={`/collections/${collection.handle}`}
									className="group relative overflow-hidden rounded-xl bg-gray-100 aspect-square hover:shadow-lg transition-all duration-300"
								>
									{collection.image && (
										<Image
											data={collection.image}
											className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
										/>
									)}
									<div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-all duration-300" />
									<div className="absolute inset-0 flex items-center justify-center">
										<h3 className="text-white text-xl font-semibold text-center px-4">
											{collection.title}
										</h3>
									</div>
								</Link>
							))}
						</div>
					</div>
				</section>
			)}

			{/* Featured Products Section */}
			{featuredProductsList.length > 0 && (
				<section className="py-16 px-4 bg-gray-50">
					<div className="max-w-7xl mx-auto">
						<div className="text-center mb-12">
							<h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
								Featured Products
							</h2>
							<p className="text-lg text-gray-600 max-w-2xl mx-auto">
								Check out our latest and most popular products.
							</p>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
							{featuredProductsList.slice(0, 8).map((product: any) => (
								<ProductCard key={product.id} product={product} />
							))}
						</div>
					</div>
				</section>
			)}

			{/* All Products Section */}
			{products.length > 0 && (
				<section className="py-16 px-4 bg-white">
					<div className="max-w-7xl mx-auto">
						<div className="text-center mb-12">
							<h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
								All Products
							</h2>
							<p className="text-lg text-gray-600 max-w-2xl mx-auto">
								Discover our complete collection of products.
							</p>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
							{products.map((product: any) => (
								<ProductCard key={product.id} product={product} />
							))}
						</div>
					</div>
				</section>
			)}

			{/* No Data Fallback */}
			{products.length === 0 && featuredProductsList.length === 0 && collections.length === 0 && (
				<section className="py-24 px-4 text-center">
					<div className="max-w-2xl mx-auto">
						<h2 className="text-3xl font-bold text-gray-900 mb-4">
							Welcome to Your Store
						</h2>
						<p className="text-lg text-gray-600 mb-8">
							Your Shopify store is not connected yet. Connect your store to display products and collections.
						</p>
						<div className="bg-gray-100 rounded-lg p-8">
							<p className="text-gray-500">
								Once connected, this page will showcase your products and collections beautifully.
							</p>
						</div>
					</div>
				</section>
			)}
		</div>
	);
}
