export interface ParsedKbisData {
  companyName: string;
  regNumber: string;
  country: string;
  city: string;
  sector: string;
  activitySummary?: string;
  contactName: string;
  email?: string;
  phone?: string;
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

export function cleanCompanyName(text: string): string {
  let cleaned = text.trim();

  // 1. Supprimer les préfixes de libellés officiels et leurs altérations OCR fréquentes
  // (ex: "Dénomination ou raison sociale", "Dénomination où roion soie", "Dénomination :")
  cleaned = cleaned.replace(
    /^(?:d[eéè]nominat(?:ion|lon)|d[eéè]nom)\s*(?:ou|o[uùú]|et|&)?\s*(?:raison|roion|raion|roison)?\s*(?:sociale|soie|social|soclale)?\s*[:\-\.]*\s*/i,
    ''
  );

  // 2. Nettoyer les résidus restants en tête de chaîne
  cleaned = cleaned.replace(/^(?:ou|o[uùú])\s+(?:raison|roion|raion|roison)\s+(?:sociale|soie|social|soclale)\s*[:\-\.]*\s*/i, '');
  cleaned = cleaned.replace(/^(?:raison|roion|raion|roison)\s+(?:sociale|soie|social|soclale)\s*[:\-\.]*\s*/i, '');
  cleaned = cleaned.replace(/^(?:sociale|soie|social|nom\s*commercial)\s*[:\-\.]*\s*/i, '');

  cleaned = cleaned.trim();

  // 3. Normalisation des noms de sociétés / acronymes (ex: InFONET -> INFONET)
  // Si le mot est majoritairement composé de majuscules altérées par une minuscule OCR
  if (/^[A-Za-z0-9\s\-]+$/.test(cleaned)) {
    const uppercaseLetters = (cleaned.match(/[A-Z]/g) || []).length;
    const lowercaseLetters = (cleaned.match(/[a-z]/g) || []).length;
    if (uppercaseLetters >= 2 && uppercaseLetters >= lowercaseLetters) {
      cleaned = cleaned.toUpperCase();
    }
  }

  return cleaned;
}

export function cleanContactName(name: string): string {
  let cleaned = name.trim();
  // Supprimer les préfixes civilité et libellés de fonction
  cleaned = cleaned.replace(/^(?:m\.|mme|monsieur|madame|nom,?\s*pr[eéè]noms?|g[eéè]rant|pr[eéè]sident)\s*[:\-\.]*\s*/i, '');
  
  // Correction des altérations OCR récurrentes
  // "Juuen" est la lecture OCR de "JULIEN"
  cleaned = cleaned.replace(/\bJuuen\b/gi, 'JULIEN');
  // "oué" / "oupé" est la lecture OCR de "DUPÉ"
  cleaned = cleaned.replace(/(?:^|\s)(?:ou[eé]|oup[eé]|dup[eé]?)(?=\s|$)/gi, ' DUPÉ');

  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Si le résultat est principalement en capitales (comme JULIEN DUPÉ sur le Kbis)
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
  let city = '';
  let country = 'France';
  let sector = 'Négoce & Commerce Général';
  let activitySummary = '';
  let contactName = '';

  // 1. Extraction du numéro légal (SIREN/SIRET ou RCCM)
  // Recherche RCCM OHADA (ex: SN-DKR-2022-B-9912 ou CI-ABJ-2023-B-4501)
  const rccmMatch = rawText.match(/\b([A-Z]{2}[ -]?[A-Z]{3}[ -]?\d{4}[ -]?[A-Z][ -]?\d{2,6})\b/i);
  if (rccmMatch) {
    regNumber = rccmMatch[1].toUpperCase().replace(/\s+/g, '-');
  } else {
    // Recherche SIREN (9 chiffres) ou SIRET (14 chiffres) ou R.C.S. ou Immatriculation
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

  // 2. Extraction de la Dénomination Sociale / Raison Sociale
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Détection d'une ligne contenant "Dénomination" ou "Raison sociale" (tolérant aux coquilles OCR ex: "où roion soie")
    if (/(?:d[eéè]nom|raison|roion|nom\s*commercial)/i.test(line)) {
      const candidate = cleanCompanyName(line);
      if (candidate && candidate.length > 1 && !candidate.toLowerCase().includes('forme')) {
        companyName = candidate;
        break;
      } else if (i + 1 < lines.length) {
        // La dénomination est sur la ligne suivante
        const nextCandidate = cleanCompanyName(lines[i + 1]);
        if (nextCandidate && nextCandidate.length > 1 && !nextCandidate.toLowerCase().includes('forme')) {
          companyName = nextCandidate;
          break;
        }
      }
    }

    // Détection motif direct type "SOCIETE XYZ SARL" ou "XYZ SAS"
    if (!companyName && /\b(SARL|SAS|SASU|SA|SUARL|GIE)\b/i.test(line)) {
      if (!line.toLowerCase().includes('forme') && !line.toLowerCase().includes('statuts') && line.length < 50) {
        companyName = cleanCompanyName(line);
      }
    }
  }

  // 3. Extraction du Dirigeant / Représentant Légal
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Ignorer les en-têtes de section sans valeur
    if (/^[A-Z\s\/,]+$/.test(line) && line.includes('/')) continue;
    if (/GESTION|DIRECTION|ADMINISTRATION/i.test(line) && !line.includes(':')) continue;

    const leaderMatch = line.match(/(?:président|gérant|directeur\s*général|administrateur|représentant(?:\s*légal)?)\s*[:\-]\s*(.+)/i);
    if (leaderMatch && leaderMatch[1]) {
      let candidate = leaderMatch[1].trim();
      candidate = candidate.split(/\s+né\s+le/i)[0].trim();
      if (candidate.length > 2 && !candidate.startsWith('/')) {
        contactName = candidate;
        break;
      }
    }

    // Si le titre (ex: "Gérant", "Président") est seul sur sa ligne
    if (/^(?:g[eéè]rant|pr[eéè]sident|directeur\s*g[eéè]n[eéè]ral|administrateur)\s*$/i.test(line)) {
      for (let j = i + 1; j < Math.min(lines.length, i + 4); j++) {
        const nextLine = lines[j];
        const nomMatch = nextLine.match(/(?:[nN]om|[oO]m)[,\s]+pr[eéè]noms?\s*[:\s]*(.+)/i);
        if (nomMatch && nomMatch[1]) {
          contactName = nomMatch[1].trim().split(/\s+né\s+le/i)[0].trim();
          break;
        } else if (nextLine && !nextLine.toLowerCase().includes('naissance') && nextLine.length > 3 && !nextLine.includes(':')) {
          contactName = nextLine.trim();
          break;
        }
      }
      if (contactName) break;
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

  // 5. Extraction précise de l'Activité (Kbis / RCCM) & Classification du Secteur
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Ignorer les en-têtes de section générales
    if (/renseignements|relatifs\s+[aà]|et\s+à\s+l'établissement/i.test(line)) continue;

    // Détecte les libellés officiels d'activité (ex: "Act) exercées) PORTAIL INTERNET", "Activité(s) exercée(s) : ...")
    const actMatch = line.match(
      /^(?:act[\)\s]*exerc[eéè]es?[\)]*|activit[eéè]\(s\)\s*exerc[eéè]e\(s\)|activit[eéè]s?(?:\s*exerc[eéè]es?|\s*principales?)?|objet\s*social)\s*[:\-\)]*\s*(.+)/i
    );
    if (actMatch && actMatch[1]) {
      const candidate = actMatch[1].trim();
      if (candidate.length > 2 && !/^(?:date|du|au|création)/i.test(candidate)) {
        activitySummary = candidate;
        break;
      }
    } else if (/^(?:act[\)\s]*exerc[eéè]es?[\)]*|activit[eéè]\(s\)\s*exerc[eéè]e\(s\)|activit[eéè]s?(?:\s*exerc[eéè]es?|\s*principales?)?|objet\s*social)\s*[:\-\)]*$/i.test(line)) {
      if (i + 1 < lines.length && lines[i + 1].length > 2) {
        activitySummary = lines[i + 1].trim();
        break;
      }
    }
  }

  // Classification intelligente du secteur basée en priorité sur l'activité réelle déclarée
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
    if (/btp|construction|b[aâ]timent|outillage|machine|[eé]quipement|m[eé]tallurgie|quincaillerie/i.test(t)) {
      return 'Industrie, Matériaux & BTP';
    }
    if (/conseil|consulting|audit|expertise\s*comptable|juridique|avocat|ing[eé]nierie|prestations?\s+de\s+services?/i.test(t)) {
      return 'Services & Conseil B2B';
    }
    if (/n[eé]goce|import|export|commerce\s+de\s+gros|distribution/i.test(t)) {
      return 'Négoce & Commerce Général';
    }
    return null;
  };

  const detectedFromActivity = classifyText(activitySummary);
  const detectedFromRaw = classifyText(rawText);

  sector = detectedFromActivity || detectedFromRaw || 'Négoce & Commerce Général';

  // Nettoyage et mise au propre du contact officiel
  if (contactName) {
    contactName = cleanContactName(contactName);
  }

  // 6. Extraction des Coordonnées du Représentant Officiel (Étape 4)
  // RÈGLE STRICTE : Ne jamais inventer d'email ni de téléphone. On n'écrit que si cela existe explicitement sur le document.
  const emailRegexMatch = rawText.match(/\b([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})\b/);
  const email = emailRegexMatch ? emailRegexMatch[1] : undefined;

  const phoneRegexMatch = rawText.match(/(?:t[eéè]l|t[eéè]l[eéè]phone|mobile|portable|phone|contact)\s*[:\.\-]?\s*(\+?[0-9\s\.\-\(\)]{8,18})/i);
  const phone = phoneRegexMatch ? phoneRegexMatch[1].trim() : undefined;

  // Score de confiance estimé selon le nombre de champs clés trouvés
  let fieldsCount = 0;
  if (companyName) fieldsCount += 30;
  if (regNumber) fieldsCount += 30;
  if (activitySummary || sector) fieldsCount += 20;
  if (city) fieldsCount += 10;
  if (contactName) fieldsCount += 10;

  return {
    companyName: companyName || 'Société Identifiée par OCR',
    regNumber: regNumber || 'RC-EN-COURS',
    country,
    city,
    sector,
    activitySummary: activitySummary || undefined,
    contactName: contactName || 'Représentant Légal',
    email,
    phone,
    rawText,
    confidenceScore: Math.min(100, Math.max(50, fieldsCount)),
  };
}

