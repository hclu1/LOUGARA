'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  Search,
  RefreshCw,
  AlertCircle,
  ShieldAlert,
  Building2,
  User,
  ArrowLeft,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export interface PasswordValidationRequestItem {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  companyName: string;
  clientRole: 'entrepreneur' | 'supplier';
  country: string;
  requestType: 'INITIAL_PASSWORD' | 'PASSWORD_RESET' | 'CLIENT_REGISTRATION';
  passwordFingerprint: string;
  passwordStrength: 'FORT' | 'CONFORME';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export function AdminPasswordValidationPanel({ embedded = false }: { embedded?: boolean }) {
  const { user, isModerator, isSuperAdmin } = useAuth();
  const [requests, setRequests] = useState<PasswordValidationRequestItem[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Refus avec motif
  const [rejectingItem, setRejectingItem] = useState<PasswordValidationRequestItem | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Ajout / Réinitialisation manuelle pour un client
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [newClientRole, setNewClientRole] = useState<'entrepreneur' | 'supplier'>('entrepreneur');
  const [newClientPassword, setNewClientPassword] = useState('');

  const fetchPasswordRequests = useCallback(
    async (showLoader = true) => {
      if (showLoader) setIsLoading(true);
      setErrorMessage(null);

      try {
        const emailParam = user?.email ? `&adminEmail=${encodeURIComponent(user.email)}` : '';
        const res = await fetch(
          `/api/admin/password-validations?status=ALL${emailParam}&_t=${Date.now()}`,
          {
            cache: 'no-store',
            headers: user?.email ? { 'x-user-email': user.email } : {},
          }
        );

        const data = await res.json();
        if (!res.ok || !data.success) {
          setErrorMessage(
            data.error || 'Impossible de charger les demandes de validation des mots de passe.'
          );
          setRequests([]);
          return;
        }

        setRequests(Array.isArray(data.requests) ? data.requests : []);
        if (data.stats) {
          setStats(data.stats);
        }
      } catch {
        setErrorMessage(
          'Erreur réseau lors du chargement des demandes de validation des mots de passe.'
        );
      } finally {
        if (showLoader) setIsLoading(false);
      }
    },
    [user?.email]
  );

  useEffect(() => {
    if (isModerator) {
      fetchPasswordRequests(true);
    } else {
      setIsLoading(false);
    }
  }, [isModerator, fetchPasswordRequests]);

  const handleApprove = async (item: PasswordValidationRequestItem) => {
    setProcessingId(item.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/admin/password-validations', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.email ? { 'x-user-email': user.email } : {}),
        },
        body: JSON.stringify({
          requestId: item.id,
          action: 'APPROVE',
          reviewerEmail: user?.email,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Erreur lors de la validation du mot de passe.');
        return;
      }

      setSuccessMessage(
        data.message || `Mot de passe validé avec succès pour ${item.email}.`
      );
      await fetchPasswordRequests(false);
    } catch {
      setErrorMessage('Erreur réseau lors de la validation.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingItem) return;

    const reason =
      rejectionReasonInput.trim() ||
      'Mot de passe ou demande non conforme aux règles de sécurité.';
    setProcessingId(rejectingItem.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/admin/password-validations', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.email ? { 'x-user-email': user.email } : {}),
        },
        body: JSON.stringify({
          requestId: rejectingItem.id,
          action: 'REJECT',
          rejectionReason: reason,
          reviewerEmail: user?.email,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Erreur lors du refus de la demande.');
        return;
      }

      setSuccessMessage(
        data.message || `Demande de mot de passe refusée pour ${rejectingItem.email}.`
      );
      setRejectingItem(null);
      setRejectionReasonInput('');
      await fetchPasswordRequests(false);
    } catch {
      setErrorMessage('Erreur réseau lors du refus de la demande.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCreateClientPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/password-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newClientEmail,
          password: newClientPassword,
          fullName: newClientName,
          companyName: newClientCompany,
          clientRole: newClientRole,
          requestType: 'PASSWORD_RESET',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Impossible de créer la demande.');
        return;
      }

      setShowCreateModal(false);
      setNewClientEmail('');
      setNewClientName('');
      setNewClientCompany('');
      setNewClientPassword('');
      setSuccessMessage('Nouvelle demande de mot de passe client enregistrée.');
      await fetchPasswordRequests(false);
    } catch {
      setErrorMessage('Erreur réseau lors de l’enregistrement.');
    }
  };

  const filteredRequests = requests.filter((reqItem) => {
    if (statusFilter !== 'ALL' && reqItem.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        reqItem.email.toLowerCase().includes(q) ||
        reqItem.fullName.toLowerCase().includes(q) ||
        reqItem.companyName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const formatRequestType = (type: PasswordValidationRequestItem['requestType']) => {
    switch (type) {
      case 'CLIENT_REGISTRATION':
        return 'Inscription Client & Mot de Passe';
      case 'INITIAL_PASSWORD':
        return 'Activation Mot de Passe Initial';
      case 'PASSWORD_RESET':
        return 'Réinitialisation Mot de Passe';
      default:
        return 'Validation Mot de Passe';
    }
  };

  return (
    <div className="space-y-6">
      {/* EN-TÊTE */}
      <div className="glass-card gold-glow-border p-6 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-slate-950 flex items-center justify-center font-black shadow-[0_0_20px_rgba(212,175,55,0.4)]">
            <KeyRound className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Validation des Mots de Passe & Sécurité Comptes Clients
              </h2>
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                {isSuperAdmin ? 'Accès Super Admin' : 'Accès Modérateur'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Vérifiez et validez les demandes de création ou de réinitialisation de mots de passe des clients inscrits (Entrepreneurs & Fournisseurs).
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-xs font-bold text-amber-300 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Attribuer / Réinitialiser un mot de passe client</span>
          </button>

          <button
            type="button"
            onClick={() => fetchPasswordRequests(true)}
            className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>

          {!embedded && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:bg-slate-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Console Admin</span>
            </Link>
          )}
        </div>
      </div>

      {/* MESSAGES DE RETOUR (ERREUR / SUCCÈS) */}
      {errorMessage && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-rose-950/90 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchPasswordRequests(true)}
            className="px-3 py-1 rounded-lg bg-rose-900 hover:bg-rose-800 text-white text-[11px]"
          >
            Réessayer
          </button>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* COMPTEURS KPI INTERACTIFS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`glass-card p-5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'ALL'
              ? 'border-[#D4AF37] bg-slate-900/90 ring-2 ring-[#D4AF37]/40'
              : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
          }`}
        >
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block">
            Total Demandes
          </span>
          <span className="text-3xl font-black text-white mt-1 block">{stats.total}</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('PENDING')}
          className={`glass-card p-5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'PENDING'
              ? 'border-amber-400 bg-amber-950/40 ring-2 ring-amber-400/50'
              : 'border-amber-500/30 bg-slate-900/50 hover:border-amber-500/60'
          }`}
        >
          <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest block">
            En Attente
          </span>
          <span className="text-3xl font-black text-amber-300 mt-1 block">{stats.pending}</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('APPROVED')}
          className={`glass-card p-5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'APPROVED'
              ? 'border-emerald-400 bg-emerald-950/40 ring-2 ring-emerald-400/50'
              : 'border-emerald-500/30 bg-slate-900/50 hover:border-emerald-500/60'
          }`}
        >
          <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest block">
            Validés
          </span>
          <span className="text-3xl font-black text-emerald-400 mt-1 block">{stats.approved}</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('REJECTED')}
          className={`glass-card p-5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'REJECTED'
              ? 'border-rose-400 bg-rose-950/40 ring-2 ring-rose-400/50'
              : 'border-rose-500/30 bg-slate-900/50 hover:border-rose-500/60'
          }`}
        >
          <span className="text-xs font-extrabold text-rose-400 uppercase tracking-widest block">
            Refusés
          </span>
          <span className="text-3xl font-black text-rose-400 mt-1 block">{stats.rejected}</span>
        </button>
      </div>

      {/* BARRE DE RECHERCHE & FILTRES */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                statusFilter === tab
                  ? 'bg-[#D4AF37] text-slate-950 border-amber-300 font-black'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              {tab === 'ALL'
                ? 'Toutes les demandes'
                : tab === 'PENDING'
                  ? 'À Valider'
                  : tab === 'APPROVED'
                    ? 'Validées'
                    : 'Refusées'}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par email, nom ou entreprise..."
            className="w-full sm:w-72 pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
          />
        </div>
      </div>

      {/* ÉTAT DE CHARGEMENT / LISTE VIDE / CARTES DE DEMANDES */}
      {isLoading ? (
        <div className="glass-card rounded-3xl border border-slate-800 p-12 flex flex-col items-center justify-center gap-3 text-slate-300">
          <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold">
            Chargement des demandes de validation des mots de passe...
          </p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="glass-card rounded-3xl border border-slate-800 p-12 text-center space-y-3">
          <KeyRound className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-sm font-black text-white">
            Aucune demande de validation de mot de passe trouvée
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Il n&apos;y a actuellement aucune demande correspondant à votre filtre ou à votre recherche.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((item) => {
            const isPending = item.status === 'PENDING';
            const isApproved = item.status === 'APPROVED';
            const isRejected = item.status === 'REJECTED';
            const isProcessing = processingId === item.id;

            return (
              <div
                key={item.id}
                className={`glass-card rounded-3xl border p-5 sm:p-6 transition-all ${
                  isPending
                    ? 'border-amber-500/40 bg-slate-900/80'
                    : isApproved
                      ? 'border-emerald-500/30 bg-slate-900/50'
                      : 'border-rose-500/30 bg-slate-900/50'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-black text-white">{item.companyName}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                          item.clientRole === 'supplier'
                            ? 'bg-blue-950 text-blue-300 border-blue-500/40'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {item.clientRole === 'supplier' ? 'Fournisseur' : 'Entrepreneur'}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                          isPending
                            ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                            : isApproved
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                              : 'bg-rose-950 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        {isPending
                          ? '⏳ En attente de validation'
                          : isApproved
                            ? '✓ Mot de passe validé'
                            : '✗ Refusé'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-amber-400" />
                        <strong>{item.fullName}</strong> ({item.email})
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        {item.country}
                      </span>
                      <span className="text-amber-300 font-semibold">
                        {formatRequestType(item.requestType)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                      <span className="font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
                        Empreinte : <strong className="text-emerald-400">{item.passwordFingerprint}</strong>
                      </span>
                      <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
                        Robustesse : <strong className="text-amber-300">{item.passwordStrength}</strong>
                      </span>
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Demandé le {new Date(item.requestedAt).toLocaleString('fr-FR')}
                      </span>
                    </div>

                    {item.reviewedBy && (
                      <p className="text-[11px] text-slate-400 pt-1">
                        Traité par <strong className="text-slate-200">{item.reviewedBy}</strong>
                        {item.reviewedAt &&
                          ` le ${new Date(item.reviewedAt).toLocaleString('fr-FR')}`}
                        {item.rejectionReason && (
                          <span className="text-rose-300 ml-2">
                            • Motif : {item.rejectionReason}
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* ACTIONS VALIDER / REFUSER */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    {!isRejected && (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => {
                          setRejectingItem(item);
                          setRejectionReasonInput('');
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        Refuser
                      </button>
                    )}

                    {!isApproved && (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleApprove(item)}
                        className="px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] hover:from-[#E5A93C] hover:to-[#D4AF37] shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-slate-950" />
                        <span>
                          {isProcessing ? 'Validation...' : 'Valider le mot de passe'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODALE DE REFUS MOTIVÉ */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-3xl border border-rose-500/40 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-400" />
                <span>Refuser la demande de mot de passe</span>
              </h3>
              <button
                type="button"
                onClick={() => setRejectingItem(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Compte concerné : <strong className="text-amber-300">{rejectingItem.email}</strong> (
              {rejectingItem.companyName})
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Motif du refus *
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="Ex: Identité du dirigeant non vérifiée, mot de passe ne respectant pas la politique de sécurité..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={processingId === rejectingItem.id}
                  className="px-4 py-2 rounded-xl text-xs font-black text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50"
                >
                  Confirmer le refus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE D'ATTRIBUTION / RÉINITIALISATION MOT DE PASSE CLIENT */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-3xl border border-[#D4AF37]/40 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <span>Définir un mot de passe client</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClientPasswordRequest} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  E-mail du client inscrit *
                </label>
                <input
                  type="email"
                  required
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  placeholder="client@entreprise.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="Jean Dupont"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Profil client
                  </label>
                  <select
                    value={newClientRole}
                    onChange={(e) =>
                      setNewClientRole(e.target.value as 'entrepreneur' | 'supplier')
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white"
                  >
                    <option value="entrepreneur">Entrepreneur</option>
                    <option value="supplier">Fournisseur</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Entreprise
                </label>
                <input
                  type="text"
                  value={newClientCompany}
                  onChange={(e) => setNewClientCompany(e.target.value)}
                  placeholder="Société B2B"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nouveau mot de passe (min. 6 caractères) *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newClientPassword}
                  onChange={(e) => setNewClientPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C]"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPasswordValidationsPage() {
  const { isModerator, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B132B] flex items-center justify-center text-slate-300">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold">Vérification des droits d&apos;accès...</span>
        </div>
      </div>
    );
  }

  if (!isModerator) {
    return (
      <div className="min-h-screen bg-[#0B132B] text-slate-100 py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="max-w-md w-full glass-card gold-glow-border p-8 rounded-3xl text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-rose-950/80 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-9 h-9" />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-500/40">
              Erreur 403 &bull; Accès Refusé
            </span>
            <h1 className="text-2xl font-black text-white">Accès Restreint</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Vous ne disposez pas des droits nécessaires pour consulter cette ressource.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/admin/login"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C]"
            >
              <Lock className="w-4 h-4 text-slate-950" />
              <span>Connexion Administration</span>
            </Link>
            <Link
              href="/"
              className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <AdminPasswordValidationPanel embedded={false} />
      </div>
    </div>
  );
}
