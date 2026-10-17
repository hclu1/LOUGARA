'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Check,
  Award,
  Crown,
  Sparkles,
  ArrowRight,
  Info,
  CheckCircle2,
  X,
  CreditCard,
  Building2,
  Users,
  Coins,
  ShieldCheck,
  Zap,
  Globe,
  HelpCircle,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { SUPPORTED_CURRENCIES, CurrencyCode } from '@/locales';

export default function TarifsPage() {
  const { locale, currency, setCurrency, t, formatPlanPrice, formatCustomAmount } = useLanguage();
  const [isAnnual, setIsAnnual] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'suppliers' | 'buyers' | 'credits'>('suppliers');
  const [isStripeEnabled, setIsStripeEnabled] = useState<boolean>(false);
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedPlanName, setSelectedPlanName] = useState<string>('');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setIsStripeEnabled(data.settings.isStripeEnabled);
        }
      })
      .catch((err) => console.warn('Erreur vérification statut Stripe:', err));
  }, []);

  const handleSelectPlan = async (planCode: string, _planName: string) => {
    setLoadingCheckout(planCode);
    const cycle = planCode.startsWith('CREDIT_PACK')
      ? 'ONE_TIME'
      : isAnnual
        ? 'ANNUAL'
        : 'MONTHLY';
    window.location.href = `/paiement?plan=${encodeURIComponent(
      planCode
    )}&cycle=${cycle}&currency=${encodeURIComponent(currency)}`;
  };

  const currConfig = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.EUR;

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 space-y-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        {/* LAUNCH BANNER IF STRIPE IS NOT ACTIVE YET */}
        {!isStripeEnabled && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto shadow-lg">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                <strong>{locale === 'fr' ? 'Accès Découverte Gratuit :' : 'Free Launch Offer:'}</strong>{' '}
                {locale === 'fr'
                  ? 'Profitez de la consultation illimitée du catalogue et publiez vos premiers produits sans frais d\'inscription.'
                  : 'Enjoy unlimited catalog browsing and publish your first products with no registration fees.'}
              </span>
            </div>
            <Link
              href="/devenir-fournisseur"
              className="shrink-0 py-1.5 px-4 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 text-xs transition-all shadow"
            >
              {locale === 'fr' ? 'Créer un profil société' : 'Create company profile'}
            </Link>
          </div>
        )}

        {/* HERO HEADER */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/15 text-[#E5A93C] text-xs font-black border border-[#D4AF37]/30 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <Award className="w-4 h-4 text-[#D4AF37]" />
            <span>{t.pricing.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {t.pricing.title}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            {t.pricing.subtitle}
          </p>

          {/* SÉLECTEUR DE DEVISE & CYCLE DE FACTURATION */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            {/* Devise active */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-slate-300">
              <span className="text-slate-400">{t.localeSwitcher.currency} :</span>
              <span className="font-mono font-bold text-amber-400 flex items-center gap-1.5">
                <span>{currConfig.flag}</span>
                <span>{currConfig.code} ({currConfig.symbol})</span>
              </span>
            </div>

            {/* Commutateur Mensuel / Annuel */}
            <div className="inline-flex items-center bg-slate-900/90 border border-slate-700/80 p-1 rounded-2xl shadow-inner">
              <button
                type="button"
                onClick={() => setIsAnnual(false)}
                className={`py-1.5 px-4 rounded-xl text-xs font-extrabold transition-all ${
                  !isAnnual
                    ? 'bg-gradient-to-r from-amber-500 to-[#D4AF37] text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.pricing.toggleMonthly}
              </button>
              <button
                type="button"
                onClick={() => setIsAnnual(true)}
                className={`py-1.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  isAnnual
                    ? 'bg-gradient-to-r from-amber-500 to-[#D4AF37] text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{t.pricing.toggleAnnual}</span>
                <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  -20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 ONGLETS PRINCIPAUX : FOURNISSEURS / ENTREPRENEURS / CRÉDITS */}
        <div className="flex justify-center border-b border-slate-800 pb-2">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`flex items-center gap-2 py-2.5 px-5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                activeTab === 'suppliers'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{t.pricing.tabSuppliers}</span>
            </button>

            <button
              onClick={() => setActiveTab('buyers')}
              className={`flex items-center gap-2 py-2.5 px-5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                activeTab === 'buyers'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{t.pricing.tabBuyers}</span>
            </button>

            <button
              onClick={() => setActiveTab('credits')}
              className={`flex items-center gap-2 py-2.5 px-5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                activeTab === 'credits'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>{t.pricing.tabCredits}</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ONGLET 1 : GRILLE FOURNISSEURS (4 PALIERS) */}
        {/* ========================================================================= */}
        {activeTab === 'suppliers' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center max-w-2xl mx-auto text-xs sm:text-sm text-slate-400">
              {t.pricing.tabSuppliersDesc}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
              {/* Fournisseur 1 : Découverte Gratuit */}
              <div className="glass-card rounded-3xl border border-slate-800 p-6 flex flex-col justify-between space-y-6 hover:border-slate-700 transition-all bg-slate-900/40">
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Entrée libre
                    </span>
                    <h3 className="text-xl font-black text-white mt-0.5">
                      {t.pricing.supplierFree.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 min-h-[32px]">
                      {t.pricing.supplierFree.tagline}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">{formatPlanPrice('SUPPLIER_FREE', isAnnual)}</span>
                    <span className="text-xs text-slate-400 font-bold">{t.pricing.freePerMonth}</span>
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 font-medium">
                    📦 <strong>Quota :</strong> 4 fiches produits
                  </div>

                  <ul className="space-y-3 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{t.pricing.supplierFree.feature1}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{t.pricing.supplierFree.feature2}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{t.pricing.supplierFree.feature3}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{t.pricing.supplierFree.feature4}</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4">
                  <Link
                    href="/devenir-fournisseur"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-all border border-slate-700"
                  >
                    <span>{t.pricing.supplierFree.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Fournisseur 2 : Catalogue Essentiel */}
              <div className="glass-card rounded-3xl border border-slate-800 p-6 flex flex-col justify-between space-y-6 hover:border-amber-500/40 transition-all bg-slate-900/60">
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                      Gamme ciblée
                    </span>
                    <h3 className="text-xl font-black text-white mt-0.5">
                      {t.pricing.supplierEssential.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 min-h-[32px]">
                      {t.pricing.supplierEssential.tagline}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">{formatPlanPrice('SUPPLIER_ESSENTIAL', isAnnual)}</span>
                    <span className="text-xs text-slate-400 font-bold">{isAnnual ? t.pricing.perYear : t.pricing.perMonth}</span>
                  </div>

                  <div className="p-2.5 bg-amber-950/30 rounded-xl border border-amber-500/20 text-xs text-amber-300 font-medium">
                    📦 <strong>Quota :</strong> 20 fiches produits
                  </div>

                  <ul className="space-y-3 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{t.pricing.supplierEssential.feature1}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{t.pricing.supplierEssential.feature2}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{t.pricing.supplierEssential.feature3}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{t.pricing.supplierEssential.feature4}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{t.pricing.supplierEssential.feature5}</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => handleSelectPlan('SUPPLIER_ESSENTIAL', 'Catalogue Essentiel')}
                    disabled={loadingCheckout === 'SUPPLIER_ESSENTIAL'}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 transition-all border border-amber-500/40 hover:border-amber-400"
                  >
                    <span>{loadingCheckout === 'SUPPLIER_ESSENTIAL' ? '...' : t.pricing.supplierEssential.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Fournisseur 3 : Catalogue Pro (POPULAIRE) */}
              <div className="glass-card rounded-3xl gold-glow-border p-6 flex flex-col justify-between space-y-6 relative transform lg:-translate-y-2 shadow-[0_0_35px_rgba(212,175,55,0.25)] bg-gradient-to-b from-slate-900/90 via-[#0F172A] to-[#0B132B]">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-slate-950 px-3.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-md flex items-center gap-1">
                  <Crown className="w-3 h-3 text-slate-950" />
                  <span>{t.pricing.supplierPro.popularBadge}</span>
                </div>

                <div className="space-y-5 pt-1">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#E5A93C]">
                      Certifié & Recommandé
                    </span>
                    <h3 className="text-xl font-black text-white mt-0.5">
                      {t.pricing.supplierPro.name}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 min-h-[32px]">
                      {t.pricing.supplierPro.tagline}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-gold-gradient">{formatPlanPrice('SUPPLIER_PRO', isAnnual)}</span>
                    <span className="text-xs text-slate-400 font-bold">{isAnnual ? t.pricing.perYear : t.pricing.perMonth}</span>
                  </div>

                  <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/30 text-xs text-amber-200 font-bold flex items-center justify-between">
                    <span>📦 <strong>Quota :</strong> 50 fiches</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/40">
                      Badge KYB Inclus
                    </span>
                  </div>

                  <ul className="space-y-3 text-xs text-slate-200">
                    <li className="flex items-start gap-2 font-bold text-white">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{t.pricing.supplierPro.feature1}</span>
                    </li>
                    <li className="flex items-start gap-2 text-amber-200 font-semibold">
                      <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{t.pricing.supplierPro.feature2}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{t.pricing.supplierPro.feature3}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{t.pricing.supplierPro.feature4}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{t.pricing.supplierPro.feature5}</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => handleSelectPlan('SUPPLIER_PRO', 'Catalogue Pro')}
                    disabled={loadingCheckout === 'SUPPLIER_PRO'}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] via-[#E5A93C] to-[#B8860B] hover:from-[#E5A93C] hover:to-[#D4AF37] transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                  >
                    <span>{loadingCheckout === 'SUPPLIER_PRO' ? '...' : t.pricing.supplierPro.cta}</span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
                  </button>
                </div>
              </div>

              {/* Fournisseur 4 : Catalogue Premium */}
              <div className="glass-card rounded-3xl border border-purple-500/40 p-6 flex flex-col justify-between space-y-6 hover:border-purple-400 transition-all bg-slate-900/60">
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">
                      Grands Industriels
                    </span>
                    <h3 className="text-xl font-black text-white mt-0.5">
                      {t.pricing.supplierPremium.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 min-h-[32px]">
                      {t.pricing.supplierPremium.tagline}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">{formatPlanPrice('SUPPLIER_PREMIUM', isAnnual)}</span>
                    <span className="text-xs text-slate-400 font-bold">{isAnnual ? t.pricing.perYear : t.pricing.perMonth}</span>
                  </div>

                  <div className="p-2.5 bg-purple-950/40 rounded-xl border border-purple-500/30 text-xs text-purple-300 font-bold">
                    📦 <strong>Quota :</strong> 100 fiches (+ extensions)
                  </div>

                  <ul className="space-y-3 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <span>{t.pricing.supplierPremium.feature1}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <span>{t.pricing.supplierPremium.feature2}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <span>{t.pricing.supplierPremium.feature3}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <span>{t.pricing.supplierPremium.feature4}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <span>{t.pricing.supplierPremium.feature5}</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => handleSelectPlan('SUPPLIER_PREMIUM', 'Catalogue Premium')}
                    disabled={loadingCheckout === 'SUPPLIER_PREMIUM'}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow"
                  >
                    <span>{loadingCheckout === 'SUPPLIER_PREMIUM' ? '...' : t.pricing.supplierPremium.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ONGLET 2 : GRILLE ENTREPRENEURS (4 PALIERS) */}
        {/* ========================================================================= */}
        {activeTab === 'buyers' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center max-w-2xl mx-auto text-xs sm:text-sm text-slate-400">
              {t.pricing.tabBuyersDesc}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
              {/* Acheteur 1 : Découverte Gratuit */}
              <div className="glass-card rounded-3xl border border-slate-800 p-6 flex flex-col justify-between space-y-6 hover:border-slate-700 transition-all bg-slate-900/40">
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Sourcing Ouvert
                    </span>
                    <h3 className="text-xl font-black text-white mt-0.5">
                      {t.pricing.buyerFree.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 min-h-[32px]">
                      {t.pricing.buyerFree.tagline}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">{formatPlanPrice('BUYER_FREE', isAnnual)}</span>
                    <span className="text-xs text-slate-400 font-bold">{t.pricing.freePerMonth}</span>
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 font-medium">
                    🔍 <strong>Consultation :</strong> 100% Illimitée
                  </div>

                  <ul className="space-y-3 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{t.pricing.buyerFree.feature1}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{t.pricing.buyerFree.feature2}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{t.pricing.buyerFree.feature3}</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-500">
                      <X className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      <span>{t.pricing.buyerFree.feature4}</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4">
                  <Link
                    href="/catalogue"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-all border border-slate-700"
                  >
                    <span>{t.pricing.buyerFree.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Acheteur 2 : Entrepreneur Essentiel */}
              <div className="glass-card rounded-3xl border border-slate-800 p-6 flex flex-col justify-between space-y-6 hover:border-emerald-500/40 transition-all bg-slate-900/60">
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                      Premiers contacts
                    </span>
                    <h3 className="text-xl font-black text-white mt-0.5">
                      {t.pricing.buyerEssential.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 min-h-[32px]">
                      {t.pricing.buyerEssential.tagline}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">{formatPlanPrice('BUYER_ESSENTIAL', isAnnual)}</span>
                    <span className="text-xs text-slate-400 font-bold">{isAnnual ? t.pricing.perYear : t.pricing.perMonth}</span>
                  </div>

                  <div className="p-2.5 bg-emerald-950/40 rounded-xl border border-emerald-500/20 text-xs text-emerald-300 font-bold">
                    🤝 <strong>Mises en relation :</strong> 3 par mois
                  </div>

                  <ul className="space-y-3 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{t.pricing.buyerEssential.feature1}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{t.pricing.buyerEssential.feature2}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{t.pricing.buyerEssential.feature3}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{t.pricing.buyerEssential.feature4}</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => handleSelectPlan('BUYER_ESSENTIAL', 'Entrepreneur Essentiel')}
                    disabled={loadingCheckout === 'BUYER_ESSENTIAL'}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-300 transition-all border border-emerald-500/40 hover:border-emerald-400"
                  >
                    <span>{loadingCheckout === 'BUYER_ESSENTIAL' ? '...' : t.pricing.buyerEssential.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Acheteur 3 : Entrepreneur Pro (POPULAIRE) */}
              <div className="glass-card rounded-3xl border border-emerald-500/60 p-6 flex flex-col justify-between space-y-6 relative transform lg:-translate-y-2 shadow-[0_0_35px_rgba(16,185,129,0.25)] bg-gradient-to-b from-slate-900/90 via-[#064E3B]/20 to-[#0B132B]">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 px-3.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-slate-950" />
                  <span>{t.pricing.buyerPro.popularBadge}</span>
                </div>

                <div className="space-y-5 pt-1">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                      Négociations Actives
                    </span>
                    <h3 className="text-xl font-black text-white mt-0.5">
                      {t.pricing.buyerPro.name}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 min-h-[32px]">
                      {t.pricing.buyerPro.tagline}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-emerald-400">{formatPlanPrice('BUYER_PRO', isAnnual)}</span>
                    <span className="text-xs text-slate-400 font-bold">{isAnnual ? t.pricing.perYear : t.pricing.perMonth}</span>
                  </div>

                  <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/30 text-xs text-emerald-200 font-bold">
                    🤝 <strong>Mises en relation :</strong> 15 par mois
                  </div>

                  <ul className="space-y-3 text-xs text-slate-200">
                    <li className="flex items-start gap-2 font-bold text-white">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{t.pricing.buyerPro.feature1}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{t.pricing.buyerPro.feature2}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{t.pricing.buyerPro.feature3}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{t.pricing.buyerPro.feature4}</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => handleSelectPlan('BUYER_PRO', 'Entrepreneur Pro')}
                    disabled={loadingCheckout === 'BUYER_PRO'}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 hover:from-emerald-300 hover:to-emerald-500 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                  >
                    <span>{loadingCheckout === 'BUYER_PRO' ? '...' : t.pricing.buyerPro.cta}</span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
                  </button>
                </div>
              </div>

              {/* Acheteur 4 : Entrepreneur VIP */}
              <div className="glass-card rounded-3xl border border-purple-500/40 p-6 flex flex-col justify-between space-y-6 hover:border-purple-400 transition-all bg-slate-900/60">
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">
                      Centrale d&apos;Achat
                    </span>
                    <h3 className="text-xl font-black text-white mt-0.5">
                      {t.pricing.buyerVip.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 min-h-[32px]">
                      {t.pricing.buyerVip.tagline}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">{formatPlanPrice('BUYER_VIP', isAnnual)}</span>
                    <span className="text-xs text-slate-400 font-bold">{isAnnual ? t.pricing.perYear : t.pricing.perMonth}</span>
                  </div>

                  <div className="p-2.5 bg-purple-950/40 rounded-xl border border-purple-500/30 text-xs text-purple-300 font-bold">
                    🤝 <strong>Mises en relation :</strong> 50 par mois
                  </div>

                  <ul className="space-y-3 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <span>{t.pricing.buyerVip.feature1}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <span>{t.pricing.buyerVip.feature2}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <span>{t.pricing.buyerVip.feature3}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <span>{t.pricing.buyerVip.feature4}</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => handleSelectPlan('BUYER_VIP', 'Entrepreneur VIP')}
                    disabled={loadingCheckout === 'BUYER_VIP'}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow"
                  >
                    <span>{loadingCheckout === 'BUYER_VIP' ? '...' : t.pricing.buyerVip.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ONGLET 3 : PACKS DE CRÉDITS (PAY-AS-YOU-GO) */}
        {/* ========================================================================= */}
        {activeTab === 'credits' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header explicatif des crédits */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/30 text-center max-w-3xl mx-auto space-y-2">
              <h3 className="text-lg font-black text-white flex items-center justify-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <span>{t.pricing.credits.bannerTitle}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                {t.pricing.credits.bannerSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
              {/* Pack 1 */}
              <div className="glass-card rounded-3xl border border-slate-800 p-6 flex flex-col justify-between space-y-6 hover:border-purple-500/40 transition-all bg-slate-900/60">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black">
                    1×
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">{t.pricing.credits.pack1Name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{t.pricing.credits.pack1Desc}</p>
                  </div>
                  <div className="text-3xl font-black text-white">
                    {formatPlanPrice('CREDIT_PACK_1')}
                  </div>
                  <p className="text-[11px] text-emerald-400 font-semibold">
                    ✓ Déblocage garanti pendant 30 jours
                  </p>
                </div>
                <button
                  onClick={() => handleSelectPlan('CREDIT_PACK_1', 'Pack Flash 1 Crédit')}
                  disabled={loadingCheckout === 'CREDIT_PACK_1'}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-all"
                >
                  {t.pricing.credits.buyNow}
                </button>
              </div>

              {/* Pack 5 (Croissance) */}
              <div className="glass-card rounded-3xl gold-glow-border p-6 flex flex-col justify-between space-y-6 relative bg-gradient-to-b from-slate-900/90 to-[#0B132B] shadow-[0_0_25px_rgba(212,175,55,0.2)]">
                <div className="absolute -top-3 right-4 bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Économie 13%
                </div>
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-black">
                    5×
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">{t.pricing.credits.pack5Name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{t.pricing.credits.pack5Desc}</p>
                  </div>
                  <div className="text-3xl font-black text-gold-gradient">
                    {formatPlanPrice('CREDIT_PACK_5')}
                  </div>
                  <p className="text-[11px] text-emerald-400 font-semibold">
                    ✓ 5 fournisseurs différents débloqués 30 jours
                  </p>
                </div>
                <button
                  onClick={() => handleSelectPlan('CREDIT_PACK_5', 'Pack Croissance 5 Crédits')}
                  disabled={loadingCheckout === 'CREDIT_PACK_5'}
                  className="w-full py-3 px-4 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-500 to-[#D4AF37] hover:from-amber-400 hover:to-amber-500 transition-all shadow-md"
                >
                  {t.pricing.credits.buyNow}
                </button>
              </div>

              {/* Pack 15 (Volume) */}
              <div className="glass-card rounded-3xl border border-purple-500/40 p-6 flex flex-col justify-between space-y-6 hover:border-purple-400 transition-all bg-slate-900/60 relative">
                <div className="absolute -top-3 right-4 bg-purple-500 text-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Économie 26%
                </div>
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-black">
                    15×
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">{t.pricing.credits.pack15Name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{t.pricing.credits.pack15Desc}</p>
                  </div>
                  <div className="text-3xl font-black text-purple-300">
                    {formatPlanPrice('CREDIT_PACK_15')}
                  </div>
                  <p className="text-[11px] text-emerald-400 font-semibold">
                    ✓ Validité 12 mois sans aucune limite
                  </p>
                </div>
                <button
                  onClick={() => handleSelectPlan('CREDIT_PACK_15', 'Pack Volume 15 Crédits')}
                  disabled={loadingCheckout === 'CREDIT_PACK_15'}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow"
                >
                  {t.pricing.credits.buyNow}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* BANNIÈRE DE SÉCURITÉ & PAIEMENT */}
        {/* ========================================================================= */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center text-xs text-slate-400 max-w-3xl mx-auto flex items-center justify-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{t.pricing.guaranteeBanner}</span>
        </div>
      </div>

      {/* MODALE D'INFORMATION POUR ACTIVATION STRIPE */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="glass-card max-w-lg w-full p-6 rounded-2xl border border-amber-500/40 space-y-5 bg-[#0B132B] relative shadow-2xl">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-amber-400">
              <CreditCard className="w-8 h-8 shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-white">
                  {locale === 'fr' ? 'Plateforme en phase de lancement gratuit' : 'Platform in Free Launch Phase'}
                </h3>
                <p className="text-xs text-amber-300/90">{selectedPlanName}</p>
              </div>
            </div>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {locale === 'fr'
                ? `La souscription automatique par carte bancaire et Mobile Money pour la formule ${selectedPlanName} est en cours de déploiement sécurisé.`
                : `Automatic credit card and Mobile Money processing for ${selectedPlanName} is being securely deployed.`}
              <br /><br />
              {locale === 'fr'
                ? 'Vous pouvez dès maintenant référencer votre société et profiter du catalogue vérifié gratuitement.'
                : 'You can already list your company and explore the verified catalog completely free of charge.'}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/devenir-fournisseur"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow"
              >
                <span>{locale === 'fr' ? 'Créer mon profil gratuitement' : 'Create profile for free'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={() => setModalOpen(false)}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                {t.modals.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
