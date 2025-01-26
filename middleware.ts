import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle @search pattern
  if (pathname.startsWith('/@')) {
    // Get the full search query after @ and preserve spaces
    const searchQuery = pathname.slice(2); // Remove /@
    const url = new URL('/', request.url);
    // Properly encode the search term
    url.hash = `search=${encodeURIComponent(searchQuery)}`;
    return NextResponse.redirect(url);
  }

  // Handle direct URL extraction pattern
  if (pathname.startsWith('/extract/')) {
    const extractUrl = pathname.slice(9); // Remove /extract/
    const url = new URL('/', request.url);
    url.hash = `extract=${encodeURIComponent(extractUrl)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Configure matcher for the middleware
export const config = {
  matcher: ['/@:path*', '/extract/:path*']
} 