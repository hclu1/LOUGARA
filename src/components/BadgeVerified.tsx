import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface BadgeVerifiedProps {
  className?: string;
  showText?: boolean;
}

export const BadgeVerified: React.FC<BadgeVerifiedProps> = ({
  className = '',
  showText = true,
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm ${className}`}
      title="Fournisseur Vérifié Lougara : identité et immatriculation légale contrôlées"
    >
      <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
      {showText && <span>Vérifié Lougara</span>}
    </span>
  );
};
