import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pjrqfdidqpnsquuhcolh.supabase.co';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_qPUajzTYLcG2wYmZ3Gi9bA_51u38ptY';

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
 * Évite les erreurs 404 lors du clic sur les liens et garantit l'accès aux prévisualisations et téléchargements.
 */
export function getKybDocumentUrl(filePath?: string, fileName?: string, docStatus: string = 'PENDING'): string {
  const defaultName = fileName || 'document.pdf';

  // Si c'est déjà une URL relative pointant vers /api/documents/preview, la renvoyer directement
  if (filePath && filePath.startsWith('/api/documents/preview')) {
    return filePath;
  }

  // Si c'est une URL absolue externe (http:// ou https://)
  if (filePath && (filePath.startsWith('http://') || filePath.startsWith('https://'))) {
    return filePath;
  }

  // Toujours passer par l'endpoint /api/documents/preview qui assure la résilience
  // (vérification Supabase Storage avec clé de service, disque local, et spécimens originaux)
  const cleanPath = filePath && filePath !== 'document.pdf' ? filePath.replace(/^\/+/, '') : '';
  const params = new URLSearchParams();
  if (cleanPath) params.set('file', cleanPath);
  if (defaultName) params.set('name', defaultName);
  if (docStatus) params.set('status', docStatus);

  return `/api/documents/preview?${params.toString()}`;
}

export const CATALOG_BUCKET_NAME = 'catalog-images';

/** Prefixe d'URL publique autorise pour les images produits (anti-injection d'URL externes). */
export function getCatalogImagePublicPrefix(): string {
  return `${supabaseUrl}/storage/v1/object/public/${CATALOG_BUCKET_NAME}/`;
}

/**
 * Televerse une image produit sur Supabase Storage (bucket public `catalog-images`).
 * L'URL n'est exposee au public qu'apres moderation Lougara du produit.
 * Retourne success=false (sans URL) si l'upload echoue : jamais d'URL fictive.
 */
export async function uploadCatalogImageToSupabase(
  fileBuffer: Buffer,
  extension: string,
  mimeType: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const storagePath = `products/${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${extension}`;
    let { error } = await supabaseAdmin.storage
      .from(CATALOG_BUCKET_NAME)
      .upload(storagePath, fileBuffer, { contentType: mimeType, upsert: false });

    if (error && (error.message.includes('not found') || error.message.includes('Bucket'))) {
      await supabaseAdmin.storage.createBucket(CATALOG_BUCKET_NAME, { public: true });
      ({ error } = await supabaseAdmin.storage
        .from(CATALOG_BUCKET_NAME)
        .upload(storagePath, fileBuffer, { contentType: mimeType, upsert: false }));
    }

    if (error) {
      console.warn('Erreur upload image catalogue :', error.message);
      return { success: false, error: error.message };
    }

    const { data } = supabaseAdmin.storage.from(CATALOG_BUCKET_NAME).getPublicUrl(storagePath);
    return { success: true, url: data.publicUrl };
  } catch (err: any) {
    console.error('Exception upload image catalogue :', err);
    return { success: false, error: err?.message || 'Erreur inconnue' };
  }
}
