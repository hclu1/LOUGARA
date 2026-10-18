import { prisma } from '@/lib/prisma';
import { APP_VERSION } from '@/version';

export interface SystemMaintenanceStatus {
  isMaintenanceActive: boolean;
  lastActiveVersion: string;
  currentAppVersion: string;
  isVersionMismatch: boolean;
  message: string;
  updatedAt: string;
}

// Fallback en mémoire en cas d'indisponibilité momentanée de la base de données
let memoryMaintenanceState = {
  isMaintenanceActive: false,
  lastActiveVersion: APP_VERSION,
  message: 'Plateforme en maintenance technique Lougara pour mise à niveau des services.',
  updatedAt: new Date().toISOString(),
};

/**
 * Initialise la table et enregistre si nécessaire.
 */
async function ensureMaintenanceTable() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SystemMaintenance" (
        "id" TEXT PRIMARY KEY DEFAULT 'global',
        "isMaintenanceActive" BOOLEAN NOT NULL DEFAULT false,
        "lastActiveVersion" TEXT NOT NULL DEFAULT '${APP_VERSION}',
        "message" TEXT,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
  } catch (error) {
    console.warn('[Maintenance] Note création table SystemMaintenance:', error);
  }
}

/**
 * Récupère le statut actuel du mode maintenance.
 * Ne verrouille JAMAIS automatiquement le site lors d'un simple écart de version
 * afin d'éviter tout blocage involontaire lors des déploiements ou tests.
 */
export async function getMaintenanceStatus(): Promise<SystemMaintenanceStatus> {
  await ensureMaintenanceTable();

  try {
    const rows = (await prisma.$queryRaw`
      SELECT "id", "isMaintenanceActive", "lastActiveVersion", "message", "updatedAt"
      FROM "SystemMaintenance"
      WHERE "id" = 'global'
      LIMIT 1
    `) as Array<{
      id: string;
      isMaintenanceActive: boolean;
      lastActiveVersion: string;
      message: string | null;
      updatedAt: Date;
    }>;

    if (!rows || rows.length === 0) {
      await prisma.$executeRawUnsafe(`
        INSERT INTO "SystemMaintenance" ("id", "isMaintenanceActive", "lastActiveVersion", "message", "updatedAt")
        VALUES ('global', false, '${APP_VERSION}', 'Plateforme en maintenance technique pour mise à niveau.', NOW())
        ON CONFLICT ("id") DO NOTHING;
      `);

      return {
        isMaintenanceActive: false,
        lastActiveVersion: APP_VERSION,
        currentAppVersion: APP_VERSION,
        isVersionMismatch: false,
        message: 'Plateforme en maintenance technique pour mise à niveau.',
        updatedAt: new Date().toISOString(),
      };
    }

    const row = rows[0];

    // Si la version a évolué et que le site est en ligne, on synchronise silencieusement lastActiveVersion
    // sans jamais activer la maintenance de manière forcée.
    if (row.lastActiveVersion !== APP_VERSION && !row.isMaintenanceActive) {
      await prisma.$executeRawUnsafe(`
        UPDATE "SystemMaintenance"
        SET "lastActiveVersion" = '${APP_VERSION}',
            "updatedAt" = NOW()
        WHERE "id" = 'global';
      `).catch(() => {});
    }

    return {
      isMaintenanceActive: Boolean(row.isMaintenanceActive),
      lastActiveVersion: APP_VERSION,
      currentAppVersion: APP_VERSION,
      isVersionMismatch: false,
      message: row.message || 'Plateforme en maintenance technique pour mise à niveau.',
      updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : new Date().toISOString(),
    };
  } catch (error) {
    console.warn('[Maintenance] Erreur lecture DB, utilisation du fallback mémoire:', error);
    return {
      isMaintenanceActive: memoryMaintenanceState.isMaintenanceActive,
      lastActiveVersion: APP_VERSION,
      currentAppVersion: APP_VERSION,
      isVersionMismatch: false,
      message: memoryMaintenanceState.message,
      updatedAt: memoryMaintenanceState.updatedAt,
    };
  }
}

/**
 * Met à jour le statut du mode maintenance.
 * Si isMaintenanceActive est désactivé (remise en service du site), on synchronise lastActiveVersion = APP_VERSION.
 */
export async function setMaintenanceStatus(params: {
  isMaintenanceActive: boolean;
  message?: string;
}): Promise<SystemMaintenanceStatus> {
  await ensureMaintenanceTable();

  const targetMessage =
    params.message ||
    (params.isMaintenanceActive
      ? 'Plateforme Lougara en maintenance technique programmée pour mise à niveau.'
      : 'Site en ligne');

  try {
    if (!params.isMaintenanceActive) {
      await prisma.$executeRawUnsafe(`
        INSERT INTO "SystemMaintenance" ("id", "isMaintenanceActive", "lastActiveVersion", "message", "updatedAt")
        VALUES ('global', false, '${APP_VERSION}', '${targetMessage.replace(/'/g, "''")}', NOW())
        ON CONFLICT ("id") DO UPDATE
        SET "isMaintenanceActive" = false,
            "lastActiveVersion" = '${APP_VERSION}',
            "message" = '${targetMessage.replace(/'/g, "''")}',
            "updatedAt" = NOW();
      `);

      memoryMaintenanceState = {
        isMaintenanceActive: false,
        lastActiveVersion: APP_VERSION,
        message: targetMessage,
        updatedAt: new Date().toISOString(),
      };
    } else {
      await prisma.$executeRawUnsafe(`
        INSERT INTO "SystemMaintenance" ("id", "isMaintenanceActive", "lastActiveVersion", "message", "updatedAt")
        VALUES ('global', true, '${APP_VERSION}', '${targetMessage.replace(/'/g, "''")}', NOW())
        ON CONFLICT ("id") DO UPDATE
        SET "isMaintenanceActive" = true,
            "lastActiveVersion" = '${APP_VERSION}',
            "message" = '${targetMessage.replace(/'/g, "''")}',
            "updatedAt" = NOW();
      `);

      memoryMaintenanceState.isMaintenanceActive = true;
      memoryMaintenanceState.lastActiveVersion = APP_VERSION;
      memoryMaintenanceState.message = targetMessage;
      memoryMaintenanceState.updatedAt = new Date().toISOString();
    }

    return await getMaintenanceStatus();
  } catch (error) {
    console.warn('[Maintenance] Erreur sauvegarde DB, mise à jour mémoire:', error);
    memoryMaintenanceState.isMaintenanceActive = params.isMaintenanceActive;
    memoryMaintenanceState.lastActiveVersion = APP_VERSION;
    if (params.message) {
      memoryMaintenanceState.message = params.message;
    }
    memoryMaintenanceState.updatedAt = new Date().toISOString();

    return {
      isMaintenanceActive: memoryMaintenanceState.isMaintenanceActive,
      lastActiveVersion: APP_VERSION,
      currentAppVersion: APP_VERSION,
      isVersionMismatch: false,
      message: memoryMaintenanceState.message,
      updatedAt: memoryMaintenanceState.updatedAt,
    };
  }
}
