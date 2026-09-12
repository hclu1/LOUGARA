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
} from 'lucide-react';
import { BadgeVerified } from '@/components/BadgeVerified';

// Mock des fournisseurs vérifiés disponibles pour contact direct
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
  {
    id: 'supp-4',
    companyName: 'Wax & Tissus Traditionnels d\'Afrique',
    country: 'Côte d\'Ivoire',
    city: 'Abidjan',
    sector: 'Textile, Coton & Wax',
    regNumber: 'CI-ABJ-2023-B-3104',
    description: 'Confection et grossiste de tissus wax authentiques, pagnes tissés traditionnels et coton d\'Afrique de l\'Ouest.',
    verifiedAt: 'Juillet 2026',
    products: ['Wax Véritable 6 Yards', 'Tissu Kente Traditionnel', 'Bogolan Teinté Main'],
    contactRole: 'Mariam Coulibaly (Directrice de Vente)',
    moqSummary: 'À partir de 20 pièces',
  },
  {
    id: 'supp-5',
    companyName: 'INFONET WEB GROUP SAS',
    country: 'France',
    city: 'Paris',
    sector: 'Technologies, Numérique & Télécoms',
    regNumber: '123 456 789 R.C.S. Paris',
    description: 'Fournisseur de solutions informatiques B2B, portails d\'informations légales et intégration d\'infrastructures cloud.',
    verifiedAt: 'Février 2026',
    products: ['Solutions Logicielles Cloud', 'API Données d\'Entreprises', 'Conseil Systèmes'],
    contactRole: 'JULIEN DUPÉ (Président)',
    moqSummary: 'Contrats B2B sur mesure',
  },
];

