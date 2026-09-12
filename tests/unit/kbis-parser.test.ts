import { describe, it, expect } from 'vitest';
import { parseKbisOcrText } from '../../src/features/ocr/kbis-parser';

describe('Analyseur OCR Kbis & RCCM (Données Réelles)', () => {
  it('doit extraire les vraies informations d\'un Kbis français', () => {
    const rawOcrText = `
EXTRAIT DU REGISTRE DU COMMERCE ET DES SOCIETES
Greffe du Tribunal de Commerce de Paris
IDENTIFICATION DE LA PERSONNE MORALE
Immatriculation au RCS, numéro : 849 123 456 R.C.S. Paris
Dénomination : BIO NATURE IMPORT SAS
Forme juridique : Société par actions simplifiée
Capital social : 15 000,00 Euros
Adresse du siège : 24 Rue de la République 75011 Paris
Activités principales : Importation et distribution de cosmétiques naturels et huiles végétales
GESTION, DIRECTION, ADMINISTRATION
Président : M. Thomas Martin né le 12/04/1982 à Bordeaux
    `;

    const extracted = parseKbisOcrText(rawOcrText);

    expect(extracted.companyName).toBe('BIO NATURE IMPORT SAS');
    expect(extracted.regNumber).toBe('849 123 456');
    expect(extracted.country).toBe('France');
    expect(extracted.city).toBe('Paris');
    expect(extracted.sector).toBe('Cosmétique & Soins');
    expect(extracted.contactName).toContain('Thomas Martin');
  });

  it('doit extraire les vraies informations d\'un RCCM africain (Sénégal)', () => {
    const rawOcrText = `
REPUBLIQUE DU SENEGAL
TRIBUNAL DE COMMERCE HORS CLASSE DE DAKAR
REGISTRE DU COMMERCE ET DU CREDIT MOBILIER
Numéro RCCM : SN-DKR-2022-B-9912
NINEA : 008765432 2V1
Dénomination sociale : DAKAR AGRO EXPORT SUARL
Siège social : Route de Rufisque, Km 14, Dakar
Activité : Commerce de gros de produits agricoles, arachide et fèves de cacao
ADMINISTRATEUR / GERANT
Gérant : M. Cheikh Ndiaye
    `;

    const extracted = parseKbisOcrText(rawOcrText);

    expect(extracted.companyName).toBe('DAKAR AGRO EXPORT SUARL');
    expect(extracted.regNumber).toBe('SN-DKR-2022-B-9912');
    expect(extracted.country).toBe('Sénégal');
    expect(extracted.city).toBe('Dakar');
    expect(extracted.sector).toBe('Agroalimentaire & Épices');
    expect(extracted.contactName).toContain('Cheikh Ndiaye');
  });
});
