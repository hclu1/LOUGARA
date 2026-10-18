'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Wrench,
  ShieldAlert,
  Power,
  Sliders,
  RefreshCw,
  ShieldCheck,
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
  const pathname = usePathname() || '/';
  const { user, isModerator } = useAuth();
  const [status, setStatus] = useState<SystemMaintenanceStatus | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  const isAdminRoute =
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname === '/moderation' ||
    pathname.startsWith('/moderation/');

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/system/maintenance?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          Pragma: 'no-cache',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
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

    const interval = setInterval(fetchStatus, 8000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchStatus();
      }
    };

    const handleCustomEvent = () => {
      fetchStatus();
    };

    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('lougara-maintenance-updated', handleCustomEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('lougara-maintenance-updated', handleCustomEvent);
    };
  }, [fetchStatus, pathname]);

  const handleRestartSite = async () => {
    if (!isModerator || !user?.email) return;
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
        window.dispatchEvent(new CustomEvent('lougara-maintenance-updated'));
      }
    } catch {
      // Erreur réseau silencieuse
    } finally {
      setIsToggling(false);
    }
  };

  if (!mounted) {
    return null;
  }

  const isUnderMaintenance = Boolean(status?.isMaintenanceActive);

  // 1. Espace /admin pendant la maintenance : l'espace d'administration reste accessible aux rôles moderator & super_admin (et page /admin/login)
  if (isUnderMaintenance && isAdminRoute) {
    if (!isModerator) return null;
    return (
      <div className="sticky top-0 z-[999999] bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-sans px-4 py-2.5 shadow-2xl border-b-2 border-amber-600 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-700"></span>
          </span>
          <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider text-slate-950">
            <ShieldAlert className="w-4 h-4 text-slate-950" />
            <span>SITE PUBLIC EN MAINTENANCE (Console /admin active)</span>
          </div>
          <span className="hidden md:inline-block text-xs font-medium text-slate-900 border-l border-amber-600/40 pl-2">
            Toutes les routes publiques affichent actuellement la page de maintenance.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRestartSite}
            disabled={isToggling}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-950 text-amber-400 font-bold text-xs hover:bg-slate-900 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Power className={`w-3.5 h-3.5 ${isToggling ? 'animate-spin' : ''}`} />
            {isToggling ? 'Remise en service...' : 'Remettre en service le site public'}
          </button>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-slate-950 font-bold text-xs transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Console Admin</span>
          </Link>
        </div>
      </div>
    );
  }

  // 2. Site public en mode maintenance : bloque et masque intégralement le contenu public, les produits, les données utilisateurs et toute fonctionnalité admin
  if (isUnderMaintenance && !isAdminRoute) {
    return (
      <div className="fixed inset-0 z-[999999] bg-[#070D1E] overflow-y-auto flex flex-col items-center justify-center p-4 sm:p-6 text-slate-100 select-none">
        <style>{`
          body > header, body > main, body > footer {
            display: none !important;
            visibility: hidden !important;
            pointer-events: none !important;
          }
        `}</style>

        {/* Halo d'ambiance doré & ambré cohérent avec le design Lougara */}
        <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-2xl w-full mx-auto space-y-8 my-auto py-8">
          {/* Logo Lougara */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#D4AF37] via-[#E5A93C] to-[#B8860B] flex items-center justify-center text-slate-950 font-black text-4xl shadow-[0_0_40px_rgba(212,175,55,0.45)] border-2 border-amber-200/60">
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

          {/* CARTE PRINCIPALE DE MAINTENANCE PUBLIQUE (sans information technique sensible) */}
          <div className="glass-card gold-glow-border p-8 sm:p-10 rounded-3xl bg-slate-900/80 backdrop-blur-xl border-2 border-amber-500/40 shadow-2xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs uppercase tracking-wider">
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>Maintenance Programmée</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Site temporairement en{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500">
                  Maintenance
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto leading-relaxed">
                {status?.message ||
                  "Nous effectuons actuellement une opération de maintenance sur la plateforme Lougara afin d'améliorer la qualité de nos services B2B. L'accès public sera rétabli très prochainement."}
              </p>
            </div>

            {/* Indicateurs rassurants non techniques */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-center gap-2 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Protection des données : <strong className="text-white">Intégrité garantie</strong>
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-center gap-2 text-slate-300">
                <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
                <span>
                  Disponibilité : <strong className="text-emerald-400">Retour imminent</strong>
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 border-t border-slate-800/80 pt-4">
              Vos comptes, demandes de devis et catalogues B2B sont intégralement conservés en sécurité.
              Merci de votre compréhension.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
