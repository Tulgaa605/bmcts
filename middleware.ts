import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, sessionOptions);

  const { pathname } = request.nextUrl;
  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/bm');
  const isLogin = pathname === '/login';
  const isRegister = pathname === '/register';

  if (isProtected && !session.user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if ((isLogin || isRegister) && session.user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/bm/:path*', '/login', '/register'],
};
