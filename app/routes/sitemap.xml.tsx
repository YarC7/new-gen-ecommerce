import type { LoaderFunctionArgs } from '@shopify/remix-oxygen';

// Base URL for your storefront
const BASE_URL = 'https://your-store.com'; // Replace with your actual domain

// Utility to format ISO date to YYYY-MM-DD
const formatDate = (isoString: string) => isoString.split('T')[0];

export async function loader({ context }: LoaderFunctionArgs) {
  const { storefront } = context;

  try {
    // Fetch products
    const { products } = await storefront.query(
      `#graphql
        query GetProducts($first: Int!) {
          products(first: $first) {
            nodes {
              handle
              updatedAt
            }
          }
        }
      `,
      {
        variables: { first: 250 },
      }
    );

    // Fetch collections
    const { collections } = await storefront.query(
      `#graphql
        query GetCollections($first: Int!) {
          collections(first: $first) {
            nodes {
              handle
              updatedAt
            }
          }
        }
      `,
      {
        variables: { first: 50 },
      }
    );

    // Define static routes
    const staticRoutes = [
      { path: '', changefreq: 'daily', priority: '1.0' },
      { path: '/cart', changefreq: 'weekly', priority: '0.5' },
      { path: '/account', changefreq: 'monthly', priority: '0.4' },
      { path: '/policies/shipping-policy', changefreq: 'yearly', priority: '0.3' },
      { path: '/policies/refund-policy', changefreq: 'yearly', priority: '0.3' },
      { path: '/policies/privacy-policy', changefreq: 'yearly', priority: '0.8' },
      { path: '/policies/terms-of-service', changefreq: 'yearly', priority: '0.8' },
    ];

    // Generate XML entries
    const urlEntries = [
      // Static pages
      ...staticRoutes.map(
        (route) => `
<url>
  <loc>${BASE_URL}${route.path}</loc>
  <lastmod>${formatDate(new Date().toISOString())}</lastmod>
  <changefreq>${route.changefreq}</changefreq>
  <priority>${route.priority}</priority>
</url>`
      ),
      // Product pages
      ...products.nodes.map(
        (product: { handle: string; updatedAt: string }) => `
<url>
  <loc>${BASE_URL}/products/${product.handle}</loc>
  <lastmod>${formatDate(product.updatedAt)}</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.7</priority>
</url>`
      ),
      // Collection pages
      ...collections.nodes.map(
        (collection: { handle: string; updatedAt: string }) => `
<url>
  <loc>${BASE_URL}/collections/${collection.handle}</loc>
  <lastmod>${formatDate(collection.updatedAt)}</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.6</priority>
</url>`
      ),
    ].join('');

    // Construct final sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urlEntries}
</urlset>`;

    return new Response(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>',
      {
        status: 500,
        headers: { 'Content-Type': 'application/xml' },
      }
    );
  }
}
