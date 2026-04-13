import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAuthToken } from './lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow access to login page and auth API routes
  if (pathname === '/login' || pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }
  
  // Check for auth token
  const token = request.cookies.get('tds_auth_token')?.value
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Verify token
  const isValid = await verifyAuthToken(token)
  
  if (!isValid) {
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('tds_auth_token')
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
