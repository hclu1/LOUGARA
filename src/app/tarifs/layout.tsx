import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tarifs & Abonnements | Accès Fournisseurs & Entrepreneurs',
  description:
    'Découvrez les offres et tarifs de la plateforme Lougara. Abonnements adaptés aux entrepreneurs et aux grossistes certifiés.',
  keywords: [
    'tarifs plateforme B2B sourcing Afrique',
    'abonnement grossiste certifié Lougara',
    'prix vérification KYB entreprise B2B',
  ],
  alternates: {
    canonical: '/tarifs',
  },
  openGraph: {
    title: 'Tarifs & Abonnements B2B | LOUGARA',
    description:
      'Plans et tarifs transparents pour accéder au catalogue de fournisseurs vérifiés et à la mise en relation directe.',
    url: 'https://lougara.com/tarifs',
  },
};

export default function TarifsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
