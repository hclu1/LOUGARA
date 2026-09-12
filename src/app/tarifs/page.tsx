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
} from 'lucide-react';
import { BadgeVerified } from '@/components/BadgeVerified';

export default function TarifsPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* En-tête Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold shadow-sm">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Grille Officielle &bull; Sans Engagement &bull; Résiliable à tout moment</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Tarifs & Abonnements <span className="text-emerald-600">Lougara B2B</span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Connectez votre entreprise au réseau de confiance Afrique &bull; Europe.
            Choisissez votre formule d&apos;abonnement mensuel et activez votre espace publicitaire pour exposer votre offre dans le Catalogue public.
          </p>
        </div>

        {/* Encadré Règle d'or : Espace Publicitaire Catalogue */}
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800/40 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                <Megaphone className="w-3.5 h-3.5 text-emerald-400" />
                Règle de Présence au Catalogue Public
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Seules les entreprises disposant d&apos;un Espace Publicitaire sont exposées au Catalogue
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Afin de garantir un catalogue de sourcing sérieux et qualifié, l&apos;exposition publique des produits et des appels d&apos;offres nécessite la souscription d&apos;un <strong>Espace Publicitaire Catalogue (+49 €/mois)</strong>, offert d&apos;office dans la formule <strong>VIP (250 €/mois)</strong>.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full md:w-auto flex-shrink-0">
              <Link
                href="/catalogue"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md transition-all"
              >
                <Eye className="w-4 h-4" />
                Consulter le Catalogue
              </Link>
            </div>
          </div>
        </div>

        {/* 3 Cartes de Tarification */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Formule 1 : STANDARD */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col justify-between hover:shadow-md transition-shadow relative">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Formule Essentielle
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">Standard</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Pour démarrer sereinement vos échanges B2B vérifiés.
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900">99 €</span>
                <span className="text-xs text-slate-500 font-semibold">/ mois HT</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                <strong>Espace Publicitaire Catalogue :</strong> Option disponible à <strong>+49 € / mois</strong>
              </div>

              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Accès au réseau de fournisseurs & acheteurs vérifiés</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Jusqu&apos;à <strong>15 mises en relation</strong> directes / mois</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Messagerie d&apos;affaires & demandes de devis</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Audit administratif de conformité Kbis / RCCM</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <span className="line-through">Espace publicitaire catalogue inclus</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Support standard par e-mail sous 48h</span>
                </li>
              </ul>
            </div>

            <div className="pt-8 space-y-2">
              <Link
                href="/devenir-fournisseur"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-sm"
              >
                Choisir Standard (Fournisseur)
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/entrepreneurs"
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all"
              >
                Choisir Standard (Entrepreneur)
              </Link>
            </div>
          </div>

          {/* Formule 2 : PREMIUM (Le plus populaire) */}
          <div className="bg-white rounded-3xl border-2 border-emerald-500 shadow-xl p-6 sm:p-8 flex flex-col justify-between relative transform md:-translate-y-2">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-3.5 py-1 rounded-full text-[11px] font-bold shadow-sm tracking-wide">
              RECOMMANDÉ PAR LOUGARA
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Croissance & Volume
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">Premium</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Idéal pour développer un flux régulier d&apos;affaires et de sourcing.
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900">150 €</span>
                <span className="text-xs text-slate-500 font-semibold">/ mois HT</span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800">
                <strong>Espace Publicitaire Catalogue :</strong> Option disponible à <strong>+49 € / mois</strong>
              </div>

              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-center gap-2 font-semibold text-slate-900">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span><strong>Mises en relation illimitées</strong> chaque mois</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Matching prioritaire et alertes de sourcing directes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Badge « Membre Premium Vérifié » sur votre profil</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Statistiques de consultations et d&apos;intérêt acheteurs</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Audit accéléré de conformité KYB sous 24h</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Support prioritaire sous 24h</span>
                </li>
              </ul>
            </div>

            <div className="pt-8 space-y-2">
              <Link
                href="/devenir-fournisseur"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md"
              >
                Choisir Premium (Fournisseur)
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/entrepreneurs"
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-emerald-50 hover:bg-emerald-100 transition-all border border-emerald-200"
              >
                Choisir Premium (Entrepreneur)
              </Link>
            </div>
          </div>

          {/* Formule 3 : VIP */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col justify-between hover:shadow-md transition-shadow relative">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
                  Haute Visibilité & Accompagnement
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">VIP</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Pour maximiser votre impact avec visibilité catalogue complète.
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900">250 €</span>
                <span className="text-xs text-slate-500 font-semibold">/ mois HT</span>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span>Espace Publicitaire Catalogue INCLUS (valeur 49 €/mois)</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-center gap-2 font-bold text-purple-950">
                  <Check className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span><strong>Présence Garantie au Catalogue Public</strong> (Sponsorisé)</span>
                </li>
                <li className="flex items-center gap-2 font-bold text-slate-900">
                  <Check className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span>Contacts et demandes de devis illimités</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span>Account Manager Lougara dédié</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span>Mise en relation directe avec les grands comptes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span>Mise en avant VIP dans les newsletters & corridors</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span>Support VIP dédié WhatsApp 7j/7</span>
                </li>
              </ul>
            </div>

            <div className="pt-8 space-y-2">
              <Link
                href="/devenir-fournisseur"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-sm"
              >
                Choisir VIP (Fournisseur)
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/entrepreneurs"
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 transition-all border border-purple-200"
              >
                Choisir VIP (Entrepreneur)
              </Link>
            </div>
          </div>
        </div>

        {/* Détail de l'Option Espace Publicitaire */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6 shadow-sm">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Option Visibilité Commerciale
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              Zoom sur l&apos;Espace Publicitaire Catalogue
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Pourquoi réserver un espace publicitaire pour votre structure ?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Pour les Fournisseurs & Grossistes</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Vos produits phares apparaissent directement dans le catalogue public filtrable (photos HD, MOQ, prix indicatif, fiches d&apos;origine). Les acheteurs et distributeurs peuvent vous envoyer une demande de devis en 1 clic.
              </p>
              <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <span>Tarif : +49 € / mois (inclus dans la formule VIP)</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Pour les Entrepreneurs & Acheteurs</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Vos besoins d&apos;approvisionnement et appels d&apos;offres sont mis en avant dans l&apos;onglet public du catalogue. Les fournisseurs et coopératives qualifiés peuvent immédiatement soumettre leurs propositions tarifaires.
              </p>
              <div className="text-xs font-semibold text-blue-700 flex items-center gap-1">
                <span>Tarif : +49 € / mois (inclus dans la formule VIP)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tableau Récapitulatif Comparatif */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">
              Tableau comparatif détaillé des services
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Fonctionnalité</th>
                  <th className="px-6 py-4 text-center">Standard (99 €)</th>
                  <th className="px-6 py-4 text-center text-emerald-700 bg-emerald-50/50">Premium (150 €)</th>
                  <th className="px-6 py-4 text-center text-purple-700">VIP (250 €)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr>
                  <td className="px-6 py-3.5 font-medium text-slate-900">Audit légal Kbis / RCCM & Badge Vérifié</td>
                  <td className="px-6 py-3.5 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="px-6 py-3.5 text-center bg-emerald-50/30"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="px-6 py-3.5 text-center"><Check className="w-4 h-4 text-purple-600 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5 font-medium text-slate-900">Mises en relation mensuelles</td>
                  <td className="px-6 py-3.5 text-center font-semibold">15 contacts</td>
                  <td className="px-6 py-3.5 text-center font-semibold text-emerald-700 bg-emerald-50/30">Illimitées</td>
                  <td className="px-6 py-3.5 text-center font-semibold text-purple-700">Illimitées</td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5 font-medium text-slate-900">Espace Publicitaire Catalogue</td>
                  <td className="px-6 py-3.5 text-center text-slate-400">Option +49 €/m</td>
                  <td className="px-6 py-3.5 text-center text-emerald-700 bg-emerald-50/30">Option +49 €/m</td>
                  <td className="px-6 py-3.5 text-center font-bold text-purple-700">Inclus d&apos;office (0 €)</td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5 font-medium text-slate-900">Matching prioritaire en temps réel</td>
                  <td className="px-6 py-3.5 text-center text-slate-300">&mdash;</td>
                  <td className="px-6 py-3.5 text-center bg-emerald-50/30"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="px-6 py-3.5 text-center"><Check className="w-4 h-4 text-purple-600 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5 font-medium text-slate-900">Account Manager dédié</td>
                  <td className="px-6 py-3.5 text-center text-slate-300">&mdash;</td>
                  <td className="px-6 py-3.5 text-center bg-emerald-50/30 text-slate-300">&mdash;</td>
                  <td className="px-6 py-3.5 text-center"><Check className="w-4 h-4 text-purple-600 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5 font-medium text-slate-900">Support client</td>
                  <td className="px-6 py-3.5 text-center">E-mail 48h</td>
                  <td className="px-6 py-3.5 text-center bg-emerald-50/30 font-semibold text-emerald-700">Prioritaire 24h</td>
                  <td className="px-6 py-3.5 text-center font-semibold text-purple-700">WhatsApp 7j/7</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section FAQ */}
        <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-600" />
            Questions fréquentes sur les abonnements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1.5">
              <h4 className="font-bold text-slate-900">Les abonnements sont-ils avec engagement ?</h4>
              <p>Non, toutes nos formules (Standard 99€, Premium 150€, VIP 250€) sont 100% sans engagement. Vous pouvez suspendre ou modifier votre offre d&apos;un simple clic chaque mois.</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1.5">
              <h4 className="font-bold text-slate-900">Puis-je souscrire l&apos;espace publicitaire plus tard ?</h4>
              <p>Oui, vous pouvez activer l&apos;option Espace Publicitaire (+49 €/mois) lors de votre inscription ou à n&apos;importe quel moment depuis votre tableau de bord.</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1.5">
              <h4 className="font-bold text-slate-900">Que se passe-t-il si je ne prends pas l&apos;option publicitaire ?</h4>
              <p>Vous avez un accès complet aux mises en relation, à la messagerie et aux appels d&apos;offres du réseau, mais votre fiche n&apos;est pas exposée dans le catalogue public ouvert aux visiteurs.</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1.5">
              <h4 className="font-bold text-slate-900">Comment régler mon abonnement ?</h4>
              <p>Les paiements sont acceptés par carte bancaire internationale (Visa, Mastercard), virement SEPA, et solutions de paiement mobile (Wave, Orange Money) pour les partenaires en Afrique.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
