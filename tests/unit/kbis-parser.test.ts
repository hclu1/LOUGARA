import { describe, it, expect } from 'vitest';
import { parseKbisOcrText, cleanCompanyName, cleanContactName } from '../../src/features/ocr/kbis-parser';

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
    expect(extracted.taxNumber).toBe('008765432 2V1');
    expect(extracted.country).toBe('Sénégal');
    expect(extracted.city).toBe('Dakar');
    expect(extracted.sector).toBe('Agroalimentaire & Épices');
    expect(extracted.contactName).toContain('Cheikh Ndiaye');
  });

  it('doit extraire les informations d\'un document d\'immatriculation de Côte d\'Ivoire (RCCM & NCC)', () => {
    const rawOcrText = `
RÉPUBLIQUE DE CÔTE D'IVOIRE
TRIBUNAL DE COMMERCE D'ABIDJAN - CEPICI
REGISTRE DU COMMERCE ET DU CRÉDIT MOBILIER (RCCM)
N° RCCM : CI-ABJ-2022-B-08941
Numéro de Compte Contribuable (NCC) : 2210459 Z
Dénomination Sociale : Ivoire Trading & Sourcing SA
Siège Social : Abidjan Marcory, Boulevard Giscard d'Estaing
Objet Social : Négoce, Import-Export, Sourcing, Distribution
Administrateur Général : Monsieur Koffi Konan
    `;

    const extracted = parseKbisOcrText(rawOcrText);

    expect(extracted.companyName).toBe('IVOIRE TRADING & SOURCING SA');
    expect(extracted.regNumber).toBe('CI-ABJ-2022-B-08941');
    expect(extracted.taxNumber).toBe('2210459 Z');
    expect(extracted.country).toBe('Côte d\'Ivoire');
    expect(extracted.city).toBe('Abidjan');
    expect(extracted.sector).toBe('Négoce & Commerce Général');
    expect(extracted.contactName).toContain('Koffi Konan');
  });

  it('doit extraire les informations d\'un document du Cameroun (NIU & RCCM)', () => {
    const rawOcrText = `
RÉPUBLIQUE DU CAMEROUN
DIRECTION GÉNÉRALE DES IMPÔTS
ATTESTATION D'IMMATRICULATION FISCALE
Désignation du Contribuable : Cameroon Agro & Trade SARL
Numéro d'Identifiant Unique (NIU) : M012114589234A
Numéro d'Immatriculation RCCM : RC/DLA/2021/B/3412
Adresse : Douala, Cameroun
Activité Principale : Commerce de produits agricoles et cacao
Gérant : Moussa Ibrahim
    `;

    const extracted = parseKbisOcrText(rawOcrText);

    expect(extracted.companyName).toBe('CAMEROON AGRO & TRADE SARL');
    expect(extracted.taxNumber).toBe('M012114589234A');
    expect(extracted.regNumber).toBe('RC/DLA/2021/B/3412');
    expect(extracted.country).toBe('Cameroun');
    expect(extracted.city).toBe('Douala');
    expect(extracted.sector).toBe('Agroalimentaire & Épices');
    expect(extracted.contactName).toBe('Moussa Ibrahim');
  });

  it('doit extraire les informations d\'une Attestation d\'Identification Nationale (ID. NAT.) de RDC', () => {
    const rawOcrText = `
RÉPUBLIQUE DÉMOCRATIQUE DU CONGO
MINISTÈRE DE L'ÉCONOMIE NATIONALE
ATTESTATION D'IDENTIFICATION NATIONALE (ID. NAT.)
Délivrée à la société: Congo Mining & Logistics SARL
Numéro d'Identification Nationale (ID. NAT.): 01-93-N48152B
Forme Juridique: Societé à Responsabilité Limitée (SARL)
Lieu de Délivrance: Kinshasa, RDC
Date de Délivrance: 21 Octobre 2023
    `;

    const extracted = parseKbisOcrText(rawOcrText);

    expect(extracted.companyName).toBe('CONGO MINING & LOGISTICS SARL');
    expect(extracted.taxNumber).toBe('01-93-N48152B');
    expect(extracted.regNumber).toBe('01-93-N48152B');
    expect(extracted.country).toBe('RDC');
    expect(extracted.city).toBe('Kinshasa');
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
    expect(parsed.contactName).toBe('JULIEN DUPÉ');
    expect(parsed.email).toBeUndefined();
    expect(parsed.phone).toBeUndefined();
  });

  it('doit extraire l\'email et le téléphone UNIQUEMENT s\'ils sont présents dans le document', () => {
    const rawWithContacts = `
EXTRAIT DU REGISTRE DU COMMERCE
Dénomination : SAHEL LOGISTIQUE SAS
Immatriculation : SN-DKR-2023-B-1234
Gérant : M. Amadou Ba
Email : contact@sahel-logistique.sn
Téléphone : +221 77 123 45 67
Activité : Transport et fret maritime
    `;

    const parsed = parseKbisOcrText(rawWithContacts);
    expect(parsed.contactName).toBe('Amadou Ba');
    expect(parsed.email).toBe('contact@sahel-logistique.sn');
    expect(parsed.phone).toBe('+221 77 123 45 67');
  });

  it('doit extraire le nom du dirigeant sur les formats RCCM complexes (Nom et prénoms du gérant, multi-lignes, titulaire)', () => {
    // Test 1: Nom et prénoms du gérant
    const doc1 = `
REGISTRE DU COMMERCE ET DU CREDIT MOBILIER
Numéro RCCM : CI-ABJ-2021-B-12345
Dénomination : IVOIRE DISTRIBUTION SARL
Nom et prénoms du gérant : KOUASSI Jean-Baptiste, né le 14/05/1980 à Abidjan
    `;
    const parsed1 = parseKbisOcrText(doc1);
    expect(parsed1.contactName).toBe('Kouassi Jean-Baptiste');

    // Test 2: Représentant légal avec nationalité et CNI
    const doc2 = `
GREFFE DU TRIBUNAL DE COMMERCE
Dénomination : ATLAS TRADING SA
Représentant légal : Mme Amina Diop - Nationalité : Sénégalaise (CNI N° 123456789)
    `;
    const parsed2 = parseKbisOcrText(doc2);
    expect(parsed2.contactName).toBe('Amina Diop');

    // Test 3: Multi-lignes NOM et PRÉNOMS
    const doc3 = `
EXTRAIT D'IMMATRICULATION
Dénomination : SENEGAL AGRO EXPORT
NOM : DIOP
PRÉNOMS : Cheikh Tidiane
    `;
    const parsed3 = parseKbisOcrText(doc3);
    expect(parsed3.contactName).toContain('Cheikh Tidiane');
  });

  it('doit nettoyer les préfixes complexes "/ NOM :" et caractères parasites en début de raison sociale', () => {
    expect(cleanCompanyName('     / NOM : IVOIRE TRADING & SOURCING SA')).toBe('IVOIRE TRADING & SOURCING SA');
    expect(cleanCompanyName('/ NOM : IVOIRE TRADING & SOURCING SA')).toBe('IVOIRE TRADING & SOURCING SA');
    expect(cleanCompanyName('NOM / RAISON SOCIALE : IVOIRE TRADING & SOURCING SA')).toBe('IVOIRE TRADING & SOURCING SA');
    expect(cleanCompanyName(' - NOM : IVOIRE TRADING & SOURCING SA')).toBe('IVOIRE TRADING & SOURCING SA');

    const rawOcrText = `
RÉPUBLIQUE DE CÔTE D'IVOIRE
TRIBUNAL DE COMMERCE D'ABIDJAN - CEPICI
REGISTRE DU COMMERCE ET DU CRÉDIT MOBILIER (RCCM)
N° RCCM : CI-ABJ-2022-B-08941
Numéro de Compte Contribuable (NCC) : 2210459 Z
     / NOM : IVOIRE TRADING & SOURCING SA
Siège Social : Abidjan Marcory, Boulevard Giscard d'Estaing
Objet Social : Négoce, Import-Export, Sourcing, Distribution
Administrateur Général : Monsieur Koffi Konan
    `;

    const extracted = parseKbisOcrText(rawOcrText);
    expect(extracted.companyName).toBe('IVOIRE TRADING & SOURCING SA');
  });

  it('doit nettoyer les parenthèses orphelines et espaces superflus sur le nom du dirigeant (ex: BENJELLOUN KARIM ()', () => {
    expect(cleanContactName('     BENJELLOUN KARIM (  ')).toBe('BENJELLOUN KARIM');
    expect(cleanContactName('Gérant : BENJELLOUN KARIM ( né le 15/03/1975 à Casablanca')).toBe('BENJELLOUN KARIM');
    expect(cleanContactName('Représentant Légal : BENJELLOUN KARIM ( ')).toBe('BENJELLOUN KARIM');

    const rawOcrText = `
EXTRAIT DU REGISTRE DU COMMERCE
Dénomination : ATLAS PHARMA SARL
Numéro RC : RC 123456
Gérant : BENJELLOUN KARIM ( né le 15/03/1975 à Casablanca)
    `;
    const parsed = parseKbisOcrText(rawOcrText);
    expect(parsed.contactName).toBe('BENJELLOUN KARIM');
  });
});
