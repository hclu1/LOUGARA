'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import {
  ShieldCheck,
  CreditCard,
  Building2,
  Smartphone,
  Copy,
  Check,
  ArrowLeft,
  ArrowRight,
  Lock,
  AlertCircle,
  CheckCircle2,
  Globe,
  FileText,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  COUNTRY_PAYMENT_CONFIGS,
  getCountryPaymentConfig,
  PaymentMethodOption,
} from '@/features/payment/config/payment-methods.config';
import { resolveServerOrderPricing } from '@/features/payment/services/pricing.service';
import { BankTransferDetails, PaymentBillingCycleType } from '@/features/payment/types';
import {
  CurrencyCode,
  formatCurrencyAmount,
  SUPPORTED_CURRENCIES,
} from '@/locales/currencies';

const AVAILABLE_PLANS = [
  { code: 'SUPPLIER_ESSENTIAL', labelFr: 'Fournisseur — Catalogue Essentiel', labelEn: 'Supplier — Essential Catalog', isSub: true },
  { code: 'SUPPLIER_PRO', labelFr: 'Fournisseur — Catalogue Pro (Badge KYB)', labelEn: 'Supplier — Pro Catalog (KYB)', isSub: true },
  { code: 'SUPPLIER_PREMIUM', labelFr: 'Fournisseur — Catalogue Premium', labelEn: 'Supplier — Premium Catalog', isSub: true },
  { code: 'BUYER_ESSENTIAL', labelFr: 'Entrepreneur — Essentiel (3 contacts/mois)', labelEn: 'Entrepreneur — Essential (3 contacts/mo)', isSub: true },
  { code: 'BUYER_PRO', labelFr: 'Entrepreneur — Pro (15 contacts/mois)', labelEn: 'Entrepreneur — Pro (15 contacts/mo)', isSub: true },
  { code: 'BUYER_VIP', labelFr: 'Entrepreneur — VIP (50 contacts/mois)', labelEn: 'Entrepreneur — VIP (50 contacts/mo)', isSub: true },
  { code: 'CREDIT_PACK_1', labelFr: 'Pack Flash — 1 Crédit de contact', labelEn: 'Flash Pack — 1 Contact Credit', isSub: false },
  { code: 'CREDIT_PACK_5', labelFr: 'Pack Croissance — 5 Crédits de contact', labelEn: 'Growth Pack — 5 Contact Credits', isSub: false },
  { code: 'CREDIT_PACK_15', labelFr: 'Pack Volume — 15 Crédits de contact', labelEn: 'Volume Pack — 15 Contact Credits', isSub: false },
];

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { locale, currency: contextCurrency, setCurrency } = useLanguage();

  const initialPlan = (searchParams.get('plan') || 'SUPPLIER_PRO').toUpperCase();
  const initialCycleParam = (searchParams.get('cycle') || 'MONTHLY').toUpperCase();
  const initialCountry = (searchParams.get('country') || 'FR').toUpperCase();

  const [selectedPlanCode, setSelectedPlanCode] = useState<string>(
    AVAILABLE_PLANS.some((p) => p.code === initialPlan) ? initialPlan : 'SUPPLIER_PRO'
  );
  const [billingCycle, setBillingCycle] = useState<PaymentBillingCycleType>(
    initialCycleParam === 'ANNUAL'
      ? 'ANNUAL'
      : initialPlan.startsWith('CREDIT_PACK')
        ? 'ONE_TIME'
        : 'MONTHLY'
  );
  const [countryCode, setCountryCode] = useState<string>(initialCountry);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(
    (searchParams.get('currency')?.toUpperCase() as CurrencyCode) || contextCurrency || 'EUR'
  );

  const countryConfig = getCountryPaymentConfig(countryCode);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodOption>(
    countryConfig.availableMethods[0]
  );

  // Informations client
  const [customerEmail, setCustomerEmail] = useState<string>(user?.email || '');
  const [customerName, setCustomerName] = useState<string>(
    user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : ''
  );
  const [companyName, setCompanyName] = useState<string>(user?.companyName || '');

  // États du tunnel de paiement
  const [creatingOrder, setCreatingOrder] = useState<boolean>(false);
  const [confirmingStripe, setConfirmingStripe] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Résultat d'initialisation de commande
  const [orderReference, setOrderReference] = useState<string | null>(null);
  const [bankTransferDetails, setBankTransferDetails] = useState<BankTransferDetails | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Références pour Stripe Payment Element
  const paymentElementContainerRef = useRef<HTMLDivElement | null>(null);
  const stripeInstanceRef = useRef<Stripe | null>(null);
  const stripeElementsRef = useRef<StripeElements | null>(null);
  const [stripeElementReady, setStripeElementReady] = useState<boolean>(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email && !customerEmail) {
      setCustomerEmail(user.email);
    }
    if (user?.companyName && !companyName) {
      setCompanyName(user.companyName);
    }
  }, [user]);

  // Quand le pays change, mettre à jour les moyens de paiement disponibles et la devise par défaut
  const handleCountryChange = (newCountryCode: string) => {
    setCountryCode(newCountryCode);
    const cfg = getCountryPaymentConfig(newCountryCode);
    setSelectedCurrency(cfg.defaultCurrency);
    setCurrency(cfg.defaultCurrency);
    if (!cfg.availableMethods.some((m) => m.id === selectedMethod.id)) {
      setSelectedMethod(cfg.availableMethods[0]);
    }
    resetPaymentIntentState();
  };

  const resetPaymentIntentState = () => {
    setClientSecret(null);
    setStripeElementReady(false);
    setBankTransferDetails(null);
    setOrderReference(null);
    setErrorMessage(null);
    setInfoMessage(null);
  };

  const isCreditPack = selectedPlanCode.startsWith('CREDIT_PACK');
  const effectiveCycle: PaymentBillingCycleType = isCreditPack ? 'ONE_TIME' : billingCycle;

  let currentPricing = {
    amount: 69,
    planNameFr: 'Formule Lougara',
    planNameEn: 'Lougara Plan',
  };
  try {
    currentPricing = resolveServerOrderPricing(
      selectedPlanCode,
      effectiveCycle,
      selectedCurrency
    );
  } catch {}

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Monter le Stripe Payment Element dès que clientSecret est reçu
  useEffect(() => {
    let isMounted = true;
    async function mountPaymentElement() {
      if (!clientSecret || !paymentElementContainerRef.current) return;
      const pubKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      if (!pubKey) return;

      const stripe = await loadStripe(pubKey);
      if (!stripe || !isMounted) return;

      stripeInstanceRef.current = stripe;
      const elements = stripe.elements({
        clientSecret,
        locale: locale === 'fr' ? 'fr' : 'en',
        appearance: {
          theme: 'night',
          variables: {
            colorPrimary: '#D4AF37',
            colorBackground: '#0F172A',
            colorText: '#F8FAFC',
            colorDanger: '#EF4444',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            borderRadius: '12px',
          },
        },
      });

      stripeElementsRef.current = elements;
      const paymentElement = elements.create('payment', {
        layout: 'tabs',
      });
      paymentElement.mount(paymentElementContainerRef.current);
      paymentElement.on('ready', () => {
        if (isMounted) setStripeElementReady(true);
      });
    }

    mountPaymentElement();
    return () => {
      isMounted = false;
    };
  }, [clientSecret, locale]);

  // Initialiser la commande côté serveur
  const handleInitializeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    if (!customerEmail || !customerEmail.includes('@')) {
      setErrorMessage(
        locale === 'fr'
          ? 'Veuillez saisir une adresse email professionnelle valide.'
          : 'Please enter a valid business email address.'
      );
      return;
    }

    setCreatingOrder(true);
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planCode: selectedPlanCode,
          billingCycle: effectiveCycle,
          currency: selectedCurrency,
          countryCode,
          provider: selectedMethod.provider,
          paymentMethodType: selectedMethod.channel,
          customerEmail,
          customerName,
          companyName,
          userId: user?.id,
        }),
      });

      const data = await res.json();

      if (!res.ok || (!data.success && !data.isTestSimulation)) {
        setErrorMessage(
          data.error || data.message || 'Impossible de préparer la commande.'
        );
        return;
      }

      if (data.order?.reference) {
        setOrderReference(data.order.reference);
      }

      // Cas 1 : Virement bancaire RIB
      if (selectedMethod.provider === 'BANK_TRANSFER' && data.bankTransferDetails) {
        setBankTransferDetails(data.bankTransferDetails);
        setInfoMessage(
          locale === 'fr'
            ? `Commande ${data.order.reference} enregistrée « En attente de virement ». Un email contenant le RIB vous a également été envoyé.`
            : `Order ${data.order.reference} saved as "Waiting for bank transfer". An email with the bank details has been sent to you.`
        );
        return;
      }

      // Cas 2 : Stripe Payment Element
      if (selectedMethod.provider === 'STRIPE') {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else if (data.isTestSimulation) {
          setInfoMessage(data.message);
        }
        return;
      }

      // Cas 3 : Mobile Money (Redirection externe CinetPay / Flutterwave / PayDunya)
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }

      if (data.isTestSimulation && data.message) {
        setInfoMessage(data.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur réseau lors de la création du paiement.');
    } finally {
      setCreatingOrder(false);
    }
  };

  // Confirmer le paiement via Stripe Payment Element
  const handleConfirmStripePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripeInstanceRef.current || !stripeElementsRef.current || !orderReference) {
      return;
    }

    setConfirmingStripe(true);
    setErrorMessage(null);

    try {
      const returnUrl = `${window.location.origin}/paiement/succes?ref=${encodeURIComponent(
        orderReference
      )}`;

      const { error } = await stripeInstanceRef.current.confirmPayment({
        elements: stripeElementsRef.current,
        confirmParams: {
          return_url: returnUrl,
          receipt_email: customerEmail,
        },
      });

      if (error) {
        setErrorMessage(
          error.message ||
            (locale === 'fr'
              ? 'Le paiement a été refusé ou interrompu. Vérifiez vos informations ou choisissez le Virement Bancaire (RIB).'
              : 'Payment was declined or interrupted. Please check your details or choose Bank Wire Transfer.')
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur lors de la confirmation du paiement.');
    } finally {
      setConfirmingStripe(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* BARRE DE NAVIGATION HAUTE */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <Link
            href="/tarifs"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{locale === 'fr' ? 'Retour à la grille des tarifs' : 'Back to pricing plans'}</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/paiement/historique"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-amber-300 hover:border-amber-500/50 transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{locale === 'fr' ? 'Historique & Factures' : 'Payment History & Invoices'}</span>
            </Link>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{locale === 'fr' ? 'Paiement 100% Sécurisé SSL' : '100% SSL Secure Checkout'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* =================================================================== */}
          {/* COLONNE GAUCHE (7 cols) : CONFIGURATION & MOYENS DE PAIEMENT */}
          {/* =================================================================== */}
          <div className="lg:col-span-7 space-y-6">
            {/* ÉTAPE 1 : PAYS & DEVISE DU CLIENT */}
            <div className="glass-card rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-sm">
                  1
                </div>
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-amber-400" />
                    <span>
                      {locale === 'fr'
                        ? 'Localisation & Devise de facturation'
                        : 'Billing Country & Currency'}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    {locale === 'fr'
                      ? 'Les moyens de paiement locaux (SEPA, Cartes, Mobile Money) s’adaptent automatiquement à votre pays.'
                      : 'Local payment methods adapt automatically to your country.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {locale === 'fr' ? 'Pays de votre société :' : 'Company Country:'}
                  </label>
                  <select
                    value={countryCode}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                  >
                    {COUNTRY_PAYMENT_CONFIGS.map((c) => (
                      <option key={c.countryCode} value={c.countryCode}>
                        {c.flag} {locale === 'fr' ? c.countryNameFr : c.countryNameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {locale === 'fr' ? 'Devise de règlement :' : 'Payment Currency:'}
                  </label>
                  <select
                    value={selectedCurrency}
                    onChange={(e) => {
                      const curr = e.target.value as CurrencyCode;
                      setSelectedCurrency(curr);
                      setCurrency(curr);
                      resetPaymentIntentState();
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                  >
                    {Object.values(SUPPORTED_CURRENCIES).map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.flag} {curr.code} — {curr.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ÉTAPE 2 : COORDONNÉES DE FACTURATION */}
            <div className="glass-card rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-sm">
                  2
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">
                    {locale === 'fr'
                      ? 'Informations Client & Facturation PDF'
                      : 'Customer & PDF Invoice Information'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {locale === 'fr'
                      ? 'Ces informations figureront sur votre facture officielle acquittée envoyée par email.'
                      : 'This information will appear on your official PDF invoice sent by email.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {locale === 'fr' ? 'Email professionnel (obligatoire) *' : 'Business Email (required) *'}
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="contact@votre-entreprise.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {locale === 'fr' ? 'Nom complet du responsable' : 'Full Contact Name'}
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ex: Jean Kouassi"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {locale === 'fr' ? 'Raison sociale / Société' : 'Company Legal Name'}
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ex: Lougara Import Export SAS"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* ÉTAPE 3 : CHOIX DU MOYEN DE PAIEMENT */}
            <div className="glass-card rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-sm">
                  3
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">
                    {locale === 'fr'
                      ? 'Choisissez votre moyen de paiement'
                      : 'Select your payment method'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {locale === 'fr'
                      ? `Moyens disponibles pour ${countryConfig.flag} ${countryConfig.countryNameFr}`
                      : `Available methods for ${countryConfig.flag} ${countryConfig.countryNameEn}`}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {countryConfig.availableMethods.map((method) => {
                  const isSelected = selectedMethod.id === method.id;
                  const IconComponent =
                    method.provider === 'STRIPE'
                      ? CreditCard
                      : method.provider === 'BANK_TRANSFER'
                        ? Building2
                        : Smartphone;

                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => {
                        setSelectedMethod(method);
                        resetPaymentIntentState();
                      }}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                        isSelected
                          ? 'bg-amber-500/10 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.15)]'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-[#D4AF37] text-slate-950 border-[#D4AF37]'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm font-black text-white">
                            {locale === 'fr' ? method.labelFr : method.labelEn}
                          </span>
                          {method.badgeFr && (
                            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              {locale === 'fr' ? method.badgeFr : method.badgeEn}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400">
                          {locale === 'fr' ? method.descriptionFr : method.descriptionEn}
                        </p>

                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {method.logos.map((logo) => (
                            <span
                              key={logo}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300"
                            >
                              {logo}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* MESSAGES D'ERREUR OU D'INFORMATION */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">{errorMessage}</p>
                  </div>
                </div>
              )}

              {infoMessage && (
                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="font-semibold leading-relaxed">{infoMessage}</p>
                    {selectedMethod.provider !== 'BANK_TRANSFER' && (
                      <button
                        type="button"
                        onClick={() => {
                          const ribMethod = countryConfig.availableMethods.find(
                            (m) => m.provider === 'BANK_TRANSFER'
                          );
                          if (ribMethod) {
                            setSelectedMethod(ribMethod);
                            resetPaymentIntentState();
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-all"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Régler immédiatement par Virement Bancaire (RIB Lougara)</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ZONE DYNAMIQUE 1 : STRIPE PAYMENT ELEMENT INTÉGRÉ */}
              {selectedMethod.provider === 'STRIPE' && clientSecret && (
                <form
                  onSubmit={handleConfirmStripePayment}
                  className="p-5 rounded-2xl bg-slate-950 border border-[#D4AF37]/50 space-y-5 animate-fadeIn"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="text-xs font-bold text-amber-300 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#D4AF37]" />
                      <span>
                        Formulaire sécurisé Stripe — Réf.{' '}
                        <strong className="font-mono text-white">{orderReference}</strong>
                      </span>
                    </div>
                    <span className="text-xs font-black text-emerald-400">
                      {formatCurrencyAmount(currentPricing.amount, selectedCurrency)}
                    </span>
                  </div>

                  {/* Conteneur officiel du Stripe Payment Element */}
                  <div
                    ref={paymentElementContainerRef}
                    id="stripe-payment-element"
                    className="min-h-[220px]"
                  />

                  <button
                    type="submit"
                    disabled={confirmingStripe || !stripeElementReady}
                    className="w-full py-3.5 px-6 rounded-xl font-black text-sm text-slate-950 bg-gradient-to-r from-[#D4AF37] via-[#E5A93C] to-[#B8860B] hover:from-[#E5A93C] hover:to-[#D4AF37] transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    <span>
                      {confirmingStripe
                        ? 'Validation 3D Secure en cours...'
                        : `Confirmer et payer ${formatCurrencyAmount(
                            currentPricing.amount,
                            selectedCurrency
                          )}`}
                    </span>
                  </button>
                </form>
              )}

              {/* ZONE DYNAMIQUE 2 : INSTRUCTIONS VIREMENT BANCAIRE MANUEL (RIB LOUGARA) */}
              {selectedMethod.provider === 'BANK_TRANSFER' && bankTransferDetails && (
                <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-950 to-[#0B132B] border-2 border-[#D4AF37] space-y-5 shadow-[0_0_30px_rgba(212,175,55,0.2)] animate-fadeIn">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                          Statut : En attente de virement
                        </span>
                        <h3 className="text-base font-black text-white">
                          Coordonnées Bancaires Officielles (RIB Lougara)
                        </h3>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-black">
                      {bankTransferDetails.reference}
                    </span>
                  </div>

                  {/* Référence obligatoire mise en avant */}
                  <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300 block">
                        ⚠️ Référence obligatoire à indiquer dans le libellé du virement :
                      </span>
                      <span className="text-xl font-mono font-black text-white tracking-wider">
                        {bankTransferDetails.reference}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(bankTransferDetails.reference, 'ref')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-all shrink-0"
                    >
                      {copiedField === 'ref' ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Copié !</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copier la référence</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Détails complets du RIB */}
                  <div className="grid grid-cols-1 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-slate-400 block">Titulaire du compte :</span>
                        <strong className="text-white text-sm">
                          {bankTransferDetails.holderName}
                        </strong>
                        <span className="text-slate-400 block text-[11px] mt-0.5">
                          {bankTransferDetails.ownerAddress}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(bankTransferDetails.holderName, 'holder')}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="Copier le titulaire"
                      >
                        {copiedField === 'holder' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-slate-400 block">IBAN (SEPA / International) :</span>
                        <strong className="text-amber-300 font-mono text-sm sm:text-base tracking-wide">
                          {bankTransferDetails.iban}
                        </strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(bankTransferDetails.iban.replace(/\s+/g, ''), 'iban')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold"
                      >
                        {copiedField === 'iban' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>IBAN copié</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copier l&apos;IBAN</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-slate-400 block">Code BIC / SWIFT :</span>
                          <strong className="text-white font-mono text-sm">
                            {bankTransferDetails.bic}
                          </strong>
                          <span className="text-[10px] text-slate-400 block">
                            SWIFT banque partenaire : {bankTransferDetails.partnerSwift}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(bankTransferDetails.bic, 'bic')}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        >
                          {copiedField === 'bic' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>

                      <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
                        <div>
                          <span className="text-emerald-300/80 block">Montant exact à virer :</span>
                          <strong className="text-emerald-400 font-black text-base">
                            {bankTransferDetails.exactAmountFormatted}
                          </strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(String(bankTransferDetails.amount), 'amount')}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        >
                          {copiedField === 'amount' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
                      🏦 <strong>Domiciliation bancaire :</strong> {bankTransferDetails.bankName}
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <Link
                      href={`/paiement/succes?ref=${encodeURIComponent(bankTransferDetails.reference)}`}
                      className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-slate-950 font-black text-xs shadow-lg hover:opacity-95 transition-all"
                    >
                      <span>Voir le récapitulatif de ma commande</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <Link
                      href="/paiement/historique"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Mon historique</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* BOUTON PRINCIPAL D'INITIALISATION (si pas encore initialisé) */}
              {!clientSecret && !bankTransferDetails && (
                <button
                  type="button"
                  onClick={handleInitializeOrder}
                  disabled={creatingOrder}
                  className="w-full py-4 px-6 rounded-2xl font-black text-sm text-slate-950 bg-gradient-to-r from-[#D4AF37] via-[#E5A93C] to-[#B8860B] hover:from-[#E5A93C] hover:to-[#D4AF37] transition-all shadow-[0_0_25px_rgba(212,175,55,0.35)] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {creatingOrder ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Préparation sécurisée côté serveur...</span>
                    </>
                  ) : selectedMethod.provider === 'BANK_TRANSFER' ? (
                    <>
                      <Building2 className="w-5 h-5" />
                      <span>
                        Générer ma référence de virement & afficher le RIB (
                        {formatCurrencyAmount(currentPricing.amount, selectedCurrency)})
                      </span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>
                        Procéder au paiement sécurisé (
                        {formatCurrencyAmount(currentPricing.amount, selectedCurrency)})
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* =================================================================== */}
          {/* COLONNE DROITE (5 cols) : RÉCAPITULATIF DE LA COMMANDE */}
          {/* =================================================================== */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
            <div className="glass-card rounded-3xl border border-[#D4AF37]/40 bg-gradient-to-b from-slate-900/95 to-[#0B132B] p-6 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#E5A93C]">
                    Récapitulatif Officiel
                  </span>
                  <h3 className="text-lg font-black text-white">Votre Offre Lougara B2B</h3>
                </div>
                <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
              </div>

              {/* Sélecteur d'offre rapide */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-300">
                  {locale === 'fr' ? 'Formule ou Pack sélectionné :' : 'Selected Plan or Pack:'}
                </label>
                <select
                  value={selectedPlanCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    setSelectedPlanCode(code);
                    if (code.startsWith('CREDIT_PACK')) {
                      setBillingCycle('ONE_TIME');
                    } else if (billingCycle === 'ONE_TIME') {
                      setBillingCycle('MONTHLY');
                    }
                    resetPaymentIntentState();
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                >
                  {AVAILABLE_PLANS.map((p) => (
                    <option key={p.code} value={p.code}>
                      {locale === 'fr' ? p.labelFr : p.labelEn}
                    </option>
                  ))}
                </select>

                {/* Cycle Mensuel / Annuel si abonnement */}
                {!isCreditPack && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setBillingCycle('MONTHLY');
                        resetPaymentIntentState();
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition-all ${
                        billingCycle === 'MONTHLY'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Facturation Mensuelle
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBillingCycle('ANNUAL');
                        resetPaymentIntentState();
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-1.5 ${
                        billingCycle === 'ANNUAL'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>Annuel</span>
                      <span className="bg-emerald-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                        -20%
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* Détail chiffré validé côté serveur */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Prestation :</span>
                  <strong className="text-white text-right max-w-[200px]">
                    {locale === 'fr' ? currentPricing.planNameFr : currentPricing.planNameEn}
                  </strong>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span>Périodicité :</span>
                  <span className="font-bold text-amber-300">
                    {effectiveCycle === 'ANNUAL'
                      ? 'Abonnement Annuel (12 mois)'
                      : effectiveCycle === 'MONTHLY'
                        ? 'Abonnement Mensuel'
                        : 'Paiement Unique (Pay-as-you-go)'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span>TVA (Art. 293 B du CGI) :</span>
                  <span>0,00 {selectedCurrency}</span>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-baseline justify-between">
                  <span className="text-sm font-black text-white">Total TTC à régler :</span>
                  <span className="text-2xl font-black text-[#D4AF37]">
                    {formatCurrencyAmount(currentPricing.amount, selectedCurrency)}
                  </span>
                </div>
              </div>

              {/* Garanties de sécurité */}
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Zéro stockage de carte :</strong> Vos données bancaires ne transitent jamais par nos serveurs.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Facture PDF séquentielle :</strong> Générée et envoyée automatiquement par email dès validation.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Activation garantie côté serveur :</strong> Par webhook sécurisé ou rapprochement bancaire Admin.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaiementPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B132B] flex items-center justify-center text-slate-300">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D4AF37]" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
