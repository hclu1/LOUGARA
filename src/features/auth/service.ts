import crypto from 'crypto';

export type AppUserRole = 'visitor' | 'entrepreneur' | 'supplier' | 'moderator' | 'super_admin';

export interface SessionUser {
  id: string;
  email: string;
  role: AppUserRole;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  accountStatus: 'pending' | 'active' | 'suspended' | 'rejected' | 'archived';
  mustChangePassword?: boolean;
}

export type PasswordRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type PasswordRequestType = 'INITIAL_PASSWORD' | 'PASSWORD_RESET' | 'CLIENT_REGISTRATION';

export interface PasswordValidationProductItem {
  id: string;
  title: string;
  category: string;
  isPublished: boolean;
  moderationStatus: string;
  externalLink?: string | null;
  isLinkApproved: boolean;
}

export interface PasswordValidationRequest {
  id: string;
  userId: string;
  companyId?: string;
  email: string;
  fullName: string;
  companyName: string;
  clientRole: 'entrepreneur' | 'supplier';
  country: string;
  requestType: PasswordRequestType;
  passwordHash: string;
  passwordFingerprint: string; // Ex: "scrypt:sha256:••••8f2a" (ne divulgue jamais le mot de passe en clair)
  passwordStrength: 'FORT' | 'CONFORME';
  status: PasswordRequestStatus;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  isCatalogueActive?: boolean;
  website?: string | null;
  products?: PasswordValidationProductItem[];
}

interface StoredAccountCredential {
  id: string;
  email: string;
  role: AppUserRole;
  firstName: string;
  lastName: string;
  companyName: string;
  country: string;
  passwordHash: string;
  accountStatus: 'pending' | 'active' | 'suspended' | 'rejected' | 'archived';
  pendingPasswordHash?: string;
  mustChangePassword?: boolean;
  updatedAt: string;
}

export const SESSION_COOKIE_NAME = 'lougara_session';
export const MODERATOR_EMAIL = 'asherilla4@gmail.com';
export const SUPER_ADMIN_EMAIL = 'champagcrypt@gmail.com';
export const MODERATOR_EMAILS = [MODERATOR_EMAIL, SUPER_ADMIN_EMAIL];

const SESSION_SECRET =
  process.env.AUTH_SESSION_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'lougara-b2b-secure-hmac-secret-key-2026';

/**
 * Hachage cryptographique avec scrypt + sel unique.
 */
