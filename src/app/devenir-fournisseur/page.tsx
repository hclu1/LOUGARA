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
  const [cniFile, setCniFile] = useState<string | null>(null);

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

  const handleKbisUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setKbisFile(file.name);
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
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Programme Fournisseurs Pilotes Lougara
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Rejoignez le réseau B2B et obtenez le badge{' '}
          <span className="text-emerald-600">« Fournisseur Vérifié »</span>
        </h1>

        <p className="text-slate-600 text-base leading-relaxed">
          Vous êtes grossiste, producteur ou fabricant en Afrique ou en Europe ? Développez votre clientèle auprès d&apos;entrepreneurs qualifiés grâce à un statut certifié de confiance.
        </p>
      </div>

      {/* Avantages Fournisseur */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <FileCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Badge Officiel Attribué</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Vos documents légaux (RCCM/Kbis) sont audités sous 48h, vous démarquant instantanément de la concurrence.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Globe2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Visibilité Afrique &bull; Europe</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Vos produits et vos conditions B2B (prix, MOQ) sont directement exposés à des acheteurs ciblés.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Demandes de Devis Directes</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Recevez des demandes d&apos;échantillons et de volumes sans commissions cachées ni intermédiaires opaques.
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
              Dossier & Produit transmis avec succès !
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Votre demande pour <span className="font-semibold">{companyName}</span> et votre produit{' '}
              <span className="font-semibold">&laquo; {productTitle || 'Produit phare'} &raquo;</span> ont bien été enregistrés. L&apos;équipe Lougara analyse vos pièces sous 48h.
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
            {/* 1. Informations Entreprise */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Étape 1 sur 4
                </span>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                  <Building className="w-5 h-5 text-emerald-600" />
                  Informations sur votre entreprise
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ces éléments composeront votre profil fournisseur officiel sur Lougara.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Raison Sociale / Nom commercial *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ex: Africa Bio Extracts SARL"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Numéro Légal d&apos;Immatriculation (RCCM / SIRET) *
                  </label>
                  <input
                    type="text"
                    required
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    placeholder="Ex: SN-DKR-2022-B-1284 ou SIRET 912 345 678"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Pays d&apos;immatriculation / Siège *
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

            {/* 2. Produit Phare & Image Produit (NOUVELLE SECTION) */}
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

            {/* 3. Téléversement Sécurisé KYB */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Étape 3 sur 4
                </span>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Dépôt des pièces légales pour le statut « Vérifié Lougara »
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Vos documents sont transmis dans un coffre-fort numérique sécurisé (bucket privé) et ne sont consultables que par nos auditeurs.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-5 text-center cursor-pointer transition-colors block bg-slate-50/50">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleKbisUpload}
                    className="hidden"
                  />
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800">
                    {kbisFile ? `Fichier : ${kbisFile}` : 'Extrait RCCM ou Kbis récent *'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Format PDF ou image (Moins de 3 mois)
                  </p>
                </label>

                <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-5 text-center cursor-pointer transition-colors block bg-slate-50/50">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleCniUpload}
                    className="hidden"
                  />
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800">
                    {cniFile ? `Fichier : ${cniFile}` : 'Pièce d\'identité du Dirigeant *'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Passeport ou CNI en cours de validité
                  </p>
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
                    Nom & Prénom *
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
                * Champs obligatoires pour l&apos;audit de conformité et l&apos;obtention du badge
              </span>
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all"
              >
                Soumettre mon entreprise et mon produit
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
