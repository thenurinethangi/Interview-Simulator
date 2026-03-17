import { NextResponse } from 'next/server';
import { generateGroqJson } from '@/lib/groq';

function formatTheoryAnswer(answer: string) {
    const trimmed = answer.trim();
    if (!trimmed) return trimmed;
    if (trimmed.includes('\n')) return trimmed;

    // Fallback: split long single-line text into readable interview bullets.
    const sentences = trimmed
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter(Boolean);

    if (sentences.length <= 1) return trimmed;
    return sentences.map((s) => `- ${s}`).join('\n');
}

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'GROQ_API_KEY is not configured in .env' }, { status: 500 });
        }

        const { question, userAnswer, feedback, strengths, missing, isCoding } = await req.json();

        if (!question || !userAnswer) {
            return NextResponse.json({ error: 'Question and user answer are required' }, { status: 400 });
        }

        const prompt = isCoding
            ? `You are preparing a candidate for a real technical coding interview.

Question:
${question}

Candidate's current solution:
${userAnswer}

Reviewer feedback:
${feedback || 'No feedback provided.'}

Strengths already present:
${Array.isArray(strengths) && strengths.length > 0 ? strengths.join('; ') : 'None listed.'}

Missing points to address:
${Array.isArray(missing) && missing.length > 0 ? missing.join('; ') : 'None listed.'}

Generate an optimized interview-ready coding answer.

Rules:
1. Return STRICTLY a JSON object.
2. Use this exact shape:
{ "optimizedCode": string, "timeComplexity": string, "explanation": string }
3. optimizedCode must be executable code only (no markdown fences).
4. explanation must be concise (1-3 sentences).
5. timeComplexity should be like "O(N) Time, O(1) Space".
8. Improve correctness, readability, and efficiency.
9. IMPORTANT: optimizedCode must be properly formatted with line breaks and indentation (not one line).`
            : `You are preparing a candidate for a real technical interview.

Question:
${question}

Candidate's draft answer:
${userAnswer}

Reviewer feedback:
${feedback || 'No feedback provided.'}

Strengths already present:
${Array.isArray(strengths) && strengths.length > 0 ? strengths.join('; ') : 'None listed.'}

Missing points to address:
${Array.isArray(missing) && missing.length > 0 ? missing.join('; ') : 'None listed.'}

Generate a polished, interview-ready answer.

Rules:
1. Return STRICTLY a JSON object.
2. Use this shape exactly: { "answer": string }.
3. The answer must sound natural, confident, and concise.
4. Keep it to 1-3 short paragraphs or compact bullet-style sentences suitable for speaking in an interview.
5. Incorporate the missing points while preserving the user's correct ideas.
6. Add clear line breaks: either 2 short paragraphs OR bullet points with one point per line.
7. Do not include markdown fences.`;

        const result = await generateGroqJson({
            apiKey,
            prompt,
            systemInstruction: 'You rewrite technical answers into polished interview-ready responses and output valid JSON only.',
            temperature: 0.3
        });

        if (isCoding) {
            const optimizedCode = typeof result.data?.optimizedCode === 'string' ? result.data.optimizedCode.trim() : '';
            const timeComplexity = typeof result.data?.timeComplexity === 'string' ? result.data.timeComplexity.trim() : '';
            const explanation = typeof result.data?.explanation === 'string' ? result.data.explanation.trim() : '';

            if (!optimizedCode) {
                throw new Error('Invalid optimized code format from Groq');
            }

            return NextResponse.json(
                {
                    optimizedCode,
                    timeComplexity: timeComplexity || null,
                    explanation: explanation || null,
                },
                { status: 200 }
            );
        }

        const answerRaw = typeof result.data?.answer === 'string' ? result.data.answer : '';
        const answer = formatTheoryAnswer(answerRaw);
        if (!answer) {
            throw new Error('Invalid format from Groq');
        }

        return NextResponse.json({ answer }, { status: 200 });
    } catch (error: any) {
        console.error('Generate Interview Answer Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to generate interview-ready answer' }, { status: 500 });
    }
}