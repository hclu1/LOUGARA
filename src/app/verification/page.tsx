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

export default function VerificationPage() {
  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* HERO SECTION */}
        <section className="text-center max-w-3xl mx-auto space-y-6 pt-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold bg-[#D4AF37]/10 text-[#E5A93C] border border-[#D4AF37]/30 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <Award className="w-4 h-4 text-[#D4AF37]" />
            <span>Charte d&apos;Audit Administratif & Audit Physique Rigoureux</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            La Garantie Vérification <span className="text-gold-gradient">Lougara B2B</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            La confiance ne s&apos;accorde pas sur parole : elle se prouve par une procédure d&apos;audit en 4 piliers. Chaque fournisseur portant le badge{' '}
            <BadgeVerified className="ml-1 inline-flex" /> a fait l&apos;objet d&apos;un contrôle rigoureux de ses documents légaux et de ses capacités d&apos;exportation.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              href="/catalogue"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-extrabold text-slate-950 bg-gradient-to-r from-[#D4AF37] via-[#E5A93C] to-[#B8860B] hover:from-[#E5A93C] hover:to-[#D4AF37] rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all"
            >
              <Search className="w-4 h-4" />
              Consulter le Catalogue Vérifié
            </Link>

            <Link
              href="/devenir-fournisseur"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-extrabold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Soumettre mon Entreprise pour Audit
            </Link>
          </div>
        </section>

        {/* 4 PILLARED AUDIT PROTOCOL CARDS */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">
              Protocoles de Sécurisation Transfrontalière
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              Les 4 Piliers de l&apos;Audit de Conformité
            </h2>
            <p className="text-slate-400 text-sm">
              Découvrez la méthodologie systématique appliquée par les auditeurs Lougara avant l&apos;octroi du statut officiel.
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
                  Pilier 01
                </span>
              </div>

              <h3 className="text-xl font-bold text-white">
                1. Registre du Commerce & Greffe Officiel (RCCM / Kbis)
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed">
                Contrôle de l&apos;immatriculation légale active auprès des tribunaux de commerce (Kbis en France / RCCM dans la zone OHADA & UEMOA). Nous vérifions l&apos;existence juridique, la forme de la société et l&apos;absence de procédure collective d&apos;apurement.
              </p>

              <div className="pt-2 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Validation du Numéro SIREN / SIRET / RCCM</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Vérification du rôle légal du gérant ou mandataire</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Conformité de l&apos;objet social avec le secteur déclaré</span>
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
                  Pilier 02
                </span>
              </div>

              <h3 className="text-xl font-bold text-white">
                2. Analyse des Signatures, Sceaux & Tampons Officiels
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed">
                Reconnaissance et examen approfondi des tampons officiels, des sceaux de greffes et des signatures des représentants légaux. Notre outil d&apos;inspection intègre un grossissement optique 2.5x pour détecter la falsification documentaire.
              </p>

              <div className="pt-2 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Authentification optique des tampons et sceaux du greffe</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Concordance CNI / Passeport du représentant légal</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Contrôle anti-usurpation d&apos;identité d&apos;entreprise</span>
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
                  Pilier 03
                </span>
              </div>

              <h3 className="text-xl font-bold text-white">
                3. Conformité Fiscale & Attestation NIF / NINEA
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed">
                Vérification du numéro d&apos;identification fiscale (NINEA au Sénégal, NIF en Côte d&apos;Ivoire et Afrique centrale, numéro de TVA intracommunautaire en Europe). Cette étape certifie l&apos;aptitude de l&apos;entreprise à émettre des factures officielles d&apos;exportation.
              </p>

              <div className="pt-2 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Attestation d&apos;immatriculation fiscale en règle</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Capacité de facturation B2B internationale</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Traçabilité des coordonnées bancaires d&apos;entreprise</span>
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
                  Pilier 04
                </span>
              </div>

              <h3 className="text-xl font-bold text-white">
                4. Localisation des Entrepôts & Capacité de Production
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed">
                Validation de la réalité physique des infrastructures de stockage, des coopératives ou des unités de transformation. Nous testons également la réactivité de la ligne directe professionnelle et les MOQ (Quantités Minimales).
              </p>

              <div className="pt-2 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Géolocalisation certifiée des entrepôts et ports de départ</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Vérification des volumes de stock disponibles</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Test de réactivité du service export sous 24h</span>
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
              Une protection totale contre la fraude B2B transfrontalière
            </h2>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              En éliminant à la source les faux profils et les entreprises non immatriculées, Lougara garantit aux acheteurs européens et africains des transactions sereines, directes et sécurisées.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/devenir-fournisseur"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-extrabold text-slate-950 bg-gradient-to-r from-[#D4AF37] via-[#E5A93C] to-[#B8860B] hover:from-[#E5A93C] hover:to-[#D4AF37] rounded-xl shadow-[0_0_25px_rgba(212,175,55,0.35)] transition-all"
              >
                <span>Faire auditer mon entreprise</span>
                <ArrowRight className="w-5 h-5 text-slate-950" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
