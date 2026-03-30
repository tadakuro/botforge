import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import type { NextRequest } from 'next/server'

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || 'fallback-secret-change-me')

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('bf_session')?.value
    if (!token) return NextResponse.redirect(new URL('/login', request.url))
    try {
      await jwtVerify(token, SECRET)
      return NextResponse.next()
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  return NextResponse.next()
}

export const config = { matcher: ['/dashboard/:path*'] }
