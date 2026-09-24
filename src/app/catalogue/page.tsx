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
  Eye,
  MapPin,
  BookOpen,
  Globe,
  Award,
  ArrowRightLeft,
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
    originCountry: "Côte d'Ivoire",
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
      country: "Côte d'Ivoire",
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
    originCountry: "Côte d'Ivoire",
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
      country: "Côte d'Ivoire",
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
      hasCatalogAdSpace: false,
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

interface SupplierCatalog {
  id: string;
  companyName: string;
  country: string;
  city: string;
  sector: string;
  isVerified: boolean;
  coverImage: string;
  productsCount: number;
  products: MockProduct[];
}

export default function CataloguePage() {
  const [activeTab, setActiveTab] = useState<'catalogues' | 'products' | 'buyers'>('catalogues');
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedCorridor, setSelectedCorridor] = useState<string>('all');
  const [onlyVerified, setOnlyVerified] = useState<boolean>(true);

  // Produits & Acheteurs & Catalogues Fournisseurs
  const [productsList, setProductsList] = useState<MockProduct[]>(SAMPLE_PRODUCTS);
  const [suppliersCatalogList, setSuppliersCatalogList] = useState<SupplierCatalog[]>([]);
  const [buyersList, setBuyersList] = useState<SponsoredBuyer[]>(INITIAL_BUYERS);

  // Modale catalogue complet d'un fournisseur
  const [selectedSupplierCatalog, setSelectedSupplierCatalog] = useState<SupplierCatalog | null>(null);

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
    async function loadData() {
      try {
        const resProd = await fetch('/api/products');
        if (resProd.ok) {
          const dataProd = await resProd.json();
          if (dataProd.products && Array.isArray(dataProd.products) && dataProd.products.length > 0) {
            const mappedProducts: MockProduct[] = dataProd.products.map((p: any) => ({
              id: p.id,
              title: p.title,
              slug: p.slug,
              description: p.description,
              category: p.category,
              originCountry: p.originCountry,
              moq: p.moq,
              unit: p.unit,
              priceMin: Number(p.priceMin) || 0,
              priceMax: Number(p.priceMax) || 0,
              currency: p.currency || 'EUR',
              images: p.images && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1608248597359-54d922336336?auto=format&fit=crop&q=80&w=800'],
              company: {
                id: p.company?.id || 'comp-unknown',
                companyName: p.company?.companyName || 'Entreprise Partenaire',
                country: p.company?.country || p.originCountry,
                city: p.company?.city || '',
                isVerified: p.company?.verificationStatus === 'VERIFIED',
                subscriptionPlan: 'PREMIUM',
                hasCatalogAdSpace: true,
              },
            }));
            setProductsList(mappedProducts);
          }
        }
      } catch (e) {
        console.log('Chargement produits en mode fallback local');
      }

      try {
        const resSupp = await fetch('/api/suppliers');
        if (resSupp.ok) {
          const dataSupp = await resSupp.json();
          if (dataSupp.suppliers && Array.isArray(dataSupp.suppliers) && dataSupp.suppliers.length > 0) {
            const mappedCatalogs: SupplierCatalog[] = dataSupp.suppliers.map((s: any) => {
              const supplierProds: MockProduct[] = (s.products || []).slice(0, 10).map((p: any) => ({
                id: p.id,
                title: p.title,
                slug: p.slug,
                description: p.description,
                category: p.category,
                originCountry: p.originCountry || s.country,
                moq: p.moq,
                unit: p.unit,
                priceMin: Number(p.priceMin) || 0,
                priceMax: Number(p.priceMax) || 0,
                currency: p.currency || 'EUR',
                images: p.images && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1608248597359-54d922336336?auto=format&fit=crop&q=80&w=800'],
                company: {
                  id: s.id,
                  companyName: s.companyName,
                  country: s.country,
                  city: s.city,
                  isVerified: s.verificationStatus === 'VERIFIED',
                  subscriptionPlan: 'PREMIUM',
                  hasCatalogAdSpace: true,
                },
              }));

              const coverImg = supplierProds.length > 0 && supplierProds[0].images?.[0]
                ? supplierProds[0].images[0]
                : 'https://images.unsplash.com/photo-1608248597359-54d922336336?auto=format&fit=crop&q=80&w=800';

              return {
                id: s.id,
                companyName: s.companyName,
                country: s.country,
                city: s.city,
                sector: s.sector,
                isVerified: s.verificationStatus === 'VERIFIED',
                coverImage: coverImg,
                productsCount: Math.min(s.products?.length || 0, 10),
                products: supplierProds,
              };
            });
            setSuppliersCatalogList(mappedCatalogs);
          }
        }
      } catch (e) {
        console.log('Erreur chargement catalogues fournisseurs');
      }

      try {
        const res = await fetch('/api/entrepreneurs/register');
        if (res.ok) {
          const data = await res.json();
          if (data.entrepreneurs && Array.isArray(data.entrepreneurs)) {
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
    loadData();
  }, []);

  // Filtrage par corridor commercial
  const matchesCorridor = (country: string, corridor: string) => {
    if (corridor === 'all') return true;
    if (corridor === 'sn-fr') return country === 'Sénégal' || country === 'France';
    if (corridor === 'ci-be') return country === "Côte d'Ivoire" || country === 'Belgique';
    if (corridor === 'cm-ue') return country === 'Cameroun' || country === 'France' || country === 'Belgique';
    if (corridor === 'uemoa-eu') return true;
    return true;
  };

  const filteredCatalogs = suppliersCatalogList.filter((cat) => {
    if (onlyVerified && !cat.isVerified) return false;
    if (selectedCategory !== 'all' && !cat.sector.toLowerCase().includes(selectedCategory.toLowerCase())) return false;
    if (selectedCountry !== 'all' && cat.country !== selectedCountry) return false;
    if (!matchesCorridor(cat.country, selectedCorridor)) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      const matchComp = cat.companyName.toLowerCase().includes(q);
      const matchSector = cat.sector.toLowerCase().includes(q);
      const matchProd = cat.products.some((p) => p.title.toLowerCase().includes(q));
      if (!matchComp && !matchSector && !matchProd) return false;
    }
    return true;
  });

  const filteredProducts = productsList.filter((prod) => {
    if (!prod.company.hasCatalogAdSpace) return false;
    if (onlyVerified && !prod.company.isVerified) return false;
    if (selectedCategory !== 'all' && !prod.category.toLowerCase().includes(selectedCategory.toLowerCase())) return false;
    if (selectedCountry !== 'all' && prod.originCountry !== selectedCountry) return false;
    if (!matchesCorridor(prod.originCountry, selectedCorridor)) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      const matchTitle = prod.title.toLowerCase().includes(q);
      const matchDesc = prod.description.toLowerCase().includes(q);
      const matchComp = prod.company.companyName.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchComp) return false;
    }
    return true;
  });

  const filteredBuyers = buyersList.filter((buyer) => {
    if (!buyer.hasCatalogAdSpace) return false;
    if (onlyVerified && !buyer.isKbisVerified) return false;
    if (selectedCountry !== 'all' && buyer.country !== selectedCountry) return false;
    if (!matchesCorridor(buyer.country, selectedCorridor)) return false;
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
    <div className="bg-[#0B132B] text-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* En-tête de page Header */}
        <div className="border-b border-slate-800 pb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 text-[#E5A93C] border border-[#D4AF37]/30 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                Catalogue & Espaces Publicitaires Certifiés
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Catalogue B2B & Vitrines Sourcing Transfrontalier
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Accédez directement aux offres des producteurs et grossistes agréés d&apos;Afrique et d&apos;Europe.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-3.5 py-2 rounded-xl shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Filtre KYB & Kbis Actif
              </div>
              <Link
                href="/tarifs"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] hover:from-[#E5A93C] hover:to-[#D4AF37] transition-all shadow-md"
              >
                <Megaphone className="w-3.5 h-3.5" />
                Découvrir nos tarifs publicitaires
              </Link>
            </div>
          </div>
        </div>

        {/* BARRE DE SÉLECTION DE CORRIDORS COMMERCIAUX */}
        <div className="glass-card p-4 rounded-2xl border border-[#D4AF37]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#E5A93C] uppercase tracking-wider shrink-0">
            <ArrowRightLeft className="w-4 h-4 text-[#D4AF37]" />
            <span>Sélection du Corridor :</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full">
            <button
              onClick={() => setSelectedCorridor('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                selectedCorridor === 'all'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Tous les Corridors
            </button>
            <button
              onClick={() => setSelectedCorridor('sn-fr')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                selectedCorridor === 'sn-fr'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🇸🇳 Sénégal ➔ 🇫🇷 France
            </button>
            <button
              onClick={() => setSelectedCorridor('ci-be')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                selectedCorridor === 'ci-be'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🇨🇮 Côte d&apos;Ivoire ➔ 🇧🇪 Belgique
            </button>
            <button
              onClick={() => setSelectedCorridor('cm-ue')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                selectedCorridor === 'cm-ue'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🇨🇲 Cameroun ➔ 🇪🇺 Europe
            </button>
          </div>
        </div>

        {/* Sélecteur d'Onglets principal */}
        <div className="flex border-b border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('catalogues')}
            className={`flex items-center gap-2 pb-4 px-6 font-extrabold text-sm transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'catalogues'
                ? 'border-[#D4AF37] text-[#E5A93C]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4 text-[#D4AF37]" />
            Vitrines Catalogues Fournisseurs
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'catalogues' ? 'bg-[#D4AF37]/20 text-[#E5A93C]' : 'bg-slate-800 text-slate-400'
            }`}>
              {filteredCatalogs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 pb-4 px-6 font-extrabold text-sm transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'products'
                ? 'border-[#D4AF37] text-[#E5A93C]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4 text-emerald-400" />
            Tous les Produits B2B
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'products' ? 'bg-[#D4AF37]/20 text-[#E5A93C]' : 'bg-slate-800 text-slate-400'
            }`}>
              {filteredProducts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('buyers')}
            className={`flex items-center gap-2 pb-4 px-6 font-extrabold text-sm transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'buyers'
                ? 'border-[#D4AF37] text-[#E5A93C]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4 text-amber-400" />
            Appels d&apos;Offres Acheteurs
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'buyers' ? 'bg-[#D4AF37]/20 text-[#E5A93C]' : 'bg-slate-800 text-slate-400'
            }`}>
              {filteredBuyers.length}
            </span>
          </button>
        </div>

        {/* Barre de Recherche et Filtres */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Champ Recherche */}
            <div className="md:col-span-5 relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder={
                  activeTab === 'catalogues'
                    ? 'Rechercher un fournisseur, secteur ou produit...'
                    : activeTab === 'products'
                    ? 'Rechercher un produit, ingrédient ou grossiste...'
                    : 'Rechercher un appel d\'offres, secteur ou profil acheteur...'
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/90 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-sm text-white placeholder-slate-500"
              />
            </div>

            {/* Filtre Catégorie */}
            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-slate-200 focus:ring-2 focus:ring-[#D4AF37]"
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
                className="w-full px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-slate-200 focus:ring-2 focus:ring-[#D4AF37]"
              >
                <option value="all">Tous pays</option>
                <option value="Sénégal">Sénégal</option>
                <option value="Côte d'Ivoire">Côte d&apos;Ivoire</option>
                <option value="Cameroun">Cameroun</option>
                <option value="France">France</option>
                <option value="Belgique">Belgique</option>
                <option value="Madagascar">Madagascar</option>
              </select>
            </div>

            {/* Toggle Uniquement Vérifiés */}
            <div className="md:col-span-2 flex items-center justify-center">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-300 bg-slate-900 px-3 py-2.5 rounded-xl border border-slate-700 hover:border-[#D4AF37] transition-colors w-full justify-center">
                <input
                  type="checkbox"
                  checked={onlyVerified}
                  onChange={(e) => setOnlyVerified(e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-emerald-500 h-4 w-4 bg-slate-950 border-slate-700"
                />
                <span>Vérifiés seuls</span>
              </label>
            </div>
          </div>
        </div>

        {/* VUE 0 : VITRINES CATALOGUES FOURNISSEURS */}
        {activeTab === 'catalogues' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCatalogs.map((cat) => (
              <div
                key={cat.id}
                className="glass-card glass-card-hover rounded-3xl overflow-hidden flex flex-col group border border-[#D4AF37]/20 hover:border-[#D4AF37]"
              >
                <div
                  onClick={() => setSelectedSupplierCatalog(cat)}
                  className="relative h-56 bg-slate-950 cursor-pointer overflow-hidden group/img"
                >
                  <img
                    src={cat.coverImage}
                    alt={`Catalogue ${cat.companyName}`}
                    className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500 opacity-80 group-hover/img:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B] via-[#0B132B]/30 to-transparent" />
                  
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-slate-950 shadow-md">
                      <Sparkles className="w-3.5 h-3.5 inline mr-1" /> Vitrine Catalogue
                    </span>
                    {cat.isVerified ? (
                      <BadgeVerified />
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-950/80 text-amber-300 border border-amber-500/30">
                        Vérification en cours
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3 bg-emerald-950/90 text-emerald-300 font-extrabold px-3 py-1 rounded-xl text-xs shadow-md flex items-center gap-1.5 border border-emerald-500/40">
                    <Package className="w-4 h-4 text-emerald-400" />
                    <span>{cat.productsCount} / 10 produits dispo</span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <span className="text-[11px] uppercase tracking-widest font-black text-[#E5A93C] bg-slate-950/80 px-2.5 py-0.5 rounded border border-[#D4AF37]/30">
                      {cat.sector}
                    </span>
                    <h3 className="text-lg font-black text-white mt-1 group-hover:text-amber-300 transition-colors">
                      {cat.companyName}
                    </h3>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4 bg-slate-900/60">
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2 font-semibold text-emerald-400">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span>{cat.city ? `${cat.city}, ` : ''}{cat.country}</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed line-clamp-2">
                      {cat.products.length > 0
                        ? `Gamme : ${cat.products.map(p => p.title).join(', ')}`
                        : 'Catalogue B2B disponible avec offres tarifaires grossiste.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800">
                    <button
                      onClick={() => setSelectedSupplierCatalog(cat)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] via-[#E5A93C] to-[#B8860B] hover:from-[#E5A93C] hover:to-[#D4AF37] transition-all shadow-md"
                    >
                      <BookOpen className="w-4 h-4 text-slate-950" />
                      Voir le catalogue complet ({cat.productsCount} produits)
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VUE 1 : OFFRES PRODUITS */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="glass-card glass-card-hover rounded-3xl overflow-hidden flex flex-col justify-between group border border-slate-800 hover:border-[#D4AF37]"
              >
                <div className="relative h-48 bg-slate-950 overflow-hidden">
                  <img
                    src={prod.images[0]}
                    alt={prod.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                    {prod.company.isVerified ? (
                      <BadgeVerified />
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-950 text-amber-300 border border-amber-500/30">
                        Vérification en cours
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-slate-950/90 text-slate-300 px-2.5 py-1 rounded-md text-xs font-bold border border-slate-700">
                    Origine : {prod.originCountry}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-500/30">
                        {prod.category}
                      </span>
                      <span className="font-semibold text-slate-300">
                        {prod.company.companyName}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-white line-clamp-2 group-hover:text-amber-300 transition-colors">
                      {prod.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                          Prix Indicatif B2B
                        </p>
                        <p className="text-base font-black text-white">
                          {prod.priceMin.toFixed(2)} - {prod.priceMax.toFixed(2)} {prod.currency}
                          <span className="text-xs font-normal text-slate-400"> / {prod.unit}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                          Commande Min. (MOQ)
                        </p>
                        <p className="text-xs font-bold text-emerald-400 flex items-center gap-1 justify-end bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                          <Package className="w-3.5 h-3.5" />
                          {prod.moq} {prod.unit}s
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedProductForQuote(prod);
                        setQuoteQuantity(prod.moq);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-extrabold text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] hover:from-[#E5A93C] hover:to-[#D4AF37] transition-all shadow-md"
                    >
                      <Send className="w-3.5 h-3.5 text-slate-950" />
                      Demander un devis au grossiste
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VUE 2 : APPELS D'OFFRES ACHETEURS */}
        {activeTab === 'buyers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBuyers.map((buyer) => (
              <div
                key={buyer.id}
                className="glass-card rounded-3xl border border-slate-800 p-6 flex flex-col justify-between space-y-5 hover:border-[#D4AF37] transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#D4AF37] text-slate-950 flex items-center gap-1 shadow-sm">
                          <Sparkles className="w-3 h-3" /> Espace Publicitaire Acheteur
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-white mt-2 flex items-center gap-2">
                        {buyer.companyName}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {buyer.buyerType} &bull; {buyer.city}, {buyer.country}
                      </p>
                    </div>
                    {buyer.isKbisVerified && (
                      <BadgeVerified />
                    )}
                  </div>

                  <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#E5A93C] uppercase text-[10px] tracking-wider">
                        Besoin de sourcing / Appel d&apos;offres
                      </span>
                      <span className="font-extrabold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-500/30">
                        Budget : {buyer.estimatedBudget}
                      </span>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed font-medium">
                      &ldquo;{buyer.sourcingNeeds || 'Recherche de fournisseurs fiables et partenaires grossistes.'}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    Contact certifié : <span className="font-bold text-white">{buyer.fullName}</span>
                  </div>
                  <button
                    onClick={() => setSelectedBuyerForProposal(buyer)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] hover:from-[#E5A93C] hover:to-[#D4AF37] transition-all shadow-md"
                  >
                    <Send className="w-3.5 h-3.5 text-slate-950" />
                    Proposer mon catalogue
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODALE CATALOGUE DU FOURNISSEUR */}
      {selectedSupplierCatalog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="glass-card rounded-3xl max-w-4xl w-full p-6 sm:p-8 border border-[#D4AF37]/40 shadow-2xl relative my-8 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSelectedSupplierCatalog(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-800 pb-5 mb-6 pr-10">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-slate-950 flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" /> Vitrine Catalogue Officielle
                </span>
                {selectedSupplierCatalog.isVerified && (
                  <BadgeVerified />
                )}
              </div>

              <h2 className="text-2xl font-black text-white mt-2">
                {selectedSupplierCatalog.companyName}
              </h2>
              <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>{selectedSupplierCatalog.city ? `${selectedSupplierCatalog.city}, ` : ''}{selectedSupplierCatalog.country}</span>
                <span className="text-slate-600">&bull;</span>
                <span className="font-semibold text-amber-300">{selectedSupplierCatalog.sector}</span>
              </p>
            </div>

            {selectedSupplierCatalog.products.length === 0 ? (
              <div className="py-12 text-center text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800">
                <Package className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                <p className="font-medium text-sm">Ce fournisseur n&apos;a pas encore ajouté d&apos;articles à son catalogue.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-h-[60vh] overflow-y-auto pr-1">
                {selectedSupplierCatalog.products.map((p) => (
                  <div
                    key={p.id}
                    className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between hover:border-[#D4AF37] transition-all p-4 space-y-3"
                  >
                    <div className="relative h-36 rounded-xl overflow-hidden bg-slate-950">
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-black text-sm text-white line-clamp-1">{p.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Prix B2B</span>
                        <span className="font-black text-white">{p.priceMin} - {p.priceMax} {p.currency}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">MOQ</span>
                        <span className="font-bold text-emerald-400">{p.moq} {p.unit}s</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedProductForQuote(p);
                        setQuoteQuantity(p.moq);
                      }}
                      className="w-full py-2 px-3 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] hover:from-[#E5A93C] hover:to-[#D4AF37] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5 text-slate-950" />
                      Demander un devis
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODALE DE DEMANDE DE DEVIS PRODUIT */}
      {selectedProductForQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="glass-card rounded-3xl max-w-lg w-full p-6 border border-[#D4AF37]/40 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSelectedProductForQuote(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {quoteSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-950 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-white">Demande de devis transmise !</h3>
                <p className="text-sm text-slate-300 max-w-sm mx-auto">
                  Votre demande a été envoyée directement au fournisseur{' '}
                  <span className="font-bold text-amber-300">{selectedProductForQuote.company.companyName}</span>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendQuote} className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <span className="text-xs font-extrabold text-[#E5A93C] uppercase tracking-wider">
                    Mise en Relation B2B
                  </span>
                  <h3 className="text-lg font-black text-white mt-1">
                    Demander un devis : {selectedProductForQuote.title}
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Quantité souhaitée ({selectedProductForQuote.unit}s) &bull; MOQ : {selectedProductForQuote.moq}
                  </label>
                  <input
                    type="number"
                    min={selectedProductForQuote.moq}
                    value={quoteQuantity}
                    onChange={(e) => setQuoteQuantity(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Message & Spécifications de livraison
                  </label>
                  <textarea
                    rows={4}
                    value={quoteMessage}
                    onChange={(e) => setQuoteMessage(e.target.value)}
                    required
                    placeholder="Précisez votre port de livraison, vos besoins en certificat phytosanitaire..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedProductForQuote(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] hover:from-[#E5A93C] hover:to-[#D4AF37] rounded-xl shadow-md transition-all"
                  >
                    <Send className="w-3.5 h-3.5 text-slate-950" />
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
