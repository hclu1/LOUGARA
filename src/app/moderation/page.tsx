'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  ShieldCheck,
  Users,
  Package,
  Award,
  Activity,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Settings,
  FileSearch,
  ExternalLink,
  ShieldAlert,
  Edit,
  Sliders,
  DollarSign,
  User,
  Building2,
  Mail,
  Phone,
  Check,
  X,
} from 'lucide-react';
import { useAuth, MODERATOR_EMAILS } from '@/context/AuthContext';
import AdminVerificationsPage from '../admin/verifications/page';

interface UserAccount {
  id: string;
  email: string;
  role: string;
  name: string;
  companyName: string;
  country: string;
  status: 'active' | 'pending' | 'suspended' | 'rejected';
  registeredAt: string;
}

export default function ModerationHubPage() {
  const router = useRouter();
  const { user, isModerator, isSuperAdmin, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'verifications' | 'users' | 'catalogs' | 'pricing' | 'audit'>('verifications');

  // Gestion des utilisateurs modérés
  const [usersList, setUsersList] = useState<UserAccount[]>([
    {
      id: 'usr-1',
      email: 'contact@africabio.sn',
      role: 'supplier',
      name: 'Amadou Diallo',
      companyName: 'Africa Bio Extracts SARL',
      country: 'Sénégal',
      status: 'active',
      registeredAt: '2026-09-21',
    },
    {
      id: 'usr-2',
      email: 'direction@ivoiretextile.ci',
      role: 'supplier',
      name: 'Kouassi Koffi',
      companyName: 'Ivoire Textiles & Confection',
      country: "Côte d'Ivoire",
      status: 'active',
      registeredAt: '2026-09-20',
    },
    {
      id: 'usr-[#D4AF37]',
      email: 'elodie@botanica-paris.fr',
      role: 'entrepreneur',
      name: 'Élodie Laurent',
      companyName: 'Boutique Botanica Paris',
      country: 'France',
      status: 'active',
      registeredAt: '2026-09-22',
    },
    {
      id: 'usr-4',
      email: 'asherilla4@gmail.com',
      role: 'moderator',
      name: 'Asherilla Modérateur',
      companyName: 'Équipe Modération Lougara',
      country: 'France',
      status: 'active',
      registeredAt: '2026-09-01',
    },
    {
      id: 'usr-5',
      email: 'champagcrypt@gmail.com',
      role: 'super_admin',
      name: 'ChampagCrypt SuperAdmin',
      companyName: 'Administration Système Lougara',
      country: 'France',
      status: 'active',
      registeredAt: '2026-09-01',
    },
  ]);

  const [userQuery, setUserQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Pricing configuration state
  const [supplierPlanPrice, setSupplierPlanPrice] = useState('Tarif à venir');
  const [buyerPlanPrice, setBuyerPlanPrice] = useState('Tarif à venir');
  const [maxProductsLimit, setMaxProductsLimit] = useState(10);
  const [anonymityEnforced, setAnonymityEnforced] = useState(true);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B132B] flex items-center justify-center text-slate-300">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          <span>Vérification des accréditations modérateur...</span>
        </div>
      </div>
    );
  }

  // ACCÈS STRICTEMENT RESTREINT : Seuls asherilla4@gmail.com et champagcrypt@gmail.com ont accès
  if (!isModerator) {
    return (
      <div className="min-h-screen bg-[#0B132B] text-slate-100 py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="max-w-lg w-full glass-card gold-glow-border p-8 rounded-3xl text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-rose-950/80 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(244,63,94,0.3)]">
            <ShieldAlert className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-500/40">
              Accès Interdit / Zone Protegée
            </span>
            <h1 className="text-2xl font-black text-white">Espace Modérateur Restreint</h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              L&apos;onglet et la console de modération sont strictement réservés aux deux comptes modérateurs habilités :
            </p>
            <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 font-mono text-xs text-amber-300 space-y-1 my-2">
              <p>• asherilla4@gmail.com</p>
              <p>• champagcrypt@gmail.com</p>
            </div>
            <p className="text-xs text-slate-400">
              Votre compte actuel ({user ? user.email : 'Visiteur non connecté'}) ne possède pas les privilèges modérateurs.
            </p>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <Link
              href="/moderation/login"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] shadow-md"
            >
              <Lock className="w-4 h-4 text-slate-950" />
              <span>Se Connecter avec un Compte Modérateur</span>
            </Link>

            <Link
              href="/"
              className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
            >
              &larr; Retourner à l&apos;accueil public
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleToggleUserStatus = (id: string) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const newStatus = u.status === 'active' ? 'suspended' : 'active';
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const filteredUsers = usersList.filter((u) => {
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    if (userQuery.trim()) {
      const q = userQuery.toLowerCase();
      return (
        u.email.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        u.companyName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* BANDEAU ACCUEIL MODÉRATEUR */}
        <div className="glass-card gold-glow-border p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#E5A93C] to-[#B8860B] text-slate-950 flex items-center justify-center font-black shadow-[0_0_20px_rgba(212,175,55,0.4)]">
              <Lock className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">Espace Modérateur & Administration</h1>
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  {isSuperAdmin ? 'Super Administrateur' : 'Modérateur Agréé'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Bienvenue <strong className="text-amber-300">{user?.email}</strong>. Contrôle KYB, gestion des comptes, anonymat et tarification.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              Comptes modérateurs actifs : 2/2
            </span>
          </div>
        </div>

        {/* BARRE D'ONGLETS DU DASHBOARD */}
        <div className="flex border-b border-slate-800 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('verifications')}
            className={`flex items-center gap-2 pb-3 px-5 text-xs font-black transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'verifications'
                ? 'border-[#D4AF37] text-[#E5A93C]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            1. Audits KYB & Pièces Légales
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 pb-3 px-5 text-xs font-black transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-[#D4AF37] text-[#E5A93C]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-400" />
            2. Gestion des Utilisateurs ({usersList.length})
          </button>

          <button
            onClick={() => setActiveTab('catalogs')}
            className={`flex items-center gap-2 pb-3 px-5 text-xs font-black transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'catalogs'
                ? 'border-[#D4AF37] text-[#E5A93C]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4 text-amber-400" />
            3. Modération Catalogues & Anonymat
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`flex items-center gap-2 pb-3 px-5 text-xs font-black transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'pricing'
                ? 'border-[#D4AF37] text-[#E5A93C]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4 text-purple-400" />
            4. Configuration Offres & Limites
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 pb-3 px-5 text-xs font-black transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-[#D4AF37] text-[#E5A93C]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4 text-blue-400" />
            5. Journal des Actions de Modération
          </button>
        </div>

        {/* ONGLET 1 : CONSOLE AUDIT KYB */}
        {activeTab === 'verifications' && <AdminVerificationsPage />}

        {/* ONGLET 2 : GESTION DES UTILISATEURS */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-white">Utilisateurs Enregistrés sur la Plateforme</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Gestion des comptes entrepreneurs, fournisseurs et modérateurs habilités.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Recherche par nom, email, société..."
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white focus:ring-2 focus:ring-[#D4AF37]"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 text-xs text-slate-200"
                >
                  <option value="all">Tous statut</option>
                  <option value="active">Actifs</option>
                  <option value="suspended">Suspendus</option>
                </select>
              </div>
            </div>

            <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase font-black text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-4">Utilisateur / E-mail</th>
                    <th className="p-4">Rôle</th>
                    <th className="p-4">Société</th>
                    <th className="p-4">Pays</th>
                    <th className="p-4">Statut Compte</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4 font-bold text-white">
                        <div>{u.name}</div>
                        <div className="text-[11px] text-amber-300 font-mono font-normal">{u.email}</div>
                      </td>
                      <td className="p-4 uppercase font-extrabold text-[10px]">
                        <span
                          className={`px-2 py-0.5 rounded ${
                            u.role.includes('admin') || u.role === 'moderator'
                              ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                              : u.role === 'supplier'
                              ? 'bg-blue-950 text-blue-300 border border-blue-500/40'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-slate-200">{u.companyName}</td>
                      <td className="p-4 text-slate-400">{u.country}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            u.status === 'active'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                              : 'bg-rose-950 text-rose-400 border border-rose-500/40'
                          }`}
                        >
                          {u.status === 'active' ? 'Actif' : 'Suspendu'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {/* Empêcher de suspendre les comptes modérateurs maîtres */}
                        {MODERATOR_EMAILS.includes(u.email.toLowerCase()) ? (
                          <span className="text-[10px] text-slate-500 italic">Compte Protégé</span>
                        ) : (
                          <button
                            onClick={() => handleToggleUserStatus(u.id)}
                            className={`px-3 py-1 rounded-xl text-[10px] font-bold ${
                              u.status === 'active'
                                ? 'bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-500/40'
                                : 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-500/40'
                            }`}
                          >
                            {u.status === 'active' ? 'Suspendre' : 'Réactiver'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ONGLET 3 : MODÉRATION CATALOGUES & ANONYMAT */}
        {activeTab === 'catalogs' && (
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-3">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-400" />
                Règles de Modération de l&apos;Anonymat Fournisseurs
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Le modèle Lougara garantit que les coordonnées, noms légaux et numéros direct des fournisseurs restent masqués dans le catalogue public jusqu&apos;à la souscription d&apos;une offre et la validation de la mise en relation.
              </p>

              <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700/80 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-white">Anonymisation Automatique des Vitrines</h4>
                  <p className="text-[11px] text-slate-400">
                    Masque les numéros de téléphone et e-mails dans les titres et descriptions publiques de tous les produits.
                  </p>
                </div>
                <button
                  onClick={() => setAnonymityEnforced(!anonymityEnforced)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
                    anonymityEnforced
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {anonymityEnforced ? 'Anonymat Stricte Activé ✓' : 'Désactivé ✗'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ONGLET 4 : CONFIGURATION OFFRES & TARIFS */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-lg font-black text-white">Configuration des Offres & Limites de Produits</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ajustez la structure tarifaire et les quotas d&apos;exposition au catalogue.
                  </p>
                </div>
                <span className="text-xs font-bold text-amber-300 bg-amber-950 px-3 py-1 rounded-xl border border-amber-500/40">
                  Statut : Tarifs en Configuration
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* OFFRES FOURNISSEURS */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-extrabold text-[#E5A93C]">Formules Fournisseurs</h3>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Affichage du Prix dans la Grille</label>
                    <input
                      type="text"
                      value={supplierPlanPrice}
                      onChange={(e) => setSupplierPlanPrice(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Limite Max de Produits par Catalogue</label>
                    <input
                      type="number"
                      value={maxProductsLimit}
                      onChange={(e) => setMaxProductsLimit(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white"
                    />
                  </div>
                </div>

                {/* OFFRES ENTREPRENEURS */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-extrabold text-emerald-400">Formules Entrepreneurs</h3>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Affichage du Prix dans la Grille</label>
                    <input
                      type="text"
                      value={buyerPlanPrice}
                      onChange={(e) => setBuyerPlanPrice(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ONGLET 5 : JOURNAL D'AUDIT */}
        {activeTab === 'audit' && (
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <h2 className="text-lg font-black text-white">Journal d&apos;Activité & Historique de Modération</h2>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex justify-between items-center text-slate-300">
                <span>[2026-09-25 10:15] Badge "Vérifié Lougara" attribué à <strong>Africa Bio Extracts SARL</strong> par asherilla4@gmail.com</span>
                <span className="text-[10px] text-emerald-400 font-bold font-mono">VALIDE</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex justify-between items-center text-slate-300">
                <span>[2026-09-25 09:40] Validation de l&apos;extrait Kbis par OCR pour <strong>Ivoire Textiles</strong> par champagcrypt@gmail.com</span>
                <span className="text-[10px] text-emerald-400 font-bold font-mono">VALIDE</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
