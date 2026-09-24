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
import { parseKbisOcrText, ParsedKbisData } from '@/features/ocr/kbis-parser';

interface CatalogProductItem {
  id: string;
  title: string;
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
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Entreprise
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('Sénégal');
  const [city, setCity] = useState('');
  const [sector, setSector] = useState('Cosmétique & Soins');
  const [companyDescription, setCompanyDescription] = useState('');
  const [regNumber, setRegNumber] = useState('');

  // Pièces KYB
  const [kbisFile, setKbisFile] = useState<string | null>(null);
  const [kbisFileSize, setKbisFileSize] = useState<string>('');
  const [cniFile, setCniFile] = useState<string | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);
  const [ocrConfidence, setOcrConfidence] = useState<number | null>(null);

  // Multi-Produits
  const [catalogProducts, setCatalogProducts] = useState<CatalogProductItem[]>([
    {
      id: 'prod-1',
      title: 'Beurre de Karité Bio Brut (Fûts de 25kg)',
      description: 'Extrait à froid par coopérative féminine au Sénégal. Grade A, certifié sans solvant chimique.',
      category: 'Cosmétique & Soins',
      priceMin: '8.50',
      priceMax: '12.00',
      currency: 'EUR',
      moq: 4,
      unit: 'fût (25kg)',
      images: [
        'https://images.unsplash.com/photo-1608248597359-54d922336336?auto=format&fit=crop&q=80&w=800',
      ],
    },
  ]);

  // Contact
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [subscriptionPlan, setSubscriptionPlan] = useState<'STANDARD' | 'PREMIUM' | 'VIP'>('PREMIUM');
  const [hasCatalogAdSpace, setHasCatalogAdSpace] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const applyParsedData = (data: ParsedKbisData, fileName: string, fileSizeStr: string) => {
    setKbisFile(fileName);
    setKbisFileSize(fileSizeStr);
    setAutoFilled(true);
    setOcrConfidence(data.confidenceScore);
    if (data.companyName) setCompanyName(data.companyName);
    if (data.regNumber) setRegNumber(data.regNumber);
    if (data.country) setCountry(data.country);
    if (data.city) setCity(data.city);
    if (data.contactName) setContactName(data.contactName);
  };

  const handleKbisFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr = `${(file.size / 1024 / 1024).toFixed(2)} Mo`;
    setIsScanning(true);

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
          applyParsedData(result.data, file.name, sizeStr);
          return;
        }
      }
    } catch (err) {}

    setIsScanning(false);
    setKbisFile(file.name);
    setKbisFileSize(sizeStr);
    setAutoFilled(true);
  };

  const handleAddProduct = () => {
    if (catalogProducts.length >= 10) return;
    setCatalogProducts([
      ...catalogProducts,
      {
        id: `prod-${Date.now()}`,
        title: '',
        description: '',
        category: sector,
        priceMin: '10.00',
        priceMax: '20.00',
        currency: 'EUR',
        moq: 10,
        unit: 'unité',
        images: [],
      },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        }),
      });
      setIsSubmitted(true);
    } catch (err) {
      setIsSubmitted(true);
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
            <span>Onboarding Fournisseur Agréé &bull; OCR Universel Kbis & NIF</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Devenir Fournisseur <span className="text-gold-gradient">Vérifié Lougara</span>
          </h1>

          <p className="text-slate-300 text-base leading-relaxed">
            Exposez votre gamme dans le catalogue B2B certifié. Déposez votre document d&apos;immatriculation légal et laissez l&apos;OCR pré-remplir votre dossier sans effort.
          </p>
        </div>

        {/* STEPPER WIZARD INDICATOR */}
        <div className="glass-card p-4 sm:p-6 rounded-3xl border border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
          {[
            { step: 1, label: 'Kbis & KYB' },
            { step: 2, label: 'Entreprise' },
            { step: 3, label: 'Catalogue (Max 10)' },
            { step: 4, label: 'Contact' },
            { step: 5, label: 'Abonnement' },
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
                Dossier KYB Transmis avec Succès !
              </h2>
              <p className="text-sm text-slate-300">
                Votre extrait officiel <span className="font-bold text-amber-300">{kbisFile}</span> pour <span className="font-bold text-white">{companyName}</span> est en cours d&apos;audit par l&apos;équipe de modération sous 48h.
              </p>
              <div className="pt-4">
                <Link
                  href="/catalogue"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] shadow-md"
                >
                  Consulter le Catalogue
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

                  <label className="border-2 border-dashed border-slate-700 hover:border-[#D4AF37] rounded-2xl p-8 text-center cursor-pointer transition-colors block bg-slate-900/80 group gold-glow-border">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.webp"
                      onChange={handleKbisFileChange}
                      className="hidden"
                    />
                    <Upload className="w-10 h-10 text-[#D4AF37] mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <p className="text-base font-bold text-white">
                      {kbisFile ? `Fichier prêt : ${kbisFile}` : 'Déposez votre Extrait Kbis (France) ou RCCM (Afrique)'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      PDF, PNG, JPG, WEBP &bull; Extraction immédiate des métadonnées légales
                    </p>
                  </label>

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
                  </div>

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
                      className="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4 text-emerald-400" /> Ajout Article
                    </button>
                  </div>

                  <div className="space-y-4">
                    {catalogProducts.map((p, idx) => (
                      <div key={p.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700 space-y-3">
                        <div className="flex justify-between items-center text-xs font-bold text-[#E5A93C]">
                          <span>Article #{idx + 1}</span>
                        </div>
                        <input
                          type="text"
                          placeholder="Nom de l'article (ex: Beurre de karité bio brut)"
                          value={p.title}
                          onChange={(e) => {
                            const next = [...catalogProducts];
                            next[idx].title = e.target.value;
                            setCatalogProducts(next);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white"
                        />
                      </div>
                    ))}
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
