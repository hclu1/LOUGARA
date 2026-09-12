export type VisitorType = 'ENTREPRENEUR' | 'FOURNISSEUR' | 'CURIEUX';

export interface VisitEvent {
  id: string;
  type: VisitorType;
  page: string;
  timestamp: string;
  ipHash?: string;
  userAgent?: string;
  referrer?: string;
}

export interface VisitorBreakdown {
  count: number;
  percentage: number;
}

export interface VisitStats {
  total: number;
  entrepreneurs: VisitorBreakdown;
  fournisseurs: VisitorBreakdown;
  curieux: VisitorBreakdown;
  qualificationRate: number; // Ratio (Entrepreneurs + Fournisseurs) / Total en %
  todayTotal: number;
  recentVisits: VisitEvent[];
}
