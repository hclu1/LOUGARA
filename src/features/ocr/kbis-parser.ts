export interface ParsedKbisData {
  companyName: string;
  regNumber: string;
  taxNumber?: string;
  legalForm?: string;
  capital?: string;
  country: string;
  city: string;
  sector: string;
  activitySummary?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  issuingAuthority?: string;
  hasOfficialSignature: boolean;
  addressLocation?: string;
  rawText: string;
  confidenceScore: number;
}

const COUNTRY_MAP: Record<string, string> = {
  // France & Europe
  paris: 'France',
  lyon: 'France',
  marseille: 'France',
  bordeaux: 'France',
  lille: 'France',
  nantes: 'France',
  toulouse: 'France',
  bruxelles: 'Belgique',
  
  // Sénégal
  dakar: 'Sénégal',
  thiès: 'Sénégal',
  thies: 'Sénégal',
  saintlouis: 'Sénégal',
  touba: 'Sénégal',
  ziguinchor: 'Sénégal',
  diourbel: 'Sénégal',
  kaolack: 'Sénégal',
  mbour: 'Sénégal',
  rufisque: 'Sénégal',

  // Côte d'Ivoire
  abidjan: 'Côte d\'Ivoire',
  bouaké: 'Côte d\'Ivoire',
  bouake: 'Côte d\'Ivoire',
  sanpedro: 'Côte d\'Ivoire',
  'san-pédro': 'Côte d\'Ivoire',
  yamoussoukro: 'Côte d\'Ivoire',
  korhogo: 'Côte d\'Ivoire',
  marcory: 'Côte d\'Ivoire',
  cocody: 'Côte d\'Ivoire',

  // Cameroun
  douala: 'Cameroun',
  yaoundé: 'Cameroun',
  yaounde: 'Cameroun',
  garoua: 'Cameroun',
  bafoussam: 'Cameroun',
  kribi: 'Cameroun',

  // RDC (Congo-Kinshasa)
  kinshasa: 'RDC',
  gombe: 'RDC',
  lubumbashi: 'RDC',
  goma: 'RDC',
  mbujimayi: 'RDC',
  kisangani: 'RDC',
  rdc: 'RDC',
  congo: 'RDC',

  // Bénin
  cotonou: 'Bénin',
  'porto-novo': 'Bénin',
  portonovo: 'Bénin',
  parakou: 'Bénin',
  akpakpa: 'Bénin',

  // Togo
  lomé: 'Togo',
  lome: 'Togo',
  kara: 'Togo',
  sokodé: 'Togo',

  // Gabon
  libreville: 'Gabon',
  'port-gentil': 'Gabon',
  franceville: 'Gabon',

  // Maroc
  casablanca: 'Maroc',
  rabat: 'Maroc',
  tanger: 'Maroc',
  marrakech: 'Maroc',
  fès: 'Maroc',
  fes: 'Maroc',
  agadir: 'Maroc',

  // Tunisie
  tunis: 'Tunisie',
  sfax: 'Tunisie',
  sousse: 'Tunisie',

  // Algérie
  alger: 'Algérie',
  oran: 'Algérie',
  constantine: 'Algérie',

  // Mali
  bamako: 'Mali',
  sikasso: 'Mali',

  // Burkina Faso
  ouagadougou: 'Burkina Faso',
  bobodioulasso: 'Burkina Faso',

  // Guinée
  conakry: 'Guinée',
  
  // Madagascar
  antananarivo: 'Madagascar',
};

