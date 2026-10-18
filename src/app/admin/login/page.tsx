'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ShieldCheck, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginWithPassword } = useAuth();
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);
    setSuccessNotice(null);
    setIsSubmitting(true);

    try {
      const result = await loginWithPassword(emailInput, passwordInput, true);

      if (!result.success) {
        setErrorNotice(
          result.error || 'Accès refusé. Veuillez vérifier vos identifiants et votre mot de passe.'
        );
        return;
      }

      setSuccessNotice('Authentification validée. Redirection vers l’espace d’administration...');
      setTimeout(() => {
        router.push('/admin');
      }, 600);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full space-y-6">
        <div className="glass-card gold-glow-border p-6 rounded-3xl text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-slate-950 flex items-center justify-center font-black mx-auto shadow-[0_0_25px_rgba(212,175,55,0.4)]">
            <Lock className="w-7 h-7 text-slate-950" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
              Administration Sécurisée
            </span>
            <h1 className="text-2xl font-black text-white mt-2">Portail Administration</h1>
            <p className="text-xs text-slate-400 mt-1">
              Accès strictement réservé aux rôles autorisés.
            </p>
          </div>
        </div>

        {errorNotice && (
          <div className="p-4 rounded-2xl bg-rose-950/90 border border-rose-500/40 text-rose-200 text-xs font-bold space-y-1">
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

        <div className="glass-card p-8 rounded-3xl border border-[#D4AF37]/30 space-y-6 shadow-2xl">
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Adresse e-mail administrateur *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="identifiant@domaine.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Mot de passe administrateur *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] via-[#E5A93C] to-[#B8860B] hover:from-[#E5A93C] hover:to-[#D4AF37] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-slate-950" />
              <span>{isSubmitting ? 'Vérification...' : 'Se connecter à l’espace Admin'}</span>
            </button>
          </form>

          <div className="pt-3 border-t border-slate-800 text-center">
            <Link
              href="/"
              className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              &larr; Retour au site public
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
