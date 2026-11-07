import { NextRequest, NextResponse } from 'next/server';
import { uploadKybDocumentToSupabase } from '@/lib/supabase-storage';

export const dynamic = 'force-dynamic';

const MAX_SIZE = 8 * 1024 * 1024; // 8 Mo

/** Detecte le vrai type du fichier via ses octets magiques (le type MIME client n'est pas fiable). */
function detectDocType(buf: Buffer): { ext: string; mime: string } | null {
  if (buf.length < 12) return null;
  if (buf.subarray(0, 4).toString('ascii') === '%PDF') return { ext: 'pdf', mime: 'application/pdf' };
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { ext: 'jpg', mime: 'image/jpeg' };
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { ext: 'png', mime: 'image/png' };
  }
  if (buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') {
    return { ext: 'webp', mime: 'image/webp' };
  }
  return null;
}

/** Televersement d'une piece KYB (Kbis, identite du dirigeant) pour examen par Lougara. */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'Aucun fichier fourni.' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: 'Fichier trop lourd (8 Mo maximum).' }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const type = detectDocType(buffer);
    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Format non supporté (PDF, JPG, PNG ou WEBP uniquement).' },
        { status: 415 }
      );
    }

    const baseName = (file.name || 'piece').replace(/\.[^.]+$/, '');
    const result = await uploadKybDocumentToSupabase(buffer, `${baseName}.${type.ext}`, type.mime);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Le téléversement de la pièce a échoué. Réessayez.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, path: result.path, fileName: file.name });
  } catch (error) {
    console.error('Erreur API /api/suppliers/kyb-documents :', error);
    return NextResponse.json({ success: false, error: 'Erreur lors du téléversement.' }, { status: 500 });
  }
}
