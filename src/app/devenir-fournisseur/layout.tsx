import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Devenir Fournisseur Vérifié | Vendre en Gros Afrique & Europe',
  description:
    'Devenez Fournisseur Vérifié sur Lougara. Faites auditer votre immatriculation (RCCM/Kbis) et gagnez la confiance des acheteurs internationaux.',
  keywords: [
    'obtenez le badge fournisseur vérifié KYB',
    'vendre en gros Afrique Europe B2B',
    'référencement grossiste certifié',
    'exporter produits Afrique vers Europe',
    'verified supplier badge application B2B',
  ],
  alternates: {
    canonical: '/devenir-fournisseur',
  },
  openGraph: {
    title: 'Devenir Fournisseur Vérifié B2B | LOUGARA',
    description:
      'Rejoignez les grossistes certifiés sur Lougara et développez vos ventes B2B en Afrique et en Europe.',
    url: 'https://lougara.com/devenir-fournisseur',
  },
};

export default function DevenirFournisseurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
