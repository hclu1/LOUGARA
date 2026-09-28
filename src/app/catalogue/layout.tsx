import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Catalogue des Grossistes Certifiés & Produits B2B',
  description:
    'Explorez le catalogue des fournisseurs vérifiés d\'Afrique et d\'Europe. Grossistes en textile wax, karité bio, cosmétique naturelle, agroalimentaire et équipements.',
  keywords: [
    'fournisseur beurre de karité vérifié Sénégal',
    'grossiste tissu wax export France',
    'fournisseur cosmétique bio Afrique',
    'grossiste agroalimentaire Afrique de l\'Ouest',
    'catalogue grossistes certifiés B2B',
    'verified shea butter supplier Senegal',
    'African wax fabric wholesaler',
  ],
  alternates: {
    canonical: '/catalogue',
  },
  openGraph: {
    title: 'Catalogue Grossistes & Sourcing Produit B2B | LOUGARA',
    description:
      'Recherchez des fournisseurs vérifiés sur pièces KYB et demandez des devis directement auprès de grossistes certifiés d\'Afrique et d\'Europe.',
    url: 'https://lougara.com/catalogue',
  },
};

export default function CatalogueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
