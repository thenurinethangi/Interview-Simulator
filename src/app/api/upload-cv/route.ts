import { NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';

export const runtime = 'nodejs';

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export async function POST(req: Request) {
    let parser: PDFParse | null = null;
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!file.name.toLowerCase().endsWith('.pdf')) {
            return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
        }

        if (file.size > MAX_UPLOAD_BYTES) {
            return NextResponse.json({ error: 'PDF is too large. Max allowed size is 4MB.' }, { status: 413 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);

        parser = new PDFParse({ data });
        const result = await parser.getText();
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
        return NextResponse.json({ error: error?.message || 'Failed to extract text from PDF' }, { status: 500 });
    } finally {
        if (parser) {
            try {
                await parser.destroy();
            } catch {
                // no-op
            }
        }
    }
}
