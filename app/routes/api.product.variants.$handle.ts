import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';

export async function loader({params, context}: LoaderFunctionArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Response('Product handle is required', {status: 400});
  }

  try {
    const {product} = await storefront.query(PRODUCT_VARIANTS_QUERY, {
      variables: {handle},
      cache: context.storefront.CacheNone(),
    });

    if (!product?.id) {
      throw new Response('Product not found', {status: 404});
    }

    return new Response(
      JSON.stringify({
        id: product.id,
        handle: product.handle,
        options: product.options,
        variants: product.variants.nodes.map((v: any) => ({
          id: v.id,
          title: v.title,
          availableForSale: v.availableForSale,
          selectedOptions: v.selectedOptions,
        })),
      }),
      {
        status: 200,
        headers: {'Content-Type': 'application/json'},
      },
    );
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Failed to load product variants:', error);
    throw new Response('Failed to load product variants', {status: 500});
  }
}

const PRODUCT_VARIANTS_QUERY = `#graphql
  query ProductVariants($handle: String!) {
    product(handle: $handle) {
      id
      handle
      options { name values }
      variants(first: 250) {
        nodes {
          id
          title
          availableForSale
          selectedOptions { name value }
        }
      }
    }
  }
`;
