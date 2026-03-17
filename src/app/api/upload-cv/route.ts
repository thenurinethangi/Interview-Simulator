import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        const pdfParseModule = await import('pdf-parse');
        const pdfParse = (pdfParseModule as any).default || (pdfParseModule as any);

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!file.name.toLowerCase().endsWith('.pdf')) {
            return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const result = await pdfParse(buffer);
        const text = (result?.text || '').trim();

        if (!text) {
            return NextResponse.json(
                { error: 'No readable text found in this PDF. If it is scanned/image-based, use a text-based PDF.' },
                { status: 400 }
            );
        }

        return NextResponse.json({ text }, { status: 200 });
    } catch (error: any) {
        console.error("PDF Parsing Error:", error);
        console.error("Error stack:", error?.stack);
        console.error("Error code:", error?.code);
        
        // Return more diagnostic info
        const errorMsg = error?.message || 'Failed to extract text from PDF';
        const isDependencyError = errorMsg.includes('cannot find') || errorMsg.includes('not a function');
        
        return NextResponse.json(
            { 
                error: isDependencyError 
                    ? `PDF library error (${errorMsg}). Try a different PDF or use Topic mode.`
                    : errorMsg
            }, 
            { status: 500 }
        );
    }
}
