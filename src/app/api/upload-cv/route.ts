import { NextResponse } from 'next/server';
const pdfParse = require('pdf-parse');

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Read the file data
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Parse the PDF
        const data = await pdfParse(buffer);
        const text = data.text;

        return NextResponse.json({ text }, { status: 200 });
    } catch (error: any) {
        console.error("PDF Parsing Error:", error);
        return NextResponse.json({ error: 'Failed to extract text from PDF' }, { status: 500 });
    }
}
