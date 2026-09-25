'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body style={{ backgroundColor: '#0B132B', color: '#ffffff', fontFamily: 'sans-serif', padding: '3rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Une erreur inattendue est survenue</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>
          {error?.message || "Erreur système globale"}
        </p>
        <button
          onClick={() => reset()}
          style={{ marginTop: '1.5rem', padding: '0.5rem 1.5rem', backgroundColor: '#D4AF37', color: '#090d16', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Réessayer
        </button>
      </body>
    </html>
  );
}
