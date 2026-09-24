import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pjrqfdidqpnsquuhcolh.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

export const BUCKET_NAME = 'kyb-documents';

/**
 * Upload un document d'immatriculation (KBIS, CNI, NINEA) sur Supabase Storage.
 * Crée le bucket s'il n'existe pas encore.
 */
export async function uploadKybDocumentToSupabase(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ success: boolean; url: string; path: string }> {
  try {
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `uploads/${Date.now()}_${cleanFileName}`;

    // 1. Tenter l'upload du fichier dans le bucket Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBuffer, {
        contentType: mimeType || 'application/pdf',
        upsert: true,
      });

    if (error) {
      // Si le bucket n'existe pas encore sur Supabase, le créer automatiquement
      if (error.message.includes('not found') || error.message.includes('Bucket')) {
        await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
          public: true,
        });

        // Re-tenter l'upload
        const retry = await supabaseAdmin.storage
          .from(BUCKET_NAME)
          .upload(storagePath, fileBuffer, {
            contentType: mimeType || 'application/pdf',
            upsert: true,
          });

        if (retry.error) {
          console.warn('Erreur retry upload Supabase Storage :', retry.error);
          return {
            success: false,
            url: `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${storagePath}`,
            path: storagePath,
          };
        }
      } else {
        console.warn('Erreur Supabase Storage upload :', error.message);
      }
    }

    // 2. Obtenir l'URL publique Supabase Storage
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    const finalUrl = publicUrlData?.publicUrl || `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${storagePath}`;

    return {
      success: true,
      url: finalUrl,
      path: storagePath,
    };
  } catch (err: any) {
    console.error('Exception upload Supabase Storage :', err);
    const fallbackPath = `uploads/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    return {
      success: false,
      url: `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${fallbackPath}`,
      path: fallbackPath,
    };
  }
}

/**
 * Formate et retourne l'URL publique Supabase Storage absolue pour tout document.
 * Évite les erreurs 404 lors du clic sur les liens.
 */
export function getKybDocumentUrl(filePath?: string, fileName?: string, docStatus: string = 'PENDING'): string {
  const defaultName = fileName || 'document.pdf';

  if (!filePath || filePath === 'document.pdf') {
    return `/api/documents/preview?name=${encodeURIComponent(defaultName)}&status=${docStatus}`;
  }

  // Si c'est déjà une URL Supabase ou HTTP absolue
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }

  // Si le chemin fait référence à un objet dans Supabase Storage
  if (filePath.startsWith('uploads/') || filePath.startsWith('kbis/')) {
    return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${filePath}`;
  }

  // Fallback sécurisé vers l'API de prévisualisation Supabase/Local
  return `/api/documents/preview?file=${encodeURIComponent(filePath)}&name=${encodeURIComponent(defaultName)}&status=${docStatus}`;
}
