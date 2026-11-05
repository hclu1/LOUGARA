import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Connexion & Accès Espace Sécurisé',
  description: 'Connectez-vous à votre espace Fournisseur ou Acheteur sur LOUGARA B2B.',
};

export default function ConnexionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
