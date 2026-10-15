'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface BadgeVerifiedProps {
  className?: string;
  showText?: boolean;
}

export const BadgeVerified: React.FC<BadgeVerifiedProps> = ({
  className = '',
  showText = true,
}) => {
  const { locale } = useLanguage();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#0F172A]/90 text-emerald-300 border border-[#D4AF37]/40 shadow-[0_0_12px_rgba(16,185,129,0.2)] backdrop-blur-md ${className}`}
      title={
        locale === 'fr'
          ? 'Fournisseur Vérifié Lougara : Registre du Commerce, Identité & Fiscalité contrôlés par audit officiel'
          : 'Lougara Verified Supplier: Commercial Register, Photo ID & Tax Compliance verified by official audit'
      }
    >
      <span className="w-2 h-2 rounded-full bg-emerald-400 emerald-pulse shrink-0" />
      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
      {showText && (
        <span className="tracking-wide">
          {locale === 'fr' ? 'Vérifié Lougara' : 'Lougara Verified'}
        </span>
      )}
    </span>
  );
};
