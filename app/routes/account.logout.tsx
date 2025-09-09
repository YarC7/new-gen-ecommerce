import {redirect} from 'react-router';
import type {
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from '@shopify/remix-oxygen';

export async function loader({context}: LoaderFunctionArgs) {
  const {customerAccount, session} = context;

  console.log('Logout route called');
  console.log('Customer account available:', !!customerAccount);
  console.log('Session available:', !!session);

  try {
    const isLoggedIn = await customerAccount.isLoggedIn();
    console.log('User was logged in:', isLoggedIn);

    if (isLoggedIn) {
      const result = await customerAccount.logout();
      console.log('Logout result:', result);
    } else {
      console.log('User was not logged in, skipping logout');
    }

    // Clear any session data
    if (session) {
      // Clear all session data - be more aggressive
      const sessionKeys = [
        'customer',
        'customerAccessToken',
        'customerAccount',
        'customer_account_access_token',
        'customer_account_refresh_token',
        'customer_account_expires_at',
      ];
      sessionKeys.forEach((key) => {
        if (session.has(key)) {
          console.log(`Clearing session key: ${key}`);
          session.unset(key);
        }
      });

      // Force session commit
      console.log('Session cleared, forcing commit');
    }

    // Verify logout worked
    const isStillLoggedIn = await customerAccount.isLoggedIn();
    console.log('User still logged in after logout:', isStillLoggedIn);

    // If still logged in, try destroying the session entirely
    if (isStillLoggedIn && session) {
      console.log('User still logged in, destroying session');
      const destroyedSession = await session.destroy();
      console.log('Session destroyed:', !!destroyedSession);
    }
  } catch (error) {
    console.error('Logout error:', error);
  }

  // Set cookie to expire immediately to force logout
  const headers = new Headers();
  headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');

  // Clear any potential auth cookies
  headers.append(
    'Set-Cookie',
    'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax',
  );
  headers.append(
    'Set-Cookie',
    'customer_account_access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax',
  );

  return redirect('/', {headers});
}

export async function action({context}: ActionFunctionArgs) {
  const {customerAccount, session} = context;

  console.log('Logout action called');

  try {
    const isLoggedIn = await customerAccount.isLoggedIn();
    console.log('User was logged in (action):', isLoggedIn);

    if (isLoggedIn) {
      await customerAccount.logout();
      console.log('Logout successful (action)');
    }

    // Clear session data - be more aggressive
    if (session) {
      const sessionKeys = [
        'customer',
        'customerAccessToken',
        'customerAccount',
        'customer_account_access_token',
        'customer_account_refresh_token',
        'customer_account_expires_at',
      ];
      sessionKeys.forEach((key) => {
        if (session.has(key)) {
          console.log(`Clearing session key (action): ${key}`);
          session.unset(key);
        }
      });
    }

    // Verify logout worked
    const isStillLoggedIn = await customerAccount.isLoggedIn();
    console.log('User still logged in after logout (action):', isStillLoggedIn);

    // If still logged in, try destroying the session entirely
    if (isStillLoggedIn && session) {
      console.log('User still logged in, destroying session (action)');
      const destroyedSession = await session.destroy();
      console.log('Session destroyed (action):', !!destroyedSession);
    }
  } catch (error) {
    console.error('Logout action error:', error);
  }

  // Set cookie to expire immediately to force logout
  const headers = new Headers();
  headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');

  // Clear any potential auth cookies
  headers.append(
    'Set-Cookie',
    'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax',
  );
  headers.append(
    'Set-Cookie',
    'customer_account_access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax',
  );

  return redirect('/', {headers});
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

      {/* Client-side cleanup script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Clear all localStorage and sessionStorage
            if (typeof localStorage !== 'undefined') {
              localStorage.clear();
            }
            if (typeof sessionStorage !== 'undefined') {
              sessionStorage.clear();
            }

            // Force reload after a short delay to ensure server-side logout completes
            setTimeout(() => {
              window.location.href = '/';
            }, 2000);
          `,
        }}
      />
    </div>
  );
}
