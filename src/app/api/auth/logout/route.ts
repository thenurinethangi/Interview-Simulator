import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyRefreshToken } from '@/lib/auth';

export async function POST() {
    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get('refresh_token')?.value;
        if (refreshToken) {
            try {
                const decoded = verifyRefreshToken(refreshToken);
                await db.refreshToken.updateMany({ where: { id: decoded.tokenId }, data: { revoked: true } });
            } catch (err) {
                // ignore invalid tokens
            }
        }
        const res = NextResponse.json({ ok: true }, { status: 200 });
        res.cookies.set('access_token', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
        res.cookies.set('refresh_token', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
        return res;
    } catch (error: any) {
        console.error('Logout error', error);
        return NextResponse.json({ error: error.message || 'Logout failed' }, { status: 500 });
    }
}
