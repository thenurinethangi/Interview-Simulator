import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies, headers } from 'next/headers';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/lib/auth';
import { randomUUID } from 'crypto';

const ACCESS_MAX_AGE = 60 * 15;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;

const isLocalhost = (host: string | null | undefined) => host?.includes('localhost') || host?.startsWith('127.') || host?.startsWith('192.168.');
const cookieOpts = (maxAge: number, host: string | null | undefined) => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' && !isLocalhost(host),
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
});

export async function POST() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('refresh_token')?.value;
        const headerStore = await headers();
        const host = headerStore.get('host');
        if (!token) {
            return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
        }

        let decoded;
        try {
            decoded = verifyRefreshToken(token);
        } catch (err) {
            return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
        }

        const tokenRecord = await db.refreshToken.findUnique({ where: { id: decoded.tokenId } });
        if (!tokenRecord || tokenRecord.revoked || tokenRecord.expiresAt < new Date()) {
            return NextResponse.json({ error: 'Refresh token expired or revoked' }, { status: 401 });
        }

        // Rotate
        await db.refreshToken.update({ where: { id: tokenRecord.id }, data: { revoked: true } });
        const newRecord = await db.refreshToken.create({
            data: {
                userId: decoded.userId,
                token: randomUUID(),
                expiresAt: new Date(Date.now() + REFRESH_MAX_AGE * 1000),
            },
        });

        const accessToken = signAccessToken(decoded.userId);
        const refreshToken = signRefreshToken(decoded.userId, newRecord.id);

        const res = NextResponse.json({ ok: true }, { status: 200 });
        res.cookies.set('access_token', accessToken, cookieOpts(ACCESS_MAX_AGE, host));
        res.cookies.set('refresh_token', refreshToken, cookieOpts(REFRESH_MAX_AGE, host));
        return res;
    } catch (error: any) {
        console.error('Refresh error', error);
        return NextResponse.json({ error: error.message || 'Failed to refresh token' }, { status: 500 });
    }
}
