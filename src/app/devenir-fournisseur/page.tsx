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
} from 'lucide-react';
import { BadgeVerified } from '@/components/BadgeVerified';

export default function DevenirFournisseurPage() {
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('Sénégal');
  const [city, setCity] = useState('');
  const [sector, setSector] = useState('Cosmétique & Soins');
  const [regNumber, setRegNumber] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

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
              Dossier transmis avec succès !
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Votre demande pour <span className="font-semibold">{companyName}</span> est désormais entre les mains de l&apos;équipe de vérification Lougara. Vous recevrez une notification par e-mail sous 48 heures.
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
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-600" />
                Informations sur votre entreprise
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Ces informations permettront d&apos;éditer votre profil fournisseur certifié.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

            {/* Téléversement Sécurisé KYB */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Dépôt des pièces légales pour le statut « Vérifié Lougara »
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Vos documents sont transmis dans un coffre-fort numérique sécurisé (bucket privé) et ne sont consultables que par nos auditeurs.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center hover:border-emerald-500 cursor-pointer transition-colors bg-slate-50/50">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800">
                    Extrait RCCM ou Kbis récent *
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Format PDF ou image (Moins de 3 mois)
                  </p>
                </div>

                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center hover:border-emerald-500 cursor-pointer transition-colors bg-slate-50/50">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800">
                    Pièce d&apos;identité du Dirigeant *
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Passeport ou CNI en cours de validité
                  </p>
                </div>
              </div>
            </div>

            {/* Coordonnées de Contact */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Coordonnées du représentant
              </h3>

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

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                * Champs obligatoires pour l&apos;audit de conformité
              </span>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all"
              >
                Soumettre mon dossier de fournisseur
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
