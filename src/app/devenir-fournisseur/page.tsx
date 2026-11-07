'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building,
  Upload,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  FileCheck,
  Globe2,
  TrendingUp,
  Package,
  Image as ImageIcon,
  X,
  Sparkles,
  Scan,
  Loader2,
  FileText,
  ChevronDown,
  ChevronUp,
  Zap,
  Plus,
  Trash2,
  Tag,
} from 'lucide-react';
import { BadgeVerified } from '@/components/BadgeVerified';
import { DocumentDropzone } from '@/components/DocumentDropzone';
import { parseKbisOcrText, ParsedKbisData } from '@/features/ocr/kbis-parser';
import { useLanguage } from '@/context/LanguageContext';

const MAX_IMAGES_PER_PRODUCT = 4;

interface CatalogProductItem {
  id: string;
  title: string;
  externalLink: string;
  description: string;
  category: string;
  priceMin: string;
  priceMax: string;
  currency: string;
  moq: number;
  unit: string;
  images: string[];
}

export default function DevenirFournisseurPage() {
  const { t, locale, formatPlanPrice } = useLanguage();
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Entreprise
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('Sénégal');
  const [city, setCity] = useState('');
  const [sector, setSector] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [regNumber, setRegNumber] = useState('');

  // Pièces KYB
  const [kbisFile, setKbisFile] = useState<string | null>(null);
  const [kbisFileSize, setKbisFileSize] = useState<string>('');
  const [kbisFilePath, setKbisFilePath] = useState<string | null>(null);
  const [cniFile, setCniFile] = useState<string | null>(null);
  const [cniFileSize, setCniFileSize] = useState<string>('');
  const [cniFilePath, setCniFilePath] = useState<string | null>(null);
  const [kbisStoragePath, setKbisStoragePath] = useState<string | null>(null);
  const [cniStoragePath, setCniStoragePath] = useState<string | null>(null);
  const [docError, setDocError] = useState<string | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [autoFilled, setAutoFilled] = useState(false);
  const [ocrConfidence, setOcrConfidence] = useState<number | null>(null);

  // Multi-Produits (démarrage à 0 sans article fantôme)
  const [catalogProducts, setCatalogProducts] = useState<CatalogProductItem[]>([]);
  const [uploadingProductId, setUploadingProductId] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // Contact
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [subscriptionPlan, setSubscriptionPlan] = useState<'STANDARD' | 'PREMIUM' | 'VIP'>('PREMIUM');
  const [hasCatalogAdSpace, setHasCatalogAdSpace] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const applyParsedData = (data: ParsedKbisData, fileName: string, fileSizeStr: string, pathStr: string | null = null) => {
    setKbisFile(fileName);
    setKbisFileSize(fileSizeStr);
    setKbisFilePath(pathStr);
    setAutoFilled(true);
    setOcrConfidence(data.confidenceScore);
    if (data.companyName) setCompanyName(data.companyName);
    if (data.regNumber) setRegNumber(data.regNumber);
    if (data.country) setCountry(data.country);
    if (data.city) setCity(data.city);
    if (data.contactName) setContactName(data.contactName);
  };

  /** Televerse reellement la piece KYB (Kbis / identite) pour qu'elle soit examinee par Lougara. */
  const uploadKybPiece = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/suppliers/kyb-documents', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.success && data.path) return data.path as string;
      setDocError(data?.error || `Échec du téléversement de « ${file.name} ».`);
    } catch {
      setDocError(`Échec du téléversement de « ${file.name} ».`);
    }
    return null;
  };

  const handleProcessKbisFile = async (file: File) => {    const sizeStr = `${(file.size / 1024 / 1024).toFixed(2)} Mo`;
    setKbisFilePath(null);
    setDocError(null);
    uploadKybPiece(file).then((storedPath) => setKbisStoragePath(storedPath));
    setIsScanning(true);
    setScanStep(locale === 'fr' ? 'Détection du document et extraction légale...' : 'Detecting document and legal parsing...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/ocr/kbis', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setIsScanning(false);
          applyParsedData(result.data, file.name, sizeStr, null);
          return;
        }
      }
    } catch (err) {}

    setIsScanning(false);
    setKbisFile(file.name);
    setKbisFileSize(sizeStr);
    setAutoFilled(true);
  };

  const handleProcessKbisPath = async (pathStr: string) => {
    setIsScanning(true);
    setScanStep(locale === 'fr' ? 'Lecture du chemin et extraction des données...' : 'Reading path and extracting data...');
    setKbisFilePath(pathStr);

    try {
      const formData = new FormData();
      formData.append('filePath', pathStr);
      const response = await fetch('/api/ocr/kbis', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setIsScanning(false);
          applyParsedData(result.data, result.fileName || pathStr, result.fileSize || 'Chemin validé', pathStr);
          return;
        }
      }
    } catch (err) {}

    setIsScanning(false);
    const fileName = pathStr.split(/[\\/]/).pop() || pathStr;
    setKbisFile(fileName);
    setKbisFileSize('Chemin renseigné');
    setAutoFilled(true);
  };

  const handleRemoveKbis = () => {
    setKbisFile(null);
    setKbisFileSize('');
    setKbisFilePath(null);
    setKbisStoragePath(null);
    setOcrConfidence(null);
    setAutoFilled(false);
  };

  const handleAddProduct = () => {
    if (catalogProducts.length >= 10) return;
    setCatalogProducts([
      ...catalogProducts,
      {
        id: `prod-${Date.now()}`,
        title: '',
        externalLink: '',
        description: '',
        category: sector,
        priceMin: '',
        priceMax: '',
        currency: 'EUR',
        moq: 1,
        unit: 'unité',
        images: [],
      },
    ]);
  };

  const updateProduct = (id: string, patch: Partial<CatalogProductItem>) => {
    setCatalogProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const handleRemoveProduct = (id: string) => {
    setCatalogProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUploadProductImages = async (productId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const target = catalogProducts.find((p) => p.id === productId);
    if (!target) return;
    const slots = MAX_IMAGES_PER_PRODUCT - target.images.length;
    if (slots <= 0) return;

    setImageError(null);
    setUploadingProductId(productId);
    const uploaded: string[] = [];
    for (const file of Array.from(files).slice(0, slots)) {
      if (file.size > 5 * 1024 * 1024) {
        setImageError(`« ${file.name} » dépasse 5 Mo.`);
        continue;
      }
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/suppliers/product-images', { method: 'POST', body: formData });
        const data = await res.json();
        if (res.ok && data.success && data.url) {
          uploaded.push(data.url);
        } else {
          setImageError(data?.error || `Échec du téléversement de « ${file.name} ».`);
        }
      } catch {
        setImageError(`Échec du téléversement de « ${file.name} ».`);
      }
    }
    if (uploaded.length > 0) {
      setCatalogProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, images: [...p.images, ...uploaded].slice(0, MAX_IMAGES_PER_PRODUCT) } : p
        )
      );
    }
    setUploadingProductId(null);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cniStoragePath) {
      setDocError("La pièce d'identité du dirigeant est obligatoire : téléversez un fichier (JPG, PNG, WEBP ou PDF).");
      return;
    }
    setDocError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          country,
          city,
          sector,
          registrationNumber: regNumber,
          contactName,
          email,
          phone,
          subscriptionPlan,
          hasCatalogAdSpace,
          products: catalogProducts,
          kbisFile,
          kbisStoragePath,
          cniFile,
          cniStoragePath,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setImageError(data?.error || "L'envoi du dossier a échoué. Vérifiez les champs et réessayez.");
        setCurrentStep(3);
        return;
      }
      setIsSubmitted(true);
    } catch (err) {
      setImageError("Connexion impossible : le dossier n'a pas été envoyé. Réessayez.");
      setCurrentStep(3);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* HERO HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black bg-[#D4AF37]/15 text-[#E5A93C] border border-[#D4AF37]/30 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <Zap className="w-4 h-4 text-[#D4AF37]" />
            <span>{locale === 'fr' ? 'Onboarding Fournisseur Agréé • OCR Universel Kbis & NIF' : 'Approved Supplier Onboarding • Universal Kbis & Tax ID OCR'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {t.becomeSupplier.title}
          </h1>

          <p className="text-slate-300 text-base leading-relaxed">
            {t.becomeSupplier.subtitle}
          </p>
        </div>

        {/* STEPPER WIZARD INDICATOR */}
        <div className="glass-card p-4 sm:p-6 rounded-3xl border border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
          {[
            { step: 1, label: locale === 'fr' ? 'Kbis & KYB' : 'Kbis & KYB' },
            { step: 2, label: locale === 'fr' ? 'Entreprise' : 'Company' },
            { step: 3, label: locale === 'fr' ? 'Catalogue (Max 10)' : 'Catalog (Max 10)' },
            { step: 4, label: locale === 'fr' ? 'Contact' : 'Contact' },
            { step: 5, label: locale === 'fr' ? 'Abonnement' : 'Subscription' },
          ].map((s) => (
            <button
              key={s.step}
              onClick={() => setCurrentStep(s.step)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                currentStep === s.step
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-slate-950 shadow-md font-black'
                  : currentStep > s.step
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              <span className={`w-5 h-5 rounded-full text-[11px] font-black flex items-center justify-center ${
                currentStep === s.step ? 'bg-slate-950 text-[#D4AF37]' : 'bg-slate-800 text-slate-300'
              }`}>
                {s.step}
              </span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* FORM CONTAINER */}
        <div className="glass-card p-8 sm:p-10 rounded-3xl border border-[#D4AF37]/30 shadow-2xl">
          {isSubmitted ? (
            <div className="py-12 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-white">
                {t.becomeSupplier.successTitle}
              </h2>
              <p className="text-sm text-slate-300">
                {t.becomeSupplier.successMsg}
              </p>
              <div className="pt-4">
                <Link
                  href="/catalogue"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] shadow-md"
                >
                  <span>{t.nav.catalog}</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* STEP 1: KBIS DROPZONE */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-800 pb-3">
                    <span className="text-xs font-black uppercase text-[#D4AF37] tracking-wider">
                      Étape 1 sur 5 &bull; Reconnaissance Documentaire
                    </span>
                    <h2 className="text-xl font-black text-white flex items-center gap-2 mt-1">
                      <Scan className="w-5 h-5 text-emerald-400" />
                      Dépôt du Kbis / RCCM & Validation Automatique
                    </h2>
                  </div>

                  <DocumentDropzone
                    id="supplier-kbis-dropzone"
                    title={locale === 'fr' ? 'Déposez votre Extrait Kbis (France) ou RCCM (Afrique)' : 'Upload your Kbis / RCCM Document'}
                    subtitle={locale === 'fr' ? 'PDF, PNG, JPG, WEBP • Extraction immédiate des métadonnées légales par OCR' : 'PDF, PNG, JPG, WEBP • Instant legal metadata extraction via OCR'}
                    currentFile={kbisFile}
                    fileSize={kbisFileSize}
                    filePath={kbisFilePath}
                    isScanning={isScanning}
                    scanStep={scanStep}
                    confidenceScore={ocrConfidence}
                    onFileSelected={handleProcessKbisFile}
                    onPathSelected={handleProcessKbisPath}
                    onRemoveFile={handleRemoveKbis}
                    locale={locale}
                  />

                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-3 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] shadow-md"
                    >
                      Étape Suivante : Entreprise &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: ENTREPRISE */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-800 pb-3">
                    <span className="text-xs font-black uppercase text-[#D4AF37] tracking-wider">
                      Étape 2 sur 5 &bull; Informations Légales
                    </span>
                    <h2 className="text-xl font-black text-white mt-1">Identité de l&apos;Entreprise</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Raison Sociale *</label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-[#D4AF37]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Numéro Légal (RCCM / SIREN) *</label>
                      <input
                        type="text"
                        required
                        value={regNumber}
                        onChange={(e) => setRegNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-[#D4AF37]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Pays d&apos;origine *</label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-slate-200 focus:ring-2 focus:ring-[#D4AF37]"
                      >
                        <option value="Sénégal">Sénégal</option>
                        <option value="Côte d'Ivoire">Côte d&apos;Ivoire</option>
                        <option value="Cameroun">Cameroun</option>
                        <option value="France">France</option>
                        <option value="Belgique">Belgique</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Ville du Siège *</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-[#D4AF37]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-300 mb-1">Secteur d&apos;activité *</label>
                      <select
                        required
                        value={sector}
                        onChange={(e) => setSector(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-slate-200 focus:ring-2 focus:ring-[#D4AF37]"
                      >
                        <option value="">— Sélectionnez votre secteur —</option>
                        <option value="Agroalimentaire">Agroalimentaire</option>
                        <option value="Cosmétique">Cosmétique &amp; Soins</option>
                        <option value="Textile">Textile</option>
                        <option value="INDUSTRIE, MATÉRIAUX & BTP">Industrie, Matériaux &amp; BTP</option>
                        <option value="Négoce & Commerce Général">Négoce &amp; Commerce Général</option>
                      </select>
                    </div>                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                    >
                      &larr; Retour
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="px-6 py-3 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] shadow-md"
                    >
                      Étape Suivante : Catalogue &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: CATALOG BUILDER */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-black uppercase text-[#D4AF37] tracking-wider">
                        Étape 3 sur 5 &bull; Gamme B2B
                      </span>
                      <h2 className="text-xl font-black text-white mt-1">Créateur de Catalogue Produits (Max 10)</h2>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddProduct}
                      disabled={catalogProducts.length >= 10}
                      className="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 disabled:opacity-40"
                    >
                      <Plus className="w-4 h-4 text-emerald-400" /> Ajout Article
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[11px] text-slate-300 leading-relaxed flex gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <p>
                      Lougara est une plateforme de mise en relation : vos textes, vos images et le lien externe de chaque article sont <strong>contrôlés par Lougara</strong> en même temps que votre Kbis et votre pièce d&apos;identité.
                      Seuls les contenus et liens autorisés par Lougara apparaissent dans le catalogue public. Renseignez votre lien uniquement dans le champ dédié sous le nom de l&apos;article.
                    </p>
                  </div>

                  {imageError && (
                    <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300">{imageError}</div>
                  )}

                  <div className="space-y-4">
                    {catalogProducts.length === 0 ? (
                      <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-700 text-xs text-slate-400 space-y-2">
                        <p>Aucun produit ajouté pour le moment.</p>
                        <button
                          type="button"
                          onClick={handleAddProduct}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#D4AF37]/20 text-[#E5A93C] border border-[#D4AF37]/30 hover:bg-[#D4AF37]/30 transition-all inline-flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" /> Ajouter un premier article
                        </button>
                      </div>
                    ) : (
                      catalogProducts.map((p, idx) => (
                        <div key={p.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700 space-y-3">
                          <div className="flex justify-between items-center text-xs font-bold text-[#E5A93C]">
                            <span>Article #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveProduct(p.id)}
                              className="text-rose-400 hover:text-rose-300 flex items-center gap-1"
                              aria-label={`Supprimer l'article ${idx + 1}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Supprimer
                            </button>
                          </div>

                          <input
                            type="text"
                            placeholder="Nom de l'article (ex: Beurre de karité bio brut)"
                            maxLength={150}
                            value={p.title}
                            onChange={(e) => updateProduct(p.id, { title: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white"
                          />

                          <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <label className="text-[11px] font-bold text-[#E5A93C] flex items-center gap-1.5">
                                <Globe2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                                Lien externe de l&apos;article (Optionnel &bull; Autorisé après validation par Lougara)
                              </label>
                              <span className="text-[10px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                                Soumis à validation Lougara
                              </span>
                            </div>
                            <input
                              type="text"
                              placeholder="https://votre-site.com/fiche-article"
                              maxLength={500}
                              value={p.externalLink}
                              onChange={(e) => updateProduct(p.id, { externalLink: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white font-mono focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                            />
                            <p className="text-[10px] text-slate-400">
                              Ce lien vers votre site ou la fiche de l&apos;article sera contrôlé par Lougara et activé dans le catalogue dès son approbation.
                            </p>
                          </div>

                          <textarea
                            placeholder="Description détaillée : origine, composition, conditionnement, certifications..."
                            maxLength={2000}
                            rows={4}
                            value={p.description}
                            onChange={(e) => updateProduct(p.id, { description: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white resize-y"
                          />

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              placeholder="Prix min (optionnel)"
                              value={p.priceMin}
                              onChange={(e) => updateProduct(p.id, { priceMin: e.target.value })}
                              className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white"
                            />
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              placeholder="Prix max (optionnel)"
                              value={p.priceMax}
                              onChange={(e) => updateProduct(p.id, { priceMax: e.target.value })}
                              className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white"
                            />
                            <input
                              type="number"
                              min={1}
                              placeholder="Commande min."
                              value={p.moq}
                              onChange={(e) => updateProduct(p.id, { moq: Math.max(1, Number(e.target.value) || 1) })}
                              className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white"
                            />
                            <input
                              type="text"
                              placeholder="Unité (kg, carton...)"
                              maxLength={30}
                              value={p.unit}
                              onChange={(e) => updateProduct(p.id, { unit: e.target.value })}
                              className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white"
                            />
                          </div>

                          {/* IMAGES DU PRODUIT (validées par Lougara) */}
                          <div className="space-y-2">
                            <p className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
                              Photos du produit ({p.images.length}/{MAX_IMAGES_PER_PRODUCT}) &bull; JPG, PNG, WEBP &bull; 5 Mo max
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {p.images.map((src) => (
                                <div key={src} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-700">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={src} alt={p.title || 'Photo produit'} className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => updateProduct(p.id, { images: p.images.filter((i) => i !== src) })}
                                    className="absolute top-1 right-1 p-0.5 rounded-full bg-slate-950/90 text-rose-300"
                                    aria-label="Retirer la photo"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                              {p.images.length < MAX_IMAGES_PER_PRODUCT && (
                                <label className="w-20 h-20 rounded-xl border border-dashed border-slate-600 hover:border-[#D4AF37] flex flex-col items-center justify-center gap-1 text-[10px] text-slate-400 cursor-pointer">
                                  {uploadingProductId === p.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                                  ) : (
                                    <>
                                      <Upload className="w-4 h-4" />
                                      Ajouter
                                    </>
                                  )}
                                  <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    multiple
                                    className="hidden"
                                    disabled={uploadingProductId !== null}
                                    onChange={(e) => {
                                      handleUploadProductImages(p.id, e.target.files);
                                      e.target.value = '';
                                    }}
                                  />
                                </label>
                              )}
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-500">
                            Statut après envoi : « En attente de validation Lougara ». Aucun visuel de remplacement n&apos;est affiché.
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                    >
                      &larr; Retour
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="px-6 py-3 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] shadow-md"
                    >
                      Étape Suivante : Contact &rarr;
                    </button>
                  </div>
                </div>
              )}
              {/* STEP 4 & 5 SUMMARY & SUBMIT */}
              {(currentStep === 4 || currentStep === 5) && (
                <div className="space-y-6">
                  <div className="border-b border-slate-800 pb-3">
                    <span className="text-xs font-black uppercase text-[#D4AF37] tracking-wider">
                      Étape {currentStep} sur 5 &bull; Finalisation
                    </span>
                    <h2 className="text-xl font-black text-white mt-1">Contact Commercial & Validation</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Nom du Responsable Commercial *</label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">E-mail Direct *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-[#D4AF37]"
                      />
                    </div>
                  </div>

                  {/* Pièce d'identité ou justificatif dirigeant (Optionnel) */}
                  <div className="pt-2">
                    <DocumentDropzone
                      id="supplier-cni-dropzone"
                      label={locale === 'fr' ? 'Pièce d\'identité du dirigeant (CNI ou Passeport) *' : 'Manager ID Card or Passport *'}
                      title={locale === 'fr' ? 'Déposez la CNI, Passeport ou justificatif d\'identité' : 'Upload ID Card, Passport or Identity Document'}
                      subtitle={locale === 'fr' ? 'PDF, PNG, JPG, WEBP • Clic, glisser-déposer ou saisie de chemin' : 'PDF, PNG, JPG, WEBP • Click, drag & drop or path'}
                      currentFile={cniFile}
                      fileSize={cniFileSize}
                      filePath={cniFilePath}
                      onFileSelected={(file) => {
                        setCniFile(file.name);
                        setCniFileSize(`${(file.size / 1024 / 1024).toFixed(2)} Mo`);
                        setCniFilePath(null);
                        setCniStoragePath(null);
                        setDocError(null);
                        uploadKybPiece(file).then((storedPath) => setCniStoragePath(storedPath));
                      }}
                      onPathSelected={(pathStr) => {
                        setCniFilePath(pathStr);
                        setCniFile(pathStr.split(/[\\/]/).pop() || pathStr);
                        setCniFileSize('Chemin renseigné');
                        setCniStoragePath(null);
                      }}
                      onRemoveFile={() => {
                        setCniFile(null);
                        setCniFileSize('');
                        setCniFilePath(null);
                        setCniStoragePath(null);
                      }}
                      locale={locale}
                    />
                  </div>

                  {docError && (
                    <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300">{docError}</div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-xl text-sm font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] via-[#E5A93C] to-[#B8860B] hover:from-[#E5A93C] hover:to-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all"
                  >
                    Soumettre mon dossier Fournisseur pour Audit KYB
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