export function hashPassword(plainPassword: string, existingSalt?: string): string {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(plainPassword, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

/**
 * Vérification en temps constant (protection contre les attaques temporelles).
 */
export function verifyPassword(plainPassword: string, storedHash: string): boolean {
  try {
    const [salt, keyHex] = storedHash.split(':');
    if (!salt || !keyHex) return false;
    const keyBuffer = Buffer.from(keyHex, 'hex');
    const derivedBuffer = crypto.scryptSync(plainPassword, salt, 64);
    if (keyBuffer.length !== derivedBuffer.length) return false;
    return crypto.timingSafeEqual(keyBuffer, derivedBuffer);
  } catch {
    return false;
  }
}

function buildFingerprint(hash: string): string {
  const tail = hash.slice(-6);
  return `scrypt:sha256:••••${tail}`;
}

/**
 * Base des comptes sécurisés (Administrateurs + Clients inscrits).
 * Mots de passe temporaires exigés :
 * - moderator (asherilla4@gmail.com) : "sherilla"
 * - super_admin (champagcrypt@gmail.com) : "herve"
 */
const accountsStore = new Map<string, StoredAccountCredential>();
const passwordRequestsStore: PasswordValidationRequest[] = [];

function initDefaultSecurityStore() {
  if (accountsStore.size > 0) return;

  // 1. Compte Modérateur
  accountsStore.set(MODERATOR_EMAIL, {
    id: 'usr-admin-mod',
    email: MODERATOR_EMAIL,
    role: 'moderator',
    firstName: 'Asherilla',
    lastName: 'Modérateur',
    companyName: 'Modération Lougara',
    country: 'France',
    passwordHash: hashPassword('sherilla', 'lougara_mod_salt_01'),
    accountStatus: 'active',
    updatedAt: new Date().toISOString(),
  });

  // 2. Compte Super Admin
  accountsStore.set(SUPER_ADMIN_EMAIL, {
    id: 'usr-admin-super',
    email: SUPER_ADMIN_EMAIL,
    role: 'super_admin',
    firstName: 'Hervé',
    lastName: 'Super Admin',
    companyName: 'Direction Lougara',
    country: 'France',
    passwordHash: hashPassword('herve', 'lougara_super_salt_01'),
    accountStatus: 'active',
    updatedAt: new Date().toISOString(),
  });
}

initDefaultSecurityStore();

/**
 * Synchronise automatiquement les comptes clients et les demandes de validation
 * depuis la base de données Supabase existante (sans jamais créer de client fictif).
 * Garantit qu'après toute modification ou redémarrage de l'application, un client
 * déjà validé dans Supabase apparaît immédiatement dans les "Validés" de l'administration
 * et conserve son accès actif.
 */
export async function syncClientsFromDatabase(): Promise<void> {
  initDefaultSecurityStore();
  if (process.env.VITEST || process.env.NODE_ENV === 'test') {
    return;
  }

  try {
    let dbUsers: any[] = [];
    let dbCompanies: any[] = [];

    try {
      const { prisma } = await import('@/lib/prisma');
      const [usersResult, companiesResult] = await Promise.all([
        prisma.user.findMany({
          include: {
            company: {
              include: {
                products: {
                  orderBy: { createdAt: 'asc' },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        prisma.companyProfile.findMany({
          include: {
            products: {
              orderBy: { createdAt: 'asc' },
            },
            user: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
      ]);
      dbUsers = usersResult;
      dbCompanies = companiesResult;
    } catch {
      const { fetchUsersAndCompaniesViaSupabaseRest } = await import('@/lib/supabase-db');
      const fallback = await fetchUsersAndCompaniesViaSupabaseRest();
      dbUsers = fallback.users;
      dbCompanies = fallback.companies;
    }

    if (dbUsers.length === 0 && dbCompanies.length === 0) {
      try {
        const { fetchUsersAndCompaniesViaSupabaseRest } = await import('@/lib/supabase-db');
        const fallback = await fetchUsersAndCompaniesViaSupabaseRest();
        dbUsers = fallback.users;
        dbCompanies = fallback.companies;
      } catch {}
    }

    // 1. Synchroniser en priorité toutes les fiches CompanyProfile existantes dans Supabase
    for (const comp of dbCompanies) {
      const ownerUser =
        comp.user ||
        dbUsers.find((u: any) => u.id === comp.userId) ||
        null;
      const cleanEmail = (ownerUser?.email || `contact@${String(comp.companyName || 'entreprise').toLowerCase().replace(/[^a-z0-9]/g, '')}.fr`)
        .trim()
        .toLowerCase();

      const isVerified = comp.verificationStatus === 'VERIFIED';
      const isRejected = comp.verificationStatus === 'REJECTED';

      const targetReqStatus: PasswordRequestStatus = isVerified
        ? 'APPROVED'
        : isRejected
          ? 'REJECTED'
          : 'PENDING';

      const targetAccountStatus: StoredAccountCredential['accountStatus'] = isVerified
        ? 'active'
        : isRejected
          ? 'rejected'
          : 'pending';

      const firstName = ownerUser?.firstName || 'Dirigeant';
      const lastName = ownerUser?.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim() || comp.companyName || 'Client Lougara';
      const companyName = comp.companyName || fullName;
      const country = comp.country || 'France';
      const userId = ownerUser?.id || comp.userId || comp.id;
      const storedCustomHash =
        typeof ownerUser?.avatarUrl === 'string' && ownerUser.avatarUrl.startsWith('scrypt:')
          ? ownerUser.avatarUrl.slice(7)
          : null;
      const defaultPass = `Lougara-${cleanEmail.split('@')[0]}-2026`;
      const defaultHash = storedCustomHash || hashPassword(defaultPass, `salt_${userId}`);
      const effectiveAccountStatus: StoredAccountCredential['accountStatus'] =
        storedCustomHash && !isRejected ? 'active' : targetAccountStatus;

      const existingAcc = accountsStore.get(cleanEmail);
      if (!existingAcc) {
        accountsStore.set(cleanEmail, {
          id: userId,
          email: cleanEmail,
          role: 'supplier',
          firstName,
          lastName,
          companyName,
          country,
          passwordHash: defaultHash,
          accountStatus: effectiveAccountStatus,
          mustChangePassword: storedCustomHash ? false : Boolean(ownerUser?.mustChangePassword),
          updatedAt: new Date(comp.updatedAt || Date.now()).toISOString(),
        });
      } else {
        if ((isVerified || storedCustomHash) && existingAcc.accountStatus !== 'active' && !isRejected) {
          existingAcc.accountStatus = 'active';
        }
        if (storedCustomHash && !existingAcc.pendingPasswordHash) {
          existingAcc.passwordHash = storedCustomHash;
          existingAcc.mustChangePassword = false;
        }
        existingAcc.role = 'supplier';
        existingAcc.companyName = companyName;
        existingAcc.country = country;
      }

      const mappedProducts: PasswordValidationProductItem[] = (comp.products || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        category: p.category || 'Général',
        isPublished: Boolean(p.isPublished),
        moderationStatus: String(p.moderationStatus || 'PENDING'),
        externalLink: p.externalLink || comp.website || null,
        isLinkApproved: Boolean(p.isLinkApproved),
      }));

      const existingReq = passwordRequestsStore.find(
        (r) => r.companyId === comp.id || r.email === cleanEmail
      );
      const requestedAtIso = new Date(comp.createdAt || ownerUser?.createdAt || Date.now()).toISOString();
      const reviewedAtIso =
        targetReqStatus !== 'PENDING'
          ? new Date(comp.verifiedAt || comp.updatedAt || Date.now()).toISOString()
          : undefined;

      if (!existingReq) {
        passwordRequestsStore.push({
          id: `pwd-req-${userId}`,
          userId,
          companyId: comp.id,
          email: cleanEmail,
          fullName,
          companyName,
          clientRole: 'supplier',
          country,
          requestType: 'CLIENT_REGISTRATION',
          passwordHash: existingAcc?.passwordHash || defaultHash,
          passwordFingerprint: buildFingerprint(existingAcc?.passwordHash || defaultHash),
          passwordStrength: 'FORT',
          status: targetReqStatus,
          requestedAt: requestedAtIso,
          reviewedAt: reviewedAtIso,
          reviewedBy: targetReqStatus !== 'PENDING' ? SUPER_ADMIN_EMAIL : undefined,
          rejectionReason: isRejected ? comp.verificationNotes || undefined : undefined,
          isCatalogueActive: Boolean(comp.isPublished),
          website: comp.website || mappedProducts[0]?.externalLink || null,
          products: mappedProducts,
        });
      } else {
        existingReq.companyId = comp.id;
        existingReq.companyName = companyName;
        existingReq.clientRole = 'supplier';
        existingReq.isCatalogueActive = Boolean(comp.isPublished);
        existingReq.website = comp.website || mappedProducts[0]?.externalLink || null;
        existingReq.products = mappedProducts;
        if (isVerified && existingReq.status !== 'APPROVED') {
          existingReq.status = 'APPROVED';
          existingReq.reviewedAt = reviewedAtIso;
          existingReq.reviewedBy = existingReq.reviewedBy || SUPER_ADMIN_EMAIL;
          existingReq.rejectionReason = undefined;
        }
      }
    }

    // 2. Synchroniser également les comptes utilisateurs sans fiche société directe
    for (const u of dbUsers) {
      const cleanEmail = (u.email || '').trim().toLowerCase();
      if (!cleanEmail || MODERATOR_EMAILS.includes(cleanEmail) || u.role === 'ADMIN') {
        continue;
      }

      const clientRole: 'entrepreneur' | 'supplier' =
        u.role === 'SUPPLIER' || Boolean(u.company) ? 'supplier' : 'entrepreneur';

      let matchedCompany = u.company || dbCompanies.find((c: any) => c.userId === u.id);
      if (!matchedCompany) {
        const altEmail = cleanEmail.endsWith('.fr')
          ? cleanEmail.slice(0, -3)
          : `${cleanEmail}.fr`;
        const altUser = dbUsers.find(
          (other: any) => (other.email || '').trim().toLowerCase() === altEmail
        );
        if (altUser) {
          matchedCompany = altUser.company || dbCompanies.find((c: any) => c.userId === altUser.id);
        }
      }

      const companyStatus = matchedCompany?.verificationStatus;
      const isVerified = companyStatus === 'VERIFIED' || (!matchedCompany && u.role === 'BUYER');
      const isRejected = companyStatus === 'REJECTED';

      const targetReqStatus: PasswordRequestStatus = isVerified
        ? 'APPROVED'
        : isRejected
          ? 'REJECTED'
          : 'PENDING';

      const targetAccountStatus: StoredAccountCredential['accountStatus'] = isVerified
        ? 'active'
        : isRejected
          ? 'rejected'
          : 'pending';

      const firstName = u.firstName || 'Client';
      const lastName = u.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim() || matchedCompany?.companyName || 'Client Lougara';
      const companyName = matchedCompany?.companyName || fullName;
      const country = matchedCompany?.country || 'France';
      const storedCustomHash =
        typeof u?.avatarUrl === 'string' && u.avatarUrl.startsWith('scrypt:')
          ? u.avatarUrl.slice(7)
          : null;
      const defaultPass = `Lougara-${cleanEmail.split('@')[0]}-2026`;
      const defaultHash = storedCustomHash || hashPassword(defaultPass, `salt_${u.id}`);
      const effectiveAccountStatus: StoredAccountCredential['accountStatus'] =
        storedCustomHash && !isRejected ? 'active' : targetAccountStatus;

      const existingAcc = accountsStore.get(cleanEmail);
      if (!existingAcc) {
        accountsStore.set(cleanEmail, {
          id: u.id,
          email: cleanEmail,
          role: matchedCompany ? 'supplier' : clientRole,
          firstName,
          lastName,
          companyName,
          country,
          passwordHash: defaultHash,
          accountStatus: effectiveAccountStatus,
          mustChangePassword: storedCustomHash ? false : Boolean(u.mustChangePassword),
          updatedAt: new Date(u.updatedAt || Date.now()).toISOString(),
        });
      } else {
        if ((isVerified || storedCustomHash) && existingAcc.accountStatus !== 'active' && !isRejected) {
          existingAcc.accountStatus = 'active';
        }
        if (storedCustomHash && !existingAcc.pendingPasswordHash) {
          existingAcc.passwordHash = storedCustomHash;
          existingAcc.mustChangePassword = false;
        }
        existingAcc.companyName = companyName;
        existingAcc.country = country;
      }

      // Si l'utilisateur est déjà représenté par sa fiche société dans passwordRequestsStore, ne pas dupliquer
      if (
        matchedCompany &&
        passwordRequestsStore.some((r) => r.companyId === matchedCompany.id)
      ) {
        continue;
      }

      const mappedProducts: PasswordValidationProductItem[] = (matchedCompany?.products || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        category: p.category || 'Général',
        isPublished: Boolean(p.isPublished),
        moderationStatus: String(p.moderationStatus || 'PENDING'),
        externalLink: p.externalLink || matchedCompany?.website || null,
        isLinkApproved: Boolean(p.isLinkApproved),
      }));

      const existingReq = passwordRequestsStore.find((r) => r.email === cleanEmail);
      if (!existingReq) {
        passwordRequestsStore.push({
          id: `pwd-req-${u.id}`,
          userId: u.id,
          companyId: matchedCompany?.id,
          email: cleanEmail,
          fullName,
          companyName,
          clientRole: matchedCompany ? 'supplier' : clientRole,
          country,
          requestType: 'CLIENT_REGISTRATION',
          passwordHash: existingAcc?.passwordHash || defaultHash,
          passwordFingerprint: buildFingerprint(existingAcc?.passwordHash || defaultHash),
          passwordStrength: 'FORT',
          status: targetReqStatus,
          requestedAt: new Date(matchedCompany?.createdAt || u.createdAt || Date.now()).toISOString(),
          reviewedAt:
            targetReqStatus !== 'PENDING'
              ? new Date(matchedCompany?.verifiedAt || matchedCompany?.updatedAt || u.updatedAt || Date.now()).toISOString()
              : undefined,
          reviewedBy: targetReqStatus !== 'PENDING' ? SUPER_ADMIN_EMAIL : undefined,
          rejectionReason: isRejected ? matchedCompany?.verificationNotes || undefined : undefined,
          isCatalogueActive: matchedCompany ? Boolean(matchedCompany.isPublished) : true,
          website: matchedCompany?.website || mappedProducts[0]?.externalLink || null,
          products: mappedProducts,
        });
      }
    }
  } catch (err) {
    console.warn('[AuthSync] Synchronisation Supabase non bloquante :', err);
  }
}

/**
 * Authentifie un utilisateur (Admin ou Client) avec vérification stricte du mot de passe.
 */
export function authenticateAccount(params: {
  email: string;
  password?: string;
  requireAdmin?: boolean;
}): {
  success: boolean;
  user?: SessionUser;
  error?: string;
  statusCode?: number;
} {
  initDefaultSecurityStore();

  const rawIdentifier = (params.email || '').trim().toLowerCase();
  const cleanEmail =
    rawIdentifier === 'moderator' || rawIdentifier === 'moderateur' || rawIdentifier === 'modérateur'
      ? MODERATOR_EMAIL
      : rawIdentifier === 'super_admin' || rawIdentifier === 'superadmin' || rawIdentifier === 'super-admin'
      ? SUPER_ADMIN_EMAIL
      : rawIdentifier;
  const rawPassword = params.password ?? '';
  const trimmedPassword = rawPassword.trim();

  if (!cleanEmail) {
    return {
      success: false,
      error: 'Veuillez sélectionner un profil ou saisir une adresse e-mail valide.',
      statusCode: 400,
    };
  }

  const isAdminAccount =
    cleanEmail === MODERATOR_EMAIL || cleanEmail === SUPER_ADMIN_EMAIL;

  if (params.requireAdmin && !isAdminAccount) {
    return {
      success: false,
      error: 'Identifiants ou privilèges insuffisants pour accéder à l’administration.',
      statusCode: 403,
    };
  }

  if (!rawPassword && !trimmedPassword) {
    return {
      success: false,
      error: 'Le mot de passe est obligatoire pour vous connecter.',
      statusCode: 401,
    };
  }

  let stored = accountsStore.get(cleanEmail);
  if (!stored && !isAdminAccount) {
    const altEmail = cleanEmail.endsWith('.fr') ? cleanEmail.slice(0, -3) : `${cleanEmail}.fr`;
    stored = accountsStore.get(altEmail);
  }

  // Cas 1 : Compte Administrateur (moderator ou super_admin)
  if (isAdminAccount && stored) {
    const isValidRaw = verifyPassword(rawPassword, stored.passwordHash);
    const isValidTrimmed = verifyPassword(trimmedPassword, stored.passwordHash);

    if (!isValidRaw && !isValidTrimmed) {
      return {
        success: false,
        error: 'Identifiants incorrects. Veuillez vérifier votre e-mail et votre mot de passe.',
        statusCode: 401,
      };
    }

    const sessionUser: SessionUser = {
      id: stored.id,
      email: stored.email,
      role: stored.role,
      firstName: stored.firstName,
      lastName: stored.lastName,
      companyName: stored.companyName,
      accountStatus: 'active',
    };

    return { success: true, user: sessionUser };
  }

  // Cas 2 : Compte Client inscrit dans le store
  if (stored) {
    if (stored.accountStatus === 'rejected') {
      return {
        success: false,
        error:
          'La validation de votre mot de passe a été refusée par l’administration. Veuillez soumettre une nouvelle demande de mot de passe.',
        statusCode: 403,
      };
    }

    if (stored.accountStatus === 'pending') {
      return {
        success: false,
        error:
          'Votre mot de passe est en attente de validation par un administrateur Lougara. Vous pourrez vous connecter dès sa validation.',
        statusCode: 403,
      };
    }

    const isValid =
      verifyPassword(rawPassword, stored.passwordHash) ||
      verifyPassword(trimmedPassword, stored.passwordHash);

    if (!isValid) {
      return {
        success: false,
        error: 'Mot de passe incorrect pour ce compte client.',
        statusCode: 401,
      };
    }

    return {
      success: true,
      user: {
        id: stored.id,
        email: stored.email,
        role: stored.role,
        firstName: stored.firstName,
        lastName: stored.lastName,
        companyName: stored.companyName,
        accountStatus: stored.accountStatus,
        mustChangePassword: Boolean(stored.mustChangePassword),
      },
    };
  }

  return {
    success: false,
    error:
      'Aucun compte actif trouvé avec ces identifiants. Si vous êtes un nouveau client, veuillez créer votre mot de passe pour validation.',
    statusCode: 401,
  };
}

/**
 * Persiste le hachage scrypt du mot de passe client dans la table User de Supabase
 * (champ avatarUrl préfixé par "scrypt:") afin que le mot de passe survive aux redémarrages serveur.
 */
export async function persistPasswordHashToDatabase(
  email: string,
  passwordHash: string
): Promise<void> {
  if (process.env.VITEST || process.env.NODE_ENV === 'test') {
    return;
  }
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) return;
  const encodedHash = `scrypt:${passwordHash}`;

  try {
    const { prisma } = await import('@/lib/prisma');
    await prisma.user.updateMany({
      where: { email: { equals: cleanEmail, mode: 'insensitive' } },
      data: {
        avatarUrl: encodedHash,
        mustChangePassword: false,
      },
    });
    return;
  } catch {
    try {
      const { supabaseAdmin } = await import('@/lib/supabase-storage');
      await supabaseAdmin
        .from('User')
        .update({
          avatarUrl: encodedHash,
          mustChangePassword: false,
          updatedAt: new Date().toISOString(),
        })
        .ilike('email', cleanEmail);
    } catch {}
  }
}

/**
 * Permet à un client inscrit (Entrepreneur ou Fournisseur) de créer ou réinitialiser son mot de passe.
 * Génère une demande dans la file de validation des mots de passe de l'espace /admin.
 */
export function submitClientPasswordRequest(params: {
  email: string;
  password: string;
  fullName?: string;
  companyName?: string;
  clientRole?: 'entrepreneur' | 'supplier';
  country?: string;
  requestType?: PasswordRequestType;
  activateImmediately?: boolean;
}): {
  success: boolean;
  request?: PasswordValidationRequest;
  error?: string;
} {
  initDefaultSecurityStore();

  const cleanEmail = (params.email || '').trim().toLowerCase();
  const password = (params.password || '').trim();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Adresse e-mail professionnelle invalide.' };
  }

  if (MODERATOR_EMAILS.includes(cleanEmail)) {
    return {
      success: false,
      error: 'Les comptes administrateurs ne peuvent pas être modifiés via le formulaire client public.',
    };
  }

  if (password.length < 6) {
    return {
      success: false,
      error: 'Par mesure de sécurité, le mot de passe client doit contenir au moins 6 caractères.',
    };
  }

  const pHash = hashPassword(password);
  const existingAccount = accountsStore.get(cleanEmail);
  const userId = existingAccount?.id || `usr-client-${Date.now()}`;
  const fullName =
    (params.fullName || '').trim() ||
    (existingAccount ? `${existingAccount.firstName} ${existingAccount.lastName}`.trim() : 'Client B2B Lougara');
  const nameParts = fullName.split(/\s+/);
  const firstName = nameParts[0] || 'Client';
  const lastName = nameParts.slice(1).join(' ') || 'B2B';
  const companyName = (params.companyName || '').trim() || existingAccount?.companyName || 'Entreprise B2B';
  const clientRole: 'entrepreneur' | 'supplier' =
    params.clientRole ||
    (existingAccount?.role === 'supplier' ? 'supplier' : 'entrepreneur');
  const country = (params.country || '').trim() || existingAccount?.country || 'France';
  const requestType: PasswordRequestType =
    params.requestType || (existingAccount ? 'PASSWORD_RESET' : 'INITIAL_PASSWORD');
  const shouldActivate = Boolean(params.activateImmediately);

  accountsStore.set(cleanEmail, {
    id: userId,
    email: cleanEmail,
    role: clientRole,
    firstName,
    lastName,
    companyName,
    country,
    passwordHash: pHash,
    pendingPasswordHash: shouldActivate ? undefined : pHash,
    accountStatus: shouldActivate ? 'active' : 'pending',
    mustChangePassword: false,
    updatedAt: new Date().toISOString(),
  });

  if (shouldActivate) {
    void persistPasswordHashToDatabase(cleanEmail, pHash);
  }

  // Vérifier s'il existe déjà une demande pour cet email
  const existingReqIndex = passwordRequestsStore.findIndex(
    (r) => r.email === cleanEmail && (r.status === 'PENDING' || shouldActivate)
  );

  const newReq: PasswordValidationRequest = {
    id: existingReqIndex >= 0 ? passwordRequestsStore[existingReqIndex].id : `pwd-req-${Date.now()}`,
    userId,
    email: cleanEmail,
    fullName,
    companyName,
    clientRole,
    country,
    requestType,
    passwordHash: pHash,
    passwordFingerprint: buildFingerprint(pHash),
    passwordStrength: password.length >= 10 ? 'FORT' : 'CONFORME',
    status: shouldActivate ? 'APPROVED' : 'PENDING',
    requestedAt: new Date().toISOString(),
    reviewedAt: shouldActivate ? new Date().toISOString() : undefined,
    reviewedBy: shouldActivate ? 'Création Contact 4/5' : undefined,
  };

  if (existingReqIndex >= 0) {
    passwordRequestsStore[existingReqIndex] = {
      ...passwordRequestsStore[existingReqIndex],
      ...newReq,
    };
  } else {
    passwordRequestsStore.unshift(newReq);
  }

  return {
    success: true,
    request: sanitizePasswordRequest(newReq),
  };
}

function sanitizePasswordRequest(req: PasswordValidationRequest): PasswordValidationRequest {
  return {
    ...req,
    passwordHash: '[PROTECTED]',
  };
}

/**
 * Liste les demandes de validation de mots de passe pour l'espace /admin.
 */
export function listPasswordValidationRequests(statusFilter?: string): {
  requests: PasswordValidationRequest[];
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
} {
  initDefaultSecurityStore();

  const all = passwordRequestsStore.map(sanitizePasswordRequest);
  const pending = all.filter((r) => r.status === 'PENDING').length;
  const approved = all.filter((r) => r.status === 'APPROVED').length;
  const rejected = all.filter((r) => r.status === 'REJECTED').length;

  const filtered =
    statusFilter && statusFilter !== 'ALL'
      ? all.filter((r) => r.status === statusFilter)
      : all;

  return {
    requests: filtered,
    stats: {
      total: all.length,
      pending,
      approved,
      rejected,
    },
  };
}

/**
 * Action d'un moderator ou super_admin : Valider (APPROVE) ou Refuser (REJECT) un mot de passe client.
 */
export function reviewPasswordValidationRequest(params: {
  requestId: string;
  action: 'APPROVE' | 'REJECT';
  reviewerEmail: string;
  rejectionReason?: string;
}): {
  success: boolean;
  request?: PasswordValidationRequest;
  error?: string;
} {
  initDefaultSecurityStore();

  const reviewer = (params.reviewerEmail || '').trim().toLowerCase();
  if (!MODERATOR_EMAILS.includes(reviewer)) {
    return {
      success: false,
      error: 'Accès refusé. Rôle moderator ou super_admin requis.',
    };
  }

  const reqItem = passwordRequestsStore.find((r) => r.id === params.requestId);
  if (!reqItem) {
    return {
      success: false,
      error: 'Demande de validation de mot de passe introuvable.',
    };
  }

  const account = accountsStore.get(reqItem.email);

  if (params.action === 'APPROVE') {
    reqItem.status = 'APPROVED';
    reqItem.reviewedAt = new Date().toISOString();
    reqItem.reviewedBy = reviewer;
    reqItem.rejectionReason = undefined;

    if (account) {
      if (account.pendingPasswordHash) {
        account.passwordHash = account.pendingPasswordHash;
        account.pendingPasswordHash = undefined;
      }
      account.accountStatus = 'active';
      account.mustChangePassword = false;
      account.updatedAt = new Date().toISOString();
      void persistPasswordHashToDatabase(account.email, account.passwordHash);
    }
  } else if (params.action === 'REJECT') {
    const reason = (params.rejectionReason || '').trim() || 'Mot de passe ou compte non conforme aux règles de sécurité.';
    reqItem.status = 'REJECTED';
    reqItem.reviewedAt = new Date().toISOString();
    reqItem.reviewedBy = reviewer;
    reqItem.rejectionReason = reason;

    if (account) {
      account.accountStatus = 'rejected';
      account.updatedAt = new Date().toISOString();
    }
  } else {
    return {
      success: false,
      error: 'Action invalide (APPROVE ou REJECT attendu).',
    };
  }

  return {
    success: true,
    request: sanitizePasswordRequest(reqItem),
  };
}

/**
 * Création d'un jeton de session signé HMAC-SHA256.
 */
export function createSessionToken(user: SessionUser): string {
  const payload = {
    id: user.id,
    email: user.email.toLowerCase(),
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    companyName: user.companyName,
    accountStatus: user.accountStatus,
    mustChangePassword: Boolean(user.mustChangePassword),
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 jours
  };
  const payloadBase64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadBase64)
    .digest('base64url');
  return `${payloadBase64}.${signature}`;
}

/**
 * Vérifie et décode un jeton de session signé HMAC-SHA256.
 */
export function verifySessionToken(token?: string | null): SessionUser | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadBase64, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  try {
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'));
    if (!decoded || !decoded.email || !decoded.role) return null;
    if (decoded.exp && Date.now() > decoded.exp) return null;

    // Garantir la cohérence stricte des rôles admin
    const cleanEmail = decoded.email.trim().toLowerCase();
    let role: AppUserRole = decoded.role;
    if (cleanEmail === SUPER_ADMIN_EMAIL) {
      role = 'super_admin';
    } else if (cleanEmail === MODERATOR_EMAIL) {
      role = 'moderator';
    } else if (role === 'super_admin' || role === 'moderator') {
      // Un email non-admin ne peut jamais usurper un rôle admin
      return null;
    }

    return {
      id: decoded.id,
      email: cleanEmail,
      role,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      companyName: decoded.companyName,
      accountStatus: decoded.accountStatus || 'active',
      mustChangePassword: Boolean(decoded.mustChangePassword),
    };
  } catch {
    return null;
  }
}

/**
 * Extrait le cookie `lougara_session` depuis un objet Request standard.
 */
export function getSessionFromRequest(req: Request): SessionUser | null {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));
    if (match) {
      const token = decodeURIComponent(match.substring(SESSION_COOKIE_NAME.length + 1));
      const verified = verifySessionToken(token);
      if (verified) return verified;
    }
  } catch {}
  return null;
}

