'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  ArrowRight,
  Briefcase,
  Megaphone,
  Mail,
  Phone,
  Layers,
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
    subscriptionPlan: 'STANDARD' | 'PREMIUM' | 'VIP';
    hasCatalogAdSpace: boolean;
  };
}

interface SponsoredBuyer {
  id: string;
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  buyerType: string;
  targetSectors: string[];
  estimatedBudget: string;
  sourcingNeeds?: string;
  registrationNumber?: string;
  isKbisVerified?: boolean;
  subscriptionPlan?: 'STANDARD' | 'PREMIUM' | 'VIP';
  hasCatalogAdSpace?: boolean;
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
      subscriptionPlan: 'PREMIUM',
      hasCatalogAdSpace: true,
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
      subscriptionPlan: 'PREMIUM',
      hasCatalogAdSpace: true,
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
      subscriptionPlan: 'VIP',
      hasCatalogAdSpace: true,
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
      subscriptionPlan: 'STANDARD',
      hasCatalogAdSpace: true,
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
      subscriptionPlan: 'STANDARD',
      hasCatalogAdSpace: false, // Ne sera pas affiché car sans encart publicitaire
    },
  },
];

const INITIAL_BUYERS: SponsoredBuyer[] = [
  {
    id: 'ent-1',
    fullName: 'Élodie Laurent',
    companyName: 'Boutique Botanica Paris',
    email: 'elodie@botanica-paris.fr',
    phone: '+33 6 12 34 56 78',
    country: 'France',
    city: 'Paris',
    buyerType: 'Boutique physique & Concept store',
    targetSectors: ['Cosmétique & Soins', 'Artisanat & Décoration'],
    estimatedBudget: '1 000 € à 5 000 € / mois',
    sourcingNeeds: 'Recherche de savons noirs traditionnels et beurre de karité brut certifié biologique.',
    registrationNumber: '891 234 567 R.C.S. Paris',
    isKbisVerified: true,
    subscriptionPlan: 'PREMIUM',
    hasCatalogAdSpace: true,
  },
  {
    id: 'ent-2',
    fullName: 'Marc Van Der Beek',
    companyName: 'Brussels Bio Imports',
    email: 'm.vanderbeek@brussels-imports.be',
    phone: '+32 470 12 34 56',
    country: 'Belgique',
    city: 'Bruxelles',
    buyerType: 'Importateur & Distributeur',
    targetSectors: ['Agroalimentaire & Épices'],
    estimatedBudget: '5 000 € à 20 000 € / mois',
    sourcingNeeds: 'Approvisionnement régulier en fèves de cacao Criollo et vanille de Madagascar.',
    registrationNumber: 'BE 0849.123.456',
    isKbisVerified: true,
    subscriptionPlan: 'VIP',
    hasCatalogAdSpace: true,
  },
];

