import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { db } from '@/lib/db';

export async function POST(req: Request) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({ error: 'OPENAI_API_KEY is not configured in .env' }, { status: 500 });
        }
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const { mode, input } = await req.json();

        if (!mode || !input) {
            return NextResponse.json({ error: 'Mode and input are required' }, { status: 400 });
        }

        let promptContext = '';
        if (mode === 'cv') {
            promptContext = `Based on the following extracted CV text, generate exactly 5 interview questions targeting the candidate's skills.\n\nCV Text:\n${input}`;
        } else {
            promptContext = `Generate exactly 5 interview questions about the following topic: "${input}".`;
        }

        const systemPrompt = `You are an expert technical interviewer.
${promptContext}

Rules:
1. Generate exactly 5 questions.
2. Mix theoretical and coding questions (include at least 1 coding question).
3. Coding questions MUST be simple algorithms or functions (e.g., reverse a string, find max element). Do not ask for multi-file systems or complex architecture design.
4. Return the result STRICTLY as a JSON object containing a "questions" array, where each object has:
  - "text": string (the question text)
  - "isCoding": boolean (true if the user should write code to answer in an IDE, false for a text explanation)

Example Output:
{
  "questions": [
    { "text": "Explain the concept of Closure in JavaScript.", "isCoding": false },
    { "text": "Write a function to check if a string is a palindrome.", "isCoding": true }
  ]
}`;

        // Call OpenAI
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // or gpt-4o-mini depending on what the user's key allows
            messages: [
                { role: 'system', content: 'You are a helpful assistant that strictly outputs JSON.' },
                { role: 'user', content: systemPrompt }
            ],
            response_format: { type: 'json_object' }
        });

        const aiResponse = completion.choices[0].message.content;
        if (!aiResponse) throw new Error("No response from AI");

        const parsedData = JSON.parse(aiResponse);
        const questionsList = parsedData.questions;

        if (!Array.isArray(questionsList) || questionsList.length === 0) {
            throw new Error("Invalid format from AI");
        }

        // Save Session and Questions into Database
        const sessionUrlMode = mode === 'cv' ? 'CV' : 'TOPIC';

        const dbSession = await db.session.create({
            data: {
                mode: sessionUrlMode,
                input: input,
                questions: {
                    create: questionsList.map((q: any) => ({
                        text: q.text,
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
        return NextResponse.json({ error: error.message || 'Failed to generate questions' }, { status: 500 });
    }
}
