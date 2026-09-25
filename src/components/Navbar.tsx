'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Search, Building2, Lock, Users, Award, LogOut, UserCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const Navbar = () => {
  const { user, isModerator, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-[#0B132B]/85 backdrop-blur-xl border-b border-[#D4AF37]/20 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              {/* Metallic Gold Emblem Logo */}
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#E5A93C] to-[#B8860B] flex items-center justify-center text-slate-950 font-black text-2xl shadow-[0_0_20px_rgba(212,175,55,0.4)] group-hover:scale-105 transition-transform duration-300 border border-amber-200/50">
                L
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-2xl tracking-tight text-white group-hover:text-amber-300 transition-colors">
                    LOUGARA
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#D4AF37]/15 text-[#E5A93C] border border-[#D4AF37]/30">
                    Sourcing B2B
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-400">
                  Corridor Afrique &bull; Europe &bull; Certifié KYB
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-300">
            <Link
              href="/catalogue"
              className="flex items-center gap-1.5 hover:text-[#E5A93C] transition-colors py-1"
            >
              <Search className="w-4 h-4 text-[#D4AF37]" />
              Catalogue & Sourcing
            </Link>

            <Link
              href="/entrepreneurs"
              className="flex items-center gap-1.5 hover:text-[#E5A93C] transition-colors py-1"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              Espace Entrepreneurs
            </Link>

            <Link
              href="/devenir-fournisseur"
              className="flex items-center gap-1.5 hover:text-[#E5A93C] transition-colors py-1"
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              Devenir Fournisseur
            </Link>

            <Link
              href="/verification"
              className="flex items-center gap-1.5 hover:text-[#E5A93C] transition-colors py-1"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Garantie Vérification
            </Link>

            <Link
              href="/tarifs"
              className="flex items-center gap-1.5 hover:text-[#E5A93C] transition-colors py-1"
            >
              <Award className="w-4 h-4 text-amber-400" />
              Tarifs & Abonnements
            </Link>
          </nav>

          {/* Action CTA & Conditional Admin/Moderator Link */}
          <div className="flex items-center gap-3">
            {/* L'onglet Espace Modérateur s'affiche UNIQUEMENT pour asherilla4@gmail.com et champagcrypt@gmail.com */}
            {isModerator && (
              <Link
                href="/moderation"
                className="hidden lg:inline-flex items-center gap-1.5 text-xs font-black text-amber-200 bg-gradient-to-r from-amber-950 to-slate-900 hover:from-amber-900 hover:to-slate-800 px-3.5 py-2 rounded-xl border border-[#D4AF37]/60 shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all"
                title="Console de modération réservée aux adresses modérateurs autorisées"
              >
                <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Espace Modérateur</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
              </Link>
            )}

            {/* User Session Info / Connexion */}
            {user ? (
              <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs">
                <div className="flex flex-col text-right">
                  <span className="font-bold text-white max-w-[130px] truncate">{user.email}</span>
                  <span className="text-[10px] uppercase font-mono text-amber-400 font-extrabold">{user.role}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Se déconnecter"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/connexion"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-all"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Se connecter</span>
              </Link>
            )}

            <Link
              href="/catalogue"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-extrabold text-slate-950 bg-gradient-to-r from-[#D4AF37] via-[#E5A93C] to-[#B8860B] hover:from-[#E5A93C] hover:to-[#D4AF37] rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <Search className="w-4 h-4 text-slate-950" />
              <span>Trouver un Fournisseur</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
