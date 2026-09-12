'use client';

import React, { useState, useEffect } from 'react';
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
  Package,
  Image as ImageIcon,
  Users,
  Factory,
  Eye,
  TrendingUp,
  RefreshCw,
  Activity,
  PlusCircle,
} from 'lucide-react';
import { BadgeVerified } from '@/components/BadgeVerified';
import { VisitStats, VisitorType } from '@/features/analytics/types';

interface PendingVerification {
  id: string;
  companyName: string;
  country: string;
  city: string;
  sector: string;
  registrationNumber: string;
  submittedAt: string;
  productSample?: {
    title: string;
    imageUrl: string;
    moq: number;
    unit: string;
    price: string;
  };
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
    productSample: {
      title: 'Fèves de Cacao Grand Cru Séchées au Soleil',
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600',
      moq: 100,
      unit: 'kg',
      price: '4.80 €',
    },
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
    productSample: {
      title: 'Tissu Wax Authentique 100% Coton (Lot de 50)',
      imageUrl: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&q=80&w=600',
      moq: 50,
      unit: 'pièce',
      price: '16.50 €',
    },
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
    productSample: {
      title: 'Beurre de Karité Bio Brut Non Raffiné Grade A',
      imageUrl: 'https://images.unsplash.com/photo-1608248597359-54d922336336?auto=format&fit=crop&q=80&w=600',
      moq: 4,
      unit: 'fût (25kg)',
      price: '8.50 €',
    },
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

