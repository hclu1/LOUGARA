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
    const filePath = formData.get('filePath') as string | null;

    if (!file && !filePath) {
      return NextResponse.json(
        { error: 'Aucun fichier ni chemin fourni pour l\'analyse OCR.' },
        { status: 400 }
      );
    }

    let buffer: Buffer | null = null;
    let fileName = '';
    let fileSizeStr = '';

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      fileName = file.name.toLowerCase();
      fileSizeStr = `${(file.size / 1024 / 1024).toFixed(2)} Mo`;
    } else if (filePath) {
      fileName = path.basename(filePath).toLowerCase();
      if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        try {
          const res = await fetch(filePath);
          if (res.ok) {
            const ab = await res.arrayBuffer();
            buffer = Buffer.from(ab);
            fileSizeStr = `${(buffer.length / 1024 / 1024).toFixed(2)} Mo`;
          }
        } catch (e) {
          console.warn('Erreur fetch URL document:', e);
        }
      } else if (fs.existsSync(filePath)) {
        try {
          buffer = fs.readFileSync(filePath);
          fileSizeStr = `${(buffer.length / 1024 / 1024).toFixed(2)} Mo`;
        } catch (e) {
          console.warn('Erreur lecture chemin local:', e);
        }
      }

      if (!buffer) {
        const baseName = path.basename(filePath);
        const parsedData = parseKbisOcrText(baseName);
        return NextResponse.json({
          success: true,
          fileName: baseName,
          filePath: filePath,
          fileSize: 'Chemin validé',
          method: 'FILE_PATH_REFERENCE',
          data: parsedData,
        });
      }
    }

    if (!buffer) {
      return NextResponse.json(
        { success: false, error: 'Fichier ou chemin de document invalide' },
        { status: 400 }
      );
    }

    let extractedText = '';
    let methodUsed = 'UNKNOWN';

    const isPdf = Boolean((file && file.type === 'application/pdf') || fileName.endsWith('.pdf'));

    // 1. SI FICHIER PDF : Extraction ultra-rapide des flux textuels natifs (< 50ms)
    if (isPdf) {
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
      fileName: file ? file.name : path.basename(filePath || 'document.pdf'),
      filePath: filePath || undefined,
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
