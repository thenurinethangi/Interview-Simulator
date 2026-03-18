import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateGroqJson } from '@/lib/groq';
import { randomUUID } from 'crypto';
import { getUserIdFromCookies } from '@/lib/auth';

const DB_VARCHAR_LIMIT = 191;

const fitVarchar = (value: string, max = DB_VARCHAR_LIMIT) => {
    const normalized = String(value ?? '').trim();
    if (normalized.length <= max) return normalized;
    return normalized.slice(0, max - 1) + '…';
};

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'GROQ_API_KEY is not configured in .env' }, { status: 500 });
        }

        const userId = await getUserIdFromCookies();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { mode, input } = await req.json();

        if (!mode || !input) {
            return NextResponse.json({ error: 'Mode and input are required' }, { status: 400 });
        }

        const sessionUrlMode = mode === 'cv' ? 'CV' : 'TOPIC';

        // Fetch previous questions for this user to avoid repetition
        const pastSessions = await db.session.findMany({
            where: {
                userId,
                mode: sessionUrlMode,
                ...(sessionUrlMode === 'TOPIC' ? { input: fitVarchar(input) } : {})
            },
            include: {
                questions: {
                    select: { text: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 5 // Last 5 sessions
        });

        const previousQuestions = pastSessions.flatMap((s: any) => s.questions.map((q: any) => q.text));

        const flavors = [
            'Emphasize edge cases and constraints; include at least one performance angle.',
            'Include one debugging-style coding question and one conceptual why/how question.',
            'Ask about trade-offs and alternatives; include at least one data-structure-focused coding task.',
            'Include one optimization question and one test-case design angle.',
            'Mix practical implementation with one theory contrast (pros/cons or when-to-use).'
        ];
        const flavor = flavors[Math.floor(Math.random() * flavors.length)];

        let promptContext = '';
        if (mode === 'cv') {
            promptContext = `Based on the following extracted CV text, determine the candidate's experience level (e.g., Junior/Associate, Mid-level, Senior, etc.). Generate exactly 5 interview questions targeting the candidate's skills. The complexity and scope of the questions MUST strictly match their experience level. For example, if the position/experience is at the Associate level, the questions must be scoped to that level and not be overly hard or Senior-level. If the candidate is Senior, the questions should be suitably complex and challenging.\n\nCV Text:\n${input}`;
        } else {
            promptContext = `Generate exactly 5 interview questions about the following topic: "${input}". Ensure the 5 questions cover a strict variety of difficulty levels: e.g., 2 Easy, 2 Medium, and 1 Hard.`;
        }

        if (previousQuestions.length > 0) {
            promptContext += `\n\nIMPORTANT AVOID REPETITION:\nThe candidate has already been asked the following questions recently. DO NOT ask these exact questions or highly similar variations. You MUST generate fresh, new, and diverse questions:\n${previousQuestions.map((q: string) => '- ' + q).join('\n')}`;
        }

        const randomnessToken = randomUUID();

        const prompt = `You are an expert technical interviewer.
${promptContext}

Rules:
1. Generate exactly 5 questions.
2. Mix theoretical and coding questions (include at least 1 coding question).
3. Coding questions MUST be simple algorithms or functions (e.g., reverse a string, find max element). Do not ask for multi-file systems or complex architecture design.
4. Vary phrasing, difficulty, and angle each time even for the same input. Do not repeat the same set across calls. Randomness token: ${randomnessToken}. Flavor: ${flavor}
5. Return the result STRICTLY as a JSON object containing a "questions" array, where each object has:
  - "text": string (the question text. **MUST** start with the difficulty level in brackets, e.g., "[Easy] What is...", "[Medium] Explain...", "[Hard] Implement...")
  - "isCoding": boolean (true if the user should write code to answer in an IDE, false for a text explanation)

Example Output:
{
  "questions": [
    { "text": "[Easy] Explain the concept of Closure in JavaScript.", "isCoding": false },
    { "text": "[Medium] Write a function to check if a string is a palindrome.", "isCoding": true }
  ]
}`;

        const result = await generateGroqJson({
            apiKey,
            prompt,
            systemInstruction: 'You are a helpful assistant that strictly outputs valid JSON only.',
            temperature: 1.1
        });
        const parsedData = result.data;
        const questionsList = parsedData.questions;

        if (!Array.isArray(questionsList) || questionsList.length === 0) {
            throw new Error('Invalid format from Groq');
        }

        const normalizedQuestions = questionsList.slice(0, 5).map((q: any, index: number) => ({
            text: typeof q?.text === 'string' && q.text.trim().length > 0
                ? q.text.trim()
                : `Question ${index + 1}`,
            isCoding: Boolean(q?.isCoding)
        }));

        // Save Session and Questions into Database
        const dbSession = await db.session.create({
            data: {
                mode: sessionUrlMode,
                input: fitVarchar(input),
                userId,
                questions: {
                    create: normalizedQuestions.map((q: any) => ({
                        text: fitVarchar(q.text),
                        isCoding: q.isCoding
                    }))
                }
            },
            include: {
                questions: true // return created questions
            }
        });

        return NextResponse.json({ sessionId: dbSession.id, questions: dbSession.questions }, { status: 200 });

    } catch (error: any) {
        console.error("Generate Questions Error:", error);
        if (error?.code === 'P2000') {
            return NextResponse.json({ error: 'Request content is too long to store. Please try a shorter topic.' }, { status: 400 });
        }
        return NextResponse.json({ error: error.message || 'Failed to generate questions' }, { status: 500 });
    }
}
