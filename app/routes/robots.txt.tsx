export async function loader() {
  const text = `
    User-agent: *
    Allow: /
    Sitemap: https://mxcbvg-0i.myshopify.com/sitemap.xml
    `;

  return new Response(text.trim(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