/**
 * Vérifie si l'utilisateur de la requête possède le rôle `moderator` ou `super_admin`.
 */
export function isRequestAdminAuthorized(
  req: Request,
  fallbackEmail?: string | null,
  requireSuperAdmin = false
): { authorized: boolean; email: string | null; role: AppUserRole | null } {
  const session = getSessionFromRequest(req);
  if (session) {
    if (requireSuperAdmin) {
      const ok = session.role === 'super_admin' && session.email === SUPER_ADMIN_EMAIL;
      return { authorized: ok, email: session.email, role: session.role };
    }
    const ok =
      (session.role === 'moderator' || session.role === 'super_admin') &&
      MODERATOR_EMAILS.includes(session.email);
    return { authorized: ok, email: session.email, role: session.role };
  }

  // Fallback pour les appels internes explicites fournissant l'email
  const candidate = (fallbackEmail || req.headers.get('x-user-email') || '').trim().toLowerCase();
  if (!candidate) {
    return { authorized: false, email: null, role: null };
  }

  if (requireSuperAdmin) {
    const ok = candidate === SUPER_ADMIN_EMAIL;
    return { authorized: ok, email: ok ? candidate : null, role: ok ? 'super_admin' : null };
  }

  const ok = MODERATOR_EMAILS.includes(candidate);
  const role: AppUserRole | null =
    candidate === SUPER_ADMIN_EMAIL
      ? 'super_admin'
      : candidate === MODERATOR_EMAIL
        ? 'moderator'
        : null;
  return { authorized: ok, email: ok ? candidate : null, role };
}

