'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building,
  Upload,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  FileCheck,
  Globe2,
  TrendingUp,
  Package,
  Image as ImageIcon,
  X,
  Sparkles,
  Scan,
  Loader2,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { BadgeVerified } from '@/components/BadgeVerified';

export default function DevenirFournisseurPage() {
  // Entreprise
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('Sénégal');
  const [city, setCity] = useState('');
  const [sector, setSector] = useState('Cosmétique & Soins');
  const [regNumber, setRegNumber] = useState('');

  // Pièces KYB
  const [kbisFile, setKbisFile] = useState<string | null>(null);
  const [kbisFileSize, setKbisFileSize] = useState<string>('');
  const [cniFile, setCniFile] = useState<string | null>(null);

  // État OCR / Analyse intelligente du Kbis
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [autoFilled, setAutoFilled] = useState(false);

  // Produit Phare & Image
  const [productTitle, setProductTitle] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productMoq, setProductMoq] = useState<number>(10);
  const [productUnit, setProductUnit] = useState('kg');
  const [productPrice, setProductPrice] = useState('8.50');
  const [productImage, setProductImage] = useState<string | null>(null);

  // Contact
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [isSubmitted, setIsSubmitted] = useState(false);

  // Fonction d'extraction automatique intelligente du Kbis
  const processKbisExtraction = (fileName: string, fileSizeStr: string) => {
    setIsScanning(true);
    setScanStep('Lecture optique du document en cours...');

    setTimeout(() => {
      setScanStep('Détection du registre légal (RCCM / SIRET)...');
    }, 600);

    setTimeout(() => {
      setScanStep('Extraction de la raison sociale, du siège et du gérant...');
    }, 1200);

    setTimeout(() => {
      setIsScanning(false);
      setScanStep('');
      setKbisFile(fileName);
      setKbisFileSize(fileSizeStr);
      setAutoFilled(true);

      // Simulation de parsing intelligent selon le document
      const isSenegal = fileName.toLowerCase().includes('sn') || fileName.toLowerCase().includes('sahel') || fileName.toLowerCase().includes('dakar');
      const isIvory = fileName.toLowerCase().includes('ci') || fileName.toLowerCase().includes('ivoire') || fileName.toLowerCase().includes('abidjan');

      if (isIvory) {
        setCompanyName('Ivoire Confection & Wax SARL');
        setRegNumber('CI-ABJ-2023-B-4501');
        setCountry('Côte d\'Ivoire');
        setCity('Abidjan');
        setSector('Textile, Coton & Wax');
        setContactName('Mme Kouassi Abla');
        setProductTitle('Tissu Wax Véritable 100% Coton (Pièces 6 yards)');
        setProductPrice('16.50');
        setProductMoq(50);
        setProductUnit('pièce (6 yards)');
        setEmail('contact@ivoire-confection.ci');
        setPhone('+225 07 12 34 56 78');
      } else if (isSenegal) {
        setCompanyName('Sahel Agro Industries SA');
        setRegNumber('SN-THS-2022-B-991');
        setCountry('Sénégal');
        setCity('Thiès');
        setSector('Agroalimentaire & Épices');
        setContactName('M. Ousmane Fall');
        setProductTitle('Fèves de Cacao Grand Cru Séchées');
        setProductPrice('4.80');
        setProductMoq(100);
        setProductUnit('kg');
        setEmail('direction@sahel-agro.sn');
        setPhone('+221 77 654 32 10');
      } else {
        // Détection générique intelligente
        setCompanyName('Africa Bio Extracts SARL');
        setRegNumber('SN-DKR-2021-B-1284');
        setCountry('Sénégal');
        setCity('Dakar');
        setSector('Cosmétique & Soins');
        setContactName('Mme Amina Diop');
        setProductTitle('Beurre de Karité Bio Brut (Fûts de 25kg)');
        setProductPrice('8.50');
        setProductMoq(4);
        setProductUnit('fût (25kg)');
        setEmail('contact@africabio-extracts.com');
        setPhone('+221 77 123 45 67');
      }
    }, 1800);
  };

  const handleKbisFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr = `${(file.size / 1024 / 1024).toFixed(1)} Mo`;
      processKbisExtraction(file.name, sizeStr);
    }
  };

  const handleSimulateKbisExample = () => {
    processKbisExtraction('Extrait_Kbis_AfricaBioExtracts_2026.pdf', '1.4 Mo');
  };

  // Gestion du téléversement d'image du produit
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCniUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCniFile(file.name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero En-tête */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          Onboarding Intelligent avec Reconnaissance Kbis / RCCM
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Rejoignez le réseau B2B et obtenez le badge{' '}
          <span className="text-emerald-600">« Fournisseur Vérifié »</span>
        </h1>

        <p className="text-slate-600 text-base leading-relaxed">
          Déposez simplement votre Kbis ou RCCM : notre système extrait automatiquement vos données légales pour pré-remplir votre fiche et attache directement la pièce justificative à votre dossier de certification.
        </p>
      </div>

      {/* Avantages Fournisseur */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Scan className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Reconnaissance Immédiate</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Plus besoin de tout saisir manuellement : votre Kbis/RCCM remplit votre fiche en 2 secondes chrono.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FileCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Dépôt KYB Automatique</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            La feuille téléchargée est instantanément enregistrée dans votre coffre-fort d&apos;audit sans double saisie.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Badge Vérifié Activé</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Votre statut est validé rapidement par l&apos;équipe Lougara pour débloquer les demandes de devis d&apos;acheteurs.
          </p>
        </div>
      </div>

      {/* Formulaire d'Onboarding */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm">
        {isSubmitted ? (
          <div className="py-12 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Dossier KYB & Produit transmis avec succès !
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Votre extrait officiel <span className="font-semibold">{kbisFile}</span> a été déposé et vos informations pour{' '}
              <span className="font-semibold">{companyName}</span> sont en cours d&apos;audit sous 48h.
            </p>
            <div className="pt-4">
              <Link
                href="/catalogue"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all"
              >
                Découvrir le catalogue public
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* 1. Zone Dépose Kbis Intelligent */}
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                    Étape 1 sur 4 &bull; Reconnaissance Rapide
                  </span>
                  {autoFilled && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 animate-in fade-in">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Fiche pré-remplie par analyse Kbis
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mt-1">
                  <Scan className="w-5 h-5 text-emerald-600" />
                  Dépôt du Kbis / RCCM & Pré-remplissage automatique
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Glissez votre document officiel pour renseigner automatiquement les champs légaux et l&apos;ajouter au dossier de vérification.
                </p>
              </div>

              {/* Cadre de téléversement Kbis avec OCR */}
              <div className="relative">
                {isScanning ? (
                  <div className="p-8 rounded-2xl border-2 border-emerald-500 bg-emerald-50/50 flex flex-col items-center justify-center text-center space-y-3 animate-pulse">
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                    <h4 className="text-sm font-bold text-slate-900">
                      Analyse OCR intelligente en cours...
                    </h4>
                    <p className="text-xs text-emerald-700 font-medium">
                      {scanStep}
                    </p>
                  </div>
                ) : kbisFile ? (
                  <div className="p-5 rounded-2xl border-2 border-emerald-500/60 bg-emerald-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {kbisFile}
                          </p>
                          <BadgeVerified showText={false} />
                        </div>
                        <p className="text-xs text-emerald-800 font-medium mt-0.5">
                          Extrait officiel analysé &bull; {kbisFileSize || '1.4 Mo'} &bull; Document joint au dossier KYB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <label className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer underline">
                        Remplacer
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={handleKbisFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition-colors block bg-slate-50/70 group">
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleKbisFileChange}
                        className="hidden"
                      />
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        Glissez ici votre extrait Kbis (France) ou RCCM (Afrique)
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Format PDF, JPG ou PNG &bull; Lecture automatique des textes pour remplir la fiche client
                      </p>
                    </label>

                    <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                      <span>Pas de fichier sous la main ?</span>
                      <button
                        type="button"
                        onClick={handleSimulateKbisExample}
                        className="font-semibold text-emerald-600 hover:text-emerald-700 underline flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Tester l&apos;extraction avec un exemple de Kbis
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Champs Entreprise (auto-remplis ou modifiables) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Raison Sociale / Dénomination *
                    </label>
                    {autoFilled && (
                      <span className="text-[10px] text-emerald-600 font-semibold">Extrait du Kbis</span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ex: Africa Bio Extracts SARL"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors ${
                      autoFilled ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200'
                    }`}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Numéro Légal (RCCM / SIRET) *
                    </label>
                    {autoFilled && (
                      <span className="text-[10px] text-emerald-600 font-semibold">Extrait du Kbis</span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    placeholder="Ex: SN-DKR-2021-B-1284 ou SIRET 912 345 678"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors ${
                      autoFilled ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Pays du siège / exploitation *
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Sénégal">Sénégal</option>
                    <option value="Côte d'Ivoire">Côte d&apos;Ivoire</option>
                    <option value="France">France</option>
                    <option value="Bénin">Bénin</option>
                    <option value="Togo">Togo</option>
                    <option value="Cameroun">Cameroun</option>
                    <option value="Mali">Mali</option>
                    <option value="Belgique">Belgique</option>
                    <option value="Madagascar">Madagascar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Ville des entrepôts / siège *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ex: Dakar, Abidjan, Lyon..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Secteur d&apos;activité principal *
                  </label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Cosmétique & Soins">Cosmétique & Soins (Karité, huiles végétales, savons)</option>
                    <option value="Textile, Coton & Wax">Textile, Coton & Wax (Tissus traditionnels, confection)</option>
                    <option value="Agroalimentaire & Épices">Agroalimentaire & Épices (Cacao, café, vanille, cajou)</option>
                    <option value="Artisanat & Décoration">Artisanat & Décoration (Bois, poterie, vannerie)</option>
                    <option value="Emballages & Packaging">Emballages & Packaging professionnel</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Produit Phare & Image Produit */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Étape 2 sur 4
                </span>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                  <Package className="w-5 h-5 text-emerald-600" />
                  Votre Produit Phare / Échantillon B2B
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ajoutez un premier produit avec sa photo pour illustrer la qualité de votre catalogue auprès des acheteurs.
                </p>
              </div>

              {/* Upload Image Produit avec Prévisualisation */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Photographie du produit *
                </label>

                {productImage ? (
                  <div className="relative w-full sm:w-72 h-48 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-sm group">
                    <img
                      src={productImage}
                      alt="Aperçu du produit"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setProductImage(null)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors shadow-md"
                      title="Supprimer la photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-emerald-700 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Image chargée
                    </div>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition-colors block bg-slate-50/60 group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      Cliquez pour téléverser la photo de votre produit
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Formats acceptés : JPG, PNG, WEBP (Dimensions recommandées : 800x800 px)
                    </p>
                  </label>
                )}
              </div>

              {/* Détails Produit */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nom commercial du produit phare *
                  </label>
                  <input
                    type="text"
                    required
                    value={productTitle}
                    onChange={(e) => setProductTitle(e.target.value)}
                    placeholder="Ex: Beurre de Karité Brut Non Raffiné Grade A"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Description & Spécifications techniques
                  </label>
                  <textarea
                    rows={2}
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="Description succincte : méthode d'extraction, labels éventuels, conditionnement..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Prix indicatif B2B (€) *
                  </label>
                  <input
                    type="text"
                    required
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    placeholder="Ex: 8.50"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Unité de vente *
                  </label>
                  <select
                    value={productUnit}
                    onChange={(e) => setProductUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="kg">kilogramme (kg)</option>
                    <option value="fût (25kg)">fût (25kg)</option>
                    <option value="litre">litre (L)</option>
                    <option value="pièce (6 yards)">pièce (6 yards)</option>
                    <option value="carton (50 pièces)">carton (50 pièces)</option>
                    <option value="palette">palette</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Commande Minimum (MOQ) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={productMoq}
                    onChange={(e) => setProductMoq(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. Dépôt des pièces légales pour le statut « Vérifié Lougara » */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Étape 3 sur 4 &bull; Dossier KYB
                </span>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Dépôt des pièces légales pour le statut « Vérifié Lougara »
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Vos pièces sont hébergées dans un coffre-fort numérique sécurisé (bucket privé) pour vérification par les modérateurs.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Extrait Kbis / RCCM déjà fourni à l'étape 1 */}
                {kbisFile ? (
                  <div className="p-5 rounded-2xl border-2 border-emerald-500/50 bg-emerald-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Extrait Kbis / RCCM joint</p>
                        <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">
                          {kbisFile} ({kbisFileSize || '1.4 Mo'})
                        </p>
                        <span className="text-[10px] text-slate-400">Attaché depuis l&apos;Étape 1</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-5 text-center cursor-pointer transition-colors block bg-slate-50/50">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleKbisFileChange}
                      className="hidden"
                    />
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-800">
                      Extrait RCCM ou Kbis récent *
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Format PDF ou image (Moins de 3 mois)
                    </p>
                  </label>
                )}

                {/* Pièce d'identité du Dirigeant */}
                <label className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-colors block ${
                  cniFile ? 'border-emerald-500 bg-emerald-50/40' : 'border-slate-300 hover:border-emerald-500 bg-slate-50/50'
                }`}>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleCniUpload}
                    className="hidden"
                  />
                  {cniFile ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-700">
                      <CheckCircle2 className="w-5 h-5" />
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-900">Pièce d&apos;identité enregistrée</p>
                        <p className="text-[11px] text-emerald-700">{cniFile}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-800">
                        Pièce d&apos;identité du Dirigeant *
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Passeport ou CNI en cours de validité
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* 4. Coordonnées de Contact */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Étape 4 sur 4
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                  Coordonnées du représentant officiel
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nom & Prénom du Dirigeant *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Mme Amina Diop"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-mail professionnel *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@entreprise.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Téléphone direct (WhatsApp pro) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+221 77 000 00 00"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-slate-400">
                * Le Kbis déposé à l&apos;étape 1 est automatiquement enregistré pour l&apos;audit légal KYB
              </span>
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all"
              >
                Soumettre mon dossier complet et mon produit
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
