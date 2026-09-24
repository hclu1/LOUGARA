import { NextRequest, NextResponse } from 'next/server';
import { parseKbisOcrText } from '@/features/ocr/kbis-parser';
import { extractTextFromPdfBuffer } from '@/features/ocr/pdf-extractor';
import { createWorker, recognize } from 'tesseract.js';
import path from 'path';
import fs from 'fs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const expectedAddress = formData.get('expectedAddress') as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Aucun fichier fourni pour l\'inspection OCR.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = file.name.toLowerCase();
    const fileSizeStr = `${(file.size / 1024 / 1024).toFixed(2)} Mo`;

    let extractedText = '';
    let methodUsed = 'UNKNOWN';

    // 1. SI FICHIER PDF
    if (file.type === 'application/pdf' || fileName.endsWith('.pdf')) {
      try {
        extractedText = extractTextFromPdfBuffer(buffer);
        if (extractedText && extractedText.trim().length > 20) {
          methodUsed = 'PDF_FAST_STREAM_EXTRACTION';
        }
      } catch (err) {
        console.warn('Extraction flux PDF natif modérateur :', err);
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
          console.warn('Echec pdf-parse modérateur :', pdfErr);
        }
      }
    }

    // 2. SI FICHIER IMAGE OU SCANNÉ
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
          console.warn('Echec Tesseract OCR :', ocrErr?.message);
        }
      }
    }

    if (!extractedText || extractedText.trim().length < 10) {
      return NextResponse.json({
        success: false,
        error: 'Impossible d\'extraire le texte du document (image trop floue ou PDF scanné complexe).',
      });
    }

    const parsedData = parseKbisOcrText(extractedText);

    // Evaluation de la correspondance d'adresse siège social
    let addressMatchScore = 0;
    if (expectedAddress && parsedData.addressLocation) {
      const expNorm = expectedAddress.toLowerCase().replace(/[^a-z0-9]/g, '');
      const actNorm = parsedData.addressLocation.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (expNorm.includes(actNorm) || actNorm.includes(expNorm)) {
        addressMatchScore = 100;
      } else {
        addressMatchScore = 60;
      }
    }

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileSize: fileSizeStr,
      method: methodUsed,
      data: {
        ...parsedData,
        addressMatchScore,
      },
    });
  } catch (error: any) {
    console.error('Erreur API Admin OCR :', error);
    return NextResponse.json(
      { success: false, error: 'Erreur d\'inspection : ' + (error.message || 'Erreur inconnue') },
      { status: 500 }
    );
  }
}
