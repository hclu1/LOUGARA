import { z } from 'zod';

export const PASSWORD_MIN = 8;
// bcrypt / scrypt limite de sécurité
export const PASSWORD_MAX = 72;
const SYMBOL = /[!@#$%^&*()_+\-=\[\]{};'\\:"|<>?,./`~]/;

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN, `Au moins ${PASSWORD_MIN} caractères`)
  .refine((v) => new TextEncoder().encode(v).length <= PASSWORD_MAX, 'Mot de passe trop long')
  .refine((v) => /[a-z]/.test(v), 'Au moins une minuscule')
  .refine((v) => /[A-Z]/.test(v), 'Au moins une majuscule')
  .refine((v) => /[0-9]/.test(v), 'Au moins un chiffre')
  .refine((v) => SYMBOL.test(v), 'Au moins un symbole (!@#$%…)');

export const signUpSchema = z
  .object({
    email: z.string().trim().toLowerCase().email('Email invalide'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

export const newPasswordSchema = z
  .object({ password: passwordSchema, confirmPassword: z.string() })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

/** Liste des règles, pour afficher une checklist en direct dans le formulaire */
export const passwordRules = [
  { label: `${PASSWORD_MIN} caractères minimum`, test: (v: string) => v.length >= PASSWORD_MIN },
  { label: 'Une minuscule', test: (v: string) => /[a-z]/.test(v) },
  { label: 'Une majuscule', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Un chiffre', test: (v: string) => /[0-9]/.test(v) },
  { label: 'Un symbole (!@#$…)', test: (v: string) => SYMBOL.test(v) },
];
