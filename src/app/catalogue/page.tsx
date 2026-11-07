'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Plus,
  ImageOff,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Maximize2,
  Minimize2,
  Columns,
  Lock,
  EyeOff,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { BadgeVerified } from '@/components/BadgeVerified';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import {
  getLocalizedCountry,
  getLocalizedSector,
  getLocalizedProductUnit,
} from '@/locales';

/** Photo produit validee par Lougara. Aucun visuel de remplacement : un simple pictogramme neutre si absente. */
function CatalogImage({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-600" aria-label={alt}>
        <ImageOff className="w-8 h-8" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} className={className} />
  );
}

interface CatalogProductCardProps {
  product: MockProduct;
  locale: string;
  onRequestQuote: (p: MockProduct) => void;
  onViewProduct?: (p: MockProduct) => void;
  showCompanyHeader?: boolean;
}

/** Carte produit avec galerie multi-photos validées et description complète dépliable */
function CatalogProductCard({
  product,
  locale,
  onRequestQuote,
  onViewProduct,
  showCompanyHeader = true,
}: CatalogProductCardProps) {
  const { t } = useLanguage();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : [];
  const currentImage = images[activeImageIndex] || '';
  const isLongDesc = (product.description || '').length > 110;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div
      onClick={() => onViewProduct && onViewProduct(product)}
      className="glass-card glass-card-hover rounded-3xl overflow-hidden flex flex-col justify-between group border border-slate-800 hover:border-[#D4AF37] transition-all cursor-pointer"
    >
      {/* ZONE IMAGE DU PRODUIT */}
      <div className="relative h-56 bg-slate-950 overflow-hidden flex flex-col justify-between">
        <CatalogImage
          src={currentImage}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-300 opacity-90 group-hover:scale-105"
        />

        {/* BADGES EN HAUT DE L'IMAGE */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start z-10">
          {product.company.isVerified ? (
            <BadgeVerified />
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-950 text-amber-300 border border-amber-500/30">
              {t.catalogue.verificationInProgress}
            </span>
          )}
          {product.isLinkApproved && product.externalLink && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-950/90 text-amber-300 border border-amber-500/40 shadow flex items-center gap-1 backdrop-blur-sm">
              <Globe className="w-3 h-3 text-amber-400" />
              <span>Lien officiel validé</span>
            </span>
          )}
        </div>

        {/* BOUTON AGRANDIR AU SURVOL */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          {images.length > 1 && (
            <div className="bg-slate-950/85 backdrop-blur-sm text-[#E5A93C] border border-[#D4AF37]/30 px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 shadow-md">
              <span>Photo {activeImageIndex + 1} / {images.length}</span>
            </div>
          )}
          <span className="p-1.5 rounded-full bg-slate-950/80 text-slate-300 group-hover:text-amber-400 group-hover:border-amber-400/50 border border-slate-700 backdrop-blur-sm shadow transition-all">
            <Maximize2 className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* FLÈCHES DE NAVIGATION RAPIDE SI PLUSIEURS IMAGES */}
        {images.length > 1 && (
          <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none z-10">
            <button
              type="button"
              onClick={handlePrevImage}
              className="p-1.5 rounded-full bg-slate-950/80 text-white hover:text-[#D4AF37] hover:bg-slate-900 border border-slate-700/80 pointer-events-auto transition-all shadow-md"
              aria-label="Photo précédente"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              className="p-1.5 rounded-full bg-slate-950/80 text-white hover:text-[#D4AF37] hover:bg-slate-900 border border-slate-700/80 pointer-events-auto transition-all shadow-md"
              aria-label="Photo suivante"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* BANDEAU BAS SUR L'IMAGE : VIGNETTES ET ORIGINE */}
        <div className="absolute bottom-2 inset-x-3 flex items-end justify-between gap-2 z-10">
          {images.length > 1 ? (
            <div className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-sm p-1 rounded-xl border border-slate-800">
              {images.map((imgUrl, idx) => (
                <button
                  key={imgUrl}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(idx);
                  }}
                  className={`w-7 h-7 rounded-lg overflow-hidden border transition-all ${
                    activeImageIndex === idx
                      ? 'border-[#D4AF37] ring-1 ring-[#D4AF37] scale-105'
                      : 'border-slate-700 opacity-60 hover:opacity-100'
                  }`}
                  aria-label={`Afficher la photo ${idx + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgUrl} alt={`Vignette ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          ) : (
            <div />
          )}

          <div className="bg-slate-950/90 text-slate-300 px-2.5 py-1 rounded-md text-[11px] font-bold border border-slate-700 shrink-0">
            {t.catalogue.originLabel} {getLocalizedCountry(product.originCountry, locale)}
          </div>
        </div>
      </div>

      {/* CONTENU TEXTE DU PRODUIT */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {showCompanyHeader && (
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-500/30">
                {getLocalizedSector(product.category, locale)}
              </span>
              <span className="font-semibold text-slate-300 truncate max-w-[150px]">
                {product.company.companyName}
              </span>
            </div>
          )}

          <h3 className="text-base font-black text-white group-hover:text-amber-300 transition-colors">
            {product.title}
          </h3>

          {/* DESCRIPTION LISIBLE DANS SON ENSEMBLE */}
          <div className="space-y-1">
            <p
              className={`text-xs text-slate-300 leading-relaxed whitespace-pre-line break-words ${
                isExpanded ? 'max-h-72 overflow-y-auto pr-1' : isLongDesc ? 'line-clamp-2' : ''
              }`}
            >
              {product.description}
            </p>
            {isLongDesc && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[11px] font-extrabold text-[#E5A93C] hover:text-[#D4AF37] flex items-center gap-1 transition-colors pt-0.5"
              >
                <span>{isExpanded ? 'Réduire la description ▲' : 'Lire la description complète ▼'}</span>
              </button>
            )}
          </div>
        </div>

        {/* TARIFS, MOQ & ACTION DE MISE EN RELATION */}
        <div className="pt-3 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                {t.catalogue.indicativeB2bPrice}
              </p>
              <p className="text-base font-black text-white">
                {formatPriceRange(product.priceMin, product.priceMax, product.currency)}
                <span className="text-xs font-normal text-slate-400"> / {getLocalizedProductUnit(product.unit, product.title, locale)}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                {t.catalogue.minOrderMoq}
              </p>
              <p className="text-xs font-bold text-emerald-400 flex items-center gap-1 justify-end bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                <Package className="w-3.5 h-3.5" />
                {product.moq} {getLocalizedProductUnit(product.unit, product.title, locale)}s
              </p>
            </div>
          </div>

          {product.isLinkApproved && product.externalLink && (
            <a
              href={product.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-extrabold text-amber-300 bg-amber-950/70 hover:bg-amber-900/80 border border-amber-500/40 transition-all shadow-sm"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>Visiter le site en ligne</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRequestQuote(product);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-extrabold text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] hover:from-[#E5A93C] hover:to-[#D4AF37] transition-all shadow-md"
          >
            <Send className="w-3.5 h-3.5 text-slate-950" />
            {t.catalogue.requestWholesaleQuote}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Prix indicatif uniquement s'il a ete renseigne par le fournisseur. */
function formatPriceRange(min: number, max: number, currency: string): string {
  if (!min && !max) return 'Prix sur demande';
  if (min && max && min !== max) return `${min.toFixed(2)} - ${max.toFixed(2)} ${currency}`;
  return `${(min || max).toFixed(2)} ${currency}`;
}

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
  externalLink?: string | null;
  isLinkApproved?: boolean;
  company: {
    id: string;
    companyName: string;
    email?: string;
    country: string;
    city: string;
    isVerified: boolean;
    isPublished?: boolean;
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



interface SupplierCatalog {
  id: string;
  companyName: string;
  email?: string;
  contactName?: string;
  country: string;
  city: string;
  sector: string;
  isVerified: boolean;
  isPublished?: boolean;
  coverImage: string;
  productsCount: number;
  products: MockProduct[];
}

export default function CataloguePage() {
  const { t, locale } = useLanguage();
  const { user, loginWithPassword } = useAuth();
  const [activeTab, setActiveTab] = useState<'catalogues' | 'products' | 'buyers'>('catalogues');
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedCorridor, setSelectedCorridor] = useState<string>('all');
  const [onlyVerified, setOnlyVerified] = useState<boolean>(true);

  // Produits & Acheteurs & Catalogues Fournisseurs réels issus de la base (démarrage à 0)
  const [productsList, setProductsList] = useState<MockProduct[]>([]);
  const [suppliersCatalogList, setSuppliersCatalogList] = useState<SupplierCatalog[]>([]);
  const [buyersList, setBuyersList] = useState<SponsoredBuyer[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(true);

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

  // Modale Produit : Plein Écran & Écran Partagé
  const [viewProduct, setViewProduct] = useState<MockProduct | null>(null);
  const [isForcedFullScreen, setIsForcedFullScreen] = useState<boolean>(false);
  const [viewProductImageIndex, setViewProductImageIndex] = useState<number>(0);

  // Modale de Connexion directe depuis un Catalogue Client (e-mail pré-rempli)
  const [catalogLoginTarget, setCatalogLoginTarget] = useState<{
    companyName: string;
    email: string;
    contactName?: string;
    country?: string;
  } | null>(null);
  const [catalogLoginMode, setCatalogLoginMode] = useState<'login' | 'create_password'>('login');
  const [catalogLoginEmail, setCatalogLoginEmail] = useState<string>('');
  const [catalogLoginPassword, setCatalogLoginPassword] = useState<string>('');
  const [catalogLoginConfirmPassword, setCatalogLoginConfirmPassword] = useState<string>('');
  const [showCatalogLoginPwd, setShowCatalogLoginPwd] = useState<boolean>(false);
  const [isCatalogLoggingIn, setIsCatalogLoggingIn] = useState<boolean>(false);
  const [catalogLoginError, setCatalogLoginError] = useState<string | null>(null);
  const [catalogLoginSuccess, setCatalogLoginSuccess] = useState<string | null>(null);

  const handleOpenCatalogLogin = (target: {
    companyName: string;
    email: string;
    contactName?: string;
    country?: string;
  }) => {
    setCatalogLoginTarget(target);
    setCatalogLoginEmail((target.email || '').trim().toLowerCase());
    setCatalogLoginPassword('');
    setCatalogLoginConfirmPassword('');
    setCatalogLoginMode('login');
    setCatalogLoginError(null);
    setCatalogLoginSuccess(null);
  };

  const handleCatalogLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatalogLoginError(null);
    setCatalogLoginSuccess(null);

    const cleanEmail = catalogLoginEmail.trim().toLowerCase();
    if (!cleanEmail || !catalogLoginPassword) {
      setCatalogLoginError('Veuillez renseigner votre mot de passe.');
      return;
    }

    setIsCatalogLoggingIn(true);
    try {
      const res = await loginWithPassword(cleanEmail, catalogLoginPassword);
      if (!res.success) {
        setCatalogLoginError(res.error || 'Mot de passe incorrect pour ce catalogue.');
        return;
      }
      setCatalogLoginPassword('');
      setCatalogLoginSuccess(`Connexion réussie au catalogue ${catalogLoginTarget?.companyName || ''} !`);
    } finally {
      setIsCatalogLoggingIn(false);
    }
  };

  const handleCatalogCreatePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatalogLoginError(null);
    setCatalogLoginSuccess(null);

    const cleanEmail = catalogLoginEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setCatalogLoginError('Adresse e-mail invalide.');
      return;
    }
    if (!catalogLoginPassword || catalogLoginPassword.trim().length < 6) {
      setCatalogLoginError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (catalogLoginPassword !== catalogLoginConfirmPassword) {
      setCatalogLoginError('La confirmation du mot de passe ne correspond pas.');
      return;
    }

    setIsCatalogLoggingIn(true);
    try {
      const res = await fetch('/api/auth/contact-password-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          contactName: catalogLoginTarget?.contactName || catalogLoginTarget?.companyName || 'Client Lougara',
          companyName: catalogLoginTarget?.companyName || 'Catalogue Client',
          country: catalogLoginTarget?.country || 'Sénégal',
          password: catalogLoginPassword.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setCatalogLoginError(data.error || 'Impossible de créer le mot de passe.');
        return;
      }

      const loginRes = await loginWithPassword(cleanEmail, catalogLoginPassword.trim());
      setCatalogLoginPassword('');
      setCatalogLoginConfirmPassword('');
      if (loginRes.success) {
        setCatalogLoginSuccess(
          `Votre mot de passe a été créé, un message de confirmation vous a été envoyé à ${cleanEmail}, et vous êtes désormais connecté !`
        );
      } else {
        setCatalogLoginMode('login');
        setCatalogLoginSuccess(
          data.message || `Mot de passe enregistré et message envoyé à ${cleanEmail}. Vous pouvez maintenant vous connecter.`
        );
      }
    } catch {
      setCatalogLoginError('Erreur réseau lors de la création du mot de passe.');
    } finally {
      setIsCatalogLoggingIn(false);
    }
  };

  // Tous les produits du même fournisseur que le produit sélectionné
  const sameSupplierProducts = useMemo(() => {
    if (!viewProduct) return [];
    return productsList.filter(
      (p) =>
        (p.company?.id && p.company.id === viewProduct.company?.id) ||
        (p.company?.companyName &&
          viewProduct.company?.companyName &&
          p.company.companyName.toLowerCase() === viewProduct.company.companyName.toLowerCase())
    );
  }, [viewProduct, productsList]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('lougara_hidden_companies');
          } catch (e) {}
        }
        // Chargement parallèle non bloquant des 3 sources de données avec horodatage anti-cache
        const timestamp = Date.now();
        const [prodResult, suppResult, buyersResult] = await Promise.allSettled([
          fetch(`/api/products?_t=${timestamp}`, { cache: 'no-store' }),
          fetch(`/api/suppliers?_t=${timestamp}`, { cache: 'no-store' }),
          fetch(`/api/entrepreneurs/register?_t=${timestamp}`, { cache: 'no-store' }),
        ]);

        if (!isMounted) return;

        if (prodResult.status === 'fulfilled' && prodResult.value.ok) {
          const dataProd = await prodResult.value.json();
          if (dataProd.products && Array.isArray(dataProd.products)) {
            const mappedProducts: MockProduct[] = dataProd.products
              .filter((p: any) => p.isPublished !== false && p.company?.isPublished !== false)
              .map((p: any) => ({
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
                images: Array.isArray(p.images) ? p.images : [],
                externalLink: p.externalLink || p.company?.website || null,
                isLinkApproved: Boolean(p.isLinkApproved),
                company: {
                  id: p.company?.id || 'comp-unknown',
                  companyName: p.company?.companyName || 'Entreprise Partenaire',
                  email: (p.company?.user?.email || p.company?.email || '').trim().toLowerCase(),
                  country: p.company?.country || p.originCountry,
                  city: p.company?.city || '',
                  isVerified: p.company?.verificationStatus === 'VERIFIED',
                  isPublished: p.company?.isPublished !== false,
                  subscriptionPlan: 'PREMIUM',
                  hasCatalogAdSpace: true,
                },
              }));
            setProductsList(mappedProducts);
          }
        }

        if (suppResult.status === 'fulfilled' && suppResult.value.ok) {
          const dataSupp = await suppResult.value.json();
          if (dataSupp.suppliers && Array.isArray(dataSupp.suppliers)) {
            const publishedSuppliers = dataSupp.suppliers.filter((s: any) => s.isPublished !== false);
            const mappedCatalogs: SupplierCatalog[] = publishedSuppliers.map((s: any) => {
              const supplierEmail = (
                s.user?.email ||
                s.email ||
                `contact@${String(s.companyName || 'entreprise').toLowerCase().replace(/[^a-z0-9]/g, '')}.fr`
              )
                .trim()
                .toLowerCase();
              const supplierContactName = s.user
                ? `${s.user.firstName || ''} ${s.user.lastName || ''}`.trim()
                : s.companyName;

              const supplierProds: MockProduct[] = (s.products || [])
                .filter((p: any) => p.isPublished !== false)
                .slice(0, 10)
                .map((p: any) => ({
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
                  images: Array.isArray(p.images) ? p.images : [],
                  externalLink: p.externalLink || s.website || null,
                  isLinkApproved: Boolean(p.isLinkApproved),
                  company: {
                    id: s.id,
                    companyName: s.companyName,
                    email: supplierEmail,
                    country: s.country,
                    city: s.city,
                    isVerified: s.verificationStatus === 'VERIFIED',
                    isPublished: s.isPublished !== false,
                    subscriptionPlan: 'PREMIUM',
                    hasCatalogAdSpace: true,
                  },
                }));

              const coverImg = supplierProds.length > 0 && supplierProds[0].images?.[0]
                ? supplierProds[0].images[0]
                : '';

              return {
                id: s.id,
                companyName: s.companyName,
                email: supplierEmail,
                contactName: supplierContactName,
                country: s.country,
                city: s.city,
                sector: s.sector,
                isVerified: s.verificationStatus === 'VERIFIED',
                isPublished: s.isPublished !== false,
                coverImage: coverImg,
                productsCount: Math.min(supplierProds.length, 10),
                products: supplierProds,
              };
            });
            setSuppliersCatalogList(mappedCatalogs);
          }
        }

        if (buyersResult.status === 'fulfilled' && buyersResult.value.ok) {
          const data = await buyersResult.value.json();
          if (data.entrepreneurs && Array.isArray(data.entrepreneurs)) {
            const sponsored = data.entrepreneurs.filter((e: any) => e.hasCatalogAdSpace === true);
            setBuyersList(sponsored);
          }
        }
      } catch (e) {
        console.log('Chargement catalogue en mode local déconnecté');
      } finally {
        if (isMounted) setIsSyncing(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
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

  const filteredCatalogs = useMemo(() => {
    return suppliersCatalogList.filter((cat) => {
      // Seule la base de données Supabase / l'état de publication réel fait foi
      if (cat.isPublished === false) return false;
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
  }, [suppliersCatalogList, onlyVerified, selectedCategory, selectedCountry, selectedCorridor, query]);

  const filteredProducts = useMemo(() => {
    return productsList.filter((prod) => {
      // Seule la base de données Supabase / l'état de publication réel fait foi
      if (prod.company?.isPublished === false) return false;
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
  }, [productsList, onlyVerified, selectedCategory, selectedCountry, selectedCorridor, query]);

  const filteredBuyers = useMemo(() => {
    return buyersList.filter((buyer) => {
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
  }, [buyersList, onlyVerified, selectedCountry, selectedCorridor, selectedCategory, query]);

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
                {locale === 'fr' ? 'Catalogue & Espaces Publicitaires Certifiés' : 'Certified B2B Catalog & Verified Showcases'}
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {t.catalogue.title}
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                {t.catalogue.subtitle}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-3.5 py-2 rounded-xl shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {locale === 'fr' ? 'Filtre KYB & Kbis Actif' : 'KYB & Legal Audit Filter Active'}
              </div>
              <Link
                href="/tarifs"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] hover:from-[#E5A93C] hover:to-[#D4AF37] transition-all shadow-md"
              >
                <Megaphone className="w-3.5 h-3.5" />
                {locale === 'fr' ? 'Découvrir nos tarifs' : 'View pricing & plans'}
              </Link>
            </div>
          </div>
        </div>

        {/* BARRE DE SÉLECTION DE CORRIDORS COMMERCIAUX */}
        <div className="glass-card p-4 rounded-2xl border border-[#D4AF37]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#E5A93C] uppercase tracking-wider shrink-0">
            <ArrowRightLeft className="w-4 h-4 text-[#D4AF37]" />
            <span>{t.catalogue.filterCorridorLabel}</span>
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
              {t.catalogue.allCorridors}
            </button>
            <button
              onClick={() => setSelectedCorridor('sn-fr')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                selectedCorridor === 'sn-fr'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🇸🇳 {getLocalizedCountry('Sénégal', locale)} ➔ 🇫🇷 France
            </button>
            <button
              onClick={() => setSelectedCorridor('ci-be')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                selectedCorridor === 'ci-be'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🇨🇮 {getLocalizedCountry("Côte d'Ivoire", locale)} ➔ 🇧🇪 {getLocalizedCountry('Belgique', locale)}
            </button>
            <button
              onClick={() => setSelectedCorridor('cm-ue')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                selectedCorridor === 'cm-ue'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🇨🇲 {getLocalizedCountry('Cameroun', locale)} ➔ 🇪🇺 Europe
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
            <span>{t.catalogue.tabShowcases}</span>
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
            <span>{t.catalogue.tabAllProducts}</span>
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
            <span>{t.catalogue.tabBuyerRfqs}</span>
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
                  locale === 'fr'
                    ? (activeTab === 'catalogues'
                        ? 'Rechercher un fournisseur, secteur ou produit...'
                        : activeTab === 'products'
                        ? 'Rechercher un produit, ingrédient ou grossiste...'
                        : 'Rechercher un appel d\'offres, secteur ou profil acheteur...')
                    : (activeTab === 'catalogues'
                        ? 'Search for a supplier, sector, or product...'
                        : activeTab === 'products'
                        ? 'Search for a product, ingredient, or wholesaler...'
                        : 'Search for an RFQ, sector, or buyer profile...')
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
                <option value="all">{t.catalogue.filterAllCategories}</option>
                <option value="Cosmétique">{t.footer.sectorCosmetic}</option>
                <option value="Textile">{t.footer.sectorTextile}</option>
                <option value="Agroalimentaire">{t.footer.sectorAgro}</option>
                <option value="Technologies">{locale === 'fr' ? 'Technologies & Numérique' : 'Tech & Hardware'}</option>
                <option value="Services">{locale === 'fr' ? 'Services & Conseil B2B' : 'B2B Consulting & Services'}</option>
                <option value="Artisanat">{t.footer.sectorCraft}</option>
                <option value="Emballages">{locale === 'fr' ? 'Emballages & Packaging' : 'Packaging & Containers'}</option>
              </select>
            </div>

            {/* Filtre Pays */}
            <div className="md:col-span-2">
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-slate-200 focus:ring-2 focus:ring-[#D4AF37]"
              >
                <option value="all">{t.catalogue.filterAllCountries}</option>
                <option value="Sénégal">{getLocalizedCountry('Sénégal', locale)}</option>
                <option value="Côte d'Ivoire">{getLocalizedCountry("Côte d'Ivoire", locale)}</option>
                <option value="Cameroun">{getLocalizedCountry('Cameroun', locale)}</option>
                <option value="Maroc">{getLocalizedCountry('Maroc', locale)}</option>
                <option value="RDC">{getLocalizedCountry('RDC', locale)}</option>
                <option value="France">{getLocalizedCountry('France', locale)}</option>
                <option value="Belgique">{getLocalizedCountry('Belgique', locale)}</option>
                <option value="Madagascar">{getLocalizedCountry('Madagascar', locale)}</option>
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
                <span>{t.catalogue.filterVerifiedOnly}</span>
              </label>
            </div>
          </div>
        </div>

        {/* VUE 0 : VITRINES CATALOGUES FOURNISSEURS */}
        {activeTab === 'catalogues' && (
          filteredCatalogs.length === 0 ? (
            <div className="glass-card p-12 rounded-3xl border border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#E5A93C] mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Aucun catalogue fournisseur disponible</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                La plateforme démarre avec une base de données vierge (0 donnée fictive). Les catalogues des producteurs et grossistes agréés apparaîtront ici dès validation de leur audit KYB.
              </p>
              <div className="pt-2">
                <Link
                  href="/devenir-fournisseur"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] hover:from-[#E5A93C] hover:to-[#D4AF37] transition-all shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Déposer un dossier Fournisseur</span>
                </Link>
              </div>
            </div>
          ) : (
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
                  <CatalogImage
                    src={cat.coverImage}
                    alt={cat.companyName}
                    className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500 opacity-80 group-hover/img:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B] via-[#0B132B]/30 to-transparent" />
                  
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-slate-950 shadow-md">
                      <Sparkles className="w-3.5 h-3.5 inline mr-1" /> {t.catalogue.showcaseBadge}
                    </span>
                    {cat.isVerified ? (
                      <BadgeVerified />
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-950/80 text-amber-300 border border-amber-500/30">
                        {t.catalogue.verificationInProgress}
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3 bg-emerald-950/90 text-emerald-300 font-extrabold px-3 py-1 rounded-xl text-xs shadow-md flex items-center gap-1.5 border border-emerald-500/40">
                    <Package className="w-4 h-4 text-emerald-400" />
                    <span>
                      {cat.productsCount} / 10{' '}
                      {cat.productsCount > 1
                        ? t.catalogue.productsAvailable
                        : t.catalogue.productsAvailableSingular}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <span className="text-[11px] uppercase tracking-widest font-black text-[#E5A93C] bg-slate-950/80 px-2.5 py-0.5 rounded border border-[#D4AF37]/30">
                      {getLocalizedSector(cat.sector, locale)}
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
                      <span>{cat.city ? `${cat.city}, ` : ''}{getLocalizedCountry(cat.country, locale)}</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed line-clamp-2">
                      {cat.products.length > 0
                        ? `${t.catalogue.offeringsPrefix} ${cat.products.map(p => p.title).join(', ')}`
                        : t.catalogue.defaultCatalogDesc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    {(() => {
                      const approvedLink = cat.products.find(
                        (p) => p.isLinkApproved && p.externalLink
                      )?.externalLink;
                      if (!approvedLink) return null;
                      return (
                        <a
                          href={approvedLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-extrabold text-amber-300 bg-amber-950/75 hover:bg-amber-900/80 border border-amber-500/40 transition-all shadow-sm"
                        >
                          <Globe className="w-3.5 h-3.5 text-amber-400" />
                          <span>Visiter le site / l&apos;application en ligne</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      );
                    })()}

                    <button
                      onClick={() => setSelectedSupplierCatalog(cat)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] via-[#E5A93C] to-[#B8860B] hover:from-[#E5A93C] hover:to-[#D4AF37] transition-all shadow-md"
                    >
                      <BookOpen className="w-4 h-4 text-slate-950" />
                      {t.catalogue.viewFullCatalog} ({cat.productsCount}{' '}
                      {cat.productsCount > 1 ? t.catalogue.productUnit : t.catalogue.productUnitSingular})
                    </button>

                    {user && cat.email && user.email.toLowerCase() === cat.email.toLowerCase() ? (
                      <Link
                        href="/mon-catalogue"
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-extrabold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-500/40 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Gérer mon catalogue (Connecté)</span>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenCatalogLogin({
                            companyName: cat.companyName,
                            email: cat.email || '',
                            contactName: cat.contactName,
                            country: cat.country,
                          })
                        }
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-extrabold text-amber-300 bg-slate-950/90 hover:bg-slate-900 border border-[#D4AF37]/40 hover:border-[#D4AF37] transition-all cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Connexion (Propriétaire du catalogue)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          )
        )}

        {/* VUE 1 : OFFRES PRODUITS */}
        {activeTab === 'products' && (
          filteredProducts.length === 0 ? (
            <div className="glass-card p-12 rounded-3xl border border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Aucun produit au catalogue</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                La plateforme démarre vierge (0 article fictif). Les références certifiées ajoutées par les fournisseurs agréés apparaîtront automatiquement ici.
              </p>
              <div className="pt-2">
                <Link
                  href="/devenir-fournisseur"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] hover:from-[#E5A93C] hover:to-[#D4AF37] transition-all shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter vos produits (Espace Fournisseur)</span>
                </Link>
              </div>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((prod) => (
              <CatalogProductCard
                key={prod.id}
                product={prod}
                locale={locale}
                showCompanyHeader={true}
                onViewProduct={(p) => {
                  setViewProduct(p);
                  setViewProductImageIndex(0);
                  setIsForcedFullScreen(false);
                }}
                onRequestQuote={(p) => {
                  setSelectedProductForQuote(p);
                  setQuoteQuantity(p.moq);
                }}
              />
            ))}
          </div>
          )
        )}

        {/* VUE 2 : APPELS D'OFFRES ACHETEURS */}
        {activeTab === 'buyers' && (
          filteredBuyers.length === 0 ? (
            <div className="glass-card p-12 rounded-3xl border border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Aucun appel d&apos;offres pour le moment</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                La plateforme démarre vierge (0 demande fictive). Les demandes de cotation (RFQ) et besoins de sourcing exprimés par les acheteurs professionnels apparaîtront ici.
              </p>
              <div className="pt-2">
                <Link
                  href="/entrepreneurs"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] hover:from-[#E5A93C] hover:to-[#D4AF37] transition-all shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Publier un appel d&apos;offres (Acheteur)</span>
                </Link>
              </div>
            </div>
          ) : (
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
                          <Sparkles className="w-3 h-3" /> {t.catalogue.buyerAdSpace}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-white mt-2 flex items-center gap-2">
                        {buyer.companyName}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {buyer.buyerType} &bull; {buyer.city}, {getLocalizedCountry(buyer.country, locale)}
                      </p>
                    </div>
                    {buyer.isKbisVerified && (
                      <BadgeVerified />
                    )}
                  </div>

                  <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#E5A93C] uppercase text-[10px] tracking-wider">
                        {t.catalogue.buyerRfqTitle}
                      </span>
                      <span className="font-extrabold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-500/30">
                        {t.catalogue.budgetLabel} {buyer.estimatedBudget}
                      </span>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed font-medium">
                      &ldquo;{buyer.sourcingNeeds || t.catalogue.defaultBuyerNeeds}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    {t.catalogue.certifiedContact} <span className="font-bold text-white">{buyer.fullName}</span>
                  </div>
                  <button
                    onClick={() => setSelectedBuyerForProposal(buyer)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] hover:from-[#E5A93C] hover:to-[#D4AF37] transition-all shadow-md"
                  >
                    <Send className="w-3.5 h-3.5 text-slate-950" />
                    {t.catalogue.proposeCatalog}
                  </button>
                </div>
              </div>
            ))}
          </div>
          )
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

            <div className="border-b border-slate-800 pb-5 mb-6 pr-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-slate-950 flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" /> {t.catalogue.officialShowcase}
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
                  <span>{selectedSupplierCatalog.city ? `${selectedSupplierCatalog.city}, ` : ''}{getLocalizedCountry(selectedSupplierCatalog.country, locale)}</span>
                  <span className="text-slate-600">&bull;</span>
                  <span className="font-semibold text-amber-300">{getLocalizedSector(selectedSupplierCatalog.sector, locale)}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {(() => {
                  const approvedLink = selectedSupplierCatalog.products.find(
                    (p) => p.isLinkApproved && p.externalLink
                  )?.externalLink;
                  if (!approvedLink) return null;
                  return (
                    <a
                      href={approvedLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-amber-300 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 transition-all shadow-md"
                    >
                      <Globe className="w-3.5 h-3.5 text-amber-400" />
                      <span>Visiter le site en ligne</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  );
                })()}

                {user &&
                selectedSupplierCatalog.email &&
                user.email.toLowerCase() === selectedSupplierCatalog.email.toLowerCase() ? (
                  <Link
                    href="/mon-catalogue"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-emerald-300 bg-emerald-950/90 border border-emerald-500/40 hover:bg-emerald-900"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Gérer mon catalogue</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenCatalogLogin({
                        companyName: selectedSupplierCatalog.companyName,
                        email: selectedSupplierCatalog.email || '',
                        contactName: selectedSupplierCatalog.contactName,
                        country: selectedSupplierCatalog.country,
                      })
                    }
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-amber-300 bg-slate-900 hover:bg-slate-800 border border-[#D4AF37]/50 hover:border-[#D4AF37] transition-all cursor-pointer shadow-md"
                  >
                    <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Connexion</span>
                  </button>
                )}
              </div>
            </div>

            {selectedSupplierCatalog.products.length === 0 ? (
              <div className="py-12 text-center text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800">
                <Package className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                <p className="font-medium text-sm">{t.catalogue.emptySupplierCatalog}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-h-[60vh] overflow-y-auto pr-1">
                {selectedSupplierCatalog.products.map((p) => (
                  <CatalogProductCard
                    key={p.id}
                    product={p}
                    locale={locale}
                    showCompanyHeader={false}
                    onViewProduct={(prod) => {
                      setViewProduct(prod);
                      setViewProductImageIndex(0);
                      setIsForcedFullScreen(false);
                    }}
                    onRequestQuote={(prod) => {
                      setSelectedProductForQuote(prod);
                      setQuoteQuantity(prod.moq);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODALE CONSULTATION PRODUIT : PLEIN ÉCRAN & ÉCRAN PARTAGÉ MULTI-PRODUITS */}
      {viewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
          <div
            className={`glass-card rounded-3xl border border-[#D4AF37]/50 shadow-2xl relative animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col ${
              sameSupplierProducts.length > 1 && !isForcedFullScreen
                ? 'w-full max-w-7xl h-[92vh]'
                : 'w-full max-w-4xl max-h-[92vh] overflow-y-auto'
            }`}
          >
            {/* EN-TÊTE DE LA MODALE */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800/80 bg-slate-950/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white">
                      {viewProduct.company.companyName}
                    </h3>
                    {viewProduct.company.isVerified ? (
                      <BadgeVerified />
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/30">
                        {t.catalogue.verificationInProgress}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Origine : {getLocalizedCountry(viewProduct.originCountry, locale)} • {viewProduct.category}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleOpenCatalogLogin({
                      companyName: viewProduct.company.companyName,
                      email: viewProduct.company.email || '',
                      country: viewProduct.company.country,
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-[#D4AF37]/50 hover:border-[#D4AF37] text-xs font-black text-amber-300 hover:text-amber-200 transition-all cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Connexion</span>
                </button>

                {/* BOUTON BASCULE PLEIN ÉCRAN / ÉCRAN PARTAGÉ (SI PLUSIEURS PRODUITS) */}
                {sameSupplierProducts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setIsForcedFullScreen(!isForcedFullScreen)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400/50 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                    title={isForcedFullScreen ? 'Basculer en écran partagé' : 'Basculer en plein écran'}
                  >
                    {isForcedFullScreen ? (
                      <>
                        <Columns className="w-3.5 h-3.5 text-amber-400" />
                        <span className="hidden sm:inline">Écran Partagé</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                        <span className="hidden sm:inline">Plein Écran</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setViewProduct(null)}
                  className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 cursor-pointer"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* CORPS DE LA MODALE */}
            {sameSupplierProducts.length > 1 && !isForcedFullScreen ? (
              /* CAS 1 : MODE ÉCRAN PARTAGÉ (SPLIT-SCREEN) */
              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* VOLET GAUCHE (60%) : LE PRODUIT ACTIF EN GRAND FORMAT */}
                <div className="lg:w-3/5 p-5 sm:p-6 overflow-y-auto space-y-5 border-b lg:border-b-0 lg:border-r border-slate-800">
                  {/* GRANDE GALERIE PHOTO */}
                  <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                    <CatalogImage
                      src={viewProduct.images[viewProductImageIndex] || viewProduct.images[0]}
                      alt={viewProduct.title}
                      className="w-full h-full object-contain"
                    />

                    {viewProduct.images.length > 1 && (
                      <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none z-10">
                        <button
                          type="button"
                          onClick={() =>
                            setViewProductImageIndex((prev) =>
                              prev > 0 ? prev - 1 : viewProduct.images.length - 1
                            )
                          }
                          className="p-2 rounded-full bg-slate-950/80 text-white hover:text-amber-400 border border-slate-700 pointer-events-auto shadow-md"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setViewProductImageIndex((prev) =>
                              prev < viewProduct.images.length - 1 ? prev + 1 : 0
                            )
                          }
                          className="p-2 rounded-full bg-slate-950/80 text-white hover:text-amber-400 border border-slate-700 pointer-events-auto shadow-md"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* VIGNETTES DE LA GALERIE */}
                  {viewProduct.images.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {viewProduct.images.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setViewProductImageIndex(idx)}
                          className={`h-16 w-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                            viewProductImageIndex === idx
                              ? 'border-amber-400 ring-2 ring-amber-400/40'
                              : 'border-slate-800 opacity-60 hover:opacity-100'
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* DÉTAILS DU PRODUIT */}
                  <div className="space-y-3">
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      {viewProduct.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 font-extrabold text-sm">
                        {formatPriceRange(viewProduct.priceMin, viewProduct.priceMax, viewProduct.currency)}
                      </span>
                      <span className="px-3 py-1 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-bold">
                        MOQ : {viewProduct.moq} {getLocalizedProductUnit(viewProduct.unit, viewProduct.title, locale)}s
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
                      <h4 className="text-xs font-bold text-slate-300">Description certifiée :</h4>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                        {viewProduct.description}
                      </p>
                    </div>

                    {/* LIEN OFFICIEL VALIDÉ PAR LES ADMINISTRATEURS */}
                    {viewProduct.isLinkApproved && viewProduct.externalLink && (
                      <div className="pt-2">
                        <a
                          href={viewProduct.externalLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 hover:from-amber-500/30 hover:to-amber-600/20 text-amber-300 border border-amber-500/40 text-xs font-black shadow-md transition-all"
                        >
                          <Globe className="w-4 h-4 text-amber-400" />
                          <span>Visiter le site / boutique officiel vérifié</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}

                    {/* BOUTON DEVIS GROSSISTE */}
                    <div className="pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProductForQuote(viewProduct);
                          setQuoteQuantity(viewProduct.moq);
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] hover:opacity-95 shadow-lg transition-all cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>Demander un devis grossiste pour ce produit</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* VOLET DROIT (40%) : VITRINE COMPLÈTE DU MÊME FOURNISSEUR */}
                <div className="lg:w-2/5 p-5 sm:p-6 overflow-y-auto space-y-4 bg-slate-950/40">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" />
                      Gamme de la marque ({sameSupplierProducts.length} références)
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                    {sameSupplierProducts.map((p) => {
                      const isCurrent = p.id === viewProduct.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setViewProduct(p);
                            setViewProductImageIndex(0);
                          }}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex gap-3 items-center ${
                            isCurrent
                              ? 'bg-amber-500/10 border-amber-500 shadow-md ring-1 ring-amber-400/30'
                              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="w-16 h-16 rounded-xl bg-slate-950 overflow-hidden shrink-0 border border-slate-800">
                            <CatalogImage
                              src={p.images?.[0]}
                              alt={p.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-bold text-white truncate">{p.title}</h5>
                            <p className="text-[11px] text-[#E5A93C] font-extrabold mt-0.5">
                              {formatPriceRange(p.priceMin, p.priceMax, p.currency)}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              MOQ : {p.moq} {p.unit}s
                            </p>
                          </div>
                          {isCurrent && (
                            <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 shrink-0">
                              Actif
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* CAS 2 : MODE PLEIN ÉCRAN IMMERSIF (1 PRODUIT OU PLEIN ÉCRAN FORCÉ) */
              <div className="p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
                  {/* GALERIE PHOTO PLEIN ÉCRAN */}
                  <div className="space-y-3">
                    <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                      <CatalogImage
                        src={viewProduct.images[viewProductImageIndex] || viewProduct.images[0]}
                        alt={viewProduct.title}
                        className="w-full h-full object-contain"
                      />

                      {viewProduct.images.length > 1 && (
                        <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none z-10">
                          <button
                            type="button"
                            onClick={() =>
                              setViewProductImageIndex((prev) =>
                                prev > 0 ? prev - 1 : viewProduct.images.length - 1
                              )
                            }
                            className="p-2 rounded-full bg-slate-950/80 text-white hover:text-amber-400 border border-slate-700 pointer-events-auto shadow-md"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setViewProductImageIndex((prev) =>
                                prev < viewProduct.images.length - 1 ? prev + 1 : 0
                              )
                            }
                            className="p-2 rounded-full bg-slate-950/80 text-white hover:text-amber-400 border border-slate-700 pointer-events-auto shadow-md"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {viewProduct.images.length > 1 && (
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {viewProduct.images.map((img, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setViewProductImageIndex(idx)}
                            className={`h-16 w-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                              viewProductImageIndex === idx
                                ? 'border-amber-400 ring-2 ring-amber-400/40'
                                : 'border-slate-800 opacity-60 hover:opacity-100'
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* FICHE DÉTAILLÉE DU PRODUIT */}
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                        {viewProduct.category}
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                        {viewProduct.title}
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 font-black text-lg">
                        {formatPriceRange(viewProduct.priceMin, viewProduct.priceMax, viewProduct.currency)}
                      </span>
                      <span className="px-3.5 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-bold text-xs">
                        MOQ : {viewProduct.moq} {getLocalizedProductUnit(viewProduct.unit, viewProduct.title, locale)}s
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                      <h4 className="text-xs font-bold text-slate-300">Description complète :</h4>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                        {viewProduct.description}
                      </p>
                    </div>

                    {/* LIEN OFFICIEL VALIDÉ PAR L'ADMIN */}
                    {viewProduct.isLinkApproved && viewProduct.externalLink && (
                      <div className="pt-2">
                        <a
                          href={viewProduct.externalLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 hover:from-amber-500/30 hover:to-amber-600/20 text-amber-300 border border-amber-500/40 text-xs font-black shadow-md transition-all"
                        >
                          <Globe className="w-4 h-4 text-amber-400" />
                          <span>Visiter le site / boutique officiel vérifié</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProductForQuote(viewProduct);
                          setQuoteQuantity(viewProduct.moq);
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] hover:opacity-95 shadow-lg transition-all cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>Demander un devis grossiste pour ce produit</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODALE DE DEMANDE DE DEVIS PRODUIT */}
      {selectedProductForQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="glass-card rounded-3xl max-w-xl w-full p-6 sm:p-7 border border-[#D4AF37]/40 shadow-2xl relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedProductForQuote(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 bg-slate-800/80 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            {quoteSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-950 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-white">{t.catalogue.quoteSentSuccessTitle}</h3>
                <p className="text-sm text-slate-300 max-w-sm mx-auto">
                  {t.catalogue.quoteSentSuccessDesc}{' '}
                  <span className="font-bold text-amber-300">{selectedProductForQuote.company.companyName}</span>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendQuote} className="space-y-4">
                <div className="border-b border-slate-800 pb-3 pr-8">
                  <span className="text-xs font-extrabold text-[#E5A93C] uppercase tracking-wider">
                    {t.catalogue.b2bConnectionBadge}
                  </span>
                  <h3 className="text-lg font-black text-white mt-1">
                    {t.catalogue.requestQuoteFor} {selectedProductForQuote.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Fournisseur : <strong className="text-amber-300">{selectedProductForQuote.company.companyName}</strong> ({selectedProductForQuote.company.country})
                  </p>
                </div>

                {/* FICHE PRODUIT : PHOTOS VALIDÉES ET DESCRIPTION COMPLÈTE LISIBLE */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  {selectedProductForQuote.images && selectedProductForQuote.images.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase text-[#D4AF37] tracking-widest">
                        Photos certifiées ({selectedProductForQuote.images.length}) :
                      </span>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {selectedProductForQuote.images.map((imgUrl, i) => (
                          <div key={imgUrl} className="w-20 h-20 rounded-xl overflow-hidden border border-slate-700 shrink-0 bg-slate-950">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={imgUrl} alt={`${selectedProductForQuote.title} - photo ${i + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-[#E5A93C] tracking-widest">
                      Description complète du produit :
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line break-words max-h-48 overflow-y-auto pr-1">
                      {selectedProductForQuote.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
                    <span>Origine : <strong className="text-white">{getLocalizedCountry(selectedProductForQuote.originCountry, locale)}</strong></span>
                    <span>Tarif indicatif : <strong className="text-white">{formatPriceRange(selectedProductForQuote.priceMin, selectedProductForQuote.priceMax, selectedProductForQuote.currency)}</strong></span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {t.catalogue.desiredQuantity} ({getLocalizedProductUnit(selectedProductForQuote.unit, selectedProductForQuote.title, locale)}s) &bull; MOQ : {selectedProductForQuote.moq}
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
                    {t.catalogue.messageAndSpecs}
                  </label>
                  <textarea
                    rows={4}
                    value={quoteMessage}
                    onChange={(e) => setQuoteMessage(e.target.value)}
                    required
                    placeholder={t.catalogue.quoteMessagePlaceholder}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedProductForQuote(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    {t.catalogue.cancelBtn}
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] hover:from-[#E5A93C] hover:to-[#D4AF37] rounded-xl shadow-md transition-all"
                  >
                    <Send className="w-3.5 h-3.5 text-slate-950" />
                    {t.catalogue.sendSecureRequestBtn}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODALE DE PROPOSITION CATALOGUE POUR UN ACHETEUR */}
      {selectedBuyerForProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="glass-card rounded-3xl max-w-lg w-full p-6 border border-[#D4AF37]/40 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSelectedBuyerForProposal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {proposalSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-950 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-white">{t.catalogue.proposalSentSuccessTitle}</h3>
                <p className="text-sm text-slate-300 max-w-sm mx-auto">
                  {t.catalogue.proposalSentSuccessDesc}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendProposal} className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <span className="text-xs font-extrabold text-[#E5A93C] uppercase tracking-wider">
                    {t.catalogue.b2bConnectionBadge}
                  </span>
                  <h3 className="text-lg font-black text-white mt-1">
                    {t.catalogue.proposalModalTitle} : {selectedBuyerForProposal.companyName}
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {t.catalogue.proposalMessageLabel}
                  </label>
                  <textarea
                    rows={4}
                    value={proposalMessage}
                    onChange={(e) => setProposalMessage(e.target.value)}
                    required
                    placeholder={t.catalogue.proposalPlaceholder}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedBuyerForProposal(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    {t.catalogue.cancelBtn}
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] hover:from-[#E5A93C] hover:to-[#D4AF37] rounded-xl shadow-md transition-all"
                  >
                    <Send className="w-3.5 h-3.5 text-slate-950" />
                    {t.catalogue.sendProposalBtn}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODALE DE CONNEXION CLIENT DIRECTE DEPUIS SON CATALOGUE (E-MAIL PRÉ-REMPLI) */}
      {catalogLoginTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="glass-card gold-glow-border rounded-3xl max-w-md w-full p-6 sm:p-8 border border-[#D4AF37]/50 shadow-2xl relative animate-in fade-in zoom-in duration-200 space-y-5">
            <button
              type="button"
              onClick={() => setCatalogLoginTarget(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2 pr-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-slate-950 flex items-center justify-center mx-auto shadow-md">
                <Lock className="w-6 h-6" />
              </div>
              <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#D4AF37]/15 text-[#E5A93C] border border-[#D4AF37]/30">
                Accès Client Catalogue
              </span>
              <h3 className="text-xl font-black text-white">
                {catalogLoginTarget.companyName}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {catalogLoginMode === 'login'
                  ? 'Votre adresse e-mail est pré-remplie. Renseignez simplement le mot de passe créé lors de votre contact 4/5.'
                  : 'Créez ou définissez votre mot de passe pour ce catalogue. Un message de confirmation vous sera envoyé.'}
              </p>
            </div>

            {catalogLoginError && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-rose-950/90 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{catalogLoginError}</span>
              </div>
            )}

            {catalogLoginSuccess ? (
              <div className="space-y-4 text-center py-2">
                <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-start gap-2.5 text-left">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{catalogLoginSuccess}</span>
                </div>

                {user ? (
                  <div className="flex flex-col gap-2.5">
                    <Link
                      href="/mon-catalogue"
                      className="w-full py-3.5 px-4 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] via-[#E5A93C] to-[#B8860B] hover:opacity-95 shadow-lg text-center block"
                    >
                      Gérer ma Vitrine &amp; Mon Catalogue
                    </Link>
                    <button
                      type="button"
                      onClick={() => setCatalogLoginTarget(null)}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-300 bg-slate-900 border border-slate-700 hover:text-white cursor-pointer"
                    >
                      Rester sur le catalogue public
                    </button>
                  </div>
                ) : null}
              </div>
            ) : catalogLoginMode === 'login' ? (
              <form onSubmit={handleCatalogLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Votre adresse e-mail (Catalogue) *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={catalogLoginEmail}
                      onChange={(e) => setCatalogLoginEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D4AF37]/50 bg-slate-900 text-sm font-bold text-amber-300 focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Votre mot de passe *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showCatalogLoginPwd ? 'text' : 'password'}
                      required
                      autoFocus
                      autoComplete="current-password"
                      placeholder="Renseignez votre mot de passe"
                      value={catalogLoginPassword}
                      onChange={(e) => setCatalogLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCatalogLoginPwd((prev) => !prev)}
                      aria-label={showCatalogLoginPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      aria-pressed={showCatalogLoginPwd}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showCatalogLoginPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCatalogLoggingIn}
                  className="w-full py-3.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] via-[#E5A93C] to-[#B8860B] hover:opacity-95 shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isCatalogLoggingIn ? 'Connexion en cours...' : 'Se connecter à mon catalogue'}
                </button>

                <div className="pt-3 border-t border-slate-800 text-center space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCatalogLoginMode('create_password');
                      setCatalogLoginError(null);
                      setCatalogLoginSuccess(null);
                    }}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Créer mon mot de passe / Recevoir le message</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCatalogCreatePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Votre adresse e-mail (Catalogue) *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={catalogLoginEmail}
                      onChange={(e) => setCatalogLoginEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D4AF37]/50 bg-slate-900 text-sm font-bold text-amber-300 focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Créer votre mot de passe (min. 6 caractères) *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showCatalogLoginPwd ? 'text' : 'password'}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      placeholder="Choisissez votre mot de passe"
                      value={catalogLoginPassword}
                      onChange={(e) => setCatalogLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCatalogLoginPwd((prev) => !prev)}
                      aria-label={showCatalogLoginPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      aria-pressed={showCatalogLoginPwd}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showCatalogLoginPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Confirmer votre mot de passe *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showCatalogLoginPwd ? 'text' : 'password'}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      placeholder="Retapez votre mot de passe"
                      value={catalogLoginConfirmPassword}
                      onChange={(e) => setCatalogLoginConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCatalogLoggingIn}
                  className="w-full py-3.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] via-[#E5A93C] to-[#B8860B] hover:opacity-95 shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isCatalogLoggingIn
                    ? 'Enregistrement & Envoi du message...'
                    : 'Enregistrer mon mot de passe & Me connecter'}
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setCatalogLoginMode('login');
                      setCatalogLoginError(null);
                    }}
                    className="text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    &larr; Retour à la connexion avec mon mot de passe
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
