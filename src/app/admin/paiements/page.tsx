'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Lock,
  Mail,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  ArrowLeft,
  Sliders,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { CurrencyCode, formatCurrencyAmount } from '@/locales/currencies';

export default function AdminPaiementsPage() {
  const { user, isModerator, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<{
    totalOrders: number;
    waitingTransfersCount: number;
    paidOrdersCount: number;
  }>({
    totalOrders: 0,
    waitingTransfersCount: 0,
    paidOrdersCount: 0,
  });
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!authLoading && isModerator) {
      fetchAdminPayments();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, isModerator]);

  const fetchAdminPayments = async () => {
    setLoading(true);
    try {
      const adminEmail = user?.email || '';
      const res = await fetch(
        `/api/admin/payments?adminEmail=${encodeURIComponent(adminEmail)}`
      );
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
        setStats(
          data.stats || {
            totalOrders: 0,
            waitingTransfersCount: 0,
            paidOrdersCount: 0,
          }
        );
        setEmailLogs(data.emailLogs || []);
      }
    } catch (err) {
      console.error('Erreur chargement paiements admin:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (reference: string) => {
    setActionLoadingId(reference);
    setFeedback(null);
    try {
      const res = await fetch(
        `/api/admin/payments/${encodeURIComponent(reference)}/mark-paid`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            adminEmail: user?.email,
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          text: data.message,
        });
        await fetchAdminPayments();
      } else {
        setFeedback({
          type: 'error',
          text: data.error || 'Erreur lors de la validation.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err.message || 'Erreur réseau.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRefundOrCancel = async (
    reference: string,
    action: 'REFUND' | 'CANCEL'
  ) => {
    setActionLoadingId(reference);
    setFeedback(null);
    try {
      const res = await fetch(
        `/api/admin/payments/${encodeURIComponent(reference)}/refund`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            adminEmail: user?.email,
            action,
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          text: data.message,
        });
        await fetchAdminPayments();
      } else {
        setFeedback({
          type: 'error',
          text: data.error || 'Opération impossible.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err.message || 'Erreur réseau.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0B132B] flex items-center justify-center text-slate-300">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D4AF37]" />
      </div>
    );
  }

  if (!isModerator) {
    return (
      <div className="min-h-screen bg-[#0B132B] p-8 flex items-center justify-center text-center">
        <div className="glass-card max-w-md p-8 rounded-2xl border border-red-500/30 text-white space-y-4">
          <Lock className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold">Accès Administration Protégé</h2>
          <p className="text-sm text-slate-400">
            Veuillez vous connecter avec un compte administrateur autorisé pour gérer les virements bancaires et les factures.
          </p>
          <Link
            href="/admin/login"
            className="inline-block py-2.5 px-5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black hover:bg-amber-400"
          >
            Se connecter à l&apos;Administration
          </Link>
        </div>
      </div>
    );
  }

  const filteredOrders =
    statusFilter === 'ALL'
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* EN-TÊTE */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#E5A93C] font-bold uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4 text-[#D4AF37]" />
              <span>Rapprochement Bancaire & Facturation Lougara</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Gestion des Paiements & Virements RIB
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Vérifiez les virements reçus sur le compte Qonto (réf. <code className="text-amber-300">LOU-AAAA-XXXX</code>) et cliquez sur <strong>« Marquer comme payé »</strong> pour activer l&apos;accès du client et envoyer sa facture PDF.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:bg-slate-800"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Configuration Stripe</span>
            </Link>
            <Link
              href="/admin/verifications"
              className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:bg-slate-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Vérifications KYB</span>
            </Link>
          </div>
        </div>

        {/* MESSAGE DE CONFIRMATION */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between ${
              feedback.type === 'success'
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                : 'bg-red-950/50 border-red-500/40 text-red-300'
            }`}
          >
            <span>{feedback.text}</span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-white ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* CARTES KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-amber-300 font-bold block">
                Virements RIB en attente
              </span>
              <span className="text-3xl font-black text-white mt-1 block">
                {stats.waitingTransfersCount}
              </span>
            </div>
            <Clock className="w-8 h-8 text-amber-400" />
          </div>

          <div className="glass-card rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-300 font-bold block">
                Commandes Payées & Facturées
              </span>
              <span className="text-3xl font-black text-white mt-1 block">
                {stats.paidOrdersCount}
              </span>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>

          <div className="glass-card rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-bold block">
                Total Transactions
              </span>
              <span className="text-3xl font-black text-white mt-1 block">
                {stats.totalOrders}
              </span>
            </div>
            <CreditCard className="w-8 h-8 text-indigo-400" />
          </div>
        </div>

        {/* BARRE DE FILTRES */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { code: 'ALL', label: 'Toutes les commandes' },
              { code: 'WAITING_TRANSFER', label: '⏳ Virements en attente' },
              { code: 'PAID', label: '✓ Payées & Facturées' },
              { code: 'PENDING', label: 'En cours' },
              { code: 'REFUNDED', label: 'Remboursées' },
            ].map((tab) => (
              <button
                key={tab.code}
                type="button"
                onClick={() => setStatusFilter(tab.code)}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold border transition-all ${
                  statusFilter === tab.code
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={fetchAdminPayments}
            className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualiser</span>
          </button>
        </div>

        {/* TABLEAU DES COMMANDES & VIREMENTS */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="glass-card rounded-2xl border border-slate-800 bg-slate-900/40 p-10 text-center text-xs text-slate-400">
              Aucune commande trouvée pour ce filtre.
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isPaid = order.status === 'PAID';
              const isWaiting = order.status === 'WAITING_TRANSFER';
              const isProcessing = actionLoadingId === order.reference;

              return (
                <div
                  key={order.id || order.reference}
                  className={`glass-card rounded-2xl border p-5 space-y-4 transition-all ${
                    isWaiting
                      ? 'border-amber-500/50 bg-amber-950/15'
                      : isPaid
                        ? 'border-emerald-500/30 bg-slate-900/70'
                        : 'border-slate-800 bg-slate-900/50'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-black text-base text-amber-400 bg-slate-950 px-3 py-1 rounded-lg border border-amber-500/30">
                          {order.reference}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                            isPaid
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : isWaiting
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {order.status}
                        </span>
                        <span className="text-xs font-bold text-slate-300 bg-slate-950 px-2.5 py-0.5 rounded-md border border-slate-800">
                          {order.provider}
                        </span>
                        {order.invoiceNumber && (
                          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-500/30">
                            Facture {order.invoiceNumber}
                          </span>
                        )}
                      </div>

                      <div className="text-sm font-bold text-white">
                        {order.planName}{' '}
                        <span className="text-xs font-normal text-slate-400">
                          ({order.billingCycle})
                        </span>
                      </div>

                      <div className="text-xs text-slate-300">
                        Client : <strong>{order.customerName || 'Client B2B'}</strong> (
                        <span className="text-amber-300">{order.customerEmail}</span>)
                        {order.companyName && ` • Société : ${order.companyName}`} • Pays :{' '}
                        {order.countryCode}
                      </div>

                      <div className="text-[11px] text-slate-500">
                        Créée le{' '}
                        {new Date(order.createdAt).toLocaleString('fr-FR')}
                        {order.paidAt &&
                          ` • Validée le ${new Date(order.paidAt).toLocaleString('fr-FR')}`}
                        {order.validatedByEmail &&
                          ` par ${order.validatedByEmail}`}
                      </div>
                    </div>

                    {/* MONTANT & BOUTONS D'ACTION ADMIN */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-right mr-2">
                        <span className="text-xl font-black text-white block">
                          {formatCurrencyAmount(
                            order.amount,
                            order.currency as CurrencyCode
                          )}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Montant serveur vérifié
                        </span>
                      </div>

                      {!isPaid && order.status !== 'REFUNDED' && order.status !== 'CANCELLED' && (
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleMarkAsPaid(order.reference)}
                          className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer disabled:opacity-50"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>
                            {isProcessing ? 'Activation...' : 'Marquer comme payé'}
                          </span>
                        </button>
                      )}

                      {isPaid && (
                        <>
                          <a
                            href={`/api/payments/invoice/${encodeURIComponent(
                              order.reference
                            )}`}
                            className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs border border-emerald-500/30"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Facture PDF</span>
                          </a>

                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleRefundOrCancel(order.reference, 'REFUND')}
                            className="inline-flex items-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-red-950/50 text-red-300 font-bold text-xs border border-red-500/30"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Rembourser</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* JOURNAL DES EMAILS TRANSACTIONNELS ENVOYÉS */}
        {emailLogs.length > 0 && (
          <div className="glass-card rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400" />
              <span>Journal des Emails Transactionnels Envoyés (Instructions RIB & Factures PDF)</span>
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {emailLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <span className="font-mono text-amber-400 font-bold mr-2">
                      [{log.orderReference}]
                    </span>
                    <strong className="text-white">{log.subject}</strong>
                    <span className="text-slate-400 ml-2">→ {log.to}</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-semibold">
                    {new Date(log.createdAt).toLocaleTimeString('fr-FR')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
