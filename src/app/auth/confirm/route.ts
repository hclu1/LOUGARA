import { type EmailOtpType } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-storage';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const nextParam = searchParams.get('next') ?? '/connexion';
  // Empêche les redirections ouvertes : chemin relatif uniquement
  const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/connexion';

  if (token_hash && type) {
    const { error } = await supabaseAdmin.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/connexion?error=invalid_token`);
}
