'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Lock,
  Mail,
  ShieldCheck,
  Building2,
  User,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function ConnexionPage() {
  const { user, loginWithPassword, logout } = useAuth();
  const { t, locale } = useLanguage();

  const [mode, setMode] = useState<'login' | 'register_password'>('login');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [companyNameInput, setCompanyNameInput] = useState('');
  const [accountType, setAccountType] = useState<'entrepreneur' | 'supplier'>('entrepreneur');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);
    setSuccessNotice(null);

    if (!emailInput.trim() || !passwordInput) {
      setErrorNotice(
        locale === 'fr'
          ? 'Veuillez saisir votre adresse e-mail et votre mot de passe.'
          : 'Please enter your email address and password.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanEmail = emailInput.trim().toLowerCase();
      const result = await loginWithPassword(cleanEmail, passwordInput);

      if (!result.success) {
        setErrorNotice(
          result.error ||
            (locale === 'fr' ? 'Identifiants invalides.' : 'Invalid credentials.')
        );
        return;
      }

      setPasswordInput('');
      setSuccessNotice(
        locale === 'fr'
          ? `Bienvenue ! Vous êtes connecté en toute sécurité sous ${cleanEmail}.`
          : `Welcome! You are securely signed in as ${cleanEmail}.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);
    setSuccessNotice(null);

    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorNotice('Veuillez renseigner votre adresse e-mail professionnelle.');
      return;
    }
    if (!passwordInput || passwordInput.trim().length < 6) {
      setErrorNotice('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (passwordInput !== confirmPasswordInput) {
      setErrorNotice('La confirmation du mot de passe ne correspond pas.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/password-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password: passwordInput,
          name: nameInput.trim(),
          companyName: companyNameInput.trim(),
          role: accountType,
          requestType: 'INITIAL_CREATION',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorNotice(data.error || 'Erreur lors de la demande de validation du mot de passe.');
        return;
      }

      setPasswordInput('');
      setConfirmPasswordInput('');
      setSuccessNotice(
        data.message ||
          'Votre mot de passe chiffré a été transmis pour validation de sécurité. Il sera actif dès validation.'
      );
      setMode('login');
    } catch {
      setErrorNotice('Erreur réseau lors de la soumission sécurisée.');
    } finally {
      setIsSubmitting(false);
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
          <h1 className="text-3xl font-black text-white tracking-tight">{t.connexion.title}</h1>
          <p className="text-xs text-slate-400">{t.connexion.subtitle}</p>
        </div>

        {/* LOGGED IN CARD */}
        {user ? (
          <div className="glass-card gold-glow-border p-6 rounded-3xl space-y-5 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">
                {locale === 'fr' ? 'Session active et sécurisée' : 'Active & secure session'}
              </h2>
              <p className="text-sm text-amber-300 font-bold mt-1">{user.email}</p>
              {user.companyName && (
                <p className="text-xs text-slate-300 mt-0.5">{user.companyName}</p>
              )}
              <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider font-mono">
                {locale === 'fr' ? 'Profil :' : 'Profile:'}{' '}
                {user.role === 'supplier'
                  ? 'Fournisseur B2B'
                  : user.role === 'entrepreneur'
                  ? 'Entrepreneur / Acheteur'
                  : 'Compte vérifié'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <Link
                href="/fournisseurs"
                className="py-2.5 px-4 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] hover:opacity-95 transition-all"
              >
                {locale === 'fr' ? 'Accéder au Catalogue' : 'Browse Catalog'}
              </Link>
              <button
                onClick={logout}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-300 hover:text-rose-300 bg-slate-900 border border-slate-700 transition-colors cursor-pointer"
              >
                {t.nav.logout}
              </button>
            </div>
          </div>
        ) : (
          /* FORMULAIRE CLIENT SÉCURISÉ */
          <div className="glass-card gold-glow-border p-7 sm:p-8 rounded-3xl space-y-6 shadow-2xl">
            {/* Sélecteur Connexion / Définir Mot de Passe Client */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-950/90 border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorNotice(null);
                  setSuccessNotice(null);
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'login'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Connexion</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register_password');
                  setErrorNotice(null);
                  setSuccessNotice(null);
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'register_password'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Activer Mot de Passe</span>
              </button>
            </div>

            {errorNotice && (
              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{errorNotice}</span>
              </div>
            )}

            {successNotice && (
              <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>{successNotice}</span>
              </div>
            )}

            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {t.connexion.emailLabel} *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="contact@entreprise.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {locale === 'fr' ? 'Mot de passe sécurisé *' : 'Secure password *'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
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
                  className="w-full py-3.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] via-[#E5A93C] to-[#B8860B] hover:from-[#E5A93C] hover:to-[#D4AF37] transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Vérification sécurisée...' : t.connexion.submitBtn}
                </button>

                <div className="pt-3 border-t border-slate-800/80 text-center">
                  <p className="text-[11px] text-slate-400">
                    Première connexion ou mot de passe oublié ?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('register_password')}
                      className="text-amber-400 font-bold hover:underline cursor-pointer"
                    >
                      Créer ou réinitialiser mon mot de passe
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={handlePasswordRequestSubmit} className="space-y-4">
                <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/30 text-[11px] text-slate-300 leading-relaxed flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Pour protéger les données de nos clients B2B, chaque création ou modification de mot de passe est chiffrée (scrypt) et soumise à validation de sécurité.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAccountType('entrepreneur')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      accountType === 'entrepreneur'
                        ? 'bg-amber-500/15 border-amber-400 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Entrepreneur / Acheteur
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('supplier')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      accountType === 'supplier'
                        ? 'bg-amber-500/15 border-amber-400 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Fournisseur B2B
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    E-mail professionnel inscrit *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="contact@entreprise.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Nom complet *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="Prénom Nom"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Société *
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="Raison sociale"
                        value={companyNameInput}
                        onChange={(e) => setCompanyNameInput(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nouveau mot de passe (min. 6 caractères) *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Confirmer le mot de passe *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] via-[#E5A93C] to-[#B8860B] hover:from-[#E5A93C] hover:to-[#D4AF37] transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting
                    ? 'Chiffrement & Envoi...'
                    : 'Soumettre mon mot de passe pour validation'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