  // État du comptage des visites (Entrepreneurs, Fournisseurs, Curieux)
  const [visitStats, setVisitStats] = useState<VisitStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [simulatingType, setSimulatingType] = useState<VisitorType | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      const res = await fetch('/api/analytics/visit');
      if (res.ok) {
        const data = await res.json();
        if (data.stats) {
          setVisitStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Erreur chargement statistiques visites :', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Actualisation périodique automatique toutes les 25 secondes
    const interval = setInterval(fetchStats, 25000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateVisit = async (type: VisitorType, page: string) => {
    try {
      setSimulatingType(type);
      const res = await fetch('/api/analytics/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, page, referrer: 'Console Modérateur' }),
      });
      if (res.ok) {
        await fetchStats();
        const typeLabel =
          type === 'ENTREPRENEUR'
            ? 'Entrepreneur'
            : type === 'FOURNISSEUR'
            ? 'Fournisseur'
            : 'Curieux';
        setActionNotice(`Visite comptabilisée avec succès : +1 ${typeLabel}`);
        setTimeout(() => setActionNotice(null), 3500);
      }
    } catch (e) {
      console.error('Erreur simulation visite :', e);
    } finally {
      setSimulatingType(null);
    }
  };

  const handleApprove = (id: string, name: string) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'VERIFIED' } : item
      )
    );
    setActionNotice(`Dossier validé pour "${name}". Le badge officiel et son catalogue ont été activés.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleReject = (id: string, name: string) => {
    const reason = prompt('Indiquez le motif du refus (ex: RCCM expiré, photo produit non conforme) :');
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
              <h1 className="text-lg font-bold">Console d&apos;Audit Interne KYB & Fréquentation</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-300">
                Accès Restreint
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Contrôle administratif des dossiers légaux et suivi analytique des flux de visites en temps réel.
            </p>
          </div>
        </div>

        <Link
          href="/devenir-fournisseur"
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 self-start sm:self-auto"
        >
          Formulaire d&apos;onboarding public <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* SECTION DU COMPTAGE DES VISITES : ENTREPRENEURS, FOURNISSEURS ET CURIEUX */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                <Activity className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Comptage des Visites & Qualification de l&apos;Audience
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                Temps Réel
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Segmentation continue des flux d&apos;utilisateurs : Entrepreneurs acheteurs, Fournisseurs et Curieux du grand public.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchStats}
              disabled={isLoadingStats}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStats ? 'animate-spin' : ''}`} />
              Actualiser les flux
            </button>
          </div>
        </div>

        {/* Grille des 4 Métriques Clés */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Visites Entrepreneurs */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-emerald-100/40 border border-emerald-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Entrepreneurs
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900">
                    {visitStats?.entrepreneurs.count ?? 142}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-200/60 px-2 py-0.5 rounded-full">
                    {visitStats?.entrepreneurs.percentage ?? 35}%
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Acheteurs B2B, importateurs & porteurs de projets
                </p>
              </div>
            </div>
            <button
              onClick={() => handleSimulateVisit('ENTREPRENEUR', '/entrepreneurs')}
              disabled={simulatingType === 'ENTREPRENEUR'}
              className="mt-4 w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold text-emerald-800 bg-white hover:bg-emerald-50 rounded-lg border border-emerald-300 transition-all shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Simuler visite acheteur
            </button>
          </div>

          {/* 2. Visites Fournisseurs */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/70 to-blue-100/40 border border-blue-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                  Fournisseurs
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
                  <Factory className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900">
                    {visitStats?.fournisseurs.count ?? 89}
                  </span>
                  <span className="text-xs font-bold text-blue-700 bg-blue-200/60 px-2 py-0.5 rounded-full">
                    {visitStats?.fournisseurs.percentage ?? 22}%
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Grossistes, producteurs & coopératives d&apos;Afrique
                </p>
              </div>
            </div>
            <button
              onClick={() => handleSimulateVisit('FOURNISSEUR', '/devenir-fournisseur')}
              disabled={simulatingType === 'FOURNISSEUR'}
              className="mt-4 w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold text-blue-800 bg-white hover:bg-blue-50 rounded-lg border border-blue-300 transition-all shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Simuler visite fournisseur
            </button>
          </div>

          {/* 3. Visites Curieux */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 to-amber-100/40 border border-amber-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Curieux
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center shadow-sm">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900">
                    {visitStats?.curieux.count ?? 178}
                  </span>
                  <span className="text-xs font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-full">
                    {visitStats?.curieux.percentage ?? 43}%
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Visiteurs grand public & découverte non qualifiée
                </p>
              </div>
            </div>
            <button
              onClick={() => handleSimulateVisit('CURIEUX', '/catalogue')}
              disabled={simulatingType === 'CURIEUX'}
              className="mt-4 w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold text-amber-900 bg-white hover:bg-amber-50 rounded-lg border border-amber-300 transition-all shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Simuler visite curieux
            </button>
          </div>

          {/* 4. Total & Taux de Qualification B2B */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Total Visiteurs
                </span>
                <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">
                    {visitStats?.total ?? 409}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                    {visitStats?.qualificationRate ?? 57}% B2B
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Aujourd&apos;hui : {visitStats?.todayTotal ?? 55} visites uniques
                </p>
              </div>
            </div>
            <div className="mt-4 text-[11px] text-slate-400 border-t border-slate-700/80 pt-2 flex items-center justify-between">
              <span>Ratio Pros / Curieux</span>
              <span className="font-bold text-white">
                {((visitStats?.entrepreneurs.count ?? 142) + (visitStats?.fournisseurs.count ?? 89))} pros / {visitStats?.curieux.count ?? 178} curieux
              </span>
            </div>
          </div>
        </div>

        {/* Jauge Visuelle de Répartition de l'Audience */}
        <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Répartition proportionnelle de l&apos;audience Lougara</span>
            <span>{visitStats?.total ?? 409} sessions enregistrées</span>
          </div>
          <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${visitStats?.entrepreneurs.percentage ?? 35}%` }}
              className="bg-emerald-600 h-full transition-all duration-500"
              title={`Entrepreneurs : ${visitStats?.entrepreneurs.percentage ?? 35}%`}
            />
            <div
              style={{ width: `${visitStats?.fournisseurs.percentage ?? 22}%` }}
              className="bg-blue-600 h-full transition-all duration-500"
              title={`Fournisseurs : ${visitStats?.fournisseurs.percentage ?? 22}%`}
            />
            <div
              style={{ width: `${visitStats?.curieux.percentage ?? 43}%` }}
              className="bg-amber-500 h-full transition-all duration-500"
              title={`Curieux : ${visitStats?.curieux.percentage ?? 43}%`}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between text-[11px] font-medium text-slate-600 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
              <span>Entrepreneurs ({visitStats?.entrepreneurs.count ?? 142} &bull; {visitStats?.entrepreneurs.percentage ?? 35}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
              <span>Fournisseurs ({visitStats?.fournisseurs.count ?? 89} &bull; {visitStats?.fournisseurs.percentage ?? 22}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span>Curieux ({visitStats?.curieux.count ?? 178} &bull; {visitStats?.curieux.percentage ?? 43}%)</span>
            </div>
          </div>
        </div>

        {/* Journal des Dernières Visites Qualifiées */}
        {visitStats?.recentVisits && visitStats.recentVisits.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Journal des Dernières Visites en Direct
              </h3>
              <span className="text-[11px] text-slate-400">
                Horodatage précis et source
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-100 rounded-xl overflow-hidden">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3.5">Segment Visiteur</th>
                    <th className="py-2.5 px-3.5">Page Consultée</th>
                    <th className="py-2.5 px-3.5">Source / Référent</th>
                    <th className="py-2.5 px-3.5 text-right">Horodatage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {visitStats.recentVisits.slice(0, 6).map((visit) => (
                    <tr key={visit.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3.5">
                        {visit.type === 'ENTREPRENEUR' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <Users className="w-3 h-3" /> Entrepreneur
                          </span>
                        )}
                        {visit.type === 'FOURNISSEUR' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] bg-blue-100 text-blue-800 border border-blue-200">
                            <Factory className="w-3 h-3" /> Fournisseur
                          </span>
                        )}
                        {visit.type === 'CURIEUX' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] bg-amber-100 text-amber-900 border border-amber-300">
                            <Eye className="w-3 h-3" /> Curieux
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-[11px] text-slate-700">
                        {visit.page}
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-500">
                        {visit.referrer || 'Direct'}
                      </td>
                      <td className="py-2.5 px-3.5 text-right text-slate-400">
                        {new Date(visit.timestamp).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Statistiques d'audit KYB */}
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
      <div className="space-y-6">
        {filteredItems.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
            Aucun dossier ne correspond à ce filtre.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5"
            >
              {/* En-tête Dossier */}
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

              {/* Produit Phare Soumis (Nouvel encadré d'inspection) */}
              {item.productSample && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 flex-shrink-0 relative">
                    <img
                      src={item.productSample.imageUrl}
                      alt={item.productSample.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Produit Phare Soumis
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {item.productSample.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                      <span>Prix : <strong className="text-slate-800">{item.productSample.price}</strong> / {item.productSample.unit}</span>
                      <span>MOQ : <strong className="text-emerald-700">{item.productSample.moq} {item.productSample.unit}s</strong></span>
                    </p>
                  </div>
                </div>
              )}

              {/* Pièces justificatives */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
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
                    Valider le dossier & Publier le Produit
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
