import { NextRequest, NextResponse } from 'next/server';
import { recordVisit, getVisitStats } from '@/features/analytics/service';
import { VisitorType } from '@/features/analytics/types';

export async function GET() {
  try {
    const stats = await getVisitStats();
    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Erreur lors du calcul des statistiques' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const type: VisitorType = body.type;

    if (!type || !['ENTREPRENEUR', 'FOURNISSEUR', 'CURIEUX'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Type de visiteur non valide (attendu: ENTREPRENEUR, FOURNISSEUR ou CURIEUX)' },
        { status: 400 }
      );
    }

    const page = body.page || '/';
    const referrer = body.referrer || req.headers.get('referer') || 'Direct';
    const userAgent = req.headers.get('user-agent') || undefined;

    const event = await recordVisit(type, page, { referrer, userAgent });

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (err: any) {
    console.error('Erreur API Analytics Visit :', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erreur lors de l\'enregistrement de la visite' },
      { status: 500 }
    );
  }
}
