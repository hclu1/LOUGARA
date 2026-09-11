import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'LOUGARA | Sourcing B2B & Fournisseurs Vérifiés Afrique - Europe',
  description:
    'Mise en relation d\'affaires de confiance entre entrepreneurs et grossistes d\'Afrique et d\'Europe. Statut Fournisseur Vérifié, catalogue certifié, devis directs.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="flex flex-col min-h-screen text-slate-900 antialiased selection:bg-emerald-100 selection:text-emerald-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
