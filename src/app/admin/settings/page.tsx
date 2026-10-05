'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Save,
  FileText,
  Lock,
  ArrowLeft,
  CreditCard,
  Sliders,
  DollarSign,
  Package,
} from 'lucide-react';

interface SettingsData {
  isStripeEnabled: boolean;
  allowFreeCatalogLimit: number;
  currency: string;
  contactEmail: string;
}

interface StripeStatus {
  hasStripeSecret: boolean;
  hasStripePublic: boolean;
  hasStripeWebhook: boolean;
  isFullyConfigured: boolean;
}

interface PlanData {
  id: string;
  code: string;
  name: string;
  priceMonthly: number;
  stripePriceId?: string;
  maxProducts: number;
  maxContactsPerMonth: number;
}

export default function AdminSettingsPage() {
  const { isSuperAdmin, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [settings, setSettings] = useState<SettingsData>({
    isStripeEnabled: false,
    allowFreeCatalogLimit: 5,
    currency: 'EUR',
    contactEmail: 'contact@lougara.com',
  });

  const [stripeStatus, setStripeStatus] = useState<StripeStatus>({
    hasStripeSecret: false,
    hasStripePublic: false,
    hasStripeWebhook: false,
    isFullyConfigured: false,
  });

  const [plans, setPlans] = useState<PlanData[]>([]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        setStripeStatus(data.stripeKeyStatus);
        setPlans(data.plans || []);
      }
    } catch (err) {
      console.error('Erreur chargement paramètres:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isStripeEnabled: settings.isStripeEnabled,
          allowFreeCatalogLimit: Number(settings.allowFreeCatalogLimit),
          plans,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Paramètres mis à jour avec succès.' });
        setSettings(data.settings);
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la sauvegarde.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erreur réseau.' });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0B132B] flex items-center justify-center text-slate-300">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-[#0B132B] p-8 flex items-center justify-center text-center">
        <div className="glass-card max-w-md p-8 rounded-2xl border border-red-500/30 text-white space-y-4">
          <Lock className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold">Accès réservé au Super Admin</h2>
          <p className="text-sm text-slate-400">
            Cette page est strictement réservée à l'administration principale du système Lougara.
          </p>
          <Link href="/moderation" className="inline-block py-2 px-4 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700">
            Retour à la modération
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#E5A93C] font-bold uppercase tracking-wider mb-1">
              <Sliders className="w-4 h-4 text-[#D4AF37]" />
              <span>Administration Système Lougara</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Configuration Monétisation & Stripe
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Gérez le basculement entre la phase gratuite et l'activation des abonnements Stripe.
            </p>
          </div>

          <Link
            href="/admin/verifications"
            className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:bg-slate-800 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>File des vérifications</span>
          </Link>
        </div>

        {/* FEEDBACK MESSAGES */}
        {message && (
          <div
            className={`p-4 rounded-xl border text-xs font-bold ${
              message.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-red-950/40 border-red-500/40 text-red-300'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* SECTION 1: INTERRUPTEUR DE MONÉTISATION */}
          <div className="glass-card rounded-2xl border border-slate-800 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#E5A93C]">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Activation Globale Stripe</h3>
                  <p className="text-xs text-slate-400">
                    Cochez cette case lorsque vous avez terminé la création de votre compte Stripe.
                  </p>
                </div>
              </div>

              {/* TOGGLE SWITCH */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.isStripeEnabled}
                  onChange={(e) => setSettings({ ...settings, isStripeEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {/* STATUS ALERT */}
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
                settings.isStripeEnabled
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                  : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
              }`}
            >
              {settings.isStripeEnabled ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Stripe est ACTIF :</strong> Les boutons de souscription sur la page Tarifs redirigeront les utilisateurs vers Stripe Checkout pour le paiement des abonnements.
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Mode Gratuité / En attente de Stripe :</strong> Stripe est désactivé. La plateforme fonctionne en mode de lancement. La limite gratuite par défaut s'applique aux fournisseurs.
                  </div>
                </>
              )}
            </div>

            {/* STRIPE KEYS VERIFICATION CHECKLIST */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">État des variables d'environnement Stripe :</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">STRIPE_SECRET_KEY</span>
                  <span className={stripeStatus.hasStripeSecret ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {stripeStatus.hasStripeSecret ? 'Présente' : 'Manquante'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</span>
                  <span className={stripeStatus.hasStripePublic ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {stripeStatus.hasStripePublic ? 'Présente' : 'Manquante'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">STRIPE_WEBHOOK_SECRET</span>
                  <span className={stripeStatus.hasStripeWebhook ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {stripeStatus.hasStripeWebhook ? 'Présent' : 'Manquant'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: REGLES DE QUOTA GRATUIT */}
          <div className="glass-card rounded-2xl border border-slate-800 p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-400" />
              <span>Quota Gratuit du Catalogue</span>
            </h3>
            <p className="text-xs text-slate-400">
              Définissez le nombre maximal de produits autorisés gratuitement par fournisseur avant obligation de souscrire un forfait payant.
            </p>

            <div className="max-w-xs space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Limite de produits gratuits :</label>
              <input
                type="number"
                value={settings.allowFreeCatalogLimit}
                onChange={(e) => setSettings({ ...settings, allowFreeCatalogLimit: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                min={1}
                max={50}
              />
            </div>
          </div>

          {/* SECTION 3: CONFIGURATION DES TARIFS ET PRICE IDs STRIPE */}
          <div className="glass-card rounded-2xl border border-slate-800 p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <span>Grille des Forfaits & Identifiants Stripe Price ID</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Collez les `price_...` créés sur votre tableau de bord Stripe pour chaque forfait.
              </p>
            </div>

            <div className="space-y-4">
              {plans.map((plan, idx) => (
                <div key={plan.id || idx} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-amber-400">{plan.name} ({plan.code})</span>
                    <span className="text-xs text-slate-400 font-bold">{plan.priceMonthly} € / mois</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Prix mensuel (€) :</label>
                      <input
                        type="number"
                        value={plan.priceMonthly}
                        onChange={(e) => {
                          const updated = [...plans];
                          updated[idx].priceMonthly = Number(e.target.value);
                          setPlans(updated);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Quota Produits (-1 = illimité) :</label>
                      <input
                        type="number"
                        value={plan.maxProducts}
                        onChange={(e) => {
                          const updated = [...plans];
                          updated[idx].maxProducts = Number(e.target.value);
                          setPlans(updated);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Stripe Price ID (ex: price_1P...) :</label>
                      <input
                        type="text"
                        placeholder="price_1P..."
                        value={plan.stripePriceId || ''}
                        onChange={(e) => {
                          const updated = [...plans];
                          updated[idx].stripePriceId = e.target.value;
                          setPlans(updated);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-amber-300 font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="flex items-center justify-between pt-4">
            <Link
              href="/docs/PROCEDURE_ACTIVATION_STRIPE.md"
              target="_blank"
              className="inline-flex items-center gap-2 text-xs text-amber-400 hover:text-amber-300 underline"
            >
              <FileText className="w-4 h-4" />
              <span>Consulter le guide de finalisation dans les Docs</span>
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 py-3 px-6 rounded-xl font-bold text-xs bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-slate-950 hover:from-[#E5A93C] hover:to-[#D4AF37] shadow-lg transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-slate-950" />
              <span>{saving ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
