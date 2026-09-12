import { describe, it, expect } from 'vitest';
import {
  registerEntrepreneur,
  getRegisteredEntrepreneurs,
  contactSupplier,
  submitSourcingRequest,
  getSourcingRequests,
} from '../../src/features/entrepreneurs/service';

describe('Service Entrepreneurs & Sourcing B2B', () => {
  it('doit inscrire un entrepreneur et l\'enregistrer dans la base de données', async () => {
    const input = {
      fullName: 'Yacine Diallo',
      companyName: 'Dakar Cosmétiques Naturels',
      email: 'yacine.diallo@dakar-cosmetics.sn',
      phone: '+221 77 987 65 43',
      country: 'Sénégal',
      city: 'Dakar',
      buyerType: 'E-commerce & Vente en ligne' as const,
      targetSectors: ['Cosmétique & Soins'],
      estimatedBudget: '1 000 € à 5 000 € / mois' as const,
      sourcingNeeds: 'Recherche de 10 fûts de karité bio et huiles pures.',
    };

    const entrepreneur = await registerEntrepreneur(input);

    expect(entrepreneur).toBeDefined();
    expect(entrepreneur.id).toBeDefined();
    expect(entrepreneur.fullName).toBe('Yacine Diallo');
    expect(entrepreneur.companyName).toBe('Dakar Cosmétiques Naturels');
    expect(entrepreneur.email).toBe('yacine.diallo@dakar-cosmetics.sn');
    expect(entrepreneur.buyerType).toBe('E-commerce & Vente en ligne');

    const allEntrepreneurs = await getRegisteredEntrepreneurs();
    const found = allEntrepreneurs.find((e) => e.email === 'yacine.diallo@dakar-cosmetics.sn');
    expect(found).toBeDefined();
    expect(found?.companyName).toBe('Dakar Cosmétiques Naturels');
  });

  it('doit permettre à un entrepreneur de se mettre en relation directe avec un fournisseur vérifié', async () => {
    const contactInput = {
      entrepreneurName: 'Yacine Diallo',
      entrepreneurEmail: 'yacine.diallo@dakar-cosmetics.sn',
      entrepreneurPhone: '+221 77 987 65 43',
      supplierId: 'supp-1',
      supplierName: 'Africa Bio Extracts SARL',
      quantity: '10 fûts de 25 kg',
      targetDestination: 'Port de Dakar',
      message: 'Bonjour, nous souhaitons passer commande pour 10 fûts de beurre de karité Grade A. Pouvez-vous nous envoyer un devis avec délai de mise à disposition ?',
    };

    const inquiry = await contactSupplier(contactInput);

    expect(inquiry).toBeDefined();
    expect(inquiry.id).toBeDefined();
    expect(inquiry.supplierName).toBe('Africa Bio Extracts SARL');
    expect(inquiry.quantity).toBe('10 fûts de 25 kg');
    expect(inquiry.status).toBe('CONNECTED');
  });

  it('doit permettre de publier un appel d\'offres / besoin de sourcing', async () => {
    const tenderInput = {
      entrepreneurName: 'Yacine Diallo',
      entrepreneurEmail: 'yacine.diallo@dakar-cosmetics.sn',
      companyName: 'Dakar Cosmétiques Naturels',
      sector: 'Cosmétique & Soins',
      title: 'Recherche producteur certifié de beurre de karité bio',
      description: 'Nous cherchons un approvisionnement continu de 250 kg par mois avec certificats de conformité.',
      targetQuantity: '250 kg / mois',
      targetBudget: '1 500 € - 2 500 € / mois',
      destinationCountry: 'Sénégal',
    };

    const request = await submitSourcingRequest(tenderInput);

    expect(request).toBeDefined();
    expect(request.title).toBe('Recherche producteur certifié de beurre de karité bio');

    const allRequests = await getSourcingRequests();
    expect(allRequests.length).toBeGreaterThanOrEqual(1);
    expect(allRequests[0].companyName).toBe('Dakar Cosmétiques Naturels');
  });
});
