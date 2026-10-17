'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth, SUPER_ADMIN_EMAIL } from '@/context/AuthContext';
import {
  Wrench,
  ShieldAlert,
  Power,
  Sliders,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

interface SystemMaintenanceStatus {
  isMaintenanceActive: boolean;
  lastActiveVersion: string;
  currentAppVersion: string;
  isVersionMismatch: boolean;
  message: string;
  updatedAt: string;
}

export function MaintenanceGuard() {
  const [mounted, setMounted] = useState(false);
  const { user, isSuperAdmin, login } = useAuth();
  const [status, setStatus] = useState<SystemMaintenanceStatus | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/system/maintenance?_t=${Date.now()}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success) {
        setStatus(data);
      }
    } catch (e) {
      console.warn('[MaintenanceGuard] Erreur vérification statut maintenance:', e);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchStatus();

    // Polling régulier toutes les 10 secondes pour détecter les changements en direct
    const interval = setInterval(fetchStatus, 10000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchStatus();
      }
    };

    window.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchStatus]);

  // Action rapide du Super Admin pour redémarrer le site
  const handleRestartSite = async () => {
    if (!isSuperAdmin || !user?.email) return;
    setIsToggling(true);
    try {
      const res = await fetch('/api/system/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isMaintenanceActive: false,
          requesterEmail: user.email,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus((prev) =>
          prev ? { ...prev, isMaintenanceActive: false, isVersionMismatch: false } : null
        );
      } else {
        alert(data.error || 'Erreur lors du redémarrage du site');
      }
    } catch (err: any) {
      alert('Erreur réseau lors du redémarrage du site');
    } finally {
      setIsToggling(false);
    }
  };

  // Connexion Super Admin depuis l'écran de maintenance
  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccess(null);

    const clean = adminEmail.trim().toLowerCase();
    if (!clean) {
      setLoginError('Veuillez renseigner votre email Super Admin.');
      return;
    }

    if (clean !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      setLoginError('Accès refusé. Seul le compte Super Admin est autorisé à franchir la maintenance.');
      return;
    }

    await login(clean);
    setLoginSuccess('Identification Super Admin validée. Accès en cours...');
    setShowAdminLogin(false);
    fetchStatus();
  };

  if (!mounted) {
    return null;
  }

  const isUnderMaintenance = Boolean(status?.isMaintenanceActive);

  return (
    <>
      {/* 1. CAS SUPER ADMIN EN MODE MAINTENANCE : BANDEAU FLOTTANT VISIBLE & ACCÈS COMPLET */}
      {isUnderMaintenance && isSuperAdmin && (
        <div className="sticky top-0 z-[999999] bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-sans px-4 py-2.5 shadow-2xl border-b-2 border-amber-600 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-700"></span>
            </span>
            <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider text-slate-950">
              <ShieldAlert className="w-4 h-4 text-slate-950" />
              <span>SITE EN MAINTENANCE (Accès exclusif Super Admin actif)</span>
            </div>
            <span className="hidden md:inline-block text-xs font-medium text-slate-900 border-l border-amber-600/40 pl-2">
              Le public et les utilisateurs réguliers sont bloqués par l'encart de maintenance.
            </span>
            {status?.isVersionMismatch && (
              <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-900/20 text-slate-950 border border-amber-800/30">
                <Sparkles className="w-3 h-3" /> Nouvelle version v{status.currentAppVersion}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRestartSite}
              disabled={isToggling}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-950 text-amber-400 font-bold text-xs hover:bg-slate-900 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Power className={`w-3.5 h-3.5 ${isToggling ? 'animate-spin' : ''}`} />
              {isToggling ? 'Redémarrage...' : 'Redémarrer le site & Ouvrir au public'}
            </button>
            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-slate-950 font-bold text-xs transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Gérer</span>
            </Link>
          </div>
        </div>
      )}

      {/* 2. CAS VISITEUR / UTILISATEUR NON-SUPERADMIN EN MODE MAINTENANCE : GROS ENCART BLOQUANT */}
      {isUnderMaintenance && !isSuperAdmin ? (
        <div className="fixed inset-0 z-[999999] bg-[#070D1E] overflow-y-auto flex flex-col items-center justify-center p-4 sm:p-6 text-slate-100 select-none">
          {/* Halo d'ambiance doré & ambré */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-2xl w-full mx-auto space-y-8 my-auto py-8">
            {/* Logo Lougara */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#D4AF37] via-[#E5A93C] to-[#B8860B] flex items-center justify-center text-slate-950 font-black text-4xl shadow-[0_0_40px_rgba(212,175,55,0.45)] border-2 border-amber-200/60 animate-pulse">
                L
              </div>
              <div className="text-center">
                <span className="text-2xl font-black tracking-widest text-white uppercase">
                  LOU<span className="text-[#D4AF37]">GARA</span>
                </span>
                <p className="text-[11px] text-amber-400 font-bold tracking-widest uppercase mt-0.5">
                  Plateforme B2B Afrique — Europe
                </p>
              </div>
            </div>

            {/* GROS ENCART DE MAINTENANCE */}
            <div className="glass-card gold-glow-border p-8 sm:p-10 rounded-3xl bg-slate-900/80 backdrop-blur-xl border-2 border-amber-500/40 shadow-2xl text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs uppercase tracking-wider">
                <Wrench className="w-4 h-4 text-amber-400 animate-bounce" />
                <span>Intervention Technique en Cours</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                  Site en <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500">Maintenance</span>
                </h1>
                <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto leading-relaxed">
                  {status?.message ||
                    "La plateforme Lougara fait l'objet d'une mise à niveau de ses infrastructures et catalogues B2B. L'accès public est temporairement suspendu pour garantir l'intégrité et la sécurité des données."}
                </p>
              </div>

              {/* Étiquettes de statut */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-center gap-2 text-slate-400">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Version : <strong className="text-white">v{status?.currentAppVersion || '0.16.0'}</strong></span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-center gap-2 text-slate-400">
                  <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                  <span>Rétablissement : <strong className="text-emerald-400">Très prochainement</strong></span>
                </div>
              </div>

              {/* Notice informative */}
              <p className="text-xs text-slate-400 border-t border-slate-800/80 pt-4">
                Toutes les commandes, requêtes de devis et profils fournisseurs sont préservés en toute sécurité.
                Dès la finalisation par l'administration, l'accès sera immédiatement réactivé.
              </p>
            </div>

            {/* SECTION AUTHENTIFICATION RÉSERVÉE SUPER ADMIN */}
            <div className="text-center pt-2">
              {!showAdminLogin ? (
                <button
                  onClick={() => setShowAdminLogin(true)}
                  className="text-xs text-slate-300 hover:text-amber-400 transition-colors inline-flex items-center gap-1.5 cursor-pointer underline underline-offset-4"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-300" />
                  <span>Accès réservé Super Administrateur</span>
                </button>
              ) : (
                <div className="max-w-md mx-auto p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30 text-left space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Connexion Super Admin</span>
                    </h3>
                    <button
                      onClick={() => setShowAdminLogin(false)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Fermer
                    </button>
                  </div>

                  <form onSubmit={handleAdminLoginSubmit} className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Adresse e-mail Super Admin
                      </label>
                      <input
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="champagcrypt@gmail.com"
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                        autoFocus
                      />
                    </div>

                    {loginError && (
                      <p className="text-xs text-red-400 bg-red-950/40 border border-red-800/40 p-2 rounded-lg">
                        {loginError}
                      </p>
                    )}

                    {loginSuccess && (
                      <p className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 p-2 rounded-lg">
                        {loginSuccess}
                      </p>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs hover:from-amber-400 hover:to-amber-500 transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Déverrouiller l'accès</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAdminEmail('champagcrypt@gmail.com');
                        }}
                        className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                        title="Remplir champagcrypt@gmail.com"
                      >
                        Compte Superadmin
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
