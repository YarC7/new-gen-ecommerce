import {useLoaderData, Link} from 'react-router';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {COLLECTIONS_QUERY} from '~/graphql';
import {Image} from '@shopify/hydrogen';
import {useState} from 'react';
import {cn} from '~/lib/utils';
import {Search, Grid, Package, ArrowRight, Filter} from 'lucide-react';

export async function loader({context}: LoaderFunctionArgs) {
  const {storefront} = context;
  let collections;
  try {
    collections = await storefront.query(COLLECTIONS_QUERY);
  } catch (error) {
    console.error('Error fetching collections:', error);
    collections = {
      collections: {
        nodes: [],
      },
      shop: {
        name: 'My Store',
        description: 'Premium quality products',
      },
    };
  }
  return {collections};
}

export default function CollectionsIndex() {
  const {collections} = useLoaderData<typeof loader>();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const collectionsData = collections?.collections?.nodes || [];
  
  // Filter and sort collections
  const filteredCollections = collectionsData
    .filter((collection: any) => 
      collection.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'oldest':
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        default: // newest
          return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
      }
    });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-16 lg:py-24">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Explore Our 
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Collections
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed max-w-2xl mx-auto">
              Discover our curated selection of premium products organized into beautiful collections, 
              each crafted with care and attention to detail.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-border/20">
                <div className="text-3xl font-bold text-primary mb-2">
                  {collectionsData.length}
                </div>
                <div className="text-muted-foreground font-medium">Collections</div>
              </div>
              <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-border/20">
                <div className="text-3xl font-bold text-primary mb-2">Premium</div>
                <div className="text-muted-foreground font-medium">Quality</div>
              </div>
              <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-border/20">
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <div className="text-muted-foreground font-medium">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Bar */}
          <div className="bg-card rounded-2xl shadow-sm border p-6 mb-12">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search collections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-input rounded-xl bg-background focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-foreground">Sort by:</label>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-input rounded-xl bg-background focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Collections Grid */}
          {filteredCollections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredCollections.map((collection: any, index: number) => (
                <div
                  key={collection.id}
                  className="group bg-card rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border hover:border-border"
                  style={{animationDelay: `${index * 100}ms`}}
                >
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    {collection.image ? (
                      <Image
                        data={collection.image}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center">
                        <Package className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <Link
                        to={`/collections/${collection.handle}`}
                        className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl"
                      >
                        Explore Collection
                      </Link>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                      {collection.title}
                    </h3>
                    {collection.description && (
                      <p className="text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                        {collection.description}
                      </p>
                    )}
                    <Link
                      to={`/collections/${collection.handle}`}
                      className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors duration-200 group/link"
                    >
                      <span>View Collection</span>
                      <ArrowRight className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform duration-200" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {searchTerm ? 'No Collections Match Your Search' : 'No Collections Found'}
                </h3>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  {searchTerm 
                    ? `Try adjusting your search term "${searchTerm}" or browse all collections.`
                    : "We're working on adding amazing collections for you."
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
          )}
        </div>
      </section>

      {/* Call to Action */}
      {/* <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed max-w-2xl mx-auto">
            Explore our full product catalog or contact our support team for personalized assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/search" 
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Search Products
            </Link>
            <Link 
              to="/contact" 
              className="px-8 py-4 bg-blue-500/20 text-white border-2 border-white/30 rounded-xl font-semibold hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section> */}
    </div>
  );
}
