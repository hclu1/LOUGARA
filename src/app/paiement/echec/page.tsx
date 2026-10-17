'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CreditCard,
  HelpCircle,
} from 'lucide-react';

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref') || '';
  const reason = searchParams.get('reason') || '';

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="glass-card rounded-3xl border border-red-500/30 bg-slate-900/70 p-8 space-y-6 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/40 flex items-center justify-center mx-auto text-red-400">
            <AlertTriangle className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-red-400">
              Paiement Interrompu ou Refusé
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Votre transaction n&apos;a pas été finalisée
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              Aucun montant n&apos;a été débité sur votre compte. Cela peut provenir d&apos;une annulation volontaire, d&apos;un plafond bancaire temporaire ou d&apos;une authentification 3D Secure expirée.
            </p>
          </div>

          {(ref || reason) && (
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs text-slate-300 space-y-1">
              {ref && (
                <p>
                  Référence de commande :{' '}
                  <strong className="font-mono text-amber-400">{ref}</strong>
                </p>
              )}
              {reason && <p className="text-red-300">Détail : {reason}</p>}
            </div>
          )}

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left text-xs text-amber-200 space-y-1.5">
            <p className="font-bold text-amber-300 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 shrink-0" />
              <span>Astuce B2B : Réglez par Virement Bancaire (RIB Lougara)</span>
            </p>
            <p className="text-slate-300">
              Si votre carte d&apos;entreprise bloque les paiements internationaux ou possède un plafond strict, vous pouvez choisir l&apos;option <strong>Virement Bancaire (RIB IBAN)</strong> sur la page de paiement pour régler directement depuis votre banque professionnelle.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/paiement"
              className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-slate-950 font-black text-xs shadow-lg hover:opacity-95 transition-all"
            >
              <CreditCard className="w-4 h-4" />
              <span>Réessayer ou choisir le Virement RIB</span>
            </Link>

            <Link
              href="/tarifs"
              className="inline-flex items-center gap-2 py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour aux tarifs</span>
            </Link>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Besoin d&apos;assistance ? Contactez-nous sur contact@lougara.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaiementEchecPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B132B] flex items-center justify-center text-slate-300">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D4AF37]" />
        </div>
      }
    >
      <PaymentFailedContent />
    </Suspense>
  );
}
