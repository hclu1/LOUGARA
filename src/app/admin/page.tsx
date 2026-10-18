'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Lock,
  ShieldCheck,
  Users,
  Package,
  Activity,
  Settings,
  ShieldAlert,
  DollarSign,
  Wrench,
  Power,
  Sparkles,
  KeyRound,
} from 'lucide-react';
import { useAuth, MODERATOR_EMAILS } from '@/context/AuthContext';
import { AdminRoleLoginGate, AdminRoleChoice } from '@/components/AdminRoleLoginGate';
import AdminVerificationsPage from './verifications/page';
import { AdminPasswordValidationPanel } from './mots-de-passe/page';

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

export default function AdminHubPage() {
  const { user, isModerator, isSuperAdmin, isLoading } = useAuth();
  const [switchingRole, setSwitchingRole] = useState<AdminRoleChoice | null>(null);
  const [activeTab, setActiveTab] = useState<
    'passwords' | 'verifications' | 'users' | 'catalogs' | 'pricing' | 'audit'
  >('passwords');

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
      id: 'usr-3',
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
      name: 'Hervé SuperAdmin',
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

  // Maintenance state pour le Super Admin
  const [maintenance, setMaintenance] = useState<{
    isMaintenanceActive: boolean;
    lastActiveVersion: string;
    currentAppVersion: string;
    isVersionMismatch: boolean;
    message: string;
  } | null>(null);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);

  const fetchMaintenance = async () => {
    try {
      const res = await fetch(`/api/system/maintenance?_t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setMaintenance(data);
      }
    } catch (e) {
      console.warn('Erreur chargement maintenance:', e);
    }
  };

  useEffect(() => {
    if (isModerator) {
      fetchMaintenance();
      const interval = setInterval(fetchMaintenance, 10000);
      return () => clearInterval(interval);
    }
  }, [isModerator]);

  const handleToggleMaintenance = async (active: boolean) => {
    if (!isModerator || !user?.email) return;
    setMaintenanceLoading(true);
    try {
      const res = await fetch('/api/system/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isMaintenanceActive: active,
          requesterEmail: user.email,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMaintenance(data);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('lougara-maintenance-updated'));
        }
      } else {
        alert(data.error || 'Erreur lors de la modification du mode maintenance');
      }
    } catch {
      alert('Erreur réseau');
    } finally {
      setMaintenanceLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B132B] flex items-center justify-center text-slate-300">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold">Vérification des accréditations...</span>
        </div>
      </div>
    );
  }

  // PROTECTION STRICTE : Seuls les rôles `moderator` et `super_admin` ont accès à `/admin`.
  // Chaque fois que l'utilisateur arrive sur `/admin` (ou choisit de changer de profil), il dispose des 2 choix : `moderator` et `super_admin`.
  if (!isModerator || switchingRole !== null) {
    return (
      <AdminRoleLoginGate
        defaultRole={switchingRole || 'moderator'}
        onAuthenticated={() => setSwitchingRole(null)}
        onCancelSwitch={isModerator ? () => setSwitchingRole(null) : undefined}
      />
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
        {/* BANDEAU ACCUEIL ESPACE ADMIN AVEC LES 2 CHOIX DE CONNEXION (MODERATOR / SUPER_ADMIN) */}
        <div className="glass-card gold-glow-border p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#E5A93C] to-[#B8860B] text-slate-950 flex items-center justify-center font-black shadow-[0_0_20px_rgba(212,175,55,0.4)]">
              <Lock className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  Espace Administration Lougara
                </h1>
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  {isSuperAdmin ? 'super_admin' : 'moderator'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Connecté en tant que <strong className="text-amber-300">{user?.email}</strong> ({user?.role}).
              </p>

              {/* SÉLECTEUR PERMANENT DES 2 CHOIX DE CONNEXION ADMIN */}
              <div className="flex flex-wrap items-center gap-2 mt-2.5">
                <span className="text-[11px] font-bold text-slate-400">
                  Mode de connexion Admin :
                </span>
                <button
                  type="button"
                  onClick={() => setSwitchingRole('moderator')}
                  className={`px-3 py-1 rounded-xl text-[11px] font-black border transition-all cursor-pointer ${
                    !isSuperAdmin
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-amber-400/60'
                  }`}
                >
                  Modérateur (moderator)
                </button>
                <button
                  type="button"
                  onClick={() => setSwitchingRole('super_admin')}
                  className={`px-3 py-1 rounded-xl text-[11px] font-black border transition-all cursor-pointer ${
                    isSuperAdmin
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-emerald-400/60'
                  }`}
                >
                  Super Admin (super_admin)
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isModerator && (
              <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
                <span
                  className={`inline-flex h-2.5 w-2.5 rounded-full ${
                    maintenance?.isMaintenanceActive ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'
                  }`}
                />
                <span className="text-xs font-bold text-slate-200">
                  {maintenance?.isMaintenanceActive ? '🔴 Maintenance' : '🟢 En ligne'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer ml-1">
                  <input
                    type="checkbox"
                    checked={Boolean(maintenance?.isMaintenanceActive)}
                    onChange={(e) => handleToggleMaintenance(e.target.checked)}
                    disabled={maintenanceLoading}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
            )}

            <Link
              href="/admin/mots-de-passe"
              className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 px-3.5 py-1.5 rounded-xl border border-emerald-500/40 transition-all"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Page Validation Mots de Passe</span>
            </Link>

            <Link
              href="/admin/paiements"
              className="inline-flex items-center gap-1.5 text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] hover:opacity-95 px-3.5 py-1.5 rounded-xl shadow-md transition-all"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Virements RIB & Paiements</span>
            </Link>
          </div>
        </div>

        {/* CARTE ADMIN : SITE EN MAINTENANCE / REMISE EN SERVICE */}
        {isModerator && (
          <div
            className={`glass-card rounded-3xl border-2 p-5 sm:p-6 transition-all space-y-4 ${
              maintenance?.isMaintenanceActive
                ? 'bg-gradient-to-r from-red-950/30 via-amber-950/20 to-red-950/30 border-amber-500/60 shadow-[0_0_30px_rgba(245,158,11,0.2)]'
                : 'border-slate-800 bg-slate-900/40'
            }`}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div
                  className={`p-3 rounded-2xl border ${
                    maintenance?.isMaintenanceActive
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 animate-pulse'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400'
                  }`}
                >
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-black text-white">Mode Maintenance du Site Public</h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${
                        maintenance?.isMaintenanceActive
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      }`}
                    >
                      {maintenance?.isMaintenanceActive
                        ? '🔴 Maintenance Active (Site Public Verrouillé)'
                        : '🟢 Site en ligne (Accessible à tous)'}
                    </span>
                    {maintenance?.isVersionMismatch && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-200 border border-amber-500/30">
                        <Sparkles className="w-3 h-3" /> MàJ v{maintenance?.currentAppVersion}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    {maintenance?.isMaintenanceActive
                      ? 'Toutes les routes publiques affichent uniquement la page de maintenance. Aucun produit ni contenu public n’est accessible aux visiteurs et utilisateurs non-administrateurs.'
                      : 'Le site public est actuellement ouvert à tous les visiteurs. Activez la maintenance pour suspendre temporairement l’accès public.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0 self-stretch sm:self-auto justify-between sm:justify-start">
                {maintenance?.isMaintenanceActive && (
                  <button
                    onClick={() => handleToggleMaintenance(false)}
                    disabled={maintenanceLoading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <Power className={`w-3.5 h-3.5 ${maintenanceLoading ? 'animate-spin' : ''}`} />
                    <span>Remettre en service le site public</span>
                  </button>
                )}

                <div className="flex items-center gap-2.5 bg-slate-950 p-2.5 px-3.5 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    id="superadmin-main-maintenance-checkbox"
                    checked={Boolean(maintenance?.isMaintenanceActive)}
                    onChange={(e) => handleToggleMaintenance(e.target.checked)}
                    disabled={maintenanceLoading}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700 cursor-pointer"
                  />
                  <label
                    htmlFor="superadmin-main-maintenance-checkbox"
                    className="text-xs font-bold text-slate-200 cursor-pointer select-none"
                  >
                    Site en maintenance
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BARRE D'ONGLETS DU DASHBOARD ADMIN */}
        <div className="flex border-b border-slate-800 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('passwords')}
            className={`flex items-center gap-2 pb-3 px-5 text-xs font-black transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'passwords'
                ? 'border-[#D4AF37] text-[#E5A93C]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4 text-emerald-400" />
            1. Validation des Mots de Passe Clients
          </button>

          <button
            onClick={() => setActiveTab('verifications')}
            className={`flex items-center gap-2 pb-3 px-5 text-xs font-black transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'verifications'
                ? 'border-[#D4AF37] text-[#E5A93C]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            2. Audits KYB & Pièces Légales
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
            3. Gestion des Utilisateurs ({usersList.length})
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
            4. Modération Catalogues & Anonymat
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
            5. Configuration Offres & Limites
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
            6. Journal des Actions
          </button>
        </div>

        {/* ONGLET 1 : VALIDATION DES MOTS DE PASSE */}
        {activeTab === 'passwords' && <AdminPasswordValidationPanel embedded={true} />}

        {/* ONGLET 2 : CONSOLE AUDIT KYB */}
        {activeTab === 'verifications' && <AdminVerificationsPage />}

        {/* ONGLET 3 : GESTION DES UTILISATEURS */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-white">
                  Utilisateurs Enregistrés sur la Plateforme
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Gestion des comptes entrepreneurs, fournisseurs et administrateurs habilités.
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
                  <option value="all">Tous statuts</option>
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
                        <div className="text-[11px] text-amber-300 font-mono font-normal">
                          {u.email}
                        </div>
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

        {/* ONGLET 4 : MODÉRATION CATALOGUES & ANONYMAT */}
        {activeTab === 'catalogs' && (
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-3">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-400" />
                Règles de Modération de l&apos;Anonymat Fournisseurs
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Le modèle Lougara garantit que les coordonnées, noms légaux et numéros directs des fournisseurs restent masqués dans le catalogue public jusqu&apos;à la souscription d&apos;une offre et la validation de la mise en relation.
              </p>

              <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700/80 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Anonymisation Automatique des Vitrines
                  </h4>
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
                  {anonymityEnforced ? 'Anonymat Strict Activé ✓' : 'Désactivé ✗'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ONGLET 5 : CONFIGURATION OFFRES & TARIFS */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-lg font-black text-white">
                    Configuration des Offres & Limites de Produits
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ajustez la structure tarifaire et les quotas d&apos;exposition au catalogue.
                  </p>
                </div>
                <span className="text-xs font-bold text-amber-300 bg-amber-950 px-3 py-1 rounded-xl border border-amber-500/40">
                  Statut : Tarifs en Configuration
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-extrabold text-[#E5A93C]">Formules Fournisseurs</h3>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Affichage du Prix dans la Grille
                    </label>
                    <input
                      type="text"
                      value={supplierPlanPrice}
                      onChange={(e) => setSupplierPlanPrice(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Limite Max de Produits par Catalogue
                    </label>
                    <input
                      type="number"
                      value={maxProductsLimit}
                      onChange={(e) => setMaxProductsLimit(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-extrabold text-emerald-400">Formules Entrepreneurs</h3>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Affichage du Prix dans la Grille
                    </label>
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

        {/* ONGLET 6 : JOURNAL D'AUDIT */}
        {activeTab === 'audit' && (
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <h2 className="text-lg font-black text-white">
              Journal d&apos;Activité & Historique de Modération
            </h2>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex justify-between items-center text-slate-300">
                <span>
                  [2026-10-18 10:15] Validation du mot de passe client pour{' '}
                  <strong>Sahel Agro-Industrie SA</strong>
                </span>
                <span className="text-[10px] text-emerald-400 font-bold font-mono">VALIDE</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex justify-between items-center text-slate-300">
                <span>
                  [2026-09-25 10:15] Badge &quot;Vérifié Lougara&quot; attribué à{' '}
                  <strong>Africa Bio Extracts SARL</strong>
                </span>
                <span className="text-[10px] text-emerald-400 font-bold font-mono">VALIDE</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
