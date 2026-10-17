'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  Download,
  FileText,
  ArrowRight,
  Building2,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { formatCurrencyAmount, CurrencyCode } from '@/locales/currencies';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const ref =
    searchParams.get('ref') ||
    searchParams.get('reference') ||
    searchParams.get('payment_intent') ||
    '';

  const [loading, setLoading] = useState<boolean>(true);
  const [order, setOrder] = useState<any>(null);
  const [rib, setRib] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchOrderStatus = async () => {
    if (!ref) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/payments/status?ref=${encodeURIComponent(ref)}`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
        setRib(data.bankTransferDetails || null);
      }
    } catch (err) {
      console.error('Erreur vérification statut:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderStatus();
  }, [ref]);

  const copyValue = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B132B] flex items-center justify-center text-slate-300">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D4AF37]" />
      </div>
    );
  }

  const isPaid = order?.status === 'PAID';
  const isWaitingTransfer = order?.status === 'WAITING_TRANSFER';

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="glass-card rounded-3xl border border-slate-800 bg-slate-900/70 p-8 space-y-6 text-center shadow-2xl">
          {isPaid ? (
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
              <Clock className="w-10 h-10" />
            </div>
          )}

          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#E5A93C]">
              {isPaid
                ? 'Confirmation Serveur Validée'
                : isWaitingTransfer
                  ? 'Commande enregistrée — En attente de virement'
                  : 'Vérification serveur en cours'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {isPaid
                ? 'Votre paiement est confirmé et votre accès est actif !'
                : isWaitingTransfer
                  ? 'Instructions de virement bancaire (RIB Lougara)'
                  : 'Votre transaction a bien été enregistrée'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
              {isPaid
                ? `Merci pour votre confiance. Votre facture officielle ${order.invoiceNumber || ''} a été générée et envoyée à ${order.customerEmail}.`
                : isWaitingTransfer
                  ? `Votre accès sera activé dès réception et validation de votre virement portant la référence obligatoire ${order?.reference}.`
                  : 'Par mesure de sécurité, votre accès est activé uniquement après confirmation serveur (webhook ou validation administrative).'}
            </p>
          </div>

          {order && (
            <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 text-left space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Référence unique :</span>
                <span className="font-mono font-black text-amber-400 text-sm">
                  {order.reference}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Offre souscrite :</span>
                <strong className="text-white">{order.planName}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Montant :</span>
                <strong className="text-emerald-400 text-sm">
                  {formatCurrencyAmount(order.amount, order.currency as CurrencyCode)}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Statut actuel :</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    isPaid
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {order.status === 'PAID'
                    ? 'PAYÉ & ACTIVÉ'
                    : order.status === 'WAITING_TRANSFER'
                      ? 'EN ATTENTE DE VIREMENT'
                      : order.status}
                </span>
              </div>
            </div>
          )}

          {/* AFFICHAGE DU RIB SI VIREMENT EN ATTENTE */}
          {rib && !isPaid && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-[#D4AF37]/50 text-left space-y-3 text-xs">
              <div className="flex items-center gap-2 text-amber-400 font-black">
                <Building2 className="w-4 h-4" />
                <span>Coordonnées du compte destinataire (RIB Lougara) :</span>
              </div>
              <p>
                <span className="text-slate-400">Titulaire :</span>{' '}
                <strong className="text-white">{rib.holderName}</strong>
              </p>
              <div className="flex items-center justify-between gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px]">IBAN :</span>
                  <strong className="font-mono text-amber-300">{rib.iban}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => copyValue(rib.iban.replace(/\s+/g, ''), 'iban')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 font-bold flex items-center gap-1"
                >
                  {copied === 'iban' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copier</span>
                </button>
              </div>
              <p>
                <span className="text-slate-400">BIC / SWIFT :</span>{' '}
                <strong className="font-mono text-white">{rib.bic}</strong>{' '}
                <span className="text-slate-500">(SWIFT banque partenaire : {rib.partnerSwift})</span>
              </p>
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-amber-200 block text-[10px] uppercase font-bold">
                    Libellé obligatoire du virement :
                  </span>
                  <strong className="font-mono text-white text-sm">{rib.reference}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => copyValue(rib.reference, 'ref')}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-black"
                >
                  {copied === 'ref' ? 'Copié !' : 'Copier'}
                </button>
              </div>
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {isPaid && order && (
              <a
                href={`/api/payments/invoice/${encodeURIComponent(order.reference)}`}
                className="inline-flex items-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-slate-950 font-black text-xs shadow-lg hover:opacity-95 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger ma facture PDF ({order.invoiceNumber})</span>
              </a>
            )}

            {!isPaid && (
              <button
                type="button"
                onClick={fetchOrderStatus}
                className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Actualiser le statut</span>
              </button>
            )}

            <Link
              href="/paiement/historique"
              className="inline-flex items-center gap-2 py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Historique de mes paiements</span>
            </Link>

            <Link
              href="/catalogue"
              className="inline-flex items-center gap-2 py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Accéder au Catalogue B2B</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaiementSuccesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B132B] flex items-center justify-center text-slate-300">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D4AF37]" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
