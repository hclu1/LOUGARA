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
      const cleanPath = filePath.trim().replace(/^["']|["']$/g, '');
      fileName = path.basename(cleanPath).toLowerCase();

      if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
        try {
          const res = await fetch(cleanPath);
          if (res.ok) {
            const ab = await res.arrayBuffer();
            buffer = Buffer.from(ab);
            fileSizeStr = `${(buffer.length / 1024 / 1024).toFixed(2)} Mo`;
          }
        } catch (e) {
          console.warn('Erreur fetch URL document:', e);
        }
      } else if (fs.existsSync(cleanPath)) {
        try {
          buffer = fs.readFileSync(cleanPath);
          fileSizeStr = `${(buffer.length / 1024 / 1024).toFixed(2)} Mo`;
        } catch (e) {
          console.warn('Erreur lecture chemin local:', e);
        }
      } else {
        const localRelative = path.join(process.cwd(), 'public', cleanPath.replace(/^[\/\\]+/, ''));
        if (fs.existsSync(localRelative)) {
          try {
            buffer = fs.readFileSync(localRelative);
            fileSizeStr = `${(buffer.length / 1024 / 1024).toFixed(2)} Mo`;
          } catch (e) {}
        }
      }

      if (!buffer) {
        return NextResponse.json({
          success: false,
          error: "Le document est introuvable au chemin indiqué. Veuillez glisser-déposer le document directement dans la zone de dépôt (PDF, PNG, JPG).",
        }, { status: 404 });
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

    const isPdf = Boolean((file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) || fileName.endsWith('.pdf'));

    // 1. SI FICHIER PDF : Extraction de haute précision via pdf-parse
    if (isPdf) {
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
        console.warn('Echec pdf-parse :', pdfErr);
      }

      // 1.b Extraction flux natif brut si pdf-parse a échoué (nettoyé des octets nuls)
      if (!extractedText || extractedText.trim().length < 20) {
        try {
          const rawFast = extractTextFromPdfBuffer(buffer);
          const cleanFast = rawFast.replace(/[\x00-\x08\x0B-\x1F\x7F-\x9F]/g, '').trim();
          if (cleanFast && cleanFast.length > 20) {
            extractedText = cleanFast;
            methodUsed = 'PDF_FAST_STREAM_EXTRACTION';
          }
        } catch (err) {
          console.warn('Extraction flux PDF natif :', err);
        }
      }

      // 1.b Si PDF scanné (sans texte natif), rendu image de la page 1 et Tesseract OCR
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
          console.warn('Echec OCR sur rendu PDF scanné :', pdfOcrErr);
        }
      }
    } else {
      // 2. SI FICHIER IMAGE : Tesseract OCR serveur avec fra.traineddata
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
        console.warn('Echec Tesseract OCR serveur :', ocrErr?.message);
      }
    }

    // Si le serveur n'a pas pu extraire de texte exploitable
    if (!extractedText || extractedText.trim().length < 10) {
      return NextResponse.json({
        success: false,
        error: "Impossible d'extraire le texte du document (document protégé, vide ou image trop dégradée). Veuillez renseigner manuellement vos informations d'entreprise.",
      }, { status: 422 });
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
