import { NextRequest, NextResponse } from 'next/server';
import { uploadCatalogImageToSupabase } from '@/lib/supabase-storage';

export const dynamic = 'force-dynamic';

const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo

/** Detecte le vrai type d'image via les octets magiques (le type MIME client n'est pas fiable). */
function detectImageType(buf: Buffer): { ext: string; mime: string } | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { ext: 'jpg', mime: 'image/jpeg' };
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { ext: 'png', mime: 'image/png' };
  }
  if (buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') {
    return { ext: 'webp', mime: 'image/webp' };
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'Aucune image fournie.' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: 'Image trop lourde (5 Mo maximum).' }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const type = detectImageType(buffer);
    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Format non supporté (JPG, PNG ou WEBP uniquement).' },
        { status: 415 }
      );
    }

    const result = await uploadCatalogImageToSupabase(buffer, type.ext, type.mime);
    if (!result.success || !result.url) {
      return NextResponse.json(
        { success: false, error: "Le téléversement de l'image a échoué. Réessayez." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, url: result.url });
  } catch (error: any) {
    console.error('Erreur API /api/suppliers/product-images :', error);
    return NextResponse.json({ success: false, error: "Erreur lors du téléversement." }, { status: 500 });
  }
}
