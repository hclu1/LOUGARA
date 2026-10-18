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
}

export type PasswordRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type PasswordRequestType = 'INITIAL_PASSWORD' | 'PASSWORD_RESET' | 'CLIENT_REGISTRATION';

export interface PasswordValidationRequest {
  id: string;
  userId: string;
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

  // 3. Comptes clients inscrits sur l'application (avec demandes de validation de mot de passe)
  const initialClients: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    companyName: string;
    country: string;
    role: 'entrepreneur' | 'supplier';
    initialPass: string;
    reqStatus: PasswordRequestStatus;
    reqType: PasswordRequestType;
    requestedAt: string;
    reviewedBy?: string;
    reviewedAt?: string;
  }> = [
    {
      id: 'usr-client-1',
      email: 'contact@africabio.sn',
      firstName: 'Amadou',
      lastName: 'Diallo',
      companyName: 'Africa Bio Extracts SARL',
      country: 'Sénégal',
      role: 'supplier',
      initialPass: 'AfricaBio2026!',
      reqStatus: 'PENDING',
      reqType: 'CLIENT_REGISTRATION',
      requestedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
      id: 'usr-client-2',
      email: 'elodie@botanica-paris.fr',
      firstName: 'Élodie',
      lastName: 'Laurent',
      companyName: 'Boutique Botanica Paris',
      country: 'France',
      role: 'entrepreneur',
      initialPass: 'BotanicaParis2026!',
      reqStatus: 'PENDING',
      reqType: 'INITIAL_PASSWORD',
      requestedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
      id: 'usr-client-3',
      email: 'direction@ivoiretextile.ci',
      firstName: 'Kouassi',
      lastName: 'Koffi',
      companyName: 'Ivoire Textiles & Confection',
      country: "Côte d'Ivoire",
      role: 'supplier',
      initialPass: 'IvoireTex2026!',
      reqStatus: 'PENDING',
      reqType: 'PASSWORD_RESET',
      requestedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    },
    {
      id: 'usr-client-4',
      email: 'contact@sahel-agro.com',
      firstName: 'Oumar',
      lastName: 'Coulibaly',
      companyName: 'Sahel Agro-Industrie SA',
      country: 'Mali',
      role: 'supplier',
      initialPass: 'SahelAgro2026!',
      reqStatus: 'APPROVED',
      reqType: 'CLIENT_REGISTRATION',
      requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      reviewedBy: SUPER_ADMIN_EMAIL,
      reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    },
  ];

  for (const c of initialClients) {
    const pHash = hashPassword(c.initialPass, `salt_${c.id}`);
    accountsStore.set(c.email.toLowerCase(), {
      id: c.id,
      email: c.email.toLowerCase(),
      role: c.role,
      firstName: c.firstName,
      lastName: c.lastName,
      companyName: c.companyName,
      country: c.country,
      passwordHash: pHash,
      pendingPasswordHash: c.reqStatus === 'PENDING' ? pHash : undefined,
      accountStatus: c.reqStatus === 'APPROVED' ? 'active' : 'pending',
      updatedAt: c.requestedAt,
    });

    passwordRequestsStore.push({
      id: `pwd-req-${c.id}`,
      userId: c.id,
      email: c.email.toLowerCase(),
      fullName: `${c.firstName} ${c.lastName}`.trim(),
      companyName: c.companyName,
      clientRole: c.role,
      country: c.country,
      requestType: c.reqType,
      passwordHash: pHash,
      passwordFingerprint: buildFingerprint(pHash),
      passwordStrength: c.initialPass.length >= 10 ? 'FORT' : 'CONFORME',
      status: c.reqStatus,
      requestedAt: c.requestedAt,
      reviewedBy: c.reviewedBy,
      reviewedAt: c.reviewedAt,
    });
  }
}

initDefaultSecurityStore();

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

  const cleanEmail = (params.email || '').trim().toLowerCase();
  const rawPassword = params.password ?? '';
  const trimmedPassword = rawPassword.trim();

  if (!cleanEmail) {
    return {
      success: false,
      error: 'Veuillez saisir une adresse e-mail valide.',
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

  const stored = accountsStore.get(cleanEmail);

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

  accountsStore.set(cleanEmail, {
    id: userId,
    email: cleanEmail,
    role: clientRole,
    firstName,
    lastName,
    companyName,
    country,
    passwordHash: pHash,
    pendingPasswordHash: pHash,
    accountStatus: 'pending',
    updatedAt: new Date().toISOString(),
  });

  // Vérifier s'il existe déjà une demande en attente pour cet email
  const existingReqIndex = passwordRequestsStore.findIndex(
    (r) => r.email === cleanEmail && r.status === 'PENDING'
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
    status: 'PENDING',
    requestedAt: new Date().toISOString(),
  };

  if (existingReqIndex >= 0) {
    passwordRequestsStore[existingReqIndex] = newReq;
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
      account.updatedAt = new Date().toISOString();
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
