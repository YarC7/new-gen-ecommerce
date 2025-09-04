import {useLoaderData, Link} from 'react-router';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {ProductPrice} from '~/components/ProductPrice';
import {COLLECTION_BY_HANDLE_QUERY} from '~/graphql';
import {ProductCard} from '~/components/ui/ProductCard';
import {cn} from '~/lib/utils';
import {Package, ArrowLeft, ArrowRight, Grid} from 'lucide-react';

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
    <div className="min-h-screen bg-background">
      {/* Breadcrumb Navigation */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/collections" className="hover:text-primary transition-colors">Collections</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{collection?.title || 'Collection'}</span>
          </nav>
        </div>
      </div>

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Collection Header */}
          <div className="bg-card rounded-xl border shadow-sm p-6 mb-8">
            {collection?.image && (
              <div className="mb-6">
                <img
                  src={collection.image.url}
                  alt={collection.image.altText || collection.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-4">{collection?.title || 'Collection'}</h1>
                {collection?.description && (
                  <p className="text-muted-foreground text-lg max-w-3xl">
                    {collection.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Grid className="h-5 w-5" />
                <span className="text-sm font-medium">{products.length} Products</span>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {!hasProducts ? (
            <div className="bg-card rounded-xl border shadow-sm p-12 text-center">
              <div className="max-w-md mx-auto">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">No Products Found</h2>
                <p className="text-muted-foreground mb-6">
                  This collection doesn't have any products yet.
                </p>
                <Link
                  to="/collections"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  View All Collections
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {collection?.products?.pageInfo && (
                <div className="mt-8 bg-card rounded-xl border shadow-sm p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {collection.products.pageInfo.hasPreviousPage && (
                      <Link
                        to={`/collections/${collection.handle}?cursor=${collection.products.pageInfo.startCursor}`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold rounded-lg transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Previous
                      </Link>
                    )}
                    
                    <div className="text-center text-muted-foreground">
                      Showing {products.length} products
                    </div>
                    
                    {collection.products.pageInfo.hasNextPage && (
                      <Link
                        to={`/collections/${collection.handle}?cursor=${collection.products.pageInfo.endCursor}`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors"
                      >
                        Next
                        <ArrowRight className="w-4 h-4" />
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
