import { VisitorType, VisitEvent, VisitStats } from './types';

// Historique de démarrage représentatif pour la console d'administration
const initialVisits: VisitEvent[] = [];

// Compteurs de base réels de la plateforme
let baselineCounts = {
  ENTREPRENEUR: 0,
  FOURNISSEUR: 0,
  CURIEUX: 0,
};

let liveVisits: VisitEvent[] = [];

/**
 * Enregistre une visite qualifiée sur la plateforme
 */
export async function recordVisit(
  type: VisitorType,
  page: string = '/',
  metadata?: { referrer?: string; userAgent?: string; ipHash?: string }
): Promise<VisitEvent> {
  const event: VisitEvent = {
    id: `vis-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type,
    page,
    timestamp: new Date().toISOString(),
    referrer: metadata?.referrer || 'Direct',
    userAgent: metadata?.userAgent,
    ipHash: metadata?.ipHash,
  };

  // Incrémenter le compteur de la catégorie
  if (baselineCounts[type] !== undefined) {
    baselineCounts[type] += 1;
  }

  // Conserver dans l'historique des dernières visites (max 100)
  liveVisits.unshift(event);
  if (liveVisits.length > 100) {
    liveVisits = liveVisits.slice(0, 100);
  }

  return event;
}

/**
 * Calcule et retourne les statistiques complètes d'audience
 */
export async function getVisitStats(): Promise<VisitStats> {
  const total =
    baselineCounts.ENTREPRENEUR +
    baselineCounts.FOURNISSEUR +
    baselineCounts.CURIEUX;

  const calculateBreakdown = (count: number) => ({
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
  });

  const qualifiedTotal = baselineCounts.ENTREPRENEUR + baselineCounts.FOURNISSEUR;
  const qualificationRate =
    total > 0 ? Math.round((qualifiedTotal / total) * 100) : 0;

  // Calcul des visites du jour (dernières 24 heures)
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recentDayCount = liveVisits.filter(
    (v) => new Date(v.timestamp).getTime() >= oneDayAgo
  ).length;

  return {
    total,
    entrepreneurs: calculateBreakdown(baselineCounts.ENTREPRENEUR),
    fournisseurs: calculateBreakdown(baselineCounts.FOURNISSEUR),
    curieux: calculateBreakdown(baselineCounts.CURIEUX),
    qualificationRate,
    todayTotal: recentDayCount,
    recentVisits: liveVisits.slice(0, 15),
  };
}

/**
 * Réinitialise les compteurs (pour maintenance ou tests automatisés)
 */
export async function resetVisitStats(customBaseline?: {
  ENTREPRENEUR?: number;
  FOURNISSEUR?: number;
  CURIEUX?: number;
}) {
  baselineCounts = {
    ENTREPRENEUR: customBaseline?.ENTREPRENEUR ?? 0,
    FOURNISSEUR: customBaseline?.FOURNISSEUR ?? 0,
    CURIEUX: customBaseline?.CURIEUX ?? 0,
  };
  liveVisits = [];
}
