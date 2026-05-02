import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['es', 'en'];
const defaultLocale = 'es';

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('--- Proxy Debug ---');
  console.log('Pathname:', pathname);

  // Check if the pathname is missing a locale
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );
  
  console.log('Is Missing Locale:', pathnameIsMissingLocale);

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const redirectUrl = new URL(`/${defaultLocale}${pathname === '/' ? '' : pathname}`, request.url);
    console.log('Redirecting to:', redirectUrl.toString());
    return NextResponse.redirect(redirectUrl);
  }

  console.log('Continuing to next path...');
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, static, etc)
    '/((?!_next|api|favicon.ico|.*\\..*).*)',
  ],
};
