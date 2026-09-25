'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ShieldCheck, AlertTriangle, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAuth, MODERATOR_EMAILS } from '@/context/AuthContext';

export default function ModerationLoginPage() {
  const router = useRouter();
  const { login, isModerator } = useAuth();
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleModeratorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);
    setSuccessNotice(null);

    const cleanEmail = emailInput.trim().toLowerCase();

    if (!MODERATOR_EMAILS.includes(cleanEmail)) {
      setErrorNotice(
        "Accès Refusé : Seules les adresses e-mail modérateurs autorisées (asherilla4@gmail.com, champagcrypt@gmail.com) possèdent les droits d'accès à cette console de modération."
      );
      return;
    }

    await login(cleanEmail);
    setSuccessNotice(`Identifiants Modérateur confirmés pour ${cleanEmail}. Redirection vers la console...`);
    setTimeout(() => {
      router.push('/moderation');
    }, 1000);
  };

  const handleDirectAccess = async (email: string) => {
    setEmailInput(email);
    await login(email);
    setSuccessNotice(`Accréditations modérateur validées pour ${email}. Redirection...`);
    setTimeout(() => {
      router.push('/moderation');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 space-y-8 flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full space-y-6">
        {/* BANDEAU ACCRÉDITATIONS RESTREINTES */}
        <div className="glass-card gold-glow-border p-6 rounded-3xl text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-slate-950 flex items-center justify-center font-black mx-auto shadow-[0_0_25px_rgba(212,175,55,0.4)]">
            <Lock className="w-7 h-7 text-slate-950" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
              Console d&apos;Audit & Modération
            </span>
            <h1 className="text-2xl font-black text-white mt-2">Portail d&apos;Accès Modérateur</h1>
            <p className="text-xs text-slate-400 mt-1">
              Réservé exclusivement aux administrateurs & modérateurs autorisés.
            </p>
          </div>
        </div>

        {errorNotice && (
          <div className="p-4 rounded-2xl bg-rose-950/90 border border-rose-500/40 text-rose-200 text-xs font-bold space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 text-rose-300">
              <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400" />
              <span className="font-extrabold uppercase">Accès Non Autorisé</span>
            </div>
            <p className="leading-relaxed text-slate-300">{errorNotice}</p>
          </div>
        )}

        {successNotice && (
          <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        <div className="glass-card p-8 rounded-3xl border border-[#D4AF37]/30 space-y-6 shadow-2xl">
          <form onSubmit={handleModeratorLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">E-mail Modérateur Habilité *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="asherilla4@gmail.com ou champagcrypt@gmail.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Clé de Sécurité / Mot de Passe</label>
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
              className="w-full py-3.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] via-[#E5A93C] to-[#B8860B] hover:from-[#E5A93C] hover:to-[#D4AF37] transition-all shadow-md flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-slate-950" />
              <span>Valider les Accréditations Modérateur</span>
            </button>
          </form>

          {/* ACCÈS DIRECT BOUTONS */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-400 block text-center">
              Comptes modérateurs habilités sur la plateforme :
            </span>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleDirectAccess('asherilla4@gmail.com')}
                className="w-full px-3.5 py-2 rounded-xl text-xs font-extrabold bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 flex items-center justify-between transition-all"
              >
                <span>asherilla4@gmail.com</span>
                <span className="text-[10px] bg-amber-950 px-2 py-0.5 rounded text-amber-300 font-mono">
                  Rôle: Moderator
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDirectAccess('champagcrypt@gmail.com')}
                className="w-full px-3.5 py-2 rounded-xl text-xs font-extrabold bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/40 flex items-center justify-between transition-all"
              >
                <span>champagcrypt@gmail.com</span>
                <span className="text-[10px] bg-emerald-950 px-2 py-0.5 rounded text-emerald-300 font-mono">
                  Rôle: Super Admin
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
