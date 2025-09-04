import {useLoaderData, Link} from 'react-router';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {ProductPrice} from '~/components/ProductPrice';
import {PRODUCTS_QUERY} from '~/graphql';
import {ProductCard} from '~/components/ui/ProductCard';
import {cn} from '~/lib/utils';
import {Search, Package, Filter, Grid, SlidersHorizontal, ChevronDown} from 'lucide-react';
import {useState} from 'react';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const productsData = products?.products?.nodes || [];
  
  // Filter and sort products
  const filteredProducts = productsData
    .filter((product: any) => 
      product.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case 'price-low':
          return parseFloat(a.priceRange.minVariantPrice.amount) - parseFloat(b.priceRange.minVariantPrice.amount);
        case 'price-high':
          return parseFloat(b.priceRange.minVariantPrice.amount) - parseFloat(a.priceRange.minVariantPrice.amount);
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default: // newest
          return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
      }
    });

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb Navigation */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Products</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              All Products
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Discover our complete collection of premium products
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-input rounded-xl bg-background focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-border/20">
              <div className="text-2xl font-bold text-primary mb-2">
                {filteredProducts.length}
              </div>
              <div className="text-muted-foreground font-medium">Products</div>
            </div>
            <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-border/20">
              <div className="text-2xl font-bold text-primary mb-2">Premium</div>
              <div className="text-muted-foreground font-medium">Quality</div>
            </div>
            <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-border/20">
              <div className="text-2xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground font-medium">Support</div>
            </div>
          </div>
        </div>
      </section>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filters Sidebar */}
            <aside className={cn(
              "lg:w-80 bg-card rounded-xl shadow-sm border h-fit transition-all duration-300",
              "lg:sticky lg:top-8",
              showFilters ? "block" : "hidden lg:block"
            )}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5" />
                    Filters
                  </h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </div>

                {/* Categories Filter */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Categories</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value="all"
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">All Products</span>
                    </label>
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Price Range</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        className="flex-1 px-3 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-ring text-sm"
                      />
                      <span className="text-muted-foreground">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        className="flex-1 px-3 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-ring text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Status Filter */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Availability</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary focus:ring-primary rounded"
                      />
                      <span className="text-sm text-foreground">In Stock Only</span>
                    </label>
                  </div>
                </div>

                {/* Apply Filters Button */}
                <button className="w-full px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors">
                  Apply Filters
                </button>
              </div>
            </aside>

            {/* Products Section */}
            <main className="flex-1">
              {/* Results Header */}
              <div className="bg-card rounded-xl shadow-sm border p-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="lg:hidden flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg transition-colors"
                    >
                      <Filter className="w-4 h-4" />
                      Filters
                    </button>
                    <div className="flex items-center gap-2">
                      <Grid className="w-5 h-5 text-muted-foreground" />
                      <h2 className="text-lg font-semibold text-foreground">
                        Products ({filteredProducts.length})
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-foreground">Sort by:</label>
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-ring text-sm"
                    >
                      <option value="newest">Newest First</option>
                      <option value="alphabetical">A-Z</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              {filteredProducts.length === 0 ? (
                <div className="bg-card rounded-xl shadow-sm border p-12 text-center">
                  <div className="max-w-md mx-auto">
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {searchTerm ? 'No products match your search' : 'No products found'}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {searchTerm 
                        ? `Try adjusting your search term "${searchTerm}" or browse all products.`
                        : 'No products are currently available in this category.'
                      }
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors duration-200"
                        >
                          Clear Search
                        </button>
                      )}
                      <Link
                        to="/"
                        className="px-6 py-3 bg-secondary text-secondary-foreground rounded-xl font-semibold hover:bg-secondary/80 transition-colors duration-200"
                      >
                        Back to Home
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
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
