import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {gql} from '@shopify/hydrogen';

export async function loader({context, params}: LoaderFunctionArgs) {
  const {storefront} = context;
  const {policyHandle} = params; // e.g., "privacy-policy"

  // Query the policy based on its handle.
  const {data} = await storefront.query(
    gql`
      query Policy($handle: String!) {
        shop {
          policy(handle: $handle) {
            title
            body
          }
        }
      }
    `,
    {
      variables: {handle: policyHandle},
    },
  );

  const policy = data?.shop?.policy;

  if (!policy) {
    // Return a 404 if the policy does not exist.
    throw new Response('Policy not found', {status: 404});
  }

  // Render a simple HTML page.
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${policy.title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {font-family: system-ui, sans-serif; margin: 2rem;}
  </style>
</head>
<body>
  <h1>${policy.title}</h1>
  ${policy.body}
</body>
</html>
`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
