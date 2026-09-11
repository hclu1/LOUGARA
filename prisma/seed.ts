import { PrismaClient, UserRole, VerificationStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Amorçage de la base de données Lougara B2B...');

  // Création d'un administrateur Lougara
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lougara.com' },
    update: {},
    create: {
      supabaseUid: 'supabase-admin-mock-uid',
      email: 'admin@lougara.com',
      role: UserRole.ADMIN,
      firstName: 'Admin',
      lastName: 'Lougara',
    },
  });

  // Création d'un fournisseur vérifié pilote (Sénégal - Cosmétique & Karité)
  const supplierUser = await prisma.user.upsert({
    where: { email: 'contact@africabio-extracts.com' },
    update: {},
    create: {
      supabaseUid: 'supabase-supplier-mock-uid',
      email: 'contact@africabio-extracts.com',
      role: UserRole.SUPPLIER,
      firstName: 'Amina',
      lastName: 'Diop',
    },
  });

  const supplierProfile = await prisma.companyProfile.upsert({
    where: { userId: supplierUser.id },
    update: {},
    create: {
      userId: supplierUser.id,
      companyName: 'Africa Bio Extracts SARL',
      country: 'Sénégal',
      city: 'Dakar',
      registrationNumber: 'SN-DKR-2021-B-1284',
      sector: 'Cosmétique & Soins',
      description: 'Producteur et grossiste d\'ingrédients naturels certifiés : Beurre de karité pur, huile de baobab et moringa.',
      website: 'https://africabio-extracts.com',
      phone: '+221 77 123 45 67',
      verificationStatus: VerificationStatus.VERIFIED,
      verifiedAt: new Date(),
      verificationNotes: 'Dossier RCCM et NINEA validés par l\'administration Lougara',
    },
  });

  // Création de produits pour ce fournisseur
  await prisma.product.upsert({
    where: { slug: 'beurre-de-karite-bio-brut-25kg' },
    update: {},
    create: {
      companyId: supplierProfile.id,
      title: 'Beurre de Karité Bio Brut (Fûts de 25kg)',
      slug: 'beurre-de-karite-bio-brut-25kg',
      description: 'Beurre de karité 100% naturel, non raffiné, extrait mécaniquement par coopérative féminine. Analyse qualité disponible.',
      category: 'Cosmétique & Soins',
      priceMin: 8.5,
      priceMax: 12.0,
      currency: 'EUR',
      moq: 4, // 100kg minimum
      unit: 'fût (25kg)',
      originCountry: 'Sénégal',
      images: [
        'https://images.unsplash.com/photo-1608248597359-54d922336336?auto=format&fit=crop&q=80&w=800',
      ],
      isPublished: true,
    },
  });

  console.log('Amorçage Lougara terminé avec succès !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
