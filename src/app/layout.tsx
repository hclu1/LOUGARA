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
  title: {
    default: 'LOUGARA | Sourcing B2B & Fournisseurs Vérifiés Afrique - Europe',
    template: '%s | LOUGARA Sourcing B2B',
  },
  description:
    'Plateforme B2B de mise en relation de confiance entre entrepreneurs et grossistes certifiés d\'Afrique et d\'Europe. Statut Fournisseur Vérifié sur audit KYB, RCCM et Kbis.',
  keywords: [
    // Marque
    'Lougara',
    'Lougara sourcing B2B',
    'Lougara.com',
    // Longue traîne FR
    'fournisseur vérifié Afrique Europe',
    'grossiste certifié Afrique de l\'Ouest',
    'plateforme négoce B2B Afrique',
    'sourcing sécurisé Afrique Kbis RCCM',
    'mise en relation grossiste acheteur B2B',
    // Longue traîne EN
    'verified supplier Africa Europe',
    'certified African wholesaler',
    'Africa B2B trade sourcing platform',
  ],
  authors: [{ name: 'LOUGARA' }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png' },
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
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