export default function EspaceEntrepreneursPage() {
  const [activeTab, setActiveTab] = useState<'register' | 'suppliers' | 'tenders' | 'directory'>('register');

  // Formulaire d'inscription
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('France');
  const [city, setCity] = useState('');
  const [buyerType, setBuyerType] = useState<string>('Boutique physique & Concept store');
  const [targetSectors, setTargetSectors] = useState<string[]>(['Cosmétique & Soins']);
  const [estimatedBudget, setEstimatedBudget] = useState<string>('1 000 € à 5 000 € / mois');
  const [sourcingNeeds, setSourcingNeeds] = useState('');

  // États de soumission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const [registeredId, setRegisteredId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Modal de mise en relation directe
  const [selectedSupplier, setSelectedSupplier] = useState<VerifiedSupplierItem | null>(null);
  const [inquiryQuantity, setInquiryQuantity] = useState('');
  const [inquiryDestination, setInquiryDestination] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [isInquirySending, setIsInquirySending] = useState(false);
  const [inquirySentSuccess, setInquirySentSuccess] = useState(false);

  // Appel d'offres / Besoin de sourcing
  const [tenderTitle, setTenderTitle] = useState('');
  const [tenderSector, setTenderSector] = useState('Cosmétique & Soins');
  const [tenderQuantity, setTenderQuantity] = useState('');
  const [tenderBudget, setTenderBudget] = useState('');
  const [tenderDestination, setTenderDestination] = useState('France (Port du Havre)');
  const [tenderDescription, setTenderDescription] = useState('');
  const [isTenderSubmitting, setIsTenderSubmitting] = useState(false);
  const [tenderSentSuccess, setTenderSentSuccess] = useState(false);

  // Liste des entrepreneurs inscrits
  const [entrepreneursList, setEntrepreneursList] = useState<any[]>([]);

  // Chargement de la liste des entrepreneurs
  const fetchEntrepreneurs = async () => {
    try {
      const res = await fetch('/api/entrepreneurs/register');
      if (res.ok) {
        const data = await res.json();
        if (data.entrepreneurs) {
          setEntrepreneursList(data.entrepreneurs);
        }
      }
    } catch (e) {
      console.warn('Erreur chargement entrepreneurs :', e);
    }
  };

  useEffect(() => {
    fetchEntrepreneurs();
  }, []);

  const toggleSector = (sec: string) => {
    if (targetSectors.includes(sec)) {
      if (targetSectors.length > 1) {
        setTargetSectors(targetSectors.filter((s) => s !== sec));
      }
    } else {
      setTargetSectors([...targetSectors, sec]);
    }
  };

  // Soumission Inscription Entrepreneur
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
          email,
          phone,
          country,
          city,
          buyerType,
          targetSectors,
          estimatedBudget,
          sourcingNeeds,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de l\'enregistrement.');
      }

      setRegisteredSuccess(true);
      setRegisteredId(data.entrepreneur?.id || 'OK');
      await fetchEntrepreneurs();
    } catch (err: any) {
      setErrorMessage(err.message || 'Impossible d\'enregistrer votre profil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Soumission Mise en relation avec un Fournisseur
  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    setIsInquirySending(true);

    try {
      const res = await fetch('/api/entrepreneurs/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entrepreneurName: fullName || 'Entrepreneur Acheteur',
          entrepreneurEmail: email || 'contact@acheteur.com',
          entrepreneurPhone: phone || '+33 6 00 00 00 00',
          supplierId: selectedSupplier.id,
          supplierName: selectedSupplier.companyName,
          quantity: inquiryQuantity,
          targetDestination: inquiryDestination || 'France',
          message: inquiryMessage,
        }),
      });

      if (res.ok) {
        setInquirySentSuccess(true);
        setTimeout(() => {
          setInquirySentSuccess(false);
          setSelectedSupplier(null);
          setInquiryQuantity('');
          setInquiryDestination('');
          setInquiryMessage('');
        }, 2000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsInquirySending(false);
    }
  };

  // Soumission d'un appel d'offres
  const handleSendTender = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTenderSubmitting(true);

    try {
      const res = await fetch('/api/entrepreneurs/sourcing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entrepreneurName: fullName || 'Entrepreneur Porteur de Projet',
          entrepreneurEmail: email || 'contact@acheteur-projet.com',
          companyName: companyName || 'Entreprise Acheteuse Déclarée',
          sector: tenderSector,
          title: tenderTitle,
          description: tenderDescription,
          targetQuantity: tenderQuantity,
          targetBudget: tenderBudget,
          destinationCountry: tenderDestination,
        }),
      });

      if (res.ok) {
        setTenderSentSuccess(true);
        setTenderTitle('');
        setTenderDescription('');
        setTenderQuantity('');
        setTenderBudget('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTenderSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
            <Briefcase className="w-4 h-4 text-emerald-600" />
            <span>Réseau Acheteurs & Entrepreneurs • Hub de Sourcing B2B</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Espace Entrepreneurs & Sourcing Direct
          </h1>
          <p className="max-w-2xl mx-auto text-slate-600 text-sm sm:text-base leading-relaxed">
            Trouvez rapidement des producteurs et grossistes vérifiés en Afrique et en Europe. 
            Inscrivez votre entreprise dans la base de données, lancez vos demandes de devis et sécurisez votre approvisionnement.
          </p>

          {/* Indicateurs de confiance */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Plus de 125 entrepreneurs & boutiques inscrits</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Fournisseurs audités (RCCM / Kbis / CNI)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Mise en relation directe sans intermédiaire</span>
            </div>
          </div>
        </div>

        {/* Barre d'onglets principale */}
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 min-w-[180px] py-3 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'register'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>1. S&apos;inscrire comme Entrepreneur</span>
          </button>

          <button
            onClick={() => setActiveTab('suppliers')}
            className={`flex-1 min-w-[180px] py-3 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'suppliers'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>2. Fournisseurs Vérifiés & Contact Direct</span>
          </button>

          <button
            onClick={() => setActiveTab('tenders')}
            className={`flex-1 min-w-[180px] py-3 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'tenders'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>3. Déposer un Appel d&apos;Offres</span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`flex-1 min-w-[180px] py-3 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'directory'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>4. Réseau des Acheteurs ({entrepreneursList.length})</span>
          </button>
        </div>

        {/* ONGLET 1 : FORMULAIRE D'INSCRIPTION ENTREPRENEUR */}
        {activeTab === 'register' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-8">
            {registeredSuccess ? (
              <div className="text-center py-10 space-y-4 max-w-xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Félicitations ! Vous êtes inscrit au Réseau Lougara
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Votre profil d&apos;acheteur pour <strong>{companyName || 'votre entreprise'}</strong> a été 
                  enregistré avec succès dans la base de données. Vous pouvez désormais entrer en contact direct 
                  avec tous les producteurs et grossistes vérifiés.
                </p>
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between gap-4 text-left">
                  <div>
                    <p className="font-bold">Identifiant Acheteur : {registeredId}</p>
                    <p className="text-emerald-700 mt-0.5">Secteurs cibles : {targetSectors.join(', ')}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-200 text-emerald-900 font-bold text-[10px]">
                    Actif en BDD
                  </span>
                </div>
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => setActiveTab('suppliers')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 shadow-md transition-all"
                  >
                    Voir les Fournisseurs Vérifiés
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveTab('tenders')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 text-slate-800 text-sm font-semibold hover:bg-slate-200 transition-all"
                  >
                    Publier un Besoin de Sourcing
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-8">
                {errorMessage && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                    {errorMessage}
                  </div>
                )}

                {/* Étape 1 : Entreprise & Profil */}
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                        Étape 1 sur 3
                      </span>
                      <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                        Votre Entreprise ou Projet d&apos;Achat
                      </h2>
                    </div>
                    <span className="text-xs text-slate-400">Profil Acheteur / Importateur</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nom de votre entreprise, boutique ou marque *
                      </label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Ex: Botanica Store, Dakar Distribution, Wax & Chic..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Type d&apos;acheteur / Structure commerciale *
                      </label>
                      <select
                        value={buyerType}
                        onChange={(e) => setBuyerType(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="Boutique physique & Concept store">Boutique physique & Concept store</option>
                        <option value="E-commerce & Vente en ligne">E-commerce & Vente en ligne</option>
                        <option value="Grossiste & Demi-grossiste">Grossiste & Demi-grossiste</option>
                        <option value="Importateur & Distributeur">Importateur & Distributeur</option>
                        <option value="Restaurateur / Hôtellerie">Restaurateur / Métiers de bouche</option>
                        <option value="Transformateur & Laboratoire">Transformateur & Laboratoire cosmétique</option>
                        <option value="Porteur de projet en création">Porteur de projet en création</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Pays d&apos;implantation ou de distribution *
                      </label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="France">France</option>
                        <option value="Belgique">Belgique</option>
                        <option value="Sénégal">Sénégal</option>
                        <option value="Côte d'Ivoire">Côte d&apos;Ivoire</option>
                        <option value="Bénin">Bénin</option>
                        <option value="Togo">Togo</option>
                        <option value="Cameroun">Cameroun</option>
                        <option value="Mali">Mali</option>
                        <option value="Madagascar">Madagascar</option>
                        <option value="Autre Pays">Autre Pays Europe / Afrique</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Ville principale *
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Ex: Paris, Lyon, Bruxelles, Dakar, Abidjan..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Étape 2 : Besoins de Sourcing */}
                <div className="space-y-4 pt-2">
                  <div className="border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                      Étape 2 sur 3
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                      Vos Besoins de Sourcing & Produits Recherchés
                    </h2>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Secteurs d&apos;approvisionnement prioritaires (choisissez un ou plusieurs) *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {[
                        'Cosmétique & Soins',
                        'Textile, Coton & Wax',
                        'Agroalimentaire & Épices',
                        'Artisanat & Décoration',
                        'Emballages & Packaging',
                        'Technologies & IT',
                      ].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => toggleSector(sec)}
                          className={`px-3 py-2 rounded-xl text-xs font-medium border text-left flex items-center justify-between transition-all ${
                            targetSectors.includes(sec)
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span>{sec}</span>
                          {targetSectors.includes(sec) && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Budget d&apos;achat mensuel estimé *
                      </label>
                      <select
                        value={estimatedBudget}
                        onChange={(e) => setEstimatedBudget(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="< 1 000 € / mois">&lt; 1 000 € / mois (Commandes test / amorçage)</option>
                        <option value="1 000 € à 5 000 € / mois">1 000 € à 5 000 € / mois (Boutiques & créateurs)</option>
                        <option value="5 000 € à 20 000 € / mois">5 000 € à 20 000 € / mois (Grossistes & marques)</option>
                        <option value="> 20 000 € / mois">&gt; 20 000 € / mois (Conteneurs & approvisionnement régulier)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Produits cibles ou spécifications particulières
                      </label>
                      <input
                        type="text"
                        value={sourcingNeeds}
                        onChange={(e) => setSourcingNeeds(e.target.value)}
                        placeholder="Ex: Karité brut Grade A fûts 25kg, Wax 6 yards, Cajou W320..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Étape 3 : Coordonnées du contact officiel */}
                <div className="space-y-4 pt-2">
                  <div className="border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                      Étape 3 sur 3
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                      Coordonnées de l&apos;Entrepreneur Responsable
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
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ex: Sarah Martin ou Amadou Ba"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                        placeholder="contact@mon-entreprise.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                        placeholder="+33 6 12 34 56 78 ou +221 77..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    Vos coordonnées sont sécurisées et réservées aux mises en relation avec les fournisseurs agréés.
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Enregistrement en cours...' : 'S\'inscrire & Enregistrer en Base de Données'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ONGLET 2 : FOURNISSEURS VÉRIFIÉS & CONTACT DIRECT */}
        {activeTab === 'suppliers' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Fournisseurs vérifiés prêts à expédier
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cliquez sur « Se mettre en relation » pour envoyer une demande de cotation ou un message direct.
                </p>
              </div>
              <Link
                href="/catalogue"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                Parcourir tout le catalogue produits
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {VERIFIED_SUPPLIERS_LIST.map((supplier) => (
                <div
                  key={supplier.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg">
                          {supplier.companyName}
                        </h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{supplier.city}, {supplier.country}</span>
                          <span>&bull;</span>
                          <span className="font-semibold text-emerald-700">{supplier.sector}</span>
                        </p>
                      </div>
                      <BadgeVerified size="sm" />
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {supplier.description}
                    </p>

                    <div className="pt-2">
                      <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Produits phares disponibles :
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {supplier.products.map((p) => (
                          <span
                            key={p}
                            className="bg-slate-50 text-slate-700 border border-slate-200 text-[11px] px-2 py-0.5 rounded-md"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1">
                      <p><strong>Contact référent :</strong> {supplier.contactRole}</p>
                      <p><strong>Conditions MOQ :</strong> {supplier.moqSummary}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Immatriculation légale : {supplier.regNumber}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedSupplier(supplier);
                      setInquiryQuantity('Ex: 50 kg ou 10 fûts');
                      setInquiryDestination(country === 'France' ? 'France (Marseille / Paris)' : country);
                      setInquiryMessage(`Bonjour, nous souhaitons commander auprès de ${supplier.companyName}. Pourriez-vous nous communiquer vos disponibilités et devis pour livraison ?`);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Se mettre en contact avec ce fournisseur</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ONGLET 3 : DÉPOSER UN APPEL D'OFFRES */}
        {activeTab === 'tenders' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Publication Rapide
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                Publier un Appel d&apos;Offres ou Besoin de Sourcing
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Votre besoin sera notifié aux producteurs et grossistes agréés du secteur sélectionné.
              </p>
            </div>

            {tenderSentSuccess ? (
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">
                  Votre appel d&apos;offres a été publié avec succès !
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Les fournisseurs vérifiés correspondants ont été alertés et vous recevrez leurs propositions chiffrées directement.
                </p>
                <button
                  onClick={() => setTenderSentSuccess(false)}
                  className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
                >
                  Publier un autre besoin
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendTender} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Titre de votre demande de sourcing *
                    </label>
                    <input
                      type="text"
                      required
                      value={tenderTitle}
                      onChange={(e) => setTenderTitle(e.target.value)}
                      placeholder="Ex: Recherche 50 fûts de Karité Bio brut ou 2 tonnes de Cajou"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Secteur concerné *
                    </label>
                    <select
                      value={tenderSector}
                      onChange={(e) => setTenderSector(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Cosmétique & Soins">Cosmétique & Soins</option>
                      <option value="Agroalimentaire & Épices">Agroalimentaire & Épices</option>
                      <option value="Textile, Coton & Wax">Textile, Coton & Wax</option>
                      <option value="Artisanat & Décoration">Artisanat & Décoration</option>
                      <option value="Emballages & Packaging">Emballages & Packaging</option>
                      <option value="Technologies & Numérique">Technologies & Numérique</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Quantité cible estimée *
                    </label>
                    <input
                      type="text"
                      required
                      value={tenderQuantity}
                      onChange={(e) => setTenderQuantity(e.target.value)}
                      placeholder="Ex: 500 kg, 1 conteneur 20 pieds, 100 pièces..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Port d&apos;arrivée ou Pays de livraison *
                    </label>
                    <input
                      type="text"
                      required
                      value={tenderDestination}
                      onChange={(e) => setTenderDestination(e.target.value)}
                      placeholder="Ex: France (Marseille), Belgique (Anvers), Dakar..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Description détaillée du cahier des charges *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={tenderDescription}
                    onChange={(e) => setTenderDescription(e.target.value)}
                    placeholder="Précisez la qualité attendue (Grade A, Bio, certificats phytosanitaires), le conditionnement et les délais souhaités..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Publication instantanée auprès des fournisseurs certifiés Lougara.
                  </p>
                  <button
                    type="submit"
                    disabled={isTenderSubmitting}
                    className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isTenderSubmitting ? 'Publication...' : 'Publier mon appel d\'offres'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ONGLET 4 : RÉSEAU DES ACHETEURS INSCRITS */}
        {activeTab === 'directory' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Entrepreneurs & Acheteurs enregistrés dans la base Lougara
                </h3>
                <p className="text-xs text-slate-500">
                  Base active des structures acheteuses connectées au réseau.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('register')}
                className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold hover:bg-emerald-100"
              >
                + Ajouter mon entreprise
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {entrepreneursList.map((ent) => (
                <div
                  key={ent.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {ent.companyName}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {ent.fullName} &bull; {ent.city}, {ent.country}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {ent.buyerType?.split(' ')[0] || 'Acheteur'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <p>
                      <strong>Secteurs :</strong>{' '}
                      <span className="text-emerald-700 font-medium">
                        {Array.isArray(ent.targetSectors) ? ent.targetSectors.join(', ') : ent.targetSectors}
                      </span>
                    </p>
                    {ent.sourcingNeeds && (
                      <p className="text-[11px] text-slate-500 italic">
                        « {ent.sourcingNeeds} »
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Enregistré en BDD</span>
                    <span className="text-emerald-600 font-semibold">Vérifié Lougara</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL DE MISE EN RELATION FOURNISSEUR */}
        {selectedSupplier && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                    Mise en relation directe
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    Contacter {selectedSupplier.companyName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedSupplier.city}, {selectedSupplier.country} &bull; {selectedSupplier.contactRole}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSupplier(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {inquirySentSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="text-base font-bold text-slate-900">
                    Message transmis avec succès !
                  </h4>
                  <p className="text-xs text-slate-600">
                    Le fournisseur <strong>{selectedSupplier.companyName}</strong> a reçu votre demande de mise en relation et vous répondra sous 24h.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendInquiry} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Quantité souhaitée *
                      </label>
                      <input
                        type="text"
                        required
                        value={inquiryQuantity}
                        onChange={(e) => setInquiryQuantity(e.target.value)}
                        placeholder="Ex: 5 fûts, 100 kg..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Destination de livraison *
                      </label>
                      <input
                        type="text"
                        required
                        value={inquiryDestination}
                        onChange={(e) => setInquiryDestination(e.target.value)}
                        placeholder="Ex: Port de Marseille, Paris..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Votre message de prise de contact *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSupplier(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isInquirySending}
                      className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isInquirySending ? 'Envoi...' : 'Envoyer la demande'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
