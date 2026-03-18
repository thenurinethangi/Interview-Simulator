import { NextResponse } from 'next/server';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

export const runtime = 'nodejs';
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export async function POST(req: Request) {
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
            return NextResponse.json({ error: 'PDF is too large. Please upload a file under 4MB.' }, { status: 413 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        const loadingTask = getDocument({ data: bytes });
        const pdf = await loadingTask.promise;

        let text = '';
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
            const page = await pdf.getPage(pageNumber);
            const content = await page.getTextContent();
            const pageText = content.items
                .map((item: any) => ('str' in item ? item.str : ''))
                .join(' ')
                .trim();
            if (pageText) text += pageText + '\n';
        }

        await pdf.destroy();
        text = text.trim();

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

        const errorMsg = error?.message || 'Failed to extract text from PDF';
        return NextResponse.json(
            {
                error: `PDF parsing failed: ${errorMsg}`
            },
            { status: 500 }
        );
    }
}
