import {useLoaderData, Link} from 'react-router';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {COLLECTIONS_QUERY} from '~/graphql';

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

  return (
    <div className="collections-page">
      {/* Hero Section */}
      <section className="collections-hero">
        <div className="collections-hero-container">
          <div className="collections-hero-content">
            <h1 className="collections-hero-title">Explore Our Collections</h1>
            <p className="collections-hero-subtitle">
              Discover our curated selection of premium products organized into
              beautiful collections
            </p>
            <div className="collections-hero-stats">
              <div className="stat-item">
                <span className="stat-number">
                  {collections?.collections?.nodes?.length || 0}
                </span>
                <span className="stat-label">Collections</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">Premium</span>
                <span className="stat-label">Quality</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Support</span>
              </div>
            </div>
          </div>
          <div className="collections-hero-visual">
            <div className="floating-shapes">
              <div className="shape shape-1"></div>
              <div className="shape shape-2"></div>
              <div className="shape shape-3"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="collections-grid-section">
        <div className="collections-grid-container">
          {/* Filter Bar */}
          <div className="collections-filter-bar">
            <div className="filter-search">
              <input
                type="text"
                placeholder="Search collections..."
                className="filter-search-input"
              />
              <svg
                className="filter-search-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div className="filter-sort">
              <select className="filter-sort-select">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>
          </div>

          {/* Collections Grid */}
          {collections?.collections?.nodes?.length > 0 ? (
            <div className="collections-grid">
              {collections.collections.nodes.map(
                (collection: any, index: number) => (
                  <div
                    key={collection.id}
                    className="collection-card"
                    style={{animationDelay: `${index * 100}ms`}}
                  >
                    <div className="collection-card-image">
                      {collection.image ? (
                        <img
                          src={collection.image.url}
                          alt={collection.image.altText || collection.title}
                          className="collection-image"
                        />
                      ) : (
                        <div className="collection-image-placeholder">
                          <svg
                            className="w-16 h-16"
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
                      <div className="collection-card-overlay">
                        <Link
                          to={`/collections/${collection.handle}`}
                          className="collection-explore-btn"
                        >
                          Explore Collection
                        </Link>
                      </div>
                    </div>

                    <div className="collection-card-content">
                      <h3 className="collection-card-title">
                        {collection.title}
                      </h3>
                      {collection.description && (
                        <p className="collection-card-description">
                          {collection.description}
                        </p>
                      )}
                      <Link
                        to={`/collections/${collection.handle}`}
                        className="collection-card-link"
                      >
                        <span>View Collection</span>
                        <svg
                          className="w-4 h-4"
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
          ) : (
            <div className="collections-empty">
              <div className="collections-empty-content">
                <svg
                  className="collections-empty-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7"
                  />
                </svg>
                <h3 className="collections-empty-title">
                  No Collections Found
                </h3>
                <p className="collections-empty-text">
                  We&apos;re working on adding amazing collections for you.
                </p>
                <Link to="/" className="collections-empty-btn">
                  Back to Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="collections-cta">
        <div className="collections-cta-container">
          <h2 className="collections-cta-title">
            Can&apos;t Find What You&apos;re Looking For?
          </h2>
          <p className="collections-cta-text">
            Explore our full product catalog or contact our support team for
            assistance.
          </p>
          <div className="collections-cta-buttons">
            <Link to="/search" className="collections-cta-btn primary">
              Search Products
            </Link>
            <Link to="/pages/contact" className="collections-cta-btn secondary">
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
