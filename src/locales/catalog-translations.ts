// Localized helpers for B2B catalog items, sectors, countries, and units
export const COUNTRY_NAMES: Record<string, { fr: string; en: string }> = {
  'Sénégal': { fr: 'Sénégal', en: 'Senegal' },
  'Senegal': { fr: 'Sénégal', en: 'Senegal' },
  "Côte d'Ivoire": { fr: "Côte d'Ivoire", en: 'Ivory Coast' },
  'Ivory Coast': { fr: "Côte d'Ivoire", en: 'Ivory Coast' },
  'Cameroun': { fr: 'Cameroun', en: 'Cameroon' },
  'Cameroon': { fr: 'Cameroun', en: 'Cameroon' },
  'France': { fr: 'France', en: 'France' },
  'Belgique': { fr: 'Belgique', en: 'Belgium' },
  'Belgium': { fr: 'Belgique', en: 'Belgium' },
  'Madagascar': { fr: 'Madagascar', en: 'Madagascar' },
  'Maroc': { fr: 'Maroc', en: 'Morocco' },
  'Morocco': { fr: 'Maroc', en: 'Morocco' },
  'RDC': { fr: 'RDC', en: 'DRC' },
  'DRC': { fr: 'RDC', en: 'DRC' },
  'Guinée': { fr: 'Guinée', en: 'Guinea' },
  'Nigeria': { fr: 'Nigéria', en: 'Nigeria' },
  'Nigéria': { fr: 'Nigéria', en: 'Nigeria' },
  'Ghana': { fr: 'Ghana', en: 'Ghana' },
  'Bénin': { fr: 'Bénin', en: 'Benin' },
  'Togo': { fr: 'Togo', en: 'Togo' },
};

export const SECTOR_NAMES: Record<string, { fr: string; en: string }> = {
  'INDUSTRIE, MATÉRIAUX & BTP': { fr: 'INDUSTRIE, MATÉRIAUX & BTP', en: 'INDUSTRY, MATERIALS & CONSTRUCTION' },
  'AGROALIMENTAIRE & NÉGOCE': { fr: 'AGROALIMENTAIRE & NÉGOCE', en: 'AGRI-FOOD & COMMODITIES' },
  'COSMÉTIQUE & SOINS': { fr: 'COSMÉTIQUE & SOINS', en: 'COSMETICS & SKINCARE' },
  'AGROALIMENTAIRE': { fr: 'AGROALIMENTAIRE', en: 'AGRI-FOOD & FARMING' },
  'Cosmétique': { fr: 'Cosmétique', en: 'Cosmetics' },
  'Textile': { fr: 'Textile', en: 'Textiles' },
  'Agroalimentaire': { fr: 'Agroalimentaire', en: 'Agri-food' },
  'Négoce & Commerce Général': { fr: 'Négoce & Commerce Général', en: 'General Trading & Wholesale' },
};

export const PRODUCT_TRANSLATIONS: Record<
  string,
  {
    title: { fr: string; en: string };
    desc?: { fr: string; en: string };
    unit?: { fr: string; en: string };
  }
