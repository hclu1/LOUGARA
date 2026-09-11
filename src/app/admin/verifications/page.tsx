'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Upload,
  Building,
  UserCheck,
} from 'lucide-react';
import { BadgeVerified } from '@/components/BadgeVerified';

interface PendingVerification {
  id: string;
  companyName: string;
  country: string;
  city: string;
  sector: string;
  registrationNumber: string;
  submittedAt: string;
  documents: {
    type: string;
    name: string;
    size: string;
  }[];
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

const INITIAL_QUEUE: PendingVerification[] = [
  {
    id: 'comp-101',
    companyName: 'Sahel Agro Industries SA',
    country: 'Sénégal',
    city: 'Thiès',
    sector: 'Agroalimentaire & Épices',
    registrationNumber: 'SN-THS-2022-B-991',
    submittedAt: '10 Septembre 2026',
    documents: [
      { type: 'RCCM / Kbis', name: 'Extrait_RCCM_SahelAgro_2026.pdf', size: '1.2 Mo' },
      { type: 'Identité Gérant', name: 'Passeport_DG_Ousmane_Fall.pdf', size: '2.4 Mo' },
      { type: 'Attestation Fiscale', name: 'Quitus_Fiscal_NINEA_2026.pdf', size: '850 Ko' },
    ],
    status: 'PENDING',
  },
  {
    id: 'comp-102',
    companyName: 'Atelier Wax & Confection Abidjan',
    country: 'Côte d\'Ivoire',
    city: 'Abidjan',
    sector: 'Textile & Mode',
    registrationNumber: 'CI-ABJ-2023-B-4501',
    submittedAt: '11 Septembre 2026',
    documents: [
      { type: 'RCCM / Kbis', name: 'Registre_Commerce_CI_2026.pdf', size: '1.8 Mo' },
      { type: 'Identité Gérante', name: 'CNI_Kouassi_Abla.pdf', size: '1.1 Mo' },
    ],
    status: 'PENDING',
  },
];

export default function AdminVerificationsPage() {
  const [queue, setQueue] = useState<PendingVerification[]>(INITIAL_QUEUE);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Formulaire Fournisseur (dépôt nouveau dossier)
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCountry, setNewCountry] = useState('Sénégal');
  const [newSector, setNewSector] = useState('Cosmétique');
  const [newRegNumber, setNewRegNumber] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const handleApprove = (id: string, name: string) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'VERIFIED' } : item
      )
    );
    setSuccessMessage(`L'entreprise "${name}" est désormais officiellement Fournisseur Vérifié Lougara !`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleReject = (id: string, name: string) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'REJECTED' } : item
      )
    );
  };

  const handleSubmitNewCompany = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: PendingVerification = {
      id: `comp-${Date.now()}`,
      companyName: newCompanyName,
      country: newCountry,
      city: 'Paris / Dakar',
      sector: newSector,
      registrationNumber: newRegNumber || 'RC-EN-COURS',
      submittedAt: 'Aujourd\'hui',
      documents: [
        { type: 'RCCM / Kbis', name: 'Document_officiel_soumis.pdf', size: '1.5 Mo' },
      ],
      status: 'PENDING',
    };
    setQueue([newEntry, ...queue]);
    setSubmissionSuccess(true);
    setNewCompanyName('');
    setNewRegNumber('');
    setTimeout(() => setSubmissionSuccess(false), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* En-tête */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Centre de Confiance & Vérification KYB
            </h1>
            <p className="text-slate-600 text-sm mt-0.5">
              Contrôle rigoureux des immatriculations et attribution du badge officiel Lougara.
            </p>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne gauche : File d'attente d'audit pour l'équipe / Admin */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              Dossiers Fournisseurs en attente de validation
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {queue.filter((q) => q.status === 'PENDING').length} en attente
            </span>
          </div>

          <div className="space-y-4">
            {queue.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">{item.companyName}</h3>
                      {item.status === 'VERIFIED' && <BadgeVerified />}
                      {item.status === 'REJECTED' && (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          Rejeté
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.city}, {item.country} &bull; Secteur : {item.sector} &bull; N° Légal : {item.registrationNumber}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400">Soumis le {item.submittedAt}</span>
                </div>

                {/* Pièces justificatives */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Pièces Légales Téléversées (Bucket Privé Sécurisé) :
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {item.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                          <span className="font-medium text-slate-800 truncate">{doc.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 flex-shrink-0 ml-2">
                          {doc.size}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions de modération */}
                {item.status === 'PENDING' && (
                  <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                    <button
                      onClick={() => handleReject(item.id, item.companyName)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
                    >
                      Rejeter le dossier
                    </button>
                    <button
                      onClick={() => handleApprove(item.id, item.companyName)}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Valider & Attribuer le Badge
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Colonne droite : Formulaire Fournisseur Onboarding */}
        <div className="space-y-6">
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 space-y-4">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-base">
                Vous êtes Fournisseur ?
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Soumettez votre dossier d&apos;immatriculation pour obtenir le badge et être mis en relation avec les acheteurs européens et africains.
            </p>

            {submissionSuccess && (
              <div className="p-3 rounded-xl bg-emerald-100/70 border border-emerald-300 text-xs font-semibold text-emerald-800">
                Dossier envoyé avec succès pour instruction !
              </div>
            )}

            <form onSubmit={handleSubmitNewCompany} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Raison Sociale
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Sahel Karité Export SARL"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pays d&apos;immatriculation
                </label>
                <select
                  value={newCountry}
                  onChange={(e) => setNewCountry(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Sénégal">Sénégal</option>
                  <option value="Côte d'Ivoire">Côte d&apos;Ivoire</option>
                  <option value="France">France</option>
                  <option value="Bénin">Bénin</option>
                  <option value="Togo">Togo</option>
                  <option value="Madagascar">Madagascar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Secteur d&apos;activité
                </label>
                <select
                  value={newSector}
                  onChange={(e) => setNewSector(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Cosmétique">Cosmétique & Soins</option>
                  <option value="Textile">Textile, Coton & Wax</option>
                  <option value="Agroalimentaire">Agroalimentaire & Épices</option>
                  <option value="Artisanat">Artisanat & Décoration</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  N° Registre du Commerce (RCCM / SIRET)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: SN-DKR-2024-B-771"
                  value={newRegNumber}
                  onChange={(e) => setNewRegNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dépôt du Kbis / RCCM (PDF)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-3 text-center cursor-pointer hover:border-emerald-500 bg-white">
                  <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <span className="text-[11px] text-slate-500">
                    Cliquez pour téléverser votre extrait d&apos;immatriculation
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-emerald-600 transition-colors shadow-sm"
              >
                Soumettre mon entreprise
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
