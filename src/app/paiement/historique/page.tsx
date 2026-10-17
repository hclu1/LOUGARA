'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Download,
  CreditCard,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  Search,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { CurrencyCode, formatCurrencyAmount } from '@/locales/currencies';

export default function PaiementHistoriquePage() {
  const { user } = useAuth();
  const [emailFilter, setEmailFilter] = useState<string>(user?.email || '');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [portalLoading, setPortalLoading] = useState<boolean>(false);
  const [portalMessage, setPortalMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email && !emailFilter) {
      setEmailFilter(user.email);
      fetchHistory(user.email);
    } else {
      fetchHistory(emailFilter);
    }
  }, [user]);

  const fetchHistory = async (targetEmail?: string) => {
    setLoading(true);
    try {
      const query = targetEmail ? `?email=${encodeURIComponent(targetEmail)}` : '';
      const res = await fetch(`/api/payments/history${query}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Erreur chargement historique:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStripePortal = async () => {
    setPortalLoading(true);
    setPortalMessage(null);
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: emailFilter || user?.email,
        }),
      });
      const data = await res.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        setPortalMessage(
          data.message ||
            'Veuillez renseigner votre email client ou configurer votre clé Stripe pour ouvrir le portail de gestion.'
        );
      }
    } catch (err: any) {
      setPortalMessage(err.message || 'Erreur ouverture du portail client Stripe.');
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* EN-TÊTE */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Link
              href="/tarifs"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retour aux offres et tarifs</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Historique des Paiements & Factures PDF
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Consultez vos commandes, suivez vos virements bancaires et téléchargez vos factures officielles acquittées.
            </p>
          </div>

          {/* BOUTON PORTAIL CLIENT STRIPE */}
          <button
            type="button"
            onClick={handleOpenStripePortal}
            disabled={portalLoading}
            className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-slate-950 font-black text-xs shadow-md hover:opacity-95 transition-all cursor-pointer shrink-0"
          >
            <CreditCard className="w-4 h-4" />
            <span>
              {portalLoading
                ? 'Ouverture...'
                : 'Portail Client Stripe (Abonnement & Cartes)'}
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {portalMessage && (
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{portalMessage}</span>
          </div>
        )}

        {/* FILTRE PAR EMAIL CLIENT */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchHistory(emailFilter);
          }}
          className="glass-card rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              placeholder="Rechercher par email professionnel (ex: contact@societe.com)..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700 transition-all"
          >
            Filtrer mes commandes
          </button>
          <button
            type="button"
            onClick={() => fetchHistory(emailFilter)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            title="Actualiser"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </form>

        {/* LISTE DES PAIEMENTS */}
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]" />
          </div>
        ) : orders.length === 0 ? (
          <div className="glass-card rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-4">
            <FileText className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-white">Aucun paiement enregistré</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Vous n&apos;avez pas encore de commande associée à cette adresse. Souscrivez une formule ou un pack de crédits pour démarrer.
            </p>
            <Link
              href="/paiement"
              className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs"
            >
              <span>Accéder à la page de paiement</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => {
              const isPaid = ord.status === 'PAID';
              const isWaiting = ord.status === 'WAITING_TRANSFER';

              return (
                <div
                  key={ord.id || ord.reference}
                  className="glass-card rounded-2xl border border-slate-800 bg-slate-900/70 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-700 transition-all"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-black text-sm text-amber-400">
                        {ord.reference}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                          isPaid
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : isWaiting
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {isPaid
                          ? '✓ Payé & Actif'
                          : isWaiting
                            ? '⏳ En attente de virement'
                            : ord.status}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        {ord.provider === 'BANK_TRANSFER' ? (
                          <Building2 className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                        )}
                        <span>{ord.provider}</span>
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white">{ord.planName}</h3>
                    <p className="text-xs text-slate-400">
                      Client : {ord.customerEmail} • Date :{' '}
                      {new Date(ord.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {ord.invoiceNumber && (
                        <>
                          {' '}
                          • Facture :{' '}
                          <strong className="text-emerald-400 font-mono">
                            {ord.invoiceNumber}
                          </strong>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 self-stretch md:self-center justify-between md:justify-end">
                    <div className="text-right">
                      <span className="text-lg font-black text-white block">
                        {formatCurrencyAmount(ord.amount, ord.currency as CurrencyCode)}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase">
                        {ord.billingCycle === 'ANNUAL'
                          ? 'Annuel'
                          : ord.billingCycle === 'MONTHLY'
                            ? 'Mensuel'
                            : 'Unique'}
                      </span>
                    </div>

                    {isPaid ? (
                      <a
                        href={`/api/payments/invoice/${encodeURIComponent(ord.reference)}`}
                        className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Facture PDF</span>
                      </a>
                    ) : (
                      <Link
                        href={`/paiement/succes?ref=${encodeURIComponent(ord.reference)}`}
                        className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs transition-all"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Voir instructions RIB</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