> = {
  'Beurre de Karité Bio Brut (Fûts de 25kg)': {
    title: { fr: 'Beurre de Karité Bio Brut (Fûts de 25kg)', en: 'Raw Organic Shea Butter (25kg Drums)' },
    desc: {
      fr: 'Extrait à froid par coopérative féminine au Sénégal. Grade A, certifié sans solvant chimique.',
      en: 'Cold-extracted by women-led cooperative in Senegal. Grade A, certified solvent-free.',
    },
    unit: { fr: 'fût (25kg)', en: 'drum (25kg)' },
  },
  'Huile Pure de Baobab Vierge (Flacons & Vrac)': {
    title: { fr: 'Huile Pure de Baobab Vierge (Flacons & Vrac)', en: 'Pure Virgin Baobab Oil (Bottles & Bulk)' },
    desc: {
      fr: 'Riche en acides gras oméga-6 et 9. Idéale pour laboratoires cosmétiques et formulateurs de soins.',
      en: 'Rich in omega-6 and 9 fatty acids. Formulated for cosmetic labs and skincare brands.',
    },
    unit: { fr: 'litre', en: 'liter' },
  },
  'Tissu Wax Authentique 100% Coton (Pièces de 6 yards)': {
    title: { fr: 'Tissu Wax Authentique 100% Coton (Pièces de 6 yards)', en: 'Authentic 100% Cotton Wax Fabric (6 yards)' },
    desc: {
      fr: 'Motifs traditionnels et modernes, tenue des couleurs garantie grand teint. Vente par lots de 50 pièces.',
      en: 'Traditional and contemporary designs, superior colorfastness. Sold in 50-piece bundles.',
    },
    unit: { fr: 'pièce (6 yards)', en: 'piece (6 yards)' },
  },
  'Noix de Cajou Brutes Décortiquées (Grade W320)': {
    title: { fr: 'Noix de Cajou Brutes Décortiquées (Grade W320)', en: 'Raw Shelled Cashew Nuts (Grade W320)' },
    desc: {
      fr: 'Noix de cajou de haute qualité, séchage contrôlé, emballage sous vide hermétique pour export.',
      en: 'Premium cashews, moisture-controlled drying, hermetic vacuum export packaging.',
    },
    unit: { fr: 'kg', en: 'kg' },
  },
  'Gousses de Vanille Bourbon Gourmet (Affinage traditionnel)': {
    title: { fr: 'Gousses de Vanille Bourbon Gourmet (Affinage traditionnel)', en: 'Gourmet Bourbon Vanilla Beans (Traditional Curing)' },
    desc: {
      fr: 'Taux d\'humidité 30-35%, vanilline naturelle élevée. Certificats phytosanitaires et traçabilité complète.',
      en: '30-35% moisture content, rich natural vanillin. Full traceability & phytosanitary certificates.',
    },
    unit: { fr: 'kg', en: 'kg' },
  },
  'Huile d\'Argan Bio Pression à Froid (Bidons 25L)': {
    title: { fr: 'Huile d\'Argan Bio Pression à Froid (Bidons 25L)', en: 'Organic Cold-Pressed Argan Oil (25L Drums)' },
    desc: {
      fr: 'Huile d\'argan kosmetique 100% pure et biologique, pressée à froid dans nos coopératives certifiées d\'Agadir.',
      en: '100% pure organic cosmetic argan oil, cold-pressed in certified cooperatives in Agadir.',
    },
    unit: { fr: 'bidon (25L)', en: 'drum (25L)' },
  },
  'Huile de Pépins de Figue de Barbarie Pure (1L)': {
    title: { fr: 'Huile de Pépins de Figue de Barbarie Pure (1L)', en: 'Pure Prickly Pear Seed Oil (1L)' },
    desc: {
      fr: 'Elixir anti-âge exceptionnel. Rendement d\'1 tonne de fruits pour 1L d\'huile. Taux d\'acide linoléique > 60%.',
      en: 'Exceptional youth elixir. 1 ton of fruit yield per 1L of oil. Linoleic acid > 60%.',
    },
    unit: { fr: 'flacon (1L)', en: 'bottle (1L)' },
  },
  'Fèves de Cacao Fermentées Grade 1 (Sacs 65kg)': {
    title: { fr: 'Fèves de Cacao Fermentées Grade 1 (Sacs 65kg)', en: 'Grade 1 Fermented Cocoa Beans (65kg Bags)' },
    desc: {
      fr: 'Fèves de cacao haut de gamme séchées au soleil, taux de fèves défectueuses inférieur à 3%. Idéal pour chocolaterie fine.',
      en: 'Premium sun-dried cocoa beans, defect rate under 3%. Tailored for artisanal chocolate making.',
    },
    unit: { fr: 'sac (65kg)', en: 'bag (65kg)' },
  },
  'Poudre de Cacao Alcalinisée 10-12% (Sacs 25kg)': {
    title: { fr: 'Poudre de Cacao Alcalinisée 10-12% (Sacs 25kg)', en: 'Alkalized Cocoa Powder 10-12% (25kg Bags)' },
    desc: {
      fr: 'Poudre de cacao pur traitée selon le procédé hollandais, pH régulé, excellente solubilité industrielle.',
      en: 'Pure Dutch-process cocoa powder, regulated pH, superior industrial solubility.',
    },
    unit: { fr: 'sac (25kg)', en: 'bag (25kg)' },
  },
  'Beurre de Cacao Pur Désodorisé (Blocs 25kg)': {
    title: { fr: 'Beurre de Cacao Pur Désodorisé (Blocs 25kg)', en: 'Pure Deodorized Cocoa Butter (25kg Blocks)' },
    desc: {
      fr: 'Point de fusion optimal 34-36°C, neutralisé pour la confiserie, la pharmacopée et les formulations cosmétiques.',
      en: 'Optimal melting point 34-36°C, neutralized for confectionery, pharmaceutical and cosmetic uses.',
    },
    unit: { fr: 'bloc (25kg)', en: 'block (25kg)' },
  },
  'Mangues Séchées Amélie Bio (Cartons de 10kg)': {
    title: { fr: 'Mangues Séchées Amélie Bio (Cartons de 10kg)', en: 'Organic Amélie Dried Mangoes (10kg Cartons)' },
    desc: {
      fr: 'Mangues bio du terroir sahélien séchées sans sucre ajouté ni conservateurs. Tranches souples et parfumées.',
      en: 'Sahel organic mangoes dried with zero added sugar or preservatives. Tender aromatic slices.',
    },
    unit: { fr: 'carton (10kg)', en: 'carton (10kg)' },
  },
  'Sésame Blanc Décortiqué Grade A (Sacs 50kg)': {
    title: { fr: 'Sésame Blanc Décortiqué Grade A (Sacs 50kg)', en: 'Grade A Hulled White Sesame (50kg Bags)' },
    desc: {
      fr: 'Graines de sésame blanc purifiées à 99,95%, pureté certifiée, teneur en huile supérieure à 52%.',
      en: 'White sesame seeds cleaned to 99.95% purity, oil content exceeding 52%.',
    },
    unit: { fr: 'sac (50kg)', en: 'bag (50kg)' },
  },
  'Poudre de Baobab Pure Bio (Sacs 25kg)': {
    title: { fr: 'Poudre de Baobab Pure Bio (Sacs 25kg)', en: 'Pure Organic Baobab Powder (25kg Bags)' },
    desc: {
      fr: 'Pulpe de fruit du baobab séchée naturellement sur l\'arbre, broyée mécaniquement sans altération thermique.',
      en: 'Baobab fruit pulp naturally dried on branch, mechanically ground with no thermal degradation.',
    },
    unit: { fr: 'sac (25kg)', en: 'bag (25kg)' },
  },
};

