import { AuthError, isAuthWeakPasswordError } from '@supabase/supabase-js';

export function passwordErrorMessage(error: AuthError): string {
  if (isAuthWeakPasswordError(error)) {
    if (error.reasons.includes('pwned')) {
      return 'Ce mot de passe apparaît dans des fuites de données connues. Choisissez-en un autre.';
    }
    return 'Mot de passe trop faible.';
  }
  switch (error.code) {
    case 'same_password':
      return 'Le nouveau mot de passe doit être différent de l’ancien.';
    case 'reauthentication_needed':
      return 'Pour des raisons de sécurité, confirmez votre identité avec le code reçu par email.';
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return 'Trop de tentatives. Réessayez dans quelques minutes.';
    default:
      return 'Une erreur est survenue. Réessayez.';
  }
}
