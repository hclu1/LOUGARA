const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCounts() {
  const users = await prisma.user.count();
  const companies = await prisma.companyProfile.count();
  const products = await prisma.product.count();
  console.log(`📊 BDD Supabase : ${users} Utilisateurs, ${companies} Entreprises / Fournisseurs, ${products} Produits.`);
}

checkCounts().finally(() => prisma.$disconnect());
