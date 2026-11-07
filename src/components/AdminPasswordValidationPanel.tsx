'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  AlertCircle,
  Building2,
  User,
  ArrowLeft,
  PlusCircle,
  Globe,
  ExternalLink,
  Package,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export interface PasswordValidationProductItem {
  id: string;
  title: string;
  category: string;
  isPublished: boolean;
  moderationStatus: string;
  externalLink?: string | null;
  isLinkApproved: boolean;
}

export interface PasswordValidationRequestItem {
  id: string;
  userId: string;
  companyId?: string;
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
  isCatalogueActive?: boolean;
  isCompanyLinkApproved?: boolean;
  website?: string | null;
  products?: PasswordValidationProductItem[];
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

  // Edition des liens de site en ligne par entreprise ou produit
  const [linkDrafts, setLinkDrafts] = useState<Record<string, string>>({});
  const [updatingControlId, setUpdatingControlId] = useState<string | null>(null);

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
        const ts = Date.now();
        const emailParam = user?.email ? `&adminEmail=${encodeURIComponent(user.email)}` : '';
        const headers: Record<string, string> = user?.email ? { 'x-user-email': user.email } : {};

        const [pwdRes, kybRes] = await Promise.allSettled([
          fetch(`/api/admin/password-validations?status=ALL${emailParam}&_t=${ts}`, {
            cache: 'no-store',
            headers,
          }),
          fetch(`/api/admin/verifications?status=ALL&_t=${ts}`, {
            cache: 'no-store',
          }),
        ]);

        let mergedRequests: PasswordValidationRequestItem[] = [];

        if (pwdRes.status === 'fulfilled' && pwdRes.value.ok) {
          const pwdData = await pwdRes.value.json();
          if (pwdData.success && Array.isArray(pwdData.requests)) {
            mergedRequests = [...pwdData.requests];
          }
        }

        // Fusionner systématiquement avec les catalogues fournisseurs vérifiés dans Supabase
        // pour garantir que tout catalogue vérifié apparaît dans Total Demandes et Validés / Vérifiés
        if (kybRes.status === 'fulfilled' && kybRes.value.ok) {
          const kybData = await kybRes.value.json();
          if (Array.isArray(kybData.companies)) {
            for (const comp of kybData.companies) {
              const compEmail = (comp.user?.email || '').trim().toLowerCase();
              const compStatus: 'PENDING' | 'APPROVED' | 'REJECTED' =
                comp.verificationStatus === 'VERIFIED'
                  ? 'APPROVED'
                  : comp.verificationStatus === 'REJECTED'
                    ? 'REJECTED'
                    : 'PENDING';

              const compProducts: PasswordValidationProductItem[] = (comp.products || []).map(
                (p: any) => ({
                  id: p.id,
                  title: p.title,
                  category: p.category || 'Général',
                  isPublished: Boolean(p.isPublished),
                  moderationStatus: p.moderationStatus || 'PENDING',
                  externalLink: p.externalLink || comp.website || null,
                  isLinkApproved: Boolean(p.isLinkApproved),
                })
              );

              const detectedWebsite =
                comp.website ||
                compProducts.find((p) => p.externalLink)?.externalLink ||
                null;

              const existingIdx = mergedRequests.findIndex(
                (r) =>
                  (compEmail && r.email.toLowerCase() === compEmail) ||
                  (r.companyId && r.companyId === comp.id) ||
                  r.companyName.toLowerCase() === String(comp.companyName || '').toLowerCase()
              );

              if (existingIdx >= 0) {
                mergedRequests[existingIdx] = {
                  ...mergedRequests[existingIdx],
                  companyId: comp.id,
                  companyName: comp.companyName || mergedRequests[existingIdx].companyName,
                  status: compStatus === 'APPROVED' ? 'APPROVED' : mergedRequests[existingIdx].status,
                  isCatalogueActive: Boolean(comp.isPublished),
                  website: detectedWebsite,
                  products: compProducts,
                };
              } else {
                mergedRequests.push({
                  id: `pwd-req-${comp.user?.id || comp.id}`,
                  userId: comp.user?.id || comp.id,
                  companyId: comp.id,
                  email: compEmail || 'contact@entreprise.com',
                  fullName:
                    `${comp.user?.firstName || ''} ${comp.user?.lastName || ''}`.trim() ||
                    comp.companyName ||
                    'Dirigeant Vérifié',
                  companyName: comp.companyName || 'Entreprise Vérifiée',
                  clientRole: 'supplier',
                  country: comp.country || 'France',
                  requestType: 'CLIENT_REGISTRATION',
                  passwordFingerprint: `scrypt:sha256:••••${String(comp.id).slice(-6)}`,
                  passwordStrength: 'FORT',
                  status: compStatus,
                  requestedAt: comp.createdAt || new Date().toISOString(),
                  reviewedAt: comp.verifiedAt || comp.updatedAt || undefined,
                  reviewedBy: compStatus === 'APPROVED' ? 'Lougara Admin' : undefined,
                  isCatalogueActive: Boolean(comp.isPublished),
                  website: detectedWebsite,
                  products: compProducts,
                });
              }
            }
          }
        }

