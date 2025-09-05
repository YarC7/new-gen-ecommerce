import {redirect} from 'react-router';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';

export async function loader({context}: LoaderFunctionArgs) {
  const {customerAccount} = context;

  try {
    await customerAccount.logout();
  } catch (error) {
    console.error('Logout error:', error);
  }

  return redirect('/');
}

export default function Logout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100 max-w-md mx-4">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
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
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Signing you out...
        </h2>
        <p className="text-gray-600">
          Please wait while we securely log you out of your account.
        </p>
      </div>
    </div>
  );
}
