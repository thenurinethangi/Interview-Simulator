import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserIdFromCookies } from '@/lib/auth';

export async function GET() {
    try {
        const userId = await getUserIdFromCookies();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const user = await db.user.findUnique({ where: { id: userId }, select: { id: true, email: true, name: true, googleId: true } });
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        return NextResponse.json({ user }, { status: 200 });
    } catch (error: any) {
        console.error('Me error', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch user' }, { status: 500 });
    }
}
