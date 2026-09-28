import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Espace Entrepreneurs | Sourcing & Acheteurs B2B',
  description:
    'Trouvez des fournisseurs vérifiés pour vos achats en gros. Éliminez les risques du négoce Afrique-Europe avec un sourcing certifié sur documents officiels.',
  keywords: [
    'sourcing sécurisé acheteur Afrique',
    'trouver fournisseur fiable Afrique de l\'Ouest',
    'passer commande de gros sécurisée B2B',
    'mise en relation acheteur grossiste certifié',
    'safe B2B sourcing for African entrepreneurs',
  ],
  alternates: {
    canonical: '/entrepreneurs',
  },
  openGraph: {
    title: 'Espace Entrepreneurs & Sourcing B2B | LOUGARA',
    description:
      'Accédez à des fournisseurs vérifiés sur pièces, négociez en direct et sécurisez vos approvisionnements transfrontaliers.',
    url: 'https://lougara.com/entrepreneurs',
  },
};

export default function EntrepreneursLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
