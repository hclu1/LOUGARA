'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  ShieldCheck,
  Building2,
  Package,
  Send,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';
import { BadgeVerified } from '@/components/BadgeVerified';

interface MockProduct {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  originCountry: string;
  moq: number;
  unit: string;
  priceMin: number;
  priceMax: number;
  currency: string;
  images: string[];
  company: {
    id: string;
    companyName: string;
    country: string;
    city: string;
    isVerified: boolean;
  };
}

const SAMPLE_PRODUCTS: MockProduct[] = [
  {
    id: 'prod-1',
    title: 'Beurre de Karité Bio Brut (Fûts de 25kg)',
    slug: 'beurre-de-karite-bio-brut-25kg',
    description: 'Extrait à froid par coopérative féminine au Sénégal. Grade A, certifié sans solvant chimique.',
    category: 'Cosmétique',
    originCountry: 'Sénégal',
    moq: 4,
    unit: 'fût (25kg)',
    priceMin: 8.5,
    priceMax: 12.0,
    currency: 'EUR',
    images: [
      'https://images.unsplash.com/photo-1608248597359-54d922336336?auto=format&fit=crop&q=80&w=800',
    ],
    company: {
      id: 'comp-1',
      companyName: 'Africa Bio Extracts SARL',
      country: 'Sénégal',
      city: 'Dakar',
      isVerified: true,
    },
  },
  {
    id: 'prod-2',
    title: 'Huile Pure de Baobab Vierge (Flacons & Vrac)',
    slug: 'huile-pure-baobab-vierge',
    description: 'Riche en acides gras oméga-6 et 9. Idéale pour laboratoires cosmétiques et formulateurs de soins.',
    category: 'Cosmétique',
    originCountry: 'Sénégal',
    moq: 20,
    unit: 'litre',
    priceMin: 22.0,
    priceMax: 29.0,
    currency: 'EUR',
    images: [
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=800',
    ],
    company: {
      id: 'comp-1',
      companyName: 'Africa Bio Extracts SARL',
      country: 'Sénégal',
      city: 'Dakar',
      isVerified: true,
    },
  },
  {
    id: 'prod-3',
    title: 'Tissu Wax Authentique 100% Coton (Pièces de 6 yards)',
    slug: 'tissu-wax-authentique-coton',
    description: 'Motifs traditionnels et modernes, tenue des couleurs garantie grand teint. Vente par lots de 50 pièces.',
    category: 'Textile',
    originCountry: 'Côte d\'Ivoire',
    moq: 50,
    unit: 'pièce (6 yards)',
    priceMin: 14.0,
    priceMax: 18.5,
    currency: 'EUR',
    images: [
      'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&q=80&w=800',
    ],
    company: {
      id: 'comp-2',
      companyName: 'Ivoire Textiles & Confection',
      country: 'Côte d\'Ivoire',
      city: 'Abidjan',
      isVerified: true,
    },
  },
  {
    id: 'prod-4',
    title: 'Noix de Cajou Brutes Décortiquées (Grade W320)',
    slug: 'noix-de-cajou-brutes-w320',
    description: 'Noix de cajou de haute qualité, séchage contrôlé, emballage sous vide hermétique pour export.',
    category: 'Agroalimentaire',
    originCountry: 'Côte d\'Ivoire',
    moq: 200,
    unit: 'kg',
    priceMin: 6.8,
    priceMax: 8.9,
    currency: 'EUR',
    images: [
      'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&q=80&w=800',
    ],
    company: {
      id: 'comp-3',
      companyName: 'Savanah Agro Trading',
      country: 'Côte d\'Ivoire',
      city: 'Bouaké',
      isVerified: true,
    },
  },
  {
    id: 'prod-5',
    title: 'Gousses de Vanille Bourbon Gourmet (Affinage traditionnel)',
    slug: 'vanille-bourbon-gourmet',
    description: 'Taux d\'humidité 30-35%, vanilline naturelle élevée. Certificats phytosanitaires et traçabilité complète.',
    category: 'Agroalimentaire',
    originCountry: 'Madagascar',
    moq: 5,
    unit: 'kg',
    priceMin: 140.0,
    priceMax: 180.0,
    currency: 'EUR',
    images: [
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=800',
    ],
    company: {
      id: 'comp-4',
      companyName: 'Madagascar Vanilla Export',
      country: 'Madagascar',
      city: 'Antananarivo',
      isVerified: false,
    },
  },
];

