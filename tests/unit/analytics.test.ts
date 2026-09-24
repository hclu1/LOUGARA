import { describe, it, expect, beforeEach } from 'vitest';
import {
  recordVisit,
  getVisitStats,
  resetVisitStats,
} from '../../src/features/analytics/service';

describe('Module Analytics - Comptage de Visites (Entrepreneurs, Fournisseurs, Curieux)', () => {
  beforeEach(async () => {
    // Réinitialiser avec des compteurs de test contrôlés
    await resetVisitStats({
      ENTREPRENEUR: 10,
      FOURNISSEUR: 5,
      CURIEUX: 15,
    });
  });

  it('doit calculer les totaux et pourcentages corrects pour chaque segment de visiteurs', async () => {
    const stats = await getVisitStats();

    expect(stats.total).toBe(30);
    expect(stats.entrepreneurs.count).toBe(10);
    expect(stats.entrepreneurs.percentage).toBe(33); // 10 / 30 = 33.3% -> 33%
    expect(stats.fournisseurs.count).toBe(5);
    expect(stats.fournisseurs.percentage).toBe(17); // 5 / 30 = 16.7% -> 17%
    expect(stats.curieux.count).toBe(15);
    expect(stats.curieux.percentage).toBe(50); // 15 / 30 = 50%
    expect(stats.qualificationRate).toBe(50); // (10 + 5) / 30 = 50%
  });

  it('doit enregistrer une visite entrepreneur et incrémenter le compteur dédié', async () => {
    const event = await recordVisit('ENTREPRENEUR', '/entrepreneurs', {
      referrer: 'https://google.com',
    });

    expect(event).toBeDefined();
    expect(event.type).toBe('ENTREPRENEUR');
    expect(event.page).toBe('/entrepreneurs');
    expect(event.referrer).toBe('https://google.com');

    const stats = await getVisitStats();
    expect(stats.entrepreneurs.count).toBe(11);
    expect(stats.total).toBe(31);
    expect(stats.recentVisits[0].id).toBe(event.id);
  });

  it('doit enregistrer une visite fournisseur et refléter l\'événement en direct', async () => {
    const event = await recordVisit('FOURNISSEUR', '/devenir-fournisseur');

    expect(event.type).toBe('FOURNISSEUR');
    const stats = await getVisitStats();
    expect(stats.fournisseurs.count).toBe(6);
    expect(stats.recentVisits[0].page).toBe('/devenir-fournisseur');
  });

  it('doit enregistrer une visite curieux (visiteur non qualifié / vitrine)', async () => {
    const event = await recordVisit('CURIEUX', '/catalogue');

    expect(event.type).toBe('CURIEUX');
    const stats = await getVisitStats();
    expect(stats.curieux.count).toBe(16);
    expect(stats.curieux.percentage).toBeGreaterThan(0);
  });
});
