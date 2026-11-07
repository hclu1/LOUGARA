'use client';

import React, { useState, useEffect } from 'react';
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
  UserPlus,
  Globe,
  Sparkles,
  Package,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function ConnexionPage() {
  const { user, loginWithPassword, changePassword, logout } = useAuth();
  const { t, locale } = useLanguage();

  // Mode principal : 'login' (Connexion) | 'register' (S'inscrire) | 'register_password' (Activer mot de passe) | 'forgot_password' (Mot de passe oublié)
  const [mode, setMode] = useState<'login' | 'register' | 'register_password' | 'forgot_password'>('login');

  // Champs de saisie (initialisés strictement vides, sans pré-remplissage)
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [companyNameInput, setCompanyNameInput] = useState('');
  const [countryInput, setCountryInput] = useState('France');
  const [accountType, setAccountType] = useState<'entrepreneur' | 'supplier'>('entrepreneur');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Première connexion : changement de mot de passe obligatoire
  const [firstLoginNewPassword, setFirstLoginNewPassword] = useState('');
  const [firstLoginConfirmPassword, setFirstLoginConfirmPassword] = useState('');
  const [showFirstLoginPass, setShowFirstLoginPass] = useState(false);

  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Sélection rapide d'un catalogue client pour afficher automatiquement son e-mail
  const [catalogOptions, setCatalogOptions] = useState<
    Array<{ id: string; companyName: string; email: string }>
  >([]);
  const [selectedCatalogCompany, setSelectedCatalogCompany] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const qEmail = params.get('email');
      const qCompany = params.get('company');
      const qName = params.get('name');
      const qMode = params.get('mode');

      if (qEmail) {
        setEmailInput(qEmail.trim().toLowerCase());
      }
      if (qCompany) {
        setCompanyNameInput(qCompany.trim());
        setSelectedCatalogCompany(qCompany.trim());
      }
      if (qName) {
        setNameInput(qName.trim());
      }
      if (qMode === 'register_password' || qMode === 'create_password') {
        setMode('register_password');
        setAccountType('supplier');
      }
    }

    fetch(`/api/suppliers?_t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.suppliers && Array.isArray(data.suppliers)) {
          const mapped = data.suppliers
            .filter((s: any) => s.isPublished !== false)
            .map((s: any) => ({
              id: s.id,
              companyName: s.companyName,
              email: (
                s.user?.email ||
                s.email ||
                `contact@${String(s.companyName || 'entreprise').toLowerCase().replace(/[^a-z0-9]/g, '')}.fr`
              )
                .trim()
                .toLowerCase(),
            }));
          setCatalogOptions(mapped);
        }
      })
      .catch(() => {});
  }, []);

  // Soumission Connexion
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);
    setSuccessNotice(null);

    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !passwordInput) {
      setErrorNotice(
        locale === 'fr'
          ? 'Veuillez saisir votre adresse e-mail professionnelle et votre mot de passe.'
          : 'Please enter your professional email address and password.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
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

  // Soumission Première Connexion : Changement de mot de passe obligatoire
  const handleFirstLoginChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);
    setSuccessNotice(null);

    if (!firstLoginNewPassword || firstLoginNewPassword.trim().length < 8) {
      setErrorNotice('Le nouveau mot de passe doit comporter au moins 8 caractères.');
      return;
    }
    if (firstLoginNewPassword !== firstLoginConfirmPassword) {
      setErrorNotice('La confirmation du nouveau mot de passe ne correspond pas.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await changePassword(firstLoginNewPassword);
      if (!res.success) {
        setErrorNotice(res.error || 'Erreur lors de la mise à jour de votre mot de passe personnel.');
        return;
      }
      setSuccessNotice(
        'Votre mot de passe personnel a été enregistré avec succès ! L’ancien mot de passe fourni a été définitivement désactivé.'
      );
      setFirstLoginNewPassword('');
      setFirstLoginConfirmPassword('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Soumission Mot de passe oublié
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);
    setSuccessNotice(null);

    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorNotice('Veuillez saisir votre adresse e-mail professionnelle.');
      return;
    }
    if (!passwordInput || passwordInput.trim().length < 8) {
      setErrorNotice('Veuillez saisir le nouveau mot de passe souhaité (minimum 8 caractères).');
      return;
    }
    if (passwordInput !== confirmPasswordInput) {
      setErrorNotice('La confirmation du nouveau mot de passe ne correspond pas.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, newPassword: passwordInput }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorNotice(data.error || 'Erreur lors de la prise en compte de la demande.');
        return;
      }
      setSuccessNotice(data.message);
      setPasswordInput('');
      setConfirmPasswordInput('');
    } catch {
      setErrorNotice('Erreur réseau lors de la soumission de la demande.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Soumission Inscription directe d'un nouveau compte
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);
    setSuccessNotice(null);

    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorNotice('Veuillez renseigner une adresse e-mail professionnelle valide.');
      return;
    }
    if (!nameInput.trim()) {
      setErrorNotice('Veuillez renseigner le nom complet du responsable.');
      return;
    }
    if (!companyNameInput.trim()) {
      setErrorNotice('Veuillez renseigner la raison sociale de votre entreprise.');
      return;
    }
    if (!passwordInput || passwordInput.trim().length < 6) {
      setErrorNotice('Le mot de passe sécurisé doit contenir au moins 6 caractères.');
      return;
    }
    if (passwordInput !== confirmPasswordInput) {
      setErrorNotice('La confirmation du mot de passe ne correspond pas.');
      return;
    }
    if (!acceptedTerms) {
      setErrorNotice('Veuillez accepter les conditions et prendre connaissance des Mentions Légales.');
      return;
    }

    setIsSubmitting(true);
    try {
      let res: Response;

      if (accountType === 'entrepreneur') {
        res = await fetch('/api/entrepreneurs/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyName: companyNameInput.trim(),
            contactName: nameInput.trim(),
            email: cleanEmail,
            password: passwordInput,
            country: countryInput.trim() || 'France',
            plan: 'Standard',
            need: 'Sourcing B2B & Approvisionnement',
          }),
        });
      } else {
        res = await fetch('/api/suppliers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyName: companyNameInput.trim(),
            contactName: nameInput.trim(),
            email: cleanEmail,
            password: passwordInput,
            country: countryInput.trim() || 'Sénégal',
            sector: 'Commerce B2B',
            description: `Fournisseur B2B inscrit via le portail Lougara (${companyNameInput.trim()})`,
            isKybApproved: false,
          }),
        });
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok || (data.success === false)) {
        setErrorNotice(
          data.error ||
            data.message ||
            'Erreur lors de la création de votre compte. Veuillez réessayer.'
        );
        return;
      }

      // Tentative de connexion automatique avec les identifiants créés
      const loginAttempt = await loginWithPassword(cleanEmail, passwordInput);

      setPasswordInput('');
      setConfirmPasswordInput('');

      if (loginAttempt.success) {
        setSuccessNotice(
          `Inscription réussie ! Votre compte ${
            accountType === 'supplier' ? 'Fournisseur' : 'Entrepreneur'
          } est créé et vous êtes désormais connecté.`
        );
      } else {
        setSuccessNotice(
          `Inscription validée avec succès ! Votre compte ${
            accountType === 'supplier' ? 'Fournisseur' : 'Entrepreneur'
          } est enregistré. Vous pouvez dès à présent vous connecter.`
        );
        setMode('login');
      }
    } catch {
      setErrorNotice('Erreur réseau lors de la création de votre compte professionnel.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Soumission Activation / Réinitialisation du mot de passe
  const handlePasswordRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);
    setSuccessNotice(null);

    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
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
          country: countryInput.trim() || 'France',
          role: accountType,
          requestType: 'CLIENT_REGISTRATION',
          activateImmediately: true,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setErrorNotice(data.error || 'Erreur lors de la création du mot de passe.');
        return;
      }

      const pwdToLogin = passwordInput;
      setPasswordInput('');
      setConfirmPasswordInput('');

      const loginAttempt = await loginWithPassword(cleanEmail, pwdToLogin);
      if (loginAttempt.success) {
        setSuccessNotice(
          `Votre mot de passe a été créé avec succès et vous êtes désormais connecté sous ${cleanEmail} !`
        );
      } else {
        setSuccessNotice(
          data.message ||
            'Votre mot de passe a été enregistré avec succès. Vous pouvez maintenant vous connecter.'
        );
        setMode('login');
      }
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
          <h1 className="text-3xl font-black text-white tracking-tight">
            {mode === 'register'
              ? 'Créer mon compte Lougara'
              : mode === 'register_password'
              ? 'Activer mon mot de passe'
              : t.connexion.title}
          </h1>
          <p className="text-xs text-slate-400">
            {mode === 'register'
              ? 'Rejoignez le réseau B2B vérifié Afrique — Europe'
              : t.connexion.subtitle}
          </p>
        </div>

        {/* LOGGED IN CARD */}
        {user ? (
          user.mustChangePassword ? (
            /* PREMIÈRE CONNEXION : CHANGEMENT DE MOT DE PASSE OBLIGATOIRE */
            <div className="glass-card border-2 border-amber-500/70 p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl animate-in fade-in duration-300">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto">
                <KeyRound className="w-7 h-7" />
              </div>
              <div className="text-center space-y-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Première Connexion Requise
                </span>
                <h2 className="text-xl font-black text-white">
                  Définissez votre mot de passe personnel
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                  Par mesure de sécurité, le mot de passe initial fourni doit être remplacé. Il sera immédiatement désactivé dès la validation de votre nouveau mot de passe personnel.
                </p>
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

              <form onSubmit={handleFirstLoginChange} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nouveau mot de passe personnel *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showFirstLoginPass ? 'text' : 'password'}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      placeholder="Minimum 8 caractères"
                      value={firstLoginNewPassword}
                      onChange={(e) => setFirstLoginNewPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowFirstLoginPass((prev) => !prev)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showFirstLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Confirmez votre nouveau mot de passe *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showFirstLoginPass ? 'text' : 'password'}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      placeholder="Retapez le mot de passe identique"
                      value={firstLoginConfirmPassword}
                      onChange={(e) => setFirstLoginConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="font-bold text-slate-300">Critères de sécurité requis :</div>
                  <div className="flex items-center gap-1.5">
                    <span className={firstLoginNewPassword.length >= 8 ? 'text-emerald-400' : 'text-slate-500'}>
                      {firstLoginNewPassword.length >= 8 ? '✓' : '○'} Au moins 8 caractères
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={firstLoginNewPassword && firstLoginNewPassword === firstLoginConfirmPassword ? 'text-emerald-400' : 'text-slate-500'}>
                      {firstLoginNewPassword && firstLoginNewPassword === firstLoginConfirmPassword ? '✓' : '○'} Mots de passe identiques
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] via-[#E5A93C] to-[#B8860B] hover:opacity-95 transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Enregistrement sécurisé...' : 'Valider et désactiver le mot de passe initial'}
                </button>
              </form>
            </div>
          ) : (
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

              <div className="space-y-2.5 pt-2">
                <Link
                  href="/mon-catalogue"
                  className="w-full py-3 px-4 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] via-[#E5A93C] to-[#B8860B] hover:opacity-95 transition-all text-center flex items-center justify-center gap-2 shadow-lg"
                >
                  <Package className="w-4 h-4" />
                  <span>Gérer ma Vitrine & Mon Catalogue B2B</span>
                </Link>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <Link
                    href="/catalogue"
                    className="py-2.5 px-4 rounded-xl text-xs font-black text-slate-200 bg-slate-900 border border-slate-700 hover:border-amber-400/60 transition-all text-center"
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
            </div>
          )
        ) : (
          /* FORMULAIRE SÉCURISÉ CLIENT : CONNEXION / INSCRIPTION */
          <div className="glass-card gold-glow-border p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl">
            {/* ONGLETS PRINCIPAUX : CONNEXION / S'INSCRIRE */}
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
                  setMode('register');
                  setErrorNotice(null);
                  setSuccessNotice(null);
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'register'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>S&apos;inscrire</span>
              </button>
            </div>

            {/* NOTICES ERREUR / SUCCÈS */}
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

            {/* CAS 1 : FORMULAIRE DE CONNEXION */}
            {mode === 'login' && (
              <form
                onSubmit={handleLoginSubmit}
                autoComplete="off"
                className="space-y-4"
              >
                {/* Champs factices pour bloquer le pré-remplissage automatique des navigateurs */}
                <input
                  type="text"
                  name="fake_username_remember"
                  tabIndex={-1}
                  style={{ display: 'none' }}
                  aria-hidden="true"
                  autoComplete="off"
                />
                <input
                  type="password"
                  name="fake_password_remember"
                  tabIndex={-1}
                  style={{ display: 'none' }}
                  aria-hidden="true"
                  autoComplete="off"
                />

                {/* Sélecteur rapide de Catalogue Client : affiche automatiquement l'e-mail du client */}
                {catalogOptions.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-[#D4AF37]/30 space-y-2">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-[#E5A93C]">
                      Accès rapide par Catalogue Client :
                    </label>
                    <select
                      value={selectedCatalogCompany}
                      onChange={(e) => {
                        const chosenName = e.target.value;
                        setSelectedCatalogCompany(chosenName);
                        const match = catalogOptions.find((c) => c.companyName === chosenName);
                        if (match) {
                          setEmailInput(match.email);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                    >
                      <option value="">— Choisir mon catalogue pour afficher mon e-mail —</option>
                      {catalogOptions.map((c) => (
                        <option key={c.id} value={c.companyName}>
                          {c.companyName} ({c.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedCatalogCompany && emailInput && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-[#D4AF37]/40 text-xs text-amber-200">
                    Catalogue sélectionné : <strong className="text-white">{selectedCatalogCompany}</strong>.
                    Votre e-mail (<strong className="text-amber-300">{emailInput}</strong>) est affiché, renseignez simplement votre mot de passe ci-dessous.
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {t.connexion.emailLabel} *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      name="lougara_user_email"
                      id="lougara_user_email"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
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
                      name="lougara_user_pwd"
                      id="lougara_user_pwd"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_password');
                      setErrorNotice(null);
                      setSuccessNotice(null);
                    }}
                    className="text-xs text-amber-400 hover:text-amber-300 font-bold hover:underline cursor-pointer"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] via-[#E5A93C] to-[#B8860B] hover:from-[#E5A93C] hover:to-[#D4AF37] transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Vérification sécurisée...' : 'Se connecter à mon espace Lougara'}
                </button>

                <div className="pt-3 border-t border-slate-800/80 text-center space-y-2">
                  <p className="text-[11px] text-slate-400">
                    Pas encore de compte ?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('register');
                        setErrorNotice(null);
                        setSuccessNotice(null);
                      }}
                      className="text-amber-400 font-bold hover:underline cursor-pointer"
                    >
                      S&apos;inscrire gratuitement
                    </button>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Première activation ou configuration ?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('register_password');
                        setErrorNotice(null);
                        setSuccessNotice(null);
                      }}
                      className="text-slate-300 font-bold hover:text-amber-300 hover:underline cursor-pointer"
                    >
                      Activer un mot de passe
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* CAS : MOT DE PASSE OUBLIÉ */}
            {mode === 'forgot_password' && (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorNotice(null);
                      setSuccessNotice(null);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h3 className="text-sm font-black text-white">Réinitialisation de mot de passe</h3>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Indiquez votre adresse e-mail professionnelle et choisissez votre nouveau mot de passe. Votre demande sera soumise pour validation par les administrateurs.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Adresse e-mail professionnelle *
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
                    Nouveau mot de passe souhaité *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      placeholder="Minimum 8 caractères"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Confirmation du nouveau mot de passe *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      placeholder="Retapez le mot de passe"
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] via-[#E5A93C] to-[#B8860B] hover:opacity-95 transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Envoi de la demande...' : 'Envoyer la demande de réinitialisation'}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorNotice(null);
                      setSuccessNotice(null);
                    }}
                    className="text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    ← Retourner à la connexion
                  </button>
                </div>
              </form>
            )}

            {/* CAS 2 : FORMULAIRE D'INSCRIPTION */}
            {mode === 'register' && (
              <form
                onSubmit={handleRegisterSubmit}
                autoComplete="off"
                className="space-y-4"
              >
                {/* Champs factices anti-autofill */}
                <input
                  type="text"
                  name="fake_user_reg"
                  tabIndex={-1}
                  style={{ display: 'none' }}
                  aria-hidden="true"
                  autoComplete="off"
                />
                <input
                  type="password"
                  name="fake_pwd_reg"
                  tabIndex={-1}
                  style={{ display: 'none' }}
                  aria-hidden="true"
                  autoComplete="off"
                />

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">
                    Type de compte professionnel *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAccountType('entrepreneur')}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        accountType === 'entrepreneur'
                          ? 'bg-amber-500/15 border-amber-400 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-black flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Entrepreneur</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                        Acheteur &amp; Sourcing B2B
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountType('supplier')}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        accountType === 'supplier'
                          ? 'bg-amber-500/15 border-amber-400 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-black flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Fournisseur</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                        Vente de gros &amp; Export
                      </p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Adresse e-mail professionnelle *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      name="register_email_field"
                      autoComplete="off"
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
                      Nom complet du responsable *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        name="register_name_field"
                        placeholder="Prénom Nom"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Raison sociale *
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        name="register_company_field"
                        placeholder="Entreprise SARL / SAS"
                        value={companyNameInput}
                        onChange={(e) => setCompanyNameInput(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Pays d&apos;implantation *
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      name="register_country_field"
                      placeholder="Ex: France, Sénégal, Côte d'Ivoire, Bénin..."
                      value={countryInput}
                      onChange={(e) => setCountryInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Mot de passe sécurisé (min. 6 caractères) *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      name="register_pwd_field"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
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
                      name="register_pwd_confirm_field"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Case à cocher obligatoire Mentions Légales & CGU */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-0.5 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-400"
                    />
                    <span className="text-[11px] leading-relaxed">
                      J&apos;accepte les conditions d&apos;utilisation et j&apos;ai pris connaissance des{' '}
                      <Link
                        href="/mentions-legales"
                        target="_blank"
                        className="text-amber-400 underline hover:text-amber-300"
                      >
                        Mentions Légales &amp; Confidentialité
                      </Link>{' '}
                      de la plateforme Lougara B2B.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] via-[#E5A93C] to-[#B8860B] hover:from-[#E5A93C] hover:to-[#D4AF37] transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Création de votre compte...' : 'Créer mon compte professionnel'}
                </button>

                <div className="pt-2 text-center">
                  <p className="text-[11px] text-slate-400">
                    Déjà inscrit ?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setErrorNotice(null);
                        setSuccessNotice(null);
                      }}
                      className="text-amber-400 font-bold hover:underline cursor-pointer"
                    >
                      Se connecter
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* CAS 3 : FORMULAIRE D'ACTIVATION / RÉINITIALISATION */}
            {mode === 'register_password' && (
              <form
                onSubmit={handlePasswordRequestSubmit}
                autoComplete="off"
                className="space-y-4"
              >
                <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/30 text-[11px] text-slate-300 leading-relaxed flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Pour protéger les données des entreprises, chaque création ou modification de mot de passe est chiffrée (scrypt) et soumise à validation de sécurité.
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
                    Entrepreneur
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
                      name="pwd_reset_email"
                      autoComplete="off"
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
                        name="pwd_reset_name"
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
                        name="pwd_reset_company"
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
                      name="pwd_reset_new_pwd"
                      autoComplete="new-password"
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
                      name="pwd_reset_confirm_pwd"
                      autoComplete="new-password"
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

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorNotice(null);
                      setSuccessNotice(null);
                    }}
                    className="text-xs text-amber-400 font-bold hover:underline cursor-pointer"
                  >
                    &larr; Retour à la connexion
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* BLOC MENTIONS LÉGALES & SÉCURITÉ DE CONNEXION */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-2.5">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Sécurisation des accès &amp; Mentions Légales</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-300">
            Plateforme professionnelle B2B éditée par <strong className="text-white">App à la Carte — Hervé CHAMPAGNE EI</strong> | SIREN : 132 021 098 | 173 rue de Courcelles, 75017 Paris | Contact officiel : <a href="mailto:contact@appalacarte.fr" className="text-amber-400 underline">contact@appalacarte.fr</a>.
          </p>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Authentification chiffrée de bout en bout (scrypt). Vos identifiants et données d&apos;entreprises sont strictement protégés conformément au RGPD.
          </p>
          <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
            <Link
              href="/mentions-legales"
              className="text-amber-400 hover:text-amber-300 underline font-semibold flex items-center gap-1"
            >
              Consulter les Mentions Légales officielles &rarr;
            </Link>
            <a
              href="mailto:contact@appalacarte.fr"
              className="text-slate-400 hover:text-white"
            >
              Assistance : contact@appalacarte.fr
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
