import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const redirectUri = `${origin}/api/auth/google/callback`;
    if (!clientId) {
        return NextResponse.json({ error: 'Google client not configured' }, { status: 500 });
    }
    const state = randomUUID();
    const scope = encodeURIComponent('openid email profile');
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;
    return NextResponse.redirect(url);
}
