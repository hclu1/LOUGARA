import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Search, Building2, Lock } from 'lucide-react';

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                L
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  LOUGARA
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  B2B Afrique &bull; Europe
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link
              href="/catalogue"
              className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors"
            >
              <Search className="w-4 h-4" />
              Catalogue & Sourcing
            </Link>

            <Link
              href="/devenir-fournisseur"
              className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors text-emerald-700 font-semibold"
            >
              <Building2 className="w-4 h-4 text-emerald-600" />
              Devenir Fournisseur
            </Link>

            <Link
              href="/#confiance"
              className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Garantie Vérification
            </Link>
          </nav>

          {/* Action CTA & Admin link */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin/verifications"
              className="hidden lg:inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors"
              title="Console d'audit réservée à l'équipe interne"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Espace Modérateur
            </Link>

            <Link
              href="/catalogue"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all"
            >
              <Search className="w-4 h-4" />
              Trouver un Fournisseur
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
