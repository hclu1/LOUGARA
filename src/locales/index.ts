import { fr } from './fr';
import { en } from './en';

export type Locale = 'fr' | 'en';

export const translations = {
  fr,
  en,
} as const;

export type TranslationSchema = typeof fr;

export * from './currencies';
