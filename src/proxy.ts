import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['es', 'en'];
const defaultLocale = 'es';

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Admin Auth Guard ---
  const isAdminRoute = /\/admin(\/|$)/.test(pathname);
  const isLoginPage = pathname.includes('/admin/login');
  const isAuthApi = pathname.startsWith('/api/admin/auth');

  if (isAdminRoute && !isLoginPage && !isAuthApi) {
    const sessionCookie = request.cookies.get('admin_session');
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword || sessionCookie?.value !== adminPassword) {
      const lang = pathname.split('/')[1] || defaultLocale;
      const loginUrl = new URL(`/${lang}/admin/login`, request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // --- i18n: Redirect if locale is missing ---
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    return NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname === '/' ? '' : pathname}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and cron routes
    '/((?!_next|api/cron|favicon.ico|.*\\..*).*)',
  ],
};

