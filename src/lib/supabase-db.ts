import { supabaseAdmin } from '@/lib/supabase-storage';

/**
 * Récupère les entreprises (CompanyProfile) avec leurs documents, produits et utilisateur
 * directement via l'API HTTPS REST de Supabase (PostgREST), insensible aux limites de pool TCP PostgreSQL.
 */
export async function fetchCompaniesViaSupabaseRest(options?: {
  status?: string | null;
  isPublished?: boolean;
}) {
  let query = supabaseAdmin
    .from('CompanyProfile')
    .select(
      '*, documents:VerificationDocument(*), products:Product(*), user:User(id, email, firstName, lastName, createdAt)'
    )
    .order('createdAt', { ascending: false });

  if (options?.status && options.status !== 'ALL') {
    query = query.eq('verificationStatus', options.status);
  }
  if (typeof options?.isPublished === 'boolean') {
    query = query.eq('isPublished', options.isPublished);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return (data || []).map((comp: any) => ({
    ...comp,
    documents: Array.isArray(comp.documents)
      ? [...comp.documents].sort(
          (a, b) => new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime()
        )
      : [],
    products: Array.isArray(comp.products)
      ? [...comp.products].sort(
          (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
        )
      : [],
  }));
}

/**
 * Récupère les utilisateurs et les entreprises de Supabase via REST pour la synchronisation Auth/Admin.
 */
export async function fetchUsersAndCompaniesViaSupabaseRest() {
  const [usersRes, companiesRes] = await Promise.all([
    supabaseAdmin.from('User').select('*').order('createdAt', { ascending: false }),
    supabaseAdmin
      .from('CompanyProfile')
      .select('*, products:Product(*), documents:VerificationDocument(*)')
      .order('createdAt', { ascending: false }),
  ]);

  const users = usersRes.data || [];
  const companies = companiesRes.data || [];

  const companyByUserId = new Map<string, any>();
  for (const comp of companies) {
    if (comp.userId) {
      companyByUserId.set(comp.userId, {
        ...comp,
        products: Array.isArray(comp.products)
          ? [...comp.products].sort(
              (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
            )
          : [],
      });
    }
  }

  const enrichedUsers = users.map((u: any) => ({
    ...u,
    createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
    updatedAt: u.updatedAt ? new Date(u.updatedAt) : new Date(),
    company: companyByUserId.get(u.id) || null,
  }));

  return { users: enrichedUsers, companies };
}

/**
 * Récupère les produits publiés et validés pour le catalogue public via Supabase REST.
 */
export async function fetchPublishedProductsViaSupabaseRest() {
  const { data, error } = await supabaseAdmin
    .from('Product')
    .select('*, company:CompanyProfile(*)')
    .eq('isPublished', true)
    .eq('moderationStatus', 'APPROVED')
    .order('createdAt', { ascending: false })
    .limit(60);

  if (error) {
    throw error;
  }

  return (data || []).filter(
    (p: any) => p.company && p.company.isPublished === true && p.company.verificationStatus === 'VERIFIED'
  );
}

/**
 * Récupère tous les produits avec leur société pour l'interface d'administration via Supabase REST.
 */
export async function fetchAllAdminProductsViaSupabaseRest() {
  const { data, error } = await supabaseAdmin
    .from('Product')
    .select(
      '*, company:CompanyProfile(id, companyName, country, sector, verificationStatus, isPublished, website)'
    )
    .order('createdAt', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}
