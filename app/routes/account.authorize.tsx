import {redirect} from 'react-router';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';

export async function loader({request, context}: LoaderFunctionArgs) {
  const {customerAccount} = context;

  try {
    // Handle the OAuth callback
    const url = new URL(request.url);

    // Customer Account API will handle the authorization code exchange
    await customerAccount.authorize();

    // Check if there's a returnTo parameter in the state
    const returnTo = url.searchParams.get('state');

    if (returnTo) {
      try {
        const decodedReturnTo = decodeURIComponent(returnTo);
        return redirect(decodedReturnTo);
      } catch {
        // If decoding fails, redirect to account
        return redirect('/account');
      }
    }

    // Default redirect to account page
    return redirect('/account');
  } catch (error) {
    console.error('Authorization error:', error);

    // If authorization fails, redirect back to login
    return redirect('/login?error=authorization_failed');
  }
}

export default function Authorize() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100 max-w-md mx-4">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
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
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-600 mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Completing sign in...
        </h2>
        <p className="text-gray-600">
          Please wait while we complete your authentication and redirect you to
          your account.
        </p>
      </div>
    </div>
  );
}