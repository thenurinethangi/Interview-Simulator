import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';

const getEnv = (key: string) => {
    const val = process.env[key];
    if (!val) throw new Error(`${key} is not set`);
    return val;
};

export const signAccessToken = (userId: string) => {
    return jwt.sign({ userId }, getEnv('JWT_ACCESS_SECRET'), { expiresIn: ACCESS_EXPIRES_IN });
};

export const signRefreshToken = (userId: string, tokenId: string) => {
    return jwt.sign({ userId, tokenId }, getEnv('JWT_REFRESH_SECRET'), { expiresIn: REFRESH_EXPIRES_IN });
};

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, getEnv('JWT_ACCESS_SECRET')) as { userId: string; iat: number; exp: number };
};

export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, getEnv('JWT_REFRESH_SECRET')) as { userId: string; tokenId: string; iat: number; exp: number };
};

type CookieStoreLike = {
    get: (name: string) => { value: string } | undefined;
};

export const getUserIdFromCookieStore = (cookieStore: CookieStoreLike): string | null => {
    try {
        const token = cookieStore.get('access_token')?.value;
        if (!token) return null;
        const decoded = verifyAccessToken(token);
        return decoded.userId;
    } catch (err) {
        return null;
    }
};

export const getUserIdFromCookies = async (): Promise<string | null> => {
    const cookieStore = await cookies();
    return getUserIdFromCookieStore(cookieStore);
};

export const clearAuthCookies = (res: Response | any) => {
    res.cookies?.set('access_token', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
    res.cookies?.set('refresh_token', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
};
