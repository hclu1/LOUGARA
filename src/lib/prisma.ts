import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Normalise automatiquement l'URL PostgreSQL Supabase (notamment sur Vercel où DATABASE_URL
 * peut encore pointer sur le port 5432 Session Mode et provoquer EMAXCONNSESSION).
 */
function getNormalizedDatabaseUrl(): string | undefined {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) return undefined;
  let url = rawUrl.trim();

  if (url.includes('.pooler.supabase.com:5432')) {
    url = url.replace('.pooler.supabase.com:5432', '.pooler.supabase.com:6543');
  }

  if (url.includes(':6543')) {
    const hasQuery = url.includes('?');
    const extraParams: string[] = [];
    if (!url.includes('pgbouncer=true')) {
      extraParams.push('pgbouncer=true');
    }
    if (!url.includes('connection_limit=')) {
      extraParams.push('connection_limit=1');
    }
    if (extraParams.length > 0) {
      url = `${url}${hasQuery ? '&' : '?'}${extraParams.join('&')}`;
    }
  }

  return url;
}

const normalizedDatabaseUrl = getNormalizedDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(normalizedDatabaseUrl ? { datasources: { db: { url: normalizedDatabaseUrl } } } : {}),
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Helper conservé pour compatibilité des routes API (sans aucun DDL bloquant sur PgBouncer).
 */
export async function ensureSchemaSynced(): Promise<void> {
  return;
}
