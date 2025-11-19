import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale: 'es',

  // Always use locale prefix
  localePrefix: 'always'
});

export const config = {
  // Match all pathnames except for
  // - /api routes
  // - /_next (Next.js internals)
  // - /static (static files)
  // - /favicon.ico, /robots.txt (metadata files)
  matcher: ['/((?!api|_next|static|favicon.ico|robots.txt).*)']
};
