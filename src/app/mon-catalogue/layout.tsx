import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Mon Catalogue & Vitrine B2B | Lougara',
  description: 'Gérez votre vitrine professionnelle, ajoutez des produits et renseignez vos liens officiels sur Lougara.',
};

export default function MonCatalogueLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
