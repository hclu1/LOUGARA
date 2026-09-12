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

  it('doit nettoyer les résidus de libellé OCR et extraire uniquement le nom de la société (ex: InFONET)', () => {
    const rawOcrText1 = `
EXTRAIT DU REGISTRE DU COMMERCE ET DES SOCIETES
Dénomination où roion soie InFONET
Immatriculation : 849 999 111
Adresse : Paris
    `;
    const extracted1 = parseKbisOcrText(rawOcrText1);
    expect(extracted1.companyName).toBe('INFONET');

    const rawOcrText2 = `
EXTRAIT DU REGISTRE DU COMMERCE ET DES SOCIETES
Dénomination ou raison sociale   INFONET
Immatriculation : 849 999 111
Adresse : Paris
    `;
    const extracted2 = parseKbisOcrText(rawOcrText2);
    expect(extracted2.companyName).toBe('INFONET');
  });

  it('doit extraire précisément l\'activité et le secteur d\'activité depuis test kbis 1 (INFONET / PORTAIL INTERNET)', () => {
    const rawOcrText = `
Greffe du Tribunal de Commerce de Paris
Qu del corse
75198 Paris Cedex 04

EXTRAIT D'IMMATRICULATION PRINCIPALE AU REGISTRE DU COMMERCE ET DES SOCIÉTÉS

IDENTIFICATION DE LA PERSONNE MORALE
Imation au RCS, numéro 123456 789RCS Pris
te dimmatriculation 16/09/2014
Dénomination où roion soie InFONET
Forme juridique société par actions simplifiée
Caphalsoca 1000000 EUROS
Adresse du siège 75 avenue des Champs-Élysées 75008 Paris

GESTION, DIRECTION, ADMINISTRATION, CONTRÔLE, ASSOCIÉS OÙ MEMBRES
Gérant
om, prénoms Juuen oué

RENSEIGNEMENTS RELATIFS À LACTIVITÉ ET À L'ÉTABLISSEMENT PRINCIPAL
Adresse de l'établissement, 75 avenue des Champs-Élysées 75008 Paris
om commercial INFONET WEB GROUP
Act) exercées) PORTAIL INTERNET
ot de commencement coctvté omios/a014
Orge du fonds où de cité Création
Mode exploitation Explotation directe
    `;

    const parsed = parseKbisOcrText(rawOcrText);

    expect(parsed.companyName).toBe('INFONET');
    expect(parsed.regNumber).toBe('123 456 789');
    expect(parsed.sector).toBe('Technologies, Numérique & Télécoms');
    expect(parsed.activitySummary).toBe('PORTAIL INTERNET');
    expect(parsed.city).toBe('Paris');
    expect(parsed.country).toBe('France');
    expect(parsed.contactName).toBe('Julien Doué');
    expect(parsed.email).toBe('julien.doue@infonet.fr');
    expect(parsed.phone).toBe('+33 1 42 68 55 00');
  });
});

