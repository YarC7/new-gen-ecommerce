import type {LoaderFunctionArgs, MetaFunction} from '@shopify/remix-oxygen';
import {useLoaderData} from 'react-router';
import {PAGE_BY_HANDLE_QUERY} from '~/graphql';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  if (!data?.pageByHandle) {
    return [
      {title: 'Page Not Found'},
      {
        name: 'description',
        content: 'The page you are looking for does not exist.',
      },
    ];
  }

  const {pageByHandle} = data;
  const seoTitle = pageByHandle.seo?.title || pageByHandle.title;
  const seoDescription =
    pageByHandle.seo?.description || pageByHandle.bodySummary || '';

  return [
    {title: seoTitle},
    {name: 'description', content: seoDescription},
    {property: 'og:title', content: seoTitle},
    {property: 'og:description', content: seoDescription},
    {property: 'og:type', content: 'article'},
  ];
};

export async function loader({context, params}: LoaderFunctionArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Response('Page handle is required', {status: 400});
  }

  try {
    const data = await storefront.query(PAGE_BY_HANDLE_QUERY, {
      variables: {
        handle,
        country: storefront.i18n.country,
        language: storefront.i18n.language,
      },
    });

    if (!data?.pageByHandle) {
      throw new Response('Page not found', {status: 404});
    }

    return data;
  } catch (error) {
    console.error('Error loading page:', error);

    // Re-throw redirects and 404s
    if (error instanceof Response) {
      throw error;
    }

    throw new Response('Failed to load page', {status: 500});
  }
}

export default function PageByHandle() {
  const {pageByHandle} = useLoaderData<typeof loader>();

  if (!pageByHandle) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          The page you are looking for does not exist.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <article className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-8 md:p-12">
              {/* Page Title */}
              <header className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight flex justify-center">
                  {pageByHandle.title}
                </h1>
              </header>

              {/* Page Content with isolated prose styling */}
              <div className="page-content">
                <div
                  className="prose prose-lg dark:prose-invert max-w-none
                    prose-headings:text-gray-900 dark:prose-headings:text-gray-100
                    prose-p:text-gray-700 dark:prose-p:text-gray-300
                    prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-gray-900 dark:prose-strong:text-gray-100
                    prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                    prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:text-gray-100
                    prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20 prose-blockquote:not-italic
                    prose-ul:text-gray-700 dark:prose-ul:text-gray-300
                    prose-ol:text-gray-700 dark:prose-ol:text-gray-300
                    prose-li:text-gray-700 dark:prose-li:text-gray-300
                    prose-table:text-gray-700 dark:prose-table:text-gray-300
                    prose-th:text-gray-900 dark:prose-th:text-gray-100
                    prose-td:text-gray-700 dark:prose-td:text-gray-300"
                  dangerouslySetInnerHTML={{__html: pageByHandle.body}}
                />
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