export function getLocalizedCountry(country: string, locale: string): string {
  if (COUNTRY_NAMES[country]) {
    return locale === 'fr' ? COUNTRY_NAMES[country].fr : COUNTRY_NAMES[country].en;
  }
  return country;
}

export function getLocalizedSector(sector: string, locale: string): string {
  if (SECTOR_NAMES[sector]) {
    return locale === 'fr' ? SECTOR_NAMES[sector].fr : SECTOR_NAMES[sector].en;
  }
  return sector;
}

export function getLocalizedProductTitle(title: string, locale: string): string {
  if (PRODUCT_TRANSLATIONS[title]) {
    return locale === 'fr' ? PRODUCT_TRANSLATIONS[title].title.fr : PRODUCT_TRANSLATIONS[title].title.en;
  }
  return title;
}

export function getLocalizedProductDesc(desc: string, title: string, locale: string): string {
  if (PRODUCT_TRANSLATIONS[title]?.desc) {
    return locale === 'fr' ? PRODUCT_TRANSLATIONS[title].desc!.fr : PRODUCT_TRANSLATIONS[title].desc!.en;
  }
  return desc;
}

export function getLocalizedProductUnit(unit: string, title: string, locale: string): string {
  if (PRODUCT_TRANSLATIONS[title]?.unit) {
    return locale === 'fr' ? PRODUCT_TRANSLATIONS[title].unit!.fr : PRODUCT_TRANSLATIONS[title].unit!.en;
  }
  return unit;
}
