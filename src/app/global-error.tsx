'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body className="bg-[#0B132B] text-white flex items-center justify-center min-h-screen p-4">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-xl font-black">Une erreur inattendue est survenue</h2>
          <p className="text-xs text-slate-400">
            L&apos;application a rencontré une interruption temporaire.
          </p>
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-slate-950 font-black rounded-xl text-xs shadow-md"
          >
            Réinitialiser l&apos;affichage
          </button>
        </div>
      </body>
    </html>
  );
}
