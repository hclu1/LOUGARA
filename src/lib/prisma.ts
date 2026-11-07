import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  schemaSynced: boolean | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Garantit que les évolutions de schéma (colonnes optionnelles ajoutées lors des mises à jour)
 * n'empêchent jamais la lecture des clients et produits déjà présents dans Supabase,
 * sans jamais créer de client fictif.
 */
export async function ensureSchemaSynced(): Promise<void> {
  if (globalForPrisma.schemaSynced) return;
  if (process.env.VITEST || process.env.NODE_ENV === 'test') {
    globalForPrisma.schemaSynced = true;
    return;
  }

  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User"
      ADD COLUMN IF NOT EXISTS "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Product"
      ADD COLUMN IF NOT EXISTS "externalLink" TEXT,
      ADD COLUMN IF NOT EXISTS "isLinkApproved" BOOLEAN NOT NULL DEFAULT false;
    `);
    globalForPrisma.schemaSynced = true;
  } catch {
    // Non bloquant si déjà synchronisé ou en lecture seule
  }
}
