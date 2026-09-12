export interface ParsedKbisData {
  companyName: string;
  regNumber: string;
  country: string;
  city: string;
  sector: string;
  contactName: string;
  rawText: string;
  confidenceScore: number;
}

const COUNTRY_MAP: Record<string, string> = {
  paris: 'France',
  lyon: 'France',
  marseille: 'France',
  bordeaux: 'France',
  lille: 'France',
  nantes: 'France',
  toulouse: 'France',
  dakar: 'Sénégal',
  thiès: 'Sénégal',
  thies: 'Sénégal',
  saintlouis: 'Sénégal',
  touba: 'Sénégal',
  abidjan: 'Côte d\'Ivoire',
  bouaké: 'Côte d\'Ivoire',
  bouake: 'Côte d\'Ivoire',
  sanpedro: 'Côte d\'Ivoire',
  yamoussoukro: 'Côte d\'Ivoire',
  cotonou: 'Bénin',
  'porto-novo': 'Bénin',
  lomé: 'Togo',
  lome: 'Togo',
  douala: 'Cameroun',
  yaoundé: 'Cameroun',
  yaounde: 'Cameroun',
  bamako: 'Mali',
  antananarivo: 'Madagascar',
  bruxelles: 'Belgique',
};

export function parseKbisOcrText(rawText: string): ParsedKbisData {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

  let companyName = '';
  let regNumber = '';
  let city = '';
  let country = 'France';
  let sector = 'Cosmétique & Soins';
  let contactName = '';

  // 1. Extraction du numéro légal (SIREN/SIRET ou RCCM)
  // Recherche RCCM OHADA (ex: SN-DKR-2022-B-9912 ou CI-ABJ-2023-B-4501)
  const rccmMatch = rawText.match(/\b([A-Z]{2}[ -]?[A-Z]{3}[ -]?\d{4}[ -]?[A-Z][ -]?\d{2,6})\b/i);
  if (rccmMatch) {
    regNumber = rccmMatch[1].toUpperCase().replace(/\s+/g, '-');
  } else {
    // Recherche SIREN (9 chiffres) ou SIRET (14 chiffres) ou R.C.S.
    const rcsMatch = rawText.match(/(?:R\.?C\.?S\.?|numéro|SIREN|SIRET)\s*[:\s]*([0-9]{3}[ \.\-]?[0-9]{3}[ \.\-]?[0-9]{3})/i);
    if (rcsMatch) {
      regNumber = rcsMatch[1].trim();
    } else {
      const genericSirenMatch = rawText.match(/\b(\d{3}\s\d{3}\s\d{3})\b/);
      if (genericSirenMatch) {
        regNumber = genericSirenMatch[1].trim();
      }
    }
  }

  // 2. Extraction de la Dénomination Sociale / Raison Sociale
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Détection motif "Dénomination : XYZ" ou "Dénomination sociale : XYZ"
    const denomMatch = line.match(/(?:dénomination\s*sociale|dénomination|raison\s*sociale|nom\s*commercial)\s*[:\-]?\s*(.+)/i);
    if (denomMatch && denomMatch[1]) {
      const candidate = denomMatch[1].trim();
      if (candidate.length > 2 && !candidate.toLowerCase().includes('forme')) {
        companyName = candidate;
        break;
      } else if (i + 1 < lines.length) {
        // La dénomination est parfois sur la ligne suivante
        companyName = lines[i + 1].trim();
        break;
      }
    }

    // Détection motif direct type "SOCIETE XYZ SARL" ou "XYZ SAS"
    if (!companyName && /\b(SARL|SAS|SASU|SA|SUARL|GIE)\b/i.test(line)) {
      if (!line.toLowerCase().includes('forme') && !line.toLowerCase().includes('statuts') && line.length < 50) {
        companyName = line;
      }
    }
  }

  // 3. Extraction du Dirigeant / Représentant Légal
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Ignorer les en-têtes de section sans valeur (ex: "ADMINISTRATEUR / GERANT", "GESTION, DIRECTION")
    if (/^[A-Z\s\/,]+$/.test(line) && line.includes('/')) continue;
    if (/GESTION|DIRECTION|ADMINISTRATION/i.test(line) && !line.includes(':')) continue;

    const leaderMatch = line.match(/(?:président|gérant|directeur\s*général|administrateur|représentant(?:\s*légal)?)\s*[:\-]\s*(.+)/i);
    if (leaderMatch && leaderMatch[1]) {
      let candidate = leaderMatch[1].trim();
      // Retirer les mentions annexes "né le..."
      candidate = candidate.split(/\s+né\s+le/i)[0].trim();
      if (candidate.length > 2 && !candidate.startsWith('/')) {
        contactName = candidate;
        break;
      }
    }
  }

  // 4. Extraction de la Ville et du Pays
  const fullTextLower = rawText.toLowerCase();
  for (const [cityKey, countryVal] of Object.entries(COUNTRY_MAP)) {
    if (fullTextLower.includes(cityKey)) {
      city = cityKey.charAt(0).toUpperCase() + cityKey.slice(1);
      country = countryVal;
      break;
    }
  }

  // Si pas de ville trouvée dans le dictionnaire, chercher près de "Siège :" ou "R.C.S. [Ville]"
  if (!city) {
    const rcsCityMatch = rawText.match(/R\.?C\.?S\.?\s+([A-Za-zÀ-ÿ]+)/i);
    if (rcsCityMatch) {
      city = rcsCityMatch[1].trim();
      country = 'France';
    } else {
      city = 'Dakar';
      country = 'Sénégal';
    }
  }

  // 5. Détection du Secteur d'activité selon les mots-clés du texte
  if (/coton|tissu|wax|textile|vêtement|confection|mode/i.test(rawText)) {
    sector = 'Textile, Coton & Wax';
  } else if (/cacao|café|cajou|épice|vanille|agroalimentaire|fruit|arachide|agricole/i.test(rawText)) {
    sector = 'Agroalimentaire & Épices';
  } else if (/artisanat|bois|sculpture|décoration|vannerie/i.test(rawText)) {
    sector = 'Artisanat & Décoration';
  } else {
    sector = 'Cosmétique & Soins';
  }

  // Score de confiance estimé selon le nombre de champs clés trouvés
  let fieldsCount = 0;
  if (companyName) fieldsCount += 35;
  if (regNumber) fieldsCount += 35;
  if (city) fieldsCount += 15;
  if (contactName) fieldsCount += 15;

  return {
    companyName: companyName || 'Société Identifiée par OCR',
    regNumber: regNumber || 'RC-EN-COURS',
    country,
    city,
    sector,
    contactName: contactName || 'Représentant Légal',
    rawText,
    confidenceScore: Math.min(100, Math.max(50, fieldsCount)),
  };
}
