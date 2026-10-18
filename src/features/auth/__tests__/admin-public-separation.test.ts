import { describe, it, expect } from 'vitest';
import {
  authenticateAccount,
  createSessionToken,
  verifySessionToken,
  isRequestAdminAuthorized,
  submitClientPasswordRequest,
  listPasswordValidationRequests,
  reviewPasswordValidationRequest,
  hashPassword,
  verifyPassword,
} from '../service';
import {
  getMaintenanceStatus,
  setMaintenanceStatus,
} from '@/features/maintenance/service';

describe('Séparation Site Public / Espace Admin & Sécurité des Mots de Passe', () => {
  describe('1. Authentification Admin (moderator & super_admin)', () => {
    it('authentifie moderator (asherilla4@gmail.com) uniquement avec le mot de passe temporaire "sherilla"', () => {
      const failResult = authenticateAccount({
        email: 'asherilla4@gmail.com',
        password: 'mauvais_mdp',
        requireAdmin: true,
      });
      expect(failResult.success).toBe(false);
      expect(failResult.statusCode).toBe(401);

      const emptyResult = authenticateAccount({
        email: 'asherilla4@gmail.com',
        password: '',
        requireAdmin: true,
      });
      expect(emptyResult.success).toBe(false);

      const okResult = authenticateAccount({
        email: 'asherilla4@gmail.com',
        password: 'sherilla',
        requireAdmin: true,
      });
      expect(okResult.success).toBe(true);
      expect(okResult.user?.role).toBe('moderator');
    });

    it('authentifie super_admin (champagcrypt@gmail.com) uniquement avec le mot de passe temporaire "herve"', () => {
      const failResult = authenticateAccount({
        email: 'champagcrypt@gmail.com',
        password: 'sherilla',
        requireAdmin: true,
      });
      expect(failResult.success).toBe(false);

      const okResult = authenticateAccount({
        email: 'champagcrypt@gmail.com',
        password: 'herve',
        requireAdmin: true,
      });
      expect(okResult.success).toBe(true);
      expect(okResult.user?.role).toBe('super_admin');

      // Supporte également un espace accidentel en début de chaîne (" herve")
      const trimmedResult = authenticateAccount({
        email: 'champagcrypt@gmail.com',
        password: ' herve',
        requireAdmin: true,
      });
      expect(trimmedResult.success).toBe(true);
      expect(trimmedResult.user?.role).toBe('super_admin');

      // Supporte la sélection directe des 2 choix sur /admin : "moderator" et "super_admin"
      const directModChoice = authenticateAccount({
        email: 'moderator',
        password: 'sherilla',
        requireAdmin: true,
      });
      expect(directModChoice.success).toBe(true);
      expect(directModChoice.user?.role).toBe('moderator');

      const directSuperChoice = authenticateAccount({
        email: 'super_admin',
        password: 'herve',
        requireAdmin: true,
      });
      expect(directSuperChoice.success).toBe(true);
      expect(directSuperChoice.user?.role).toBe('super_admin');
    });

    it('refuse l’accès Admin (403) à tout utilisateur non-administrateur même avec un mot de passe valide', () => {
      const clientAdminTry = authenticateAccount({
        email: 'contact@africabio.sn',
        password: 'LougaraClient2026!',
        requireAdmin: true,
      });
      expect(clientAdminTry.success).toBe(false);
      expect(clientAdminTry.statusCode).toBe(403);
    });

    it('signe et vérifie les jetons de session HMAC-SHA256 et rejette toute falsification', () => {
      const token = createSessionToken({
        id: 'mod-1',
        email: 'asherilla4@gmail.com',
        role: 'moderator',
        firstName: 'Asherilla',
        accountStatus: 'active',
      });

      const verified = verifySessionToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.role).toBe('moderator');

      // Falsification du payload en super_admin
      const tampered = token.replace(
        token.split('.')[0],
        Buffer.from(
          JSON.stringify({
            id: 'mod-1',
            email: 'hacker@example.com',
            role: 'super_admin',
            accountStatus: 'active',
            exp: Date.now() + 60000,
          })
        ).toString('base64url')
      );

      expect(verifySessionToken(tampered)).toBeNull();
    });

    it('protège les requêtes API Admin via isRequestAdminAuthorized (403 pour visiteur ou client)', () => {
      const anonReq = new Request('http://localhost:3000/api/admin/password-validations');
      expect(isRequestAdminAuthorized(anonReq).authorized).toBe(false);

      const clientToken = createSessionToken({
        id: 'cli-1',
        email: 'client@entreprise.com',
        role: 'entrepreneur',
        firstName: 'Client',
        accountStatus: 'active',
      });
      const clientReq = new Request('http://localhost:3000/api/admin/password-validations', {
        headers: { cookie: `lougara_session=${encodeURIComponent(clientToken)}` },
      });
      expect(isRequestAdminAuthorized(clientReq).authorized).toBe(false);

      const modToken = createSessionToken({
        id: 'mod-1',
        email: 'asherilla4@gmail.com',
        role: 'moderator',
        firstName: 'Modérateur',
        accountStatus: 'active',
      });
      const modReq = new Request('http://localhost:3000/api/admin/password-validations', {
        headers: { cookie: `lougara_session=${encodeURIComponent(modToken)}` },
      });
      expect(isRequestAdminAuthorized(modReq).authorized).toBe(true);
    });
  });

  describe('2. Sécurité & Validation des Mots de Passe Clients (Entrepreneurs & Fournisseurs)', () => {
    it('chiffre les mots de passe avec scrypt et sel aléatoire', () => {
      const hash = hashPassword('SecretClient2026!');
      expect(hash.includes(':')).toBe(true);
      expect(verifyPassword('SecretClient2026!', hash)).toBe(true);
      expect(verifyPassword('MauvaisMotDePasse', hash)).toBe(false);
    });

    it('place un nouveau mot de passe client en PENDING, bloque la connexion, puis l’autorise après validation par moderator ou super_admin', () => {
      const testEmail = `client-test-${Date.now()}@afrique-negoce.sn`;
      const submitRes = submitClientPasswordRequest({
        email: testEmail,
        password: 'ClientSecurePassword99',
        fullName: 'Moussa Ndiaye',
        companyName: 'Afrique Négoce SARL',
        country: 'Sénégal',
        clientRole: 'supplier',
        requestType: 'INITIAL_PASSWORD',
      });

      expect(submitRes.success).toBe(true);
      expect(submitRes.request?.status).toBe('PENDING');

      // Connexion bloquée tant que PENDING
      const pendingLogin = authenticateAccount({
        email: testEmail,
        password: 'ClientSecurePassword99',
      });
      expect(pendingLogin.success).toBe(false);
      expect(pendingLogin.statusCode).toBe(403);

      // Validation par moderator
      const approveRes = reviewPasswordValidationRequest({
        requestId: submitRes.request!.id,
        action: 'APPROVE',
        reviewerEmail: 'asherilla4@gmail.com',
      });
      expect(approveRes.success).toBe(true);
      expect(approveRes.request?.status).toBe('APPROVED');

      // Connexion client désormais autorisée avec le mot de passe validé
      const approvedLogin = authenticateAccount({
        email: testEmail,
        password: 'ClientSecurePassword99',
      });
      expect(approvedLogin.success).toBe(true);
      expect(approvedLogin.user?.email).toBe(testEmail);
      expect(approvedLogin.user?.role).toBe('supplier');
    });

    it('permet le refus (REJECT) d’une demande de mot de passe avec motif et bloque la connexion', () => {
      const testEmail = `reject-test-${Date.now()}@import.fr`;
      const submitRes = submitClientPasswordRequest({
        email: testEmail,
        password: 'WeakPassword123',
        fullName: 'Jean Dupont',
        companyName: 'Import Export SAS',
        country: 'France',
        clientRole: 'entrepreneur',
      });

      expect(submitRes.success).toBe(true);

      const rejectRes = reviewPasswordValidationRequest({
        requestId: submitRes.request!.id,
        action: 'REJECT',
        reviewerEmail: 'champagcrypt@gmail.com',
        rejectionReason: 'Identité de la société non concordante.',
      });

      expect(rejectRes.success).toBe(true);
      expect(rejectRes.request?.status).toBe('REJECTED');

      const rejectedLogin = authenticateAccount({
        email: testEmail,
        password: 'WeakPassword123',
      });
      expect(rejectedLogin.success).toBe(false);
      expect(rejectedLogin.statusCode).toBe(403);

      const { requests } = listPasswordValidationRequests('REJECTED');
      expect(requests.some((r) => r.email === testEmail)).toBe(true);
    });
  });

  describe('3. Mode Maintenance & Remise en Service Immédiate', () => {
    it('active le mode maintenance puis remet le site public en service immédiatement sans blocage de cache', async () => {
      // 1. Activation de la maintenance
      const activated = await setMaintenanceStatus({
        isMaintenanceActive: true,
        message: 'Maintenance test automatisé',
      });
      expect(activated.isMaintenanceActive).toBe(true);

      const statusDuring = await getMaintenanceStatus();
      expect(statusDuring.isMaintenanceActive).toBe(true);

      // 2. Désactivation (remise en service)
      const restored = await setMaintenanceStatus({
        isMaintenanceActive: false,
      });
      expect(restored.isMaintenanceActive).toBe(false);
      expect(restored.isVersionMismatch).toBe(false);

      const statusAfter = await getMaintenanceStatus();
      expect(statusAfter.isMaintenanceActive).toBe(false);
    });
  });
});
