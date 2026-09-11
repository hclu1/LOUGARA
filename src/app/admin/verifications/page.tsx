'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  UserCheck,
  Lock,
  Search,
  ExternalLink,
} from 'lucide-react';
import { BadgeVerified } from '@/components/BadgeVerified';

interface PendingVerification {
  id: string;
  companyName: string;
  country: string;
  city: string;
  sector: string;
  registrationNumber: string;
  submittedAt: string;
  documents: {
    type: string;
    name: string;
    size: string;
  }[];
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason?: string;
}

const INITIAL_QUEUE: PendingVerification[] = [
  {
    id: 'comp-101',
    companyName: 'Sahel Agro Industries SA',
    country: 'Sénégal',
    city: 'Thiès',
    sector: 'Agroalimentaire & Épices',
    registrationNumber: 'SN-THS-2022-B-991',
    submittedAt: '10 Septembre 2026',
    documents: [
      { type: 'RCCM / Kbis', name: 'Extrait_RCCM_SahelAgro_2026.pdf', size: '1.2 Mo' },
      { type: 'Identité Gérant', name: 'Passeport_DG_Ousmane_Fall.pdf', size: '2.4 Mo' },
      { type: 'Attestation Fiscale', name: 'Quitus_Fiscal_NINEA_2026.pdf', size: '850 Ko' },
    ],
    status: 'PENDING',
  },
  {
    id: 'comp-102',
    companyName: 'Atelier Wax & Confection Abidjan',
    country: 'Côte d\'Ivoire',
    city: 'Abidjan',
    sector: 'Textile & Mode',
    registrationNumber: 'CI-ABJ-2023-B-4501',
    submittedAt: '11 Septembre 2026',
    documents: [
      { type: 'RCCM / Kbis', name: 'Registre_Commerce_CI_2026.pdf', size: '1.8 Mo' },
      { type: 'Identité Gérante', name: 'CNI_Kouassi_Abla.pdf', size: '1.1 Mo' },
    ],
    status: 'PENDING',
  },
  {
    id: 'comp-103',
    companyName: 'Africa Bio Extracts SARL',
    country: 'Sénégal',
    city: 'Dakar',
    sector: 'Cosmétique & Soins',
    registrationNumber: 'SN-DKR-2021-B-1284',
    submittedAt: '08 Septembre 2026',
    documents: [
      { type: 'RCCM / Kbis', name: 'RCCM_AfricaBio_Valide.pdf', size: '920 Ko' },
      { type: 'Identité Gérant', name: 'CNI_Amina_Diop.pdf', size: '1.4 Mo' },
    ],
    status: 'VERIFIED',
  },
];

export default function AdminVerificationsPage() {
  const [queue, setQueue] = useState<PendingVerification[]>(INITIAL_QUEUE);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleApprove = (id: string, name: string) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'VERIFIED' } : item
      )
    );
    setActionNotice(`Dossier validé pour "${name}". Le badge officiel a été activé.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleReject = (id: string, name: string) => {
    const reason = prompt('Indiquez le motif du refus (ex: RCCM expiré, document illisible) :');
    if (!reason) return;

    setQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'REJECTED', rejectionReason: reason } : item
      )
    );
    setActionNotice(`Dossier refusé pour "${name}". Motif notifié au fournisseur.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const filteredItems = queue.filter((item) => {
    if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.companyName.toLowerCase().includes(q) ||
        item.country.toLowerCase().includes(q) ||
        item.registrationNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = queue.filter((q) => q.status === 'PENDING').length;
  const verifiedCount = queue.filter((q) => q.status === 'VERIFIED').length;
  const rejectedCount = queue.filter((q) => q.status === 'REJECTED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Bandeau d'Accès Réservé Interne */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl bg-slate-900 text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold">Console d&apos;Audit Interne KYB</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-300">
                Accès Restreint
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Espace réservé à l&apos;équipe Lougara pour le contrôle légal des fournisseurs avant publication.
            </p>
          </div>
        </div>

        <Link
          href="/devenir-fournisseur"
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 self-start sm:self-auto"
        >
          Voir le formulaire public <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Statistiques d'audit */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Dossiers en attente</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Fournisseurs Validés</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{verifiedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Dossiers Rejetés</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{rejectedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filtres & Recherche de la file */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filterStatus === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tous ({queue.length})
          </button>
          <button
            onClick={() => setFilterStatus('PENDING')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filterStatus === 'PENDING'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            À traiter ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus('VERIFIED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filterStatus === 'VERIFIED'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Vérifiés ({verifiedCount})
          </button>
          <button
            onClick={() => setFilterStatus('REJECTED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filterStatus === 'REJECTED'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            Rejetés ({rejectedCount})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filtrer par nom, pays ou n° légal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Liste des Dossiers */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
            Aucun dossier ne correspond à ce filtre.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{item.companyName}</h3>
                    {item.status === 'VERIFIED' && <BadgeVerified />}
                    {item.status === 'PENDING' && (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> En attente de revue
                      </span>
                    )}
                    {item.status === 'REJECTED' && (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        Dossier Rejeté
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {item.city}, {item.country} &bull; Secteur : <span className="font-semibold text-slate-700">{item.sector}</span> &bull; N° Immatriculation : <code className="bg-slate-100 px-1 py-0.5 rounded">{item.registrationNumber}</code>
                  </p>
                </div>
                <span className="text-xs text-slate-400">Soumis le {item.submittedAt}</span>
              </div>

              {/* Pièces justificatives */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Documents légaux téléversés (Bucket privé sécurisé) :
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {item.documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <div className="truncate">
                          <span className="block font-semibold text-slate-800 truncate">{doc.type}</span>
                          <span className="block text-[10px] text-slate-500 truncate">{doc.name}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 ml-2">{doc.size}</span>
                    </div>
                  ))}
                </div>
              </div>

              {item.rejectionReason && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                  <span className="font-bold">Motif de rejet :</span> {item.rejectionReason}
                </div>
              )}

              {/* Actions de modération */}
              {item.status === 'PENDING' && (
                <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    onClick={() => handleReject(item.id, item.companyName)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
                  >
                    Rejeter avec motif
                  </button>
                  <button
                    onClick={() => handleApprove(item.id, item.companyName)}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Valider le dossier & Activer le Badge
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
