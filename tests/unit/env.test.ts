import { describe, it, expect } from 'vitest';
import { validateEnv } from '../../src/env';

describe('Validation des variables d\'environnement', () => {
  it('doit échouer si DATABASE_URL est manquante', () => {
    expect(() => validateEnv({})).toThrow(/DATABASE_URL/);
  });

  it('doit valider les variables obligatoires', () => {
    const valid = validateEnv({
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/lougara',
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
    });
    expect(valid.DATABASE_URL).toBe('postgresql://user:pass@localhost:5432/lougara');
    expect(valid.NEXT_PUBLIC_SUPABASE_URL).toBe('https://test.supabase.co');
  });
});
