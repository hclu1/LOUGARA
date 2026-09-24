import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Search, Building2, Lock, Users, Sparkles, Award } from 'lucide-react';

export const Navbar = () => {
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

          {/* Action CTA & Admin link */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin/verifications"
              className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-700/80 transition-all"
              title="Console d'audit réservée à l'équipe interne de modération"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              Espace Modérateur
            </Link>

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
