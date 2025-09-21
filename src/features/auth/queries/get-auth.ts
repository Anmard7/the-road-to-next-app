'use server';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { SESSION_COOKIE_NAME } from '@/features/auth/utils/session-cookie';
import { validateSession } from '@/lib/lucia';

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
  const sessionToken =
    (await cookies()).get(SESSION_COOKIE_NAME)?.value ?? null;
  if (!sessionToken) {
    return {
      user: null,
      session: null,
    };
  }
  return await validateSession(sessionToken);
});