export default function CataloguePage() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [onlyVerified, setOnlyVerified] = useState<boolean>(true);

  // État de la modale de demande de devis
  const [selectedProductForQuote, setSelectedProductForQuote] = useState<MockProduct | null>(null);
  const [quoteQuantity, setQuoteQuantity] = useState<number>(10);
  const [quoteMessage, setQuoteMessage] = useState<string>('');
  const [quoteSuccess, setQuoteSuccess] = useState<boolean>(false);

  // Filtrage réactif
  const filteredProducts = SAMPLE_PRODUCTS.filter((prod) => {
    if (onlyVerified && !prod.company.isVerified) return false;
    if (selectedCategory !== 'all' && prod.category !== selectedCategory) return false;
    if (selectedCountry !== 'all' && prod.originCountry !== selectedCountry) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      const matchTitle = prod.title.toLowerCase().includes(q);
      const matchDesc = prod.description.toLowerCase().includes(q);
      const matchComp = prod.company.companyName.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchComp) return false;
    }
    return true;
  });

  const handleSendQuote = (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteSuccess(true);
    setTimeout(() => {
      setQuoteSuccess(false);
      setSelectedProductForQuote(null);
      setQuoteMessage('');
    }, 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* En-tête de page */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Catalogue & Sourcing B2B
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Trouvez des grossistes et producteurs fiables en Afrique et en Europe.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Filtre anti-fraude actif : Fournisseurs immatriculés
          </div>
        </div>
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Champ Recherche */}
          <div className="md:col-span-5 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Rechercher un produit, ingrédient ou fournisseur..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Filtre Catégorie */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white text-slate-700"
            >
              <option value="all">Toutes les catégories</option>
              <option value="Cosmétique">Cosmétique & Soins</option>
              <option value="Textile">Textile & Mode</option>
              <option value="Agroalimentaire">Agroalimentaire & Épices</option>
            </select>
          </div>

          {/* Filtre Pays */}
          <div className="md:col-span-2">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white text-slate-700"
            >
              <option value="all">Tous pays</option>
              <option value="Sénégal">Sénégal</option>
              <option value="Côte d'Ivoire">Côte d&apos;Ivoire</option>
              <option value="France">France</option>
              <option value="Madagascar">Madagascar</option>
            </select>
          </div>

          {/* Toggle Uniquement Vérifiés */}
          <div className="md:col-span-2 flex items-center justify-center">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors w-full justify-center">
              <input
                type="checkbox"
                checked={onlyVerified}
                onChange={(e) => setOnlyVerified(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              <span>Vérifiés seuls</span>
            </label>
          </div>
        </div>

        {/* Résumé des résultats */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            {filteredProducts.length} résultat{filteredProducts.length > 1 ? 's' : ''} disponible{filteredProducts.length > 1 ? 's' : ''}
          </span>
          {onlyVerified && (
            <span className="text-emerald-600 font-medium">
              Filtre actif : Affichage restreint aux entreprises auditées
            </span>
          )}
        </div>
      </div>

      {/* Grille de Cartes Produits B2B */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((prod) => (
          <div
            key={prod.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
          >
            {/* Image & Badge */}
            <div className="relative h-48 bg-slate-100 overflow-hidden">
              <img
                src={prod.images[0]}
                alt={prod.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3">
                {prod.company.isVerified ? (
                  <BadgeVerified className="bg-white/95 backdrop-blur-sm" />
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                    Vérification en cours
                  </span>
                )}
              </div>
              <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-xs font-semibold">
                Origine : {prod.originCountry}
              </div>
            </div>

            {/* Corps de la carte */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {prod.category}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Building2 className="w-3.5 h-3.5" />
                    {prod.company.companyName}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                  {prod.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {prod.description}
                </p>
              </div>

              {/* Conditions B2B & Prix */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                      Prix Indicatif B2B
                    </p>
                    <p className="text-base font-extrabold text-slate-900">
                      {prod.priceMin.toFixed(2)} - {prod.priceMax.toFixed(2)} {prod.currency}
                      <span className="text-xs font-normal text-slate-500"> / {prod.unit}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                      Commande Min. (MOQ)
                    </p>
                    <p className="text-sm font-bold text-emerald-700 flex items-center gap-1 justify-end">
                      <Package className="w-3.5 h-3.5" />
                      {prod.moq} {prod.unit}s
                    </p>
                  </div>
                </div>

                {/* Bouton de contact / Devis */}
                <button
                  onClick={() => {
                    setSelectedProductForQuote(prod);
                    setQuoteQuantity(prod.moq);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-emerald-600 transition-colors shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  Demander un devis au grossiste
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODALE DE DEMANDE DE DEVIS B2B */}
      {selectedProductForQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSelectedProductForQuote(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {quoteSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Demande de devis transmise !</h3>
                <p className="text-sm text-slate-600 max-w-sm mx-auto">
                  Votre demande a été envoyée directement dans la messagerie professionnelle de{' '}
                  <span className="font-semibold">{selectedProductForQuote.company.companyName}</span>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendQuote} className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                    Mise en Relation B2B
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    Demander un devis : {selectedProductForQuote.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Fournisseur : {selectedProductForQuote.company.companyName} ({selectedProductForQuote.company.country})
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quantité souhaitée ({selectedProductForQuote.unit}s) &bull; MOQ : {selectedProductForQuote.moq}
                  </label>
                  <input
                    type="number"
                    min={selectedProductForQuote.moq}
                    value={quoteQuantity}
                    onChange={(e) => setQuoteQuantity(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Précisions (Destination, délais souhaités, certifications demandées)
                  </label>
                  <textarea
                    rows={4}
                    value={quoteMessage}
                    onChange={(e) => setQuoteMessage(e.target.value)}
                    required
                    placeholder="Bonjour, nous sommes une marque cosmétique basée à Paris. Pouvez-vous nous indiquer vos tarifs pour une livraison CIF Le Havre ainsi que la fiche technique ?"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedProductForQuote(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Envoyer ma demande sécurisée
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
