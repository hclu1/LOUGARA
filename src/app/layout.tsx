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
    'Plateforme B2B de mise en relation de confiance entre entrepreneurs et grossistes certifiés d\'Afrique et d\'Europe. Statut Fournisseur Vérifié sur pièces KYB, catalogue produits, devis directs.',
  keywords: [
    'sourcing B2B Afrique',
    'fournisseurs vérifiés',
    'grossistes Afrique de l\'Ouest',
    'import export Afrique Europe',
    'catalogue grossiste certifié',
    'contrôle KYB Kbis',
    'négoce international B2B',
  ],
  authors: [{ name: 'LOUGARA' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://lougara.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'LOUGARA | Sourcing B2B & Fournisseurs Vérifiés Afrique - Europe',
    description:
      'Mise en relation de confiance entre entrepreneurs et grossistes d\'Afrique et d\'Europe. Fournisseurs vérifiés sur pièces, catalogues certifiés et devis directs.',
    url: 'https://lougara.com',
    siteName: 'LOUGARA Sourcing B2B',
    locale: 'fr_FR',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