/**
 * Changement de mot de passe (première connexion ou mise à jour volontaire).
 * Désactive définitivement le mot de passe temporaire fourni.
 */
export function changeAccountPassword(params: {
  email: string;
  currentPassword?: string;
  newPassword: string;
}): {
  success: boolean;
  user?: SessionUser;
  error?: string;
} {
  initDefaultSecurityStore();
  const cleanEmail = (params.email || '').trim().toLowerCase();
  let account = accountsStore.get(cleanEmail);
  if (!account) {
    const altEmail = cleanEmail.endsWith('.fr') ? cleanEmail.slice(0, -3) : `${cleanEmail}.fr`;
    account = accountsStore.get(altEmail);
  }

  if (!account) {
    return { success: false, error: 'Compte client introuvable.' };
  }

  if (params.currentPassword) {
    const isValid =
      verifyPassword(params.currentPassword, account.passwordHash) ||
      verifyPassword(params.currentPassword.trim(), account.passwordHash);
    if (!isValid) {
      return { success: false, error: 'Le mot de passe actuel ou fourni est incorrect.' };
    }
  }

  const newPass = (params.newPassword || '').trim();
  if (newPass.length < 8) {
    return { success: false, error: 'Le nouveau mot de passe doit comporter au moins 8 caractères.' };
  }

  // Désactiver l'ancien mot de passe fourni et valider le nouveau
  const newHash = hashPassword(newPass);
  account.passwordHash = newHash;
  account.pendingPasswordHash = undefined;
  account.mustChangePassword = false;
  account.updatedAt = new Date().toISOString();
  void persistPasswordHashToDatabase(account.email, newHash);

  const updatedUser: SessionUser = {
    id: account.id,
    email: account.email,
    role: account.role,
    firstName: account.firstName,
    lastName: account.lastName,
    companyName: account.companyName,
    accountStatus: account.accountStatus,
    mustChangePassword: false,
  };

  return { success: true, user: updatedUser };
}
