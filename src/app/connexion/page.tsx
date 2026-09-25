'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ShieldCheck, UserCheck, ArrowRight, Sparkles, Building2, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth, MODERATOR_EMAILS, SUPER_ADMIN_EMAIL } from '@/context/AuthContext';

export default function ConnexionPage() {
  const router = useRouter();
  const { user, login, logout, isModerator } = useAuth();
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);
    setSuccessNotice(null);

    if (!emailInput.trim()) {
      setErrorNotice('Veuillez saisir une adresse e-mail valide.');
      return;
    }

    const cleanEmail = emailInput.trim().toLowerCase();
    await login(cleanEmail);

    if (MODERATOR_EMAILS.includes(cleanEmail)) {
      setSuccessNotice(`Connexion réussie en tant que Modérateur avec ${cleanEmail}. Redirection vers l'Espace Modérateur...`);
      setTimeout(() => {
        router.push('/moderation');
      }, 1200);
    } else {
      setSuccessNotice(`Bienvenue ! Vous êtes connecté sous ${cleanEmail}.`);
    }
  };

  const handleQuickLogin = async (email: string) => {
    setEmailInput(email);
    await login(email);
    if (MODERATOR_EMAILS.includes(email.toLowerCase())) {
      setSuccessNotice(`Accréditations modérateur validées pour ${email}. Redirection...`);
      setTimeout(() => {
        router.push('/moderation');
      }, 1000);
    } else {
      setSuccessNotice(`Bienvenue ! Connecté sous ${email}.`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="max-w-md mx-auto space-y-8">
        {/* HEADER */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#E5A93C] to-[#B8860B] flex items-center justify-center text-slate-950 font-black text-3xl mx-auto shadow-[0_0_25px_rgba(212,175,55,0.4)] border border-amber-200/50">
            L
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Connexion & Accès</h1>
          <p className="text-xs text-slate-400">
            Connectez-vous à votre espace Entrepreneur, Fournisseur ou Modérateur LOUGARA.
          </p>
        </div>

        {/* LOGGED IN CARD */}
        {user ? (
          <div className="glass-card gold-glow-border p-6 rounded-3xl space-y-5 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Vous êtes actuellement connecté</h2>
              <p className="text-sm text-amber-300 font-bold mt-1">{user.email}</p>
              <p className="text-xs text-slate-400 mt-0.5 uppercase tracking-wider font-mono">
                Rôle : {user.role}
              </p>
            </div>

            {isModerator && (
              <div className="p-3 bg-amber-950/60 rounded-2xl border border-amber-500/40 text-xs text-amber-200 font-bold space-y-2">
                <p>✨ Votre compte dispose d&apos;un accès complet à l&apos;Espace Modérateur.</p>
                <Link
                  href="/moderation"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] shadow-md"
                >
                  <Lock className="w-4 h-4 text-slate-950" />
                  Accéder à l&apos;Espace Modérateur
                </Link>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={logout}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-300 bg-slate-900 border border-slate-700 transition-colors"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        ) : (
          /* LOGIN FORM */
          <div className="glass-card gold-glow-border p-8 rounded-3xl space-y-6 shadow-2xl">
            {errorNotice && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorNotice}</span>
              </div>
            )}

            {successNotice && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successNotice}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Adresse E-mail *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="votre-email@exemple.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Mot de passe</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] via-[#E5A93C] to-[#B8860B] hover:from-[#E5A93C] hover:to-[#D4AF37] transition-all shadow-md"
              >
                Se Connecter
              </button>
            </form>

            {/* QUICK ACCESS FOR AUTHORIZED MODERATOR ACCOUNTS */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#E5A93C] block text-center">
                Accès Rapide Comptes Modérateurs Agréés :
              </span>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('asherilla4@gmail.com')}
                  className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    asherilla4@gmail.com
                  </span>
                  <span className="text-[10px] bg-amber-950 px-2 py-0.5 rounded text-amber-300 border border-amber-500/30">
                    Modérateur
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('champagcrypt@gmail.com')}
                  className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/40 flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    champagcrypt@gmail.com
                  </span>
                  <span className="text-[10px] bg-emerald-950 px-2 py-0.5 rounded text-emerald-300 border border-emerald-500/30">
                    Super Admin
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
