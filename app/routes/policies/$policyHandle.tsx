// src/routes/policies/$policyHandle.tsx
import type { LoaderFunctionArgs } from '@shopify/remix-oxygen';
interface PolicyQueryResult {
  shop: {
    policy: {
      title: string;
      body: string;
    } | null;
  };
}

export async function loader({ context, params }: LoaderFunctionArgs) {
  const { storefront } = context;
  const { policyHandle } = params; // e.g. "privacy-policy"

  if (!policyHandle) {
    throw new Response('Policy handle not provided', {status: 400});
  }

  // Query the policy by its handle.
  const { data }: { data: PolicyQueryResult } = await storefront.query(
    `#graphql
      query Policy($handle: String!) {
        shop {
          policy(handle: $handle) {
            title
            body
          }
        }
      }
    `,{
      variables: {handle: policyHandle},
    }
  );

  const policy = data?.shop?.policy;

  if (!policy) {
    // Return a 404 if the policy does not exist.
    throw new Response('Policy not found', {status: 404});
  }

  // Simple HTML escaping for the title (body is already HTML from Shopify).
  const escapedTitle = policy.title
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapedTitle}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {font-family: system-ui, sans-serif; margin: 2rem;}
  </style>
</head>
<body>
  <h1>${escapedTitle}</h1>
  ${policy.body}
</body>
</html>`;

  const headers = new Headers({
    'Content-Type': 'text/html; charset=utf-8',
    // Policies rarely change; cache for a day at the edge.
    'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
  });

  return new Response(html, {status: 200, headers});
}
