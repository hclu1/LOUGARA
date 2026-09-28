import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vérification KYB & Audit d\'Entreprises B2B',
  description:
    'Découvrez le processus d\'audit de sécurité Lougara. Contrôle des immatriculations légales RCCM, Kbis, NIF et conformité des fournisseurs B2B.',
  keywords: [
    'vérification RCCM Kbis fournisseur Afrique',
    'contrôle conformité KYB B2B',
    'audit légal entreprise import export',
    'anti fraude négoce international Afrique',
    'KYB business verification Africa',
  ],
  alternates: {
    canonical: '/verification',
  },
  openGraph: {
    title: 'Processus de Vérification KYB & Sécurité B2B | LOUGARA',
    description:
      'Audit rigoureux sur pièces légales (RCCM, Kbis, NIF) pour garantir la fiabilité de chaque fournisseur certifié.',
    url: 'https://lougara.com/verification',
  },
};

export default function VerificationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
