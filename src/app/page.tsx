'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  Building2,
  ArrowRight,
  TrendingUp,
  Award,
  Globe2,
  Sparkles,
  Users,
  Search,
  Check,
  FileCheck2,
  Lock,
  Stamp,
  BadgePercent,
  Layers,
} from 'lucide-react';
import { BadgeVerified } from '@/components/BadgeVerified';
import { useLanguage } from '@/context/LanguageContext';

export default function HomePage() {
  const { t, locale } = useLanguage();

  return (
    <div className="bg-[#0B132B] text-slate-100 min-h-screen space-y-24 pb-20 overflow-hidden">
      {/* HERO SECTION WITH DEEP NAVY BACKDROP & GLOWING PREVIEW CARD */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading, Subtitle & Dual CTAs */}
            <div className="lg:col-span-7 space-y-8 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold bg-[#D4AF37]/10 text-[#E5A93C] border border-[#D4AF37]/30 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>{t.home.badge}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                {t.home.h1Main}{' '}
                <span className="text-gold-gradient block mt-1">
                  {t.home.h1Gold}
                </span>
              </h1>

              <p className="text-slate-300 text-lg sm:text-xl leading-relaxed max-w-2xl font-medium">
                {t.home.heroDesc}
              </p>

              {/* Dual CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  href="/entrepreneurs"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-extrabold text-slate-950 bg-gradient-to-r from-[#D4AF37] via-[#E5A93C] to-[#B8860B] hover:from-[#E5A93C] hover:to-[#D4AF37] rounded-xl shadow-[0_0_25px_rgba(212,175,55,0.35)] hover:shadow-[0_0_35px_rgba(212,175,55,0.5)] transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <Users className="w-5 h-5 text-slate-950" />
                  <span>{t.home.ctaBuyers}</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </Link>

                <Link
                  href="/catalogue"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-extrabold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.35)] transition-all duration-300"
                >
                  <Search className="w-5 h-5 text-emerald-400" />
                  <span>{t.home.ctaExplore}</span>
                </Link>
              </div>

              {/* TRUST STATS BAR */}
              <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80 mt-8">
                <div className="p-4 rounded-2xl glass-card border border-[#D4AF37]/20">
                  <p className="text-3xl font-black text-white">100%</p>
                  <p className="text-xs font-bold text-slate-400 mt-1">{t.home.statsControlled}</p>
                </div>
                <div className="p-4 rounded-2xl glass-card border border-emerald-500/30">
                  <p className="text-3xl font-black text-emerald-400">0%</p>
                  <p className="text-xs font-bold text-slate-400 mt-1">{t.home.statsFake}</p>
                </div>
                <div className="p-4 rounded-2xl glass-card border border-[#D4AF37]/20">
                  <p className="text-3xl font-black text-amber-300">{locale === 'fr' ? 'Corridor' : 'Corridor'}</p>
                  <p className="text-xs font-bold text-slate-400 mt-1">{t.home.statsCorridor}</p>
                </div>
                <div className="p-4 rounded-2xl glass-card border border-emerald-500/30">
                  <p className="text-3xl font-black text-emerald-300">{locale === 'fr' ? 'Direct' : 'Direct'}</p>
                  <p className="text-xs font-bold text-slate-400 mt-1">{t.home.statsDirect}</p>
                </div>
              </div>
            </div>

            {/* Right Column: GLOWING GOLD-BORDERED PREVIEW CARD ("Dernière Entreprise Auditée") */}
            <div className="lg:col-span-5 relative">
              <div className="glass-card gold-glow-border p-7 rounded-3xl space-y-6 relative overflow-hidden shadow-[0_0_40px_rgba(212,175,55,0.2)]">
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 emerald-pulse" />
                    <span className="text-xs font-extrabold uppercase tracking-widest text-[#E5A93C]">
                      {t.home.lastAudited}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-700">
                    {locale === 'fr' ? 'Audit certifié' : 'Verified audit'}
                  </span>
                </div>

                {/* Company details */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-black text-white">Africa Bio Extracts SARL</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
                        {locale === 'fr' ? 'Sénégal (Dakar) • Export vers la France' : 'Senegal (Dakar) • Export to France'}
                      </p>
                    </div>
                    <BadgeVerified />
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-300 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-400">{locale === 'fr' ? 'RCCM Officiel :' : 'Official RCCM:'}</span>
                      <span className="font-mono text-amber-300 font-bold">SN-DKR-2021-B-8912</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-400">{locale === 'fr' ? 'Identification Fiscale :' : 'Tax ID Certificate:'}</span>
                      <span className="font-mono text-emerald-300 font-bold">NINEA-009847123</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-400">{locale === 'fr' ? 'Score de Conformité :' : 'Compliance Score:'}</span>
                      <span className="font-extrabold text-emerald-400">98 / 100 ({locale === 'fr' ? 'Validé' : 'Approved'})</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      {locale === 'fr' ? 'Gamme Certifiée au Catalogue :' : 'Certified Catalog Products:'}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        {locale === 'fr' ? 'Beurre de Karité Bio Grade A' : 'Organic Raw Shea Butter Grade A'}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        {locale === 'fr' ? 'Huile Pure de Baobab Vierge' : 'Virgin Pure Baobab Oil'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/catalogue"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-extrabold text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] hover:from-[#E5A93C] hover:to-[#D4AF37] transition-all shadow-md"
                  >
                    <span>{locale === 'fr' ? 'Voir ce fournisseur et demander un devis' : 'View supplier and request quote'}</span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENTO GRID FOR THE 4 PILOT SECTORS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#D4AF37]">
            {locale === 'fr' ? 'Sourcing ciblé & spécialisé' : 'Targeted B2B Sourcing'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            {t.home.sectorsTitle}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            {t.home.sectorsSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Cosmétique Bio */}
          <div className="glass-card glass-card-hover p-6 rounded-3xl space-y-4 flex flex-col justify-between group border-t-2 border-t-[#D4AF37]">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                🧴
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-[#E5A93C] transition-colors">
                  {t.footer.sectorCosmetic}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-2">
                  {locale === 'fr'
                    ? 'Beurre de karité brut Grade A, huile pure de baobab, nigelle, moringa, et soins naturels certifiés.'
                    : 'Grade A raw shea butter, pure virgin baobab oil, black seed oil, moringa, and organic certified cosmetics.'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <Link
                href="/catalogue?category=Cosmétique"
                className="text-xs font-extrabold text-[#E5A93C] flex items-center justify-between group-hover:translate-x-1 transition-transform"
              >
                <span>{locale === 'fr' ? 'Sourcing Cosmétique' : 'Cosmetics Sourcing'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: Textile Wax */}
          <div className="glass-card glass-card-hover p-6 rounded-3xl space-y-4 flex flex-col justify-between group border-t-2 border-t-blue-500">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                🧵
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                  {t.footer.sectorTextile}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-2">
                  {locale === 'fr'
                    ? 'Grossistes de coton biologique, tissus wax authentiques, pagnes traditionnels et ateliers de confection.'
                    : 'Organic cotton wholesalers, authentic wax prints, traditional African textiles, and garment workshops.'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <Link
                href="/catalogue?category=Textile"
                className="text-xs font-extrabold text-blue-400 flex items-center justify-between group-hover:translate-x-1 transition-transform"
              >
                <span>{locale === 'fr' ? 'Sourcing Textile' : 'Textile Sourcing'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 3: Agroalimentaire */}
          <div className="glass-card glass-card-hover p-6 rounded-3xl space-y-4 flex flex-col justify-between group border-t-2 border-t-emerald-500">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                🌱
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {t.footer.sectorAgro}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-2">
                  {locale === 'fr'
                    ? 'Fèves de cacao sélectionnées, café grand cru, vanille bourbon de Madagascar, cajou et épices nobles.'
                    : 'Selected cocoa beans, specialty coffee, Madagascar bourbon vanilla, raw cashews, and noble African spices.'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <Link
                href="/catalogue?category=Agroalimentaire"
                className="text-xs font-extrabold text-emerald-400 flex items-center justify-between group-hover:translate-x-1 transition-transform"
              >
                <span>{locale === 'fr' ? 'Sourcing Agroalimentaire' : 'Agri-food Sourcing'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 4: Artisanat d'Art */}
          <div className="glass-card glass-card-hover p-6 rounded-3xl space-y-4 flex flex-col justify-between group border-t-2 border-t-purple-500">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                🎨
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                  {t.footer.sectorCraft}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-2">
                  {locale === 'fr'
                    ? 'Objets d\'art sculptés, poteries traditionnelles, vannerie d\'art et éléments de décoration faits main.'
                    : 'Handcrafted wooden sculptures, traditional pottery, woven art baskets, and handmade African home decor.'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <Link
                href="/catalogue?category=Artisanat"
                className="text-xs font-extrabold text-purple-400 flex items-center justify-between group-hover:translate-x-1 transition-transform"
              >
                <span>{locale === 'fr' ? 'Sourcing Artisanat' : 'Craft Sourcing'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* LE PILIER CONFIANCE SECTION */}
      <section id="confiance" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-8 sm:p-12 rounded-3xl border border-emerald-500/30 relative overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.15)]">
          <div className="max-w-3xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>{locale === 'fr' ? 'Avantage Exclusif de la Plateforme' : 'Platform Exclusive Guarantee'}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {locale === 'fr'
                ? 'La confiance n\'est pas une promesse, c\'est une procédure de vérification.'
                : 'Trust is not a promise, it is a rigorous verification protocol.'}
            </h2>

            <p className="text-slate-300 text-base leading-relaxed">
              {locale === 'fr'
                ? 'Chaque entreprise détenant le badge '
                : 'Every business displaying the '}
              <BadgeVerified className="ml-1 inline-flex" />{' '}
              {locale === 'fr'
                ? 'a franchi l\'audit complet en 4 étapes :'
                : 'has successfully passed the complete 4-step KYB audit:'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-white">{t.verification.pillar1Title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{t.verification.pillar1Desc}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-white">{t.verification.pillar2Title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{t.verification.pillar2Desc}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-white">{t.verification.pillar3Title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{t.verification.pillar3Desc}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-white">{t.verification.pillar4Title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{t.verification.pillar4Desc}</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/verification"
                className="inline-flex items-center gap-2 text-xs font-extrabold text-[#E5A93C] hover:text-amber-300 underline"
              >
                <span>{locale === 'fr' ? 'Découvrir le protocole d\'audit complet en 4 piliers' : 'Explore full 4-pillar audit protocol'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SUPPLIER ONBOARDING */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card gold-glow-border p-8 sm:p-12 rounded-3xl text-center space-y-6">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t.home.bannerKybTitle}
          </h3>
          <p className="text-slate-300 max-w-2xl mx-auto text-base">
            {t.home.bannerKybDesc}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/devenir-fournisseur"
              className="inline-flex items-center gap-2 px-8 py-4 text-sm font-extrabold text-slate-950 bg-gradient-to-r from-[#D4AF37] via-[#E5A93C] to-[#B8860B] hover:from-[#E5A93C] hover:to-[#D4AF37] rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.35)] transition-all"
            >
              <span>{t.home.bannerKybCta}</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
