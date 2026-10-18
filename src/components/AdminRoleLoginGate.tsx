'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Lock,
  ShieldCheck,
  CheckCircle2,
  ShieldAlert,
  KeyRound,
  Eye,
  EyeOff,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export type AdminRoleChoice = 'moderator' | 'super_admin';

interface AdminRoleLoginGateProps {
  /** Rôle pré-sélectionné par défaut (moderator ou super_admin) */
  defaultRole?: AdminRoleChoice;
  /** Redirection optionnelle après connexion réussie */
  redirectTo?: string;
  /** Titre personnalisé optionnel */
  subtitle?: string;
  /** Callback appelé dès que l'authentification réussit */
  onAuthenticated?: () => void;
  /** Callback pour fermer le sélecteur si l'admin était déjà connecté */
  onCancelSwitch?: () => void;
}

export function AdminRoleLoginGate({
  defaultRole = 'moderator',
  redirectTo,
  subtitle,
  onAuthenticated,
  onCancelSwitch,
}: AdminRoleLoginGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { loginWithPassword, user, isModerator } = useAuth();

  const [selectedRole, setSelectedRole] = useState<AdminRoleChoice>(defaultRole);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleSelectRole = (role: AdminRoleChoice) => {
    setSelectedRole(role);
    setErrorNotice(null);
    setSuccessNotice(null);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);
    setSuccessNotice(null);

    if (!passwordInput.trim()) {
      setErrorNotice(
        selectedRole === 'super_admin'
          ? 'Veuillez saisir le mot de passe du profil Super Admin (super_admin).'
          : 'Veuillez saisir le mot de passe du profil Modérateur (moderator).'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await loginWithPassword(selectedRole, passwordInput, true);

      if (!result.success) {
        setErrorNotice(
          result.error ||
            `Mot de passe incorrect pour le profil ${
              selectedRole === 'super_admin' ? 'Super Admin (super_admin)' : 'Modérateur (moderator)'
            }.`
        );
        return;
      }

      setPasswordInput('');
      setSuccessNotice(
        `Connexion validée en tant que ${
          selectedRole === 'super_admin' ? 'Super Admin (super_admin)' : 'Modérateur (moderator)'
        }. Ouverture de l'espace Admin...`
      );

      if (onAuthenticated) {
        setTimeout(() => {
          onAuthenticated();
        }, 300);
      }

      if (redirectTo || pathname === '/admin/login') {
        setTimeout(() => {
          router.push(redirectTo || '/admin');
        }, 400);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-xl mx-auto w-full space-y-6">
        {/* EN-TÊTE PORTAIL ADMIN */}
        <div className="glass-card gold-glow-border p-6 sm:p-7 rounded-3xl text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#E5A93C] to-[#B8860B] text-slate-950 flex items-center justify-center font-black mx-auto shadow-[0_0_25px_rgba(212,175,55,0.4)]">
            <Lock className="w-7 h-7 text-slate-950" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40">
              Espace Administration &bull; lougara.com/admin
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">
              Choisissez votre mode de connexion Admin
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto leading-relaxed">
              {subtitle ||
                'Sélectionnez l’un des deux profils d’administration habilités (moderator ou super_admin) puis saisissez votre mot de passe.'}
            </p>
          </div>
        </div>

        {/* MESSAGES D'ERREUR OU DE SUCCÈS */}
        {errorNotice && (
          <div className="p-4 rounded-2xl bg-rose-950/90 border border-rose-500/40 text-rose-200 text-xs font-bold space-y-1">
            <div className="flex items-center gap-2 text-rose-300">
              <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400" />
              <span className="font-extrabold uppercase">Authentification refusée</span>
            </div>
            <p className="leading-relaxed text-slate-200">{errorNotice}</p>
          </div>
        )}

        {successNotice && (
          <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* CARTE PRINCIPALE AVEC LES 2 CHOIX DE CONNEXION : MODERATOR & SUPER_ADMIN */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/30 space-y-6 shadow-2xl">
          <div className="space-y-2.5">
            <label className="block text-xs font-black uppercase tracking-wider text-amber-300 text-center">
              1. Sélectionnez votre profil de connexion (2 choix disponibles)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {/* CHOIX 1 : MODERATOR */}
              <button
                type="button"
                onClick={() => handleSelectRole('moderator')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  selectedRole === 'moderator'
                    ? 'bg-amber-500/15 border-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.25)]'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      selectedRole === 'moderator'
                        ? 'bg-[#D4AF37] text-slate-950'
                        : 'bg-slate-800 text-amber-400'
                    }`}
                  >
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full border ${
                      selectedRole === 'moderator'
                        ? 'bg-amber-950 text-amber-300 border-amber-400/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    moderator
                  </span>
                </div>

                <div>
                  <h2 className="text-base font-black text-white">Modérateur</h2>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                    Validation des mots de passe clients, audits KYB & suivi des virements.
                  </p>
                </div>
              </button>

              {/* CHOIX 2 : SUPER_ADMIN */}
              <button
                type="button"
                onClick={() => handleSelectRole('super_admin')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  selectedRole === 'super_admin'
                    ? 'bg-emerald-500/15 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.25)]'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      selectedRole === 'super_admin'
                        ? 'bg-emerald-400 text-slate-950'
                        : 'bg-slate-800 text-emerald-400'
                    }`}
                  >
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full border ${
                      selectedRole === 'super_admin'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-400/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    super_admin
                  </span>
                </div>

                <div>
                  <h2 className="text-base font-black text-white">Super Admin</h2>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                    Accès intégral : validation mots de passe, KYB, mode maintenance & paramètres.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* FORMULAIRE MOT DE PASSE POUR LE CHOIX SÉLECTIONNÉ */}
          <form onSubmit={handleAdminLogin} className="space-y-4 pt-2 border-t border-slate-800/80">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                2. Mot de passe pour{' '}
                <span
                  className={
                    selectedRole === 'super_admin'
                      ? 'text-emerald-300 font-black'
                      : 'text-amber-300 font-black'
                  }
                >
                  {selectedRole === 'super_admin'
                    ? 'Super Admin (super_admin)'
                    : 'Modérateur (moderator)'}
                </span>{' '}
                *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder={`Saisissez le mot de passe ${selectedRole}...`}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 rounded-xl text-xs font-black text-slate-950 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer ${
                selectedRole === 'super_admin'
                  ? 'bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 hover:opacity-95'
                  : 'bg-gradient-to-r from-[#D4AF37] via-[#E5A93C] to-[#B8860B] hover:from-[#E5A93C] hover:to-[#D4AF37]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-slate-950" />
              <span>
                {isSubmitting
                  ? 'Vérification du mot de passe...'
                  : selectedRole === 'super_admin'
                  ? 'Se connecter en Super Admin (super_admin)'
                  : 'Se connecter en Modérateur (moderator)'}
              </span>
            </button>
          </form>

          {isModerator && user && (
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2 text-xs">
              <span className="text-slate-300">
                Session active : <strong className="text-amber-300">{user.role}</strong>
              </span>
              {onCancelSwitch ? (
                <button
                  type="button"
                  onClick={onCancelSwitch}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 font-bold hover:bg-amber-500/30 transition-colors cursor-pointer"
                >
                  Continuer avec {user.role} &rarr;
                </button>
              ) : (
                <Link
                  href="/admin"
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 font-bold hover:bg-amber-500/30 transition-colors"
                >
                  Aller au tableau de bord &rarr;
                </Link>
              )}
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 text-center">
            <Link
              href="/"
              className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              &larr; Retour au site public (lougara.com)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
