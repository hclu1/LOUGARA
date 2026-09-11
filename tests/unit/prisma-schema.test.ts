import { describe, it, expect } from 'vitest';
import { prisma } from '../../src/lib/prisma';

describe('Connexion et typage Prisma', () => {
  it('doit instancier le client Prisma avec les modèles définis', () => {
    expect(prisma.user).toBeDefined();
    expect(prisma.companyProfile).toBeDefined();
    expect(prisma.product).toBeDefined();
    expect(prisma.conversation).toBeDefined();
    expect(prisma.verificationDocument).toBeDefined();
    expect(prisma.message).toBeDefined();
  });
});
