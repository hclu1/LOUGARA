'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Building2,
  Users,
  Eye,
  Megaphone,
  Layers,
  Award,
  Crown,
} from 'lucide-react';
import { BadgeVerified } from '@/components/BadgeVerified';

export default function TarifsPage() {
  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* HERO HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/15 text-[#E5A93C] text-xs font-black border border-[#D4AF37]/30 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <Award className="w-4 h-4 text-[#D4AF37]" />
            <span>Grille Officielle &bull; Sans Engagement &bull; Résiliable à tout moment</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Tarifs & Abonnements <span className="text-gold-gradient">Lougara B2B</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Connectez votre entreprise au réseau de confiance Afrique &bull; Europe.
            Choisissez votre formule mensuelle et activez votre visibilité dans le Catalogue certifié.
          </p>
        </div>

        {/* 3-TIER PRICING GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* TIER 1: STANDARD (99€/mo) */}
          <div className="glass-card rounded-3xl border border-slate-800 p-8 flex flex-col justify-between space-y-8 hover:border-[#D4AF37]/50 transition-all">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Formule Essentielle
                </span>
                <h3 className="text-2xl font-black text-white mt-1">Standard</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Pour démarrer vos échanges B2B contrôlés.
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">99 €</span>
                <span className="text-xs text-slate-400 font-bold">/ mois HT</span>
              </div>

              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-slate-300">
                <strong>Espace Publicitaire Catalogue :</strong> Option disponible à <strong>+49 € / mois</strong>
              </div>

              <ul className="space-y-3.5 text-xs text-slate-300">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Accès au réseau de fournisseurs & acheteurs vérifiés</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Jusqu&apos;à <strong>15 mises en relation</strong> directes / mois</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Messagerie d&apos;affaires & demandes de devis</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Audit administratif Kbis / RCCM</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                href="/devenir-fournisseur"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-all border border-slate-700"
              >
                <span>Choisir Standard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* TIER 2: PREMIUM (149€/mo) - HIGHLIGHTED WITH METALLIC GOLD FOIL BORDER */}
          <div className="glass-card rounded-3xl gold-glow-border p-8 flex flex-col justify-between space-y-8 relative transform md:-translate-y-3 shadow-[0_0_40px_rgba(212,175,55,0.3)] bg-gradient-to-b from-slate-900/90 via-[#0F172A] to-[#0B132B]">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-slate-950 px-4 py-1 rounded-full text-[11px] font-black tracking-widest uppercase shadow-md flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-slate-950" />
              <span>RECOMMANDÉ LOUGARA</span>
            </div>

            <div className="space-y-6 pt-2">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-[#E5A93C]">
                  Croissance & Volume Transfrontalier
                </span>
                <h3 className="text-3xl font-black text-white mt-1">Premium</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Développez un flux régulier de transactions directes.
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-gold-gradient">149 €</span>
                <span className="text-xs text-slate-400 font-bold">/ mois HT</span>
              </div>

              <div className="p-3 bg-amber-950/40 rounded-xl border border-amber-500/30 text-xs text-amber-300">
                <strong>Espace Publicitaire Catalogue :</strong> Option disponible à <strong>+49 € / mois</strong>
              </div>

              <ul className="space-y-3.5 text-xs text-slate-200">
                <li className="flex items-center gap-2.5 font-bold text-white">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Mises en relation illimitées</strong> chaque mois</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Matching prioritaire par corridor commercial</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Badge « Membre Premium Vérifié » sur votre profil</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Statistiques de consultation d&apos;acheteurs</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Audit d&apos;urgence sous 24h</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                href="/devenir-fournisseur"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] via-[#E5A93C] to-[#B8860B] hover:from-[#E5A93C] hover:to-[#D4AF37] transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)]"
              >
                <span>Souscrire au Formule Premium</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </Link>
            </div>
          </div>

          {/* TIER 3: VIP (250€/mo) */}
          <div className="glass-card rounded-3xl border border-purple-500/40 p-8 flex flex-col justify-between space-y-8 hover:border-purple-400 transition-all">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-purple-400">
                  Haute Visibilité & Accompagnement
                </span>
                <h3 className="text-2xl font-black text-white mt-1">VIP Enterprise</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Maximisez votre visibilité commerciale avec catalogue inclus.
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">250 €</span>
                <span className="text-xs text-slate-400 font-bold">/ mois HT</span>
              </div>

              <div className="p-3 bg-purple-950/60 rounded-xl border border-purple-500/40 text-xs text-purple-300 font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Espace Publicitaire Catalogue INCLUS (valeur 49 €)</span>
              </div>

              <ul className="space-y-3.5 text-xs text-slate-300">
                <li className="flex items-center gap-2.5 font-bold text-white">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span><strong>Présence Garantie au Catalogue Public</strong></span>
                </li>
                <li className="flex items-center gap-2.5 font-bold text-white">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Contacts & devis illimités</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Account Manager Lougara dédié</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Support prioritaire WhatsApp 7j/7</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                href="/devenir-fournisseur"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md"
              >
                <span>Choisir VIP Enterprise</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
