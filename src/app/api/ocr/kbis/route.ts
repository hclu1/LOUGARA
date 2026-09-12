import { NextRequest, NextResponse } from 'next/server';
import { createWorker } from 'tesseract.js';
import { parseKbisOcrText } from '@/features/ocr/kbis-parser';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni pour l\'analyse OCR.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Initialiser le worker Tesseract avec la langue française
    const worker = await createWorker('fra');
    
    let rawText = '';
    try {
      const { data } = await worker.recognize(buffer);
      rawText = data.text;
    } finally {
      await worker.terminate();
    }

    // Parser les vraies données à partir du texte optique extrait
    const parsedData = parseKbisOcrText(rawText);

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(1)} Mo`,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Erreur lors du traitement OCR :', error);
    return NextResponse.json(
      { error: 'Échec de l\'analyse optique du document : ' + (error.message || 'Erreur interne') },
      { status: 500 }
    );
  }
}
