'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Sparkles, Globe, MapPin, Award } from 'lucide-react';
import { APP_VERSION_LABEL } from '@/version';
import { useLanguage } from '@/context/LanguageContext';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#070C1B] text-slate-400 py-16 border-t border-[#D4AF37]/20 mt-24 relative overflow-hidden">
      {/* Subtle background aura */}
      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-full max-w-7xl h-64 bg-amber-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Col 1 & 2: Brand & Verification Charter */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-white px-3 py-1.5 rounded-2xl border border-amber-400/50 shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="LOUGARA Sourcing B2B"
                  className="h-12 w-auto object-contain max-w-[180px]"
                />
              </div>
            </div>

            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              {t.footer.brandDesc}
            </p>

            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-3.5 py-2 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t.footer.auditCharter}</span>
            </div>
          </div>

          {/* Col 3: Secteurs Pilotes */}
          <div>
            <h4 className="text-xs font-extrabold text-[#D4AF37] uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E5A93C]" />
              {t.footer.sectorsHeading}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/catalogue?cat=Cosmétique" className="hover:text-amber-300 transition-colors">
                  {t.footer.sectorCosmetic}
                </Link>
              </li>
              <li>
                <Link href="/catalogue?cat=Textile" className="hover:text-amber-300 transition-colors">
                  {t.footer.sectorTextile}
                </Link>
              </li>
              <li>
                <Link href="/catalogue?cat=Agroalimentaire" className="hover:text-amber-300 transition-colors">
                  {t.footer.sectorAgro}
                </Link>
              </li>
              <li>
                <Link href="/catalogue?cat=Artisanat" className="hover:text-amber-300 transition-colors">
                  {t.footer.sectorCraft}
                </Link>
              </li>
              <li className="pt-2">
                <Link href="/verification" className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {t.footer.auditGuideLink}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Corridors Prioritaires */}
          <div>
            <h4 className="text-xs font-extrabold text-[#D4AF37] uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#E5A93C]" />
              {t.footer.corridorsHeading}
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{t.footer.corridor1}</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{t.footer.corridor2}</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{t.footer.corridor3}</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{t.footer.corridor4}</span>
              </li>
              <li className="pt-3 border-t border-slate-800">
                <Link href="/tarifs" className="text-[#E5A93C] hover:text-amber-200 text-xs font-bold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  {t.footer.pricingLink}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & version badge */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-3">
            <p>&copy; {new Date().getFullYear()} Lougara B2B. {t.footer.copyright}</p>
            <span className="text-slate-700">&bull;</span>
            <span className="font-mono text-amber-400 bg-slate-900 px-2.5 py-1 rounded-md border border-[#D4AF37]/30 font-bold shadow-sm">
              {APP_VERSION_LABEL}
            </span>
          </div>
          <p className="text-slate-400">
            {t.footer.platformSub}
          </p>
        </div>
      </div>
    </footer>
  );
};
