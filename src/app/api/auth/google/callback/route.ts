import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signAccessToken, signRefreshToken } from '@/lib/auth';
import { randomUUID } from 'crypto';

const ACCESS_MAX_AGE = 60 * 15;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;

const isLocalhost = (host: string | null | undefined) => host?.includes('localhost') || host?.startsWith('127.') || host?.startsWith('192.168.');
const cookieOpts = (maxAge: number, request: Request) => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' && !isLocalhost(new URL(request.url).host),
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
});

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        if (!code) {
            return NextResponse.json({ error: 'Missing code' }, { status: 400 });
        }
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`;
        if (!clientId || !clientSecret) {
            return NextResponse.json({ error: 'Google client not configured' }, { status: 500 });
        }

        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }),
        });
        if (!tokenRes.ok) {
            const err = await tokenRes.text();
            throw new Error(`Google token exchange failed: ${err}`);
        }
        const tokenJson = await tokenRes.json();
        const accessToken = tokenJson.access_token as string;
        const idToken = tokenJson.id_token as string | undefined;
        if (!accessToken) throw new Error('No access token from Google');

        const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!profileRes.ok) {
            const err = await profileRes.text();
            throw new Error(`Google profile fetch failed: ${err}`);
        }
        const profile = await profileRes.json();
        const email = profile.email as string | undefined;
        const googleId = profile.id as string | undefined;
        const name = profile.name as string | undefined;
        if (!email || !googleId) throw new Error('Missing Google profile email/id');

        let user = await db.user.findFirst({ where: { OR: [{ email }, { googleId }] } });
        if (!user) {
            user = await db.user.create({ data: { email, googleId, name: name || null } });
        } else if (!user.googleId) {
            user = await db.user.update({ where: { id: user.id }, data: { googleId } });
        }

        const refreshRecord = await db.refreshToken.create({
            data: {
                userId: user.id,
                token: randomUUID(),
                expiresAt: new Date(Date.now() + REFRESH_MAX_AGE * 1000),
            },
        });

        const appAccess = signAccessToken(user.id);
        const appRefresh = signRefreshToken(user.id, refreshRecord.id);

        const res = NextResponse.redirect(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
        res.cookies.set('access_token', appAccess, cookieOpts(ACCESS_MAX_AGE, request));
        res.cookies.set('refresh_token', appRefresh, cookieOpts(REFRESH_MAX_AGE, request));
        return res;
    } catch (error: any) {
        console.error('Google callback error', error);
        return NextResponse.json({ error: error.message || 'Google auth failed' }, { status: 500 });
    }
}
