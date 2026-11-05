import React from 'react';
import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] bg-[#0B132B] text-slate-100 flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full glass-card gold-glow-border p-8 rounded-3xl text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-950/80 border border-amber-500/40 text-[#E5A93C] flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(212,175,55,0.3)]">
          <FileQuestion className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40">
            Erreur 404 &bull; Page Introuvable
          </span>
          <h1 className="text-2xl font-black text-white">Page Non Trouvée</h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            La page que vous recherchez n&apos;existe pas ou a été déplacée.
          </p>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] shadow-md"
          >
            <Home className="w-4 h-4 text-slate-950" />
            <span>Retourner à l&apos;Accueil</span>
          </Link>

          <Link
            href="/catalogue"
            className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
          >
            Consulter le Catalogue B2B
          </Link>
        </div>
      </div>
    </div>
  );
}
