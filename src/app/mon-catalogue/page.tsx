'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Package,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Globe,
  Tag,
  Layers,
  ArrowLeft,
  Sparkles,
  Lock,
  X,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

interface ProductItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  priceMin: number | null;
  priceMax: number | null;
  currency: string;
  moq: number;
  unit: string;
  originCountry: string;
  images: string[];
  externalLink?: string | null;
  isLinkApproved?: boolean;
  isPublished: boolean;
  createdAt: string;
}

interface CatalogData {
  company: {
    id: string;
    companyName: string;
    country: string;
    city: string;
    sector: string;
    verificationStatus: string;
    isPublished: boolean;
  };
  subscription: {
    name: string;
    code: string;
    maxProducts: number;
  };
  quota: {
    current: number;
    max: number;
    canAdd: boolean;
  };
  products: ProductItem[];
}

export default function MonCataloguePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { t, locale } = useLanguage();

  const [catalogData, setCatalogData] = useState<CatalogData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Modale Ajout / Modification
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulaire Produit
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Agroalimentaire & Épices');
  const [formDescription, setFormDescription] = useState('');
  const [formPriceMin, setFormPriceMin] = useState('');
  const [formPriceMax, setFormPriceMax] = useState('');
  const [formCurrency, setFormCurrency] = useState('EUR');
  const [formMoq, setFormMoq] = useState('10');
  const [formUnit, setFormUnit] = useState('pièce');
  const [formOrigin, setFormOrigin] = useState('France');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formImageInput, setFormImageInput] = useState('');
  const [formExternalLink, setFormExternalLink] = useState('');

  const fetchCatalog = useCallback(async () => {
    if (!user?.email) return;
    setIsLoading(true);
    setErrorNotice(null);
    try {
      const res = await fetch(`/api/suppliers/my-catalog?email=${encodeURIComponent(user.email)}&_t=${Date.now()}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorNotice(data.error || 'Impossible de charger votre catalogue.');
        return;
      }
      setCatalogData(data);
    } catch {
      setErrorNotice('Erreur réseau lors de la récupération de votre vitrine.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (!authLoading && user?.email) {
      fetchCatalog();
    }
  }, [authLoading, user?.email, fetchCatalog]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormTitle('');
    setFormCategory('Agroalimentaire & Épices');
    setFormDescription('');
    setFormPriceMin('');
    setFormPriceMax('');
    setFormCurrency('EUR');
    setFormMoq('10');
    setFormUnit('pièce');
    setFormOrigin(catalogData?.company.country || 'France');
    setFormImages([]);
    setFormImageInput('');
    setFormExternalLink('');
    setIsModalOpen(true);
    setErrorNotice(null);
  };

  const handleOpenEditModal = (p: ProductItem) => {
    setEditingProduct(p);
    setFormTitle(p.title);
    setFormCategory(p.category || 'Agroalimentaire & Épices');
    setFormDescription(p.description || '');
    setFormPriceMin(p.priceMin ? String(p.priceMin) : '');
    setFormPriceMax(p.priceMax ? String(p.priceMax) : '');
    setFormCurrency(p.currency || 'EUR');
    setFormMoq(String(p.moq || 1));
    setFormUnit(p.unit || 'pièce');
    setFormOrigin(p.originCountry || 'France');
    setFormImages(p.images || []);
    setFormImageInput('');
    setFormExternalLink(p.externalLink || '');
    setIsModalOpen(true);
    setErrorNotice(null);
  };

  const handleAddImage = () => {
    const url = formImageInput.trim();
    if (!url) return;
    if (formImages.length >= 4) {
      alert('Maximum 4 photos par produit.');
      return;
    }
    setFormImages([...formImages, url]);
    setFormImageInput('');
  };

  const handleRemoveImage = (index: number) => {
    setFormImages(formImages.filter((_, i) => i !== index));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    if (!formTitle.trim() || !formDescription.trim()) {
      alert('Veuillez renseigner au moins le titre et la description du produit.');
      return;
    }

    setIsSubmitting(true);
    setErrorNotice(null);
    setSuccessNotice(null);

    const payload = {
      email: user.email,
      id: editingProduct ? editingProduct.id : undefined,
      title: formTitle.trim(),
      description: formDescription.trim(),
      category: formCategory,
      priceMin: formPriceMin || null,
      priceMax: formPriceMax || null,
      currency: formCurrency,
      moq: formMoq ? parseInt(formMoq, 10) : 1,
      unit: formUnit,
      originCountry: formOrigin,
      images: formImages,
      externalLink: formExternalLink.trim() || null,
    };

    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const res = await fetch('/api/suppliers/my-catalog', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorNotice(data.error || 'Erreur lors de l’enregistrement du produit.');
        return;
      }

      setSuccessNotice(data.message || 'Produit enregistré avec succès.');
      setIsModalOpen(false);
      await fetchCatalog();
    } catch {
      setErrorNotice('Erreur réseau lors de la sauvegarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Êtes-vous certain de vouloir supprimer cette référence de votre vitrine ?')) {
      return;
    }

    if (!user?.email) return;
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/suppliers/my-catalog?id=${encodeURIComponent(productId)}&email=${encodeURIComponent(user.email)}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Erreur lors de la suppression.');
        return;
      }
      setSuccessNotice('Produit supprimé de votre vitrine.');
      await fetchCatalog();
    } catch {
      alert('Erreur réseau lors de la suppression.');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0B132B] text-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 font-bold">Chargement de votre session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B132B] text-slate-100 flex items-center justify-center p-4">
        <div className="glass-card gold-glow-border p-8 rounded-3xl max-w-md w-full text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Espace Vitrine & Catalogue</h1>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Veuillez vous connecter avec vos identifiants professionnels validés pour accéder à la gestion de votre vitrine et de vos produits.
            </p>
          </div>
          <Link
            href="/connexion"
            className="w-full py-3.5 px-4 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] hover:opacity-95 transition-all text-center block shadow-lg"
          >
            Se connecter à mon compte
          </Link>
        </div>
      </div>
    );
  }

  const quota = catalogData?.quota;
  const subscription = catalogData?.subscription;
  const isLimitReached = quota ? !quota.canAdd : false;

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* BANDEAU SUPÉRIEUR & NAVIGATION */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/connexion"
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-amber-400/50 transition-all"
              title="Retour à mon compte"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">
                  Gestion de mon Catalogue & Vitrine
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Espace Pro
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {catalogData?.company?.companyName || user.companyName || user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/catalogue"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-200 bg-slate-900 border border-slate-700 hover:border-amber-400/60 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Voir au Catalogue Public</span>
            </Link>

            <button
              onClick={handleOpenAddModal}
              disabled={isLimitReached}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black shadow-lg transition-all cursor-pointer ${
                isLimitReached
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-slate-950 hover:opacity-95'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un Produit</span>
            </button>
          </div>
        </div>

        {/* NOTICES ALERTE / SUCCÈS */}
        {errorNotice && (
          <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <span>{errorNotice}</span>
          </div>
        )}

        {successNotice && (
          <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* CARTE RÉCAPITULATIVE ABONNEMENT & QUOTA PRODUITS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Formule d&apos;abonnement active</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-lg font-black text-white">
              {subscription?.name || 'Formule Gratuite Standard'}
            </div>
            <p className="text-[11px] text-slate-400">
              Rôle : {user.role === 'supplier' ? 'Fournisseur B2B' : 'Entrepreneur / Acheteur'}
            </p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Quota de Produits Utilisés</span>
              <Package className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#E5A93C]">
                {quota?.current ?? 0}
              </span>
              <span className="text-xs text-slate-400 font-bold">
                / {quota?.max === -1 ? 'Illimité' : `${quota?.max ?? 4} autorisés`}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isLimitReached ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{
                  width: `${
                    quota?.max === -1
                      ? 20
                      : Math.min(100, (((quota?.current ?? 0) / (quota?.max || 4)) * 100))
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Modération des Liens Externes</span>
              <ShieldCheck className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xs font-extrabold text-white">
              Contrôle de Sécurité Lougara
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Tout lien vers votre site ou boutique est vérifié par nos modérateurs avant publication sur le catalogue public.
            </p>
          </div>
        </div>

        {/* LISTE DES PRODUITS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-400" />
              <span>Références de votre vitrine ({catalogData?.products.length ?? 0})</span>
            </h2>
          </div>

          {isLoading ? (
            <div className="glass-card p-12 rounded-3xl text-center space-y-3">
              <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-400">Chargement de vos produits...</p>
            </div>
          ) : !catalogData?.products || catalogData.products.length === 0 ? (
            <div className="glass-card p-12 rounded-3xl border border-slate-800 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                <Package className="w-7 h-7" />
              </div>
              <div className="max-w-sm mx-auto space-y-1">
                <h3 className="text-base font-bold text-white">Aucun produit dans votre vitrine</h3>
                <p className="text-xs text-slate-400">
                  Ajoutez dès à présent votre premier article pour commencer à recevoir des demandes de devis d&apos;acheteurs vérifiés.
                </p>
              </div>
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-slate-950 hover:opacity-95 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Créer mon premier produit</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {catalogData.products.map((p) => {
                const hasImages = Array.isArray(p.images) && p.images.length > 0;
                return (
                  <div
                    key={p.id}
                    className="glass-card rounded-2xl border border-slate-800 hover:border-slate-700 p-5 flex flex-col justify-between space-y-4 transition-all"
                  >
                    <div className="space-y-3">
                      {/* APERÇU PHOTO DU PRODUIT */}
                      <div className="h-40 rounded-xl bg-slate-950 overflow-hidden relative border border-slate-900">
                        {hasImages ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <ImageIcon className="w-8 h-8" />
                          </div>
                        )}
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/80 backdrop-blur-sm text-slate-300 border border-slate-800">
                          {p.category}
                        </span>
                        {hasImages && p.images.length > 1 && (
                          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/80 text-amber-300 border border-amber-500/30">
                            {p.images.length} photos
                          </span>
                        )}
                      </div>

                      {/* INFORMATIONS PRINCIPALES */}
                      <div>
                        <h3 className="text-sm font-extrabold text-white line-clamp-1">{p.title}</h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {p.description}
                        </p>
                      </div>

                      {/* PRIX ET MOQ */}
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                        <span className="font-extrabold text-[#E5A93C]">
                          {p.priceMin
                            ? `${p.priceMin} ${p.priceMax ? `- ${p.priceMax}` : ''} ${p.currency}`
                            : 'Prix sur demande'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          MOQ : {p.moq} {p.unit}s
                        </span>
                      </div>

                      {/* LIEN EXTERNE ET STATUT MODÉRATION */}
                      <div className="pt-2">
                        {p.externalLink ? (
                          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-300 flex items-center gap-1">
                                <Globe className="w-3 h-3 text-amber-400" />
                                Lien produit :
                              </span>
                              {p.isLinkApproved ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
                                  <CheckCircle2 className="w-2.5 h-2.5" /> Validé Admin
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/40">
                                  <Clock className="w-2.5 h-2.5" /> En cours d&apos;examen
                                </span>
                              )}
                            </div>
                            <a
                              href={p.externalLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-amber-400 hover:underline truncate block text-[11px]"
                            >
                              {p.externalLink}
                            </a>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-500 italic">
                            Aucun lien externe renseigné
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ACTIONS SUR LE PRODUIT */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Modifier</span>
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/30 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* MODALE D'AJOUT / ÉDITION DE PRODUIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="glass-card gold-glow-border rounded-3xl max-w-xl w-full p-6 sm:p-7 border border-[#D4AF37]/50 shadow-2xl relative my-8 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 mb-6">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-[#D4AF37]" />
                {editingProduct ? 'Modifier la référence' : 'Ajouter un nouveau produit'}
              </h3>
              <p className="text-xs text-slate-400">
                Renseignez les détails de votre produit pour votre catalogue professionnel.
              </p>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Titre du produit *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Huile d'Argan Bio Pure 100ml"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Catégorie *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  >
                    <option value="Agroalimentaire & Épices">Agroalimentaire & Épices</option>
                    <option value="Cosmétique & Soins">Cosmétique & Soins</option>
                    <option value="Textile & Confection">Textile & Confection</option>
                    <option value="Artisanat & Décoration">Artisanat & Décoration</option>
                    <option value="Matériaux & BTP">Matériaux & BTP</option>
                    <option value="Électronique & Énergie">Électronique & Énergie</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Pays d&apos;origine
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Sénégal, France, Maroc..."
                    value={formOrigin}
                    onChange={(e) => setFormOrigin(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Description détaillée du produit *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Caractéristiques, certifications, conditionnement, usages recommandés..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              {/* TARIFS ET MOQ */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Prix Min</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formPriceMin}
                    onChange={(e) => setFormPriceMin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Prix Max</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formPriceMax}
                    onChange={(e) => setFormPriceMax(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Devise</label>
                  <select
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="XOF">XOF (FCFA)</option>
                    <option value="MAD">MAD (Dirham)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Quantité minimum (MOQ)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formMoq}
                    onChange={(e) => setFormMoq(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Unité</label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  >
                    <option value="pièce">pièce</option>
                    <option value="carton">carton</option>
                    <option value="palette">palette</option>
                    <option value="kg">kg</option>
                    <option value="litre">litre</option>
                  </select>
                </div>
              </div>

              {/* NOUVEAU CHAMP : LIEN EXTERNE AVEC MODÉRATION ADMIN */}
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-amber-300 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    Lien externe du produit (Optionnel)
                  </label>
                  <span className="text-[10px] text-slate-400 font-bold">
                    Vérification par coche admin
                  </span>
                </div>
                <input
                  type="url"
                  placeholder="https://votre-site.com/produit-ou-catalogue"
                  value={formExternalLink}
                  onChange={(e) => setFormExternalLink(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Ce lien (boutique, site officiel ou plaquette PDF) sera soumis à nos administrateurs. Il apparaîtra sur votre fiche produit dès qu&apos;il aura été validé.
                </p>
              </div>

              {/* GESTION DES PHOTOS DU PRODUIT */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Photos du produit (Jusqu&apos;à 4 photos)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="URL de l'image (https://...)"
                    value={formImageInput}
                    onChange={(e) => setFormImageInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    disabled={formImages.length >= 4}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50 cursor-pointer"
                  >
                    Ajouter
                  </button>
                </div>

                {formImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {formImages.map((img, idx) => (
                      <div key={idx} className="relative h-16 rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt="Aperçu" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-slate-950/80 text-rose-400 hover:bg-rose-950"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] hover:opacity-95 shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Enregistrement...' : editingProduct ? 'Mettre à jour' : 'Enregistrer le produit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
