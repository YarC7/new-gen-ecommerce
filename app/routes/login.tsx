import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';

export async function loader({context, request}: LoaderFunctionArgs) {
  const {customerAccount} = context;
  const isLoggedIn = await customerAccount.isLoggedIn();

  if (isLoggedIn) {
    // Check if there's a returnTo parameter
    const url = new URL(request.url);
    const returnTo = url.searchParams.get('returnTo');

    if (returnTo) {
      return redirect(returnTo);
    }

    return redirect('/account');
  }

  // Use Customer Account API login method
  try {
    const loginUrl = await customerAccount.login();
    return loginUrl;
  } catch (error) {
    console.error('Customer Account API login error:', error);

    // Fallback: redirect to account page with error
    return redirect('/account?error=login_failed');
  }
}

export async function action({context}: ActionFunctionArgs) {
  const {customerAccount} = context;

  try {
    const loginUrl = await customerAccount.login();
    return loginUrl;
  } catch (error) {
    console.error('Customer Account API login error:', error);
    return redirect('/account?error=login_failed');
  }
}

export default function Login() {
  // This component should never render since we always redirect in the loader
  // But just in case, show a loading state
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100 max-w-md mx-4">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Redirecting to Shopify...
        </h2>
        <p className="text-gray-600">
          Please wait while we redirect you to the secure Shopify login page.
        </p>
      </div>
    </div>
  );
}