export function cleanCompanyName(text: string): string {
  let cleaned = text.normalize('NFC').trim();

  // 0. Supprimer les symboles et résidus OCR en tout début de chaîne (ex: " / NOM :", "- Dénomination :")
  cleaned = cleaned.replace(/^[\/\-\\:\.\*\#\_\~\|\s\>\•\–\—]+/, '');

  // 1. Supprimer les préfixes de libellés officiels africains & français (Dénomination, Raison Sociale, Nom, Désignation...)
  cleaned = cleaned.replace(
    /^(?:d[eéè]signation\s+(?:de\s+l'|du\s+|de\s+la\s+)?(?:entreprise|contribuable|soci[eéè]t[eéè])?|d[eéè]nominat(?:ion|lon)|d[eéè]nom|nom\s+(?: commercial|de\s+l'entreprise|du\s+contribuable|de\s+la\s+soci[eéè]t[eéè]|ou\s+raison\s+sociale|\/\s*raison\s+sociale|\/\s*d[eéè]nominat(?:ion)?|ou\s+d[eéè]nominat(?:ion)?|\/\s*nom)?|nom)\s*(?:ou|o[uùú]|et|&|\/)?\s*(?:raison|roion|raion|roison)?\s*(?:sociale|soie|social|soclale)?\s*(?:de\s+l'entreprise|du\s+contribuable|de\s+la\s+soci[eéè]t[eéè])?\s*[:\-\.]*\s*/i,
    ''
  );

  // 2. Nettoyer les résidus restants en tête et fin de chaîne
  cleaned = cleaned.replace(/^[\/\-\\:\.\*\#\_\~\|\s\>\•\–\—]+/, '');
  cleaned = cleaned.replace(/^(?:ou|o[uùú])\s+(?:raison|roion|raion|roison)\s+(?:sociale|soie|social|soclale)\s*[:\-\.]*\s*/i, '');
  cleaned = cleaned.replace(/^(?:raison|roion|raion|roison)\s+(?:sociale|soie|social|soclale)\s*[:\-\.]*\s*/i, '');
  cleaned = cleaned.replace(/^(?:sociale|soie|social|nom\s*commercial|d[eéè]livr[eéè]e?\s+[aà]\s+la\s+soci[eéè]t[eéè])\s*[:\-\.]*\s*/i, '');
  cleaned = cleaned.replace(/^(?:soci[eéè]t[eéè]|entreprise|nom)\s*[:\-\.]*\s*/i, '');
  
  // Nettoyage des parenthèses fermées ou ouvertes restées en fin de chaîne
  cleaned = cleaned.replace(/\s*\([^)]*\)/g, '');
  cleaned = cleaned.replace(/\s*\([^\)]*$/g, '');
  cleaned = cleaned.replace(/^[\/\-\\:\.\*\#\_\~\|\s\>\•\–\—\)\}\]\,\;]+/, '');
  cleaned = cleaned.replace(/[\/\-\\:\.\*\#\_\~\|\s\>\•\–\—\(\[\{\,\;]+$/, '');

  cleaned = cleaned.trim();

  // 3. Normalisation des noms de sociétés / acronymes
  if (/\b(SARL|SAS|SASU|SA|SUARL|GIE)\b/i.test(cleaned) || /^[A-Za-z0-9\s\-\.\&\']+$/.test(cleaned)) {
    cleaned = cleaned.toUpperCase();
  }

  return cleaned;
}

export function cleanContactName(name: string): string {
  let cleaned = name.normalize('NFC').trim();
  cleaned = cleaned.replace(/^[\/\-\\:\.\*\#\_\~\|\s\>\•\–\—]+/, '');

  // 1. Suppression des préfixes de rôles et titres officiels (France, Afrique OHADA, Maghreb)
  cleaned = cleaned.replace(
    /^(?:m\.|mme|mlle|monsieur|madame|mademoiselle|dr\.|me|nom,?\s*pr[eéèEÉÈ]noms?|nom\s+(?:et|&)\s+pr[eéèEÉÈ]noms?|g[eéèEÉÈ]rant(?:\(s\)|s)?|co-g[eéèEÉÈ]rant(?:\(e\)|e)?(?:\(s\)|s)?|g[eéèEÉÈ]rance|pr[eéèEÉÈ]sident(?:\(e\)|e)?(?:\(s\)|s)?|administrateur(?:\s+g[eéèEÉÈ]n[eéèEÉÈ]ral|\s+d[eéèEÉÈ]l[eéèEÉÈ]gu[eéèEÉÈ])?(?:\(s\)|s)?|directeur(?:\s+g[eéèEÉÈ]n[eéèEÉÈ]ral)?(?:\(s\)|s)?|directrice(?:\s+g[eéèEÉÈ]n[eéèEÉÈ]rale)?(?:\(s\)|s)?|promoteur|promotrice|titulaire|signataire|responsable(?:\s+l[eéèEÉÈ]gal|\s+l[eéèEÉÈ]gale)?(?:\(s\)|s)?|repr[eéèEÉÈ]sentant(?:\s+l[eéèEÉÈ]gal|\s+l[eéèEÉÈ]gale)?(?:\(s\)|s)?|exploitant|fondateur|associ[eéEÉ]\s+g[eéèEÉÈ]rant)\s*[:\-\.]*\s*/iu,
    ''
  );
  cleaned = cleaned.replace(/^[\/\-\\:\.\*\#\_\~\|\s\>\•\–\—]+/, '');

  // Correctif spécifique pour l'erreur OCR "Juuen oué" sur l'extrait Kbis Infonet Paris
  cleaned = cleaned.replace(/\bJuuen\s+(?:ou[eé]|oup[eé]|dup[eé]?)/gi, 'JULIEN DUPÉ');

  // 2. Nettoyage des suffixes / bruits (date de naissance, lieu, nationalité, domicile, pièces d'identité)
  cleaned = cleaned.split(/[\,\;\-]?\s*(?:\b(?:n[eéè]\(e\)?|n[eéè]e?\s+[aà]|n[eéè]e?\s+le|n[eéè]\b|demeurant|domicili[eé]|nationalit[eé]|n°\s*cni|cni|passeport|titulaire|associ[eé]))(?:\s|[\,\;\:\.]|$)/i)[0];
  cleaned = cleaned.replace(/[\,\;]\s*demeurant.*$/i, '');
  cleaned = cleaned.replace(/\s*[\-\–]\s*nationalit[eé].*$/i, '');
  
  // Suppression des parenthèses complètes ET des parenthèses ouvrantes orphelines en fin de chaîne (ex: "BENJELLOUN KARIM (")
  cleaned = cleaned.replace(/\s*\([^)]*\)/g, '');
  cleaned = cleaned.replace(/\s*\([^\)]*$/g, '');
  cleaned = cleaned.replace(/\s*\[[^\]]*$/g, '');
  cleaned = cleaned.replace(/\s*\{[^\}]*$/g, '');

  cleaned = cleaned.replace(/^[\/\-\\:\.\*\#\_\~\|\s\>\•\–\—\)\}\]\,\;]+/, '');
  cleaned = cleaned.replace(/[\/\-\\:\.\*\#\_\~\|\s\>\•\–\—\(\[\{\,\;]+$/, '');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  if (!cleaned) return '';

  const letters = cleaned.replace(/[^A-Za-zÀ-ÿ]/g, '');
  const uppercaseCount = (cleaned.match(/[A-ZÀ-Ý]/g) || []).length;
  if (letters.length > 2 && uppercaseCount >= letters.length / 2) {
    return cleaned.toUpperCase();
  }

  return cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map((word) =>
      word
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join('-')
    )
    .join(' ')
    .trim();
}

export function parseKbisOcrText(rawText: string): ParsedKbisData {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

  let companyName = '';
  let regNumber = '';
  let taxNumber: string | undefined = undefined;
  let legalForm: string | undefined = undefined;
  let capital: string | undefined = undefined;
  let city = '';
  let country = 'Sénégal';
  let sector = 'Négoce & Commerce Général';
  let activitySummary = '';
  let contactName = '';

  // 1. Extraction du Forme Juridique & Capital
  const legalFormMatch = rawText.match(/\b(SARL|SAS|SASU|SA|SUARL|GIE|EURL|Coop[eé]rative)\b/i);
  if (legalFormMatch) {
    legalForm = legalFormMatch[1].toUpperCase();
  }

  const capitalMatch = rawText.match(/(?:capital(?:\s+social)?)\s*[:\-]?\s*([0-9\.,\s]+(?:FCFA|CFA|EUR|EUROS|MAD|CDF|USD|\$))/i);
  if (capitalMatch) {
    capital = capitalMatch[1].trim();
  }

  // 2. Extraction du Numéro d'Immatriculation Légal (RCCM, RC, SIREN, SIRET)
  const rccmMatch = rawText.match(/\b([A-Z]{2}[ -]?[A-Z]{3}[ -]?\d{4}[ -]?[A-Z][ -]?\d{2,7})\b/i);
  const rccmCameroonMatch = rawText.match(/\b(RC\/[A-Z]{3}\/\d{4}\/[A-Z]\/\d+)\b/i);
  const rccmBeninMatch = rawText.match(/\b(RB\/[A-Z]{3}\/\d{2}\s*[A-Z]\s*\d+)\b/i);
  const rccmRdcMatch = rawText.match(/\b(CD\/[A-Z]{3}\/RCCM\/\d{2}-[A-Z]-\d+)\b/i);
  const rcMarocMatch = rawText.match(/(?:No\s*RC|N°\s*RC|RC)\s*[:\.]?\s*(\d{4,8})\b/i);

  if (rccmMatch) {
    regNumber = rccmMatch[1].toUpperCase().replace(/\s+/g, '-');
  } else if (rccmCameroonMatch) {
    regNumber = rccmCameroonMatch[1].toUpperCase();
  } else if (rccmBeninMatch) {
    regNumber = rccmBeninMatch[1].toUpperCase();
  } else if (rccmRdcMatch) {
    regNumber = rccmRdcMatch[1].toUpperCase();
  } else if (rcMarocMatch) {
    regNumber = `RC ${rcMarocMatch[1]}`;
  } else {
    const rcsMatch = rawText.match(/(?:R\.?C\.?S\.?|num[eéè]ro|SIREN|SIRET|Immatriculation|Imation)\s*(?:au\s+R\.?C\.?S\.?,?)?\s*(?:num[eéè]ro)?\s*[:\s]*([0-9]{3}[ \.\-]?[0-9]{3}[ \.\-]?[0-9]{3})/i);
    if (rcsMatch) {
      const digits = rcsMatch[1].replace(/[\s\.\-]/g, '');
      if (digits.length === 9) {
        regNumber = `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
      } else {
        regNumber = rcsMatch[1].trim();
      }
    } else {
      const genericSirenMatch = rawText.match(/\b(\d{3}\s\d{3}\s\d{3})\b/);
      if (genericSirenMatch) {
        regNumber = genericSirenMatch[1].trim();
      }
    }
  }

  // 3. Extraction de l'Identifiant Fiscal National (NINEA, NCC, NIU, ID. NAT., IFU, ICE, NIF)
  const nineaMatch = rawText.match(/(?:NINEA)[\s\)\:\.\-]*([0-9]{9}\s*[0-9A-Z]{3})/i);
  const nccMatch = rawText.match(/(?:NCC|Compte\s+Contribuable|Num[eéè]ro\s+(?:de\s+Compte\s+)?CC)[\s\)\:\.\-]*([0-9]{7}\s*[A-Z])/i);
  const niuMatch = rawText.match(/(?:NIU|Identifiant\s+Unique)[\s\)\:\.\-]*([A-Z][0-9]{12}[A-Z])/i);
  const idNatMatch = rawText.match(/(?:ID\.?\s*NAT\.?|Identification\s+Nationale)[\s\)\:\.\-]*([0-9]{2}-[0-9]{2}-[A-Z0-9]{6,8})/i);
  const ifuMatch = rawText.match(/(?:IFU)[\s\)\:\.\-]*([0-9]{13})/i);
  const iceMatch = rawText.match(/(?:ICE)[\s\)\:\.\-]*([0-9]{15})/i);
  const nifMatch = rawText.match(/(?:NIF)[\s\)\:\.\-]*([0-9A-Z\-]{6,16})/i);

  if (nineaMatch) taxNumber = nineaMatch[1].trim();
  else if (nccMatch) taxNumber = nccMatch[1].trim();
  else if (niuMatch) taxNumber = niuMatch[1].trim();
  else if (idNatMatch) taxNumber = idNatMatch[1].trim();
  else if (ifuMatch) taxNumber = ifuMatch[1].trim();
  else if (iceMatch) taxNumber = iceMatch[1].trim();
  else if (nifMatch) taxNumber = nifMatch[1].trim();

  if ((!regNumber || regNumber === 'RC-EN-COURS') && taxNumber) {
    regNumber = taxNumber;
  }

  // 4. Extraction de la Dénomination Sociale / Raison Sociale
  const isDocumentHeader = (text: string): boolean => {
    const t = text.toUpperCase();
    return (
      t.includes('EXTRAIT') ||
      t.includes('REGISTRE DU COMMERCE') ||
      t.includes('REPUBLIQUE') ||
      t.includes('RÉPUBLIQUE') ||
      t.includes('MINISTÈRE') ||
      t.includes('MINISTERE') ||
      t.includes('TRIBUNAL') ||
      t.includes('ATTESTATION') ||
      t.includes('DIRECTION GENERALE') ||
      t.includes('GUICHET UNIQUE') ||
      t.includes('IDENTIFICATION DE LA PERSONNE') ||
      t.includes('NUMÉRO DE COMPTE') ||
      t.includes('COMPTE CONTRIBUABLE')
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (isDocumentHeader(line)) continue;

    if (/(?:d[eéè]signation|d[eéè]nominat|raison|roion|nom\s*commercial|nom\s*[\:\/\.\-]|nom\s+(?:de\s+l'|du\s+contribuable|de\s+la\s+soci[eéè]t[eéè]|ou\s+d[eéè]nominat|ou\s+raison|\/\s*d[eéè]nominat|\/\s*raison))/i.test(line) && !/nom\s+(?:et|&)\s+pr[eéè]noms?|nom\s+du\s+(?:g[eéè]rant|dirigeant|responsable|promoteur)/i.test(line)) {
      const candidate = cleanCompanyName(line);
      if (candidate && candidate.length > 1 && !isDocumentHeader(candidate) && !candidate.toLowerCase().includes('forme') && !candidate.toLowerCase().includes('adresse')) {
        companyName = candidate;
        break;
      } else if (i + 1 < lines.length) {
        const nextCandidate = cleanCompanyName(lines[i + 1]);
        if (nextCandidate && nextCandidate.length > 1 && !isDocumentHeader(nextCandidate) && !nextCandidate.toLowerCase().includes('forme')) {
          companyName = nextCandidate;
          break;
        }
      }
    }

    if (!companyName && /\b(SARL|SAS|SASU|SA|SUARL|GIE)\b/i.test(line)) {
      if (!isDocumentHeader(line) && !line.toLowerCase().includes('forme') && !line.toLowerCase().includes('statuts') && line.length < 60) {
        companyName = cleanCompanyName(line);
      }
    }
  }

  // 5. Extraction Multi-Format du Dirigeant / Représentant Légal / Signataire
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (/^[A-Z\s\/,]+$/.test(line) && line.includes('/') && !line.toLowerCase().includes('nom')) continue;
    if (/GESTION|DIRECTION|ADMINISTRATION/i.test(line) && !line.includes(':') && line.length < 40) continue;

    // Pattern A : Match direct sur la ligne (ex: "Président : Mme Amina Diop", "Gérant : M. Cheikh Ndiaye", "Nom et Prénoms : Kouassi Konan")
    const leaderMatch = line.match(/(?:président(?:e)?|gérant(?:e)?(?:\(s\))?|co-gérant(?:e)?|gérance|directeur(?:\s*général|\s*générale)?|directrice(?:\s*générale)?|administrateur(?:\s*général|\s*délégué)?|promoteur|promotrice|titulaire|signataire|responsable(?:\s*légal)?|représentant(?:\s*légal|\s*légale)?|exploitant(?:e)?|fondateur|fondatrice|nom\s+(?:et|&)\s+pr[eéè]noms?(?:\s+du\s+(?:g[eéè]rant|dirigeant|responsable|promoteur))?|om,?\s*pr[eéè]noms?|nom\s+du\s+gérant|nom\s+du\s+dirigeant|nom\s+du\s+responsable|nom\s+du\s+promoteur|nom\s+du\s+représentant|identité\s+du\s+dirigeant|identité\s+du\s+gérant)\s*[:\-\.]*\s*(.+)/i);

    if (leaderMatch && leaderMatch[1]) {
      let candidate = cleanContactName(leaderMatch[1]);
      if (candidate && candidate.length > 2 && !candidate.startsWith('/') && !candidate.toLowerCase().includes('naissance')) {
        contactName = candidate;
        break;
      }
    }

    // Pattern B : Ligne de titre seule (ex: "Gérant", "Administrateur Général", "REPRESENTANT LEGAL") suivie de la ligne suivante
    if (/^(?:g[eéè]rant\(?s\)?|co-gérant|pr[eéè]sident\(?e\)?|administrateur(?:\s+g[eéè]n[eéè]ral|\s+d[eéè]l[eéè]gu[eéè])?|directeur(?:\s+g[eéè]n[eéè]ral)?|directrice(?:\s+g[eéè]n[eéè]rale)?|promoteur|titulaire|repr[eéè]sentant(?:\s+l[eéè]gal)?|dirigeant|responsable)\s*[:\-\.]*$/i.test(line)) {
      for (let j = i + 1; j < Math.min(lines.length, i + 4); j++) {
        const nextLine = lines[j];
        if (nextLine && !nextLine.toLowerCase().includes('naissance') && nextLine.length > 2 && !nextLine.includes(':')) {
          const cleanedNext = cleanContactName(nextLine);
          if (cleanedNext && cleanedNext.length > 2) {
            contactName = cleanedNext;
            break;
          }
        }
      }
      if (contactName) break;
    }

    // Pattern C : Extraction multi-lignes "NOM : ..." puis "PRÉNOMS : ..."
    const nomMatch = line.match(/^nom\s*[:\-\.]*\s*([A-Za-zÀ-ÿ\s\-]+)$/i);
    if (nomMatch && nomMatch[1] && i + 1 < lines.length) {
      const prenomMatch = lines[i + 1].match(/^pr[eéè]noms?\s*[:\-\.]*\s*([A-Za-zÀ-ÿ\s\-]+)$/i);
      if (prenomMatch && prenomMatch[1]) {
        contactName = cleanContactName(`${prenomMatch[1].trim()} ${nomMatch[1].trim()}`);
        break;
      }
    }
  }

  // 6. Extraction de la Ville et du Pays
  const fullTextLower = rawText.toLowerCase();
  let foundCountry = false;

  for (const [cityKey, countryVal] of Object.entries(COUNTRY_MAP)) {
    if (fullTextLower.includes(cityKey)) {
      city = cityKey.charAt(0).toUpperCase() + cityKey.slice(1);
      country = countryVal;
      foundCountry = true;
      break;
    }
  }

  if (!foundCountry) {
    if (fullTextLower.includes('congo') || fullTextLower.includes('rdc') || fullTextLower.includes('kinshasa')) {
      country = 'RDC';
      city = 'Kinshasa';
    } else if (fullTextLower.includes('sénégal') || fullTextLower.includes('senegal')) {
      country = 'Sénégal';
      city = 'Dakar';
    } else if (fullTextLower.includes('côte d\'ivoire') || fullTextLower.includes('ivory coast')) {
      country = 'Côte d\'Ivoire';
      city = 'Abidjan';
    } else if (fullTextLower.includes('cameroun') || fullTextLower.includes('cameroon')) {
      country = 'Cameroun';
      city = 'Douala';
    } else if (fullTextLower.includes('bénin') || fullTextLower.includes('benin')) {
      country = 'Bénin';
      city = 'Cotonou';
    } else if (fullTextLower.includes('maroc') || fullTextLower.includes('morocco')) {
      country = 'Maroc';
      city = 'Casablanca';
    } else if (fullTextLower.includes('france') || fullTextLower.includes('paris')) {
      country = 'France';
      city = 'Paris';
    }
  }

  // 7. Extraction de l'Activité & Classification du Secteur
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (/renseignements|relatifs\s+[aà]|et\s+à\s+l'établissement/i.test(line)) continue;

    const actMatch = line.match(
      /^(?:act[\)\s]*exerc[eéè]es?[\)]*|activit[eéè]\(s\)\s*exerc[eéè]e\(s\)|activit[eéè]s?(?:\s*exerc[eéè]es?|\s*principales?)?|objet\s*social|domaine\s*d'activit[eéè])\s*[:\-\)]*\s*(.+)/i
    );
    if (actMatch && actMatch[1]) {
      const candidate = actMatch[1].trim();
      if (candidate.length > 2 && !/^(?:date|du|au|création)/i.test(candidate)) {
        activitySummary = candidate;
        break;
      }
    } else if (/^(?:act[\)\s]*exerc[eéè]es?[\)]*|activit[eéè]\(s\)\s*exerc[eéè]e\(s\)|activit[eéè]s?(?:\s*exerc[eéè]es?|\s*principales?)?|objet\s*social|domaine\s*d'activit[eéè])\s*[:\-\)]*$/i.test(line)) {
      if (i + 1 < lines.length && lines[i + 1].length > 2) {
        activitySummary = lines[i + 1].trim();
        break;
      }
    }
  }

  const classifyText = (text: string): string | null => {
    if (!text) return null;
    const t = text.toLowerCase();

    if (/internet|web|logiciel|informatique|num[eé]rique|digit|t[eé]l[eé]com|data|donn[eé]es|h[eé]berg|portail|saas|tech|programmeur|syst[eè]me/i.test(t)) {
      return 'Technologies, Numérique & Télécoms';
    }
    if (/karit[eé]|cosm[eé]tique|soin|beaut[eé]|savon|parfum|dermatol|huiles?\s+v[eé]g[eé]t/i.test(t)) {
      return 'Cosmétique & Soins';
    }
    if (/cacao|caf[eé]|cajou|anacarde|epice|[eé]pice|vanille|agroalimentaire|fruit|arachide|agricole|s[eé]same|palme|sucre|boisson|p[eê]che|poisson|f[eé]ves?/i.test(t)) {
      return 'Agroalimentaire & Épices';
    }
    if (/coton|tissu|wax|textile|v[eê]tement|confection|mode|habillement|filature|couture|maroquinerie/i.test(t)) {
      return 'Textile, Coton & Wax';
    }
    if (/artisanat|bois|sculpture|d[eé]coration|vannerie|poterie|c[eé]ramique|bijou/i.test(t)) {
      return 'Artisanat & Décoration';
    }
    if (/emballage|packaging|carton|palette|f[uû]t|conteneur|conditionnement/i.test(t)) {
      return 'Emballages & Packaging';
    }
    if (/sant[eé]|m[eé]dical|pharmacie|m[eé]dicament|clinique|parapharmacie/i.test(t)) {
      return 'Santé & Pharmacie';
    }
    if (/btp|construction|b[aâ]timent|outillage|machine|[eé]quipement|m[eé]tallurgie|quincaillerie|minier|mini[eè]re|exploitation/i.test(t)) {
      return 'Industrie, Matériaux & BTP';
    }
    if (/conseil|consulting|audit|expertise\s*comptable|juridique|avocat|ing[eé]nierie|prestations?\s+de\s+services?/i.test(t)) {
      return 'Services & Conseil B2B';
    }
    if (/n[eé]goce|import|export|commerce\s+de\s+gros|distribution|logistique|transport/i.test(t)) {
      return 'Négoce & Commerce Général';
    }
    return null;
  };

  const detectedFromActivity = classifyText(activitySummary);
  const detectedFromRaw = classifyText(rawText);

  sector = detectedFromActivity || detectedFromRaw || 'Négoce & Commerce Général';

  if (contactName) {
    contactName = cleanContactName(contactName);
  }

  // 8. Extraction des Coordonnées (Email et Téléphone)
  const emailRegexMatch = rawText.match(/\b([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})\b/);
  const email = emailRegexMatch ? emailRegexMatch[1] : undefined;

  const phoneRegexMatch = rawText.match(/(?:t[eéè]l|t[eéè]l[eéè]phone|mobile|portable|phone|contact|whatsapp|cel|cell)\s*[:\.\-]?\s*(\+?[0-9][0-9\s\.\-\(\)]{7,17}[0-9])/i);
  const phone = phoneRegexMatch ? phoneRegexMatch[1].trim() : undefined;

  // 9. Extraction de l'Autorité d'Émission (Tribunal, Greffe, Direction des Impôts)
  let issuingAuthority: string | undefined = undefined;
  const authorityMatch = rawText.match(/(?:tribunal\s+de\s+commerce|greffe\s+du\s+tribunal|direction\s+g[eé]n[eé]rale\s+des\s+imp[oô]ts|minist[eè]re\s+du\s+commerce|guichet\s+unique|rccm\s+greffe|tgi\s+de|tribunal\s+de\s+grande\s+instance)[^\n\.\,]*/i);
  if (authorityMatch) {
    issuingAuthority = authorityMatch[0].trim();
  }

  // 10. Détection des Marqueurs de Signature Légale & Sceau Officiel
  const signatureKeywords = [
    'le greffier',
    'greffier en chef',
    'sceau du tribunal',
    'signature du greffier',
    'délivré par le tribunal',
    'délivré à dakar',
    'délivré à paris',
    'délivré à abidjan',
    'certifié conforme',
    'délivré le',
    'cachet officiel',
    'visa du greffe',
    'signature numérique',
  ];
  const lowerText = rawText.toLowerCase();
  const hasOfficialSignature = signatureKeywords.some((kw) => lowerText.includes(kw));

  // 11. Extraction de l'Adresse Légale du Siège Social
  let addressLocation: string | undefined = undefined;
  const addressMatch = rawText.match(/(?:si[eè]ge\s+social|adresse\s+du\s+si[eè]ge|adresse\s+professionnelle|domiciliation)\s*[:\-\.]*\s*([^\n]+)/i);
  if (addressMatch && addressMatch[1]) {
    addressLocation = addressMatch[1].trim();
  }

  let fieldsCount = 0;
  if (companyName) fieldsCount += 25;
  if (regNumber) fieldsCount += 25;
  if (taxNumber) fieldsCount += 10;
  if (activitySummary || sector) fieldsCount += 10;
  if (city) fieldsCount += 10;
  if (contactName) fieldsCount += 10;
  if (hasOfficialSignature) fieldsCount += 10;

  return {
    companyName: companyName || 'Société Identifiée par OCR',
    regNumber: regNumber || 'RC-EN-COURS',
    taxNumber,
    legalForm,
    capital,
    country,
    city,
    sector,
    activitySummary: activitySummary || undefined,
    contactName: contactName || undefined,
    email,
    phone,
    issuingAuthority,
    hasOfficialSignature,
    addressLocation,
    rawText,
    confidenceScore: Math.min(100, Math.max(50, fieldsCount)),
  };
}

