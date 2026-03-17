import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserIdFromCookies } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const userId = await getUserIdFromCookies();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const sessions = await db.session.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 15,
            include: {
                questions: {
                    select: { id: true, score: true }
                }
            }
        });

        const result = sessions.map((s) => {
            const answered = s.questions.filter(q => q.score !== null);
            const avg = answered.length > 0
                ? (answered.reduce((a, q) => a + (q.score || 0), 0) / answered.length).toFixed(1)
                : null;
            return {
                id: s.id,
                mode: s.mode,
                input: s.input,
                createdAt: s.createdAt,
                questionCount: s.questions.length,
                answeredCount: answered.length,
                avgScore: avg,
            };
        });

        return NextResponse.json({ sessions: result });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const userId = await getUserIdFromCookies();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const { id } = await req.json();
        if (!id) {
            return NextResponse.json({ error: 'Session id is required' }, { status: 400 });
        }
        await db.session.delete({ where: { id, userId } });
        return NextResponse.json({ ok: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
