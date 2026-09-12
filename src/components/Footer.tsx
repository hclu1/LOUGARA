import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { APP_VERSION_LABEL } from '@/version';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                L
              </div>
              <span className="text-xl font-bold text-white tracking-tight">LOUGARA</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed mb-4">
              La plateforme B2B de confiance connectant les entrepreneurs et les grossistes d&apos;Afrique et d&apos;Europe. Sourcing sécurisé, entreprises immatriculées et auditées.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-md">
              <ShieldCheck className="w-4 h-4" />
              Charte de Vérification Administrative Rigoureuse (RCCM / Kbis / CNI)
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Secteurs Pilotes
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/catalogue?cat=Cosmétique" className="hover:text-emerald-400 transition-colors">Cosmétique & Beauté Naturelle</Link></li>
              <li><Link href="/catalogue?cat=Textile" className="hover:text-emerald-400 transition-colors">Textile, Coton & Mode</Link></li>
              <li><Link href="/catalogue?cat=Agroalimentaire" className="hover:text-emerald-400 transition-colors">Agroalimentaire & Épices</Link></li>
              <li><Link href="/catalogue?cat=Artisanat" className="hover:text-emerald-400 transition-colors">Artisanat & Décoration</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Corridors Prioritaires
            </h4>
            <ul className="space-y-2 text-sm">
              <li>France &bull; Sénégal</li>
              <li>France &bull; Côte d&apos;Ivoire</li>
              <li>Belgique &bull; Afrique de l&apos;Ouest</li>
              <li>Union Européenne &bull; Zone UEMOA</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-2">
            <p>&copy; {new Date().getFullYear()} Lougara B2B. Tous droits réservés.</p>
            <span className="text-slate-600">&bull;</span>
            <span className="font-mono text-emerald-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60 font-medium">
              {APP_VERSION_LABEL}
            </span>
          </div>
          <p>Plateforme de sourcing et de mise en relation professionnelle.</p>
        </div>
      </div>
    </footer>
  );
};