        // Initialiser les brouillons de liens externes sans écraser avec une chaîne vide
        setLinkDrafts((prev) => {
          const next = { ...prev };
          for (const reqItem of mergedRequests) {
            if (reqItem.companyId) {
              const compKey = `comp-${reqItem.companyId}`;
              const serverCompUrl =
                reqItem.website ||
                reqItem.products?.find((p) => p.externalLink)?.externalLink ||
                '';
              if (!next[compKey] || !next[compKey].trim()) {
                next[compKey] = serverCompUrl;
              }
            }
            for (const prod of reqItem.products || []) {
              const prodKey = `prod-${prod.id}`;
              const serverProdUrl = prod.externalLink || reqItem.website || '';
              if (!next[prodKey] || !next[prodKey].trim()) {
                next[prodKey] = serverProdUrl;
              }
            }
          }
          return next;
        });

        const pendingCount = mergedRequests.filter(
          (r) =>
            r.status === 'PENDING' ||
            (r.products || []).some((p) => !p.isPublished || p.moderationStatus !== 'APPROVED')
        ).length;
        const approvedCount = mergedRequests.filter((r) => r.status === 'APPROVED').length;
        const rejectedCount = mergedRequests.filter((r) => r.status === 'REJECTED').length;

        setRequests(mergedRequests);
        setStats({
          total: mergedRequests.length,
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
        });
      } catch {
        setErrorMessage(
          'Erreur réseau lors du chargement des demandes et catalogues vérifiés.'
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

  // Activer ou désactiver le catalogue complet d'un client validé
  const handleToggleCatalogueActive = async (companyId: string, willBeActive: boolean, companyName: string) => {
    setUpdatingControlId(`cat-${companyId}`);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/admin/verifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TOGGLE_PUBLICATION',
          companyId,
          isPublished: willBeActive,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRequests((prev) =>
          prev.map((r) =>
            r.companyId === companyId ? { ...r, isCatalogueActive: willBeActive } : r
          )
        );
        setSuccessMessage(
          willBeActive
            ? `Catalogue de « ${companyName} » activé et visible en ligne.`
            : `Catalogue de « ${companyName} » désactivé (masqué du catalogue public).`
        );
      } else {
        setErrorMessage(data.error || 'Impossible de modifier le statut du catalogue.');
      }
    } catch {
      setErrorMessage('Erreur réseau lors de la mise à jour du catalogue.');
    } finally {
      setUpdatingControlId(null);
    }
  };

  // Valider toutes les pages vitrines (1 à 4) d'un catalogue en 1 clic (Validation Finale Admin Lougara)
  const handleApproveAllCatalogPages = async (companyId: string, companyName: string) => {
    setUpdatingControlId(`approve-all-prods-${companyId}`);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/admin/verifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'APPROVE_ALL_PRODUCTS',
          companyId,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRequests((prev) =>
          prev.map((r) =>
            r.companyId === companyId
              ? {
                  ...r,
                  isPublished: true,
                  products: (r.products || []).map((p) => ({
                    ...p,
                    isPublished: true,
                    moderationStatus: 'APPROVED',
                  })),
                }
              : r
          )
        );
        setSuccessMessage(
          `Toutes les pages vitrines du catalogue « ${companyName} » ont été validées définitivement par Admin Lougara et sont en ligne !`
        );
      } else {
        setErrorMessage(data.error || 'Impossible de valider toutes les pages du catalogue.');
      }
    } catch {
      setErrorMessage('Erreur réseau lors de la validation des pages du catalogue.');
    } finally {
      setUpdatingControlId(null);
    }
  };

  // Activer ou désactiver une partie du catalogue (un produit spécifique)
  const handleToggleProductActive = async (
    companyId: string,
    productId: string,
    willBeActive: boolean,
    productTitle: string
  ) => {
    setUpdatingControlId(`prod-active-${productId}`);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/admin/verifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TOGGLE_PRODUCT_ACTIVE',
          companyId,
          productId,
          isPublished: willBeActive,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRequests((prev) =>
          prev.map((r) =>
            r.companyId === companyId
              ? {
                  ...r,
                  products: (r.products || []).map((p) =>
                    p.id === productId
                      ? { ...p, isPublished: willBeActive, moderationStatus: willBeActive ? 'APPROVED' : p.moderationStatus }
                      : p
                  ),
                }
              : r
          )
        );
        setSuccessMessage(
          willBeActive
            ? `Produit « ${productTitle} » activé dans le catalogue.`
            : `Produit « ${productTitle} » désactivé (masqué du catalogue).`
        );
      } else {
        setErrorMessage(data.error || 'Impossible de modifier la visibilité de ce produit.');
      }
    } catch {
      setErrorMessage('Erreur réseau lors de la mise à jour du produit.');
    } finally {
      setUpdatingControlId(null);
    }
  };

  // Valider / Activer ou désactiver le lien de site en ligne (par produit ou globalement pour le catalogue)
  const handleToggleOnlineLink = async (params: {
    companyId: string;
    productId?: string;
    externalLink: string;
    isLinkApproved: boolean;
  }) => {
    const controlKey = params.productId ? `link-${params.productId}` : `link-comp-${params.companyId}`;
    setUpdatingControlId(controlKey);
    setErrorMessage(null);

    const normalizedUrl = params.externalLink.trim()
      ? /^https?:\/\//i.test(params.externalLink.trim())
        ? params.externalLink.trim()
        : `https://${params.externalLink.trim()}`
      : '';

    // Mise à jour optimiste immédiate de l'état de la coche
    setRequests((prev) =>
      prev.map((r) => {
        if (r.companyId !== params.companyId) return r;
        if (params.productId) {
          const updatedProds = (r.products || []).map((p) =>
            p.id === params.productId
              ? {
                  ...p,
                  externalLink: normalizedUrl || p.externalLink,
                  isLinkApproved: params.isLinkApproved,
                }
              : p
          );
          return {
            ...r,
            website: normalizedUrl || r.website,
            isCompanyLinkApproved: updatedProds.some((p) => p.isLinkApproved),
            products: updatedProds,
          };
        }
        return {
          ...r,
          website: normalizedUrl || r.website,
          isCompanyLinkApproved: params.isLinkApproved,
          products: (r.products || []).map((p) => ({
            ...p,
            externalLink: normalizedUrl || p.externalLink,
            isLinkApproved: params.isLinkApproved,
          })),
        };
      })
    );

    try {
      const res = await fetch('/api/admin/verifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_ONLINE_LINK',
          companyId: params.companyId,
          productId: params.productId,
          externalLink: normalizedUrl || params.externalLink,
          isLinkApproved: params.isLinkApproved,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage(
          params.isLinkApproved
            ? 'Lien de l’application / site en ligne validé et activé sur le catalogue public.'
            : 'Lien de l’application / site en ligne désactivé sur le catalogue public.'
        );
      } else {
        setErrorMessage(data.error || 'Impossible de mettre à jour le lien en ligne.');
        await fetchPasswordRequests(false);
      }
    } catch {
      setErrorMessage('Erreur réseau lors de la validation du lien.');
      await fetchPasswordRequests(false);
    } finally {
      setUpdatingControlId(null);
    }
  };

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
    const hasPendingPages = (reqItem.products || []).some(
      (p) => !p.isPublished || p.moderationStatus !== 'APPROVED'
    );
    if (statusFilter === 'PENDING') {
      if (reqItem.status !== 'PENDING' && !hasPendingPages) return false;
    } else if (statusFilter !== 'ALL' && reqItem.status !== statusFilter) {
      return false;
    }
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
        return 'Inscription Client & Catalogue Vérifié';
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
                Validation des Mots de Passe, Catalogues & Liens en Ligne
              </h2>
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                {isSuperAdmin ? 'Accès Super Admin' : 'Accès Modérateur'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Gérez les clients validés, cochez l&apos;activation de leur lien de site en ligne, et activez ou désactivez leur catalogue complet ou produit par produit.
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
            Validés / Vérifiés
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
                ? `Toutes les demandes (${stats.total})`
                : tab === 'PENDING'
                  ? `À Valider (${stats.pending})`
                  : tab === 'APPROVED'
                    ? `Validés / Vérifiés (${stats.approved})`
                    : `Refusés (${stats.rejected})`}
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
            Chargement des demandes et catalogues vérifiés...
          </p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="glass-card rounded-3xl border border-slate-800 p-12 text-center space-y-3">
          <KeyRound className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-sm font-black text-white">
            Aucune demande trouvée
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
            const companyId = item.companyId;
            const products = item.products || [];
            const isCatalogueActive = item.isCatalogueActive !== false;
            const companyLinkDraft = companyId
              ? linkDrafts[`comp-${companyId}`] || item.website || products[0]?.externalLink || ''
              : '';
            const isAnyLinkApproved =
              products.length > 0
                ? products.some((p) => p.isLinkApproved)
                : Boolean(item.isCompanyLinkApproved);

            return (
              <div
                key={item.id}
                className={`glass-card rounded-3xl border p-5 sm:p-6 transition-all space-y-5 ${
                  isPending
                    ? 'border-amber-500/40 bg-slate-900/80'
                    : isApproved
                      ? 'border-emerald-500/40 bg-slate-900/60'
                      : 'border-rose-500/30 bg-slate-900/50'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-lg font-black text-white">{item.companyName}</span>
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
                            ? '✓ Catalogue & Compte Vérifié'
                            : '✗ Refusé'}
                      </span>
                      {companyId && (
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border flex items-center gap-1 ${
                            isCatalogueActive
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                              : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          {isCatalogueActive ? (
                            <>
                              <Eye className="w-3 h-3" /> Catalogue en ligne
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" /> Catalogue désactivé
                            </>
                          )}
                        </span>
                      )}
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
                        Inscrit le {new Date(item.requestedAt).toLocaleString('fr-FR')}
                      </span>
                    </div>

                    {item.reviewedBy && (
                      <p className="text-[11px] text-slate-400 pt-1">
                        Validé par <strong className="text-slate-200">{item.reviewedBy}</strong>
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

                  {/* ACTIONS VALIDER / REFUSER + VALIDATION FINALE DES PAGES VITRINES EN ATTENTE */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    {companyId &&
                      products.some((p) => !p.isPublished || p.moderationStatus !== 'APPROVED') && (
                        <button
                          type="button"
                          disabled={updatingControlId === `approve-all-prods-${companyId}`}
                          onClick={() => handleApproveAllCatalogPages(companyId, item.companyName)}
                          className="px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] via-[#E5A93C] to-[#B8860B] hover:opacity-95 shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4 text-slate-950" />
                          <span>
                            {updatingControlId === `approve-all-prods-${companyId}`
                              ? 'Validation en cours...'
                              : `✓ Valider les nouvelles pages (${
                                  products.filter(
                                    (p) => !p.isPublished || p.moderationStatus !== 'APPROVED'
                                  ).length
                                } en attente) — Admin Lougara`}
                          </span>
                        </button>
                      )}

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
                        Refuser / Suspendre
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
                          {isProcessing ? 'Validation...' : 'Valider le compte'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* PANNEAU DE CONTRÔLE POUR LES CATALOGUES VALIDÉS : COCHES LIEN SITE EN LIGNE + ACTIVATION CATALOGUE COMPLET OU PARTIEL */}
                {companyId && (
                  <div className="pt-4 border-t border-slate-800/90 space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* 1. COCHE ACTIVATION / DÉSACTIVATION DU CATALOGUE COMPLET */}
                      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                              <Package className="w-4 h-4 text-[#D4AF37]" />
                              1. Visibilité du Catalogue Complet
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Cochez pour activer la vitrine de <strong>{item.companyName}</strong> dans le catalogue public, ou décochez pour la désactiver.
                            </p>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase shrink-0 border ${
                              isCatalogueActive
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                                : 'bg-amber-950 text-amber-300 border-amber-500/40'
                            }`}
                          >
                            {isCatalogueActive ? 'Actif' : 'Désactivé'}
                          </span>
                        </div>

                        <label className="inline-flex items-center gap-2.5 cursor-pointer select-none p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-[#D4AF37]/50 transition-all">
                          <input
                            type="checkbox"
                            checked={isCatalogueActive}
                            disabled={updatingControlId === `cat-${companyId}`}
                            onChange={(e) =>
                              handleToggleCatalogueActive(companyId, e.target.checked, item.companyName)
                            }
                            className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-950 border-slate-700 cursor-pointer accent-emerald-500"
                          />
                          <span className={`text-xs font-bold ${isCatalogueActive ? 'text-emerald-300' : 'text-amber-300'}`}>
                            {isCatalogueActive
                              ? '✓ Catalogue actif en ligne (visible par les visiteurs)'
                              : 'Catalogue désactivé (cocher pour réactiver le catalogue)'}
                          </span>
                        </label>
                      </div>

                      {/* 2. COCHE POUR LE LIEN DE SITE EN LIGNE */}
                      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                              <Globe className="w-4 h-4 text-[#D4AF37]" />
                              2. Lien de Site en Ligne (Validation Admin)
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Renseignez ou vérifiez l&apos;adresse du site en ligne et cochez la case pour l&apos;afficher sur le catalogue.
                            </p>
                          </div>
                          {companyLinkDraft && (
                            <a
                              href={
                                companyLinkDraft.startsWith('http')
                                  ? companyLinkDraft
                                  : `https://${companyLinkDraft}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:underline shrink-0"
                            >
                              <span>Ouvrir</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <input
                            type="text"
                            value={companyLinkDraft}
                            onChange={(e) =>
                              setLinkDrafts((prev) => ({
                                ...prev,
                                [`comp-${companyId}`]: e.target.value,
                              }))
                            }
                            placeholder="https://appalacarte.fr"
                            className="flex-1 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                          />
                          <button
                            type="button"
                            disabled={updatingControlId === `link-comp-${companyId}`}
                            onClick={() =>
                              handleToggleOnlineLink({
                                companyId,
                                externalLink: companyLinkDraft,
                                isLinkApproved: true,
                              })
                            }
                            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-bold transition-all cursor-pointer shrink-0"
                          >
                            Enregistrer & Valider
                          </button>
                        </div>

                        <label className="inline-flex items-center gap-2.5 cursor-pointer select-none p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-[#D4AF37]/50 transition-all">
                          <input
                            type="checkbox"
                            checked={isAnyLinkApproved}
                            disabled={updatingControlId === `link-comp-${companyId}`}
                            onChange={(e) =>
                              handleToggleOnlineLink({
                                companyId,
                                externalLink: companyLinkDraft || 'https://appalacarte.fr',
                                isLinkApproved: e.target.checked,
                              })
                            }
                            className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-950 border-slate-700 cursor-pointer accent-emerald-500"
                          />
                          <span className={`text-xs font-bold ${isAnyLinkApproved ? 'text-emerald-300' : 'text-slate-300'}`}>
                            {isAnyLinkApproved
                              ? '✓ Lien de site en ligne validé et affiché au catalogue'
                              : 'Cocher pour autoriser et afficher le lien du site en ligne'}
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* 3. COCHES POUR ACTIVER OU DÉSACTIVER UNE PARTIE DU CATALOGUE (PAGES VITRINES 1 À 4 — VALIDATION FINALE ADMIN LOUGARA) */}
                    {products.length > 0 && (
                      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/90 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                              <Package className="w-4 h-4 text-emerald-400" />
                              3. Validation Finale Admin Lougara — Pages Vitrines ({products.filter((p) => p.isPublished && p.moderationStatus === 'APPROVED').length}/{products.length} page(s) validée(s) sur 4 max)
                            </h4>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              Validez individuellement ou en 1 clic les pages vitrines créées ou modifiées par le client dans « Gérer mon catalogue ».
                            </span>
                          </div>

                          {products.some((p) => !p.isPublished || p.moderationStatus !== 'APPROVED') && (
                            <button
                              type="button"
                              disabled={updatingControlId === `approve-all-prods-${companyId}`}
                              onClick={() => handleApproveAllCatalogPages(companyId, item.companyName)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] via-[#E5A93C] to-[#B8860B] hover:opacity-95 shadow-md transition-all cursor-pointer disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>
                                {updatingControlId === `approve-all-prods-${companyId}`
                                  ? 'Validation en cours...'
                                  : `✓ Valider toutes les pages (${products.length}/4) — Admin Lougara`}
                              </span>
                            </button>
                          )}
                        </div>

                        <div className="divide-y divide-slate-800/80">
                          {products.map((prod, idx) => {
                            const prodLinkDraft =
                              linkDrafts[`prod-${prod.id}`] ?? prod.externalLink ?? companyLinkDraft ?? '';
                            const isProdActive = Boolean(prod.isPublished) && prod.moderationStatus === 'APPROVED';

                            return (
                              <div
                                key={prod.id}
                                className="py-3 first:pt-1 last:pb-0 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
                              >
                                <div className="flex items-center gap-3">
                                  <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={isProdActive}
                                      disabled={updatingControlId === `prod-active-${prod.id}`}
                                      onChange={(e) =>
                                        handleToggleProductActive(
                                          companyId,
                                          prod.id,
                                          e.target.checked,
                                          prod.title
                                        )
                                      }
                                      className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-950 border-slate-700 cursor-pointer accent-emerald-500"
                                    />
                                    <div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#E5A93C] border border-[#D4AF37]/40 text-[10px] font-black uppercase">
                                          Page Vitrine {idx + 1}/4
                                        </span>
                                        <span className="text-xs font-black text-white">
                                          {prod.title}
                                        </span>
                                      </div>
                                      <span className="text-[11px] text-slate-400 block mt-0.5">
                                        Catégorie : {prod.category} &bull;{' '}
                                        <strong className={isProdActive ? 'text-emerald-400' : 'text-amber-400'}>
                                          {isProdActive
                                            ? '✓ Page validée par Admin Lougara (Active au catalogue)'
                                            : '⏳ En attente de validation finale Admin Lougara'}
                                        </strong>
                                      </span>
                                    </div>
                                  </label>

                                  {!isProdActive && (
                                    <button
                                      type="button"
                                      disabled={updatingControlId === `prod-active-${prod.id}`}
                                      onClick={() =>
                                        handleToggleProductActive(companyId, prod.id, true, prod.title)
                                      }
                                      className="px-3 py-1 rounded-lg text-[11px] font-black text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all cursor-pointer shadow-sm shrink-0"
                                    >
                                      ✓ Valider cette page
                                    </button>
                                  )}
                                </div>

                                {/* Coche & Lien en ligne pour ce produit */}
                                <div className="flex flex-wrap items-center gap-2.5">
                                  <input
                                    type="text"
                                    value={prodLinkDraft}
                                    onChange={(e) =>
                                      setLinkDrafts((prev) => ({
                                        ...prev,
                                        [`prod-${prod.id}`]: e.target.value,
                                      }))
                                    }
                                    placeholder="https://..."
                                    className="w-52 px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-900 text-[11px] text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                                  />
                                  <label className="inline-flex items-center gap-2 cursor-pointer select-none px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-400/50">
                                    <input
                                      type="checkbox"
                                      checked={Boolean(prod.isLinkApproved)}
                                      disabled={updatingControlId === `link-${prod.id}`}
                                      onChange={(e) =>
                                        handleToggleOnlineLink({
                                          companyId,
                                          productId: prod.id,
                                          externalLink: prodLinkDraft || 'https://appalacarte.fr',
                                          isLinkApproved: e.target.checked,
                                        })
                                      }
                                      className="w-3.5 h-3.5 rounded text-emerald-500 bg-slate-950 border-slate-700 cursor-pointer accent-emerald-500"
                                    />
                                    <span
                                      className={`text-[11px] font-bold ${
                                        prod.isLinkApproved ? 'text-emerald-300' : 'text-slate-300'
                                      }`}
                                    >
                                      {prod.isLinkApproved ? 'Lien en ligne actif ✓' : 'Valider le lien'}
                                    </span>
                                  </label>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
