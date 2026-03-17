import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/auth/login', '/auth/register'];

const isPublic = (path: string) => (
    PUBLIC_PATHS.includes(path) ||
    path.startsWith('/api/') ||
    path.startsWith('/_next') ||
    path.startsWith('/favicon') ||
    path.startsWith('/assets') ||
    path === '/api/auth/google' ||
    path.startsWith('/api/auth/google/callback')
);

const isValidAccessToken = (token?: string | null) => {
    if (!token || token === 'undefined' || token === 'null') return false;
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    try {
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
        const decoded = atob(padded);
        const payload = JSON.parse(decoded);
        if (!payload?.exp) return false;
        return payload.exp * 1000 > Date.now();
    } catch (err) {
        return false;
    }
};

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const access = req.cookies.get('access_token')?.value;

    const accessValid = isValidAccessToken(access);

    // Home should act as the post-auth app entrypoint only.
    // Unauthenticated users are sent to landing.
    if (pathname === '/') {
        if (!accessValid) {
            return NextResponse.redirect(new URL('/landing', req.url));
        }
        return NextResponse.next();
    }

    // Keep landing public, but logged-in users should not stay there.
    if (pathname === '/landing') {
        if (accessValid) {
            return NextResponse.redirect(new URL('/', req.url));
        }
        return NextResponse.next();
    }

    if (isPublic(pathname)) {
        if (accessValid && (pathname === '/auth/login' || pathname === '/auth/register')) {
            return NextResponse.redirect(new URL('/', req.url));
        }
        return NextResponse.next();
    }

    if (!accessValid) {
        const redirectUrl = new URL('/auth/login', req.url);
        redirectUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
