'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Send,
  Search,
  Filter,
  Sparkles,
  Package,
  MapPin,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  Clock,
  Briefcase,
  Layers,
  ChevronRight,
  HelpCircle,
  PlusCircle,
  ExternalLink,
  Scan,
  Loader2,
  Upload,
  Zap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { BadgeVerified } from '@/components/BadgeVerified';
import { DocumentDropzone } from '@/components/DocumentDropzone';
import { parseKbisOcrText, ParsedKbisData } from '@/features/ocr/kbis-parser';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

interface VerifiedSupplierItem {
  id: string;
  companyName: string;
  country: string;
  city: string;
  sector: string;
  regNumber: string;
  description: string;
  verifiedAt: string;
  products: string[];
  contactRole: string;
  moqSummary: string;
}

export default function EspaceEntrepreneursPage() {
  const { t, locale } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'register' | 'suppliers' | 'tenders' | 'directory'>('register');

  // Formulaire d'inscription & RFQ
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('France');
  const [city, setCity] = useState('');
  const [buyerType, setBuyerType] = useState<string>('Boutique physique & Concept store');
  const [targetSectors, setTargetSectors] = useState<string[]>(['Cosmétique & Soins']);
  const [estimatedBudget, setEstimatedBudget] = useState<string>('1 000 € à 5 000 € / mois');
  const [sourcingNeeds, setSourcingNeeds] = useState('');
  const [targetQuantity, setTargetQuantity] = useState('');
  const [sourcingTimeline, setSourcingTimeline] = useState<string>('Court terme (1 à 3 mois)');
  const [requiredCertifications, setRequiredCertifications] = useState('');

  const [subscriptionPlan, setSubscriptionPlan] = useState<'STANDARD' | 'PREMIUM' | 'VIP'>('STANDARD');
  const [hasCatalogAdSpace, setHasCatalogAdSpace] = useState(false);

  // Kbis & OCR
  const [kbisFile, setKbisFile] = useState<string | null>(null);
  const [kbisFileSize, setKbisFileSize] = useState<string>('');
  const [kbisFilePath, setKbisFilePath] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [autoFilled, setAutoFilled] = useState(false);
  const [ocrConfidence, setOcrConfidence] = useState<number | null>(null);
  const [rawOcrText, setRawOcrText] = useState<string | null>(null);
  const [showRawText, setShowRawText] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const [registeredId, setRegisteredId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [selectedSupplier, setSelectedSupplier] = useState<VerifiedSupplierItem | null>(null);
  const [inquiryQuantity, setInquiryQuantity] = useState('');
  const [inquiryDestination, setInquiryDestination] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [isInquirySending, setIsInquirySending] = useState(false);
  const [inquirySentSuccess, setInquirySentSuccess] = useState(false);

  const [entrepreneursList, setEntrepreneursList] = useState<any[]>([]);
  const [suppliersList, setSuppliersList] = useState<VerifiedSupplierItem[]>([]);

  const fetchEntrepreneurs = async () => {
    try {
      const res = await fetch('/api/entrepreneurs/register');
      if (res.ok) {
        const data = await res.json();
        if (data.entrepreneurs) setEntrepreneursList(data.entrepreneurs);
      }
    } catch (e) {}
  };

  const fetchSuppliers = async () => {
    try {
      const res = await fetch(`/api/suppliers?_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.suppliers && Array.isArray(data.suppliers)) {
          const verified = data.suppliers
            .filter((s: any) => s.verificationStatus === 'VERIFIED' && s.isPublished !== false)
            .map((s: any) => ({
              id: s.id,
              companyName: s.companyName,
              country: s.country,
              city: s.city,
              sector: s.sector,
              regNumber: s.registrationNumber || '',
              description: s.description || '',
              verifiedAt: s.verifiedAt ? new Date(s.verifiedAt).toLocaleDateString() : 'Vérifié',
              products: (s.products || []).map((p: any) => p.title),
              contactRole: s.user ? `${s.user.firstName || ''} ${s.user.lastName || ''}`.trim() : 'Direction',
              moqSummary: 'Selon gamme',
            }));
          setSuppliersList(verified);
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchEntrepreneurs();
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (!email && user?.email) {
      setEmail(user.email);
    }
  }, [user, email]);

  const applyParsedData = (data: ParsedKbisData, fileName: string, fileSizeStr: string, pathStr: string | null = null) => {
    setKbisFile(fileName);
    setKbisFileSize(fileSizeStr);
    setKbisFilePath(pathStr);
    setAutoFilled(true);
    setOcrConfidence(data.confidenceScore);
    setRawOcrText(data.rawText);
    if (data.companyName) setCompanyName(data.companyName);
    if (data.regNumber) setRegistrationNumber(data.regNumber);
    if (data.country) setCountry(data.country);
    if (data.city) setCity(data.city);
    if (data.contactName) setFullName(data.contactName);
    if (data.email) setEmail(data.email);
    setErrorMessage('');
  };

  const handleProcessFile = async (file: File) => {
    const sizeStr = `${(file.size / 1024 / 1024).toFixed(2)} Mo`;
    setKbisFilePath(null);
    setIsScanning(true);
    setErrorMessage('');
    setScanStep(locale === 'fr' ? 'Détection et reconnaissance optique du document...' : 'Detecting and analyzing document...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/ocr/kbis', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (response.ok && result.success && result.data) {
        setIsScanning(false);
        applyParsedData(result.data, file.name, sizeStr, null);
        return;
      } else {
        setErrorMessage(result.error || (locale === 'fr' ? 'Échec de la reconnaissance optique OCR.' : 'OCR optical recognition failed.'));
      }
    } catch (err: any) {
      setErrorMessage(err?.message || (locale === 'fr' ? 'Erreur lors du traitement du document.' : 'Document processing error.'));
    }

    setIsScanning(false);
    setKbisFile(file.name);
    setKbisFileSize(sizeStr);
    setAutoFilled(false);
  };

  const handleProcessPath = async (pathStr: string) => {
    setIsScanning(true);
    setErrorMessage('');
    setScanStep(locale === 'fr' ? 'Lecture du chemin et extraction des données...' : 'Reading path and extracting data...');
    setKbisFilePath(pathStr);

    try {
      const formData = new FormData();
      formData.append('filePath', pathStr);
      const response = await fetch('/api/ocr/kbis', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (response.ok && result.success && result.data) {
        setIsScanning(false);
        applyParsedData(result.data, result.fileName || pathStr, result.fileSize || 'Chemin validé', pathStr);
        return;
      } else {
        setErrorMessage(result.error || (locale === 'fr' ? 'Fichier introuvable ou non accessible au chemin indiqué.' : 'File not found at path.'));
      }
    } catch (err: any) {
      setErrorMessage(err?.message || (locale === 'fr' ? 'Erreur lors de la lecture du chemin.' : 'Path reading error.'));
    }

    setIsScanning(false);
    const fileName = pathStr.split(/[\\/]/).pop() || pathStr;
    setKbisFile(fileName);
    setKbisFileSize('Chemin renseigné');
    setAutoFilled(false);
  };

  const handleRemoveFile = () => {
    setKbisFile(null);
    setKbisFileSize('');
    setKbisFilePath(null);
    setOcrConfidence(null);
    setRawOcrText(null);
    setAutoFilled(false);
    setErrorMessage('');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/entrepreneurs/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          companyName,
          registrationNumber,
          kbisFile,
          email,
          phone: phone || '',
          country: country || 'France',
          city: city || 'Paris',
          buyerType,
          targetSectors,
          estimatedBudget,
          sourcingNeeds,
          targetQuantity,
          subscriptionPlan,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRegisteredSuccess(true);
        setRegisteredId(data.entrepreneur?.id || 'OK');
      } else {
        setErrorMessage(data.error || (locale === 'fr' ? 'Erreur lors de l\'enregistrement.' : 'Error during registration.'));
      }
    } catch (e: any) {
      setErrorMessage(e?.message || (locale === 'fr' ? 'Erreur de connexion au serveur.' : 'Server connection error.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* HERO HEADER */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/15 text-[#E5A93C] text-xs font-black border border-[#D4AF37]/30 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <Briefcase className="w-4 h-4 text-[#D4AF37]" />
            <span>{locale === 'fr' ? 'Hub d\'Approvisionnement B2B Acheteurs & Entrepreneurs' : 'B2B Sourcing Hub for Buyers & Entrepreneurs'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {t.entrepreneurs.title}
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            {t.entrepreneurs.subtitle}
          </p>
        </div>

        {/* 4-STEP BUYER ROADMAP TIMELINE WITH GOLD CIRCULAR STEP INDICATORS */}
        <section className="glass-card p-8 sm:p-10 rounded-3xl border border-[#D4AF37]/30 space-y-8 relative overflow-hidden">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">
              {locale === 'fr' ? 'Parcours d\'Achat Sécurisé' : 'Secure Procurement Journey'}
            </span>
            <h2 className="text-2xl font-black text-white">
              {locale === 'fr' ? 'Feuille de Route de l\'Acheteur B2B (4 Étapes)' : 'B2B Buyer Sourcing Roadmap (4 Steps)'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center space-y-3 relative z-10 group">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D4AF37] via-[#E5A93C] to-[#B8860B] text-slate-950 font-black text-xl flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)] group-hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="font-extrabold text-white text-base">
                {locale === 'fr' ? 'Immatriculation' : 'Registration'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {locale === 'fr' ? 'Dépôt de votre extrait Kbis ou RCCM pour valider votre statut d\'acheteur professionnel.' : 'Submit company legal ID to verify professional buyer status.'}
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center space-y-3 relative z-10 group">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D4AF37] via-[#E5A93C] to-[#B8860B] text-slate-950 font-black text-xl flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)] group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="font-extrabold text-white text-base">
                {locale === 'fr' ? 'Audit KYB' : 'KYB Audit'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {locale === 'fr' ? 'Contrôle optique OCR immédiat et attribution du pass d\'accès au réseau privé.' : 'Instant optical OCR check and private verified trade corridor access.'}
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center space-y-3 relative z-10 group">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D4AF37] via-[#E5A93C] to-[#B8860B] text-slate-950 font-black text-xl flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)] group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="font-extrabold text-white text-base">
                {locale === 'fr' ? 'Sourcing Ciblé' : 'Targeted Sourcing'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {locale === 'fr' ? 'Recherche par corridor commercial et filtres par catégories et MOQ.' : 'Filter by trade corridor, certified category, and minimum order quantity.'}
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center space-y-3 relative z-10 group">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 font-black text-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] group-hover:scale-110 transition-transform">
                4
              </div>
              <h3 className="font-extrabold text-white text-base">
                {locale === 'fr' ? 'Devis Direct (RFQ)' : 'Direct RFQ Quotes'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {locale === 'fr' ? 'Négociation directe sans intermédiaire et émission de cotations officielles.' : 'Direct negotiations without middlemen and formal verified wholesale quotes.'}
              </p>
            </div>
          </div>
        </section>

        {/* TAB NAVIGATION & FORM */}
        <div className="space-y-6">
          <div className="flex border-b border-slate-800 overflow-x-auto">
            <button
              onClick={() => setActiveTab('register')}
              className={`pb-4 px-6 font-extrabold text-sm border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'register' ? 'border-[#D4AF37] text-[#E5A93C]' : 'border-transparent text-slate-400'
              }`}
            >
              {t.entrepreneurs.step1Title}
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`pb-4 px-6 font-extrabold text-sm border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'suppliers' ? 'border-[#D4AF37] text-[#E5A93C]' : 'border-transparent text-slate-400'
              }`}
            >
              {t.entrepreneurs.step2Title} ({suppliersList.length})
            </button>
          </div>

          {activeTab === 'register' && (
            <div className="glass-card p-8 sm:p-10 rounded-3xl border border-slate-800 space-y-8">
              {registeredSuccess ? (
                <div className="py-8 space-y-6 max-w-xl mx-auto">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-white">{t.entrepreneurs.regSuccessTitle}</h3>
                    <p className="text-sm text-slate-300">
                      {t.entrepreneurs.regSuccessDesc} (<span className="font-bold text-amber-300">{companyName}</span>)
                    </p>
                  </div>

                  {/* Fiche récapitulative acheteur validé */}
                  <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-amber-400" />
                        <span className="font-extrabold text-white text-base">{companyName}</span>
                      </div>
                      <BadgeVerified />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block font-semibold">{t.entrepreneurs.registrationNumberLabel} :</span>
                        <span className="font-mono text-slate-200 font-bold">{registrationNumber || 'Vérifié'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">{t.entrepreneurs.directorNameLabel} :</span>
                        <span className="text-slate-200 font-bold">{fullName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">{t.entrepreneurs.proEmailLabel} :</span>
                        <span className="text-slate-200 font-bold">{email}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">Document Kbis / RCCM :</span>
                        <span className="text-emerald-400 font-mono font-bold truncate block">{kbisFile || 'Document validé'}</span>
                      </div>
                    </div>

                    {/* Bloc RFQ Pris en compte */}
                    {sourcingNeeds && (
                      <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-emerald-950/20 border border-amber-500/30 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-wider">
                          <Package className="w-4 h-4 text-emerald-400" />
                          <span>Demande de Cotation (RFQ) enregistrée &amp; diffusée</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed italic">
                          &ldquo;{sourcingNeeds}&rdquo;
                        </p>
                        <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5 pt-1">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Votre demande d'approvisionnement a été enregistrée avec succès et transmise aux grossistes certifiés.</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('suppliers')}
                      className="flex-1 py-3 px-4 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] hover:brightness-110 transition-all text-center"
                    >
                      Voir les fournisseurs certifiés &rarr;
                    </button>
                    <Link
                      href="/catalogue"
                      className="flex-1 py-3 px-4 rounded-xl text-xs font-black text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all text-center"
                    >
                      Accéder au catalogue B2B
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-8">
                  {errorMessage && (
                    <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5 shadow-sm">
                      <div className="w-4 h-4 rounded-full bg-rose-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-black">!</div>
                      <div className="flex-1">
                        <p className="font-bold">{locale === 'fr' ? 'Information :' : 'Notice:'}</p>
                        <p className="mt-0.5">{errorMessage}</p>
                      </div>
                    </div>
                  )}

                  {autoFilled && (
                    <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between gap-2 shadow-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{locale === 'fr' ? 'Données Kbis / RCCM extraites par OCR et appliquées aux champs ci-dessous.' : 'Official legal data extracted via OCR and pre-filled below.'}</span>
                      </div>
                      {ocrConfidence && (
                        <span className="font-mono text-[11px] font-black bg-emerald-900/80 px-2 py-0.5 rounded border border-emerald-500/30 text-amber-300 shrink-0">
                          ★ OCR {ocrConfidence}%
                        </span>
                      )}
                    </div>
                  )}
                  {/* Step 1: Kbis Dropzone */}
                  <div className="space-y-4 border-b border-slate-800 pb-6">
                    <span className="text-xs font-black uppercase text-[#D4AF37] tracking-wider">
                      {t.entrepreneurs.stepKbisTitle}
                    </span>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Scan className="w-5 h-5 text-emerald-400" />
                      {t.entrepreneurs.stepKbisHeading}
                    </h2>

                    <DocumentDropzone
                      id="entrepreneur-kbis-dropzone"
                      title={t.entrepreneurs.dropzoneDefault}
                      subtitle={t.entrepreneurs.dropzoneSubtext}
                      currentFile={kbisFile}
                      fileSize={kbisFileSize}
                      filePath={kbisFilePath}
                      isScanning={isScanning}
                      scanStep={scanStep}
                      confidenceScore={ocrConfidence}
                      onFileSelected={handleProcessFile}
                      onPathSelected={handleProcessPath}
                      onRemoveFile={handleRemoveFile}
                      locale={locale}
                    />
                  </div>

                  {/* Form inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">{t.entrepreneurs.companyNameLabel}</label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-[#D4AF37]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">{t.entrepreneurs.registrationNumberLabel}</label>
                      <input
                        type="text"
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-[#D4AF37]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">{t.entrepreneurs.directorNameLabel}</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-[#D4AF37]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">{t.entrepreneurs.proEmailLabel}</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-[#D4AF37]"
                      />
                    </div>
                  </div>

                  {/* Sourcing Requirements Form (RFQ Generator) */}
                  <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h3 className="text-base font-bold text-[#E5A93C] flex items-center gap-2">
                      <Package className="w-5 h-5 text-emerald-400" />
                      {t.entrepreneurs.rfqGeneratorHeading}
                    </h3>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-slate-300">
                        {t.entrepreneurs.rfqDescriptionLabel}
                      </label>
                      <textarea
                        rows={3}
                        value={sourcingNeeds}
                        onChange={(e) => setSourcingNeeds(e.target.value)}
                        placeholder={t.entrepreneurs.rfqDescriptionPlaceholder}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-[#D4AF37]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-xl text-sm font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] via-[#E5A93C] to-[#B8860B] hover:from-[#E5A93C] hover:to-[#D4AF37] transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                  >
                    {t.entrepreneurs.submitBuyerBtn}
                  </button>
                </form>
              )}
            </div>
          )}

          {activeTab === 'suppliers' && (
            suppliersList.length === 0 ? (
              <div className="glass-card p-12 rounded-3xl border border-slate-800 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Aucun fournisseur vérifié au catalogue</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  La plateforme démarre avec une base de données vierge (0 donnée fictive). Les producteurs et grossistes agréés apparaîtront ici dès que leur dossier KYB sera validé par la modération.
                </p>
                <div className="pt-2">
                  <Link
                    href="/devenir-fournisseur"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] hover:from-[#E5A93C] hover:to-[#D4AF37] transition-all shadow-md"
                  >
                    <span>Déposer un dossier Fournisseur</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {suppliersList.map((supp) => (
                  <div key={supp.id} className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4 hover:border-[#D4AF37] transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-extrabold text-white text-base">{supp.companyName}</h3>
                        <p className="text-xs text-slate-400">{supp.city}, {supp.country}</p>
                      </div>
                      <BadgeVerified />
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{supp.description}</p>

                    <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                      <span className="text-amber-400 font-bold">{supp.moqSummary}</span>
                      <Link href="/catalogue" className="text-emerald-400 font-bold hover:underline">
                        {t.entrepreneurs.viewCatalogBtn} &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
