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
 * Règle automatique : si une nouvelle version applicative est détectée (APP_VERSION !== lastActiveVersion)
 * et que la maintenance n'était pas active, elle s'active automatiquement !
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
      // Premier démarrage : on initialise avec APP_VERSION et maintenance = false
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
    const isVersionMismatch = row.lastActiveVersion !== APP_VERSION;

    // RÈGLE MÉTIER : Détection d'un déploiement / nouvelle version
    // Si la version de code diffère de la dernière version active enregistrée et que la maintenance n'était pas active,
    // on l'active automatiquement !
    if (isVersionMismatch && !row.isMaintenanceActive) {
      console.log(`[Maintenance] Changement de version détecté (${row.lastActiveVersion} -> ${APP_VERSION}). Activation automatique du mode maintenance.`);
      await prisma.$executeRawUnsafe(`
        UPDATE "SystemMaintenance"
        SET "isMaintenanceActive" = true,
            "message" = 'Mise à jour système v${APP_VERSION} en cours. Maintenance automatique déclenchée.',
            "updatedAt" = NOW()
        WHERE "id" = 'global';
      `);

      return {
        isMaintenanceActive: true,
        lastActiveVersion: row.lastActiveVersion,
        currentAppVersion: APP_VERSION,
        isVersionMismatch: true,
        message: `Mise à jour système v${APP_VERSION} en cours. Maintenance automatique déclenchée.`,
        updatedAt: new Date().toISOString(),
      };
    }

    return {
      isMaintenanceActive: Boolean(row.isMaintenanceActive),
      lastActiveVersion: row.lastActiveVersion || APP_VERSION,
      currentAppVersion: APP_VERSION,
      isVersionMismatch,
      message: row.message || 'Plateforme en maintenance technique pour mise à niveau.',
      updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : new Date().toISOString(),
    };
  } catch (error) {
    console.warn('[Maintenance] Erreur lecture DB, utilisation du fallback mémoire:', error);
    const isVersionMismatch = memoryMaintenanceState.lastActiveVersion !== APP_VERSION;
    if (isVersionMismatch && !memoryMaintenanceState.isMaintenanceActive) {
      memoryMaintenanceState.isMaintenanceActive = true;
    }
    return {
      isMaintenanceActive: memoryMaintenanceState.isMaintenanceActive,
      lastActiveVersion: memoryMaintenanceState.lastActiveVersion,
      currentAppVersion: APP_VERSION,
      isVersionMismatch,
      message: memoryMaintenanceState.message,
      updatedAt: memoryMaintenanceState.updatedAt,
    };
  }
}

/**
 * Met à jour le statut du mode maintenance (réservé au Super Admin).
 * Si isMaintenanceActive est désactivé (redémarrage du site), on synchronise lastActiveVersion = APP_VERSION.
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
      // Redémarrage du site par le Super Admin : on synchronise la version enregistrée avec la version de code actuelle !
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
      // Activation manuelle du mode maintenance par le Super Admin
      await prisma.$executeRawUnsafe(`
        INSERT INTO "SystemMaintenance" ("id", "isMaintenanceActive", "lastActiveVersion", "message", "updatedAt")
        VALUES ('global', true, '${APP_VERSION}', '${targetMessage.replace(/'/g, "''")}', NOW())
        ON CONFLICT ("id") DO UPDATE
        SET "isMaintenanceActive" = true,
            "message" = '${targetMessage.replace(/'/g, "''")}',
            "updatedAt" = NOW();
      `);

      memoryMaintenanceState.isMaintenanceActive = true;
      memoryMaintenanceState.message = targetMessage;
      memoryMaintenanceState.updatedAt = new Date().toISOString();
    }

    return await getMaintenanceStatus();
  } catch (error) {
    console.warn('[Maintenance] Erreur sauvegarde DB, mise à jour mémoire:', error);
    memoryMaintenanceState.isMaintenanceActive = params.isMaintenanceActive;
    if (!params.isMaintenanceActive) {
      memoryMaintenanceState.lastActiveVersion = APP_VERSION;
    }
    if (params.message) {
      memoryMaintenanceState.message = params.message;
    }
    memoryMaintenanceState.updatedAt = new Date().toISOString();

    return {
      isMaintenanceActive: memoryMaintenanceState.isMaintenanceActive,
      lastActiveVersion: memoryMaintenanceState.lastActiveVersion,
      currentAppVersion: APP_VERSION,
      isVersionMismatch: false,
      message: memoryMaintenanceState.message,
      updatedAt: memoryMaintenanceState.updatedAt,
    };
  }
}
