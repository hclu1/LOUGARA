import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Plus_Jakarta_Sans, DM_Sans } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { VisitorTracker } from '@/components/VisitorTracker';
import { AuthProvider } from '@/context/AuthContext';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dmsans',
  display: 'swap',
});

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
    <html lang="fr" className={`${jakarta.variable} ${dmSans.variable}`}>
      <body className="flex flex-col min-h-screen bg-[#0B132B] text-slate-100 font-sans antialiased selection:bg-amber-500/30 selection:text-amber-200">
        <AuthProvider>
          <Suspense fallback={null}>
            <VisitorTracker />
          </Suspense>
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
