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
import { parseKbisOcrText, ParsedKbisData } from '@/features/ocr/kbis-parser';

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

const VERIFIED_SUPPLIERS_LIST: VerifiedSupplierItem[] = [
  {
    id: 'supp-1',
    companyName: 'Africa Bio Extracts SARL',
    country: 'Sénégal',
    city: 'Dakar',
    sector: 'Cosmétique & Soins',
    regNumber: 'SN-DKR-2021-B-8912',
    description: 'Producteur et exportateur agréé de Beurre de Karité Bio Grade A, huile de baobab et savon noir naturel.',
    verifiedAt: 'Septembre 2026',
    products: ['Beurre de Karité Bio Brut', 'Huile de Baobab Pure', 'Savon Noir Artisanal'],
    contactRole: 'Amina Diop (Directrice Export)',
    moqSummary: 'À partir de 4 fûts (100 kg)',
  },
  {
    id: 'supp-2',
    companyName: 'Sahel Agro Industries SA',
    country: 'Sénégal',
    city: 'Thiès',
    sector: 'Agroalimentaire & Épices',
    regNumber: 'SN-THS-2022-B-991',
    description: 'Transformation et exportation certifiée de noix de cajou, piment séché, arachides et fleur d\'hibiscus (Bissap).',
    verifiedAt: 'Août 2026',
    products: ['Noix de Cajou W320', 'Fleurs d\'Hibiscus Séchées (Bissap)', 'Piment d\'Afrique séché'],
    contactRole: 'Ousmane Sow (Responsable Commercial)',
    moqSummary: 'À partir de 50 kg',
  },
  {
    id: 'supp-3',
    companyName: 'Ivoire Cacao & Épices Coop',
    country: 'Côte d\'Ivoire',
    city: 'San-Pédro',
    sector: 'Agroalimentaire & Épices',
    regNumber: 'CI-SP-2020-B-1402',
    description: 'Coopérative de producteurs certifiés commerce équitable. Fèves de cacao fermentées et séchées au soleil.',
    verifiedAt: 'Septembre 2026',
    products: ['Fèves de Cacao Grade 1', 'Poudre de Cacao Pure', 'Beurre de Cacao'],
    contactRole: 'Kouassi Konan (Gérant Coopérative)',
    moqSummary: 'À partir de 1 tonne (palettes)',
  },
];

