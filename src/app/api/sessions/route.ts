import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const sessions = await db.session.findMany({
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
