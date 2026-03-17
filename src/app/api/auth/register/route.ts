import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { signAccessToken, signRefreshToken } from '@/lib/auth';

const ACCESS_MAX_AGE = 60 * 15; // 15 minutes
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const isLocalhost = (host: string | null | undefined) => host?.includes('localhost') || host?.startsWith('127.') || host?.startsWith('192.168.');
const cookieOpts = (maxAge: number, req: Request) => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' && !isLocalhost(req.headers.get('host')),
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
});

export async function POST(req: Request) {
    try {
        const { email, password, name } = await req.json();
        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const existing = await db.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await db.user.create({ data: { email, passwordHash, name: name || null } });

        const refreshTokenRecord = await db.refreshToken.create({
            data: {
                userId: user.id,
                token: randomUUID(),
                expiresAt: new Date(Date.now() + REFRESH_MAX_AGE * 1000),
            },
        });

        const accessToken = signAccessToken(user.id);
        const refreshToken = signRefreshToken(user.id, refreshTokenRecord.id);

        const res = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } }, { status: 201 });
        res.cookies.set('access_token', accessToken, cookieOpts(ACCESS_MAX_AGE, req));
        res.cookies.set('refresh_token', refreshToken, cookieOpts(REFRESH_MAX_AGE, req));
        return res;
    } catch (error: any) {
        console.error('Register error', error);
        return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
    }
}
