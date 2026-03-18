import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateGroqJson } from '@/lib/groq';
import { getUserIdFromCookies } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'GROQ_API_KEY is not configured in .env' }, { status: 500 });
        }

        const userId = await getUserIdFromCookies();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { questionId, answer } = await req.json();

        if (!questionId || !answer) {
            return NextResponse.json({ error: 'Question ID and answer are required' }, { status: 400 });
        }

        const question = await db.question.findUnique({
            where: { id: questionId },
            include: { session: { select: { userId: true } } }
        });

        if (!question) {
            return NextResponse.json({ error: 'Question not found' }, { status: 404 });
        }

        if (question.session.userId !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const prompt = `You are a senior technical interviewer evaluating a candidate's answer.

Question: "${question.text}"
Candidate's Answer:
"""
${answer}
"""

Evaluate the answer based on correctness, depth, and clarity.
Return STRICTLY a JSON object with exactly these fields:
- "score": number (0 to 10, be precise like 7.5 or 8)
- "level": string (exactly one of: "Beginner", "Intermediate", "Professional")
- "feedback": string (1-2 sentence overall summary of the answer quality)
- "strengths": array of strings (2-4 specific things the candidate did well. Each item is a short phrase.)
- "missing": array of strings (2-4 specific gaps, mistakes, or things missing. Each item is a short phrase.)
- "timeComplexity": string or null (ONLY if the answer is code/algorithm, e.g. "O(N) Time, O(1) Space". Otherwise null.)
- "improvedCode": string or null (ONLY if the answer contains code, provide an improved version as a properly formatted, multi-line code string with correct indentation and newlines. Do NOT provide it as a single line string. Do NOT wrap it in markdown codeblocks. Otherwise null.)

Be constructive and specific. Always populate strengths and missing with at least 1 item each.
`;

        const result = await generateGroqJson({
            apiKey,
            prompt,
            systemInstruction: 'You are an expert technical evaluator that strictly outputs valid JSON with no markdown.',
            temperature: 0.2
        });
        const evaluation = result.data;

        const strengthsArr: string[] = Array.isArray(evaluation.strengths) ? evaluation.strengths : [];
        const missingArr: string[] = Array.isArray(evaluation.missing) ? evaluation.missing : [];

        await db.question.update({
            where: { id: questionId },
            data: {
                userAnswer: answer,
                score: parseFloat(evaluation.score?.toString() || '0'),
                level: evaluation.level || 'Beginner',
                feedback: evaluation.feedback || '',
                strengths: JSON.stringify(strengthsArr),
                missing: JSON.stringify(missingArr),
                timeComplexity: evaluation.timeComplexity || null,
                improvedCode: evaluation.improvedCode || null,
            }
        });

        return NextResponse.json({
            success: true,
            evaluation: {
                score: evaluation.score,
                level: evaluation.level,
                feedback: evaluation.feedback,
                strengths: strengthsArr,
                missing: missingArr,
                timeComplexity: evaluation.timeComplexity || null,
                improvedCode: evaluation.improvedCode || null,
            }
        }, { status: 200 });

    } catch (error: any) {
        console.error('Evaluate Answer Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to evaluate answer' }, { status: 500 });
    }
}
