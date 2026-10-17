import { describe, it, expect, beforeEach } from 'vitest';
import { getMaintenanceStatus, setMaintenanceStatus } from '../../src/features/maintenance/service';
import { SUPER_ADMIN_EMAIL } from '../../src/context/AuthContext';
import { APP_VERSION } from '../../src/version';
import { prisma } from '../../src/lib/prisma';

describe('Système de Maintenance Lougara & Déclenchement Automatique', () => {
  beforeEach(async () => {
    // Réinitialise la table SystemMaintenance pour les tests
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
      await prisma.$executeRawUnsafe(`
        INSERT INTO "SystemMaintenance" ("id", "isMaintenanceActive", "lastActiveVersion", "message", "updatedAt")
        VALUES ('global', false, '${APP_VERSION}', 'Site en ligne', NOW())
        ON CONFLICT ("id") DO UPDATE
        SET "isMaintenanceActive" = false,
            "lastActiveVersion" = '${APP_VERSION}',
            "message" = 'Site en ligne',
            "updatedAt" = NOW();
      `);
    } catch (e) {
      // Ignorer si indisponible
    }
  });

  it('doit renvoyer un statut de maintenance normal lorsque le site est en ligne', async () => {
    const status = await getMaintenanceStatus();
    expect(status).toBeDefined();
    expect(status.currentAppVersion).toBe(APP_VERSION);
    expect(status.isMaintenanceActive).toBe(false);
  });

  it('doit permettre au Super Admin d’activer manuellement le mode maintenance', async () => {
    const updated = await setMaintenanceStatus({
      isMaintenanceActive: true,
      message: 'Maintenance manuelle Super Admin',
    });

    expect(updated.isMaintenanceActive).toBe(true);
    expect(updated.message).toContain('Maintenance manuelle');

    const fresh = await getMaintenanceStatus();
    expect(fresh.isMaintenanceActive).toBe(true);
  });

  it('doit permettre au Super Admin de redémarrer le site et désactiver la maintenance', async () => {
    // Activer puis désactiver
    await setMaintenanceStatus({ isMaintenanceActive: true });
    const reopened = await setMaintenanceStatus({ isMaintenanceActive: false });

    expect(reopened.isMaintenanceActive).toBe(false);
    expect(reopened.lastActiveVersion).toBe(APP_VERSION);
  });

  it('doit détecter une nouvelle version applicative et activer AUTOMATIQUEMENT la maintenance', async () => {
    // Simuler une ancienne version enregistrée en base (ex: 0.15.0)
    await prisma.$executeRawUnsafe(`
      UPDATE "SystemMaintenance"
      SET "isMaintenanceActive" = false,
          "lastActiveVersion" = '0.14.0',
          "updatedAt" = NOW()
      WHERE "id" = 'global';
    `);

    // Lors de la requête getMaintenanceStatus(), la détection automatique se déclenche
    const status = await getMaintenanceStatus();

    expect(status.isVersionMismatch).toBe(true);
    expect(status.isMaintenanceActive).toBe(true);
    expect(status.message).toContain('Mise à jour système');

    // Vérifier en base que la coche a bien été positionnée automatiquement
    const fresh = await getMaintenanceStatus();
    expect(fresh.isMaintenanceActive).toBe(true);

    // Une fois que le Super Admin redémarre le site, la maintenance se désactive et la version se synchronise
    const fixed = await setMaintenanceStatus({ isMaintenanceActive: false });
    expect(fixed.isMaintenanceActive).toBe(false);
    expect(fixed.lastActiveVersion).toBe(APP_VERSION);
    expect(fixed.isVersionMismatch).toBe(false);
  });

  it('doit vérifier que seul l’email SUPER_ADMIN_EMAIL est autorisé', () => {
    expect(SUPER_ADMIN_EMAIL).toBe('champagcrypt@gmail.com');
    const isSuperAdminCandidate = (email: string) => email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

    expect(isSuperAdminCandidate('champagcrypt@gmail.com')).toBe(true);
    expect(isSuperAdminCandidate('CHAMPAGCRYPT@GMAIL.COM')).toBe(true);
    expect(isSuperAdminCandidate('other@example.com')).toBe(false);
    expect(isSuperAdminCandidate('asherilla4@gmail.com')).toBe(false);
  });
});
