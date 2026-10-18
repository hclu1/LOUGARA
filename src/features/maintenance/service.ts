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

/**
 * Clé isolée pour le contrôle manuel de maintenance afin qu'aucune ancienne
 * instance de prévisualisation (ex: v0.18.0) qui lisait la ligne 'global'
 * ne puisse jamais réactiver automatiquement la maintenance en base de données.
 */
const MAINTENANCE_ROW_ID = 'manual_control';

let memoryMaintenanceState = {
  isMaintenanceActive: false,
  lastActiveVersion: APP_VERSION,
  message: 'Site en ligne',
  updatedAt: new Date().toISOString(),
};

async function ensureMaintenanceTable() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SystemMaintenance" (
        "id" TEXT PRIMARY KEY DEFAULT 'manual_control',
        "isMaintenanceActive" BOOLEAN NOT NULL DEFAULT false,
        "lastActiveVersion" TEXT NOT NULL DEFAULT '${APP_VERSION}',
        "message" TEXT,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    // Neutraliser définitivement l'ancienne ligne 'global' pour éviter qu'une ancienne preview v0.18.0 ne déclenche de requête
    await prisma.$executeRawUnsafe(`
      UPDATE "SystemMaintenance"
      SET "isMaintenanceActive" = false,
          "lastActiveVersion" = '0.18.0',
          "message" = 'Site en ligne'
      WHERE "id" = 'global' AND "isMaintenanceActive" = true;
    `).catch(() => {});
  } catch (error) {
    console.warn('[Maintenance] Note initialisation table SystemMaintenance:', error);
  }
}

/**
 * Récupère le statut actuel du mode maintenance.
 * Seul un déclenchement manuel explicite par un administrateur sur la clé 'manual_control' est pris en compte.
 */
export async function getMaintenanceStatus(): Promise<SystemMaintenanceStatus> {
  await ensureMaintenanceTable();

  try {
    const rows = (await prisma.$queryRaw`
      SELECT "id", "isMaintenanceActive", "lastActiveVersion", "message", "updatedAt"
      FROM "SystemMaintenance"
      WHERE "id" = ${MAINTENANCE_ROW_ID}
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
        VALUES ('${MAINTENANCE_ROW_ID}', false, '${APP_VERSION}', 'Site en ligne', NOW())
        ON CONFLICT ("id") DO NOTHING;
      `);

      return {
        isMaintenanceActive: false,
        lastActiveVersion: APP_VERSION,
        currentAppVersion: APP_VERSION,
        isVersionMismatch: false,
        message: 'Site en ligne',
        updatedAt: new Date().toISOString(),
      };
    }

    const row = rows[0];
    const isAutoLegacyMessage = Boolean(row.message && row.message.startsWith('Mise à jour système v'));
    const isActive = Boolean(row.isMaintenanceActive) && !isAutoLegacyMessage;

    return {
      isMaintenanceActive: isActive,
      lastActiveVersion: APP_VERSION,
      currentAppVersion: APP_VERSION,
      isVersionMismatch: false,
      message: isActive
        ? row.message || 'Plateforme Lougara en maintenance technique programmée.'
        : 'Site en ligne',
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
 * Met à jour le statut du mode maintenance (uniquement sur action manuelle d'un administrateur).
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
    await prisma.$executeRawUnsafe(`
      INSERT INTO "SystemMaintenance" ("id", "isMaintenanceActive", "lastActiveVersion", "message", "updatedAt")
      VALUES ('${MAINTENANCE_ROW_ID}', ${params.isMaintenanceActive ? 'true' : 'false'}, '${APP_VERSION}', '${targetMessage.replace(/'/g, "''")}', NOW())
      ON CONFLICT ("id") DO UPDATE
      SET "isMaintenanceActive" = ${params.isMaintenanceActive ? 'true' : 'false'},
          "lastActiveVersion" = '${APP_VERSION}',
          "message" = '${targetMessage.replace(/'/g, "''")}',
          "updatedAt" = NOW();
    `);

    memoryMaintenanceState = {
      isMaintenanceActive: params.isMaintenanceActive,
      lastActiveVersion: APP_VERSION,
      message: targetMessage,
      updatedAt: new Date().toISOString(),
    };

    return await getMaintenanceStatus();
  } catch (error) {
    console.warn('[Maintenance] Erreur sauvegarde DB, mise à jour mémoire:', error);
    memoryMaintenanceState.isMaintenanceActive = params.isMaintenanceActive;
    memoryMaintenanceState.lastActiveVersion = APP_VERSION;
    memoryMaintenanceState.message = targetMessage;
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
