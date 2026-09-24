import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export function validateEnv(rawEnv: Record<string, string | undefined>) {
  return envSchema.parse(rawEnv);
}

// Ne valide le runtime process.env que si ce n'est pas un environnement de test isolé
export const env =
  process.env.NODE_ENV === 'test' && !process.env.DATABASE_URL
    ? ({} as z.infer<typeof envSchema>)
    : validateEnv(process.env);
