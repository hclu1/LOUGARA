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
    // 1. SI FICHIER PDF : Extraction de haute précision via pdf-parse
    if (file.type === 'application/pdf' || fileName.endsWith('.pdf')) {
      try {
        const { PDFParse } = require('pdf-parse');
        const pdfParser = new PDFParse({ data: buffer });
        const parsedRes = await pdfParser.getText();
        const parsedText = typeof parsedRes === 'string' ? parsedRes : (parsedRes?.text || '');
        if (parsedText && parsedText.trim().length > 20) {
          extractedText = parsedText;
          methodUsed = 'PDF_PARSE_LIBRARY';
        }
      } catch (pdfErr) {
        console.warn('Echec pdf-parse modérateur :', pdfErr);
      }

      if (!extractedText || extractedText.trim().length < 20) {
        try {
          const rawFast = extractTextFromPdfBuffer(buffer);
          const cleanFast = rawFast.replace(/[\x00-\x08\x0B-\x1F\x7F-\x9F]/g, '').trim();
          if (cleanFast && cleanFast.length > 20) {
            extractedText = cleanFast;
            methodUsed = 'PDF_FAST_STREAM_EXTRACTION';
          }
        } catch (err) {
          console.warn('Extraction flux PDF natif modérateur :', err);
        }
      }

      // Si document PDF scanné sans flux texte natif
      if (!extractedText || extractedText.trim().length < 20) {
        try {
          const { PDFParse } = require('pdf-parse');
          const pdfParser = new PDFParse({ data: buffer });
          const screen = await pdfParser.getScreenshot({ page: 1 });
          if (screen?.pages?.[0]?.data) {
            const imgBuf = Buffer.from(screen.pages[0].data);
            const trainedDataPath = path.join(process.cwd(), 'fra.traineddata');
            const worker = await createWorker('fra', 1, {
              langPath: fs.existsSync(trainedDataPath) ? process.cwd() : undefined,
              cachePath: process.cwd(),
            });
            const ocrResult = await worker.recognize(imgBuf);
            if (ocrResult?.data?.text && ocrResult.data.text.trim().length > 10) {
              extractedText = ocrResult.data.text;
              methodUsed = 'PDF_SCREENSHOT_TESSERACT_OCR';
            }
            await worker.terminate();
          }
        } catch (pdfOcrErr) {
          console.warn('Echec OCR sur rendu PDF scanné modérateur :', pdfOcrErr);
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

          const worker = await createWorker('fra', 1, {
            langPath: fs.existsSync(trainedDataPath) ? process.cwd() : undefined,
            cachePath: process.cwd(),
          });
          const ocrResult = await worker.recognize(buffer);
          if (ocrResult?.data?.text) {
            extractedText = ocrResult.data.text;
          }
          await worker.terminate();
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
