import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PRIVATE_PATHS = [
  /^\/admin(\/|$)/,
  /^\/add(\/|$)/,
  /^\/entity\/[^/]+\/edit(\/|$)/,
  /^\/api\/reports(\/|$)/,
  /^\/api\/entities\/[^/]+\/revert(\/|$)/,
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  if (PRIVATE_PATHS.some((pattern) => pattern.test(pathname))) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return response;
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/add',
    '/add/:path*',
    '/entity/:path*',
    '/api/reports',
    '/api/reports/:path*',
    '/api/entities/:path*',
  ],
};