export default function EspaceEntrepreneursPage() {
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
  const [suppliersList, setSuppliersList] = useState<VerifiedSupplierItem[]>(VERIFIED_SUPPLIERS_LIST);

  const fetchEntrepreneurs = async () => {
    try {
      const res = await fetch('/api/entrepreneurs/register');
      if (res.ok) {
        const data = await res.json();
        if (data.entrepreneurs) setEntrepreneursList(data.entrepreneurs);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchEntrepreneurs();
  }, []);

  const applyParsedData = (data: ParsedKbisData, fileName: string, fileSizeStr: string) => {
    setKbisFile(fileName);
    setKbisFileSize(fileSizeStr);
    setAutoFilled(true);
    setOcrConfidence(data.confidenceScore);
    setRawOcrText(data.rawText);
    if (data.companyName) setCompanyName(data.companyName);
    if (data.regNumber) setRegistrationNumber(data.regNumber);
    if (data.country) setCountry(data.country);
    if (data.city) setCity(data.city);
    if (data.contactName) setFullName(data.contactName);
  };

  const handleKbisFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr = `${(file.size / 1024 / 1024).toFixed(2)} Mo`;
    setIsScanning(true);
    setScanStep(`Détection du document...`);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/ocr/kbis', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setIsScanning(false);
          applyParsedData(result.data, file.name, sizeStr);
          return;
        }
      }
    } catch (err) {}

    setIsScanning(false);
    setKbisFile(file.name);
    setKbisFileSize(sizeStr);
    setAutoFilled(true);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
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
          phone,
          country,
          city,
          buyerType,
          targetSectors,
          estimatedBudget,
          sourcingNeeds,
          targetQuantity,
          subscriptionPlan,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setRegisteredSuccess(true);
        setRegisteredId(data.entrepreneur?.id || 'OK');
      }
    } catch (e) {
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
            <span>Hub d&apos;Approvisionnement B2B Acheteurs & Entrepreneurs</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Espace Entrepreneurs & <span className="text-gold-gradient">Générateur RFQ</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Identifiez les meilleurs producteurs vérifiés, déposez vos appels d&apos;offres et générez des devis directs en toute sérénité.
          </p>
        </div>

        {/* 4-STEP BUYER ROADMAP TIMELINE WITH GOLD CIRCULAR STEP INDICATORS */}
        <section className="glass-card p-8 sm:p-10 rounded-3xl border border-[#D4AF37]/30 space-y-8 relative overflow-hidden">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">
              Parcours d&apos;Achat Sécurisé
            </span>
            <h2 className="text-2xl font-black text-white">
              Feuille de Route de l&apos;Acheteur B2B (4 Étapes)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center space-y-3 relative z-10 group">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D4AF37] via-[#E5A93C] to-[#B8860B] text-slate-950 font-black text-xl flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)] group-hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="font-extrabold text-white text-base">Immatriculation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dépôt de votre extrait Kbis ou RCCM pour valider votre statut d&apos;acheteur professionnel.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center space-y-3 relative z-10 group">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D4AF37] via-[#E5A93C] to-[#B8860B] text-slate-950 font-black text-xl flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)] group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="font-extrabold text-white text-base">Audit KYB</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Contrôle optique OCR immédiat et attribution du pass d&apos;accès au réseau privé.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center space-y-3 relative z-10 group">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D4AF37] via-[#E5A93C] to-[#B8860B] text-slate-950 font-black text-xl flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)] group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="font-extrabold text-white text-base">Sourcing Cible</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Recherche par corridor commercial et filtres par catégories et MOQ.
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center space-y-3 relative z-10 group">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 font-black text-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] group-hover:scale-110 transition-transform">
                4
              </div>
              <h3 className="font-extrabold text-white text-base">Devis Direct (RFQ)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Négociation directe sans intermédiaire et émission de cotations officielles.
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
              1. Inscription Acheteur & OCR Kbis
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`pb-4 px-6 font-extrabold text-sm border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'suppliers' ? 'border-[#D4AF37] text-[#E5A93C]' : 'border-transparent text-slate-400'
              }`}
            >
              2. Contact Direct Fournisseurs ({suppliersList.length})
            </button>
          </div>

          {activeTab === 'register' && (
            <div className="glass-card p-8 sm:p-10 rounded-3xl border border-slate-800 space-y-8">
              {registeredSuccess ? (
                <div className="py-8 text-center space-y-4 max-w-lg mx-auto">
                  <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-white">Inscription Validée !</h3>
                  <p className="text-sm text-slate-300">
                    Votre profil acheteur pour <span className="font-bold text-amber-300">{companyName}</span> est désormais actif sur Lougara.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-8">
                  {/* Step 1: Kbis Dropzone */}
                  <div className="space-y-4 border-b border-slate-800 pb-6">
                    <span className="text-xs font-black uppercase text-[#D4AF37] tracking-wider">
                      Étape 1 &bull; Dépôt Kbis & Reconnaissance OCR Instantanée
                    </span>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Scan className="w-5 h-5 text-emerald-400" />
                      Analyse Légale Automatique (Kbis / RCCM)
                    </h2>

                    <label className="border-2 border-dashed border-slate-700 hover:border-[#D4AF37] rounded-2xl p-6 text-center cursor-pointer transition-colors block bg-slate-900/60">
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.webp"
                        onChange={handleKbisFileChange}
                        className="hidden"
                      />
                      <Upload className="w-8 h-8 text-[#D4AF37] mx-auto mb-2" />
                      <p className="text-sm font-bold text-white">
                        {kbisFile ? `Document sélectionné : ${kbisFile}` : 'Déposez votre Extrait Kbis / RCCM'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        PDF, PNG, JPG &bull; OCR WebAssembly local ultra-rapide
                      </p>
                    </label>
                  </div>

                  {/* Form inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Raison Sociale *</label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-[#D4AF37]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Numéro SIREN / RCCM</label>
                      <input
                        type="text"
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-[#D4AF37]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Nom du Dirigeant *</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-[#D4AF37]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">E-mail Professionnel *</label>
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
                      Générateur de Demande de Cotation (RFQ)
                    </h3>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-slate-300">
                        Description de vos besoins d&apos;approvisionnement
                      </label>
                      <textarea
                        rows={3}
                        value={sourcingNeeds}
                        onChange={(e) => setSourcingNeeds(e.target.value)}
                        placeholder="Ex: Recherche de 500 kg de beurre de karité bio brut pour livraison trimestrielle en France..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm text-white focus:ring-2 focus:ring-[#D4AF37]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-xl text-sm font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] via-[#E5A93C] to-[#B8860B] hover:from-[#E5A93C] hover:to-[#D4AF37] transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                  >
                    Valider mon profil & Générer mon Pass Acheteur
                  </button>
                </form>
              )}
            </div>
          )}

          {activeTab === 'suppliers' && (
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
                      Voir catalogue &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
