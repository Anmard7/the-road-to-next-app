'use server';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { lucia } from '@/lib/lucia';

/**
 * Retrieves authentication state from the current session.
 *
 * This function is designed to work in both server and client contexts:
 *
 * SERVER USAGE (Server Components, Server Actions):
 * - Reads cookies directly using next/headers
 * - Can write session cookies when session is fresh or invalid
 * - Caches results for the duration of the request
 *
 * CLIENT USAGE (Client Components via useEffect):
 * - When called from client components, cookies() will throw an error
 * - The try-catch block gracefully handles this error and prevents crashes
 * - Returns { user: null, session: null } as fallback for client-side calls
 * - Allows static page generation while providing auth functionality
 *
 * This dual behavior enables:
 * 1. Static page generation (no server-side auth checks during build)
 * 2. Client-side auth state management without API routes
 * 3. Graceful degradation when server functions are called from client
 */
export const getAuth = cache(async () => {
  const sessionId =
    (await cookies()).get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return {
      user: null,
      session: null,
    };
  }
  const result = await lucia.validateSession(sessionId);

  // Cookie management: Only works in server context
  // This try-catch serves dual purposes:
  // 1. Handles the restriction that try blocks are not allowed in some RSCs
  // 2. Prevents crashes when this function is called from client components
  try {
    // Refresh session cookie if the session is fresh (extends expiration)
    if (result.session && result.session.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id);
      (await cookies()).set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    }
    // Clear invalid session by setting a blank cookie
    if (!result.session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      (await cookies()).set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    }
  } catch {
    // Silently handle errors from:
    // 1. RSC context where try blocks may be restricted
    // 2. Client-side calls where cookies() is not available
    // This allows the function to return auth state without crashing
  }

  return result;
});
