import { describe, it, expect } from 'vitest';
import { extractTextFromPdfBuffer } from '../../src/features/ocr/pdf-extractor';
import { parseKbisOcrText } from '../../src/features/ocr/kbis-parser';

describe('Extraction Rapide PDF Kbis', () => {
  it('doit extraire le texte d\'un flux PDF basique', () => {
    const fakePdf = Buffer.from(
      '%PDF-1.4\nstream\nBT /F1 12 Tf (RCS PARIS 849 123 456) Tj (BIO NATURE SAS) Tj ET\nendstream\n%%EOF'
    );
    const text = extractTextFromPdfBuffer(fakePdf);
    expect(text).toContain('RCS PARIS 849 123 456');
    expect(text).toContain('BIO NATURE SAS');
  });

  it('doit extraire les vraies données d\'un Kbis extrait de PDF', () => {
    const kbisPdfExtractedText = `
RCS PARIS B 849 123 456
EXTRAIT D'IMMATRICULATION PRINCIPALE AU REGISTRE DU COMMERCE ET DES SOCIETES
Dénomination sociale : PHARMA PLANTES EXPORT SAS
Capital social : 50 000,00 EUROS
Adresse du siège : 12 Avenue des Champs-Elysées 75008 Paris
Activité principale : Commerce de gros de matières premières végétales, karité et cosmétiques
Président : M. Jean-Luc Dupont
    `;
    const parsed = parseKbisOcrText(kbisPdfExtractedText);
    expect(parsed.companyName).toBe('PHARMA PLANTES EXPORT SAS');
    expect(parsed.regNumber).toBe('849 123 456');
    expect(parsed.city).toBe('Paris');
    expect(parsed.country).toBe('France');
    expect(parsed.sector).toBe('Cosmétique & Soins');
    expect(parsed.contactName).toContain('Jean-Luc Dupont');
  });
});
