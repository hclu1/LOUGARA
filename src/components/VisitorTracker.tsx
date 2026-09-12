'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { VisitorType } from '@/features/analytics/types';

export function VisitorTracker() {
  const pathname = usePathname();
  const lastLoggedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;

    // Ignorer le trafic interne d'administration pour ne pas fausser les statistiques
    if (pathname.startsWith('/admin')) {
      return;
    }

    // Éviter de loguer deux fois la même page dans le même cycle de rendu
    if (lastLoggedPath.current === pathname) {
      return;
    }
    lastLoggedPath.current = pathname;

    // Qualification du type de visiteur selon l'intention de navigation
    let visitorType: VisitorType = 'CURIEUX';

    if (pathname.startsWith('/entrepreneurs')) {
      visitorType = 'ENTREPRENEUR';
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('lougara_user_intent', 'ENTREPRENEUR');
      }
    } else if (pathname.startsWith('/devenir-fournisseur')) {
      visitorType = 'FOURNISSEUR';
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('lougara_user_intent', 'FOURNISSEUR');
      }
    } else {
      // Pour les autres pages (Accueil, Catalogue, Tarifs)
      // Si l'utilisateur avait précédemment manifesté un profil, on préserve son audience, sinon "CURIEUX"
      const rememberedIntent = typeof window !== 'undefined'
        ? (window.sessionStorage.getItem('lougara_user_intent') as VisitorType | null)
        : null;

      if (rememberedIntent === 'ENTREPRENEUR' || rememberedIntent === 'FOURNISSEUR') {
        visitorType = rememberedIntent;
      } else {
        visitorType = 'CURIEUX';
      }
    }

    // Envoi asynchrone non-bloquant de la visite
    fetch('/api/analytics/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: visitorType,
        page: pathname,
        referrer: typeof document !== 'undefined' ? document.referrer : '',
      }),
    }).catch(() => {
      // Erreur silencieuse pour ne pas perturber l'expérience utilisateur
    });
  }, [pathname]);

  return null;
}
