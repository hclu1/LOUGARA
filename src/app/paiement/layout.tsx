import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Paiement & Facturation Sécurisée | LOUGARA',
};

export default function PaiementLayout({ children }: { children: React.ReactNode }) {
  return children;
}
