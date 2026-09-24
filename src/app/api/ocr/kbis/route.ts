import { NextRequest, NextResponse } from 'next/server';
import { recognize, createWorker } from 'tesseract.js';
import { parseKbisOcrText } from '@/features/ocr/kbis-parser';
import { extractTextFromPdfBuffer } from '@/features/ocr/pdf-extractor';
import path from 'path';
import fs from 'fs';

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
    const fileName = file.name.toLowerCase();
    const fileSizeStr = `${(file.size / 1024 / 1024).toFixed(2)} Mo`;

    let extractedText = '';
    let methodUsed = 'UNKNOWN';

    // 1. SI FICHIER PDF : Extraction ultra-rapide des flux textuels natifs (< 50ms)
    if (file.type === 'application/pdf' || fileName.endsWith('.pdf')) {
      try {
        extractedText = extractTextFromPdfBuffer(buffer);
        if (extractedText && extractedText.trim().length > 20) {
          methodUsed = 'PDF_FAST_STREAM_EXTRACTION';
        }
      } catch (err) {
        console.warn('Extraction flux PDF natif :', err);
      }

      if (!extractedText || extractedText.trim().length < 20) {
        try {
          const { PDFParse } = require('pdf-parse');
          const pdfParser = new PDFParse({ data: buffer });
          extractedText = await pdfParser.getText();
          if (extractedText && extractedText.trim().length > 20) {
            methodUsed = 'PDF_PARSE_LIBRARY';
          }
        } catch (pdfErr) {
          console.warn('Echec pdf-parse :', pdfErr);
        }
      }
    }

    // 2. SI FICHIER IMAGE OU SCANNÉ : Tesseract OCR serveur avec contrôle de fichier local
    if (!extractedText || extractedText.trim().length < 20) {
      const isPdf = file.type === 'application/pdf' || fileName.endsWith('.pdf');
      if (!isPdf) {
        try {
          methodUsed = 'TESSERACT_OCR_SERVER';
          const trainedDataPath = path.join(process.cwd(), 'fra.traineddata');

          if (fs.existsSync(trainedDataPath)) {
            const worker = await createWorker('fra', 1, {
              langPath: process.cwd(),
              cachePath: process.cwd(),
            });
            const ocrResult = await worker.recognize(buffer);
            if (ocrResult?.data?.text) {
              extractedText = ocrResult.data.text;
            }
            await worker.terminate();
          } else {
            const ocrResult = await recognize(buffer, 'fra');
            if (ocrResult?.data?.text) {
              extractedText = ocrResult.data.text;
            }
          }
        } catch (ocrErr: any) {
          console.warn('Echec Tesseract OCR serveur :', ocrErr?.message);
        }
      }
    }

    // Si le serveur n'a pas pu extraire de texte
    if (!extractedText || extractedText.trim().length < 10) {
      return NextResponse.json({
        success: false,
        needClientOcr: true,
        message: 'Bascule automatique sur l\'OCR client ultra-rapide.',
      });
    }

    const parsedData = parseKbisOcrText(extractedText);

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileSize: fileSizeStr,
      method: methodUsed,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Erreur API OCR :', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement du document : ' + (error.message || 'Erreur inconnue') },
      { status: 500 }
    );
  }
}