export default function CataloguePage() {
  const [activeTab, setActiveTab] = useState<'products' | 'buyers'>('products');
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [onlyVerified, setOnlyVerified] = useState<boolean>(true);

  // Acheteurs récupérés via API
  const [buyersList, setBuyersList] = useState<SponsoredBuyer[]>(INITIAL_BUYERS);

  // Modale devis produit
  const [selectedProductForQuote, setSelectedProductForQuote] = useState<MockProduct | null>(null);
  const [quoteQuantity, setQuoteQuantity] = useState<number>(10);
  const [quoteMessage, setQuoteMessage] = useState<string>('');
  const [quoteSuccess, setQuoteSuccess] = useState<boolean>(false);

  // Modale proposition fournisseur pour un acheteur
  const [selectedBuyerForProposal, setSelectedBuyerForProposal] = useState<SponsoredBuyer | null>(null);
  const [proposalMessage, setProposalMessage] = useState<string>('');
  const [proposalSuccess, setProposalSuccess] = useState<boolean>(false);

  useEffect(() => {
    async function loadEntrepreneurs() {
      try {
        const res = await fetch('/api/entrepreneurs/register');
        if (res.ok) {
          const data = await res.json();
          if (data.entrepreneurs && Array.isArray(data.entrepreneurs)) {
            // Filtrer strictement les acheteurs avec espace publicitaire payé
            const sponsored = data.entrepreneurs.filter((e: any) => e.hasCatalogAdSpace === true);
            if (sponsored.length > 0) {
              setBuyersList(sponsored);
            }
          }
        }
      } catch (e) {
        console.log('Chargement acheteurs en mode local déconnecté');
      }
    }
    loadEntrepreneurs();
  }, []);

  // Filtrage des produits : uniquement ceux dont l'entreprise a souscrit un Espace Publicitaire
  const filteredProducts = SAMPLE_PRODUCTS.filter((prod) => {
    if (!prod.company.hasCatalogAdSpace) return false;
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

  // Filtrage des acheteurs : uniquement ceux avec un Espace Publicitaire actif
  const filteredBuyers = buyersList.filter((buyer) => {
    if (!buyer.hasCatalogAdSpace) return false;
    if (onlyVerified && !buyer.isKbisVerified) return false;
    if (selectedCountry !== 'all' && buyer.country !== selectedCountry) return false;
    if (selectedCategory !== 'all') {
      const matchesSector = buyer.targetSectors?.some((s) =>
        s.toLowerCase().includes(selectedCategory.toLowerCase())
      );
      if (!matchesSector) return false;
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      const matchName = buyer.companyName.toLowerCase().includes(q);
      const matchNeeds = (buyer.sourcingNeeds || '').toLowerCase().includes(q);
      const matchType = buyer.buyerType.toLowerCase().includes(q);
      if (!matchName && !matchNeeds && !matchType) return false;
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

  const handleSendProposal = (e: React.FormEvent) => {
    e.preventDefault();
    setProposalSuccess(true);
    setTimeout(() => {
      setProposalSuccess(false);
      setSelectedBuyerForProposal(null);
      setProposalMessage('');
    }, 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* En-tête de page */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Espaces Publicitaires Partenaires
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Catalogue & Sourcing B2B
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Plateforme d&apos;intermédiation directe entre fournisseurs audités et acheteurs qualifiés.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Filtre anti-fraude KYB & Kbis actif
            </div>
            <Link
              href="/tarifs"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 transition-colors shadow-sm"
            >
              <Megaphone className="w-3.5 h-3.5" />
              Tarifs des encarts publicitaires
            </Link>
          </div>
        </div>
      </div>

      {/* Bannière Règle de Visibilité Publique */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-5 rounded-3xl shadow-md border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md">
                Règle de visibilité catalogue
              </span>
              <span className="text-xs text-slate-300">
                Abonnement requis + Option Espace Publicitaire
              </span>
            </div>
            <h2 className="text-sm md:text-base font-bold text-white">
              Visibilité exclusive : seuls les membres disposant d&apos;un Espace Publicitaire sont référencés
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Pour garantir la qualité des relations d&apos;affaires, seuls les fournisseurs et entrepreneurs abonnés ayant activé l&apos;encart publicitaire (+49 €/mois ou inclus d&apos;office dans l&apos;offre VIP à 250 €/mois) figurent dans ce catalogue public.
            </p>
          </div>
        </div>
        <Link
          href="/tarifs"
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-amber-400 font-bold text-xs shadow-md transition-all"
        >
          Découvrir les offres
          <ArrowRight className="w-4 h-4 text-emerald-700" />
        </Link>
      </div>

      {/* Sélecteur d'Onglets : Offres Fournisseurs / Appels d'Offres Acheteurs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 pb-3.5 px-6 font-bold text-sm transition-all border-b-2 ${
            activeTab === 'products'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          Offres Fournisseurs Sponsorisées
          <span className={`px-2 py-0.5 rounded-full text-xs ${
            activeTab === 'products' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
          }`}>
            {filteredProducts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('buyers')}
          className={`flex items-center gap-2 pb-3.5 px-6 font-bold text-sm transition-all border-b-2 ${
            activeTab === 'buyers'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Appels d&apos;Offres Acheteurs Sponsorisés
          <span className={`px-2 py-0.5 rounded-full text-xs ${
            activeTab === 'buyers' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
          }`}>
            {filteredBuyers.length}
          </span>
        </button>
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Champ Recherche */}
          <div className="md:col-span-5 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={
                activeTab === 'products'
                  ? 'Rechercher un produit, ingrédient ou grossiste...'
                  : 'Rechercher un appel d\'offres, secteur ou profil acheteur...'
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Filtre Catégorie / Secteur */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white text-slate-700"
            >
              <option value="all">Tous les secteurs & catégories</option>
              <option value="Cosmétique">Cosmétique & Soins</option>
              <option value="Textile">Textile & Mode</option>
              <option value="Agroalimentaire">Agroalimentaire & Épices</option>
              <option value="Technologies">Technologies & Numérique</option>
              <option value="Services">Services & Conseil B2B</option>
              <option value="Artisanat">Artisanat & Décoration</option>
              <option value="Emballages">Emballages & Packaging</option>
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
              <option value="Belgique">Belgique</option>
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
            {activeTab === 'products' ? filteredProducts.length : filteredBuyers.length} résultat
            {(activeTab === 'products' ? filteredProducts.length : filteredBuyers.length) > 1 ? 's' : ''} sponsorisé
            {(activeTab === 'products' ? filteredProducts.length : filteredBuyers.length) > 1 ? 's' : ''} disponible
            {(activeTab === 'products' ? filteredProducts.length : filteredBuyers.length) > 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-amber-700 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Encarts publicitaires actifs certifiés
            </span>
            {onlyVerified && (
              <span className="text-emerald-600 font-medium">
                &bull; Entreprises immatriculées
              </span>
            )}
          </div>
        </div>
      </div>

      {/* VUE 1 : OFFRES FOURNISSEURS SPONSORISÉES */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group relative"
            >
              {/* Image & Badges */}
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                <img
                  src={prod.images[0]}
                  alt={prod.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                  {prod.company.isVerified ? (
                    <BadgeVerified className="bg-white/95 backdrop-blur-sm shadow-sm" />
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                      Vérification en cours
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400 text-slate-950 flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-3 h-3" /> Espace Publicitaire
                  </span>
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
                    <div className="flex items-center gap-1.5 font-medium text-slate-700">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{prod.company.companyName}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                        {prod.company.subscriptionPlan}
                      </span>
                    </div>
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
      )}

      {/* VUE 2 : APPELS D'OFFRES ACHETEURS SPONSORISÉS */}
      {activeTab === 'buyers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBuyers.map((buyer) => (
            <div
              key={buyer.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400 text-slate-950 flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-3 h-3" /> Espace Publicitaire Acheteur
                      </span>
                      {buyer.subscriptionPlan && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {buyer.subscriptionPlan}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-2 flex items-center gap-2">
                      {buyer.companyName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {buyer.buyerType} &bull; {buyer.city}, {buyer.country}
                    </p>
                  </div>
                  {buyer.isKbisVerified && (
                    <BadgeVerified className="bg-emerald-50" />
                  )}
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-500 uppercase text-[10px]">
                      Besoin de sourcing / Appel d&apos;offres
                    </span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      Budget : {buyer.estimatedBudget}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    &ldquo;{buyer.sourcingNeeds || 'Recherche de fournisseurs fiables et partenaires grossistes.'}&rdquo;
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {buyer.targetSectors?.map((sec, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700"
                    >
                      {sec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Contact certifié : <span className="font-semibold text-slate-700">{buyer.fullName}</span>
                </div>
                <button
                  onClick={() => setSelectedBuyerForProposal(buyer)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-emerald-600 transition-colors shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  Proposer mon catalogue
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODALE DE DEMANDE DE DEVIS PRODUIT */}
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
                    placeholder="Bonjour, nous sommes une marque basée en Europe. Pouvez-vous nous indiquer vos tarifs pour une expédition maritime ainsi que la fiche technique ?"
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

      {/* MODALE DE PROPOSITION FOURNISSEUR POUR UN ACHETEUR */}
      {selectedBuyerForProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSelectedBuyerForProposal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {proposalSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Proposition commerciale transmise !</h3>
                <p className="text-sm text-slate-600 max-w-sm mx-auto">
                  Votre offre a été envoyée directement à l&apos;acheteur{' '}
                  <span className="font-semibold">{selectedBuyerForProposal.companyName}</span> ({selectedBuyerForProposal.fullName}).
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendProposal} className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                    Réponse Appel d&apos;Offres B2B
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    Contacter {selectedBuyerForProposal.companyName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Acheteur : {selectedBuyerForProposal.fullName} &bull; {selectedBuyerForProposal.city}, {selectedBuyerForProposal.country}
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-600">
                  <span className="font-semibold">Besoin formulé : </span>
                  {selectedBuyerForProposal.sourcingNeeds}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Votre proposition (Produits correspondants, volumes, conditions tarifaires)
                  </label>
                  <textarea
                    rows={4}
                    value={proposalMessage}
                    onChange={(e) => setProposalMessage(e.target.value)}
                    required
                    placeholder="Bonjour, nous sommes producteurs certifiés et disposons des volumes correspondant exactement à votre recherche avec expédition rapide..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedBuyerForProposal(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-emerald-600 rounded-xl shadow-md transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Transmettre mon offre
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

