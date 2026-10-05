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
} from 'lucide-react';

export default function TarifsPage() {
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
      .catch((err) => console.warn('Erreur verification statut Stripe:', err));
  }, []);

  const handleSelectPlan = async (planCode: string, planName: string) => {
    if (!isStripeEnabled) {
      setSelectedPlanName(planName);
      setModalOpen(true);
      return;
    }

    setLoadingCheckout(planCode);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planCode }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.pendingActivation) {
        setSelectedPlanName(planName);
        setModalOpen(true);
      } else {
        alert(data.message || 'Erreur lors de la préparation du paiement.');
      }
    } catch (err) {
      alert('Erreur réseau lors de la redirection vers le paiement.');
    } finally {
      setLoadingCheckout(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 space-y-12 relative">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* LAUNCH BANNER IF STRIPE IS NOT ACTIVE YET */}
        {!isStripeEnabled && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm flex items-center justify-between gap-4 max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                <strong>Offre de Lancement Gratuit :</strong> Profitez de l&apos;accès gratuit au catalogue et enregistrez vos premiers produits sans frais d&apos;abonnement.
              </span>
            </div>
            <Link
              href="/devenir-fournisseur"
              className="shrink-0 py-1.5 px-3 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 text-xs transition-all"
            >
              Publier un catalogue
            </Link>
          </div>
        )}

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
                <strong>Catalogue gratuit :</strong> Inclus jusqu&apos;à 15 produits
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
              <button
                onClick={() => handleSelectPlan('STANDARD', 'Formule Standard')}
                disabled={loadingCheckout === 'STANDARD'}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-all border border-slate-700 disabled:opacity-50"
              >
                <span>{loadingCheckout === 'STANDARD' ? 'Chargement...' : 'Choisir Standard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* TIER 2: PREMIUM (149€/mo) */}
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
                <strong>Catalogue étendu :</strong> Inclus jusqu&apos;à 50 produits
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
              <button
                onClick={() => handleSelectPlan('PREMIUM', 'Formule Premium')}
                disabled={loadingCheckout === 'PREMIUM'}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] via-[#E5A93C] to-[#B8860B] hover:from-[#E5A93C] hover:to-[#D4AF37] transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] disabled:opacity-50"
              >
                <span>{loadingCheckout === 'PREMIUM' ? 'Chargement...' : 'Souscrire au Formule Premium'}</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
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
                <span>Catalogue Produits & Contacts ILLIMITÉS</span>
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
              <button
                onClick={() => handleSelectPlan('VIP', 'VIP Enterprise')}
                disabled={loadingCheckout === 'VIP'}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md disabled:opacity-50"
              >
                <span>{loadingCheckout === 'VIP' ? 'Chargement...' : 'Choisir VIP Enterprise'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* INFORMATIONAL MODAL IF STRIPE NOT YET ACTIVE */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="glass-card max-w-lg w-full p-6 rounded-2xl border border-amber-500/40 space-y-5 bg-[#0B132B] relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-amber-400">
              <CreditCard className="w-8 h-8" />
              <div>
                <h3 className="text-lg font-bold text-white">Plateforme actuellement en Lancement Gratuit</h3>
                <p className="text-xs text-amber-300/90">{selectedPlanName}</p>
              </div>
            </div>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              La souscription automatique par carte bancaire pour la formule <strong>{selectedPlanName}</strong> est actuellement en cours d&apos;activation.
              <br /><br />
              Vous pouvez dès aujourd&apos;hui créer votre compte fournisseur et enregistrer vos produits gratuitement.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/devenir-fournisseur"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all"
              >
                <span>Publier mon entreprise gratuitement</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={() => setModalOpen(false)}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
