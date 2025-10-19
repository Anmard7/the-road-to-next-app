import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from './features/auth/utils/session-cookie';
import { signInPath } from './paths';

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  if (!sessionCookie) {
    return NextResponse.redirect(new URL(signInPath(), request.url));
  }
  return NextResponse.next();
}
export const config = {
  matcher: ['/tickets'],
};
