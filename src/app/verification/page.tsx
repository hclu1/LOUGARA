'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  FileCheck2,
  Stamp,
  Receipt,
  Factory,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Lock,
  Building2,
  Award,
  Search,
  Eye,
  Scan,
} from 'lucide-react';
import { BadgeVerified } from '@/components/BadgeVerified';
import { useLanguage } from '@/context/LanguageContext';

export default function VerificationPage() {
  const { t, locale } = useLanguage();

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* HERO SECTION */}
        <section className="text-center max-w-3xl mx-auto space-y-6 pt-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold bg-[#D4AF37]/10 text-[#E5A93C] border border-[#D4AF37]/30 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <Award className="w-4 h-4 text-[#D4AF37]" />
            <span>{locale === 'fr' ? 'Charte d\'Audit Administratif & Audit Physique Rigoureux' : 'Rigorous KYB Administrative & Physical Audit Protocol'}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {t.verification.title}
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            {t.verification.subtitle}
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              href="/catalogue"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-extrabold text-slate-950 bg-gradient-to-r from-[#D4AF37] via-[#E5A93C] to-[#B8860B] hover:from-[#E5A93C] hover:to-[#D4AF37] rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all"
            >
              <Search className="w-4 h-4" />
              <span>{locale === 'fr' ? 'Consulter le Catalogue Vérifié' : 'Browse Verified Catalog'}</span>
            </Link>

            <Link
              href="/devenir-fournisseur"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-extrabold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{locale === 'fr' ? 'Soumettre mon Entreprise pour Audit' : 'Submit Company for Audit'}</span>
            </Link>
          </div>
        </section>

        {/* 4 PILLARED AUDIT PROTOCOL CARDS */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">
              {locale === 'fr' ? 'Protocoles de Sécurisation Transfrontalière' : 'Cross-border Security Protocols'}
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              {locale === 'fr' ? 'Les 4 Piliers de l\'Audit de Conformité' : 'The 4 Pillars of Compliance Audit'}
            </h2>
            <p className="text-slate-400 text-sm">
              {locale === 'fr'
                ? 'Découvrez la méthodologie systématique appliquée par les auditeurs Lougara avant l\'octroi du statut officiel.'
                : 'Discover the systematic methodology executed by Lougara compliance auditors before granting official status.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pilier 1 : Registre du Commerce & Greffe */}
            <div className="glass-card glass-card-hover p-8 rounded-3xl space-y-4 border-l-4 border-l-[#D4AF37]">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[#E5A93C] flex items-center justify-center font-extrabold text-xl shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-extrabold text-[#D4AF37] bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-full">
                  {locale === 'fr' ? 'Pilier 01' : 'Pillar 01'}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white">
                {t.verification.pillar1Title}
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed">
                {t.verification.pillar1Desc}
              </p>

              <div className="pt-2 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{locale === 'fr' ? 'Validation du Numéro SIREN / SIRET / RCCM' : 'Validation of SIREN / SIRET / RCCM legal ID'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{locale === 'fr' ? 'Vérification du rôle légal du gérant ou mandataire' : 'Verification of legal representative authority'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{locale === 'fr' ? 'Conformité de l\'objet social avec le secteur déclaré' : 'Corporate purpose match with declared trade sector'}</span>
                </div>
              </div>
            </div>

            {/* Pilier 2 : Analyse des Signatures & Sceaux */}
            <div className="glass-card glass-card-hover p-8 rounded-3xl space-y-4 border-l-4 border-l-emerald-500">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-extrabold text-xl shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <Stamp className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-extrabold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
                  {locale === 'fr' ? 'Pilier 02' : 'Pillar 02'}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white">
                {t.verification.pillar2Title}
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed">
                {t.verification.pillar2Desc}
              </p>

              <div className="pt-2 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{locale === 'fr' ? 'Authentification optique des tampons et sceaux officiels' : 'Optical authentication of official clerk seals'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{locale === 'fr' ? 'Concordance CNI / Passeport du représentant légal' : 'Photo ID / Passport match with authorized signatory'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{locale === 'fr' ? 'Contrôle anti-usurpation d\'identité d\'entreprise' : 'Strict corporate anti-impersonation filter'}</span>
                </div>
              </div>
            </div>

            {/* Pilier 3 : Conformité Fiscale & Certificats */}
            <div className="glass-card glass-card-hover p-8 rounded-3xl space-y-4 border-l-4 border-l-[#E5A93C]">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[#E5A93C] flex items-center justify-center font-extrabold text-xl shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                  <Receipt className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-extrabold text-[#D4AF37] bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-full">
                  {locale === 'fr' ? 'Pilier 03' : 'Pillar 03'}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white">
                {t.verification.pillar3Title}
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed">
                {t.verification.pillar3Desc}
              </p>

              <div className="pt-2 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{locale === 'fr' ? 'Attestation d\'immatriculation fiscale en règle' : 'Up-to-date active tax identification'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{locale === 'fr' ? 'Capacité de facturation B2B internationale' : 'Official international B2B invoicing capacity'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{locale === 'fr' ? 'Traçabilité des coordonnées bancaires d\'entreprise' : 'Verified commercial bank account traceability'}</span>
                </div>
              </div>
            </div>

            {/* Pilier 4 : Audit Physique des Entrepôts & Usines */}
            <div className="glass-card glass-card-hover p-8 rounded-3xl space-y-4 border-l-4 border-l-emerald-400">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-extrabold text-xl shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <Factory className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-extrabold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
                  {locale === 'fr' ? 'Pilier 04' : 'Pillar 04'}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white">
                {t.verification.pillar4Title}
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed">
                {t.verification.pillar4Desc}
              </p>

              <div className="pt-2 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{locale === 'fr' ? 'Géolocalisation certifiée des entrepôts et ports de départ' : 'Certified geolocated warehouses and export ports'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{locale === 'fr' ? 'Vérification des volumes de stock disponibles' : 'Live stock volume validation'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{locale === 'fr' ? 'Test de réactivité du service export sous 24h' : '24h export communication responsiveness test'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEAL OF GUARANTEE INTERACTIVE PREVIEW */}
        <section className="glass-card p-8 sm:p-12 rounded-3xl border border-[#D4AF37]/30 text-center space-y-8 relative overflow-hidden">
          <div className="max-w-3xl mx-auto space-y-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#E5A93C] to-[#B8860B] text-slate-950 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(212,175,55,0.4)]">
              <ShieldCheck className="w-10 h-10" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              {locale === 'fr' ? 'Une protection totale contre la fraude B2B transfrontalière' : 'Total protection against cross-border B2B fraud'}
            </h2>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              {locale === 'fr'
                ? 'En éliminant à la source les faux profils et les entreprises non immatriculées, Lougara garantit aux acheteurs européens et africains des transactions sereines, directes et sécurisées.'
                : 'By removing fake profiles and unverified entities at the root, Lougara empowers European and African trade partners with verified, direct, and worry-free transactions.'}
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/devenir-fournisseur"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-extrabold text-slate-950 bg-gradient-to-r from-[#D4AF37] via-[#E5A93C] to-[#B8860B] hover:from-[#E5A93C] hover:to-[#D4AF37] rounded-xl shadow-[0_0_25px_rgba(212,175,55,0.35)] transition-all"
              >
                <span>{locale === 'fr' ? 'Faire auditer mon entreprise' : 'Submit my company for audit'}</span>
                <ArrowRight className="w-5 h-5 text-slate-950" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
