import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        const { text } = await req.json();

        if (!text || typeof text !== 'string') {
            return NextResponse.json({ error: 'No CV text provided' }, { status: 400 });
        }

        const trimmedText = text.trim();
        
        if (trimmedText.length === 0) {
            return NextResponse.json(
                { error: 'CV text is empty. Please paste your curriculum vitae.' },
                { status: 400 }
            );
        }

        return NextResponse.json({ text: trimmedText }, { status: 200 });
    } catch (error: any) {
        console.error("CV Text Processing Error:", error);
        const errorMsg = error?.message || 'Failed to process CV';
        return NextResponse.json(
            {
                error: `CV processing failed: ${errorMsg}`
            },
            { status: 500 }
        );
    }
}
