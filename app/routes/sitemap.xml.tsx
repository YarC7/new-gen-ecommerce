import { json, type LoaderFunctionArgs } from '@shopify/remix-oxygen';
import { gql } from '@shopify/hydrogen';

export async function loader({ context }: LoaderFunctionArgs) {
  const { storefront } = context;

  // Fetch the list of published products, collections, and pages.
  const { data } = await storefront.query(
    gql`
      query Sitemap {
        products(first: 250) {
          edges {
            node { handle }
          }
        }
        collections(first: 250) {
          edges {
            node { handle }
          }
        }
        pages(first: 250) {
          edges {
            node { handle }
          }
        }
      }
    `
  );

  const urls: string[] = [];

  // Home page
  urls.push('<url><loc>https://mxcbvg-0i.myshopify.com/sitemap.xml/</loc></url>');

  // Products
  data.products?.edges?.forEach(({ node }) => {
    urls.push(
      `<url><loc>https://mxcbvg-0i.myshopify.com/sitemap.xml/products/${node.handle}</loc></url>`
    );
  });

  // Collections
  data.collections?.edges?.forEach(({ node }) => {
    urls.push(
      `<url><loc>https://mxcbvg-0i.myshopify.com/sitemap.xml/collections/${node.handle}</loc></url>`
    );
  });

  // Pages
  data.pages?.edges?.forEach(({ node }) => {
    urls.push(
      `<url><loc>https://mxcbvg-0i.myshopify.com/sitemap.xml/pages/${node.handle}</loc></url>`
    );
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
              `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
              `${urls.join('\n')}\n` +
              `</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
